import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const CORE_URL='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@f4ed377ed33cf21e28e47fcb0318021fe51af20e/chess/chess.js';
const nativeFetch=window.fetch.bind(window);
const VALUES={p:1,n:3.2,b:3.35,r:5,q:9.2,k:0};
let actualGame=null,creatorToken=null,aiBusy=false,aiTimer=null,generation=0,lastRevision=-1,handoff=false;

injectControls();
window.fetch=interceptFetch;
await import(CORE_URL);
setInterval(decorate,500);

function injectControls(){
  const form=document.getElementById('newGameForm');
  if(!form||document.getElementById('novaAiTakeover'))return;
  const label=document.createElement('label');
  label.className='choice-card nova-ai-choice';
  label.innerHTML='<input id="novaAiTakeover" type="checkbox" checked><span><strong>Nova AI Until Challenger Joins</strong><small>Play against Nova now. A human can claim Black later and continue from the exact saved position.</small></span>';
  form.querySelector('fieldset')?.insertAdjacentElement('afterend',label);
  const style=document.createElement('style');
  style.textContent='.nova-ai-choice{border-color:rgba(69,217,255,.42)!important;background:linear-gradient(135deg,rgba(20,77,126,.36),rgba(50,31,105,.28))!important}.nova-ai-choice strong{color:#8eeaff}.nova-ai-choice input{accent-color:#45d9ff}.player-card.ai-command{border-color:rgba(135,91,255,.72);box-shadow:0 0 24px rgba(135,91,255,.17)}';
  document.head.append(style);
  const grid=document.querySelector('#rulesDialog .rules-grid');
  if(grid){const article=document.createElement('article');article.innerHTML='<h3>Nova AI Takeover</h3><p>Nova commands Black while the seat is open. A joining human atomically claims Black and continues from the saved position, history and current turn.</p>';grid.append(article)}
}

async function interceptFetch(input,init={}){
  const url=requestUrl(input);
  if(!/\/api\/chess(?:\?|$)/.test(url))return nativeFetch(input,init);
  const action=new URL(url,location.href).searchParams.get('action');

  if(action==='join')return routed('claim',init);
  if(action==='move'&&actualGame?.status==='active_ai')return routed('move',init);
  if(action==='resign'&&actualGame?.status==='active_ai')return routed('resign',init);

  const response=await nativeFetch(input,init);
  let data;try{data=await response.clone().json()}catch{return response}
  if(data?.token&&data.color==='white')creatorToken=data.token;

  if(action==='create'&&response.ok&&data?.game&&document.getElementById('novaAiTakeover')?.checked){
    const enabled=await callAi('enable',{id:data.game.id,token:data.token});
    data.game=enabled.game;
    track(data.game);recoverToken(data.game);
    return jsonResponse(response,publicData(data));
  }

  if(data?.game){track(data.game);recoverToken(data.game)}
  return data?.game?.status==='active_ai'?jsonResponse(response,publicData(data)):response;
}

async function routed(action,init){
  const response=await nativeFetch(aiUrl(action),{...init,method:'POST'});
  let data;try{data=await response.clone().json()}catch{return response}
  if(data?.game){track(data.game);recoverToken(data.game)}
  return data?.game?.status==='active_ai'?jsonResponse(response,publicData(data)):jsonResponse(response,data);
}

function requestUrl(input){return typeof input==='string'?input:input instanceof URL?input.href:input?.url||''}
function aiUrl(action){const url=new URL('../api/chess-ai',location.href);url.searchParams.set('action',action);return url}
function publicData(data){const copy=structuredClone(data);copy.game.status='active';copy.game.blackName='Nova AI';return copy}
function jsonResponse(response,data){const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.delete('Content-Length');return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers})}
async function callAi(action,body){const response=await nativeFetch(aiUrl(action),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`AI command failed (${response.status}).`);return data}

function track(game){
  const previous=actualGame?.status;actualGame=structuredClone(game);
  if(previous==='active_ai'&&game.status==='active'&&!handoff){handoff=true;cancelAi();announce('Challenger detected. Transferring command of the Black Glass Fleet.');toast('Human challenger has taken over Black.','success')}
  if(game.status==='active_ai'){handoff=false;scheduleAi()}else cancelAi();
}
function recoverToken(game){if(creatorToken||!game?.code)return;try{const session=JSON.parse(localStorage.getItem(`novaChessSession:${game.code}`)||'null');if(session?.color==='white')creatorToken=session.token}catch{}}
function scheduleAi(){if(!actualGame||actualGame.status!=='active_ai'||actualGame.currentTurn!=='black'||!creatorToken||aiBusy||lastRevision===Number(actualGame.revision))return;lastRevision=Number(actualGame.revision);const ticket=++generation;clearTimeout(aiTimer);announce('I am calculating a response while the challenger seat remains open.');aiTimer=setTimeout(()=>makeAiMove(ticket),900+Math.random()*900)}
function cancelAi(){generation++;clearTimeout(aiTimer);aiTimer=null;aiBusy=false}

async function makeAiMove(ticket){
  if(ticket!==generation||aiBusy||actualGame?.status!=='active_ai'||actualGame.currentTurn!=='black'||!creatorToken)return;
  aiBusy=true;decorate();
  try{
    const source=actualGame.state||{},engine=new Chess(source.fen);if(engine.turn()!=='b'||engine.isGameOver())return;
    const choice=chooseMove(engine);if(!choice)return;
    const made=engine.move({from:choice.from,to:choice.to,promotion:choice.promotion}),captured={white:[...(source.captured?.white||[])],black:[...(source.captured?.black||[])]};
    if(made.captured)captured.black.push(made.captured);
    const record={ply:(source.moves?.length||0)+1,color:'black',notation:made.san,from:made.from,to:made.to,piece:made.piece,captured:made.captured||null,promotion:made.promotion||null,at:new Date().toISOString()};
    if(actualGame.mode==='trideck'){record.fromBoard=boardFor(made.from);record.toBoard=boardFor(made.to)}
    const winner=winnerOf(engine),snapshot={...source,version:actualGame.mode==='trideck'?6:1,fen:engine.fen(),moves:[...(source.moves||[]),record],captured,lastMove:actualGame.mode==='trideck'?{...record}:{from:made.from,to:made.to,notation:made.san},winner};
    const data=await callAi('move',{id:actualGame.id,token:creatorToken,revision:Number(actualGame.revision),mode:actualGame.mode,state:snapshot,move:record,nextTurn:engine.turn()==='w'?'white':'black',gameOver:engine.isGameOver(),winner,asAi:true});
    track(data.game);announce(`Move ${made.san} complete. The challenger seat is still open.`);toast(`Nova AI played ${made.san}.`,'success');setTimeout(()=>document.getElementById('refreshButton')?.click(),80);
  }catch(error){
    if(/claimed|no longer controls|board changed/i.test(error.message)){announce('Human command authority confirmed. My move has been cancelled.');setTimeout(()=>document.getElementById('refreshButton')?.click(),80)}
    else{console.error('Nova AI move error',error);announce('My tactical processor paused. Use Sync to retry.');toast(error.message,'error')}
  }finally{aiBusy=false;decorate()}
}

function chooseMove(engine){
  const legal=engine.moves({verbose:true});let best=-Infinity,choices=[];
  for(const move of legal){const game=new Chess(engine.fen());game.move({from:move.from,to:move.to,promotion:move.promotion});let score=evaluate(game)+(move.captured?(VALUES[move.captured]||0)*.55:0)+(move.promotion?(VALUES[move.promotion]||0)*.7:0)+(move.san.includes('+')?.3:0)+(move.san.includes('#')?1000:0)+Math.random()*.18;
    if(!game.isGameOver()){let worst=Infinity;for(const reply of game.moves({verbose:true}).slice(0,28)){const next=new Chess(game.fen());next.move({from:reply.from,to:reply.to,promotion:reply.promotion});worst=Math.min(worst,evaluate(next))}if(Number.isFinite(worst))score=score*.68+worst*.32}
    if(score>best+.04){best=score;choices=[move]}else if(Math.abs(score-best)<=.04)choices.push(move)
  }
  return choices[Math.floor(Math.random()*choices.length)];
}
function evaluate(game){if(game.isCheckmate())return game.turn()==='w'?100000:-100000;if(game.isDraw())return 0;let score=0;for(const row of game.board())for(const piece of row)if(piece)score+=(piece.color==='b'?1:-1)*(VALUES[piece.type]||0);if(game.inCheck())score+=game.turn()==='w'?.38:-.38;return score}
function winnerOf(game){if(!game.isGameOver())return null;if(game.isCheckmate())return game.turn()==='w'?'black':'white';return'draw'}
function boardFor(square){const file=square[0],rank=Number(square.slice(1));if(rank>=7)return'VD';if(rank<=2)return'SD';return['a','b','c','d'].includes(file)?'NP':'NS'}

function decorate(){const active=actualGame?.status==='active_ai',card=document.getElementById('blackPlayerCard');card?.classList.toggle('ai-command',active);if(!active)return;const name=document.getElementById('blackPlayerName'),status=document.getElementById('blackPlayerStatus'),gameStatus=document.getElementById('gameStatus');if(name)name.textContent='Nova AI';if(status)status.textContent=actualGame.currentTurn==='black'?(aiBusy?'Calculating':'AI turn'):'Seat open';if(gameStatus)gameStatus.textContent=actualGame.currentTurn==='black'?'Nova AI is calculating':'Your command turn · human challenger may join'}
function announce(text){const panel=document.getElementById('novaMessage');if(panel)panel.innerHTML=`<span class="nova-avatar">N</span><p><strong>Nova:</strong> ${escapeHtml(text)}</p>`}
function toast(message,type=''){const stack=document.getElementById('toastStack');if(!stack)return;const item=document.createElement('div');item.className=`toast ${type}`;item.textContent=message;stack.append(item);setTimeout(()=>item.remove(),4200)}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
