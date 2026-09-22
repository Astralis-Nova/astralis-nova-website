import { readFile } from 'node:fs/promises';

const configUrl=new URL('../player/radio-stations.json',import.meta.url);
const config=JSON.parse(await readFile(configUrl,'utf8'));
const failures=[];

for(const station of config.stations){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  const started=Date.now();
  try{
    const response=await fetch(station.stream,{headers:{Accept:'audio/*,*/*;q=0.5',Range:'bytes=0-2047','User-Agent':'Astralis-Nova-Radio-Health/1.0'},redirect:'follow',signal:controller.signal});
    const type=(response.headers.get('content-type')||'unknown').toLowerCase();
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    if(type.includes('text/html')||type.includes('application/json'))throw new Error(`unexpected content type ${type}`);
    await response.body?.cancel();
    console.log(`PASS ${station.call} ${station.frequency} • ${response.status} • ${type} • ${Date.now()-started} ms`);
  }catch(error){
    failures.push(`${station.call} ${station.frequency}: ${error.name==='AbortError'?'timeout':error.message}`);
    console.error(`FAIL ${failures.at(-1)}`);
  }finally{clearTimeout(timeout);}
}

if(failures.length){
  console.error(`\n${failures.length} verified radio stream${failures.length===1?'':'s'} failed.`);
  process.exitCode=1;
}else console.log(`\nAll ${config.stations.length} verified radio streams responded.`);
