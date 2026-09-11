(()=>{
'use strict';

// Astralis Nova Tri-D Core V4
// Rules target: current World Tri Dimensional Chess Federation laws.

const OFFICIAL_VERSION=4;
const OFFICIAL_RULESET='W3DCF 2026';
const OFFICIAL_INITIAL_MOUNTS={
  A1:'P_U_NW_U', A2:'P_U_NE_U',
  B1:'P_L_SW_U', B2:'P_L_SE_U'
};
const ATTACK_HOME={w:{queen:'B1',king:'B2'},b:{queen:'A1',king:'A2'}};

// W3DCF attack boards are positioned over a corner of a host level.
// V3 built above/below variants. Keep only the "above" variants logically.
for(const slot of Object.values(V3_CANONICAL)){
  const host=MAIN_DEFS[slot.main];
  slot.z=host.z; // W3DCF: attack boards are considered at the host level for vertical movement.
}
// Preserve Ramon's approved visual placement for the two lower attack boards while
// making their logical mount the rule-correct position above the lower main board.
Object.assign(V3_CANONICAL.P_L_SW_U,{left:15,top:274,zpx:35});
Object.assign(V3_CANONICAL.P_L_SE_U,{left:449,top:488,zpx:35});

function officialInitialPieces(){
  const p={};
  const put=(cell,color,type)=>p[cell]={color,type,moved:false};

  // Black main level: bishop, queen, king, bishop. Queen on her colour.
  put('U:A4','b','b'); put('U:B4','b','q'); put('U:C4','b','k'); put('U:D4','b','b');
  ['A3','B3','C3','D3'].forEach(s=>put(`U:${s}`,'b','p'));
  // Black attack boards: outside rook, inside knight, two pawns.
  put('A1:A1','b','r'); put('A1:B1','b','n'); put('A1:A2','b','p'); put('A1:B2','b','p');
  put('A2:A1','b','n'); put('A2:B1','b','r'); put('A2:A2','b','p'); put('A2:B2','b','p');

  // White main level: bishop, queen, king, bishop. Queen on her colour.
  put('L:A1','w','b'); put('L:B1','w','q'); put('L:C1','w','k'); put('L:D1','w','b');
  ['A2','B2','C2','D2'].forEach(s=>put(`L:${s}`,'w','p'));
  // White attack boards: outside rook, inside knight, two pawns.
  put('B1:A1','w','r'); put('B1:B1','w','n'); put('B1:A2','w','p'); put('B1:B2','w','p');
  put('B2:A1','w','n'); put('B2:B1','w','r'); put('B2:A2','w','p'); put('B2:B2','w','p');
  return p;
}
initialPieces=officialInitialPieces;

function normalizeMount(slot,boardId){
  const c=canon(slot||'');
  if(V3_CANONICAL[c]?.relation==='U')return c;
  const fallback=OFFICIAL_INITIAL_MOUNTS[boardId];
  if(V3_CANONICAL[c]){
    const {main,corner}=V3_CANONICAL[c];
    const up=`P_${main}_${corner}_U`;
    if(V3_CANONICAL[up])return up;
  }
  return fallback;
}
function normalizeOfficialState(input){
  const next=input&&typeof input==='object'?cloneState(input):{};
  next.version=OFFICIAL_VERSION;
  next.pieces=next.pieces||officialInitialPieces();
  next.turn=next.turn==='b'?'b':'w';
  next.selected=null; next.legal=[];
  next.lastMove=next.lastMove||null; next.enPassant=next.enPassant||null;
  next.novaBlack=next.novaBlack!==false; next.gameOver=Boolean(next.gameOver); next.winner=next.winner||null;
  next.orientation=next.orientation==='black'?'black':'white'; next.ply=Number(next.ply||0);
  next.attackMounts={...OFFICIAL_INITIAL_MOUNTS,...(next.attackMounts||{})};
  for(const id of ATTACK_IDS)next.attackMounts[id]=normalizeMount(next.attackMounts[id],id);
  next.attackRotations={A1:false,A2:false,B1:false,B2:false,...(next.attackRotations||{})};
  next.attackMoved={A1:false,A2:false,B1:false,B2:false,...(next.attackMoved||{})};
  return next;
}

// Current W3DCF board movement: adjacent corner on same host level, or a corner on
// an adjacent level no more than two projected squares away; 180-degree rotation is optional.
function officialSameLevelSlots(current){
  return Object.values(V3_CANONICAL).filter(s=>
    s.relation==='U'&&s.main===current.main&&s.id!==current.id&&
    (V3_CORNERS[s.corner].row===V3_CORNERS[current.corner].row||V3_CORNERS[s.corner].col===V3_CORNERS[current.corner].col)
  );
}
function officialAdjacentLevelSlots(current){
  const i=V3_MAIN_ORDER.indexOf(current.main),out=[];
  for(const j of[i-1,i+1]){
    if(j<0||j>=V3_MAIN_ORDER.length)continue;
    const main=V3_MAIN_ORDER[j];
    for(const s of Object.values(V3_CANONICAL)){
      if(s.relation!=='U'||s.main!==main)continue;
      const dx=Math.abs(s.anchorX-current.anchorX),dy=Math.abs(s.anchorY-current.anchorY);
      if(Math.max(dx,dy)<=2)out.push(s);
    }
  }
  return out;
}
candidateAttackSlots=function(boardId,s=state){
  const current=V3_CANONICAL[normalizeMount(s.attackMounts?.[boardId],boardId)];
  if(!current)return[];
  return [...new Set([...officialSameLevelSlots(current),...officialAdjacentLevelSlots(current)].map(x=>x.id))]
    .filter(id=>!slotOccupied(id,boardId,s));
};
attackBoardEligible=function(boardId,color,s=state){
  const occ=boardOccupants(boardId,s);
  return occ.length===1&&occ[0][1].color===color&&occ[0][1].type!=='k';
};

function officialCornerKey(main,corner){
  const c=V3_CORNERS[corner];
  const file=String.fromCharCode(65+(c.col==='W'?0:3));
  const rank=c.row==='N'?4:1;
  return `${main}:${file}${rank}`;
}
function extremeRearSlot(slot){
  return (slot.main==='U'&&V3_CORNERS[slot.corner].row==='N')||(slot.main==='L'&&V3_CORNERS[slot.corner].row==='S');
}
function blockedRearAttackBoard(boardId,s=state){
  const slot=V3_CANONICAL[normalizeMount(s.attackMounts?.[boardId],boardId)];
  if(!slot||!extremeRearSlot(slot))return false;
  const occupant=pieceAt(officialCornerKey(slot.main,slot.corner),s);
  return occupant?.type==='p'&&occupant.color!==s.turn;
}
function riderMotionAllowed(boardId,targetSlot,rotate,s=state){
  const occ=boardOccupants(boardId,s);if(occ.length!==1)return false;
  const [key,piece]=occ[0];
  if(piece.type!=='p')return true;
  rebuildGeometry(s);const before=cells.get(key)?.y;
  const test=cloneState(s);test.attackMounts[boardId]=targetSlot;if(rotate)test.attackRotations[boardId]=!test.attackRotations[boardId];
  rebuildGeometry(test);const after=cells.get(key)?.y;rebuildGeometry(s);
  if(!Number.isFinite(before)||!Number.isFinite(after))return false;
  return piece.color==='w'?after<=before:after>=before;
}
const baseAttackSafe=attackBoardMoveSafe;
attackBoardMoveSafe=function(boardId,targetSlot,rotate,s=state){
  if(blockedRearAttackBoard(boardId,s))return false;
  if(!riderMotionAllowed(boardId,targetSlot,rotate,s))return false;
  return baseAttackSafe(boardId,targetSlot,rotate,s);
};

const baseApplyBoard=applyAttackBoardMoveToState;
applyAttackBoardMoveToState=function(boardId,targetSlot,rotate,s=state){
  const next=baseApplyBoard(boardId,targetSlot,rotate,s);
  next.version=OFFICIAL_VERSION;
  next.attackMoved={A1:false,A2:false,B1:false,B2:false,...(s.attackMoved||{})};
  next.attackMoved[boardId]=true;
  const occ=boardOccupants(boardId,next);
  if(occ.length===1&&occ[0][1].type==='p')occ[0][1].moved=true;
  return next;
};

// Remove the non-W3DCF pure vertical shortcuts from bishops/queens and kings.
kingMoves=function(fromCell,piece,s=state){
  const moves=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    if(dx===0&&dy===0)continue;
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dy)){
      if(Math.abs(target.z-fromCell.z)>1)continue;
      const occ=pieceAt(target.key,s);
      if(!occ||occ.color!==piece.color)moves.push({from:fromCell.key,to:target.key,...(occ?{capture:target.key}:{})});
    }
  }
  return dedupeMoves(moves);
};
pseudoMovesForCell=function(key,s=state,attackOnly=false){
  const piece=pieceAt(key,s),fromCell=cells.get(key);if(!piece||!fromCell)return[];
  if(piece.type==='p')return pawnMoves(fromCell,piece,s,attackOnly);
  if(piece.type==='n')return knightMoves(fromCell,piece,s);
  if(piece.type==='k')return dedupeMoves([...kingMoves(fromCell,piece,s),...(attackOnly?[]:castleMoves(key,piece,s))]);
  let moves=[];
  if(piece.type==='r'||piece.type==='q')moves.push(...slideMoves(fromCell,piece,[[1,0],[-1,0],[0,1],[0,-1]],s));
  if(piece.type==='b'||piece.type==='q')moves.push(...slideMoves(fromCell,piece,[[1,1],[1,-1],[-1,1],[-1,-1]],s));
  return dedupeMoves(moves);
};

// W3DCF castling destinations use the attack boards themselves.
castleMoves=function(key,piece,s=state){
  if(piece.type!=='k'||piece.moved||inCheck(piece.color,s))return[];
  const isWhite=piece.color==='w';
  const kingFrom=isWhite?'L:C1':'U:C4';
  if(key!==kingFrom)return[];
  const plans=isWhite?[
    {board:'B2',rookFrom:'B2:B1',kingTo:'B2:B1',rookTo:'L:D1',clear:['L:D1','B2:A1'],name:'O-O'},
    {board:'B1',rookFrom:'B1:A1',kingTo:'B1:B1',rookTo:'L:B1',clear:['L:A1','L:B1','B1:B1'],name:'O-O-O'}
  ]:[
    {board:'A2',rookFrom:'A2:B1',kingTo:'A2:B1',rookTo:'U:D4',clear:['U:D4','A2:A1'],name:'O-O'},
    {board:'A1',rookFrom:'A1:A1',kingTo:'A1:B1',rookTo:'U:B4',clear:['U:A4','U:B4','A1:B1'],name:'O-O-O'}
  ];
  const out=[];
  for(const plan of plans){
    const rook=pieceAt(plan.rookFrom,s);
    if(!rook||rook.color!==piece.color||rook.type!=='r'||rook.moved)continue;
    if(s.attackMoved?.[plan.board])continue;
    if(normalizeMount(s.attackMounts?.[plan.board],plan.board)!==OFFICIAL_INITIAL_MOUNTS[plan.board])continue;
    if(plan.clear.some(square=>pieceAt(square,s)))continue;
    const move={from:key,to:plan.kingTo,castle:{rookFrom:plan.rookFrom,rookTo:plan.rookTo,name:plan.name,board:plan.board}};
    const test=applyMoveToState(move,s,'q');
    rebuildGeometry(test);const safe=!inCheck(piece.color,test);rebuildGeometry(s);
    if(safe)out.push(move);
  }
  return out;
};

function promotionDue(piece,target){
  if(piece.type!=='p'||!target)return false;
  if(isAttackBoard(target.board))return piece.color==='w'?target.y<0:target.y>7;
  return piece.color==='w'?target.y===0:target.y===7;
}
applyMoveToState=function(move,s=state,promotion='q'){
  const next=cloneState(s),piece=next.pieces[move.from];if(!piece)return next;
  delete next.pieces[move.from];if(move.capture)delete next.pieces[move.capture];piece.moved=true;
  if(move.castle){const rook=next.pieces[move.castle.rookFrom];delete next.pieces[move.castle.rookFrom];if(rook){rook.moved=true;next.pieces[move.castle.rookTo]=rook}}
  const target=cells.get(move.to);if(promotionDue(piece,target))piece.type=promotion;
  next.pieces[move.to]=piece;next.enPassant=null;
  if(move.doublePawn)next.enPassant={x:move.pass.x,y:move.pass.y,victim:move.to,by:piece.color};
  next.turn=opponent(piece.color);next.lastMove={kind:'piece',from:move.from,to:move.to,capture:move.capture||null,piece:piece.type,color:piece.color,castle:move.castle?.name||null};
  next.selected=null;next.legal=[];next.ply=(next.ply||0)+1;next.version=OFFICIAL_VERSION;return next;
};
maybePromoteRider=function(boardId,color){
  const occ=boardOccupants(boardId,state);if(occ.length!==1)return;
  const [key,piece]=occ[0],cell=cells.get(key);if(!promotionDue(piece,cell))return;
  piece.type=color==='b'&&state.novaBlack?'q':choosePromotion(color);
};

// Save/load/reset with official setup and board-move history.
save=function(){
  localStorage.setItem(SAVE_KEY,JSON.stringify({
    version:OFFICIAL_VERSION,pieces:state.pieces,turn:state.turn,lastMove:state.lastMove,enPassant:state.enPassant,
    novaBlack:state.novaBlack,gameOver:state.gameOver,winner:state.winner,orientation:state.orientation,ply:state.ply,
    attackMounts:state.attackMounts,attackRotations:state.attackRotations,attackMoved:state.attackMoved,ruleset:OFFICIAL_RULESET
  }));
};
resetGame=function(){
  exitAttackMode();
  state=normalizeOfficialState({
    version:OFFICIAL_VERSION,pieces:officialInitialPieces(),turn:'w',lastMove:null,enPassant:null,
    novaBlack:state.novaBlack,gameOver:false,winner:null,orientation:'white',ply:0,
    attackMounts:{...OFFICIAL_INITIAL_MOUNTS},attackRotations:{A1:false,A2:false,B1:false,B2:false},attackMoved:{A1:false,A2:false,B1:false,B2:false}
  });
  rebuildGeometry(state);save();render();setStatus('New official W3DCF Tri-D game. White to move.');
};

// Upgrade the SVG glassmen from flat silhouettes to layered, visibly thick pieces.
const v3GlassSvg=glassSvg;
glassSvg=function(type,color){
  const layer=(markup,name)=>markup.replace('<svg ','<svg class="glass-layer '+name+'" ');
  return layer(v3GlassSvg(type,color),'glass-back')+layer(v3GlassSvg(type,color),'glass-mid')+layer(v3GlassSvg(type,color),'glass-front');
};

// Existing V2/V3 saves used incompatible starting armies/mount semantics. Reset once to V4.
let restored=false;
try{
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
  if(saved?.version===OFFICIAL_VERSION&&saved?.ruleset===OFFICIAL_RULESET){state=normalizeOfficialState(saved);restored=true}
}catch{}
if(!restored){
  state=normalizeOfficialState({pieces:officialInitialPieces(),novaBlack:state.novaBlack,attackMounts:{...OFFICIAL_INITIAL_MOUNTS},attackRotations:{A1:false,A2:false,B1:false,B2:false},attackMoved:{A1:false,A2:false,B1:false,B2:false}});
}
rebuildGeometry(state);scene?.classList.toggle('flipped',state.orientation==='black');save();render();
const chip=document.querySelector('.mode-chip');if(chip)chip.textContent='TRI-D CORE V4 · W3DCF';
setStatus(restored?`Official W3DCF game restored. ${state.turn==='w'?'White':'Black'} to move.`:'Official W3DCF setup loaded. White to move.');

})();
