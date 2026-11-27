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
  for(let time=0;time<=200;time+=.25){
    const p=roadsterPose(time);assert.ok(Object.values(p).every(Number.isFinite));
    assert.ok(p.x-p.width/2>7.3,'outside the maximum deck width');
    assert.ok(p.y-p.height/2>.8,'above the lower observation hull');
    assert.ok(p.z>2&&p.z<8,'alongside the docking area');
    xs.push(p.x);ys.push(p.y);zs.push(p.z);
  }
  assert.ok(Math.max(...xs)-Math.min(...xs)>1);
  assert.ok(Math.max(...ys)-Math.min(...ys)>.5);
  assert.ok(Math.max(...zs)-Math.min(...zs)>4);
  assert.deepEqual(roadsterPose(NaN),roadsterPose(0));
});
