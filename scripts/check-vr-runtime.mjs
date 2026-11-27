// CPU-only integration audit. Texture pixels and WebGL rendering require headset/browser QA.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as Three from 'three';
import * as registry from '../astralis-vr-worlds.js';
import {createSpatialWorld} from '../astralis-vr-scenes.js';
import * as controls from '../astralis-vr-controls.js';
import * as space from '../astralis-vr-space.js';
import * as toon from '../astralis-vr-toon.js';
import * as roadster from '../astralis-vr-roadster.js';
import {GLTFLoader as OfficialGLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const root=new URL('../',import.meta.url),requests=new Set();
class Element {
  constructor(tag='div'){this.tagName=tag;this.style={};this.handlers={};this.children=[];this.width=256;this.height=256;}
  addEventListener(name,fn){this.handlers[name]=fn;}
  append(...elements){this.children.push(...elements);}
  prepend(...elements){this.children.unshift(...elements);}
  remove(){this.removed=true;}
  setAttribute(){} setPointerCapture(){}
  getContext(){return canvasContext;}
}
const canvasContext=new Proxy({
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
  measureText:text=>({width:text.length*10})
},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
const status=new Element(),body=new Element('body');
const document={body,querySelector:()=>status,createElement:tag=>{
  const element=new Element(tag);
  if(tag==='iframe')element.contentWindow={document:{},scrollTo(){},scrollBy(){}};
  return element;
}};
globalThis.document=document;
let activeRenderer,sessionEnded=0,clock=0;
const testHead=new Three.PerspectiveCamera();testHead.position.set(.28,1.54,-.19);
const detachedXR=new Three.ArrayCamera();
const testXRFrame={getViewerPose(){testHead.updateMatrix();return {transform:{matrix:testHead.matrix.elements}};}};
const session={end(){sessionEnded++;return Promise.resolve();},inputSources:[]};
class XR extends Three.EventDispatcher {
  enabled=true;isPresenting=false;
  getController(){return new Three.Group();}
  getCamera(){return detachedXR;}
  getReferenceSpace(){return {};}
  getSession(){return session;}
}
class Renderer {
  constructor(){this.xr=new XR();this.domElement=new Element('canvas');activeRenderer=this;}
  setPixelRatio(){}setSize(){}setAnimationLoop(fn){this.loop=()=>{
 testHead.updateMatrix();detachedXR.matrix.copy(testHead.matrix);testHead.matrix.decompose(detachedXR.position,detachedXR.quaternion,detachedXR.scale);
 fn(clock,this.xr.isPresenting?testXRFrame:undefined);
 };}render(scene,camera){
 scene.updateMatrixWorld(true);
 if(this.xr.isPresenting){
  camera.matrix.copy(testHead.matrix);camera.matrix.decompose(camera.position,camera.quaternion,camera.scale);camera.updateMatrixWorld(true);
  detachedXR.matrixWorld.multiplyMatrices(camera.parent.matrixWorld,testHead.matrix);detachedXR.matrixWorldInverse.copy(detachedXR.matrixWorld).invert();
 }
 this.scene=scene;this.camera=camera;
 }
}
class Loader {
  load(url,callback){
    requests.add(url);assert.ok(fs.existsSync(new URL('.'+url.split('?')[0],root)),url);
    const texture=new Three.Texture({width:1536,height:1024});
    queueMicrotask(()=>callback?.(texture));return texture;
  }
}
class GLTFLoader {
 load(url,onLoad,_progress,onError){
  const loader=new OfficialGLTFLoader();
  loader.register(()=>({name:'CPU_TEST_TEXTURE_PLACEHOLDER',loadTexture:async()=>new Three.Texture({width:1024,height:1024})}));
  const bytes=fs.readFileSync(new URL('.'+url,root));
  loader.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'/',onLoad,onError);
 }
}
const T={...Three,WebGLRenderer:Renderer,TextureLoader:Loader};
const context=vm.createContext({T,VRButton:{createButton:()=>new Element('button')},...registry,...controls,...space,...toon,...roadster,createSpatialWorld,GLTFLoader,
  document,testHead,testXRFrame,window:{addEventListener(){}},location:{search:'',assign(){}},innerWidth:1200,innerHeight:800,devicePixelRatio:1,
  performance:{now:()=>clock},URLSearchParams,console,addEventListener(){},setInterval(){},setTimeout(){},clearTimeout(){},
  fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('holodeck-scene.json',root),'utf8'))})
});
const html=fs.readFileSync(new URL('holodeck.html',root),'utf8');
const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;\n/gm,'').replace('try{\nlet onToon','let onToon').replace("}catch(e){status.textContent='Bridge unavailable: '+e.message;console.error(e)}",'');
vm.runInContext(source,context);await vm.runInContext('deepSpace.ready',context);await Promise.resolve();
assert.ok(!status.textContent.startsWith('Bridge unavailable'),status.textContent);
assert.equal(vm.runInContext('choices.filter(c=>worldForPath(c.url)).length',context),Object.keys(registry.vrWorlds).length);
activeRenderer.xr.isPresenting=true;activeRenderer.xr.dispatchEvent({type:'sessionstart'});
activeRenderer.loop();
const startingEye=vm.runInContext('currentView().getWorldPosition(new T.Vector3())',context);
assert.ok(startingEye.distanceTo(new Three.Vector3(0,testHead.position.y,5))<1e-10,'first XR frame captures physical head height and centers the spawn');
const bridge=vm.runInContext('rig.position.toArray()',context);
assert.equal(vm.runInContext('musicTracks.length',context),29);
assert.equal(vm.runInContext('activeTargets().includes(musicHit)',context),true);
vm.runInContext('openMusic()',context);
assert.equal(vm.runInContext('musicPanel.visible && activeTargets().every(m=>m.userData.musicAction)',context),true);
vm.runInContext("musicAction('bankNext')",context);
assert.equal(vm.runInContext('musicItems.length',context),2);
vm.runInContext("musicAction('close')",context);
assert.equal(vm.runInContext('musicPanel.visible',context),false);
// Planet names appear only on pointer focus; only the globe is selectable.
for(const world of Object.values(registry.vrWorlds)){
  for(const part of ['isMesh']){
    const id=vm.runInContext(`(()=>{
      const body=bodies.find(b=>b.globe.userData.worldId===${JSON.stringify(world.id)});
      const initial=body.globe.rotation.y;positionPlanets(18);scene.updateMatrixWorld(true);
      if(body.orbit.parent!==galaxy||body.orbit.position.length()<20||body.globe.rotation.y===initial)throw Error('Stationary or misplaced planet');
      const target=activeTargets().find(m=>m.userData.worldId===${JSON.stringify(world.id)}&&m[${JSON.stringify(part)}]);
      const caption=planetLabels.get(target);
      if(!caption||caption.visible||activeTargets().includes(caption))throw Error('Planet label must start hidden and not be a click target');
      setPlanetHover(target);if(!caption.visible)throw Error('Planet hover failed');
      setPlanetHover(null);if(caption.visible)throw Error('Planet label remained visible');
      ray.camera=currentView();const point=target.getWorldPosition(new T.Vector3());
      ray.ray.origin.copy(point).multiplyScalar(.75);
      ray.ray.direction.copy(point).sub(ray.ray.origin).normalize();
      activate();const selected=activeWorld()?.id;guideAction('back');positionPlanets(0);return selected;
    })()`,context);
    assert.equal(id,world.id);
  }
}
const reports=[];
for(const id of [...Object.keys(registry.vrWorlds),'rainbow','wild','fathers']){
  vm.runInContext(`travelWorld('${id}')`,context);await Promise.resolve();
  assert.equal(sessionEnded,0);
  const count=registry.vrWorlds[id].regions.length;
  for(let i=0;i<count;i++){
    vm.runInContext(`if(onToon)setToonLevel(${i});else setNativeRegion(${i})`,context);
    clock+=100;activeRenderer.loop();
    vm.runInContext('openOrbPrompt()',context);
    assert.equal(vm.runInContext('orbPrompt.visible && orbPrompt.position.y > orb.getWorldPosition(new T.Vector3()).y',context),true);
    assert.equal(vm.runInContext("activeTargets().some(m=>m.userData.promptAction==='voice')",context),true);
    vm.runInContext('showNexus(true);toggleText(true)',context);
    const keys=vm.runInContext("activeTargets().filter(m=>/^[A-Z]$/.test(m.userData.key||''))",context);
    assert.equal(keys.length,26);
    for(const key of keys)assert.ok(key.material.map.image.width/key.material.map.image.height<1.25);
    vm.runInContext("keyCommand('A');keyCommand('B');keyCommand('BACKSPACE')",context);
    assert.equal(vm.runInContext('commandText',context),'A');
    vm.runInContext('showNexus(false)',context);
    const native=vm.runInContext('nativeWorld',context);
    if(native){
      const region=native.region;
      const eye=vm.runInContext('currentView().getWorldPosition(new T.Vector3())',context);
      assert.ok(native.canWalk(eye.x,eye.z),'actual XR eye spawn '+id+':'+region.id);
      assert.ok(native.canWalk(region.spawn[0],region.spawn[2]),id+':'+region.id);
      let meshes=0,triangles=0;
      native.group.children[native.regionIndex].traverse(object=>{
        if(object.geometry){
          meshes++;const p=object.geometry.attributes.position;
          for(const value of p.array)assert.ok(Number.isFinite(value),id+' geometry');
          triangles+=(object.geometry.index?.count||p.count)/3*(object.isInstancedMesh?object.count:1);
        }
      });
      reports.push({world:id,region:region.id,drawables:meshes,triangles:Math.round(triangles)});
    }
    vm.runInContext("guideAction('next')",context);clock+=100;activeRenderer.loop();
  }
}
vm.runInContext("guideAction('back')",context);
assert.equal(vm.runInContext('activeWorld()',context),null);
assert.deepEqual(Array.from(vm.runInContext('rig.position.toArray()',context)),Array.from(bridge));
assert.equal(sessionEnded,0);
for(const [command,id,region] of [["father's house",'fathers',0],['lazarus','fathers',1],['jimmitty','wild',1],['rainbow shore','rainbow',1],['wild encounters','wild',0]]){
  vm.runInContext(`runCommand(${JSON.stringify(command)})`,context);await Promise.resolve();
  assert.equal(vm.runInContext('activeWorld().id',context),id);
  assert.equal(vm.runInContext('nativeWorld.regionIndex',context),region);
}
vm.runInContext("runCommand('unmute')",context);assert.equal(vm.runInContext('guideVoice',context),true);
vm.runInContext("runCommand('mute')",context);assert.equal(vm.runInContext('guideVoice',context),false);
vm.runInContext("guideAction('original')",context);assert.equal(vm.runInContext('pageGroup.visible',context),true);
vm.runInContext("guideAction('back')",context);assert.equal(vm.runInContext('activeWorld()',context),null);
// Exercise real bridge walking with simulated Quest thumbstick input at twelve headings.
vm.runInContext("guideAction('back')",context);
const leftInput={handedness:'left',gamepad:{axes:[0,0,0,-1],buttons:[]}};session.inputSources=[leftInput];
for(let degrees=0;degrees<360;degrees+=30){
 vm.runInContext(`rig.position.set(0,0,3);rig.rotation.set(0,0,0);camera.position.set(0,1.65,0);rig.rotation.y=${degrees*Math.PI/180};testHead.rotation.set(0,.23,0);viewerPose.capture(testXRFrame);walkTime=1;`,context);
 const before=vm.runInContext('rig.position.clone()',context),angle=degrees*Math.PI/180+.23;
 vm.runInContext('walkBridge(1.04)',context);
 const after=vm.runInContext('rig.position.clone()',context),delta=after.clone().sub(before);
 assert.ok(delta.x*(-Math.sin(angle))+delta.z*(-Math.cos(angle))>0,'bridge forward at '+degrees);
 leftInput.gamepad.axes[3]=1;
 vm.runInContext('walkBridge(1.08)',context);
 const back=vm.runInContext('rig.position.clone()',context).sub(after);
 assert.ok(back.x*(-Math.sin(angle))+back.z*(-Math.cos(angle))<0,'bridge backward at '+degrees);
 leftInput.gamepad.axes[3]=-1;
}
// Snap turns pivot around the physical eye, rather than the tracking origin.
leftInput.gamepad.axes[3]=0;
session.inputSources.push({handedness:'right',gamepad:{axes:[0,0,1,0],buttons:[]}});
const eyeBefore=vm.runInContext('currentView().getWorldPosition(new T.Vector3())',context);
vm.runInContext('turnReady=true;walkBridge(1.12)',context);
const eyeAfter=vm.runInContext('currentView().getWorldPosition(new T.Vector3())',context);
assert.ok(eyeBefore.distanceTo(eyeAfter)<1e-10,'snap-turn eye position');
vm.runInContext('showNexus(true)',context);
const ahead=vm.runInContext('nexus.position.clone().sub(currentView().getWorldPosition(new T.Vector3()))',context);
const forward=vm.runInContext('currentView().getWorldDirection(new T.Vector3())',context);
assert.ok(ahead.dot(forward)>2.79,'Nova menu stays in front after a snap turn');
vm.runInContext('showNexus(false)',context);
const batches=vm.runInContext('deepSpace.batches',context);
assert.equal(batches.reduce((n,b)=>n+b.count,0),48);
for(const {mesh} of batches){assert.equal(mesh.material.metalness,0);assert.ok(mesh.material.map);assert.ok(mesh.geometry.attributes.uv);}
assert.equal(vm.runInContext('cactusInstances.trunks.count',context),25);
assert.equal(vm.runInContext('dockRoadster.car.visible',context),true);assert.ok(vm.runInContext('dockRoadster.group.position.x',context)>7.3);
assert.equal(sessionEnded,0);
console.log(JSON.stringify({status:'PASS',scope:'CPU integration with real Three.js 0.170 geometry and a detached XR ArrayCamera; no GPU/headset',assets:requests.size,nativeRegions:new Set(reports.map(r=>r.world+':'+r.region)).size,headings:12,nasaInstances:batches.reduce((n,b)=>n+b.count,0)}));
