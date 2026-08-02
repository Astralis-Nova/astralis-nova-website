const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const MODES=new Set(['standard','trideck']);
const MAX_STATE_BYTES=220000;

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'POST, OPTIONS'}});
  const action=new URL(request.url).searchParams.get('action');
  try{
    if(!env.CHESS_DB)throw http(503,'Chess D1 is not connected.');
    if(request.method!=='POST')throw http(405,'Use POST for AI takeover commands.');
    if(action==='enable')return enableAi(request,env.CHESS_DB);
    if(action==='claim')return claimSeat(request,env.CHESS_DB);
    if(action==='move')return makeMove(request,env.CHESS_DB);
    if(action==='resign')return resign(request,env.CHESS_DB);
    throw http(404,'Unknown AI takeover command.');
  }catch(error){console.error('Chess AI API error',error);return reply({error:error.publicMessage||'AI takeover command failed.'},error.status||500)}
}

async function enableAi(request,db){
  const body=await readBody(request),id=cleanId(body.id),token=String(body.token||'');
  if(!id||!token)throw http(400,'The AI activation request is incomplete.');
  const row=await find(db,{id});
  if(!row)throw http(404,'Mission archive not found.');
  if(await identify(row,token)!=='white')throw http(403,'Only the creating commander can activate Nova AI.');
  if(row.black_token_hash)throw http(409,'A human commander already controls Black.');
  if(row.status==='active_ai')return reply({game:serialize(row)});
  if(row.status!=='waiting')throw http(409,'Nova AI cannot be activated for this mission.');
  const result=await db.prepare(`UPDATE chess_games SET status='active_ai',black_name='Nova AI',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='waiting' AND black_token_hash IS NULL`).bind(id).run();
  if(!result?.meta?.changes)throw http(409,'The challenger seat changed before Nova could take command.');
  return reply({game:serialize(await find(db,{id}))});
}

async function claimSeat(request,db){
  const body=await readBody(request),code=normalizeCode(body.code),name=cleanName(body.name);
  if(!code)throw http(400,'Enter a valid game code.');
  const row=await find(db,{code});
  if(!row)throw http(404,'That game code was not found.');
  if(row.black_token_hash)throw http(409,'This mission already has two commanders.');
  if(!['waiting','active_ai'].includes(row.status))throw http(409,'This mission is no longer accepting a second commander.');
  const token=randomToken(),hash=await hashToken(token);
  const result=await db.prepare(`UPDATE chess_games SET black_name=?,black_token_hash=?,status='active',updated_at=CURRENT_TIMESTAMP WHERE id=? AND black_token_hash IS NULL AND status IN ('waiting','active_ai')`).bind(name,hash,row.id).run();
  if(!result?.meta?.changes)throw http(409,'Another commander joined this mission first.');
  return reply({game:serialize(await find(db,{id:row.id})),token,color:'black',replacedAi:row.status==='active_ai'});
}

async function makeMove(request,db){
  const body=await readBody(request),id=cleanId(body.id),token=String(body.token||''),revision=Number(body.revision),mode=normalizeMode(body.mode),nextTurn=normalizeTurn(body.nextTurn),gameOver=Boolean(body.gameOver),winner=normalizeWinner(body.winner),asAi=Boolean(body.asAi),stateJson=encodeState(body.state),moveJson=encodeMove(body.move);
  if(!id||!token||!Number.isInteger(revision)||revision<0)throw http(400,'The move request is incomplete.');
  const row=await find(db,{id});
  if(!row)throw http(404,'Mission archive not found.');
  if(row.status!=='active_ai')throw http(409,'Nova AI no longer controls this mission.');
  if(row.mode!==mode)throw http(409,'The ruleset does not match the saved mission.');
  if(Number(row.revision)!==revision)throw http(409,'The board changed before the move was saved.');
  const authenticated=await identify(row,token);
  let actor=authenticated;
  if(asAi){if(authenticated!=='white'||row.black_token_hash||row.current_turn!=='black')throw http(409,'Nova AI no longer controls the Black fleet.');actor='black'}
  if(!actor)throw http(403,'Player authentication failed.');
  if(row.current_turn!==actor)throw http(409,'It is not your command turn.');
  const expectedNext=actor==='white'?'black':'white';
  if(!gameOver&&nextTurn!==expectedNext)throw http(400,'The next-turn value is invalid.');
  if(gameOver&&winner&&![actor,'draw'].includes(winner))throw http(400,'The reported winner is invalid.');
  const nextRevision=revision+1,status=gameOver?'finished':'active_ai',safeWinner=gameOver?winner:null,notation=cleanNotation(body.move?.notation);
  const update=db.prepare(`UPDATE chess_games SET state_json=?,current_turn=?,revision=?,status=?,winner=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND current_turn=? AND status='active_ai' AND black_token_hash IS NULL`).bind(stateJson,gameOver?actor:nextTurn,nextRevision,status,safeWinner,id,revision,actor);
  const insert=db.prepare(`INSERT INTO chess_moves (game_id,revision,player_color,notation,move_json,created_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)`).bind(id,nextRevision,actor,notation,moveJson);
  const results=await db.batch([update,insert]);
  if(!results?.[0]?.meta?.changes)throw http(409,asAi?'A human commander claimed Black before Nova moved.':'The board changed before the move was saved.');
  return reply({game:serialize(await find(db,{id})),aiMove:asAi});
}

async function resign(request,db){
  const body=await readBody(request),id=cleanId(body.id),token=String(body.token||'');
  if(!id||!token)throw http(400,'The resignation request is incomplete.');
  const row=await find(db,{id});
  if(!row)throw http(404,'Mission archive not found.');
  if(row.status!=='active_ai')throw http(409,'This mission is no longer controlled by Nova AI.');
  if(await identify(row,token)!=='white')throw http(403,'Player authentication failed.');
  const revision=Number(row.revision)+1;
  await db.prepare(`UPDATE chess_games SET status='resigned',winner='black',revision=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='active_ai'`).bind(revision,id).run();
  await db.prepare(`INSERT INTO chess_moves (game_id,revision,player_color,notation,move_json,created_at) VALUES (?,?,'white','RESIGN',?,CURRENT_TIMESTAMP)`).bind(id,revision,JSON.stringify({action:'resign',color:'white'})).run();
  return reply({game:serialize(await find(db,{id}))});
}

async function find(db,{id=null,code=null}){if(id)return db.prepare('SELECT * FROM chess_games WHERE id=? LIMIT 1').bind(id).first();if(code)return db.prepare('SELECT * FROM chess_games WHERE code=? LIMIT 1').bind(code).first();return null}
async function identify(row,token){const hash=await hashToken(token);if(safeEqual(hash,row.white_token_hash))return'white';if(row.black_token_hash&&safeEqual(hash,row.black_token_hash))return'black';return null}
function serialize(row){let state={};try{state=JSON.parse(row.state_json||'{}')}catch{}return{id:row.id,code:row.code,mode:row.mode,status:row.status,whiteName:row.white_name,blackName:row.black_name,state,currentTurn:row.current_turn,revision:Number(row.revision||0),winner:row.winner,createdAt:row.created_at,updatedAt:row.updated_at}}
async function readBody(request){try{const body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))throw 0;return body}catch{throw http(400,'A valid JSON request body is required.')}}
function encodeState(value){if(!value||typeof value!=='object'||Array.isArray(value))throw http(400,'A valid board state is required.');const encoded=JSON.stringify(value);if(new TextEncoder().encode(encoded).byteLength>MAX_STATE_BYTES)throw http(413,'The board state is too large to save.');return encoded}
function encodeMove(value){const encoded=JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)?value:{});if(encoded.length>8000)throw http(413,'The move record is too large.');return encoded}
function normalizeMode(value){const mode=String(value||'').toLowerCase();if(!MODES.has(mode))throw http(400,'Choose standard or trideck mode.');return mode}
function normalizeTurn(value){const turn=String(value||'').toLowerCase();if(!['white','black'].includes(turn))throw http(400,'Invalid next-turn value.');return turn}
function normalizeWinner(value){if(value===null||value===undefined||value==='')return null;const winner=String(value).toLowerCase();if(!['white','black','draw'].includes(winner))throw http(400,'Invalid winner value.');return winner}
function normalizeCode(value){return String(value||'').trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12)}
function cleanId(value){const id=String(value||'').trim();return/^[0-9a-f-]{30,40}$/i.test(id)?id:''}
function cleanName(value){return String(value||'Anonymous Commander').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,32)||'Anonymous Commander'}
function cleanNotation(value){return String(value||'MOVE').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,64)||'MOVE'}
function randomToken(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('')}
async function hashToken(token){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(token)));return[...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('')}
function safeEqual(a,b){if(!a||!b||a.length!==b.length)return false;let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);return mismatch===0}
function http(status,publicMessage){const error=new Error(publicMessage);error.status=status;error.publicMessage=publicMessage;return error}
function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
