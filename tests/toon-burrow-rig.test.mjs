import test from 'node:test';
import assert from 'node:assert/strict';
import { RIGS, behavior, prepareRig, deformPoint, solveLimb } from '../toon-burrow-rig.js';
const length = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
test('two-joint limbs preserve bone lengths even when a foot target is unreachable',()=>{
 for(const target of [[30,70],[500,400],[.001,0]]){
  const [hip,knee,foot]=solveLimb([0,0],target,60,45,1);
  assert.ok(Math.abs(length(hip,knee)-60)<1e-6);
  assert.ok(Math.abs(length(knee,foot)-45)<1e-6);
 }
});
test('gait plants stance feet on the floor while lifting the other feet',()=>{
 for(const rat of [false,true]){
  const rig=RIGS[rat?1:0]; let planted=0,lifted=0;
  for(let t=.05;t<1;t+=.025){
   const p=prepareRig(rig,behavior(t,rat));
   if(p.action!=='run')continue;
   rig.legs.forEach((leg,i)=>{
    const phase=(p.gait+leg.phase)%1;
    if(phase<.62){assert.ok(Math.abs(p.chains[i][2][1]-leg.ankle[1])<1.5);planted++}
    else if(p.chains[i][2][1]<leg.ankle[1]-3)lifted++;
   });
  }
  assert.ok(planted>10&&lifted>10);
 }
});
test('all animal poses stay finite and features move independently across a full behavior cycle',()=>{
 RIGS.forEach((rig,i)=>{
  for(let t=0;t<26;t+=.13){
   const p=prepareRig(rig,behavior(t,!!i));
   for(let y=0;y<rig.source[3];y+=31)for(let x=0;x<rig.source[2];x+=37){
    const point=deformPoint(x,y,rig,p);assert.ok(point.every(Number.isFinite));
   }
  }
  const a=prepareRig(rig,behavior(2.6,!!i)),b=prepareRig(rig,behavior(3.1,!!i));
  const tailA=deformPoint(30,235,rig,a),tailB=deformPoint(30,235,rig,b);
  const headA=deformPoint(...rig.eye,rig,a),headB=deformPoint(...rig.eye,rig,b);
  assert.ok(length(tailA,tailB)>3);assert.ok(length(headA,headB)>.5);
 });
});
