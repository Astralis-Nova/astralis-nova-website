(()=>{
'use strict';

const VERSION=6;
const SAVE_KEY='astralisTriDGameV2';
const MAIN_IDS=['U','M','L'];
const BOARD_ORDER=['A1','U','A2','M','B1','L','B2'];
const SIZE={U:8,M:8,L:8,A1:2,A2:2,B1:2,B2:2};
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const NAMES={k:'King',q:'Queen',r:'Rook',b:'Bishop',n:'Knight',p:'Pawn'};
const VALUES={p:1,n:3,b:3,r:5,q:9,k:100};

const statusEl=document.getElementById('gameStatus');
const newGameBtn=document.getElementById('newGame');
const novaBtn=document.getElementById('novaToggle');
const flipBtn=document.getElementById('flipBoard');
const scene=document.getElementById('scene');
const cells=new Map();

const boardHosts={
  A1:[document.getElementById('A1')],
  U:[document.getElementById('U')],
  A2:[document.getElementById('A2')],
  M:[document.getElementById('M-left'),document.getElementById('M-right')],
  B1:[document.getElementById('B1')],
  L:[document.getElementById('L')],
  B2:[document.getElementById('B2')],
};

for(const id of BOARD_ORDER){
  const hosts=(boardHosts[id]||[]).filter(Boolean);if(!hosts.length)continue;
  hosts.forEach(host=>host.replaceChildren());
  const size=SIZE[id];
  for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const rank=size-row;
    const local=`${String.fromCharCode(65+col)}${rank}`;
    const key=`${id}:${local}`;
    const el=document.createElement('button');
    el.type='button';el.className='sq';el.dataset.cell=key;el.setAttribute('aria-label',`${id} ${local}`);
    el.classList.add((row+col)%2===0?'light':'dark');
    if(id==='M'){
      const host=col<4?hosts[0]:hosts[1];
      host?.appendChild(el);
    }else hosts[0].appendChild(el);
    cells.set(key,{key,board:id,row,col,rank,local,el});
  }
}

function initialPieces(){
  const p={};
  const put=(board,file,rank,color,type)=>p[`${board}:${file}${rank}`]={color,type,moved:false};
  const back=['r','n','b','q','k','b','n','r'];
  const files='ABCDEFGH';
  for(let i=0;i<8;i++){
    put('L',files[i],1,'w',back[i]);put('L',files[i],2,'w','p');
    put('U',files[i],8,'b',back[i]);put('U',files[i],7,'b','p');
  }
  return p;
}
function freshState(nova=true){return{version:VERSION,ruleset:'Astralis 8x8 Tri-D',pieces:initialPieces(),turn:'w',selected:null,legal:[],lastMove:null,novaBlack:nova,gameOver:false,winner:null,orientation:'white',ply:0}}
let state=freshState(true);

function pieceAt(key,s=state){return s.pieces[key]||null}
function opponent(c){return c==='w'?'b':'w'}
function cellAt(board,row,col){
  if(row<0||row>=SIZE[board]||col<0||col>=SIZE[board])return null;
  const rank=SIZE[board]-row;
  return cells.get(`${board}:${String.fromCharCode(65+col)}${rank}`)||null;
}
function addMove(out,from,target,piece){
  if(!target)return false;
  const occ=pieceAt(target.key);
  if(!occ){out.push({from,to:target.key});return true}
  if(occ.color!==piece.color)out.push({from,to:target.key,capture:target.key});
  return false;
}
function rayMoves(from,piece,dirs){
  const out=[];
  for(const[dr,dc]of dirs){
    for(let step=1;step<8;step++){
      const t=cellAt(from.board,from.row+dr*step,from.col+dc*step);if(!t)break;
      if(!addMove(out,from.key,t,piece))break;
    }
  }
  return out;
}
function verticalMoves(from,piece){
  if(piece.type==='p')return[];
  const out=[],i=MAIN_IDS.indexOf(from.board);if(i<0)return out;
  for(const j of[i-1,i+1]){
    const board=MAIN_IDS[j];if(!board)continue;
    const t=cellAt(board,from.row,from.col);if(t)addMove(out,from.key,t,piece);
  }
  return out;
}
function legalMovesForCell(key){
  const piece=pieceAt(key),from=cells.get(key);if(!piece||!from||!MAIN_IDS.includes(from.board))return[];
  const out=[];
  if(piece.type==='p'){
    const dir=piece.color==='w'?-1:1;
    const one=cellAt(from.board,from.row+dir,from.col);
    if(one&&!pieceAt(one.key)){
      out.push({from:key,to:one.key});
      const startRow=piece.color==='w'?6:1,two=cellAt(from.board,from.row+2*dir,from.col);
      if(from.row===startRow&&two&&!pieceAt(two.key))out.push({from:key,to:two.key});
    }
    for(const dc of[-1,1]){
      const t=cellAt(from.board,from.row+dir,from.col+dc);
      if(t&&pieceAt(t.key)&&pieceAt(t.key).color!==piece.color)out.push({from:key,to:t.key,capture:t.key});
    }
    return out;
  }
  if(piece.type==='n'){
    for(const[dr,dc]of[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]])addMove(out,key,cellAt(from.board,from.row+dr,from.col+dc),piece);
  }
  if(piece.type==='b'||piece.type==='q')out.push(...rayMoves(from,piece,[[1,1],[1,-1],[-1,1],[-1,-1]]));
  if(piece.type==='r'||piece.type==='q')out.push(...rayMoves(from,piece,[[1,0],[-1,0],[0,1],[0,-1]]));
  if(piece.type==='k')for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)addMove(out,key,cellAt(from.board,from.row+dr,from.col+dc),piece);
  out.push(...verticalMoves(from,piece));
  return out;
}

function render(){
  for(const[key,cell]of cells){
    const el=cell.el;el.replaceChildren();el.classList.remove('selected','legal','capture','last');
    if(state.selected===key)el.classList.add('selected');
    const legal=state.legal.find(m=>m.to===key);if(legal)el.classList.add(legal.capture?'capture':'legal');
    if(state.lastMove&&(state.lastMove.from===key||state.lastMove.to===key))el.classList.add('last');
    const p=pieceAt(key);if(!p)continue;
    const token=document.createElement('span');token.className=`piece ${p.color==='w'?'crystal':'sapphire'} piece-${p.type}`;token.dataset.glyph=SYMBOLS[p.color][p.type];token.textContent=SYMBOLS[p.color][p.type];token.setAttribute('role','img');token.setAttribute('aria-label',`${p.color==='w'?'White':'Black'} ${NAMES[p.type]}`);el.appendChild(token);
  }
  novaBtn?.classList.toggle('active',state.novaBlack);if(novaBtn)novaBtn.textContent=`Nova Black: ${state.novaBlack?'ON':'OFF'}`;
  scene?.classList.toggle('flipped',state.orientation==='black');
}
function setStatus(text){if(statusEl)statusEl.textContent=text}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({...state,selected:null,legal:[]}))}
function load(){
  try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s?.version===VERSION&&s.pieces){state={...freshState(Boolean(s.novaBlack)),...s,selected:null,legal:[]};return true}}catch{}
  return false;
}
function movePiece(move){
  const p=pieceAt(move.from);if(!p)return;
  delete state.pieces[move.from];if(move.capture)delete state.pieces[move.capture];p.moved=true;
  const target=cells.get(move.to);if(p.type==='p'&&((p.color==='w'&&target.rank===8)||(p.color==='b'&&target.rank===1)))p.type='q';
  state.pieces[move.to]=p;state.turn=opponent(p.color);state.lastMove={kind:'piece',from:move.from,to:move.to,capture:move.capture||null,piece:p.type,color:p.color};state.selected=null;state.legal=[];state.ply++;
  save();render();setStatus(`${p.color==='w'?'White':'Black'} ${NAMES[p.type]} moved to ${move.to}. ${state.turn==='w'?'White':'Black'} to move.`);
  if(state.novaBlack&&state.turn==='b')setTimeout(makeNovaMove,420);
}
function handleCell(key){
  if(state.gameOver||state.novaBlack&&state.turn==='b')return;
  const chosen=state.legal.find(m=>m.to===key);if(state.selected&&chosen){movePiece(chosen);return}
  const p=pieceAt(key);
  if(p?.color===state.turn){state.selected=key;state.legal=legalMovesForCell(key);render();setStatus(`${NAMES[p.type]} selected. ${state.legal.length} legal destination${state.legal.length===1?'':'s'}.`)}
  else{state.selected=null;state.legal=[];render()}
}
function allMoves(color){const out=[];for(const[key,p]of Object.entries(state.pieces))if(p.color===color)out.push(...legalMovesForCell(key));return out}
function makeNovaMove(){
  if(!state.novaBlack||state.turn!=='b'||state.gameOver)return;
  const moves=allMoves('b');if(!moves.length){setStatus('Nova has no legal move.');return}
  let best=[],score=-1;
  for(const m of moves){const target=pieceAt(m.capture||m.to),s=(target?VALUES[target.type]*10:0)+Math.random()*3;if(s>score){score=s;best=[m]}else if(Math.abs(s-score)<.01)best.push(m)}
  movePiece(best[Math.floor(Math.random()*best.length)]);
}
function resetGame(){state=freshState(state.novaBlack);save();render();setStatus('New 8×8 Tri-D game. White to move.')}
function toggleNova(){state.novaBlack=!state.novaBlack;save();render();setStatus(state.novaBlack?'Nova will command Black.':'Two-player local mode.');if(state.novaBlack&&state.turn==='b')setTimeout(makeNovaMove,300)}
function flip(){state.orientation=state.orientation==='white'?'black':'white';save();render()}

for(const[key,cell]of cells)cell.el.addEventListener('click',()=>handleCell(key));
newGameBtn?.addEventListener('click',resetGame);novaBtn?.addEventListener('click',toggleNova);flipBtn?.addEventListener('click',flip);
const restored=load();render();setStatus(restored?`8×8 Tri-D game restored. ${state.turn==='w'?'White':'Black'} to move.`:'8×8 Tri-D board ready. Full 32-piece set loaded. Split middle deck online. White to move.');
if(state.novaBlack&&state.turn==='b')setTimeout(makeNovaMove,420);
})();
