import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';
import { createPiece, pieceMarkup, pieceName } from './pieces.js';
import {
  TRI_BOARD_IDS,
  TRI_STATE_VERSION,
  createTriState,
  triBoard,
  triBoardForSquare,
  triSquares,
} from './trideck-engine.js';

const API_URL = '../api/chess';
const POLL_SECONDS = 12;
const FILES = ['a','b','c','d','e','f','g','h'];
const COLOR_NAME = { white: 'White', black: 'Black' };
const SIDE_FROM_TURN = { w: 'white', b: 'black' };
const TRI_BOARD_ELEMENTS = Object.freeze({
  VD: 'voidPlatformBoard',
  NX: 'nexusPlatformBoard',
  SD: 'silverPlatformBoard',
});

const els = Object.fromEntries([
  'connectionOrb','connectionLabel','connectionDetail','modeBadge','whitePlayerCard','blackPlayerCard',
  'whitePlayerName','blackPlayerName','whitePlayerStatus','blackPlayerStatus','turnLabel','gameStatus',
  'createOnlineButton','copyInviteButton','flipBoardButton','soundButton','gameCodeWrap','gameCode',
  'novaMessage','standardBoardWrap','standardBoard','rankCoordinates','fileCoordinates','triDeckStage',
  'voidPlatformBoard','nexusPlatformBoard','silverPlatformBoard',
  'deckTabs','promotionPanel','promotionChoices','selectedSquare',
  'lastMove','syncTimer','whiteCaptured','blackCaptured','moveLog','resignButton','resetLocalButton',
  'telemetryGameId','telemetryRevision','telemetryColor','telemetryRules','newGameButton','joinGameButton',
  'rulesButton','refreshButton','fullscreenButton','newGameDialog','joinGameDialog','rulesDialog',
  'newGameForm','joinGameForm','creatorName','joinerName','joinCodeInput','toastStack','boardStage'
].map(id => [id, document.getElementById(id)]));

const state = {
  mode: 'standard',
  standard: {
    game: new Chess(),
    moves: [],
    captured: { white: [], black: [] },
    lastMove: null,
  },
  tri: createTriGameState(),
  selected: null,
  legalMoves: [],
  orientation: 'white',
  activeBoard: 'NX',
  sound: true,
  apiOnline: false,
  polling: null,
  transmitting: false,
  secondsToSync: POLL_SECONDS,
  online: {
    id: null,
    code: null,
    token: null,
    color: null,
    revision: 0,
    status: null,
    currentTurn: 'white',
    whiteName: 'Commander One',
    blackName: 'Awaiting Rival',
    winner: null,
  },
};

function createTriGameState(snapshot = createTriState()) {
  const fallback = createTriState();
  let game;
  try {
    game = new Chess(snapshot?.fen || fallback.fen);
  } catch {
    game = new Chess(fallback.fen);
  }
  return {
    version: TRI_STATE_VERSION,
    game,
    moves: Array.isArray(snapshot?.moves) ? snapshot.moves : [],
    captured: normalizeCaptured(snapshot?.captured),
    lastMove: snapshot?.lastMove || null,
    winner: snapshot?.winner || null,
  };
}

function standardSnapshot() {
  return {
    version: 1,
    fen: state.standard.game.fen(),
    moves: state.standard.moves,
    captured: state.standard.captured,
    lastMove: state.standard.lastMove,
    winner: standardWinner(),
  };
}

function triSnapshot() {
  return {
    version: TRI_STATE_VERSION,
    fen: state.tri.game.fen(),
    moves: state.tri.moves,
    captured: state.tri.captured,
    lastMove: state.tri.lastMove,
    winner: triWinner(),
  };
}

function currentSnapshot() {
  return state.mode === 'standard' ? standardSnapshot() : triSnapshot();
}

function restoreSnapshot(mode, snapshot) {
  state.mode = mode === 'trideck' ? 'trideck' : 'standard';
  if (state.mode === 'standard') {
    try {
      state.standard.game = new Chess(snapshot?.fen);
    } catch {
      state.standard.game = new Chess();
    }
    state.standard.moves = Array.isArray(snapshot?.moves) ? snapshot.moves : [];
    state.standard.captured = normalizeCaptured(snapshot?.captured);
    state.standard.lastMove = snapshot?.lastMove || null;
  } else {
    const compatible = Number(snapshot?.version) === TRI_STATE_VERSION;
    state.tri = createTriGameState(compatible ? snapshot : createTriState());
  }
  clearSelection();
  updateModeUI();
  renderAll();
}

function normalizeCaptured(value) {
  return {
    white: Array.isArray(value?.white) ? value.white : [],
    black: Array.isArray(value?.black) ? value.black : [],
  };
}

function resetMode(mode = state.mode) {
  if (mode === 'standard') {
    state.standard = { game: new Chess(), moves: [], captured: { white: [], black: [] }, lastMove: null };
  } else {
    state.tri = createTriGameState();
  }
  clearSelection();
  saveLocal();
  renderAll();
}

function isOnline() {
  return Boolean(state.online.id && state.online.token);
}

function localTurn() {
  const game = state.mode === 'standard' ? state.standard.game : state.tri.game;
  return SIDE_FROM_TURN[game.turn()];
}

function currentTurn() {
  if (isOnline()) return state.online.currentTurn;
  return localTurn();
}

function gameIsOver() {
  if (isOnline() && ['finished','resigned'].includes(state.online.status)) return true;
  const game = state.mode === 'standard' ? state.standard.game : state.tri.game;
  return game.isGameOver();
}

function chessWinner(game) {
  if (!game.isGameOver()) return null;
  if (game.isCheckmate()) return game.turn() === 'w' ? 'black' : 'white';
  return 'draw';
}

function standardWinner() {
  return chessWinner(state.standard.game);
}

function triWinner() {
  return chessWinner(state.tri.game);
}

function canAct() {
  if (state.transmitting || gameIsOver()) return false;
  if (!isOnline()) return true;
  if (state.online.status !== 'active') return false;
  return state.online.color === state.online.currentTurn;
}

function pieceAtStandard(square) {
  const piece = state.standard.game.get(square);
  return piece ? { type: piece.type, color: piece.color === 'w' ? 'white' : 'black' } : null;
}

function pieceAtTri(square) {
  const piece = state.tri.game.get(square);
  return piece ? { type: piece.type, color: piece.color === 'w' ? 'white' : 'black' } : null;
}

function squareFrom(file, rank) {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
  return `${FILES[file]}${rank}`;
}

function squareParts(square) {
  return { file: FILES.indexOf(square[0]), rank: Number(square[1]) };
}

function orderedFiles() {
  return state.orientation === 'white' ? FILES : [...FILES].reverse();
}

function orderedRanks() {
  return state.orientation === 'white' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
}

function renderCoordinates() {
  els.rankCoordinates.innerHTML = orderedRanks().map(rank => `<span>${rank}</span>`).join('');
  els.fileCoordinates.innerHTML = orderedFiles().map(file => `<span>${file}</span>`).join('');
}

function buildSquare({ square, piece, board = null, mini = false }) {
  const { file, rank } = squareParts(square);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `square ${(file + rank) % 2 === 0 ? 'dark' : 'light'}`;
  button.dataset.square = square;
  if (board !== null) button.dataset.board = board;
  button.setAttribute('role', 'gridcell');
  button.setAttribute('aria-label', `${board === null ? '' : `${triBoard(board)?.label || board}, `}${square}${piece ? `, ${piece.color} ${pieceName(piece.type)}` : ', empty'}`);

  const selected = state.selected && state.selected.square === square && state.selected.board === board;
  if (selected) button.classList.add('selected');
  const move = state.legalMoves.find(item => item.square === square && item.board === board);
  if (move) button.classList.add(move.capture ? 'capture' : 'legal');

  const last = state.mode === 'standard' ? state.standard.lastMove : state.tri.lastMove;
  if (last && last.from === square && (board === null || last.fromBoard === board)) button.classList.add('last-from');
  if (last && last.to === square && (board === null || last.toBoard === board)) button.classList.add('last-to');
  if (piece) button.append(createPiece(piece.type, piece.color, { mini }));
  return button;
}

function renderStandardBoard() {
  els.standardBoard.innerHTML = '';
  for (const rank of orderedRanks()) {
    for (const file of orderedFiles()) {
      const square = `${file}${rank}`;
      els.standardBoard.append(buildSquare({ square, piece: pieceAtStandard(square), board: null }));
    }
  }
  renderCoordinates();
}

function renderTriBoards() {
  for (const boardId of TRI_BOARD_IDS) {
    const boardElement = els[TRI_BOARD_ELEMENTS[boardId]];
    boardElement.innerHTML = '';
    for (const square of triSquares(boardId, state.orientation)) {
      boardElement.append(buildSquare({
        square,
        piece: pieceAtTri(square),
        board: boardId,
        mini: false,
      }));
    }
  }
  document.querySelectorAll('[data-board-shell]').forEach(shell => {
    shell.classList.toggle('active', shell.dataset.boardShell === state.activeBoard);
  });
  els.deckTabs.querySelectorAll('button').forEach(button => {
    button.classList.toggle('active', button.dataset.board === state.activeBoard);
  });
  els.triDeckStage.classList.toggle('orientation-black', state.orientation === 'black');
}

function renderAll() {
  if (state.mode === 'standard') renderStandardBoard();
  else renderTriBoards();
  renderStatus();
  renderMoveLog();
  renderCaptured();
  renderTelemetry();
}

function renderStatus() {
  const turn = currentTurn();
  els.whitePlayerCard.classList.toggle('active', turn === 'white');
  els.blackPlayerCard.classList.toggle('active', turn === 'black');
  els.whitePlayerName.textContent = state.online.whiteName || 'Commander One';
  els.blackPlayerName.textContent = state.online.blackName || (isOnline() ? 'Awaiting Rival' : 'Commander Two');
  els.whitePlayerStatus.textContent = isOnline() && state.online.color === 'white' ? 'You' : turn === 'white' ? 'Active' : 'Standby';
  els.blackPlayerStatus.textContent = isOnline() && state.online.color === 'black' ? 'You' : turn === 'black' ? 'Active' : 'Standby';
  els.turnLabel.textContent = `${COLOR_NAME[turn]} to move`;

  let status = isOnline() ? 'Online mission active' : 'Local training simulation';
  if (isOnline() && state.online.status === 'waiting') status = 'Waiting for a second commander';
  if (gameIsOver()) {
    const winner = isOnline() ? state.online.winner : state.mode === 'standard' ? standardWinner() : triWinner();
    status = winner === 'draw' ? 'Mission ended in a draw' : `${COLOR_NAME[winner] || winner || 'Unknown'} fleet wins`;
  } else if ((state.mode === 'standard' ? state.standard.game : state.tri.game).inCheck()) {
    status = `${COLOR_NAME[turn]} High Commander is in check`;
  } else if (isOnline() && state.online.color !== turn) {
    status = 'Opponent move pending';
  } else if (isOnline()) {
    status = 'Your command turn';
  }
  els.gameStatus.textContent = status;
  els.selectedSquare.textContent = state.selected
    ? `${state.selected.board === null ? '' : `${state.selected.board} · `}${state.selected.square.toUpperCase()}`
    : 'None';

  const last = state.mode === 'standard' ? state.standard.lastMove : state.tri.lastMove;
  els.lastMove.textContent = last?.notation || 'Opening grid';
  els.modeBadge.textContent = state.mode === 'standard' ? 'STANDARD' : 'TRI-DECK';
  els.syncTimer.textContent = isOnline() ? `${state.secondsToSync}s` : 'Local only';
  els.copyInviteButton.disabled = !state.online.code;
  els.resignButton.disabled = !isOnline() || gameIsOver();
  els.gameCodeWrap.hidden = !state.online.code;
  els.gameCode.textContent = state.online.code || '--------';
}

function renderMoveLog() {
  const records = state.mode === 'standard' ? state.standard.moves : state.tri.moves;
  if (!records.length) {
    els.moveLog.innerHTML = '<li class="empty-log">No moves recorded.</li>';
    return;
  }
  const rows = [];
  for (let index = 0; index < records.length; index += 2) {
    const white = records[index];
    const black = records[index + 1];
    rows.push(`<li><span class="move-num">${Math.floor(index / 2) + 1}.</span><span>${escapeHtml(white?.notation || '')}</span><span>${escapeHtml(black?.notation || '')}</span></li>`);
  }
  els.moveLog.innerHTML = rows.join('');
  els.moveLog.scrollTop = els.moveLog.scrollHeight;
}

function renderCaptured() {
  const captured = state.mode === 'standard' ? state.standard.captured : state.tri.captured;
  els.whiteCaptured.innerHTML = captured.white.length ? captured.white.map(type => `<span class="captured-icon">${pieceMarkup(type, 'black')}</span>`).join('') : 'None';
  els.blackCaptured.innerHTML = captured.black.length ? captured.black.map(type => `<span class="captured-icon">${pieceMarkup(type, 'white')}</span>`).join('') : 'None';
}

function renderTelemetry() {
  els.telemetryGameId.textContent = state.online.id || 'Local';
  els.telemetryRevision.textContent = String(state.online.revision || 0);
  els.telemetryColor.textContent = state.online.color ? COLOR_NAME[state.online.color] : 'Training';
  els.telemetryRules.textContent = state.mode === 'standard' ? 'Standard Chess' : 'Nova Tri-Deck v5 · Full Chess';
}

function updateModeUI() {
  const tri = state.mode === 'trideck';
  els.standardBoardWrap.hidden = tri;
  els.triDeckStage.hidden = !tri;
  els.deckTabs.hidden = !tri;
  document.querySelectorAll('.segment').forEach(button => button.classList.toggle('active', button.dataset.mode === state.mode));
  renderAll();
}

function clearSelection() {
  state.selected = null;
  state.legalMoves = [];
  els.promotionPanel.hidden = true;
}

function handleStandardSquare(square) {
  if (!canAct()) return notify('The other commander currently holds the turn.', 'error');
  const piece = pieceAtStandard(square);
  const turn = currentTurn();

  if (state.selected) {
    const legal = state.legalMoves.filter(move => move.square === square);
    if (legal.length) {
      if (legal.some(move => move.promotion)) return showPromotionChoices(square, legal, 'standard');
      return executeStandardMove(state.selected.square, square, undefined);
    }
  }

  if (piece && piece.color === turn) {
    state.selected = { square, board: null };
    state.legalMoves = state.standard.game.moves({ square, verbose: true }).map(move => ({
      square: move.to,
      board: null,
      capture: Boolean(move.captured),
      promotion: move.promotion,
    }));
    novaSpeak(`${pieceName(piece.type)} selected at ${square.toUpperCase()}. ${state.legalMoves.length} legal vectors found.`);
  } else {
    clearSelection();
  }
  renderAll();
}

function showPromotionChoices(targetSquare, legal, mode) {
  els.promotionChoices.innerHTML = '';
  for (const type of ['q','r','b','n']) {
    if (!legal.some(move => move.promotion === type)) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.title = pieceName(type);
    button.append(createPiece(type, currentTurn(), { mini: true }));
    button.addEventListener('click', () => {
      if (mode === 'trideck') {
        const target = legal.find(move => move.square === targetSquare && move.promotion === type);
        executeTriMove(state.selected, target, type);
      } else {
        executeStandardMove(state.selected.square, targetSquare, type);
      }
    });
    els.promotionChoices.append(button);
  }
  els.promotionPanel.hidden = false;
}

async function executeStandardMove(from, to, promotion) {
  let move;
  try {
    const payload = { from, to };
    if (promotion) payload.promotion = promotion;
    move = state.standard.game.move(payload);
  } catch {
    playTone('error');
    notify('That route is not legal.', 'error');
    clearSelection();
    return renderAll();
  }
  const mover = move.color === 'w' ? 'white' : 'black';
  if (move.captured) state.standard.captured[mover].push(move.captured);
  const record = {
    ply: state.standard.moves.length + 1,
    color: mover,
    notation: move.san,
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured || null,
    promotion: move.promotion || null,
    at: new Date().toISOString(),
  };
  state.standard.moves.push(record);
  state.standard.lastMove = { from: move.from, to: move.to, notation: move.san };
  clearSelection();
  playTone(move.captured ? 'capture' : 'move');
  novaSpeak(standardCommentary(move));
  saveLocal();
  renderAll();

  if (isOnline()) await transmitMove(record);
  else if (state.standard.game.isGameOver()) celebrate(standardWinner());
}

function standardCommentary(move) {
  if (state.standard.game.isCheckmate()) return `Checkmate confirmed. ${COLOR_NAME[move.color === 'w' ? 'white' : 'black']} fleet controls the grid.`;
  if (state.standard.game.inCheck()) return `Warning: High Commander under direct threat after ${move.san}.`;
  if (move.captured) return `${pieceName(move.captured)} removed from the grid. Tactical pressure is rising.`;
  if (move.flags.includes('k') || move.flags.includes('q')) return 'Command citadel repositioned. Defensive geometry improved.';
  const comments = [
    `${move.san} recorded. The probability field has shifted.`,
    'Clean vector. No wasted movement detected.',
    'Position updated. I am watching the long diagonals.',
    'A patient move. Space often rewards commanders who resist hurry.',
  ];
  return comments[state.standard.moves.length % comments.length];
}

function handleTriSquare(board, square) {
  state.activeBoard = board;
  if (!canAct()) return notify('The other commander currently holds the turn.', 'error');
  const piece = pieceAtTri(square);
  const turn = currentTurn();

  if (state.selected) {
    const legal = state.legalMoves.filter(move => move.board === board && move.square === square);
    if (legal.length) {
      if (legal.some(move => move.promotion)) return showPromotionChoices(square, legal, 'trideck');
      return executeTriMove(state.selected, legal[0]);
    }
  }

  if (piece && piece.color === turn) {
    state.selected = { board, square };
    state.legalMoves = state.tri.game.moves({ square, verbose: true }).map(move => ({
      square: move.to,
      board: triBoardForSquare(move.to),
      capture: Boolean(move.captured),
      promotion: move.promotion,
    }));
    const platformRoutes = state.legalMoves.filter(move => move.board !== board).length;
    novaSpeak(`${pieceName(piece.type)} linked on ${triBoard(board).label}. ${state.legalMoves.length} legal vector${state.legalMoves.length === 1 ? '' : 's'}${platformRoutes ? `, including ${platformRoutes} cross-platform route${platformRoutes === 1 ? '' : 's'}` : ''}.`);
  } else {
    clearSelection();
  }
  renderAll();
}

async function executeTriMove(from, target, promotion) {
  let move;
  try {
    const payload = { from: from.square, to: target.square };
    if (promotion) payload.promotion = promotion;
    move = state.tri.game.move(payload);
  } catch {
    clearSelection();
    playTone('error');
    notify('That route is not legal.', 'error');
    return renderAll();
  }
  const mover = move.color === 'w' ? 'white' : 'black';
  if (move.captured) state.tri.captured[mover].push(move.captured);
  const record = {
    ply: state.tri.moves.length + 1,
    color: mover,
    notation: move.san,
    from: move.from,
    to: move.to,
    fromBoard: triBoardForSquare(move.from),
    toBoard: triBoardForSquare(move.to),
    piece: move.piece,
    captured: move.captured || null,
    promotion: move.promotion || null,
    at: new Date().toISOString(),
  };
  state.tri.moves.push(record);
  state.tri.lastMove = { ...record };
  state.tri.winner = triWinner();
  state.activeBoard = record.toBoard;
  clearSelection();
  playTone(move.captured ? 'capture' : record.fromBoard !== record.toBoard ? 'phase' : 'move');
  novaSpeak(
    state.tri.game.isCheckmate()
      ? `Checkmate confirmed on ${triBoard(record.toBoard).label}.`
      : state.tri.game.inCheck()
        ? `High Commander under direct threat after ${move.san}.`
        : move.promotion
          ? `Drone Sentinel promoted to ${pieceName(move.promotion)}.`
          : move.captured
            ? `${pieceName(move.captured)} removed from ${triBoard(record.toBoard).label}.`
            : record.fromBoard !== record.toBoard
              ? `${pieceName(move.piece)} crossed onto ${triBoard(record.toBoard).label}.`
              : 'Tri-Deck vector accepted.',
  );
  saveLocal();
  renderAll();

  if (isOnline()) await transmitMove(record);
  else if (state.tri.game.isGameOver()) celebrate(triWinner());
}

async function transmitMove(record) {
  state.transmitting = true;
  setConnection('busy', 'Transmitting move', 'Saving the new grid state to the mission archive.');
  renderStatus();
  try {
    const response = await api('move', {
      method: 'POST',
      body: {
        id: state.online.id,
        token: state.online.token,
        revision: state.online.revision,
        mode: state.mode,
        state: currentSnapshot(),
        move: record,
        nextTurn: localTurn(),
        gameOver: gameIsOver(),
        winner: state.mode === 'standard' ? standardWinner() : triWinner(),
      },
    });
    applyRemoteGame(response.game, { preserveMessage: true });
    setConnection('online', 'Mission synchronized', 'Move secured in the D1 archive.');
    notify('Move transmitted to your opponent.', 'success');
  } catch (error) {
    setConnection('error', 'Synchronization interrupted', error.message);
    notify(error.message, 'error');
    await syncGame({ quiet: true });
  } finally {
    state.transmitting = false;
    renderStatus();
  }
}

async function createOnlineGame(name, mode) {
  switchMode(mode, { force: true });
  resetMode(mode);
  setConnection('busy', 'Creating mission', 'Opening a secure game channel.');
  const response = await api('create', {
    method: 'POST',
    body: { name: cleanName(name), mode, state: currentSnapshot() },
  });
  state.online.token = response.token;
  state.online.color = response.color;
  applyRemoteGame(response.game);
  persistSession();
  setConnection('online', 'Online archive connected', 'Share the invite code with the second commander.');
  notify(`Game ${response.game.code} created.`, 'success');
  novaSpeak('Online mission created. I will preserve every move until the rival commander returns.');
}

async function joinOnlineGame(name, code) {
  setConnection('busy', 'Joining mission', 'Locating the requested command grid.');
  const response = await api('join', {
    method: 'POST',
    body: { name: cleanName(name), code: normalizeCode(code) },
  });
  state.online.token = response.token;
  state.online.color = response.color;
  applyRemoteGame(response.game);
  persistSession();
  setConnection('online', 'Online archive connected', 'Both commanders now have access to the grid.');
  notify(`Joined game ${response.game.code}.`, 'success');
  novaSpeak('Second commander authenticated. The game may now proceed across time and distance.');
}

async function syncGame({ quiet = false } = {}) {
  if (!state.online.id || !state.online.token) return;
  if (!quiet) setConnection('busy', 'Synchronizing', 'Checking for a new opponent move.');
  try {
    const response = await api('get', {
      params: { id: state.online.id, token: state.online.token },
    });
    const changed = response.game.revision !== state.online.revision;
    applyRemoteGame(response.game, { preserveMessage: !changed });
    if (changed) {
      playTone('sync');
      notify('Opponent move received.', 'success');
      novaSpeak('New opponent telemetry received. The board has been updated.');
    }
    setConnection('online', 'Mission synchronized', changed ? 'New grid state received.' : 'No new opponent move yet.');
  } catch (error) {
    setConnection('error', 'Synchronization interrupted', error.message);
    if (!quiet) notify(error.message, 'error');
  }
  state.secondsToSync = POLL_SECONDS;
  renderStatus();
}

function applyRemoteGame(game, { preserveMessage = false } = {}) {
  if (!game) throw new Error('The server returned no game state.');
  state.online.id = game.id;
  state.online.code = game.code;
  state.online.revision = Number(game.revision || 0);
  state.online.status = game.status;
  state.online.currentTurn = game.currentTurn || 'white';
  state.online.whiteName = game.whiteName || 'Commander One';
  state.online.blackName = game.blackName || 'Awaiting Rival';
  state.online.winner = game.winner || null;
  restoreSnapshot(game.mode, game.state || {});
  if (!preserveMessage) novaSpeak(game.status === 'waiting' ? 'Invite channel ready. Awaiting a second commander.' : 'Mission archive loaded. All systems nominal.');
  updateUrl(game.code);
  startPolling();
}

async function resignGame() {
  if (!isOnline() || gameIsOver()) return;
  if (!window.confirm('Resign this mission? This action ends the game.')) return;
  try {
    const response = await api('resign', {
      method: 'POST',
      body: { id: state.online.id, token: state.online.token },
    });
    applyRemoteGame(response.game);
    playTone('defeat');
    notify('Mission resigned.', 'success');
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function testApi() {
  try {
    const response = await api('health');
    state.apiOnline = Boolean(response.ok);
    setConnection('online', 'Online archive available', 'D1 game storage is ready.');
  } catch (error) {
    state.apiOnline = false;
    setConnection('error', 'Local command mode', error.message.includes('D1') ? error.message : 'Online storage is not configured yet. Local training still works.');
  }
}

async function api(action, { method = 'GET', body = null, params = {} } = {}) {
  const url = new URL(API_URL, window.location.href);
  url.searchParams.set('action', action);
  for (const [key, value] of Object.entries(params)) if (value !== null && value !== undefined) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Mission server error ${response.status}.`);
  return data;
}

function setConnection(type, label, detail) {
  els.connectionOrb.className = `status-orb${type === 'online' ? ' online' : type === 'error' ? ' error' : ''}`;
  els.connectionLabel.textContent = label;
  els.connectionDetail.textContent = detail;
}

function switchMode(mode, { force = false } = {}) {
  if (!['standard','trideck'].includes(mode)) return;
  if (isOnline() && !force && mode !== state.mode) return notify('This online mission is locked to its original ruleset.', 'error');
  state.mode = mode;
  clearSelection();
  loadLocal(mode);
  updateModeUI();
  novaSpeak(mode === 'standard' ? 'Standard chess lattice engaged.' : 'Nova Tri-Deck engaged. Two 8×2 home platforms and one 8×4 Nexus now form a complete 8×8 battle grid.');
}

function saveLocal() {
  if (isOnline()) return;
  try {
    localStorage.setItem(`novaChessLocal:${state.mode}`, JSON.stringify(currentSnapshot()));
  } catch {}
}

function loadLocal(mode = state.mode) {
  if (isOnline()) return;
  try {
    const raw = localStorage.getItem(`novaChessLocal:${mode}`);
    if (raw) restoreSnapshot(mode, JSON.parse(raw));
  } catch {}
}

function persistSession() {
  if (!state.online.code || !state.online.token) return;
  const session = { id: state.online.id, code: state.online.code, token: state.online.token, color: state.online.color };
  localStorage.setItem(`novaChessSession:${state.online.code}`, JSON.stringify(session));
  localStorage.setItem('novaChessLastSession', state.online.code);
}

async function resumeSession(code) {
  try {
    const raw = localStorage.getItem(`novaChessSession:${normalizeCode(code)}`);
    if (!raw) return false;
    const session = JSON.parse(raw);
    state.online = { ...state.online, ...session };
    await syncGame();
    return true;
  } catch {
    return false;
  }
}

function clearOnlineSession() {
  if (state.online.code) localStorage.removeItem(`novaChessSession:${state.online.code}`);
  if (localStorage.getItem('novaChessLastSession') === state.online.code) localStorage.removeItem('novaChessLastSession');
  stopPolling();
  state.online = {
    id: null, code: null, token: null, color: null, revision: 0, status: null,
    currentTurn: 'white', whiteName: 'Commander One', blackName: 'Commander Two', winner: null,
  };
  updateUrl(null);
  setConnection(state.apiOnline ? 'online' : 'error', state.apiOnline ? 'Online archive available' : 'Local command mode', state.apiOnline ? 'Create or join a game when ready.' : 'Local training remains available.');
}

function updateUrl(code) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set('game', code);
  else url.searchParams.delete('game');
  history.replaceState({}, '', url);
}

function inviteUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('game', state.online.code);
  return url.toString();
}

function startPolling() {
  stopPolling();
  state.secondsToSync = POLL_SECONDS;
  state.polling = window.setInterval(() => {
    state.secondsToSync -= 1;
    if (state.secondsToSync <= 0) syncGame({ quiet: true });
    renderStatus();
  }, 1000);
}

function stopPolling() {
  if (state.polling) window.clearInterval(state.polling);
  state.polling = null;
}

function novaSpeak(text) {
  els.novaMessage.innerHTML = `<span class="nova-avatar">N</span><p><strong>Nova:</strong> ${escapeHtml(text)}</p>`;
}

function notify(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastStack.append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function celebrate(winner) {
  playTone(winner === 'draw' ? 'sync' : 'victory');
  novaSpeak(winner === 'draw' ? 'The mission concludes in strategic equilibrium.' : `${COLOR_NAME[winner]} fleet victory confirmed. A worthy contest.`);
  renderAll();
}

function playTone(kind) {
  if (!state.sound) return;
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const values = {
      move: [260,.05], capture: [145,.1], phase: [520,.16], sync: [660,.08],
      error: [90,.12], victory: [880,.25], defeat: [110,.25],
    }[kind] || [300,.06];
    oscillator.type = kind === 'phase' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(values[0], context.currentTime);
    if (kind === 'phase') oscillator.frequency.exponentialRampToValueAtTime(1040, context.currentTime + values[1]);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.11, context.currentTime + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + values[1]);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + values[1] + .02);
    oscillator.addEventListener('ended', () => context.close());
  } catch {}
}

function cleanName(value) {
  const name = String(value || '').trim().replace(/[<>]/g, '').slice(0, 32);
  return name || 'Anonymous Commander';
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
}

function wireEvents() {
  els.standardBoard.addEventListener('click', event => {
    const square = event.target.closest('.square')?.dataset.square;
    if (square) handleStandardSquare(square);
  });
  for (const board of TRI_BOARD_IDS) {
    els[TRI_BOARD_ELEMENTS[board]].addEventListener('click', event => {
      const square = event.target.closest('.square')?.dataset.square;
      if (square) handleTriSquare(board, square);
    });
  }
  document.querySelectorAll('.segment').forEach(button => button.addEventListener('click', () => switchMode(button.dataset.mode)));
  els.deckTabs.addEventListener('click', event => {
    const button = event.target.closest('button[data-board]');
    if (!button) return;
    state.activeBoard = button.dataset.board;
    renderTriBoards();
  });
  document.querySelectorAll('[data-board-shell]').forEach(shell => shell.addEventListener('click', event => {
    if (event.target.closest('.square')) return;
    state.activeBoard = shell.dataset.boardShell;
    renderTriBoards();
  }));

  els.newGameButton.addEventListener('click', () => els.newGameDialog.showModal());
  els.createOnlineButton.addEventListener('click', () => els.newGameDialog.showModal());
  els.joinGameButton.addEventListener('click', () => els.joinGameDialog.showModal());
  els.rulesButton.addEventListener('click', () => els.rulesDialog.showModal());
  els.refreshButton.addEventListener('click', () => isOnline() ? syncGame() : testApi());
  els.resignButton.addEventListener('click', resignGame);
  els.copyInviteButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl());
      notify('Invite link copied.', 'success');
    } catch {
      window.prompt('Copy this invite link:', inviteUrl());
    }
  });
  els.flipBoardButton.addEventListener('click', () => {
    state.orientation = state.orientation === 'white' ? 'black' : 'white';
    renderAll();
  });
  els.soundButton.addEventListener('click', () => {
    state.sound = !state.sound;
    els.soundButton.textContent = `Sound: ${state.sound ? 'On' : 'Off'}`;
    els.soundButton.setAttribute('aria-pressed', String(state.sound));
    if (state.sound) playTone('sync');
  });
  els.fullscreenButton.addEventListener('click', () => document.body.classList.toggle('board-fullscreen'));
  els.resetLocalButton.addEventListener('click', () => {
    if (isOnline()) {
      if (!window.confirm('Leave this online mission on this device? The game remains saved for the other player.')) return;
      clearOnlineSession();
    } else if (!window.confirm('Reset this local board?')) return;
    resetMode();
    renderAll();
  });

  els.newGameForm.addEventListener('submit', async event => {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const mode = new FormData(els.newGameForm).get('newMode');
    const name = els.creatorName.value;
    els.newGameDialog.close();
    localStorage.setItem('novaChessName', cleanName(name));
    try { await createOnlineGame(name, mode); } catch (error) { setConnection('error', 'Mission creation failed', error.message); notify(error.message, 'error'); }
  });
  els.joinGameForm.addEventListener('submit', async event => {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const name = els.joinerName.value;
    const code = els.joinCodeInput.value;
    els.joinGameDialog.close();
    localStorage.setItem('novaChessName', cleanName(name));
    try { await joinOnlineGame(name, code); } catch (error) { setConnection('error', 'Unable to join mission', error.message); notify(error.message, 'error'); }
  });
  window.addEventListener('beforeunload', saveLocal);
}

async function boot() {
  wireEvents();
  const savedName = localStorage.getItem('novaChessName') || '';
  els.creatorName.value = savedName;
  els.joinerName.value = savedName;
  loadLocal('standard');
  updateModeUI();
  renderAll();
  testApi();

  const code = normalizeCode(new URL(window.location.href).searchParams.get('game'));
  if (code) {
    els.joinCodeInput.value = code;
    const resumed = await resumeSession(code);
    if (!resumed) els.joinGameDialog.showModal();
  } else {
    const lastCode = localStorage.getItem('novaChessLastSession');
    if (lastCode) await resumeSession(lastCode);
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

boot();
