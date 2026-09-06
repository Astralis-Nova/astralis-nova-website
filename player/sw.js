const SHELL_CACHE='astralis-nova-player-v8';
const AUDIO_CACHE='astralis-nova-offline-audio-v1';
const SHELL=['./','./index.html','./player.css','./player.js','./legacy83-components.css','./legacy83-enhancements.js','./legacy83-radio.js','./legacy83-radio-memory.js','./legacy83-kmle-fallback.js','./manifest.webmanifest','./icon.svg','../cover-3.jpg','../cover-16.jpg'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('astralis-nova-player-')&&k!==SHELL_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

async function rangeResponse(request,cached){
  const range=request.headers.get('range');
  if(!range) return cached;
  const blob=await cached.blob();
  const match=/bytes=(\d+)-(\d*)/.exec(range);
  if(!match) return cached;
  const start=Number(match[1]);
  const end=match[2]?Number(match[2]):blob.size-1;
  const slice=blob.slice(start,end+1,blob.type);
  return new Response(slice,{status:206,statusText:'Partial Content',headers:{
    'Content-Type':blob.type||'audio/mpeg',
    'Content-Length':String(slice.size),
    'Content-Range':`bytes ${start}-${end}/${blob.size}`,
    'Accept-Ranges':'bytes'
  }});
}

async function networkFirst(request){
  const cache=await caches.open(SHELL_CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok){ await cache.put(request,response.clone()); }
    return response;
  }catch{
    const cached=await cache.match(request);
    if(cached) return cached;
    throw new Error('Offline and no cached shell response available');
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);

  if(url.pathname.includes('/Audio/mp3/')){
    event.respondWith((async()=>{
      const audioCache=await caches.open(AUDIO_CACHE);
      const cached=await audioCache.match(url.href);
      if(cached) return rangeResponse(request,cached);
      return fetch(request);
    })());
    return;
  }

  const isPlayerShell = url.origin===location.origin && url.pathname.includes('/player/');
  if(isPlayerShell){
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok&&url.origin===location.origin){const copy=response.clone();caches.open(SHELL_CACHE).then(cache=>cache.put(request,copy));}
    return response;
  })));
});
