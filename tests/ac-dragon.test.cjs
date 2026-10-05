const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../ac-dragon.js'),'utf8');
function setup({width=1440,height=900,reduced=false,failed=false}={}) {
  let clock=0,id=0,frames=new Map(),image;
  const listeners={};
  const context=()=>({arcs:0,clearRect(){this.arcs=0;},drawImage(){},createRadialGradient(){return{addColorStop(){}};},beginPath(){},arc(x,y,r){assert.ok([x,y,r].every(Number.isFinite));this.arcs++;},fill(){}});
  function element(){return{dataset:{},hidden:false,children:[],events:{},style:{setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}},setAttribute(k,v){this[k]=v;},append(child){if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(x=>x!==child);this.children.push(child);child.parentElement=this;},prepend(child){this.append(child);},addEventListener(k,v){this.events[k]=v;},getBoundingClientRect(){const s=width<=360?90:width<=760?Math.min(180,Math.max(100,width*.3)):Math.min(290,Math.max(180,width*.28));return{x:width-s-14,y:width<=760?134:98,width:s,height:s};},getContext(){return this.context||(this.context=context());}};}
  const body=element(),home=element(),dragon=element(),art=element(),canvas=element(),still=element(),toggle=element();
  canvas.width=512;canvas.height=512;home.append(dragon);dragon.append(art);
  dragon.querySelector=()=>art;
  const preference={matches:reduced,addEventListener(k,v){this.change=v;}};
  const document={body,hidden:false,querySelector(q){return q==='.ac-dragon-emblem'?dragon:q==='.topbar'?{getBoundingClientRect:()=>({bottom:68})}:null;},getElementById(q){return {acDragonCanvas:canvas,acDragonStill:still,acDragonToggle:toggle}[q];},createElement:element,addEventListener(k,v){listeners[k]=v;}};
  const window={matchMedia:()=>preference,addEventListener(k,v){listeners[k]=v;}};
  vm.runInNewContext(source,{document,window,innerWidth:width,innerHeight:height,Image:class{constructor(){image=this;this.naturalWidth=1536;this.naturalHeight=1024;}},requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},Math});
  if(failed)image.onerror();else image.onload();
  function step(ms){const target=clock+ms;while(clock<target){clock=Math.min(target,clock+20);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));}}
  step(20);
  return{dragon,art,canvas,still,toggle,body,home,document,preference,step,listeners,frames:()=>frames.size,fire:()=>art.children.find(c=>c.className==='ac-dragon-fire')};
}
test('desktop and phone complete the emblem, aura, flight, fire, return, and repeat cycle',()=>{
 for(const width of [1440,390,320]){
  const s=setup({width});
  assert.equal(s.dragon.dataset.phase,'rest');assert.equal(s.dragon.parentElement,s.home);
  s.step(6400);assert.equal(s.dragon.dataset.phase,'awaken');assert.ok(Number(s.art.style['--dragon-aura'])>.9);
  s.step(2800);assert.equal(s.dragon.dataset.phase,'launch');
  s.step(4200);assert.equal(s.dragon.dataset.phase,'flight');assert.equal(s.canvas.hidden,false);assert.equal(s.still.style.opacity,'0');
  let breaths=0,maxArcs=0;
  for(let i=0;i<234;i++){s.step(100);if(s.dragon.dataset.breathing==='true')breaths++;maxArcs=Math.max(maxArcs,s.fire().context.arcs);}
  assert.ok(breaths>0,'fire is visible during flight');assert.ok(maxArcs<=170,'particles stay bounded');
  assert.equal(s.dragon.dataset.phase,'return');assert.equal(s.dragon.dataset.breathing,'false');
  s.step(3500);assert.equal(s.dragon.dataset.phase,'restore');
  s.step(3400);assert.equal(s.dragon.dataset.phase,'rest');assert.equal(s.dragon.parentElement,s.home);assert.equal(s.canvas.hidden,true);assert.equal(s.still.style.opacity,'1');assert.equal(s.fire().hidden,true);
  s.step(5300);assert.equal(s.dragon.dataset.phase,'awaken','loop repeats');
 }
});
test('pause and background tabs freeze time and resume the same phase',()=>{
 const s=setup();s.step(15000);const pose=s.dragon.style.transform;
 s.toggle.events.click();s.step(10000);assert.equal(s.dragon.style.transform,pose);assert.equal(s.frames(),0);
 s.toggle.events.click();s.step(500);assert.notEqual(s.dragon.style.transform,pose);
 s.document.hidden=true;s.listeners.visibilitychange();const hiddenPose=s.dragon.style.transform;s.step(30000);assert.equal(s.dragon.style.transform,hiddenPose);
 s.document.hidden=false;s.listeners.visibilitychange();s.step(100);assert.equal(s.dragon.dataset.phase,'flight');
});
test('reduced motion parks the original emblem and explicit play remains available',()=>{
 const s=setup({reduced:true});s.step(20000);assert.equal(s.dragon.parentElement,s.home);assert.equal(s.canvas.hidden,true);assert.equal(s.frames(),0);
 s.toggle.events.click();s.step(15000);assert.equal(s.dragon.dataset.phase,'flight');
 s.preference.matches=true;s.preference.change();assert.equal(s.dragon.parentElement,s.home);assert.equal(s.fire().hidden,true);assert.equal(s.frames(),0);
});
test('sprite loading failure leaves the original emblem available',()=>{
 const s=setup({failed:true});s.step(60000);assert.equal(s.toggle.hidden,true);assert.equal(s.canvas.hidden,true);assert.equal(s.still.style.opacity,'1');assert.equal(s.dragon.parentElement,s.home);assert.equal(s.frames(),0);
});
