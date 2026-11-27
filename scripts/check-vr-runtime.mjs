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
assert.equal(vm.runInContext('scienceStations.length',context),6);
assert.ok(vm.runInContext("(()=>{const s=scienceStations[0];updateScienceStations(1,s.g.position);return s.awake&&activeTargets().includes(s.hit)})()",context));
vm.runInContext('openScience()',context);
assert.ok(vm.runInContext("sciencePanel.visible&&sciencePhase==='scanning'&&activeTargets().every(m=>m.userData.scienceAction)",context));
vm.runInContext('updateScience(scienceStart+4)',context);
assert.equal(vm.runInContext('sciencePhase',context),'decoded');
vm.runInContext("scienceAction('close')",context);
assert.equal(vm.runInContext('sciencePanel.visible',context),false);
assert.ok(vm.runInContext("scienceSignals.map(s=>s.id).join(',')==='AX-071,AX-194,AX-330,AX-442'",context));
assert.ok(vm.runInContext("scienceGlass.material.transparent&&scienceGlass.material.opacity<.15&&!scienceGlass.material.depthWrite",context));
assert.ok(vm.runInContext("(()=>{const s=scienceStations[0];updateScienceStations(2,s.g.position);updateScienceStations(3,s.g.position);return sciencePanel.visible&&sciencePhase==='scanning'&&s.triggered})()",context));
assert.ok(vm.runInContext("scienceRadar.visible&&!planetHologram.visible",context));
vm.runInContext("updateScience(scienceStart+1.5)",context);
assert.ok(vm.runInContext("scienceLastStatus.includes('DECODING SIGNAL')",context));
vm.runInContext("updateScience(scienceStart+4);updateScience(scienceStart+5)",context);
assert.ok(vm.runInContext("sciencePhase==='decoded'&&planetHologram.visible&&!scienceRadar.visible&&planetHologram.scale.x>.99&&lastNovaMessage.includes('Fictional discovery simulation')",context));
vm.runInContext("scienceAction('scan');updateScience(scienceStart+4);scienceAction('video')",context);
assert.ok(vm.runInContext("scienceSignals[scienceIndex].id==='AX-330'&&sciencePreview&&planetHologram.visible&&!scienceVideoScreen.visible",context));
vm.runInContext("scienceAction('scan');updateScience(scienceStart+4);scienceAction('video')",context);
assert.ok(vm.runInContext("scienceSignals[scienceIndex].id==='AX-442'&&sciencePreview",context));
vm.runInContext("scienceAction('scan');updateScience(scienceStart+4)",context);
assert.equal(vm.runInContext("scienceSignals[scienceIndex].id",context),'AX-071');
vm.runInContext("scienceAction('close');updateScienceStations(4,scienceStations[0].g.position)",context);
assert.equal(vm.runInContext('sciencePanel.visible',context),false,'closing must not retrigger while standing nearby');
vm.runInContext("updateScienceStations(5,new T.Vector3(0,1,5))",context);
assert.equal(vm.runInContext('scienceStations[0].triggered',context),false,'leaving rearms station');

assert.ok(vm.runInContext("airlockDoors.length===2 && !shipWalkable(0,9.62) && !shipWalkable(0,13.2) && !shipWalkable(6,18) && !shipWalkable(0,23)",context));
assert.ok(vm.runInContext("airlockDoors.every(d=>d.panels.every(p=>p.leaf.material.transparent && p.leaf.material.opacity<.2 && !p.leaf.material.depthWrite) && d.aura.material.transparent)",context));
assert.ok(vm.runInContext("(()=>{for(const d of airlockDoors){for(let i=0;i<20;i++)updateAirlockDoor(d,0,d.z,.05,1+i*.05);if(d.open<.99||!shipWalkable(0,d.z))return false;for(let i=0;i<20;i++)updateAirlockDoor(d,4,18,.05,4+i*.05);if(d.open>.01||shipWalkable(0,d.z))return false;}return shipWalkable(0,11)&&shipWalkable(0,18)&&!shipWalkable(2,11)})()",context));
vm.runInContext('goToShipDeck(true)',context);
assert.ok(vm.runInContext('Math.abs(currentView().getWorldPosition(new T.Vector3()).z-17.6)<.001',context));
vm.runInContext("rig.position.fromArray("+JSON.stringify(bridge)+")",context);
vm.runInContext('nova.position.copy(novaHome)',context);
assert.ok(vm.runInContext('musicGlass.material.transparent && musicGlass.material.opacity < .15 && !musicGlass.material.depthWrite',context));
assert.ok(vm.runInContext("signalPortals.every(p=>p.portal.startsWith('https://')) && radioBanks.some(b=>b.kind==='portals')",context));
assert.equal(vm.runInContext('activeTargets().includes(musicHit)',context),true);
vm.runInContext('openMusic()',context);
assert.equal(vm.runInContext('musicPanel.visible && activeTargets().every(m=>m.userData.musicAction)',context),true);
vm.runInContext("musicAction('bankNext')",context);
assert.equal(vm.runInContext('musicItems.length',context),2);
vm.runInContext("musicAction('bankNext')",context);
assert.ok(vm.runInContext("musicItems[0].name.includes('107.9') && !!musicItems[1].portal",context));
assert.ok(vm.runInContext("radioBanks.some(b=>b.name==='OLDIES') && radioBanks.some(b=>b.name==='80s HITS') && musicEnergy(1)===0",context));
assert.ok(vm.runInContext("facetCount>20 && facetGeometry.attributes.color.count===facetCount*3 && facetMesh.material.vertexColors",context));
assert.ok(vm.runInContext("(()=>{const before=musicRingPhases.slice();animateMusicRings(.05,1,.7);return musicRingPhases[0]>before[0]&&musicRingPhases[1]<before[1]&&musicRingPhases[2]>before[2]})()",context));
assert.ok(vm.runInContext("(()=>{animateMusicFacets(1,.05,.9);const peak=Math.max(...facetLevels);const lit=facetColors.some(v=>v>0);for(let i=0;i<40;i++)animateMusicFacets(1.1+i*.05,.05,0);return peak>0&&lit&&Math.max(...facetLevels)<peak*.01})()",context));
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
