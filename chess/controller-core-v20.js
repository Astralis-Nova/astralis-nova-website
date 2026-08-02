import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const BUILD='v20';
const LOCAL_KEY='novaChessLocalV20';
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
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

const core={
  onHumanMove:null,
  canHumanMove:null,
  get game(){return game},
  get lastMove(){return lastMove},
  get orientation(){return orientation},
  get busy(){return busy||aiThinking},
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
};

window.NovaChessCore=core;
window.dispatchEvent(new CustomEvent('nova-chess-core-ready'));

function setStatus(message,type=''){
  statusEl.textContent=message;
  statusEl.className=`status ${type}`.trim();
}

function ordered(values){return orientation==='white'?values:[...values].reverse()}
function turnName(){return game.turn()==='w'?'white':'black'}
function boardFor(square){
  const rank=Number(square[1]);
  if(rank>=7)return'VD';
  if(rank<=2)return'SD';
  return['a','b','c','d'].includes(square[0])?'NP':'NS';
}
function clearSelection(){selected=null;legal=[]}

function render(){
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
      if(lastMove&&(lastMove.from===square||lastMove.to===square))button.classList.add('last');
      const route=legal.find(move=>move.to===square);
      if(route)button.classList.add(route.captured?'capture':'legal');
      button.innerHTML=`<span class="coord">${square.toUpperCase()}</span>${piece?`<span class="piece">${SYMBOLS[piece.color][piece.type]}</span>`:''}`;
      button.addEventListener('pointerup',event=>{
        event.preventDefault();
        event.stopPropagation();
        void handleSquare(square);
      });
      board.append(button);
    }
  }
  selectedReadout.textContent=selected
    ?`Selected: ${selected.toUpperCase()} · legal: ${legal.map(move=>move.to.toUpperCase()).join(', ')||'none'}`
    :'Selected: none';
  renderMoves();
}

function renderMoves(){
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

  const permitted=typeof core.canHumanMove==='function'
    ?core.canHumanMove()
    :game.turn()==='w';
  if(!permitted)return setStatus(onlineMode?'This online turn belongs to the other commander.':'Nova currently controls Black.','busy');

  const destination=legal.find(move=>move.to===square);
  if(selected&&destination){
    await commitHumanMove(selected,square,destination);
    return;
  }

  const piece=game.get(square);
  if(piece?.color===game.turn()){
    selected=square;
    legal=game.moves({square,verbose:true});
    setStatus(
      legal.length
        ?`${square.toUpperCase()} selected. Choose ${legal.map(move=>move.to.toUpperCase()).join(', ')}.`
        :`${square.toUpperCase()} is blocked.`,
      legal.length?'good':'bad'
    );
  }else{
    clearSelection();
    setStatus(`Select one of your ${turnName()} pieces.`,'');
  }
  render();
}

async function commitHumanMove(from,to,destination){
  const previous={pgn:game.pgn(),lastMove};
  let made;
  try{
    made=game.move({from,to,promotion:destination.promotion||'q'});
  }catch(error){
    clearSelection();
    setStatus(`Move failed: ${error.message}`,'bad');
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
  setStatus(`White played ${made.san}. Nova is calculating…`,'good');
  window.setTimeout(makeLocalAiMove,520);
}

function snapshot(){
  return{
    version:20,
    fen:game.fen(),
    pgn:game.pgn(),
    lastMove,
    moves:game.history({verbose:true}).map(move=>({
      color:move.color==='w'?'white':'black',
      from:move.from,
      to:move.to,
      notation:move.san,
      piece:move.piece,
      captured:move.captured||null,
      promotion:move.promotion||null
    })),
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
    let score=(move.captured?(VALUES[move.captured]||0)*10:0)
      +(move.promotion?(VALUES[move.promotion]||0)*5:0)
      +(move.san.includes('+')?2:0)
      +Math.random();
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
  const made=game.move({from:choice.from,to:choice.to,promotion:choice.promotion||'q'});
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
  else setStatus(`Nova played ${made?.san||'a move'}. White to move.`,'good');
}

function saveLocal(){
  if(onlineMode)return;
  try{
    localStorage.setItem(LOCAL_KEY,JSON.stringify({
      build:BUILD,
      ...snapshot(),
      orientation,
      savedAt:new Date().toISOString()
    }));
    saveReadout.textContent=`Local autosave: ${new Date().toLocaleTimeString()}`;
  }catch(error){
    saveReadout.textContent='Local autosave unavailable';
    console.warn(error);
  }
}

function restoreLocal(){
  try{
    const saved=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');
    if(!saved)return false;
    if(!loadState(saved))return false;
    orientation=saved.orientation==='black'?'black':'white';
    saveReadout.textContent='Local autosave: restored';
    render();
    return true;
  }catch(error){
    console.warn(error);
    return false;
  }
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
  setStatus('New local game. White to move.','good');
  render();
}

function winner(){
  if(!game.isGameOver())return null;
  if(game.isCheckmate())return game.turn()==='w'?'black':'white';
  return'draw';
}

function finishStatus(){
  if(game.isCheckmate())setStatus(game.turn()==='w'?'Black wins by checkmate.':'White wins by checkmate.','good');
  else setStatus('Game ended in a draw.','good');
}

document.getElementById('flip')?.addEventListener('click',()=>{
  orientation=orientation==='white'?'black':'white';
  saveLocal();
  render();
});

window.addEventListener('beforeunload',saveLocal);
window.addEventListener('error',event=>setStatus(`Controller error: ${event.message}`,'bad'));
window.addEventListener('unhandledrejection',event=>setStatus(`Controller error: ${event.reason?.message||event.reason}`,'bad'));

if(!restoreLocal())setStatus('Local game ready. White to move.','good');
else if(game.turn()==='b')window.setTimeout(makeLocalAiMove,450);
render();
