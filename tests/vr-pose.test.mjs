import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createViewerPose} from '../astralis-vr-controls.js';

function fixture(){
  const scene=new T.Scene(),rig=new T.Group(),camera=new T.PerspectiveCamera(),xrCamera=new T.ArrayCamera();
  scene.add(rig);rig.add(camera);
  const reference={},head=new T.Matrix4(),headPosition=new T.Vector3(.28,1.54,-.19),headRotation=new T.Quaternion().setFromEuler(new T.Euler(.13,.38,-.06));
  head.compose(headPosition,headRotation,new T.Vector3(1,1,1));
  xrCamera.matrix.copy(head);head.decompose(xrCamera.position,xrCamera.quaternion,xrCamera.scale);
  const renderer={xr:{isPresenting:true,getReferenceSpace:()=>reference,getCamera:()=>xrCamera}};
  let captures=0;
  const frame={getViewerPose(space){assert.equal(space,reference);captures++;return {transform:{matrix:head.elements}};}};
  return {scene,rig,camera,xrCamera,head,headPosition,headRotation,renderer,frame,pose:createViewerPose(T,renderer,rig,camera),captures:()=>captures};
}

test('head pose includes translation and snap-turn rotation with a detached XR ArrayCamera',()=>{
  const f=fixture();assert.equal(f.xrCamera.parent,null);f.pose.capture(f.frame);
  for(let degrees=0;degrees<360;degrees+=30){
    f.rig.position.set(-2,0,5);f.rig.rotation.y=degrees*Math.PI/180;f.rig.updateMatrixWorld(true);
    const expectedPosition=f.headPosition.clone().applyMatrix4(f.rig.matrixWorld);
    const expectedDirection=new T.Vector3(0,0,-1).applyQuaternion(f.headRotation).applyQuaternion(f.rig.quaternion);
    const view=f.pose.getView();
    assert.ok(view.getWorldPosition(new T.Vector3()).distanceTo(expectedPosition)<1e-10,'position at '+degrees);
    assert.ok(view.getWorldDirection(new T.Vector3()).distanceTo(expectedDirection)<1e-10,'direction at '+degrees);
  }
});

test('world-pose queries never overwrite the renderer-owned XR camera matrices',()=>{
  const f=fixture();f.rig.rotation.y=Math.PI;f.rig.position.z=5;f.rig.updateMatrixWorld(true);
  f.xrCamera.matrixWorld.multiplyMatrices(f.rig.matrixWorld,f.head);
  const before=f.xrCamera.matrixWorld.clone(),local=f.xrCamera.matrix.clone();f.pose.capture(f.frame);
  for(let i=0;i<10;i++){
    const view=f.pose.getView();view.getWorldPosition(new T.Vector3());view.getWorldQuaternion(new T.Quaternion());
  }
  assert.deepEqual(f.xrCamera.matrix.elements,local.elements);
  assert.deepEqual(f.xrCamera.matrixWorld.elements,before.elements);
  assert.equal(f.captures(),1,'menus use the captured pose outside XR frame callbacks');
});

test('native and Toon spawn points center the eye horizontally despite room-scale offset',()=>{
  const f=fixture();f.pose.capture(f.frame);
  for(const spawn of [[0,0,5],[0,0,11.5],[-4,0,9]]){
    f.pose.placeAt(spawn);const eye=f.pose.getView().getWorldPosition(new T.Vector3());
    assert.ok(Math.abs(eye.x-spawn[0])<1e-10);assert.ok(Math.abs(eye.z-spawn[2])<1e-10);
    assert.equal(eye.y,f.headPosition.y,'physical seated/standing height remains intact');
  }
});

test('lost tracking keeps the last pose, reset supplies a stable start and desktop retains its camera',()=>{
  const f=fixture();assert.equal(f.pose.capture(f.frame),true);
  const before=f.pose.getView().matrixWorld.clone();
  assert.equal(f.pose.capture({getViewerPose:()=>null}),false);
  assert.deepEqual(f.pose.getView().matrixWorld.elements,before.elements);
  assert.equal(f.pose.capture(null),false);
  f.pose.reset();f.rig.position.set(0,0,0);f.rig.rotation.set(0,0,0);
  assert.ok(f.pose.getView().getWorldPosition(new T.Vector3()).distanceTo(new T.Vector3(0,1.65,0))<1e-10);
  f.renderer.xr.isPresenting=false;assert.equal(f.pose.getView(),f.camera);
});
