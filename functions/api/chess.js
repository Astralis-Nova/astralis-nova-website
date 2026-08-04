const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
};
const MAX_STATE_BYTES = 220_000;
const MODES = new Set(['standard', 'trideck']);
const AI_NAME = 'Nova AI';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...JSON_HEADERS, Allow: 'GET, POST, OPTIONS' },
    });
  }

  const url = new URL(request.url);
  const action = String(url.searchParams.get('action') || 'health').toLowerCase();

  try {
    if (!env.CHESS_DB) throw httpError(503, 'Chess D1 is not connected. Bind the astralis-nova-chess database to this Pages project as CHESS_DB, then redeploy.');
    if (action === 'health') return await health(env.CHESS_DB);
    if (action === 'create' && request.method === 'POST') return await createGame(request, env.CHESS_DB);
    if (action === 'join' && request.method === 'POST') return await joinGame(request, env.CHESS_DB);
    if (action === 'get' && request.method === 'GET') return await getGame(url, env.CHESS_DB);
    if (action === 'move' && request.method === 'POST') return await makeMove(request, env.CHESS_DB);
    if (action === 'resign' && request.method === 'POST') return await resignGame(request, env.CHESS_DB);
    throw httpError(404, 'Unknown chess portal command.');
  } catch (error) {
    console.error('Chess API error', error);
    return json({ error: error?.publicMessage || 'The mission archive encountered an unexpected error.' }, error?.status || 500);
  }
}

async function health(db) {
  try {
    await db.prepare('SELECT 1 AS ok').first();
    const table = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='chess_games'").first();
    if (!table) throw httpError(503, 'D1 is connected, but the chess schema has not been installed yet.');
    return json({ ok: true, service: 'astralis-nova-chess', storage: 'D1' });
  } catch (error) {
    if (error?.status) throw error;
    throw httpError(503, 'D1 could not be reached. Check the DB binding and schema.');
  }
}

async function createGame(request, db) {
  const body = await readBody(request);
  const mode = normalizeMode(body.mode);
  const name = cleanName(body.name);
  const stateJson = encodeState(body.state);
  const id = crypto.randomUUID();
  const token = randomToken();
  const tokenHash = await hashToken(token);
  const code = await uniqueCode(db);

  await db.prepare(`
    INSERT INTO chess_games (
      id, code, mode, status, white_name, black_name,
      white_token_hash, black_token_hash, state_json,
      current_turn, revision, winner, created_at, updated_at
    ) VALUES (?, ?, ?, 'waiting', ?, NULL, ?, NULL, ?, 'white', 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(id, code, mode, name, tokenHash, stateJson).run();

  const row = await findGame(db, { id });
  return json({ game: serializeGame(row), token, color: 'white' }, 201);
}

async function joinGame(request, db) {
  const body = await readBody(request);
  const code = normalizeCode(body.code);
  const name = cleanName(body.name);
  if (!code) throw httpError(400, 'Enter a valid game code.');

  const row = await findGame(db, { code });
  if (!row) throw httpError(404, 'That game code was not found.');
  if (row.black_token_hash) throw httpError(409, 'This mission already has two commanders.');
  if (row.status !== 'waiting') throw httpError(409, 'This mission is no longer accepting a second commander.');

  const token = randomToken();
  const tokenHash = await hashToken(token);
  const result = await db.prepare(`
    UPDATE chess_games
    SET black_name = ?, black_token_hash = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND black_token_hash IS NULL AND status = 'waiting'
  `).bind(name, tokenHash, row.id).run();
  if (!result?.meta?.changes) throw httpError(409, 'Another commander joined this mission first.');

  const updated = await findGame(db, { id: row.id });
  return json({ game: serializeGame(updated), token, color: 'black' });
}

async function getGame(url, db) {
  const id = cleanId(url.searchParams.get('id'));
  const code = normalizeCode(url.searchParams.get('code'));
  if (!id && !code) throw httpError(400, 'A game ID or code is required.');
  const row = await findGame(db, { id, code });
  if (!row) throw httpError(404, 'Mission archive not found.');
  return json({ game: serializeGame(row) });
}

async function makeMove(request, db) {
  const body = await readBody(request);
  const id = cleanId(body.id);
  const token = String(body.token || '');
  const expectedRevision = Number(body.revision);
  const mode = normalizeMode(body.mode);
  const nextTurn = normalizeTurn(body.nextTurn);
  const gameOver = Boolean(body.gameOver);
  const winner = normalizeWinner(body.winner);
  const stateJson = encodeState(body.state);
  const moveJson = encodeMove(body.move);

  if (!id || !token || !Number.isInteger(expectedRevision) || expectedRevision < 0) throw httpError(400, 'The move request is incomplete.');
  const row = await findGame(db, { id });
  if (!row) throw httpError(404, 'Mission archive not found.');
  if (isAiActive(row)) throw httpError(409, 'Nova AI controls Black in this mission. Synchronize and retry through the AI command route.');
  if (row.status !== 'active') throw httpError(409, 'This mission is not currently active.');
  if (row.mode !== mode) throw httpError(409, 'The ruleset does not match the saved mission.');
  if (Number(row.revision) !== expectedRevision) throw httpError(409, 'The board changed before your move was saved. Synchronize and try again.');

  const actor = await identifyPlayer(row, token);
  if (!actor) throw httpError(403, 'Player authentication failed.');
  if (row.current_turn !== actor) throw httpError(409, 'It is not your command turn.');
  const expectedNext = actor === 'white' ? 'black' : 'white';
  if (!gameOver && nextTurn !== expectedNext) throw httpError(400, 'The next-turn value is invalid.');
  if (gameOver && winner && ![actor, 'draw'].includes(winner)) throw httpError(400, 'The reported winner is invalid.');

  const nextRevision = expectedRevision + 1;
  const status = gameOver ? 'finished' : 'active';
  const safeWinner = gameOver ? winner : null;
  const notation = cleanNotation(body.move?.notation);

  const update = db.prepare(`
    UPDATE chess_games
    SET state_json = ?, current_turn = ?, revision = ?, status = ?, winner = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND revision = ? AND current_turn = ? AND status = 'active'
  `).bind(stateJson, gameOver ? actor : nextTurn, nextRevision, status, safeWinner, id, expectedRevision, actor);
  const insert = db.prepare(`
    INSERT INTO chess_moves (game_id, revision, player_color, notation, move_json, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(id, nextRevision, actor, notation, moveJson);

  const results = await db.batch([update, insert]);
  if (!results?.[0]?.meta?.changes) throw httpError(409, 'The board changed before your move was saved. Synchronize and try again.');

  const updated = await findGame(db, { id });
  return json({ game: serializeGame(updated) });
}

async function resignGame(request, db) {
  const body = await readBody(request);
  const id = cleanId(body.id);
  const token = String(body.token || '');
  if (!id || !token) throw httpError(400, 'The resignation request is incomplete.');

  const row = await findGame(db, { id });
  if (!row) throw httpError(404, 'Mission archive not found.');
  if (!['waiting', 'active'].includes(row.status)) throw httpError(409, 'This mission has already ended.');
  const actor = await identifyPlayer(row, token);
  if (!actor) throw httpError(403, 'Player authentication failed.');
  const winner = actor === 'white' ? 'black' : 'white';
  const revision = Number(row.revision) + 1;

  await db.prepare(`
    UPDATE chess_games
    SET status = 'resigned', winner = ?, revision = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('waiting','active')
  `).bind(winner, revision, id).run();
  await db.prepare(`
    INSERT INTO chess_moves (game_id, revision, player_color, notation, move_json, created_at)
    VALUES (?, ?, ?, 'RESIGN', ?, CURRENT_TIMESTAMP)
  `).bind(id, revision, actor, JSON.stringify({ action: 'resign', color: actor })).run();

  const updated = await findGame(db, { id });
  return json({ game: serializeGame(updated) });
}

async function identifyPlayer(row, token) {
  const hash = await hashToken(token);
  if (safeEqual(hash, row.white_token_hash)) return 'white';
  if (row.black_token_hash && safeEqual(hash, row.black_token_hash)) return 'black';
  return null;
}

async function findGame(db, { id = null, code = null }) {
  if (id) return db.prepare('SELECT * FROM chess_games WHERE id = ? LIMIT 1').bind(id).first();
  if (code) return db.prepare('SELECT * FROM chess_games WHERE code = ? LIMIT 1').bind(code).first();
  return null;
}

function isAiActive(row) {
  return Boolean(row && row.status === 'active' && !row.black_token_hash && String(row.black_name || '') === AI_NAME);
}

function serializeGame(row) {
  if (!row) return null;
  let state = {};
  try { state = JSON.parse(row.state_json || '{}'); } catch {}
  return {
    id: row.id,
    code: row.code,
    mode: row.mode,
    status: isAiActive(row) ? 'active_ai' : row.status,
    whiteName: row.white_name,
    blackName: row.black_name,
    state,
    currentTurn: row.current_turn,
    revision: Number(row.revision || 0),
    winner: row.winner,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uniqueCode(db) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const chunk = [...bytes].map(value => value.toString(36).padStart(2, '0')).join('').slice(0, 6).toUpperCase();
    const code = `NOVA-${chunk}`;
    const exists = await db.prepare('SELECT 1 FROM chess_games WHERE code = ? LIMIT 1').bind(code).first();
    if (!exists) return code;
  }
  throw httpError(503, 'Unable to reserve a unique game code. Please retry.');
}

async function readBody(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_STATE_BYTES + 50_000) throw httpError(413, 'The mission payload is too large.');
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid');
    return body;
  } catch {
    throw httpError(400, 'A valid JSON request body is required.');
  }
}

function encodeState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw httpError(400, 'A valid board state is required.');
  const encoded = JSON.stringify(value);
  if (new TextEncoder().encode(encoded).byteLength > MAX_STATE_BYTES) throw httpError(413, 'The board state is too large to save.');
  return encoded;
}

function encodeMove(value) {
  const safe = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const encoded = JSON.stringify(safe);
  if (encoded.length > 8_000) throw httpError(413, 'The move record is too large.');
  return encoded;
}

function normalizeMode(value) {
  const mode = String(value || '').toLowerCase();
  if (!MODES.has(mode)) throw httpError(400, 'Choose standard or trideck mode.');
  return mode;
}

function normalizeTurn(value) {
  const turn = String(value || '').toLowerCase();
  if (!['white','black'].includes(turn)) throw httpError(400, 'Invalid next-turn value.');
  return turn;
}

function normalizeWinner(value) {
  if (value === null || value === undefined || value === '') return null;
  const winner = String(value).toLowerCase();
  if (!['white','black','draw'].includes(winner)) throw httpError(400, 'Invalid winner value.');
  return winner;
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
}

function cleanId(value) {
  const id = String(value || '').trim();
  return /^[0-9a-f-]{30,40}$/i.test(id) ? id : '';
}

function cleanName(value) {
  return String(value || 'Anonymous Commander').trim().replace(/[<>\u0000-\u001f]/g, '').slice(0, 32) || 'Anonymous Commander';
}

function cleanNotation(value) {
  return String(value || 'MOVE').trim().replace(/[<>\u0000-\u001f]/g, '').slice(0, 64) || 'MOVE';
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(token)));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

function httpError(status, publicMessage) {
  const error = new Error(publicMessage);
  error.status = status;
  error.publicMessage = publicMessage;
  return error;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
