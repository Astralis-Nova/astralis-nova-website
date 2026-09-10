const MAIN_DEFS={
  U:{size:4,ox:2,oy:0,z:2},
  M:{size:4,ox:2,oy:2,z:1},
  L:{size:4,ox:2,oy:4,z:0},
};
const ATTACK_IDS=['A1','A2','B1','B2'];
const BOARD_ORDER=['A1','U','A2','M','B1','L','B2'];
const ATTACK_SLOTS={
  L0:{side:'L',index:0,ox:0,oy:0,z:3,left:118,top:61,zpx:150,invertY:true,label:'Left high'},
  L1:{side:'L',index:1,ox:0,oy:2,z:2,left:60,top:180,zpx:102,label:'Left upper'},
  L2:{side:'L',index:2,ox:0,oy:4,z:1,left:26,top:390,zpx:52,label:'Left lower'},
  L3:{side:'L',index:3,ox:0,oy:6,z:-1,left:15,top:274,zpx:5,label:'Left low'},
  R0:{side:'R',index:0,ox:6,oy:0,z:3,left:419,top:58,zpx:150,invertY:true,label:'Right high'},
  R1:{side:'R',index:1,ox:6,oy:2,z:2,left:486,top:190,zpx:102,label:'Right upper'},
  R2:{side:'R',index:2,ox:6,oy:4,z:1,left:482,top:355,zpx:52,label:'Right lower'},
  R3:{side:'R',index:3,ox:6,oy:6,z:-1,left:449,top:488,zpx:5,label:'Right low'},
};
const ATTACK_RAILS={L:['L0','L1','L2','L3'],R:['R0','R1','R2','R3']};
const INITIAL_MOUNTS={A1:'L0',A2:'R0',B1:'L3',B2:'R3'};
const INITIAL_ROTATIONS={A1:false,A2:false,B1:false,B2:false};
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const NAMES={k:'King',q:'Queen',r:'Rook',b:'Bishop',n:'Knight',p:'Pawn'};
const VALUES={p:1,n:3,b:3.2,r:5,q:9,k:100};
const SAVE_KEY='astralisTriDGameV2';

const statusEl=document.getElementById('gameStatus');
const newGameBtn=document.getElementById('newGame');
const novaBtn=document.getElementById('novaToggle');
const flipBtn=document.getElementById('flipBoard');
const scene=document.getElementById('scene');
const gameActions=document.querySelector('.game-actions');

installAttackBoardControls();
installAttackBoardStyles();
const attackModeBtn=document.getElementById('attackBoardMode');
const attackRotateBtn=document.getElementById('attackRotate');

const cells=new Map();
const columns=new Map();

for(const id of BOARD_ORDER){
  const size=MAIN_DEFS[id]?.size||2;
  const host=document.getElementById(id);
  if(!host)continue;
  for(let row=0;row<size;row++){
    for(let col=0;col<size;col++){
      const rank=size-row;
      const local=`${String.fromCharCode(65+col)}${rank}`;
      const key=`${id}:${local}`;
      const el=document.createElement('button');
      el.type='button';
      el.className='sq';
      el.dataset.cell=key;
      el.setAttribute('aria-label',`${id} ${local}`);
      host.appendChild(el);
      cells.set(key,{key,board:id,local,row,col,size,x:0,y:0,z:0,el});
    }
  }
}

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

let state={
  version:2,pieces:initialPieces(),turn:'w',selected:null,legal:[],lastMove:null,enPassant:null,
  novaBlack:true,gameOver:false,winner:null,orientation:'white',ply:0,
  attackMounts:{...INITIAL_MOUNTS},attackRotations:{...INITIAL_ROTATIONS}
};
let attackMode=false;
let pendingAttackBoard=null;
let rotateOnMove=false;
const mountButtons=new Map();

function cloneState(source=state){return JSON.parse(JSON.stringify(source))}
function pieceAt(key,s=state){return s.pieces[key]||null}
function opponent(color){return color==='w'?'b':'w'}
function isAttackBoard(id){return ATTACK_IDS.includes(id)}
function mountForBoard(id,s=state){return ATTACK_SLOTS[s.attackMounts?.[id]||INITIAL_MOUNTS[id]]}
function currentDef(id,s=state){return MAIN_DEFS[id]||{size:2,...mountForBoard(id,s)}}

function rebuildGeometry(s=state){
  columns.clear();
  for(const cell of cells.values()){
    const def=currentDef(cell.board,s);
    let row=cell.row,col=cell.col;
    if(isAttackBoard(cell.board)&&s.attackRotations?.[cell.board]){
      row=cell.size-1-row;
      col=cell.size-1-col;
    }
    cell.x=def.ox+col;
    cell.y=def.oy+(def.invertY?(cell.size-1-row):row);
    cell.z=def.z;
    const ckey=`${cell.x},${cell.y}`;
    if(!columns.has(ckey))columns.set(ckey,[]);
    columns.get(ckey).push(cell);
  }
  for(const list of columns.values())list.sort((a,b)=>a.z-b.z);
  applyAttackBoardVisuals(s);
  recolorSquares();
}
function recolorSquares(){
  for(const cell of cells.values()){
    cell.el.classList.toggle('light',(cell.x+cell.y)%2===0);
    cell.el.classList.toggle('dark',(cell.x+cell.y)%2!==0);
  }
}
function applyAttackBoardVisuals(s=state){
  for(const id of ATTACK_IDS){
    const platform=document.querySelector(`[data-board="${id}"]`);
    const slot=mountForBoard(id,s);
    if(!platform||!slot)continue;
    platform.style.setProperty('--ab-left',`${slot.left}px`);
    platform.style.setProperty('--ab-top',`${slot.top}px`);
    platform.style.setProperty('--ab-z',`${slot.zpx}px`);
    platform.style.setProperty('--ab-rot',s.attackRotations?.[id]?'180deg':'0deg');
    platform.dataset.mount=s.attackMounts[id];
  }
}
function columnAt(x,y){return columns.get(`${x},${y}`)||[]}
function cellKeyByXYZ(x,y,z){return columnAt(x,y).find(c=>c.z===z)?.key||null}

rebuildGeometry(state);

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
          if(!occ){moves.push({from:fromCell.key,to:target.key});nextStates.push({cell:target,departed})}
          else if(occ.color!==piece.color)moves.push({from:fromCell.key,to:target.key,capture:target.key});
        }
      }
      const seen=new Set();
      frontier=nextStates.filter(route=>{const sig=`${route.cell.key}|${route.departed.slice().sort((a,b)=>a-b).join(',')}`;if(seen.has(sig))return false;seen.add(sig);return true});
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
  next.turn=opponent(piece.color);next.lastMove={kind:'piece',from:move.from,to:move.to,capture:move.capture||null,piece:piece.type,color:piece.color,castle:move.castle?.name||null};
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

function boardOccupants(boardId,s=state){return Object.entries(s.pieces).filter(([key])=>key.startsWith(`${boardId}:`))}
function attackBoardEligible(boardId,color,s=state){const occ=boardOccupants(boardId,s);return occ.length===1&&occ[0][1].color===color}
function slotOccupied(slotId,exceptBoard,s=state){return Object.entries(s.attackMounts||{}).some(([id,slot])=>id!==exceptBoard&&slot===slotId)}
function candidateAttackSlots(boardId,s=state){
  const current=s.attackMounts?.[boardId]||INITIAL_MOUNTS[boardId],slot=ATTACK_SLOTS[current];if(!slot)return[];
  return ATTACK_RAILS[slot.side].filter(id=>{const distance=Math.abs(ATTACK_SLOTS[id].index-slot.index);return distance>=1&&distance<=2&&!slotOccupied(id,boardId,s)});
}
function applyAttackBoardMoveToState(boardId,targetSlot,rotate,s=state){
  const next=cloneState(s),color=s.turn,fromSlot=next.attackMounts[boardId];
  next.attackMounts[boardId]=targetSlot;
  if(rotate)next.attackRotations[boardId]=!next.attackRotations[boardId];
  next.turn=opponent(color);next.enPassant=null;next.selected=null;next.legal=[];next.ply=(next.ply||0)+1;
  next.lastMove={kind:'board',board:boardId,fromSlot,toSlot:targetSlot,rotated:Boolean(rotate),color};
  return next;
}
function attackBoardMoveSafe(boardId,targetSlot,rotate,s=state){
  const color=s.turn,test=applyAttackBoardMoveToState(boardId,targetSlot,rotate,s);
  rebuildGeometry(test);const safe=!inCheck(color,test);rebuildGeometry(s);return safe;
}
function legalAttackBoardMoves(boardId,s=state){
  if(!attackBoardEligible(boardId,s.turn,s))return[];
  const out=[];
  for(const target of candidateAttackSlots(boardId,s))for(const rotate of[false,true])if(attackBoardMoveSafe(boardId,target,rotate,s))out.push({kind:'board',board:boardId,target,rotate});
  return out;
}
function allLegalAttackBoardMoves(color,s=state){
  if(color!==s.turn)return[];
  const out=[];for(const id of ATTACK_IDS)out.push(...legalAttackBoardMoves(id,s));return out;
}
function gameStatus(s=state){
  const moves=allLegalMoves(s.turn,s),boardMoves=allLegalAttackBoardMoves(s.turn,s),check=inCheck(s.turn,s);
  if(moves.length||boardMoves.length)return{over:false,check};
  if(check)return{over:true,winner:opponent(s.turn),checkmate:true};
  return{over:true,winner:null,stalemate:true};
}
function choosePromotion(color){const answer=(window.prompt(`${color==='w'?'White':'Black'} pawn promotion: Q, R, B, or N`,'Q')||'Q').trim().toLowerCase()[0];return['q','r','b','n'].includes(answer)?answer:'q'}
function moveLabel(move,piece){if(move.castle)return`${move.castle.name} Tri-D castle`;const a=cells.get(move.from),b=cells.get(move.to);return`${NAMES[piece.type]} ${a.board}-${a.local} → ${b.board}-${b.local}${move.capture?' ×':''}`}

async function handleCell(key){
  if(state.gameOver)return;
  const cell=cells.get(key);
  if(attackMode){if(cell&&isAttackBoard(cell.board))selectAttackBoard(cell.board);return}
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

function toggleAttackMode(){
  if(state.gameOver)return;
  if(state.novaBlack&&state.turn==='b'){setStatus('Nova is commanding Black right now.');return}
  if(attackMode){exitAttackMode('Attack-board move cancelled.');return}
  const eligible=ATTACK_IDS.filter(id=>attackBoardEligible(id,state.turn,state)&&candidateAttackSlots(id,state).length);
  if(!eligible.length){setStatus('No attack board can move yet. A movable 2×2 board must contain exactly one piece belonging to the side to move.');return}
  attackMode=true;pendingAttackBoard=null;rotateOnMove=false;state.selected=null;state.legal=[];render();
  setStatus(`Attack-board mode. Choose a glowing 2×2 board. Its move uses the entire ${state.turn==='w'?'White':'Black'} turn.`);
}
function selectAttackBoard(boardId){
  if(!attackBoardEligible(boardId,state.turn,state)){setStatus('That attack board is not eligible. It must contain exactly one of your pieces.');return}
  const targets=candidateAttackSlots(boardId,state);
  if(!targets.length){setStatus('That attack board has no open mount within one or two rail positions.');return}
  pendingAttackBoard=boardId;rotateOnMove=false;render();renderMountTargets();
  setStatus(`${boardId} selected. Choose a glowing rail mount.${inCheck(state.turn,state)?' The move must also get your king out of check.':''}`);
}
function toggleAttackRotation(){
  if(!attackMode||!pendingAttackBoard)return;
  rotateOnMove=!rotateOnMove;renderMountTargets();render();
  setStatus(`${pendingAttackBoard} will ${rotateOnMove?'rotate 180° while moving':'keep its current orientation'}. Choose a glowing mount.`);
}
function renderMountTargets(){
  clearMountTargets();
  if(!attackMode||!pendingAttackBoard)return;
  for(const slotId of candidateAttackSlots(pendingAttackBoard,state)){
    const safe=attackBoardMoveSafe(pendingAttackBoard,slotId,rotateOnMove,state);
    if(!safe)continue;
    const slot=ATTACK_SLOTS[slotId],btn=document.createElement('button');
    btn.type='button';btn.className='attack-mount';btn.dataset.slot=slotId;btn.setAttribute('aria-label',`Move ${pendingAttackBoard} to ${slot.label}`);
    btn.textContent='✦';btn.style.left=`${slot.left+54}px`;btn.style.top=`${slot.top+34}px`;
    btn.addEventListener('click',()=>commitAttackBoardMove(pendingAttackBoard,slotId,rotateOnMove));
    scene.appendChild(btn);mountButtons.set(slotId,btn);
  }
  if(!mountButtons.size)setStatus('No legal mount keeps your king safe. Try toggling the 180° rotation or cancel the attack-board move.');
}
function clearMountTargets(){for(const btn of mountButtons.values())btn.remove();mountButtons.clear()}
function exitAttackMode(message=''){
  attackMode=false;pendingAttackBoard=null;rotateOnMove=false;clearMountTargets();render();if(message)setStatus(message);
}
function maybePromoteRider(boardId,color){
  const occ=boardOccupants(boardId,state);if(occ.length!==1)return;
  const[key,piece]=occ[0],cell=cells.get(key);if(piece.type!=='p'||!cell||(cell.y!==0&&cell.y!==7))return;
  piece.type=color==='b'&&state.novaBlack?'q':choosePromotion(color);
}
function commitAttackBoardMove(boardId,targetSlot,rotate){
  if(!attackMode||boardId!==pendingAttackBoard)return;
  if(!attackBoardEligible(boardId,state.turn,state)||!candidateAttackSlots(boardId,state).includes(targetSlot)){setStatus('That attack-board move is no longer legal.');return}
  const color=state.turn;
  if(!attackBoardMoveSafe(boardId,targetSlot,rotate,state)){setStatus('That platform move would leave your king in check.');return}
  const fromSlot=state.attackMounts[boardId];state=applyAttackBoardMoveToState(boardId,targetSlot,rotate,state);rebuildGeometry(state);maybePromoteRider(boardId,color);
  attackMode=false;pendingAttackBoard=null;rotateOnMove=false;clearMountTargets();finishIfNeeded();save();render();
  const label=`${boardId} attack board ${fromSlot} → ${targetSlot}${rotate?' + 180°':''}`;
  if(state.gameOver){const end=gameStatus(state);setStatus(end.checkmate?`${label}. Checkmate. ${state.winner==='w'?'White':'Black'} wins.`:`${label}. Stalemate.`);return}
  setStatus(`${label}. ${inCheck(state.turn,state)?'Check. ':''}${state.turn==='w'?'White':'Black'} to move.`);
  if(state.novaBlack&&state.turn==='b')window.setTimeout(makeNovaMove,520);
}

function makeNovaMove(){
  if(!state.novaBlack||state.turn!=='b'||state.gameOver)return;
  const pieceMoves=allLegalMoves('b',state),boardMoves=allLegalAttackBoardMoves('b',state);
  if(!pieceMoves.length&&!boardMoves.length){finishIfNeeded();return}
  const currentCheck=inCheck('b',state);
  if(boardMoves.length&&(pieceMoves.length===0||Math.random()<.16)){
    let best=-1e9,choice=boardMoves[0];
    for(const action of boardMoves){
      const test=applyAttackBoardMoveToState(action.board,action.target,action.rotate,state);rebuildGeometry(test);
      let score=Math.random()*1.8+(currentCheck?50:0);if(inCheck('w',test))score+=3;
      const occ=boardOccupants(action.board,test);if(occ.length===1&&occ[0][1].type==='p')score+=ATTACK_SLOTS[action.target].oy*.15;
      rebuildGeometry(state);if(score>best){best=score;choice=action}
    }
    const fromSlot=state.attackMounts[choice.board];state=applyAttackBoardMoveToState(choice.board,choice.target,choice.rotate,state);rebuildGeometry(state);maybePromoteRider(choice.board,'b');finishIfNeeded();save();render();
    if(!state.gameOver)setStatus(`Nova moved ${choice.board} attack board ${fromSlot} → ${choice.target}${choice.rotate?' + 180°':''}. ${inCheck('w',state)?'Check. ':''}White to move.`);
    return;
  }
  let best=-1e9,choice=pieceMoves[0];
  for(const move of pieceMoves){
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
  rebuildGeometry(state);
  const eligibleSet=new Set(attackMode?ATTACK_IDS.filter(id=>attackBoardEligible(id,state.turn,state)&&candidateAttackSlots(id,state).length):[]);
  for(const[key,cell]of cells){
    const el=cell.el;el.replaceChildren();el.classList.remove('selected','legal','capture','last','check');const p=pieceAt(key);
    if(state.selected===key)el.classList.add('selected');const lm=state.legal.find(m=>m.to===key);if(lm)el.classList.add(lm.capture?'capture':'legal');
    if(state.lastMove?.kind==='piece'&&(state.lastMove.from===key||state.lastMove.to===key))el.classList.add('last');const king=findKing(state.turn,state);if(king===key&&inCheck(state.turn,state))el.classList.add('check');
    if(p){const token=document.createElement('span');token.className=`piece ${p.color==='w'?'crystal':'sapphire'} piece-${p.type}`;token.dataset.glyph=SYMBOLS[p.color][p.type];token.textContent=SYMBOLS[p.color][p.type];token.setAttribute('role','img');token.setAttribute('aria-label',`${p.color==='w'?'White':'Black'} ${NAMES[p.type]}`);el.appendChild(token)}
  }
  for(const id of ATTACK_IDS){
    const platform=document.querySelector(`[data-board="${id}"]`);if(!platform)continue;
    platform.classList.toggle('ab-eligible',eligibleSet.has(id));platform.classList.toggle('ab-selected',pendingAttackBoard===id);
  }
  novaBtn?.classList.toggle('active',state.novaBlack);if(novaBtn)novaBtn.textContent=`Nova Black: ${state.novaBlack?'ON':'OFF'}`;
  if(attackModeBtn){attackModeBtn.classList.toggle('active',attackMode);attackModeBtn.textContent=attackMode?'Cancel Board Move':'Move Attack Board'}
  if(attackRotateBtn){attackRotateBtn.disabled=!attackMode||!pendingAttackBoard;attackRotateBtn.classList.toggle('active',rotateOnMove);attackRotateBtn.textContent=`Rotate with Move: ${rotateOnMove?'ON':'OFF'}`}
}
function setStatus(text){if(statusEl)statusEl.textContent=text}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({version:state.version,pieces:state.pieces,turn:state.turn,lastMove:state.lastMove,enPassant:state.enPassant,novaBlack:state.novaBlack,gameOver:state.gameOver,winner:state.winner,orientation:state.orientation,ply:state.ply,attackMounts:state.attackMounts,attackRotations:state.attackRotations}))}
function load(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(saved?.version===2&&saved.pieces&&saved.attackMounts){state={...state,...saved,selected:null,legal:[]};return true}}catch{}return false}
function resetGame(){exitAttackMode();state={version:2,pieces:initialPieces(),turn:'w',selected:null,legal:[],lastMove:null,enPassant:null,novaBlack:state.novaBlack,gameOver:false,winner:null,orientation:'white',ply:0,attackMounts:{...INITIAL_MOUNTS},attackRotations:{...INITIAL_ROTATIONS}};rebuildGeometry(state);save();render();setStatus('New Tri-D game. White to move.')}
function toggleNova(){state.novaBlack=!state.novaBlack;save();render();setStatus(state.novaBlack?'Nova will command Black.':'Two-player local mode. Both sides are human.');if(state.novaBlack&&state.turn==='b'&&!state.gameOver)window.setTimeout(makeNovaMove,350)}
function flip(){state.orientation=state.orientation==='white'?'black':'white';scene?.classList.toggle('flipped',state.orientation==='black');save()}

function installAttackBoardControls(){
  if(!gameActions||document.getElementById('attackBoardMode'))return;
  const move=document.createElement('button');move.id='attackBoardMode';move.type='button';move.textContent='Move Attack Board';move.title='Use your turn to reposition an eligible 2×2 attack board';
  const rotate=document.createElement('button');rotate.id='attackRotate';rotate.type='button';rotate.textContent='Rotate with Move: OFF';rotate.disabled=true;rotate.title='Optionally rotate the selected attack board 180 degrees as it moves';
  gameActions.append(move,rotate);
}
function installAttackBoardStyles(){
  if(document.getElementById('attackBoardStyles'))return;
  const style=document.createElement('style');style.id='attackBoardStyles';style.textContent=`
    .attack{left:var(--ab-left)!important;top:var(--ab-top)!important;transform:translateZ(var(--ab-z)) rotateX(60deg) rotateZ(var(--ab-rot,0deg))!important;transition:left .42s cubic-bezier(.2,.75,.2,1),top .42s cubic-bezier(.2,.75,.2,1),transform .42s cubic-bezier(.2,.75,.2,1),filter .2s ease}
    .attack.ab-eligible .grid{box-shadow:0 15px 34px rgba(0,0,0,.36),0 0 8px rgba(188,255,233,.96),0 0 22px rgba(73,255,199,.82),0 0 48px rgba(34,236,178,.38),inset 0 0 13px rgba(205,255,240,.16)}
    .attack.ab-selected .grid{box-shadow:0 15px 34px rgba(0,0,0,.36),0 0 8px rgba(255,236,135,.98),0 0 24px rgba(255,217,87,.86),0 0 52px rgba(255,185,50,.35),inset 0 0 15px rgba(255,241,177,.18)}
    .attack-mount{position:absolute;z-index:60;width:44px;height:44px;border-radius:50%;border:2px solid rgba(144,250,255,.92);background:radial-gradient(circle,rgba(198,252,255,.96) 0 10%,rgba(31,176,236,.78) 12% 26%,rgba(3,29,55,.9) 54%);color:#eaffff;font-size:1rem;line-height:1;box-shadow:0 0 8px rgba(144,244,255,.95),0 0 24px rgba(30,194,255,.72);cursor:pointer;animation:mountPulse 1.25s ease-in-out infinite}
    .attack-mount:hover,.attack-mount:focus-visible{outline:3px solid white;outline-offset:3px;transform:scale(1.08)}
    #attackRotate:disabled{opacity:.42;cursor:not-allowed}
    @keyframes mountPulse{0%,100%{filter:brightness(.9);box-shadow:0 0 8px rgba(144,244,255,.8),0 0 19px rgba(30,194,255,.58)}50%{filter:brightness(1.2);box-shadow:0 0 11px rgba(202,255,255,1),0 0 31px rgba(30,194,255,.9)}}
    @media(prefers-reduced-motion:reduce){.attack,.attack-mount{transition:none;animation:none}}
  `;document.head.append(style);
}

for(const[key,cell]of cells)cell.el.addEventListener('click',()=>void handleCell(key));
newGameBtn?.addEventListener('click',resetGame);novaBtn?.addEventListener('click',toggleNova);flipBtn?.addEventListener('click',flip);attackModeBtn?.addEventListener('click',toggleAttackMode);attackRotateBtn?.addEventListener('click',toggleAttackRotation);
const restored=load();rebuildGeometry(state);scene?.classList.toggle('flipped',state.orientation==='black');render();const startStatus=gameStatus(state);
if(startStatus.over){state.gameOver=true;state.winner=startStatus.winner;setStatus(startStatus.checkmate?`Checkmate. ${startStatus.winner==='w'?'White':'Black'} wins.`:'Stalemate.')}
else{setStatus(restored?`Game restored. ${state.turn==='w'?'White':'Black'} to move${startStatus.check?' in check':''}.`:'Tri-D game ready. White to move. Attack boards unlock when only one of your pieces remains on them.');if(state.novaBlack&&state.turn==='b')window.setTimeout(makeNovaMove,500)}