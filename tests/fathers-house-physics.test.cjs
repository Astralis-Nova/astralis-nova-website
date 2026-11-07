const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','fathers-house-physics.js'),'utf8'),context);
const {Stem,WaterSurface}=context.module.exports;

test('wind bends a stem without moving its root or stretching segments',()=>{
  const stem=new Stem(140,920,180,3);
  for(let i=0;i<3600;i++)stem.step(1/60,Math.sin(i/70)*1.2);
  const points=stem.points();assert.equal(points[0].x,140);assert.equal(points[0].y,920);
  for(let i=1;i<points.length;i++)assert.ok(Math.abs(Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y)-30)<1e-8);
});
test('a stem settles when wind stops',()=>{
  const stem=new Stem(0,0,150);for(let i=0;i<240;i++)stem.step(1/60,1);
  assert.ok(stem.angle.some(a=>Math.abs(a)>.001));
  for(let i=0;i<2400;i++)stem.step(1/60,0);assert.ok(stem.angle.every(a=>Math.abs(a)<1e-8));
});
test('water waves stay bounded, respect the boundary, and dissipate',()=>{
  const water=new WaterSurface();water.disturb(.5,.5,.4);let peak=0;
  for(let i=0;i<60;i++){water.step(1/60);peak=Math.max(peak,water.energy());}
  const early=water.energy();assert.ok(early>0&&peak<100);
  for(let i=0;i<1800;i++)water.step(1/60);assert.ok(water.energy()<early*.001);
  for(let x=0;x<water.width;x++){assert.equal(water.h[x],0);assert.equal(water.h[(water.height-1)*water.width+x],0);}
});
