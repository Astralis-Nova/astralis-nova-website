const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'../creature-behavior.js'),'utf8');
function api(){const context={window:{},Math};vm.runInNewContext(source,context);return context.window.NovaCreatureLife;}
test('surface species choose varied activities without leaving their ground lanes or teleporting',()=>{
 const life=api();
 for(const kind of ['roadrunner','coyote','taz','squirrel','rabbit','rat']){
  const mind=life.create({kind,seed:123}),seen=new Set();let last;
  for(let t=0;t<300;t+=.1){
   const p=mind.sample(t);seen.add(p.action);
   assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
   assert.ok(p.x>=.12&&p.x<=.88);
   if(last)assert.ok(Math.abs(p.x-last.x)<.04);
   last=p;
  }
  assert.ok(seen.size>=6,kind+' should have a varied repertoire');
 }
 const a=life.create({kind:'rabbit',seed:3}),b=life.create({kind:'rabbit',seed:5});
 assert.notDeepEqual(Array.from({length:20},(_,i)=>a.sample(i*2).action),Array.from({length:20},(_,i)=>b.sample(i*2).action));
});
test('flights keep moving forward while drift, wingbeats and glides change smoothly',()=>{
 const life=api();
 for(const kind of ['raven','dove']){
  const bird=life.flight({kind,seed:71}),actions=new Set();let last;
  for(let t=0;t<120;t+=1/30){
   const p=bird.sample(t);actions.add(p.action);
   for(const key of ['dx','dy','rate','wing','glide','bank','travel','wingTime','blink'])assert.ok(Number.isFinite(p[key]));
   assert.ok(p.glide>=0&&p.glide<=1);
   if(last){assert.ok(p.travel>=last.travel);assert.ok(Math.abs(p.dx-last.dx)<.02);}
   last=p;
  }
  assert.ok(actions.has('glide')&&actions.has('flap'));
 }
});
test('gesture clocks keep complete coordinated episodes with variable resting gaps',()=>{
 const clock=api().gestureClock(18000,12);let rest=0,active=0;
 for(let t=0;t<180000;t+=20){
  const p=clock.sample(t);assert.ok(p.clock>=0&&p.clock<=18000);
  if(p.resting)rest++;else active++;
  const frozen=clock.sample(t);assert.equal(frozen.clock,p.clock);
 }
 assert.ok(rest>100&&active>100);
 clock.reset(3000,3000);assert.ok(Math.abs(clock.sample(3000).clock-3000)<1e-6);
});
