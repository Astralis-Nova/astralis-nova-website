import test from 'node:test';
import assert from 'node:assert/strict';
import {readStick,walkDisplacement} from '../astralis-vr-controls.js';

test('Quest and two-axis gamepads read the expected thumbstick pair',()=>{
  assert.deepEqual(readStick({axes:[0,0,.2,-1]}),[.2,-1]);
  assert.deepEqual(readStick({axes:[-.7,.5]}),[-.7,.5]);
  assert.deepEqual(readStick({axes:[0,0,NaN,Infinity]}),[0,0]);
  assert.deepEqual(readStick(null),[0,0]);
});
test('pushing forward moves along the view at every heading; pulling reverses it',()=>{
  for(let degrees=0;degrees<360;degrees+=30){
    const angle=degrees*Math.PI/180,fx=-Math.sin(angle),fz=-Math.cos(angle);
    const [x,z]=walkDisplacement(0,-1,fx,fz,1.8,.04);
    assert.ok(x*fx+z*fz>0,'forward at '+degrees);
    const [bx,bz]=walkDisplacement(0,1,fx,fz,1.8,.04);
    assert.ok(bx*fx+bz*fz<0,'backward at '+degrees);
    const [rx,rz]=walkDisplacement(1,0,fx,fz,1.8,.04);
    assert.ok(rx*(-fz)+rz*fx>0,'right at '+degrees);
  }
});
test('deadzone, diagonal normalization and frame stalls keep movement bounded',()=>{
  assert.deepEqual(walkDisplacement(.1,.1,0,-1,1.8,.04),[0,0]);
  const axis=walkDisplacement(0,-1,0,-1,1.8,.04),diagonal=walkDisplacement(1,-1,0,-1,1.8,.04);
  assert.ok(Math.abs(Math.hypot(...axis)-Math.hypot(...diagonal))<1e-12);
  assert.ok(Math.hypot(...walkDisplacement(0,-1,0,-1,1.8,100))<=.09+1e-12);
  assert.deepEqual(walkDisplacement(NaN,0,0,-1,1.8,.04),[0,0]);
});
