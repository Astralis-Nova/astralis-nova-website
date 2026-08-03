import { Chess } from 'chess.js';

const HEADERS={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff'
};
const MOVE_ACTIONS=new Set(['/api/chess','/api/chess-ai']);

export async function onRequest(context){
  const {request,env}=context;
  const url=new URL(request.url);
  if(request.method!=='POST'||!MOVE_ACTIONS.has(url.pathname))return context.next();

  const action=String(url.searchParams.get('action')||'').toLowerCase();
  if(action!=='move'&&action!=='create')return context.next();

  try{
    const body=await request.clone().json();
    if(!body||typeof body!=='object'||Array.isArray(body))throw ruleError(400,'A valid chess command is required.');

    if(action==='create'){
      body.state=snapshot(new Chess(),null);
      return context.next(rewriteRequest(request,body));
    }

    if(!env.CHESS_DB)throw ruleError(503,'Chess D1 is not connected.');
    const id=cleanId(body.id);
    if(!id)throw ruleError(400,'The move request is missing a valid game ID.');
    const row=await env.CHESS_DB.prepare('SELECT state_json,current_turn,revision,status FROM chess_games WHERE id=? LIMIT 1').bind(id).first();
    if(!row)throw ruleError(404,'Mission archive not found.');
    if(Number(row.revision)!==Number(body.revision))throw ruleError(409,'The board changed before this move was checked. Synchronize and try again.');

    const game=loadGame(row.state_json);
    const expectedTurn=game.turn()==='w'?'white':'black';
    if(expectedTurn!==row.current_turn)throw ruleError(409,'The saved board turn is inconsistent. Synchronize or begin a new mission.');

    const submitted=body.move&&typeof body.move==='object'?body.move:{};
    const from=cleanSquare(submitted.from);
    const to=cleanSquare(submitted.to);
    const promotion=cleanPromotion(submitted.promotion);
    if(!from||!to)throw ruleError(400,'Choose a valid starting and destination square.');

    let made;
    try{
      made=game.move({from,to,...(promotion?{promotion}:{})});
    }catch{
      throw ruleError(409,`${from.toUpperCase()} to ${to.toUpperCase()} is not legal in the saved position.`);
    }
    if(!made)throw ruleError(409,`${from.toUpperCase()} to ${to.toUpperCase()} is not legal in the saved position.`);

    const actor=made.color==='w'?'white':'black';
    if(actor!==row.current_turn)throw ruleError(409,'That piece does not belong to the commander whose turn it is.');

    const gameOver=game.isGameOver();
    const winner=game.isCheckmate()?actor:(gameOver?'draw':null);
    body.state=snapshot(game,made);
    body.move=moveRecord(made);
    body.nextTurn=game.turn()==='w'?'white':'black';
    body.gameOver=gameOver;
    body.winner=winner;

    return context.next(rewriteRequest(request,body));
  }catch(error){
    if(error?.ruleStatus)return json({error:error.message},error.ruleStatus);
    console.error('Chess rules middleware error',error);
    return json({error:'The rules referee could not validate this command.'},500);
  }
}

function rewriteRequest(request,body){
  const headers=new Headers(request.headers);
  headers.set('Content-Type','application/json');
  headers.delete('Content-Length');
  return new Request(request.url,{method:request.method,headers,body:JSON.stringify(body)});
}

function loadGame(encoded){
  let state={};
  try{state=JSON.parse(encoded||'{}')}catch{throw ruleError(409,'The saved board state is unreadable.');}
  const game=new Chess();
  try{
    if(state.pgn)game.loadPgn(state.pgn);
    else if(state.fen)game.load(state.fen);
    else throw new Error('missing position');
  }catch{throw ruleError(409,'The saved board position cannot be reconstructed legally.');}
  return game;
}

function snapshot(game,lastMove){
  return{
    version:29,
    fen:game.fen(),
    pgn:game.pgn(),
    lastMove:lastMove?{from:lastMove.from,to:lastMove.to,notation:lastMove.san}:null,
    moves:game.history({verbose:true}).map(move=>({
      color:move.color==='w'?'white':'black',
      from:move.from,
      to:move.to,
      notation:move.san,
      piece:move.piece,
      captured:move.captured||null,
      promotion:move.promotion||null,
      flags:move.flags
    })),
    result:resultReason(game),
    updatedAt:new Date().toISOString()
  };
}

function moveRecord(move){
  const record={
    color:move.color==='w'?'white':'black',
    from:move.from,
    to:move.to,
    fromBoard:boardFor(move.from),
    toBoard:boardFor(move.to),
    piece:move.piece,
    captured:move.captured||null,
    promotion:move.promotion||null,
    notation:move.san,
    flags:move.flags,
    special:specialMove(move),
    at:new Date().toISOString()
  };
  if(move.flags.includes('e'))record.capturedSquare=`${move.to[0]}${move.from[1]}`;
  return record;
}

function resultReason(game){
  if(game.isCheckmate())return'checkmate';
  if(game.isStalemate())return'stalemate';
  if(game.isInsufficientMaterial())return'insufficient_material';
  if(game.isThreefoldRepetition())return'threefold_repetition';
  if(game.isDrawByFiftyMoves())return'fifty_move_rule';
  if(game.isDraw())return'draw';
  return null;
}

function specialMove(move){
  if(move.flags.includes('k'))return'castle_kingside';
  if(move.flags.includes('q'))return'castle_queenside';
  if(move.flags.includes('e'))return'en_passant';
  if(move.promotion)return`promotion_${move.promotion}`;
  return null;
}

function boardFor(square){
  const rank=Number(square[1]);
  if(rank>=7)return'VD';
  if(rank<=2)return'SD';
  return'abcd'.includes(square[0])?'NP':'NS';
}

function cleanSquare(value){
  const square=String(value||'').toLowerCase();
  return/^[a-h][1-8]$/.test(square)?square:'';
}
function cleanPromotion(value){
  const promotion=String(value||'').toLowerCase();
  return['q','r','b','n'].includes(promotion)?promotion:'';
}
function cleanId(value){
  const id=String(value||'').trim();
  return/^[0-9a-f-]{30,40}$/i.test(id)?id:'';
}
function ruleError(status,message){
  const error=new Error(message);error.ruleStatus=status;return error;
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
