import test from 'node:test';
import assert from 'node:assert/strict';
import { RIGS, motionPose, prepareRig, deformPoint, solveLimb } from '../toon-burrow-rig.js';
import { rotationViews } from '../toon-burrow-turns.js';
import { createAnimalMind, pivotYaw } from '../toon-burrow-mind.js';
import { postureFrame } from '../toon-burrow-postures.js';
const length = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
test('turns retain full front and rear body views',()=>{
 assert.equal(rotationViews(Math.PI/2).from.frame,1);
 assert.equal(rotationViews(Math.PI*1.5).from.frame,4);
 assert.equal(rotationViews(0).from.side,1);
 assert.equal(rotationViews(Math.PI).from.side,-1);
 assert.equal(pivotYaw(.5,0,Math.PI),Math.PI/2);
 assert.equal(pivotYaw(.5,Math.PI,Math.PI*2),Math.PI*1.5);
});
test('two-joint limbs preserve bone lengths even for unreachable foot targets',()=>{
 for(const target of [[30,70],[500,400],[.001,0]]){
  const [hip,knee,foot]=solveLimb([0,0],target,60,45,1);
  assert.ok(Math.abs(length(hip,knee)-60)<1e-6);
  assert.ok(Math.abs(length(knee,foot)-45)<1e-6);
 }
});
test('gait plants stance paws while lifting the other feet',()=>{
 for(const rat of [false,true]){
  const rig=RIGS[rat?1:0];let planted=0,lifted=0;
  for(let t=.05;t<1;t+=.025){
   const p=prepareRig(rig,motionPose(t,rat,{action:'run',speed:.8}));
   rig.legs.forEach((leg,i)=>{
    const phase=(p.gait+leg.phase)%1;
    if(phase<.62){assert.ok(Math.abs(p.chains[i][2][1]-leg.ankle[1])<1.5);planted++}
    else if(p.chains[i][2][1]<leg.ankle[1]-3)lifted++;
   });
  }
  assert.ok(planted>10&&lifted>10);
 }
});
test('independent decisions vary actions and destinations while staying inside their chambers',()=>{
 for(const rat of [false,true]){
  const mind=createAnimalMind({rat,seed:123456});const actions=new Set(),destinations=new Set();let last;
  for(let t=0;t<600;t+=.1){
   const p=mind.sample(t);actions.add(p.action);destinations.add(Math.round(p.x));
   assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.floor));
   assert.ok(p.x>=(rat?790:520)&&p.x<=(rat?950:740));
   assert.ok(p.floor>=(rat?800:410)&&p.floor<=(rat?833:449));
   if(last){assert.ok(Math.abs(p.x-last.x)<20);assert.ok(Math.abs(p.floor-last.floor)<6)}last=p;
  }
  for(const action of ['crouch','sit','lie','climb','groom','walk'])assert.ok(actions.has(action),action);
  assert.ok(destinations.size>50);
 }
 const a=createAnimalMind({seed:11}),b=createAnimalMind({seed:42});
 assert.notDeepEqual(Array.from({length:30},(_,i)=>a.sample(i*2).action),Array.from({length:30},(_,i)=>b.sample(i*2).action));
});
test('posture artwork supports crouching, sitting, lying and climbing',()=>{
 assert.equal(postureFrame('crouch'),0);assert.equal(postureFrame('sit'),1);
 assert.equal(postureFrame('lie'),2);assert.equal(postureFrame('climb'),4);
 assert.equal(postureFrame('run'),null);
});
test('mesh remains finite through varied behavior and features move independently',()=>{
 RIGS.forEach((rig,i)=>{
  const mind=createAnimalMind({rat:!!i,seed:901});
  for(let t=0;t<90;t+=.41){
   const p=prepareRig(rig,motionPose(t,!!i,mind.sample(t)));
   for(let y=0;y<rig.source[3];y+=41)for(let x=0;x<rig.source[2];x+=47)assert.ok(deformPoint(x,y,rig,p).every(Number.isFinite));
  }
  const a=prepareRig(rig,motionPose(2.6,!!i)),b=prepareRig(rig,motionPose(3.1,!!i));
  assert.ok(length(deformPoint(30,235,rig,a),deformPoint(30,235,rig,b))>3);
  assert.ok(length(deformPoint(...rig.eye,rig,a),deformPoint(...rig.eye,rig,b))>.5);
 });
});
