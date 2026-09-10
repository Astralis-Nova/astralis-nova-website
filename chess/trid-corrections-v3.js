(()=>{
'use strict';
const V3_MAIN_ORDER=['U','M','L'];
const V3_CORNERS={NW:{row:'N',col:'W',dx:-1,dy:-1,ax:0,ay:0},NE:{row:'N',col:'E',dx:3,dy:-1,ax:3,ay:0},SW:{row:'S',col:'W',dx:-1,dy:3,ax:0,ay:3},SE:{row:'S',col:'E',dx:3,dy:3,ax:3,ay:3}};
const V3_VISUAL={U:{left:166,top:64,zpx:110},M:{left:181,top:218,zpx:45},L:{left:45,top:425,zpx:-15}};
const V3_LEGACY={L0:'P_U_NW_U',R0:'P_U_NE_U',L3:'P_L_SW_D',R3:'P_L_SE_D'};
const V3_CANONICAL={};
function makeSlots(){
  for(const main of V3_MAIN_ORDER){
    const def=MAIN_DEFS[main],visual=V3_VISUAL[main];
    for(const[corner,c]of Object.entries(V3_CORNERS))for(const relation of['U','D']){
      const id=`P_${main}_${corner}_${relation}`;
      const right=c.col==='E',south=c.row==='S';
      let left=visual.left+(right?253:-48),top=visual.top+(south?138:-3)+(relation==='U'?-16:18),zpx=visual.zpx+(relation==='U'?40:-38);
      if(id==='P_U_NW_U'){left=118;top=61;zpx=150}
      if(id==='P_U_NE_U'){left=419;top=58;zpx=150}
      if(id==='P_L_SW_D'){left=15;top=274;zpx=5}
      if(id==='P_L_SE_D'){left=449;top=488;zpx=5}
      V3_CANONICAL[id]={id,main,corner,relation,ox:def.ox+c.dx,oy:def.oy+c.dy,anchorX:def.ox+c.ax,anchorY:def.oy+c.ay,z:def.z+(relation==='U'?.5:-.5),left,top,zpx,label:`${main} ${corner} ${relation==='U'?'above':'below'}`};
    }
  }
}
makeSlots();
for(const key of['L1','L2','R1','R2'])delete ATTACK_SLOTS[key];
Object.assign(ATTACK_SLOTS,V3_CANONICAL);
function canon(slot){return V3_LEGACY[slot]||slot}
const oldMountForBoard=mountForBoard;
mountForBoard=function(id,s=state){return ATTACK_SLOTS[canon(s.attackMounts?.[id]||INITIAL_MOUNTS[id])]||oldMountForBoard(id,s)};
currentDef=function(id,s=state){return MAIN_DEFS[id]||{size:2,...mountForBoard(id,s)}};
slotOccupied=function(slotId,exceptBoard,s=state){const wanted=canon(slotId);return Object.entries(s.attackMounts||{}).some(([id,slot])=>id!==exceptBoard&&canon(slot)===wanted)};
function sameBoardPins(currentId){
  const current=V3_CANONICAL[canon(currentId)];if(!current)return[];
  const cc=V3_CORNERS[current.corner];
  return Object.values(V3_CANONICAL).filter(s=>s.main===current.main&&s.relation===current.relation&&s.id!==current.id&&(V3_CORNERS[s.corner].row===cc.row||V3_CORNERS[s.corner].col===cc.col));
}
function neighborMain(main,dir){const i=V3_MAIN_ORDER.indexOf(main),j=i+dir;return j>=0&&j<V3_MAIN_ORDER.length?V3_MAIN_ORDER[j]:null}
function verticalPins(currentId){
  const current=V3_CANONICAL[canon(currentId)];if(!current)return[];
  const out=[];
  for(const dir of[-1,1]){
    const nextMain=neighborMain(current.main,dir);if(!nextMain)continue;
    const candidates=Object.values(V3_CANONICAL).filter(s=>s.main===nextMain);
    let best=Infinity;
    for(const s of candidates){const d=(s.anchorX-current.anchorX)**2+(s.anchorY-current.anchorY)**2+((s.z-current.z)*1.4)**2;if(d<best)best=d}
    out.push(...candidates.filter(s=>Math.abs(((s.anchorX-current.anchorX)**2+(s.anchorY-current.anchorY)**2+((s.z-current.z)*1.4)**2)-best)<1e-7));
  }
  return out;
}
candidateAttackSlots=function(boardId,s=state){
  const current=s.attackMounts?.[boardId]||INITIAL_MOUNTS[boardId];
  return [...new Set([...sameBoardPins(current),...verticalPins(current)].map(s=>s.id))].filter(id=>!slotOccupied(id,boardId,s));
};
const oldApplyAttackBoardVisuals=applyAttackBoardVisuals;
applyAttackBoardVisuals=function(s=state){
  for(const id of ATTACK_IDS){
    const platform=document.querySelector(`[data-board="${id}"]`),slot=mountForBoard(id,s);if(!platform||!slot)continue;
    platform.style.setProperty('--ab-left',`${slot.left}px`);platform.style.setProperty('--ab-top',`${slot.top}px`);platform.style.setProperty('--ab-z',`${slot.zpx}px`);platform.style.setProperty('--ab-rot',s.attackRotations?.[id]?'180deg':'0deg');platform.dataset.mount=canon(s.attackMounts[id]);
  }
};
let pieceSerial=0;
function glassSvg(type,color){
  const id=`glassV3_${++pieceSerial}`,light=color==='w'?'#f7ffff':'#85deff',mid=color==='w'?'#a8efff':'#218ce9',deep=color==='w'?'#1c86b6':'#06318f',stroke=color==='w'?'#f2ffff':'#a8ebff';
  const common=`fill="url(#${id})" stroke="${stroke}" class="glass-body"`;
  const base=`<ellipse class="glass-base-shadow" cx="50" cy="151" rx="33" ry="8"/><path ${common} d="M20 145 Q50 132 80 145 L76 154 Q50 164 24 154 Z"/><path class="glass-highlight" stroke="${stroke}" d="M29 147 Q50 140 70 147"/>`;
  let body='';
  if(type==='p')body=`<path ${common} d="M35 132 Q40 105 44 78 Q34 70 36 58 Q38 45 50 43 Q62 45 64 58 Q66 70 56 78 Q60 105 65 132 Z"/><circle ${common} cx="50" cy="36" r="15"/><path class="glass-highlight" stroke="${stroke}" d="M43 28 Q50 23 57 29 M43 86 Q50 80 57 86"/>`;
  if(type==='r')body=`<path ${common} d="M32 132 L38 72 L31 63 L31 38 L39 38 L39 48 L47 48 L47 38 L55 38 L55 48 L63 48 L63 38 L71 38 L71 63 L62 72 L68 132 Z"/><path class="glass-highlight" stroke="${stroke}" d="M39 78 L61 78 M38 55 L64 55"/>`;
  if(type==='b')body=`<path ${common} d="M33 132 Q40 103 44 78 Q34 68 37 53 Q40 38 50 25 Q61 39 63 53 Q66 68 56 78 Q60 103 67 132 Z"/><path class="glass-highlight" stroke="${stroke}" d="M52 31 L46 54 M41 83 Q50 77 59 83"/>`;
  if(type==='n')body=`<path ${common} d="M31 132 Q38 109 39 91 Q37 77 42 66 Q47 54 45 39 Q58 44 69 58 Q75 67 69 80 L58 77 Q54 84 60 94 Q64 105 67 132 Z"/><path ${common} d="M45 39 L36 29 L40 51 Z"/><circle fill="${stroke}" cx="58" cy="60" r="2.4"/><path class="glass-highlight" stroke="${stroke}" d="M46 69 Q56 61 66 68 M41 98 Q51 91 61 98"/>`;
  if(type==='q')body=`<path ${common} d="M31 132 Q38 104 42 79 L34 63 L38 42 L47 56 L50 31 L54 56 L64 42 L67 63 L58 79 Q62 104 69 132 Z"/><circle ${common} cx="38" cy="38" r="5"/><circle ${common} cx="50" cy="27" r="5"/><circle ${common} cx="64" cy="38" r="5"/><path class="glass-highlight" stroke="${stroke}" d="M40 83 Q50 77 60 83 M38 66 Q50 61 62 66"/>`;
  if(type==='k')body=`<path ${common} d="M31 132 Q38 103 43 77 Q34 67 38 55 Q42 43 50 40 Q59 43 63 55 Q67 67 57 77 Q62 103 69 132 Z"/><path ${common} d="M47 39 L47 24 L39 24 L39 17 L47 17 L47 9 L54 9 L54 17 L62 17 L62 24 L54 24 L54 39 Z"/><path class="glass-highlight" stroke="${stroke}" d="M41 83 Q50 76 59 83"/>`;
  return `<svg viewBox="0 0 100 170" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${light}" stop-opacity=".88"/><stop offset=".34" stop-color="${mid}" stop-opacity=".30"/><stop offset=".62" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="${deep}" stop-opacity=".48"/></linearGradient></defs>${base}${body}</svg>`;
}
function upgradePieces(){
  document.querySelectorAll('.piece').forEach(el=>{
    const type=['k','q','r','b','n','p'].find(t=>el.classList.contains(`piece-${t}`));if(!type)return;
    const color=el.classList.contains('crystal')?'w':'b';
    el.innerHTML=glassSvg(type,color);el.removeAttribute('data-glyph');
  });
}
const oldRender=render;
render=function(){oldRender();upgradePieces()};
const oldResetGame=resetGame;
resetGame=function(){oldResetGame();upgradePieces()};
const oldSetStatus=setStatus;
setStatus=function(text){oldSetStatus(text)};
rebuildGeometry(state);render();save();
const chip=document.querySelector('.mode-chip');if(chip)chip.textContent='TRI-D CORE V3';
if(statusEl)statusEl.textContent='Tri-D V3 active: 24 attack-board pin positions and upright glass pieces.';
})();
