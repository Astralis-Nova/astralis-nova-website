import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const BUILD='v29';
const LOCAL_KEY='novaChessLocalV20';
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const PIECE_NAMES={k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};
const FILES=['a','b','c','d','e','f','g','h'];
const BOARDS={VD:{files:FILES,ranks:[8,7]},NP:{files:['a','b','c','d'],ranks:[6,5,4,3]},NS:{files:['e','f','g','h'],ranks:[6,5,4,3]},SD:{files:FILES,ranks:[2,1]}};
const VALUES={p:1,n:3.1,b:3.25,r:5,q:9,k:0};

const statusEl=document.getElementById('status');
const moveList=document.getElementById('moves');
const selectedReadout=document.getElementById('selectedReadout');
const saveReadout=document.getElementById('saveReadout');

let game=new Chess();
let selected=null;
let legal=[];
let orientation='white';
let lastMove=null;
let busy=false;
let aiThinking=false;
let onlineMode=false;

installRuleStyles();
const ruleAudit=runRuleAudit();

const core={
  onHumanMove:null,
  canHumanMove:null,
  get game(){return game},
  get lastMove(){return lastMove},
  get orientation(){return orientation},
  get busy(){return busy||aiThinking},
  get ruleAudit(){return ruleAudit},
  setStatus,
  render,
  snapshot,
  loadState,
  rollback,
  setBusy(value){busy=Boolean(value);render()},
  setOnlineMode(value){onlineMode=Boolean(value)},
  setLastMove(value){lastMove=value||null},
  chooseAiMove,
  applyAiMove,
  saveLocal,
  resetLocal,
  boardFor,
  winner,
  checkNotice,
  resultReason,
};

window.NovaChessCore=core;
window.dispatchEvent(new CustomEvent('nova-chess-core-ready'));

function installRuleStyles(){
  if(document.getElementById('novaRuleStyles'))return;
  const style=document.createElement('style');
  style.id='novaRuleStyles';
  style.textContent=`
    .sq.check{outline:4px solid #ff607d;outline-offset:-4px;animation:nova-check-pulse 1.05s ease-in-out infinite;z-index:5}
    .sq.check .coord{color:#fff!important;background:#b20d32;border-radius:4px;padding:2px;text-shadow:none!important}
    @keyframes nova-check-pulse{0%,100%{filter:none}50%{filter:drop-shadow(0 0 11px #ff607d)}}
    .promotion-shade{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;padding:18px;background:rgba(0,4,14,.78)}
    .promotion-card{width:min(410px,100%);padding:18px;border:1px solid rgba(126,234,255,.78);border-radius:16px;background:linear-gradient(180deg,#0b2240,#040c1b);box-shadow:0 22px 70px #000,0 0 30px rgba(79,218,255,.23);text-align:center}
    .promotion-card h2{margin:0;color:#79eaff;font-size:1.1rem}.promotion-card p{margin:7px 0 14px;color:#bed5e8;font-size:.76rem}
    .promotion-choices{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.promotion-choice{min-height:72px;border:1px solid #83eaff;border-radius:11px;background:#10375e;color:#fff;cursor:pointer;font:900 2rem/1 serif}.promotion-choice small{display:block;margin-top:3px;font:800 .55rem/1.1 Inter,system-ui,sans-serif;text-transform:uppercase;color:#ccecff}
  `;
  document.head.append(style);
}

function setStatus(message,type=''){
  if(!statusEl)return;
  statusEl.textContent=message;
  statusEl.className=`status ${type}`.trim();
}

function ordered(values){return orientation==='white'?values:[...values].reverse()}
function turnName(){return game.turn()==='w'?'white':'black'}
function capitalize(value){return value.charAt(0).toUpperCase()+value.slice(1)}
function boardFor(square){
  const rank=Number(square[1]);
  if(rank>=7)return'VD';
  if(rank<=2)return'SD';
  return['a','b','c','d'].includes(square[0])?'NP':'NS';
}
function clearSelection(){selected=null;legal=[]}

function findKingSquare(color){
  for(const file of FILES)for(let rank=1;rank<=8;rank+=1){
    const square=`${file}${rank}`;
    const piece=game.get(square);
    if(piece?.type==='k'&&piece.color===color)return square;
  }
  return null;
}

function legalReplyText(limit=8){
  const replies=[];
  const seen=new Set();
  for(const move of game.moves({verbose:true})){
    const label=formatMoveRoute(move);
    if(seen.has(label))continue;
    seen.add(label);
    replies.push(label);
    if(replies.length>=limit)break;
  }
  return replies.join(', ')||'none';
}

function formatMoveRoute(move){
  let label=`${move.from.toUpperCase()}→${move.to.toUpperCase()}`;
  if(move.flags?.includes('k'))label+=' castle';
  else if(move.flags?.includes('q'))label+=' castle';
  else if(move.flags?.includes('e'))label+=' en passant';
  else if(move.promotion)label+=`=${move.promotion.toUpperCase()}`;
  return label;
}

function checkNotice(prefix=''){
  if(!game.isCheck())return prefix;
  return `${prefix}${capitalize(turnName())} king is in check. Legal replies: ${legalReplyText()}.`;
}

function render(){
  const checkedKing=game.isCheck()?findKingSquare(game.turn()):null;
  for(const [id,layout] of Object.entries(BOARDS)){
    const board=document.getElementById(id);
    if(!board)continue;
    board.replaceChildren();
    for(const rank of ordered(layout.ranks))for(const file of ordered(layout.files)){
      const square=`${file}${rank}`;
      const piece=game.get(square);
      const button=document.createElement('button');
      button.type='button';
      button.className=`sq ${(FILES.indexOf(file)+rank)%2===0?'dark':'light'}`;
      button.dataset.square=square;
      if(selected===square)button.classList.add('selected');
      if(checkedKing===square)button.classList.add('check');
      if(lastMove&&(lastMove.from===square||lastMove.to===square))button.classList.add('last');
      const routes=legal.filter(move=>move.to===square);
      if(routes.length)button.classList.add(routes.some(move=>move.captured)?'capture':'legal');
      button.innerHTML=`<span class="coord">${square.toUpperCase()}</span>${piece?`<span class="piece">${SYMBOLS[piece.color][piece.type]}</span>`:''}`;
      button.addEventListener('pointerup',event=>{
        event.preventDefault();
        event.stopPropagation();
        void handleSquare(square);
      });
      board.append(button);
    }
  }
  if(selectedReadout){
    selectedReadout.textContent=selected
      ?`Selected: ${selected.toUpperCase()} · legal: ${uniqueDestinationText()||'none'}`
      :game.isCheck()
        ?`CHECK · legal replies: ${legalReplyText()}`
        :'Selected: none';
  }
  renderMoves();
}

function uniqueDestinationText(){
  const seen=new Set();
  return legal.map(move=>formatMoveRoute(move)).filter(value=>!seen.has(value)&&seen.add(value)).join(', ');
}

function renderMoves(){
  if(!moveList)return;
  const history=game.history();
  moveList.replaceChildren();
  if(!history.length){
    const li=document.createElement('li');
    li.textContent='No moves yet.';
    moveList.append(li);
    return;
  }
  for(let index=0;index<history.length;index+=2){
    const li=document.createElement('li');
    li.textContent=`${Math.floor(index/2)+1}. ${history[index]||''}${history[index+1]?`  ${history[index+1]}`:''}`;
    moveList.append(li);
  }
}

async function handleSquare(square){
  if(busy)return setStatus('The mission archive is confirming the previous command.','busy');
  if(aiThinking)return setStatus('Nova is calculating Black’s response.','busy');
  if(game.isGameOver())return finishStatus();

  const permitted=typeof core.canHumanMove==='function'?core.canHumanMove():game.turn()==='w';
  if(!permitted)return setStatus(onlineMode?'This online turn belongs to the other commander.':'Nova currently controls Black.','busy');

  const destinations=legal.filter(move=>move.to===square);
  if(selected&&destinations.length){
    const destination=await resolveDestination(destinations);
    if(destination)await commitHumanMove(selected,square,destination);
    return;
  }

  const piece=game.get(square);
  if(piece?.color===game.turn()){
    selected=square;
    legal=game.moves({square,verbose:true});
    if(legal.length){
      const choices=uniqueDestinationText();
      setStatus(game.isCheck()?`${square.toUpperCase()} can answer the check. Choose ${choices}.`:`${capitalize(PIECE_NAMES[piece.type])} on ${square.toUpperCase()} selected. Choose ${choices}.`,'good');
    }else if(game.isCheck()){
      setStatus(`${capitalize(turnName())} king is in check. ${square.toUpperCase()} cannot answer it. Legal replies: ${legalReplyText()}.`,'bad');
    }else{
      setStatus(`${capitalize(PIECE_NAMES[piece.type])} on ${square.toUpperCase()} has no legal move. It may be blocked or pinned to the king.`,'bad');
    }
  }else{
    clearSelection();
    setStatus(game.isCheck()?checkNotice():`Select one of your ${turnName()} pieces.`,game.isCheck()?'bad':'');
  }
  render();
}

async function resolveDestination(destinations){
  const promotions=destinations.filter(move=>move.promotion);
  if(promotions.length<=1)return destinations[0];
  const promotion=await choosePromotion(game.turn(),promotions.map(move=>move.promotion));
  return promotions.find(move=>move.promotion===promotion)||null;
}

function choosePromotion(color,available){
  return new Promise(resolve=>{
    const choices=['q','r','b','n'].filter(type=>available.includes(type));
    const shade=document.createElement('div');
    shade.className='promotion-shade';
    shade.innerHTML=`<section class="promotion-card" role="dialog" aria-modal="true" aria-label="Choose promotion piece"><h2>Promote the pawn</h2><p>FIDE rules allow a queen, rook, bishop, or knight. The new piece takes effect immediately.</p><div class="promotion-choices"></div></section>`;
    const holder=shade.querySelector('.promotion-choices');
    for(const type of choices){
      const button=document.createElement('button');
      button.type='button';
      button.className='promotion-choice';
      button.innerHTML=`${SYMBOLS[color][type]}<small>${PIECE_NAMES[type]}</small>`;
      button.addEventListener('click',()=>{shade.remove();resolve(type)},{once:true});
      holder.append(button);
    }
    shade.addEventListener('click',event=>{if(event.target===shade){shade.remove();resolve(null)}},{once:true});
    document.body.append(shade);
    holder.querySelector('button')?.focus();
  });
}

async function commitHumanMove(from,to,destination){
  const previous={pgn:game.pgn(),lastMove};
  let made;
  try{
    made=game.move({from,to,...(destination.promotion?{promotion:destination.promotion}:{})});
  }catch(error){
    clearSelection();
    setStatus(`Illegal move rejected: ${error.message}`,'bad');
    render();
    return;
  }

  lastMove={from:made.from,to:made.to,notation:made.san};
  clearSelection();
  render();

  if(typeof core.onHumanMove==='function'){
    await core.onHumanMove(made,previous);
    return;
  }

  saveLocal();
  if(game.isGameOver())return finishStatus();
  setStatus(`White played ${moveDescription(made)}. Nova is calculating…`,'good');
  window.setTimeout(makeLocalAiMove,520);
}

function moveDescription(move){
  if(move.flags?.includes('k'))return`${move.san} (kingside castling)`;
  if(move.flags?.includes('q'))return`${move.san} (queenside castling)`;
  if(move.flags?.includes('e'))return`${move.san} (en passant)`;
  if(move.promotion)return`${move.san} (promoted to ${PIECE_NAMES[move.promotion]})`;
  return move.san;
}

function snapshot(){
  return{
    version:29,
    fen:game.fen(),
    pgn:game.pgn(),
    lastMove,
    moves:game.history({verbose:true}).map(move=>({
      color:move.color==='w'?'white':'black',from:move.from,to:move.to,notation:move.san,piece:move.piece,
      captured:move.captured||null,promotion:move.promotion||null,flags:move.flags
    })),
    result:resultReason(game),
    updatedAt:new Date().toISOString()
  };
}

function loadState(state){
  const next=new Chess();
  try{
    if(state?.pgn)next.loadPgn(state.pgn);
    else if(state?.fen)next.load(state.fen);
    game=next;
    lastMove=state?.lastMove||null;
    clearSelection();
    render();
    return true;
  }catch(error){
    console.error('Position load failed',error);
    return false;
  }
}

function rollback(previous){
  const next=new Chess();
  if(previous?.pgn)next.loadPgn(previous.pgn);
  game=next;
  lastMove=previous?.lastMove||null;
  clearSelection();
  render();
}

function chooseAiMove(){
  const moves=game.moves({verbose:true});
  let best=-Infinity;
  let candidates=[];
  for(const move of moves){
    let score=(move.captured?(VALUES[move.captured]||0)*10:0)+(move.promotion?(VALUES[move.promotion]||0)*5:0)+(move.san.includes('+')?2:0)+Math.random();
    if(['d4','e4','d5','e5'].includes(move.to))score+=1.2;
    if(score>best+.05){best=score;candidates=[move]}
    else if(Math.abs(score-best)<=.05)candidates.push(move);
  }
  return candidates[Math.floor(Math.random()*candidates.length)]||moves[0]||null;
}

function applyAiMove(){
  if(game.turn()!=='b'||game.isGameOver())return null;
  const choice=chooseAiMove();
  if(!choice)return null;
  const made=game.move({from:choice.from,to:choice.to,...(choice.promotion?{promotion:choice.promotion}:{})});
  lastMove={from:made.from,to:made.to,notation:made.san};
  render();
  return made;
}

function makeLocalAiMove(){
  if(onlineMode||game.turn()!=='b'||game.isGameOver())return;
  aiThinking=true;
  setStatus('Nova is calculating Black’s reply…','busy');
  const made=applyAiMove();
  aiThinking=false;
  saveLocal();
  if(game.isGameOver())finishStatus();
  else if(game.isCheck())setStatus(checkNotice(`Nova played ${moveDescription(made)}. `),'bad');
  else setStatus(`Nova played ${moveDescription(made)}. White to move.`,'good');
}

function saveLocal(){
  if(onlineMode)return;
  try{
    localStorage.setItem(LOCAL_KEY,JSON.stringify({build:BUILD,...snapshot(),orientation,savedAt:new Date().toISOString()}));
    if(saveReadout)saveReadout.textContent=`Local autosave: ${new Date().toLocaleTimeString()}`;
  }catch(error){
    if(saveReadout)saveReadout.textContent='Local autosave unavailable';
    console.warn(error);
  }
}

function restoreLocal(){
  try{
    const saved=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');
    if(!saved)return false;
    if(!loadState(saved))return false;
    orientation=saved.orientation==='black'?'black':'white';
    if(saveReadout)saveReadout.textContent='Local autosave: restored';
    render();
    return true;
  }catch(error){console.warn(error);return false}
}

function resetLocal(){
  onlineMode=false;
  core.onHumanMove=null;
  core.canHumanMove=null;
  game=new Chess();
  clearSelection();
  lastMove=null;
  busy=false;
  aiThinking=false;
  saveLocal();
  setStatus('New regulation game. White to move.','good');
  render();
}

function winner(){
  if(!game.isGameOver())return null;
  if(game.isCheckmate())return game.turn()==='w'?'black':'white';
  return'draw';
}

function resultReason(position=game){
  if(position.isCheckmate())return'checkmate';
  if(position.isStalemate())return'stalemate';
  if(position.isInsufficientMaterial())return'insufficient_material';
  if(position.isThreefoldRepetition())return'threefold_repetition';
  if(position.isDrawByFiftyMoves())return'fifty_move_rule';
  if(position.isDraw())return'draw';
  return null;
}

function finishStatus(){
  if(game.isCheckmate())return setStatus(game.turn()==='w'?'Black wins by checkmate.':'White wins by checkmate.','good');
  if(game.isStalemate())return setStatus('Draw by stalemate: the player to move has no legal move and is not in check.','good');
  if(game.isInsufficientMaterial())return setStatus('Draw by dead position: neither side has enough material to checkmate.','good');
  if(game.isThreefoldRepetition())return setStatus('Draw by repeated position.','good');
  if(game.isDrawByFiftyMoves())return setStatus('Draw by the fifty-move rule.','good');
  setStatus('Game ended in a draw.','good');
}

function runRuleAudit(){
  const checks=[];
  const test=(name,fn)=>{try{checks.push({name,passed:Boolean(fn())})}catch{checks.push({name,passed:false})}};
  test('opening move count',()=>new Chess().moves().length===20);
  test('pawn one or two squares',()=>{
    const c=new Chess();const moves=c.moves({square:'e2',verbose:true}).map(m=>m.to);return moves.includes('e3')&&moves.includes('e4')&&moves.length===2;
  });
  test('knight jumps',()=>{
    const c=new Chess();const moves=c.moves({square:'g1',verbose:true}).map(m=>m.to).sort();return moves.join(',')==='f3,h3';
  });
  test('bishop blocked by own pawn',()=>new Chess().moves({square:'c1'}).length===0);
  test('castling moves rook',()=>{
    const c=new Chess();['e4','e5','Nf3','Nc6','Bc4','Nf6','O-O'].forEach(move=>c.move(move));return c.get('g1')?.type==='k'&&c.get('f1')?.type==='r';
  });
  test('en passant',()=>{
    const c=new Chess();['e4','a6','e5','d5','exd6'].forEach(move=>c.move(move));return c.get('d6')?.color==='w'&&!c.get('d5');
  });
  test('four promotion choices',()=>{
    const c=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');return c.moves({square:'a7',verbose:true}).filter(m=>m.to==='a8').length===4;
  });
  test('checkmate detection',()=>{
    const c=new Chess();['f3','e5','g4','Qh4#'].forEach(move=>c.move(move));return c.isCheckmate();
  });
  test('stalemate detection',()=>new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').isStalemate());
  return{passed:checks.every(check=>check.passed),passedCount:checks.filter(check=>check.passed).length,total:checks.length,checks};
}

document.getElementById('flip')?.addEventListener('click',()=>{
  orientation=orientation==='white'?'black':'white';
  saveLocal();
  render();
});

window.addEventListener('beforeunload',saveLocal);
window.addEventListener('error',event=>setStatus(`Controller error: ${event.message}`,'bad'));
window.addEventListener('unhandledrejection',event=>setStatus(`Controller error: ${event.reason?.message||event.reason}`,'bad'));

if(!restoreLocal())setStatus(`Regulation game ready. Rules audit ${ruleAudit.passedCount}/${ruleAudit.total}. White to move.`,'good');
else if(game.isGameOver())finishStatus();
else if(game.turn()==='b')window.setTimeout(makeLocalAiMove,450);
else if(game.isCheck())setStatus(checkNotice('Restored position. '),'bad');
render();
