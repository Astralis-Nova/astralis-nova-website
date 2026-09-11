(()=>{
'use strict';

const STORAGE_KEY='astralis-trichess-layout-v2';
const LEGACY_KEY='astralis-trichess-layout-v1';
const scene=document.getElementById('scene');
if(!scene)return;

const platforms=[...scene.querySelectorAll('.main-board,.attack')];
const byId=id=>platforms.find(el=>el.dataset.board===id);
const isAttack=el=>el.classList.contains('attack');
const num=v=>Number.isFinite(parseFloat(v))?parseFloat(v):0;

function baseAttackPosition(el){
  const cs=getComputedStyle(el);
  return{
    left:num(cs.getPropertyValue('--ab-left')),
    top:num(cs.getPropertyValue('--ab-top'))
  };
}

function currentPosition(el){
  const cs=getComputedStyle(el);
  return{left:num(cs.left),top:num(cs.top)};
}

function seedMainVars(){
  for(const el of platforms){
    if(isAttack(el))continue;
    if(!el.style.getPropertyValue('--layout-left')){
      const pos=currentPosition(el);
      el.style.setProperty('--layout-left',`${Math.round(pos.left)}px`);
      el.style.setProperty('--layout-top',`${Math.round(pos.top)}px`);
    }
  }
}

function normalizeLayout(raw){
  if(!raw?.boards)return null;
  if(raw.version===2)return raw;
  const converted={version:2,scene:{width:scene.offsetWidth,height:scene.offsetHeight},boards:{}};
  for(const el of platforms){
    const id=el.dataset.board;
    const p=raw.boards[id];
    if(!p)continue;
    if(isAttack(el)){
      const base=baseAttackPosition(el);
      converted.boards[id]={
        dx:Math.round((Number(p.left)||0)-base.left),
        dy:Math.round((Number(p.top)||0)-base.top),
        left:Math.round(Number(p.left)||base.left),
        top:Math.round(Number(p.top)||base.top)
      };
    }else{
      converted.boards[id]={left:Math.round(Number(p.left)||0),top:Math.round(Number(p.top)||0)};
    }
  }
  return converted;
}

function readSaved(){
  try{
    const modern=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(modern?.boards)return normalizeLayout(modern);
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
    if(legacy?.boards)return normalizeLayout(legacy);
  }catch{}
  return null;
}

function applyLayout(layout){
  if(!layout?.boards)return false;
  seedMainVars();
  for(const el of platforms){
    const id=el.dataset.board;
    const p=layout.boards[id];
    if(!p)continue;
    if(isAttack(el)){
      let dx=Number(p.dx),dy=Number(p.dy);
      if(!Number.isFinite(dx)||!Number.isFinite(dy)){
        const base=baseAttackPosition(el);
        dx=(Number(p.left)||base.left)-base.left;
        dy=(Number(p.top)||base.top)-base.top;
      }
      el.style.setProperty('--layout-dx',`${Math.round(dx)}px`);
      el.style.setProperty('--layout-dy',`${Math.round(dy)}px`);
    }else{
      if(Number.isFinite(Number(p.left)))el.style.setProperty('--layout-left',`${Math.round(Number(p.left))}px`);
      if(Number.isFinite(Number(p.top)))el.style.setProperty('--layout-top',`${Math.round(Number(p.top))}px`);
    }
  }
  scene.classList.add('layout-custom');
  return true;
}

function captureLayout(){
  const result={version:2,scene:{width:scene.offsetWidth,height:scene.offsetHeight},boards:{}};
  for(const el of platforms){
    const id=el.dataset.board;
    const pos=currentPosition(el);
    if(isAttack(el)){
      const base=baseAttackPosition(el);
      result.boards[id]={
        dx:Math.round(pos.left-base.left),
        dy:Math.round(pos.top-base.top),
        left:Math.round(pos.left),
        top:Math.round(pos.top)
      };
    }else{
      result.boards[id]={left:Math.round(pos.left),top:Math.round(pos.top)};
    }
  }
  return result;
}

const saved=readSaved();
if(saved)applyLayout(saved);

const editMode=new URLSearchParams(location.search).get('edit')==='1';
if(!editMode)return;

seedMainVars();
scene.classList.add('layout-custom');
document.body.classList.add('layout-editing');

const wrap=document.querySelector('.scene-wrap');
const editor=document.createElement('section');
editor.className='layout-editor';
editor.innerHTML=`
  <div class="layout-editor-head">
    <div class="layout-editor-title"><strong>Board Layout Editor</strong><span>Drag any of the seven platforms. Arrow keys nudge 1px; Shift + Arrow nudges 10px.</span></div>
    <a href="./">Exit Editor</a>
  </div>
  <div class="layout-editor-actions">
    <button class="primary" type="button" id="layoutSave">Save Layout</button>
    <button type="button" id="layoutCopy">Copy Layout Code</button>
    <button class="danger" type="button" id="layoutReset">Reset to Site Layout</button>
  </div>
  <div class="layout-selected" id="layoutSelected">Selected board: none</div>
  <textarea id="layoutCode" rows="8" readonly aria-label="Board layout code"></textarea>
  <p class="layout-editor-note"><b>Save Layout</b> keeps the arrangement on this browser and applies it when you exit. <b>Copy Layout Code</b> lets you send the exact positions to ChatGPT if you want them locked into the website for everyone.</p>`;
wrap.insertAdjacentElement('afterend',editor);

const selected=document.getElementById('layoutSelected');
const code=document.getElementById('layoutCode');
let drag=null;

function updateCode(layout=captureLayout()){
  code.value=JSON.stringify(layout,null,2);
}
function selectBoard(el){
  platforms.forEach(x=>x.classList.toggle('layout-active',x===el));
  const p=currentPosition(el);
  selected.textContent=`Selected board: ${el.dataset.board} · X ${Math.round(p.left)} · Y ${Math.round(p.top)}`;
}
function setPosition(el,left,top){
  if(isAttack(el)){
    const base=baseAttackPosition(el);
    el.style.setProperty('--layout-dx',`${Math.round(left-base.left)}px`);
    el.style.setProperty('--layout-dy',`${Math.round(top-base.top)}px`);
  }else{
    el.style.setProperty('--layout-left',`${Math.round(left)}px`);
    el.style.setProperty('--layout-top',`${Math.round(top)}px`);
  }
}

function startDrag(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  const el=e.currentTarget;
  selectBoard(el);
  const sceneRect=scene.getBoundingClientRect();
  const start=currentPosition(el);
  drag={el,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,startLeft:start.left,startTop:start.top,scaleX:scene.offsetWidth/sceneRect.width,scaleY:scene.offsetHeight/sceneRect.height};
  el.setPointerCapture(e.pointerId);
  el.addEventListener('pointermove',moveDrag);
  el.addEventListener('pointerup',endDrag,{once:true});
  el.addEventListener('pointercancel',endDrag,{once:true});
  e.preventDefault();
}
function moveDrag(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  const left=drag.startLeft+(e.clientX-drag.startX)*drag.scaleX;
  const top=drag.startTop+(e.clientY-drag.startY)*drag.scaleY;
  setPosition(drag.el,left,top);
  selectBoard(drag.el);
  updateCode();
}
function endDrag(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  drag.el.removeEventListener('pointermove',moveDrag);
  drag=null;
  updateCode();
}
function nudge(e){
  if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();
  const el=e.currentTarget;
  const p=currentPosition(el);
  const step=e.shiftKey?10:1;
  if(e.key==='ArrowLeft')p.left-=step;
  if(e.key==='ArrowRight')p.left+=step;
  if(e.key==='ArrowUp')p.top-=step;
  if(e.key==='ArrowDown')p.top+=step;
  setPosition(el,p.left,p.top);
  selectBoard(el);
  updateCode();
}

for(const el of platforms){
  el.tabIndex=0;
  el.setAttribute('aria-label',`Move ${el.dataset.board} board`);
  el.addEventListener('pointerdown',startDrag);
  el.addEventListener('keydown',nudge);
}

updateCode();

document.getElementById('layoutSave').addEventListener('click',()=>{
  const layout=captureLayout();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(layout));
  localStorage.removeItem(LEGACY_KEY);
  updateCode(layout);
  selected.textContent='Layout saved on this browser. Exit Editor to use it.';
});

document.getElementById('layoutCopy').addEventListener('click',async()=>{
  updateCode();
  try{
    await navigator.clipboard.writeText(code.value);
    selected.textContent='Layout code copied. Paste it into ChatGPT when you want these positions locked in.';
  }catch{
    code.focus();code.select();document.execCommand('copy');
    selected.textContent='Layout code selected/copied. Paste it into ChatGPT.';
  }
});

document.getElementById('layoutReset').addEventListener('click',()=>{
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
  location.reload();
});
})();
