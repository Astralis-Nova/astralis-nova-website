const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const rigEnv={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../ac-dragon-rig.js'),'utf8'),rigEnv);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../ac-dragon-puppet.js'),'utf8'),rigEnv);
const source = fs.readFileSync(path.join(__dirname,'../ac-dragon.js'),'utf8');
function setup({width=1440,height=900,reduced=false,failed=false}={}) {
  let clock=0,id=0,frames=new Map(),images=[];
  const listeners={};
  const context=()=>new Proxy({arcs:0,draws:[],clearRect(){this.arcs=0;this.draws=[];},drawImage(...args){this.draws.push({args,alpha:this.globalAlpha,blend:this.globalCompositeOperation});},createRadialGradient(){return{addColorStop(){}};},createLinearGradient(){return{addColorStop(){}};},beginPath(){},arc(x,y,r){assert.ok([x,y,r].every(Number.isFinite));this.arcs++;},fill(){}},{get:(o,k)=>o[k]??(()=>{})});
  function element(){return{dataset:{},hidden:false,children:[],events:{},style:{setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}},setAttribute(k,v){this[k]=v;},append(child){if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(x=>x!==child);this.children.push(child);child.parentElement=this;},prepend(child){this.append(child);},addEventListener(k,v){this.events[k]=v;},removeEventListener(k){delete this.events[k];},getBoundingClientRect(){const s=width<=360?90:width<=760?Math.min(180,Math.max(100,width*.3)):Math.min(290,Math.max(180,width*.28));return{x:width-s-14,y:width<=760?134:98,width:s,height:s};},getContext(){return this.context||(this.context=context());}};}
  const body=element(),home=element(),dragon=element(),art=element(),canvas=element(),still=element(),toggle=element();
  canvas.width=512;canvas.height=512;home.append(dragon);dragon.append(art);
  dragon.querySelector=()=>art;
  const preference={matches:reduced,addEventListener(k,v){this.change=v;},removeEventListener(){this.change=null;}};
  const document={body,hidden:false,querySelector(q){return q==='.ac-dragon-emblem'?dragon:q==='.topbar'?{getBoundingClientRect:()=>({bottom:68})}:null;},getElementById(q){return {acDragonCanvas:canvas,acDragonStill:still,acDragonToggle:toggle}[q];},createElement:element,addEventListener(k,v){listeners[k]=v;},removeEventListener(k){delete listeners[k];}};
  const window={AstralisDragonRig:rigEnv.window.AstralisDragonRig,AstralisDragonPuppet:rigEnv.window.AstralisDragonPuppet,matchMedia:()=>preference,addEventListener(k,v){listeners[k]=v;},removeEventListener(k){delete listeners[k];}};
  vm.runInNewContext(source,{document,window,innerWidth:width,innerHeight:height,Image:class{constructor(){images.push(this);this.naturalWidth=1536;this.naturalHeight=1024;}},requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},Math});
  if(failed)images[0].onerror();else images[0].onload();
  function step(ms){const target=clock+ms;while(clock<target){clock=Math.min(target,clock+20);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));}}
  step(20);
  return{dragon,art,canvas,still,toggle,body,home,document,preference,step,listeners,images,frames:()=>frames.size,fire:()=>art.children.find(c=>c.className==='ac-dragon-fire')};
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

test('close approaches grow visibly, articulate the tail and stop all work on page exit',()=>{
 const s=setup();assert.equal(s.images.length,1,'retain the original AC artwork');assert.equal(s.images[0].src,'/assets/ac-portals/ac-dragon-flight-sheet.webp');s.step(10700);
 const sizes=new Set(),tails=new Set(),views=new Set(),phases=new Set();
 for(let i=0;i<250;i++){
  s.step(100);sizes.add(Number(s.dragon.dataset.flightSize));tails.add(s.dragon.dataset.tailFlex);views.add(Number(s.dragon.dataset.approach));phases.add(s.dragon.dataset.wingPhase);
  assert(!s.dragon.style.transform.includes('scaleX'), 'the whole body must never flatten to turn');
 }
 assert(Math.max(...sizes)>Math.min(...sizes)*7,'camera approaches must be unmistakable');
 assert(Math.max(...views)>.95 && Math.min(...views)<.1,'approach and retreat both appear');
 assert(tails.size>150 && phases.size>100,'body flex and wing phase must evolve continuously');
 s.listeners.pagehide();assert.equal(s.frames(),0);assert.equal(s.fire().hidden,true);
 assert(s.images.every(i=>i.onload===null));assert.equal(s.listeners.visibilitychange,undefined);
});

test('Promise-style approaches grow from distant to screen-filling, with continuous retreats',()=>{
 const rig=rigEnv.window.AstralisDragonRig;
 for(const [width,height] of [[1440,900],[390,844],[320,568],[844,390]]){
  let nearPasses=0,wasNear=false,maxStep=0,previous;
  for(let i=0;i<=2000;i++){
   const pose=rig.route(i/2000,width,height);
   assert(Object.values(pose).every(Number.isFinite));
   assert(pose.x+pose.size/2>0 && pose.x+pose.size/2<width);
   assert(pose.y+pose.size/2>0 && pose.y+pose.size/2<height);
   assert(pose.size<width*1.3,'close passes may crop wings but must not fill the page with an unbounded image');
   const near=pose.depth<2;if(near&&!wasNear)nearPasses++;wasNear=near;
   if(previous)maxStep=Math.max(maxStep,Math.hypot(pose.x-previous.x,pose.y-previous.y),Math.abs(pose.size-previous.size));previous=pose;
  }
  assert.equal(nearPasses,2);assert(maxStep<width*.025);
  const start=rig.route(0,width,height),end=rig.route(1,width,height);assert.deepEqual(start,end);
 }
});

test('pose blending preserves full body opacity across strokes and glides',()=>{
 const rig=rigEnv.window.AstralisDragonRig;
 const poses=new Set();
 for(let t=0;t<60;t+=.017){
  const pose=rig.pose(t),weights=rig.weights(pose.phase,pose.glide);
  assert(Math.abs(weights.reduce((sum,[,w])=>sum+w,0)-1)<.00001);
  assert(Math.abs(pose.tail)<13 && Math.abs(pose.head)<1 && Math.abs(pose.bob)<=3);
  weights.forEach(([i,w])=>{assert(i>=0&&i<6&&w>=0&&w<=1);poses.add(i);});
 }
 assert.equal(poses.size,6);
});

test('blended pose weights stay continuous through phase wrap and partial glides',()=>{
 const rig=rigEnv.window.AstralisDragonRig;
 const vector=(phase,glide)=>{const v=Array(6).fill(0);rig.weights(phase,glide).forEach(([i,w])=>v[i]=w);return v;};
 for(const glide of [0,.25,.5,.75,1])for(let i=0;i<1000;i++){
  const a=vector(i/1000,glide),b=vector(((i+1)/1000)%1,glide);
  assert(a.every((w,j)=>Math.abs(w-b[j])<.03),'no silhouette snap while entering a glide');
 }
});

test('local joints move independently, stay connected and never invert the skin mesh',()=>{
 const puppet=rigEnv.window.AstralisDragonPuppet,rig=rigEnv.window.AstralisDragonRig;
 let maxTail=0,maxChest=0,maxLeg=0,maxNeck=0;
 for(let t=0;t<25;t+=.137){
  const pose=rig.pose(t),points=puppet.positions(t,pose);
  for(let i=0;i<puppet.indices.length;i+=3){
   const [a,b,c]=puppet.indices.slice(i,i+3).map(n=>points[n]);
   const area=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
   assert(area>20,'the body must not fold over or tear at a joint');
  }
  const displacement=(x,y)=>{const p=puppet.deform(x,y,t,pose);assert(p.every(Number.isFinite));return Math.hypot(p[0]-x,p[1]-y);};
  maxTail=Math.max(maxTail,displacement(35,370));maxChest=Math.max(maxChest,displacement(292,298));
  maxLeg=Math.max(maxLeg,displacement(270,380));maxNeck=Math.max(maxNeck,displacement(435,270));
  const upperWing=puppet.deform(85,115,t,pose),lowerTail=puppet.deform(85,375,t,pose);
  assert(Math.abs((upperWing[1]-115)-(lowerTail[1]-375))>0 || Math.abs(pose.bob)<1e-8);
 }
 assert(maxTail>15 && maxChest>4 && maxLeg>9 && maxNeck>4);
});

test('GPU skinning draws one indexed mesh and releases resources; context loss enables fallback',()=>{
 const puppet=rigEnv.window.AstralisDragonPuppet;
 const calls=[],events={},resources=[];let id=0;
 const gl=new Proxy({
  NO_ERROR:0,getError:()=>0,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,isContextLost:()=>false,
  bufferSubData:(_,offset,data)=>{assert([...data].every(Number.isFinite));calls.push(['vertices',data.length]);},
  drawElements:(_,count)=>calls.push(['draw',count]),uniform3f:(name,...values)=>{if(name==='uWeights')assert(Math.abs(values.reduce((a,b)=>a+b,0)-1)<.00001);},
  createShader:()=>++id,createProgram:()=>++id,createBuffer:()=>++id,createTexture:()=>++id,
  deleteShader:v=>resources.push(v),deleteProgram:v=>resources.push(v),deleteBuffer:v=>resources.push(v),deleteTexture:v=>resources.push(v)
 },{get:(o,k)=>o[k]??(k.toUpperCase()===k?1:()=>{})});
 const canvas={getContext:()=>gl,addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n]};
 const gpu=puppet.createGPU(canvas,{});assert(gpu);
 const pose=rigEnv.window.AstralisDragonRig.pose(12);
 assert.equal(gpu.draw(12,pose,[[0,.3],[1,.7]]),true);
 assert.deepEqual(calls,[['vertices',puppet.vertices.length*2],['draw',puppet.indices.length]]);
 let prevented=false;events.webglcontextlost({preventDefault(){prevented=true;}});assert(prevented);
 assert.equal(gpu.draw(13,pose,[[1,1]]),false,'a lost context must hand rendering to Canvas');
 gpu.destroy();assert.equal(resources.length,7);assert.equal(events.webglcontextlost,undefined);
 gl.getShaderParameter=()=>false;assert.equal(puppet.createGPU(canvas,{}),null,'shader errors preserve the Canvas fallback');
});
