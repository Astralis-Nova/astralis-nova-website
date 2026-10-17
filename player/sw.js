const SHELL_CACHE='astralis-nova-player-v19';
// Keep this name stable: saved songs belong to the listener, not a shell release.
const AUDIO_CACHE='astralis-nova-offline-audio-v1';
const SHELL=['./','./index.html','./player.css','./reliability.css','./settings.js','./player.js','./folder-library.js','./local-library.js','./folder-library-core.js','./download-access.js','./first-run-folder.js','./legacy83-components.css','./legacy83-enhancements.js','./radio-playlist-core.js','./legacy83-radio.js','./radio-hub.js','./radio-stations.json','./legacy83-radio-memory.js','./legacy83-kmle-fallback.js','./legacy83-radio-component-controls.js','./legacy83-radio-endpoint.js','./legacy83-radio-endpoint-v2.js','./manifest.webmanifest','./icon.svg','../cover-3.jpg','../cover-16.jpg'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('astralis-nova-player-')&&k!==SHELL_CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

async function rangeResponse(request,cached){
  const range=request.headers.get('range');
  if(!range)return cached;
  const blob=await cached.blob();
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  const invalid=()=>new Response(null,{status:416,headers:{'Content-Range':`bytes */${blob.size}`,'Accept-Ranges':'bytes'}});
  if(!match||(!match[1]&&!match[2]))return invalid();
  const start=match[1]?Number(match[1]):Math.max(0,blob.size-Number(match[2]));
  const end=match[1]&&match[2]?Math.min(Number(match[2]),blob.size-1):blob.size-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=blob.size)return invalid();
  return new Response(blob.slice(start,end+1,blob.type),{status:206,headers:{
    'Content-Type':blob.type||'audio/mpeg','Content-Length':String(end-start+1),
    'Content-Range':`bytes ${start}-${end}/${blob.size}`,'Accept-Ranges':'bytes'
  }});
}

async function networkFirst(request){
  const cache=await caches.open(SHELL_CACHE);
  // Shell keys are canonical: HTML query versions and precache keys resolve alike.
  const key=new URL(request.url);key.search='';
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok&&response.status===200)await cache.put(key.href,response.clone());
    if(response.ok)return response;
    const cached=await cache.match(key.href);return cached||response;
  }catch{
    const cached=await cache.match(key.href);if(cached)return cached;
    return new Response('This player file is not available offline yet. Reconnect to refresh the player.',{status:503,headers:{'Content-Type':'text/plain'}});
  }
}
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
  if(url.pathname.startsWith('/Audio/')&&/\.mp3$/i.test(url.pathname)){
    event.respondWith((async()=>{const cache=await caches.open(AUDIO_CACHE);const cached=await cache.match(url.href);return cached?rangeResponse(request,cached):fetch(request)})());return;
  }
  // Only public player shell and cover art are eligible; never cache private pages.
  if(url.pathname.startsWith('/player/')||/^\/cover-\d+\.jpg$/.test(url.pathname))event.respondWith(networkFirst(request));
});
