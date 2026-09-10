const BOARD_DEFS={
  U:{size:4,ox:2,oy:0,z:2},
  M:{size:4,ox:2,oy:2,z:1},
  L:{size:4,ox:2,oy:4,z:0},
  A1:{size:2,ox:0,oy:0,z:3,invertY:true},
  A2:{size:2,ox:6,oy:0,z:3,invertY:true},
  B1:{size:2,ox:0,oy:6,z:-1},
  B2:{size:2,ox:6,oy:6,z:-1},
};
const BOARD_ORDER=['A1','U','A2','M','B1','L','B2'];
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const NAMES={k:'King',q:'Queen',r:'Rook',b:'Bishop',n:'Knight',p:'Pawn'};
const VALUES={p:1,n:3,b:3.2,r:5,q:9,k:100};
const SAVE_KEY='astralisTriDGameV1';

const statusEl=document.getElementById('gameStatus');
const newGameBtn=document.getElementById('newGame');
const novaBtn=document.getElementById('novaToggle');
const flipBtn=document.getElementById('flipBoard');
const scene=document.getElementById('scene');

const cells=new Map();
const columns=new Map();

for(const id of BOARD_ORDER){
  const def=BOARD_DEFS[id],host=document.getElementById(id);
  if(!host)continue;
  for(let row=0;row<def.size;row++){
    for(let col=0;col<def.size;col++){
      const rank=def.size-row;
      const local=`${String.fromCharCode(65+col)}${rank}`;
      const key=`${id}:${local}`;
      const x=def.ox+col,y=def.oy+(def.invertY?(def.size-1-row):row),z=def.z;
      const el=document.createElement('button');
      el.type='button';
      el.className='sq '+(((x+y)%2===0)?'light':'dark');
      el.dataset.cell=key;
      el.setAttribute('aria-label',`${id} ${local}`);
      host.appendChild(el);
      const cell={key,board:id,local,x,y,z,el};
      cells.set(key,cell);
      const ckey=`${x},${y}`;
      if(!columns.has(ckey))columns.set(ckey,[]);
      columns.get(ckey).push(cell);
    }
  }
}
for(const list of columns.values())list.sort((a,b)=>a.z-b.z);

function initialPieces(){
  const p={};
  const put=(cell,color,type)=>p[cell]={color,type,moved:false};
  ['A4','D4'].forEach(s=>put(`U:${s}`,'b','n'));
  ['B4','C4'].forEach(s=>put(`U:${s}`,'b','b'));
  ['A3','B3','C3','D3'].forEach(s=>put(`U:${s}`,'b','p'));
  put('A1:A1','b','r');put('A1:B1','b','q');put('A1:A2','b','p');put('A1:B2','b','p');
  put('A2:A1','b','k');put('A2:B1','b','r');put('A2:A2','b','p');put('A2:B2','b','p');
  ['A1','D1'].forEach(s=>put(`L:${s}`,'w','n'));
  ['B1','C1'].forEach(s=>put(`L:${s}`,'w','b'));
  ['A2','B2','C2','D2'].forEach(s=>put(`L:${s}`,'w','p'));
  put('B1:A1','w','r');put('B1:B1','w','q');put('B1:A2','w','p');put('B1:B2','w','p');
  put('B2:A1','w','k');put('B2:B1','w','r');put('B2:A2','w','p');put('B2:B2','w','p');
  return p;
}

let state={version:1,pieces:initialPieces(),turn:'w',selected:null,legal:[],lastMove:null,enPassant:null,novaBlack:true,gameOver:false,winner:null,orientation:'white',ply:0};
function cloneState(source=state){return JSON.parse(JSON.stringify(source))}
function pieceAt(key,s=state){return s.pieces[key]||null}
function columnAt(x,y){return columns.get(`${x},${y}`)||[]}
function cellKeyByXYZ(x,y,z){return columnAt(x,y).find(c=>c.z===z)?.key||null}
function opponent(color){return color==='w'?'b':'w'}

function slideMoves(fromCell,piece,dirs,s=state){
  const moves=[];
  for(const[dx,dy]of dirs){
    let step=1;
    let frontier=[{cell:fromCell,departed:[]}];
    while(step<9&&frontier.length){
      const x=fromCell.x+dx*step,y=fromCell.y+dy*step;
      const nextStates=[];
      for(const route of frontier){
        for(const target of columnAt(x,y)){
          if(Math.abs(target.z-route.cell.z)>1)continue;
          if(route.departed.includes(target.z))continue;
          const departed=target.z===route.cell.z?[...route.departed]:[...route.departed,route.cell.z];
          const occ=pieceAt(target.key,s);
          if(!occ){
            moves.push({from:fromCell.key,to:target.key});
            nextStates.push({cell:target,departed});
          }else if(occ.color!==piece.color){
            moves.push({from:fromCell.key,to:target.key,capture:target.key});
          }
        }
      }
      const seen=new Set();
      frontier=nextStates.filter(route=>{
        const sig=`${route.cell.key}|${route.departed.slice().sort((a,b)=>a-b).join(',')}`;
        if(seen.has(sig))return false;
        seen.add(sig);return true;
      });
      step++;
    }
  }
  return dedupeMoves(moves);
}
function verticalMoves(fromCell,piece,s=state){
  const moves=[];
  for(const dz of[-1,1]){
    let z=fromCell.z+dz;
    while(true){
      const key=cellKeyByXYZ(fromCell.x,fromCell.y,z);if(!key)break;
      const occ=pieceAt(key,s);
      if(!occ)moves.push({from:fromCell.key,to:key});
      else{if(occ.color!==piece.color)moves.push({from:fromCell.key,to:key,capture:key});break}
      z+=dz;
    }
  }
  return moves;
}
function knightMoves(fromCell,piece,s=state){
  const moves=[];
  for(const[dx,dy]of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dy)){
      if(Math.abs(target.z-fromCell.z)>1)continue;
      const occ=pieceAt(target.key,s);
      if(!occ||occ.color!==piece.color)moves.push({from:fromCell.key,to:target.key,...(occ?{capture:target.key}:{})});
    }
  }
  return dedupeMoves(moves);
}
function kingMoves(fromCell,piece,s=state){
  const moves=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    if(dx===0&&dy===0)continue;
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dy)){
      if(Math.abs(target.z-fromCell.z)>1)continue;
      const occ=pieceAt(target.key,s);
      if(!occ||occ.color!==piece.color)moves.push({from:fromCell.key,to:target.key,...(occ?{capture:target.key}:{})});
    }
  }
  for(const dz of[-1,1]){
    const key=cellKeyByXYZ(fromCell.x,fromCell.y,fromCell.z+dz);if(!key)continue;
    const occ=pieceAt(key,s);
    if(!occ||occ.color!==piece.color)moves.push({from:fromCell.key,to:key,...(occ?{capture:key}:{})});
  }
  return dedupeMoves(moves);
}
function pawnMoves(fromCell,piece,s=state,attackOnly=false){
  const moves=[],dir=piece.color==='w'?-1:1,startY=piece.color==='w'?6:1;
  if(!attackOnly){
    const oneCandidates=columnAt(fromCell.x,fromCell.y+dir).filter(t=>Math.abs(t.z-fromCell.z)<=1&&!pieceAt(t.key,s));
    for(const target of oneCandidates)moves.push({from:fromCell.key,to:target.key});
    if(!piece.moved&&fromCell.y===startY&&oneCandidates.length){
      for(const one of oneCandidates)for(const two of columnAt(fromCell.x,fromCell.y+2*dir)){
        if(Math.abs(two.z-one.z)>1||pieceAt(two.key,s))continue;
        moves.push({from:fromCell.key,to:two.key,doublePawn:true,pass:{x:fromCell.x,y:fromCell.y+dir}});
      }
    }
  }
  for(const dx of[-1,1]){
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dir)){
      if(Math.abs(target.z-fromCell.z)>1)continue;
      const occ=pieceAt(target.key,s);
      if(occ&&occ.color!==piece.color)moves.push({from:fromCell.key,to:target.key,capture:target.key});
      else if(!attackOnly&&s.enPassant&&s.enPassant.x===target.x&&s.enPassant.y===target.y&&s.enPassant.by!==piece.color){
        const victim=pieceAt(s.enPassant.victim,s);
        if(victim?.type==='p'&&victim.color!==piece.color)moves.push({from:fromCell.key,to:target.key,capture:s.enPassant.victim,enPassant:true});
      }else if(attackOnly)moves.push({from:fromCell.key,to:target.key,attackOnly:true});
    }
  }
  return dedupeMoves(moves);
}
function castleMoves(key,piece,s=state){
  if(piece.type!=='k'||piece.moved||inCheck(piece.color,s))return[];
  const plans=piece.color==='w'?
    [{kingFrom:'B2:A1',rookFrom:'B2:B1',kingTo:'L:D1',rookTo:'L:C1',clear:['L:C1','L:D1'],name:'O-O'},{kingFrom:'B2:A1',rookFrom:'B1:A1',kingTo:'L:A1',rookTo:'L:B1',clear:['L:A1','L:B1','B1:B1'],name:'O-O-O'}]:
    [{kingFrom:'A2:A1',rookFrom:'A2:B1',kingTo:'U:D4',rookTo:'U:C4',clear:['U:C4','U:D4'],name:'O-O'},{kingFrom:'A2:A1',rookFrom:'A1:A1',kingTo:'U:A4',rookTo:'U:B4',clear:['U:A4','U:B4','A1:B1'],name:'O-O-O'}];
  const out=[];
  for(const plan of plans){
    if(key!==plan.kingFrom)continue;
    const rook=pieceAt(plan.rookFrom,s);
    if(!rook||rook.color!==piece.color||rook.type!=='r'||rook.moved)continue;
    if(plan.clear.some(cell=>pieceAt(cell,s)))continue;
    const testMove={from:key,to:plan.kingTo,castle:{rookFrom:plan.rookFrom,rookTo:plan.rookTo,name:plan.name}};
    const test=applyMoveToState(testMove,s,'q');
    if(inCheck(piece.color,test))continue;
    out.push(testMove);
  }
  return out;
}
function pseudoMovesForCell(key,s=state,attackOnly=false){
  const piece=pieceAt(key,s),fromCell=cells.get(key);if(!piece||!fromCell)return[];
  if(piece.type==='p')return pawnMoves(fromCell,piece,s,attackOnly);
  if(piece.type==='n')return knightMoves(fromCell,piece,s);
  if(piece.type==='k')return dedupeMoves([...kingMoves(fromCell,piece,s),...(attackOnly?[]:castleMoves(key,piece,s))]);
  let moves=[];
  if(piece.type==='r'||piece.type==='q')moves.push(...slideMoves(fromCell,piece,[[1,0],[-1,0],[0,1],[0,-1]],s));
  if(piece.type==='b'||piece.type==='q')moves.push(...slideMoves(fromCell,piece,[[1,1],[1,-1],[-1,1],[-1,-1]],s),...verticalMoves(fromCell,piece,s));
  return dedupeMoves(moves);
}
function dedupeMoves(moves){const map=new Map();for(const m of moves)map.set(`${m.from}>${m.to}>${m.capture||''}`,m);return[...map.values()]}
function findKing(color,s=state){return Object.keys(s.pieces).find(k=>s.pieces[k]?.color===color&&s.pieces[k]?.type==='k')||null}
function squareAttacked(targetKey,byColor,s=state){for(const[key,p]of Object.entries(s.pieces))if(p.color===byColor&&pseudoMovesForCell(key,s,true).some(m=>m.to===targetKey))return true;return false}
function inCheck(color,s=state){const king=findKing(color,s);return king?squareAttacked(king,opponent(color),s):true}
function applyMoveToState(move,s=state,promotion='q'){
  const next=cloneState(s),piece=next.pieces[move.from];if(!piece)return next;
  delete next.pieces[move.from];if(move.capture)delete next.pieces[move.capture];piece.moved=true;
  if(move.castle){const rook=next.pieces[move.castle.rookFrom];delete next.pieces[move.castle.rookFrom];if(rook){rook.moved=true;next.pieces[move.castle.rookTo]=rook}}
  const target=cells.get(move.to);if(piece.type==='p'&&(target.y===0||target.y===7))piece.type=promotion;
  next.pieces[move.to]=piece;next.enPassant=null;
  if(move.doublePawn)next.enPassant={x:move.pass.x,y:move.pass.y,victim:move.to,by:piece.color};
  next.turn=opponent(piece.color);next.lastMove={from:move.from,to:move.to,capture:move.capture||null,piece:piece.type,color:piece.color,castle:move.castle?.name||null};
  next.selected=null;next.legal=[];next.ply=(next.ply||0)+1;return next;
}
function legalMovesForCell(key,s=state){
  const piece=pieceAt(key,s);if(!piece)return[];
  return pseudoMovesForCell(key,s,false).filter(move=>{
    if(move.capture&&pieceAt(move.capture,s)?.type==='k')return false;
    const test=applyMoveToState(move,s,'q');return!inCheck(piece.color,test);
  });
}
function allLegalMoves(color,s=state){const out=[];for(const[key,p]of Object.entries(s.pieces))if(p.color===color)out.push(...legalMovesForCell(key,s));return out}
function gameStatus(s=state){const moves=allLegalMoves(s.turn,s),check=inCheck(s.turn,s);if(moves.length)return{over:false,check};if(check)return{over:true,winner:opponent(s.turn),checkmate:true};return{over:true,winner:null,stalemate:true}}
function choosePromotion(color){const answer=(window.prompt(`${color==='w'?'White':'Black'} pawn promotion: Q, R, B, or N`,'Q')||'Q').trim().toLowerCase()[0];return['q','r','b','n'].includes(answer)?answer:'q'}
function moveLabel(move,piece){if(move.castle)return`${move.castle.name} Tri-D castle`;const a=cells.get(move.from),b=cells.get(move.to);return`${NAMES[piece.type]} ${a.board}-${a.local} → ${b.board}-${b.local}${move.capture?' ×':''}`}

async function handleCell(key){
  if(state.gameOver)return;
  const piece=pieceAt(key);if(state.novaBlack&&state.turn==='b')return;
  const chosen=state.legal.find(m=>m.to===key);
  if(state.selected&&chosen){
    const moving=pieceAt(state.selected);let promotion='q';const target=cells.get(chosen.to);
    if(moving?.type==='p'&&(target.y===0||target.y===7))promotion=choosePromotion(moving.color);
    const label=moveLabel(chosen,moving);state=applyMoveToState(chosen,state,promotion);const status=gameStatus(state);
    if(status.over){state.gameOver=true;state.winner=status.winner}save();render();
    setStatus(status.over?(status.checkmate?`${label}. Checkmate. ${status.winner==='w'?'White':'Black'} wins.`:`${label}. Stalemate.`):`${label}. ${status.check?'Check. ':''}${state.turn==='w'?'White':'Black'} to move.`);
    if(!status.over&&state.novaBlack&&state.turn==='b')window.setTimeout(makeNovaMove,520);return;
  }
  if(piece?.color===state.turn){state.selected=key;state.legal=legalMovesForCell(key,state);render();setStatus(`${NAMES[piece.type]} selected. ${state.legal.length} legal destination${state.legal.length===1?'':'s'}.`)}
  else{state.selected=null;state.legal=[];render()}
}
function makeNovaMove(){
  if(!state.novaBlack||state.turn!=='b'||state.gameOver)return;
  const moves=allLegalMoves('b',state);if(!moves.length){finishIfNeeded();return}
  let best=-1e9,choice=moves[0];
  for(const move of moves){
    const target=pieceAt(move.capture||move.to,state),moving=pieceAt(move.from,state);let score=(target?VALUES[target.type]*10:0)+Math.random()*2;
    const test=applyMoveToState(move,state,'q');if(inCheck('w',test))score+=3;
    const dest=cells.get(move.to);score+=Math.max(0,3-Math.abs(3.5-dest.x))*.1;if(moving.type==='p'&&dest.y===7)score+=8;if(move.castle)score+=1.4;
    if(score>best){best=score;choice=move}
  }
  const moving=pieceAt(choice.from,state),label=moveLabel(choice,moving);state=applyMoveToState(choice,state,'q');finishIfNeeded();save();render();
  if(!state.gameOver)setStatus(`Nova: ${label}. ${inCheck('w',state)?'Check. ':''}White to move.`);
}
function finishIfNeeded(){const status=gameStatus(state);if(status.over){state.gameOver=true;state.winner=status.winner}return status}
function render(){
  for(const[key,cell]of cells){
    const el=cell.el;el.replaceChildren();el.classList.remove('selected','legal','capture','last','check');const p=pieceAt(key);
    if(state.selected===key)el.classList.add('selected');const lm=state.legal.find(m=>m.to===key);if(lm)el.classList.add(lm.capture?'capture':'legal');
    if(state.lastMove&&(state.lastMove.from===key||state.lastMove.to===key))el.classList.add('last');const king=findKing(state.turn,state);if(king===key&&inCheck(state.turn,state))el.classList.add('check');
    if(p){const token=document.createElement('span');token.className=`piece ${p.color==='w'?'crystal':'sapphire'} piece-${p.type}`;token.dataset.glyph=SYMBOLS[p.color][p.type];token.textContent=SYMBOLS[p.color][p.type];token.setAttribute('role','img');token.setAttribute('aria-label',`${p.color==='w'?'White':'Black'} ${NAMES[p.type]}`);el.appendChild(token)}
  }
  novaBtn?.classList.toggle('active',state.novaBlack);if(novaBtn)novaBtn.textContent=`Nova Black: ${state.novaBlack?'ON':'OFF'}`;
}
function setStatus(text){if(statusEl)statusEl.textContent=text}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({version:state.version,pieces:state.pieces,turn:state.turn,lastMove:state.lastMove,enPassant:state.enPassant,novaBlack:state.novaBlack,gameOver:state.gameOver,winner:state.winner,orientation:state.orientation,ply:state.ply}))}
function load(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(saved?.version===1&&saved.pieces){state={...state,...saved,selected:null,legal:[]};return true}}catch{}return false}
function resetGame(){state={version:1,pieces:initialPieces(),turn:'w',selected:null,legal:[],lastMove:null,enPassant:null,novaBlack:state.novaBlack,gameOver:false,winner:null,orientation:'white',ply:0};save();render();setStatus('New Tri-D game. White to move.')}
function toggleNova(){state.novaBlack=!state.novaBlack;save();render();setStatus(state.novaBlack?'Nova will command Black.':'Two-player local mode. Both sides are human.');if(state.novaBlack&&state.turn==='b'&&!state.gameOver)window.setTimeout(makeNovaMove,350)}
function flip(){state.orientation=state.orientation==='white'?'black':'white';scene?.classList.toggle('flipped',state.orientation==='black');save()}
for(const[key,cell]of cells)cell.el.addEventListener('click',()=>void handleCell(key));
newGameBtn?.addEventListener('click',resetGame);novaBtn?.addEventListener('click',toggleNova);flipBtn?.addEventListener('click',flip);
const restored=load();scene?.classList.toggle('flipped',state.orientation==='black');render();const startStatus=gameStatus(state);
if(startStatus.over){state.gameOver=true;state.winner=startStatus.winner;setStatus(startStatus.checkmate?`Checkmate. ${startStatus.winner==='w'?'White':'Black'} wins.`:'Stalemate.')}
else{setStatus(restored?`Game restored. ${state.turn==='w'?'White':'Black'} to move${startStatus.check?' in check':''}.`:'Tri-D game ready. White to move.');if(state.novaBlack&&state.turn==='b')window.setTimeout(makeNovaMove,500)}
