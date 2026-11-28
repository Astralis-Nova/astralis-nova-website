import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {vrWorlds,worldForPath,requestedWorld,regionFor,canWalkRegion} from '../astralis-vr-worlds.js';
import {onRequest} from '../functions/_middleware.js';

const root=new URL('../',import.meta.url);
test('world registry resolves Cloudflare clean URLs and keeps external paths out',()=>{
  assert.equal(worldForPath('/fathers-house.html').id,'fathers');
  assert.equal(worldForPath('/fathers-house?source=ship').id,'fathers');
  assert.equal(worldForPath('/toon-planet/').id,'toon');
  assert.equal(worldForPath('https://example.org/toon-planet.html'),null);
  assert.equal(worldForPath('/chess/'),null);
  assert.equal(requestedWorld('?world=__proto__'),null);
  assert.equal(requestedWorld('?world=toString'),null);
  assert.equal(requestedWorld('?world=fathers&region=bethany').region,1);
  assert.equal(requestedWorld('?world=toon&region=missing').region,0);
});

test('every world has its original page, source artwork and a valid region',()=>{
  for(const world of Object.values(vrWorlds)){
    const page=fs.readFileSync(new URL('.'+world.path,root),'utf8');
    assert.ok(page.includes('href="/holodeck.html?world='+world.id+'"'),world.name+' needs a matching VR entry');
    for(const region of world.regions)if(region.art)assert.ok(fs.existsSync(new URL('.'+region.art,root)),region.art);
    assert.equal(regionFor(world,-1),world.regions[0]);
    assert.equal(regionFor(world,NaN),world.regions[0]);
    assert.equal(regionFor(world,99),world.regions[0]);
    if(world.engine==='spatial')for(const region of world.regions){
      assert.ok(canWalkRegion(region,region.spawn[0],region.spawn[2]),world.id+':'+region.id);
      assert.equal(canWalkRegion(region,NaN,0),false);
      assert.equal(canWalkRegion(region,1000,1000),false);
    }
  }
});

test('ark cabin and railings constrain walking; garden bridge connects the river banks',()=>{
  const ark=vrWorlds.rainbow.regions.find(r=>r.id==='ark'),garden=vrWorlds.fathers.regions[0];
  assert.equal(canWalkRegion(ark,0,-3),false);
  assert.equal(canWalkRegion(ark,3.65,-3),true);
  assert.equal(canWalkRegion(ark,4,9),false);
  assert.equal(canWalkRegion(garden,3,0),false);
  for(let x=-4;x<=8;x+=.25)assert.ok(canWalkRegion(garden,x,7));
});

const source=fs.readFileSync(new URL('../astralis-vr-source.js',import.meta.url),'utf8');
function sourceContext({embedded=true,enabled=true}={}){
  let time=20;
  const nativeRequest=()=>99,nativeCancel=()=>{},nativeObserver=class {};
  const window={requestAnimationFrame:nativeRequest,cancelAnimationFrame:nativeCancel,IntersectionObserver:nativeObserver,addEventListener(){},scrollTo(){}};
  window.parent=embedded?{location:{origin:'https://example.org'}}:window;
  const context={window,location:{search:enabled?'?holodeck-source=1':'',origin:'https://example.org'},URLSearchParams,performance:{now:()=>time},innerWidth:1000,innerHeight:720,document:{getElementById:()=>null},console};
  vm.runInNewContext(source,context);
  return {window,nativeRequest,nativeCancel,nativeObserver,advance:()=>time+=34};
}

test('public desktop and mobile pages retain their browser animation APIs',()=>{
  for(const options of [{embedded:false},{enabled:false}]){
    const c=sourceContext(options);assert.equal(c.window.astralisVRSource,undefined);
    assert.equal(c.window.requestAnimationFrame,c.nativeRequest);
    assert.equal(c.window.IntersectionObserver,c.nativeObserver);
  }
});

test('XR source clock advances recursively scheduled animation exactly once per tick',()=>{
  const {window,advance}=sourceContext();let calls=0;
  const callback=()=>{calls++;window.requestAnimationFrame(callback);};
  window.requestAnimationFrame(callback);
  window.astralisVRSource.tick();assert.equal(calls,1);
  advance();window.astralisVRSource.tick();assert.equal(calls,2);
  const api=window.astralisVRSource;api.dispose();api.tick();assert.equal(calls,2);
});

test('source animation cancellation works within a frame and disposal restores browser APIs',()=>{
  const c=sourceContext();let called=false,second;
  c.window.requestAnimationFrame(()=>c.window.cancelAnimationFrame(second));
  second=c.window.requestAnimationFrame(()=>called=true);
  c.window.astralisVRSource.tick();assert.equal(called,false);
  c.window.astralisVRSource.dispose();
  assert.equal(c.window.requestAnimationFrame,c.nativeRequest);
  assert.equal(c.window.cancelAnimationFrame,c.nativeCancel);
  assert.equal(c.window.IntersectionObserver,c.nativeObserver);
});

test('source observer pauses offscreen regions and resumes after region travel',()=>{
  const {window}=sourceContext();let top=800;const seen=[];
  const observer=new window.IntersectionObserver(entries=>seen.push(entries[0].isIntersecting));
  observer.observe({getBoundingClientRect:()=>({left:0,right:1000,top,bottom:top+720,width:1000,height:720})});
  window.astralisVRSource.tick();top=0;window.astralisVRSource.tick();window.astralisVRSource.tick();
  assert.deepEqual(seen,[false,true]);
  observer.disconnect();top=900;window.astralisVRSource.tick();assert.equal(seen.length,2);
});

test('only Holodeck receives opt-in microphone capability and bypasses decorative page injection',async()=>{
  for(const path of ['/holodeck','/holodeck.html']){
    const response=await onRequest({request:new Request('https://example.org'+path),next:async()=>new Response('<html><head></head><body>bridge</body></html>',{headers:{'content-type':'text/html','Permissions-Policy':'microphone=()'}})});
    assert.match(response.headers.get('Permissions-Policy'),/microphone=\(self\)/);
    assert.match(response.headers.get('Permissions-Policy'),/xr-spatial-tracking=\(self\)/);
    assert.equal(await response.text(),'<html><head></head><body>bridge</body></html>');
  }
  const sourceResponse=await onRequest({request:new Request('https://example.org/toon-planet?holodeck-source=1'),next:async()=>new Response('original',{headers:{'content-type':'text/html','Permissions-Policy':'microphone=()'}})});
  assert.equal(sourceResponse.headers.get('Permissions-Policy'),'microphone=()');
  assert.equal(await sourceResponse.text(),'original');
});
