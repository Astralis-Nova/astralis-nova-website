(()=>{
'use strict';

const VERSION=6;
const RULESET='W3DCF 2013 · Astralis rotation';
const SAVE_KEY='astralisTriDGameV2';
const MAIN_DEFS={
  U:{size:4,ox:2,oy:0,level:2,left:166,top:64,zpx:110},
  M:{size:4,ox:2,oy:2,level:1,left:181,top:218,zpx:45},
  L:{size:4,ox:2,oy:4,level:0,left:45,top:425,zpx:-15},
};
const BOARD_ORDER=['A1','U','A2','M','B1','L','B2'];
const ATTACK_IDS=['A1','A2','B1','B2'];
const ATTACK_ORIGINAL_OWNER={A1:'b',A2:'b',B1:'w',B2:'w'};
const CORNERS={
  NW:{row:'N',col:'W',dx:-1,dy:-1,ax:0,ay:0},
  NE:{row:'N',col:'E',dx:3,dy:-1,ax:3,ay:0},
  SW:{row:'S',col:'W',dx:-1,dy:3,ax:0,ay:3},
  SE:{row:'S',col:'E',dx:3,dy:3,ax:3,ay:3},
};
const MAIN_ORDER=['U','M','L'];
const ATTACK_HOME={w:{queen:'B1',king:'B2'},b:{queen:'A1',king:'A2'}};
const INITIAL_MOUNTS={A1:'U_NW',A2:'U_NE',B1:'L_SW',B2:'L_SE'};
const INITIAL_ROTATIONS={A1:false,A2:false,B1:false,B2:false};
const INITIAL_ATTACK_MOVED={A1:false,A2:false,B1:false,B2:false};
const NAMES={k:'King',q:'Queen',r:'Rook',b:'Bishop',n:'Knight',p:'Pawn'};
const VALUES={p:1,n:3.2,b:3.3,r:5,q:9,k:100};
const SLOTS={};

function buildSlots(){
  for(const main of MAIN_ORDER){
    const def=MAIN_DEFS[main];
    for(const [corner,c] of Object.entries(CORNERS)){
      const id=`${main}_${corner}`;
      const right=c.col==='E',south=c.row==='S';
      let left=def.left+(right?253:-48);
      let top=def.top+(south?138:-19);
      let zpx=def.zpx+40;
      if(id==='U_NW'){left=118;top=61;zpx=150}
      if(id==='U_NE'){left=419;top=58;zpx=150}
      if(id==='L_SW'){left=15;top=274;zpx=5}
      if(id==='L_SE'){left=449;top=488;zpx=5}
      SLOTS[id]={id,main,corner,ox:def.ox+c.dx,oy:def.oy+c.dy,level:def.level,anchorX:def.ox+c.ax,anchorY:def.oy+c.ay,left,top,zpx,label:`${main} ${corner}`};
    }
  }
}
buildSlots();

const statusEl=document.getElementById('gameStatus');
const newGameBtn=document.getElementById('newGame');
const novaBtn=document.getElementById('novaToggle');
const flipBtn=document.getElementById('flipBoard');
const scene=document.getElementById('scene');
const gameActions=document.querySelector('.game-actions');

installAttackControls();
const attackModeBtn=document.getElementById('attackBoardMode');
const rotateBtn=document.getElementById('attackRotate');

const cells=new Map();
const columns=new Map();
for(const id of BOARD_ORDER){
  const size=MAIN_DEFS[id]?.size||2;
  const host=document.getElementById(id);
  if(!host)continue;
  host.replaceChildren();
  for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const rank=size-row;
    const local=`${String.fromCharCode(65+col)}${rank}`;
    const key=`${id}:${local}`;
    const el=document.createElement('button');
    el.type='button';el.className='sq';el.dataset.cell=key;el.setAttribute('aria-label',`${id} ${local}`);
    host.appendChild(el);
    cells.set(key,{key,board:id,local,row,col,size,x:0,y:0,level:0,el});
  }
}

function officialInitialPieces(){
  const p={};const put=(cell,color,type)=>p[cell]={color,type,moved:false};
  put('U:A4','b','b');put('U:B4','b','q');put('U:C4','b','k');put('U:D4','b','b');
  ['A3','B3','C3','D3'].forEach(s=>put(`U:${s}`,'b','p'));
  put('A1:A1','b','r');put('A1:B1','b','n');put('A1:A2','b','p');put('A1:B2','b','p');
  put('A2:A1','b','n');put('A2:B1','b','r');put('A2:A2','b','p');put('A2:B2','b','p');
  put('L:A1','w','b');put('L:B1','w','q');put('L:C1','w','k');put('L:D1','w','b');
  ['A2','B2','C2','D2'].forEach(s=>put(`L:${s}`,'w','p'));
  put('B1:A1','w','r');put('B1:B1','w','n');put('B1:A2','w','p');put('B1:B2','w','p');
  put('B2:A1','w','n');put('B2:B1','w','r');put('B2:A2','w','p');put('B2:B2','w','p');
  return p;
}
function freshState(nova=true){return{
  version:VERSION,ruleset:RULESET,pieces:officialInitialPieces(),turn:'w',selected:null,legal:[],lastMove:null,enPassant:null,
  novaBlack:nova,gameOver:false,winner:null,orientation:'white',ply:0,
  attackMounts:{...INITIAL_MOUNTS},attackRotations:{...INITIAL_ROTATIONS},attackMoved:{...INITIAL_ATTACK_MOVED}
}}
let state=freshState(true);
let attackMode=false,pendingAttackBoard=null,rotateOnMove=false;
const mountButtons=new Map();
let pieceSerial=0;

function cloneState(v=state){return JSON.parse(JSON.stringify(v))}
function pieceAt(key,s=state){return s.pieces[key]||null}
function opponent(c){return c==='w'?'b':'w'}
function isAttackBoard(id){return ATTACK_IDS.includes(id)}
function currentDef(id,s=state){return MAIN_DEFS[id]||{size:2,...SLOTS[s.attackMounts?.[id]||INITIAL_MOUNTS[id]]}}
function boardOccupants(id,s=state){return Object.entries(s.pieces).filter(([k])=>k.startsWith(`${id}:`))}
function columnAt(x,y){return columns.get(`${x},${y}`)||[]}

function rebuildGeometry(s=state){
  columns.clear();
  for(const cell of cells.values()){
    const def=currentDef(cell.board,s);let row=cell.row,col=cell.col;
    if(isAttackBoard(cell.board)&&s.attackRotations?.[cell.board]){row=cell.size-1-row;col=cell.size-1-col}
    cell.x=def.ox+col;cell.y=def.oy+row;cell.level=def.level;
    const k=`${cell.x},${cell.y}`;if(!columns.has(k))columns.set(k,[]);columns.get(k).push(cell);
  }
  for(const list of columns.values())list.sort((a,b)=>a.level-b.level);
  for(const cell of cells.values()){
    cell.el.classList.toggle('light',(cell.x+cell.y)%2===0);cell.el.classList.toggle('dark',(cell.x+cell.y)%2!==0);
  }
  applyAttackVisuals(s);
}
function applyAttackVisuals(s=state){
  for(const id of ATTACK_IDS){
    const platform=document.querySelector(`[data-board="${id}"]`),slot=SLOTS[s.attackMounts?.[id]||INITIAL_MOUNTS[id]];if(!platform||!slot)continue;
    platform.style.setProperty('--ab-left',`${slot.left}px`);platform.style.setProperty('--ab-top',`${slot.top}px`);
    platform.style.setProperty('--ab-z',`${slot.zpx}px`);platform.style.setProperty('--ab-rot',s.attackRotations?.[id]?'180deg':'0deg');
    platform.dataset.mount=slot.id;
  }
}

function dedupeMoves(moves){const m=new Map();for(const x of moves)m.set(`${x.from}>${x.to}>${x.capture||''}>${x.enPassant?'e':''}`,x);return[...m.values()]}
function rayMoves(fromCell,piece,dirs,s=state,attackOnly=false){
  const out=[];
  for(const [dx,dy] of dirs){
    for(let step=1;step<12;step++){
      const targets=columnAt(fromCell.x+dx*step,fromCell.y+dy*step);
      // W3DCF 2.8: non-existent squares still continue a rank, file, or diagonal.
      if(!targets.length)continue;
      let blocked=false;
      for(const target of targets){
        const occ=pieceAt(target.key,s);
        if(!occ)out.push({from:fromCell.key,to:target.key});
        else{
          blocked=true;
          if(occ.color!==piece.color)out.push({from:fromCell.key,to:target.key,capture:target.key});
          else if(attackOnly)out.push({from:fromCell.key,to:target.key,attackOnly:true});
        }
      }
      // W3DCF 3.1(c): one occupied projected square blocks every level beyond it.
      // A slider may still land on an open level above or below that blocker.
      if(blocked)break;
    }
  }
  return dedupeMoves(out);
}
function kingMoves(fromCell,piece,s=state,attackOnly=false){
  const out=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    if(dx===0&&dy===0)continue;
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dy)){
      const occ=pieceAt(target.key,s);
      if(!occ||occ.color!==piece.color||attackOnly)out.push({from:fromCell.key,to:target.key,...(occ&&occ.color!==piece.color?{capture:target.key}:{}),...(occ&&occ.color===piece.color?{attackOnly:true}:{})});
    }
  }return dedupeMoves(out);
}
function knightMoves(fromCell,piece,s=state,attackOnly=false){
  const out=[];for(const [dx,dy] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){
    for(const target of columnAt(fromCell.x+dx,fromCell.y+dy)){
      const occ=pieceAt(target.key,s);
      if(!occ||occ.color!==piece.color||attackOnly)out.push({from:fromCell.key,to:target.key,...(occ&&occ.color!==piece.color?{capture:target.key}:{}),...(occ&&occ.color===piece.color?{attackOnly:true}:{})});
    }
  }return dedupeMoves(out);
}
function pawnMoves(fromCell,piece,s=state,attackOnly=false){
  const out=[],dir=piece.color==='w'?-1:1;
  if(!attackOnly){
    const firstColumn=columnAt(fromCell.x,fromCell.y+dir);
    const first=firstColumn.filter(t=>!pieceAt(t.key,s));
    for(const t of first)out.push({from:fromCell.key,to:t.key});
    if(!piece.moved&&first.length&&!firstColumn.some(t=>pieceAt(t.key,s))){
      for(const t of columnAt(fromCell.x,fromCell.y+2*dir))if(!pieceAt(t.key,s))out.push({from:fromCell.key,to:t.key,doublePawn:true,pass:{x:fromCell.x,y:fromCell.y+dir}});
    }
  }
  for(const dx of[-1,1]){
    const targets=columnAt(fromCell.x+dx,fromCell.y+dir);
    for(const target of targets){
      const occ=pieceAt(target.key,s);
      if(attackOnly){out.push({from:fromCell.key,to:target.key,attackOnly:true});continue}
      if(occ&&occ.color!==piece.color){out.push({from:fromCell.key,to:target.key,capture:target.key});continue}
      if(!occ&&s.enPassant&&s.enPassant.x===target.x&&s.enPassant.y===target.y&&s.enPassant.by!==piece.color){
        const victim=pieceAt(s.enPassant.victim,s);if(victim?.type==='p'&&victim.color!==piece.color)out.push({from:fromCell.key,to:target.key,capture:s.enPassant.victim,enPassant:true});
      }
    }
  }
  return dedupeMoves(out);
}

function pseudoMovesForCell(key,s=state,attackOnly=false){
  const piece=pieceAt(key,s),from=cells.get(key);if(!piece||!from)return[];
  if(piece.type==='p')return pawnMoves(from,piece,s,attackOnly);
  if(piece.type==='n')return knightMoves(from,piece,s,attackOnly);
  if(piece.type==='k')return dedupeMoves([...kingMoves(from,piece,s,attackOnly),...(attackOnly?[]:castleMoves(key,piece,s))]);
  let out=[];
  if(piece.type==='r'||piece.type==='q')out.push(...rayMoves(from,piece,[[1,0],[-1,0],[0,1],[0,-1]],s,attackOnly));
  if(piece.type==='b'||piece.type==='q')out.push(...rayMoves(from,piece,[[1,1],[1,-1],[-1,1],[-1,-1]],s,attackOnly));
  return dedupeMoves(out);
}
function findKing(color,s=state){return Object.keys(s.pieces).find(k=>s.pieces[k]?.color===color&&s.pieces[k]?.type==='k')||null}
function squareAttacked(targetKey,byColor,s=state){for(const [key,p] of Object.entries(s.pieces))if(p.color===byColor&&pseudoMovesForCell(key,s,true).some(m=>m.to===targetKey))return true;return false}
function inCheck(color,s=state){const k=findKing(color,s);return k?squareAttacked(k,opponent(color),s):true}

function forwardExtensionExists(target,piece,s=state){
  const dir=piece.color==='w'?-1:1;
  return columnAt(target.x,target.y+dir).some(c=>isAttackBoard(c.board));
}
function promotionDue(piece,target,s=state){
  if(piece.type!=='p'||!target)return false;
  if(piece.color==='w'){
    if(target.y<0)return true;
    if(target.y===0)return !forwardExtensionExists(target,piece,s);
  }else{
    if(target.y>7)return true;
    if(target.y===7)return !forwardExtensionExists(target,piece,s);
  }
  return false;
}
function applyMoveToState(move,s=state,promotion='q'){
  const next=cloneState(s),piece=next.pieces[move.from];if(!piece)return next;
  delete next.pieces[move.from];if(move.capture)delete next.pieces[move.capture];
  if(move.castle){
    const rook=next.pieces[move.castle.rookFrom];delete next.pieces[move.castle.rookFrom];
    if(rook){rook.moved=true;next.pieces[move.castle.rookTo]=rook}
  }
  piece.moved=true;const target=cells.get(move.to);if(promotionDue(piece,target,next))piece.type=promotion;
  next.pieces[move.to]=piece;next.enPassant=null;
  if(move.doublePawn)next.enPassant={x:move.pass.x,y:move.pass.y,victim:move.to,by:piece.color};
  next.turn=opponent(piece.color);next.lastMove={kind:'piece',from:move.from,to:move.to,capture:move.capture||null,piece:piece.type,color:piece.color,castle:move.castle?.name||null};
  next.selected=null;next.legal=[];next.ply=(next.ply||0)+1;next.version=VERSION;next.ruleset=RULESET;return next;
}
function legalMovesForCell(key,s=state){
  const p=pieceAt(key,s);if(!p)return[];
  return pseudoMovesForCell(key,s,false).filter(m=>{
    if(m.capture&&pieceAt(m.capture,s)?.type==='k')return false;
    const test=applyMoveToState(m,s,'q');rebuildGeometry(test);const safe=!inCheck(p.color,test);rebuildGeometry(s);return safe;
  });
}
function allLegalMoves(color,s=state){const out=[];for(const [k,p] of Object.entries(s.pieces))if(p.color===color)out.push(...legalMovesForCell(k,s));return out}

function projectedColumnOccupied(key,s=state){
  const cell=cells.get(key);if(!cell)return Boolean(pieceAt(key,s));
  return columnAt(cell.x,cell.y).some(candidate=>Boolean(pieceAt(candidate.key,s)));
}

function castleMoves(key,piece,s=state){
  if(piece.type!=='k'||piece.moved||inCheck(piece.color,s))return[];
  const white=piece.color==='w',kingFrom=white?'L:C1':'U:C4';if(key!==kingFrom)return[];
  if((white&&(s.ply||0)<2)||(!white&&(s.ply||0)<3))return[];
  const plans=white?[
    {board:'B2',rookFrom:'B2:B1',kingTo:'B2:B1',rookTo:'L:C1',clear:['L:D1','B2:A1'],name:'O-O'},
    {board:'B1',rookFrom:'B1:A1',kingTo:'B1:B1',rookTo:'L:C1',clear:['L:A1','L:B1','B1:B1'],name:'O-O-O'}
  ]:[
    {board:'A2',rookFrom:'A2:B1',kingTo:'A2:B1',rookTo:'U:C4',clear:['U:D4','A2:A1'],name:'O-O'},
    {board:'A1',rookFrom:'A1:A1',kingTo:'A1:B1',rookTo:'U:C4',clear:['U:A4','U:B4','A1:B1'],name:'O-O-O'}
  ];
  const out=[];
  for(const plan of plans){
    const rook=pieceAt(plan.rookFrom,s);if(!rook||rook.color!==piece.color||rook.type!=='r'||rook.moved)continue;
    if(s.attackMoved?.[plan.board]||s.attackMounts?.[plan.board]!==INITIAL_MOUNTS[plan.board])continue;
    if(plan.clear.some(q=>projectedColumnOccupied(q,s)))continue;
    const m={from:key,to:plan.kingTo,castle:{...plan}};const test=applyMoveToState(m,s,'q');rebuildGeometry(test);const safe=!inCheck(piece.color,test);rebuildGeometry(s);if(safe)out.push(m);
  }
  return out;
}

function slotOccupied(slotId,exceptBoard,s=state){return Object.entries(s.attackMounts||{}).some(([id,slot])=>id!==exceptBoard&&slot===slotId)}
function candidateAttackSlots(boardId,s=state){
  const current=SLOTS[s.attackMounts?.[boardId]||INITIAL_MOUNTS[boardId]];if(!current)return[];
  const out=[];const cc=CORNERS[current.corner];
  for(const slot of Object.values(SLOTS)){
    if(slot.id===current.id)continue;
    if(slot.main===current.main){
      const sc=CORNERS[slot.corner];
      if(sc.row===cc.row||sc.col===cc.col)out.push(slot.id);
      continue;
    }
    const di=Math.abs(MAIN_ORDER.indexOf(slot.main)-MAIN_ORDER.indexOf(current.main));if(di!==1)continue;
    const dx=Math.abs(slot.anchorX-current.anchorX),dy=Math.abs(slot.anchorY-current.anchorY);
    const orthogonal=(dx===0&&dy>0&&dy<=2)||(dy===0&&dx>0&&dx<=2);
    if(orthogonal)out.push(slot.id);
  }
  return [...new Set(out)].filter(id=>!slotOccupied(id,boardId,s));
}
function attackBoardEligible(boardId,color,s=state){
  const occ=boardOccupants(boardId,s);if(occ.length>1)return false;
  if(occ.length===1)return occ[0][1].color===color;
  return ATTACK_ORIGINAL_OWNER[boardId]===color;
}
function applyAttackBoardMoveToState(boardId,targetSlot,rotate,s=state){
  const next=cloneState(s),color=s.turn,fromSlot=next.attackMounts[boardId];next.attackMounts[boardId]=targetSlot;
  if(rotate)next.attackRotations[boardId]=!next.attackRotations[boardId];next.attackMoved={...INITIAL_ATTACK_MOVED,...(next.attackMoved||{})};next.attackMoved[boardId]=true;
  const occ=boardOccupants(boardId,next);if(occ.length===1&&occ[0][1].type==='p')occ[0][1].moved=true;
  next.turn=opponent(color);next.enPassant=null;next.selected=null;next.legal=[];next.ply=(next.ply||0)+1;
  next.lastMove={kind:'board',board:boardId,fromSlot,toSlot:targetSlot,rotated:Boolean(rotate),color};next.version=VERSION;next.ruleset=RULESET;return next;
}
function riderMotionAllowed(boardId,targetSlot,rotate,s=state){
  const occ=boardOccupants(boardId,s);if(occ.length===0)return true;if(occ.length!==1)return false;
  const current=SLOTS[s.attackMounts?.[boardId]],target=SLOTS[targetSlot],p=occ[0][1];if(!current||!target)return false;
  return p.color==='w'?target.anchorY<=current.anchorY:target.anchorY>=current.anchorY;
}
function attackBoardMoveSafe(boardId,targetSlot,rotate,s=state){
  if(!attackBoardEligible(boardId,s.turn,s)||!riderMotionAllowed(boardId,targetSlot,rotate,s))return false;
  const color=s.turn,test=applyAttackBoardMoveToState(boardId,targetSlot,rotate,s);rebuildGeometry(test);const safe=!inCheck(color,test);rebuildGeometry(s);return safe;
}
function legalAttackBoardMoves(boardId,s=state){
  if(!attackBoardEligible(boardId,s.turn,s))return[];const out=[];
  for(const target of candidateAttackSlots(boardId,s))for(const rotate of[false,true])if(attackBoardMoveSafe(boardId,target,rotate,s))out.push({kind:'board',board:boardId,target,rotate});
  return out;
}
function allLegalAttackBoardMoves(color,s=state){if(color!==s.turn)return[];return ATTACK_IDS.flatMap(id=>legalAttackBoardMoves(id,s))}
function gameStatus(s=state){const p=allLegalMoves(s.turn,s),b=allLegalAttackBoardMoves(s.turn,s),check=inCheck(s.turn,s);if(p.length||b.length)return{over:false,check};return check?{over:true,winner:opponent(s.turn),checkmate:true}:{over:true,winner:null,stalemate:true}}

function choosePromotion(color){const a=(window.prompt(`${color==='w'?'White':'Black'} pawn promotion: Q, R, B, or N`,'Q')||'Q').trim().toLowerCase()[0];return['q','r','b','n'].includes(a)?a:'q'}
function moveLabel(m,p){if(m.castle)return`${m.castle.name} Tri-D castle`;const a=cells.get(m.from),b=cells.get(m.to);return`${NAMES[p.type]} ${a.board}-${a.local} to ${b.board}-${b.local}${m.capture?' capture':''}`}
function finishIfNeeded(){const st=gameStatus(state);if(st.over){state.gameOver=true;state.winner=st.winner}return st}

function handleCell(key){
  if(state.gameOver)return;const cell=cells.get(key);
  if(attackMode){if(cell&&isAttackBoard(cell.board))selectAttackBoard(cell.board);return}
  if(state.novaBlack&&state.turn==='b')return;
  const p=pieceAt(key),chosen=state.legal.find(m=>m.to===key);
  if(state.selected&&chosen){
    const moving=pieceAt(state.selected);let promo='q';const target=cells.get(chosen.to);if(promotionDue(moving,target,state))promo=choosePromotion(moving.color);
    const label=moveLabel(chosen,moving);state=applyMoveToState(chosen,state,promo);rebuildGeometry(state);const st=finishIfNeeded();save();render();
    setStatus(st.over?(st.checkmate?`${label}. Checkmate. ${st.winner==='w'?'White':'Black'} wins.`:`${label}. Stalemate.`):`${label}. ${st.check?'Check. ':''}${state.turn==='w'?'White':'Black'} to move.`);
    if(!st.over&&state.novaBlack&&state.turn==='b')setTimeout(makeNovaMove,450);return;
  }
  if(p?.color===state.turn){state.selected=key;state.legal=legalMovesForCell(key,state);render();setStatus(`${NAMES[p.type]} selected. ${state.legal.length} legal destination${state.legal.length===1?'':'s'}.`)}
  else{state.selected=null;state.legal=[];render()}
}

function installAttackControls(){
  if(!gameActions||document.getElementById('attackBoardMode'))return;
  const move=document.createElement('button');move.id='attackBoardMode';move.type='button';move.textContent='Move Attack Board';
  const rot=document.createElement('button');rot.id='attackRotate';rot.type='button';rot.textContent='Rotate with Move: OFF';rot.disabled=true;
  gameActions.append(move,rot);
}
function toggleAttackMode(){
  if(state.gameOver)return;if(state.novaBlack&&state.turn==='b'){setStatus('Nova is commanding Black right now.');return}
  if(attackMode){exitAttackMode('Attack-board move cancelled.');return}
  const eligible=ATTACK_IDS.filter(id=>attackBoardEligible(id,state.turn,state)&&legalAttackBoardMoves(id,state).length);
  if(!eligible.length){setStatus('No attack board can move. It must contain exactly one of your pieces other than the king.');return}
  attackMode=true;pendingAttackBoard=null;rotateOnMove=false;state.selected=null;state.legal=[];render();setStatus('Attack-board mode. Choose a glowing 2x2 board.');
}
function selectAttackBoard(id){
  if(!attackBoardEligible(id,state.turn,state)){setStatus('That attack board is not eligible.');return}
  pendingAttackBoard=id;rotateOnMove=false;render();renderMountTargets();setStatus(`${id} selected. Choose a glowing legal corner.`);
}
function toggleAttackRotation(){if(!attackMode||!pendingAttackBoard)return;rotateOnMove=!rotateOnMove;renderMountTargets();render();setStatus(`${pendingAttackBoard} will ${rotateOnMove?'rotate 180 degrees':'keep its orientation'}.`)}
function clearMountTargets(){for(const b of mountButtons.values())b.remove();mountButtons.clear()}
function renderMountTargets(){
  clearMountTargets();if(!attackMode||!pendingAttackBoard)return;
  for(const slotId of candidateAttackSlots(pendingAttackBoard,state)){
    if(!attackBoardMoveSafe(pendingAttackBoard,slotId,rotateOnMove,state))continue;const slot=SLOTS[slotId],b=document.createElement('button');
    b.type='button';b.className='attack-mount';b.textContent='✦';b.style.left=`${slot.left+50}px`;b.style.top=`${slot.top+30}px`;b.setAttribute('aria-label',`Move ${pendingAttackBoard} to ${slot.label}`);
    b.addEventListener('click',()=>commitAttackBoardMove(pendingAttackBoard,slotId,rotateOnMove));scene.appendChild(b);mountButtons.set(slotId,b);
  }
}
function exitAttackMode(msg=''){attackMode=false;pendingAttackBoard=null;rotateOnMove=false;clearMountTargets();render();if(msg)setStatus(msg)}
function promoteDuePawnsAfterBoardMove(moverColor,interactive=false){
  for(const [key,p] of Object.entries(state.pieces)){
    if(p.type!=='p'||!promotionDue(p,cells.get(key),state))continue;
    p.type=interactive&&p.color===moverColor?choosePromotion(p.color):'q';
  }
}
function commitAttackBoardMove(id,target,rotate){
  if(!attackMode||id!==pendingAttackBoard||!candidateAttackSlots(id,state).includes(target)||!attackBoardMoveSafe(id,target,rotate,state)){setStatus('That attack-board move is not legal.');return}
  const color=state.turn,from=state.attackMounts[id];state=applyAttackBoardMoveToState(id,target,rotate,state);rebuildGeometry(state);promoteDuePawnsAfterBoardMove(color,true);attackMode=false;pendingAttackBoard=null;rotateOnMove=false;clearMountTargets();const st=finishIfNeeded();save();render();
  const label=`${id} attack board ${from} to ${target}${rotate?' with 180 degree rotation':''}`;setStatus(st.over?(st.checkmate?`${label}. Checkmate.`:`${label}. Stalemate.`):`${label}. ${inCheck(state.turn,state)?'Check. ':''}${state.turn==='w'?'White':'Black'} to move.`);if(!st.over&&state.novaBlack&&state.turn==='b')setTimeout(makeNovaMove,450);
}

function makeNovaMove(){
  if(!state.novaBlack||state.turn!=='b'||state.gameOver)return;const pieceMoves=allLegalMoves('b',state),boardMoves=allLegalAttackBoardMoves('b',state);if(!pieceMoves.length&&!boardMoves.length){finishIfNeeded();save();render();return}
  if(boardMoves.length&&(pieceMoves.length===0||Math.random()<.12)){
    let choice=boardMoves[0],best=-1e9;for(const a of boardMoves){const t=applyAttackBoardMoveToState(a.board,a.target,a.rotate,state);rebuildGeometry(t);let score=Math.random()*1.2+(inCheck('w',t)?4:0);rebuildGeometry(state);if(score>best){best=score;choice=a}}
    const from=state.attackMounts[choice.board];state=applyAttackBoardMoveToState(choice.board,choice.target,choice.rotate,state);rebuildGeometry(state);promoteDuePawnsAfterBoardMove('b',false);finishIfNeeded();save();render();if(!state.gameOver)setStatus(`Nova moved ${choice.board} ${from} to ${choice.target}. White to move.`);return;
  }
  let choice=pieceMoves[0],best=-1e9;for(const m of pieceMoves){const target=pieceAt(m.capture||m.to,state),moving=pieceAt(m.from,state);let score=(target?VALUES[target.type]*10:0)+Math.random()*2;const t=applyMoveToState(m,state,'q');rebuildGeometry(t);if(inCheck('w',t))score+=3;if(moving.type==='p'&&promotionDue(moving,cells.get(m.to),state))score+=8;if(m.castle)score+=1.5;rebuildGeometry(state);if(score>best){best=score;choice=m}}
  const moving=pieceAt(choice.from,state),label=moveLabel(choice,moving);state=applyMoveToState(choice,state,'q');rebuildGeometry(state);finishIfNeeded();save();render();if(!state.gameOver)setStatus(`Nova: ${label}. ${inCheck('w',state)?'Check. ':''}White to move.`);
}

function glassSvg(type,color,suffix){
  const id=`g${++pieceSerial}_${suffix}`,light=color==='w'?'#f9ffff':'#8ae5ff',mid=color==='w'?'#a9efff':'#208de9',deep=color==='w'?'#176f99':'#072a82',stroke=color==='w'?'#f5ffff':'#a8ebff';
  const common=`fill="url(#${id})" stroke="${stroke}" class="glass-body"`;
  const base=`<ellipse class="glass-base-shadow" cx="50" cy="151" rx="33" ry="8"/><path ${common} d="M20 145 Q50 132 80 145 L76 154 Q50 164 24 154 Z"/><path class="glass-highlight" stroke="${stroke}" d="M29 147 Q50 140 70 147"/>`;
  let body='';
  if(type==='p')body=`<path ${common} d="M35 132 Q40 105 44 78 Q34 70 36 58 Q38 45 50 43 Q62 45 64 58 Q66 70 56 78 Q60 105 65 132 Z"/><circle ${common} cx="50" cy="36" r="15"/>`;
  if(type==='r')body=`<path ${common} d="M32 132 L38 72 L31 63 L31 38 L39 38 L39 48 L47 48 L47 38 L55 38 L55 48 L63 48 L63 38 L71 38 L71 63 L62 72 L68 132 Z"/>`;
  if(type==='b')body=`<path ${common} d="M33 132 Q40 103 44 78 Q34 68 37 53 Q40 38 50 25 Q61 39 63 53 Q66 68 56 78 Q60 103 67 132 Z"/><path class="glass-cut" d="M52 31 L46 54"/>`;
  if(type==='n')body=`<path ${common} d="M31 132 Q38 109 39 91 Q37 77 42 66 Q47 54 45 39 Q58 44 69 58 Q75 67 69 80 L58 77 Q54 84 60 94 Q64 105 67 132 Z"/><path ${common} d="M45 39 L36 29 L40 51 Z"/><circle fill="${stroke}" cx="58" cy="60" r="2.4"/>`;
  if(type==='q')body=`<path ${common} d="M31 132 Q38 104 42 79 L34 63 L38 42 L47 56 L50 31 L54 56 L64 42 L67 63 L58 79 Q62 104 69 132 Z"/><circle ${common} cx="38" cy="38" r="5"/><circle ${common} cx="50" cy="27" r="5"/><circle ${common} cx="64" cy="38" r="5"/>`;
  if(type==='k')body=`<path ${common} d="M31 132 Q38 103 43 77 Q34 67 38 55 Q42 43 50 40 Q59 43 63 55 Q67 67 57 77 Q62 103 69 132 Z"/><path ${common} d="M47 39 L47 24 L39 24 L39 17 L47 17 L47 9 L54 9 L54 17 L62 17 L62 24 L54 24 L54 39 Z"/>`;
  return `<svg viewBox="0 0 100 170" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${light}" stop-opacity=".92"/><stop offset=".38" stop-color="${mid}" stop-opacity=".32"/><stop offset=".65" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="${deep}" stop-opacity=".5"/></linearGradient></defs>${base}${body}<path class="glass-highlight" stroke="${stroke}" d="M31 135 Q50 128 69 135"/></svg>`;
}
function makePiece(p){
  const token=document.createElement('span');token.className=`piece ${p.color==='w'?'crystal':'sapphire'} piece-${p.type}`;token.setAttribute('role','img');token.setAttribute('aria-label',`${p.color==='w'?'White':'Black'} ${NAMES[p.type]}`);
  const face=document.createElement('span');face.className='piece-plane piece-face';face.innerHTML=glassSvg(p.type,p.color,'f');
  const side=document.createElement('span');side.className='piece-plane piece-side';side.innerHTML=glassSvg(p.type,p.color,'s');
  token.append(face,side);return token;
}
function render(){
  rebuildGeometry(state);const eligible=new Set(attackMode?ATTACK_IDS.filter(id=>attackBoardEligible(id,state.turn,state)&&legalAttackBoardMoves(id,state).length):[]);
  for(const [key,cell] of cells){const el=cell.el;el.replaceChildren();el.classList.remove('selected','legal','capture','last','check');const p=pieceAt(key);
    if(state.selected===key)el.classList.add('selected');const lm=state.legal.find(m=>m.to===key);if(lm)el.classList.add(lm.capture?'capture':'legal');if(state.lastMove?.kind==='piece'&&(state.lastMove.from===key||state.lastMove.to===key))el.classList.add('last');const king=findKing(state.turn,state);if(king===key&&inCheck(state.turn,state))el.classList.add('check');if(p)el.appendChild(makePiece(p));}
  for(const id of ATTACK_IDS){const platform=document.querySelector(`[data-board="${id}"]`);if(platform){platform.classList.toggle('ab-eligible',eligible.has(id));platform.classList.toggle('ab-selected',pendingAttackBoard===id)}}
  novaBtn?.classList.toggle('active',state.novaBlack);if(novaBtn)novaBtn.textContent=`Nova Black: ${state.novaBlack?'ON':'OFF'}`;
  if(attackModeBtn){attackModeBtn.classList.toggle('active',attackMode);attackModeBtn.textContent=attackMode?'Cancel Board Move':'Move Attack Board'}
  if(rotateBtn){rotateBtn.disabled=!attackMode||!pendingAttackBoard;rotateBtn.classList.toggle('active',rotateOnMove);rotateBtn.textContent=`Rotate with Move: ${rotateOnMove?'ON':'OFF'}`}
}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({...state,selected:null,legal:[]}))}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s?.version===VERSION&&s?.ruleset===RULESET&&s.pieces&&s.attackMounts){state={...freshState(s.novaBlack!==false),...s,selected:null,legal:[]};return true}}catch{}return false}
function resetGame(){exitAttackMode();state=freshState(state.novaBlack);rebuildGeometry(state);save();render();setStatus('New W3DCF Tri-D game. White to move.')}
function toggleNova(){state.novaBlack=!state.novaBlack;save();render();setStatus(state.novaBlack?'Nova will command Black.':'Two-player local mode.');if(state.novaBlack&&state.turn==='b'&&!state.gameOver)setTimeout(makeNovaMove,350)}
function flip(){state.orientation=state.orientation==='white'?'black':'white';scene?.classList.toggle('flipped',state.orientation==='black');save()}
function setStatus(t){if(statusEl)statusEl.textContent=t}

for(const [key,cell] of cells)cell.el.addEventListener('click',()=>handleCell(key));
newGameBtn?.addEventListener('click',resetGame);novaBtn?.addEventListener('click',toggleNova);flipBtn?.addEventListener('click',flip);attackModeBtn?.addEventListener('click',toggleAttackMode);rotateBtn?.addEventListener('click',toggleAttackRotation);
const restored=load();rebuildGeometry(state);scene?.classList.toggle('flipped',state.orientation==='black');render();const st=gameStatus(state);
if(st.over){state.gameOver=true;state.winner=st.winner;setStatus(st.checkmate?`Checkmate. ${st.winner==='w'?'White':'Black'} wins.`:'Stalemate.')}else setStatus(restored?`W3DCF game restored. ${state.turn==='w'?'White':'Black'} to move${st.check?' in check':''}.`:'W3DCF-based Tri-D V6 ready. White to move.');
if(state.novaBlack&&state.turn==='b'&&!state.gameOver)setTimeout(makeNovaMove,450);
const chip=document.querySelector('.mode-chip');if(chip)chip.textContent='ASTRALIS TRI-D V6 · W3DCF-BASED';
window.AstralisTriD={
  version:VERSION,ruleset:RULESET,state:()=>cloneState(state),legalMovesForCell:(k)=>legalMovesForCell(k,state),candidateAttackSlots:(id)=>candidateAttackSlots(id,state),
  test:{
    freshState:(nova=false)=>freshState(nova),slots:()=>cloneState(SLOTS),
    legalMoves:(key,input)=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=cloneState(legalMovesForCell(key,next));state=prior;rebuildGeometry(prior);return result},
    pseudoMoves:(key,input,attackOnly=false)=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=cloneState(pseudoMovesForCell(key,next,attackOnly));state=prior;rebuildGeometry(prior);return result},
    allLegalMoves:(color,input)=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=cloneState(allLegalMoves(color,next));state=prior;rebuildGeometry(prior);return result},
    attacked:(key,byColor,input)=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=squareAttacked(key,byColor,next);state=prior;rebuildGeometry(prior);return result},
    attackBoardMoves:(id,input)=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=cloneState(legalAttackBoardMoves(id,next));state=prior;rebuildGeometry(prior);return result},
    applyMove:(move,input,promotion='q')=>{const prior=state,next=cloneState(input);state=next;rebuildGeometry(next);const result=applyMoveToState(move,next,promotion);state=prior;rebuildGeometry(prior);return result}
  }
};
})();
