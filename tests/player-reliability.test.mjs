import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

function setupPlayer(values={},blocked=false){
  const elements=new Map(),events=new Map(),stored=new Map(Object.entries(values));
  function element(id=''){
    const e={id,children:[],dataset:{},style:{setProperty(){}},attributes:{},handlers:{},value:'',paused:true,ended:false,currentTime:0,duration:0,hidden:false,
      classList:{toggle(){return false},add(){},remove(){}},setAttribute(k,v){this.attributes[k]=v},
      addEventListener(k,f){(this.handlers[k]??=[]).push(f)},appendChild(c){this.children.push(c)},append(...cs){this.children.push(...cs)},querySelectorAll(){return[]},querySelector(){return null},
      getContext(){return {createLinearGradient(){return {addColorStop(){}}},clearRect(){},fillRect(){}}},focus(){},dispatchEvent(){},load(){},async play(){throw new Error('synthetic playback failure')},pause(){this.paused=true}};
    Object.defineProperty(e,'textContent',{get(){return this.text||''},set(v){this.text=v;if(v==='')this.children=[]}});
    let volume=0;Object.defineProperty(e,'volume',{get(){return volume},set(v){if(!Number.isFinite(v)||v<0||v>1)throw Error('Invalid media volume');volume=v}});
    return e;
  }
  const get=id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id)};
  const context={window:{addEventListener(){}},document:{hidden:false,body:element('body'),activeElement:null,getElementById:get,querySelector:get,querySelectorAll:()=>[],createElement:()=>element(),addEventListener:(name,handler)=>events.set(name,handler)},
    localStorage:{getItem(k){if(blocked)throw Error('Storage denied');return stored.get(k)??null},setItem(k,v){if(blocked)throw Error('Storage denied');stored.set(k,v)},removeItem(){}},
    matchMedia:()=>({matches:false,addEventListener(){}}),navigator:{onLine:true},location:{href:'https://example.com/player/'},URL,console,Event,CustomEvent,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){}};
  vm.createContext(context);vm.runInContext(read('player/settings.js'),context);vm.runInContext(read('player/player.js'),context);
  return {get,context};
}
test('full player boots with damaged JSON, wrong shapes, invalid numbers, and blocked storage',()=>{
  for(const values of [
    {'nova.favorites':'{broken','nova.eq':'{','nova.volume':'NaN','nova.reverb':'{}'},
    {'nova.favorites':'{}','nova.eq':'null','nova.volume':'22','nova.skin':'unknown','nova.reverb':'{"preset":"hall","decay":"bad","mix":100000}'},
    {'nova.favorites':'null','nova.eq':'"bad"','nova.volume':'-1'},
    {'nova.volume':'0'}
  ]){const {get}=setupPlayer(values);assert.equal(get('trackList').children.length,29);assert.ok(get('audio').volume>=0&&get('audio').volume<=1);if(values['nova.volume']==='0')assert.equal(get('audio').volume,0)}
  assert.equal(setupPlayer({},true).get('trackList').children.length,29);
});
test('playback rejection produces visible error and retry',async()=>{
  const {get}=setupPlayer();await get('playBtn').handlers.click[0]();
  // Event listeners call an async playback function; settle its rejection handler.
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(get('playbackStatus').textContent,/Retry playback/);assert.equal(get('retryPlayback').hidden,false);
});
function serviceWorker(){
  const events={},stores=new Map(),deleted=[];
  const key=r=>typeof r==='string'?r:r.url;
  const cache=name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {async match(r){return map.get(key(r))?.clone()},async put(r,v){map.set(key(r),v)},async addAll(){}}};
  const context={self:{addEventListener:(k,f)=>events[k]=f,clients:{async claim(){}},async skipWaiting(){}},location:{origin:'https://example.com'},URL,Response,Request,Blob,
    caches:{async open(n){return cache(n)},async keys(){return [...stores.keys()]},async delete(n){deleted.push(n);return stores.delete(n)}},fetch:async()=>{throw Error('offline')}};
  vm.createContext(context);vm.runInContext(read('player/sw.js'),context);
  return {context,events,cache,deleted};
}
test('versioned shell requests work offline, including radio controls',async()=>{
  const {context,cache}=serviceWorker();await cache('astralis-nova-player-v19').put('https://example.com/player/player.js',new Response('cached player'));
  const response=await context.networkFirst(new Request('https://example.com/player/player.js?v=78'));assert.equal(await response.text(),'cached player');
  const worker=read('player/sw.js');for(const path of [...read('player/index.html').matchAll(/(?:src|href)="\.\/([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]))assert.ok(worker.includes(`'./${path}'`),path);
});
test('audio range handling supports seeking, suffixes, and invalid ranges',async()=>{
  const {context}=serviceWorker();
  for(const [range,status,text,contentRange] of [['bytes=2-4',206,'234','bytes 2-4/10'],['bytes=7-',206,'789','bytes 7-9/10'],['bytes=-3',206,'789','bytes 7-9/10'],['bytes=99-',416,'','bytes */10'],['bytes=5-2',416,'','bytes */10']]){
    const result=await context.rangeResponse(new Request('https://example.com/Audio/Darktide-Megamix.mp3',{headers:{range}}),new Response('0123456789'));
    assert.equal(result.status,status);assert.equal(await result.text(),text);assert.equal(result.headers.get('content-range'),contentRange);
  }
});
test('shell upgrades retain saved audio and private/API requests are not cached',async()=>{
  const {events,cache,deleted}=serviceWorker();await cache('astralis-nova-offline-audio-v1').put('saved',new Response('music'));cache('astralis-nova-player-v18');
  let pending;events.activate({waitUntil(p){pending=p}});await pending;assert.deepEqual(deleted,['astralis-nova-player-v18']);
  for(const path of ['/api/memories-photo','/memories/','https://radio.example/live']){let intercepted=false;events.fetch({request:new Request(path.startsWith('http')?path:'https://example.com'+path),respondWith(){intercepted=true}});assert.equal(intercepted,false)}
});
test('changed inline scripts compile and no track button has a listitem role',()=>{
  for(const page of ['index.html','memories/index.html','toon-planet.html'])for(const m of read(page).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
  for(const file of ['player/player.js','player/local-library.js','player/folder-library-core.js'])assert.ok(!read(file).includes("setAttribute('role','listitem')"));
});
