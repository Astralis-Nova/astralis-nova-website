import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROADSTER_ART,roadsterPose} from '../astralis-vr-roadster.js';

test('dock Roadster uses the original red homepage artwork and keeps its aspect',()=>{
  const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(home.includes('src="'+ROADSTER_ART+'"'));
  assert.ok(fs.existsSync(new URL('..'+ROADSTER_ART,import.meta.url)));
  assert.ok(Math.abs(roadsterPose(0).width/roadsterPose(0).height-720/315)<1e-12);
});
test('the floating Roadster remains outside the hull and clear of the walking space',()=>{
  const xs=[],ys=[],zs=[];
  for(let time=0;time<=250;time+=.25){
    const p=roadsterPose(time);assert.ok(Object.values(p).every(Number.isFinite));
    assert.ok(Math.hypot(p.x,p.z-2)-p.width/2>12,'entire car clears the hull');
    assert.ok(p.y-p.height/2>.8,'above the lower observation hull');

    xs.push(p.x);ys.push(p.y);zs.push(p.z);
  }
  assert.ok(Math.max(...xs)>20 && Math.min(...xs)<-20);
  assert.ok(Math.max(...ys)-Math.min(...ys)>.5);
  assert.ok(Math.max(...zs)>23 && Math.min(...zs)<-19);
  assert.deepEqual(roadsterPose(NaN),roadsterPose(0));
});
