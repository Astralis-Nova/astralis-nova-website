const HEADERS={
  "content-type":"application/json; charset=utf-8",
  "cache-control":"public, max-age=120, s-maxage=300",
  "access-control-allow-origin":"*"
};

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const cleanName=value=>String(value||"").trim();
const key=value=>cleanName(value).toLowerCase().replace(/[^a-z0-9]+/g,"");
const safeUrl=value=>{
  try{
    const url=new URL(String(value||""));
    return /^https?:$/.test(url.protocol)?url.href:"";
  }catch{return ""}
};
const asDate=value=>{
  if(!value)return null;
  const normalized=String(value).replace(" UTC","Z").replace(" +0000","Z");
  const time=Date.parse(normalized);
  return Number.isFinite(time)?new Date(time).toISOString():null;
};
const ageHours=value=>{
  const date=asDate(value);
  return date?Math.max(0,(Date.now()-Date.parse(date))/36e5):null;
};
const getJson=async url=>{
  const response=await fetch(url,{headers:{"accept":"application/json","user-agent":"Astralis-Nova-AC-Worlds/1.0"},cf:{cacheTtl:300,cacheEverything:true}});
  if(!response.ok)throw new Error(`${url} returned ${response.status}`);
  return response.json();
};
const inferRuleset=(name,description)=>{
  const text=`${name} ${description}`.toLowerCase();
  if(/hardcore|permadeath/.test(text))return "Hardcore";
  const pvp=/\bpvp\b|\bpk\b|darktide|snowreap|ebontide|doctide|achard/.test(text);
  const pve=/\bpve\b|carebear|non[- ]?pk/.test(text);
  if((pvp&&pve)||/hybrid|pk option|pvp\/pve/.test(text))return "Hybrid";
  return pvp?"PvP":"PvE";
};
const normalizeStatusRows=data=>{
  const rows=Array.isArray(data)?data:(data?.servers||data?.data||data?.results||[]);
  const map=new Map();
  for(const row of rows){
    const name=cleanName(row.name||row.server||row.server_name);
    if(!name)continue;
    const raw=row.online??row.is_online??row.status??row.current_status;
    const online=typeof raw==="boolean"?raw:/^(online|up|true|1)$/i.test(String(raw||""));
    const offline=/^(offline|down|false|0)$/i.test(String(raw||""));
    map.set(key(name),{
      status:online?"Online":offline?"Offline":"Unknown",
      uptime:Number(row.uptime_percent??row.uptime??row.availability),
      checkedAt:asDate(row.checked_at||row.last_checked||row.updated_at)
    });
  }
  return map;
};

export async function onRequestGet(){
  const sources={servers:false,counts:false,status:false};
  let servers=[],counts=[],statusData=[];
  const results=await Promise.allSettled([
    getJson("https://treestats.net/servers.json"),
    getJson("https://treestats.net/player_counts-latest.json"),
    getJson("https://servers.treestats.net/api/servers")
  ]);
  if(results[0].status==="fulfilled"){servers=results[0].value;sources.servers=true}
  if(results[1].status==="fulfilled"){counts=results[1].value;sources.counts=true}
  if(results[2].status==="fulfilled"){statusData=results[2].value;sources.status=true}
  if(!Array.isArray(servers)||!servers.length){
    return json({error:"The community server directory is temporarily unavailable.",sources},503);
  }

  const countMap=new Map();
  for(const row of Array.isArray(counts)?counts:[]){
    if(!row?.server)continue;
    countMap.set(key(row.server),{
      count:Number.isFinite(Number(row.count))?Number(row.count):null,
      updatedAt:asDate(row.date||row.created_at||row.updated_at),
      age:cleanName(row.age)
    });
  }
  const statusMap=normalizeStatusRows(statusData);
  const worlds=servers.map(server=>{
    const name=cleanName(server.name);
    const description=cleanName(server.description);
    const count=countMap.get(key(name))||{
      count:Number.isFinite(Number(server.players?.count))?Number(server.players.count):null,
      updatedAt:asDate(server.players?.updated_at),
      age:""
    };
    const monitored=statusMap.get(key(name));
    const hours=ageHours(count.updatedAt);
    let status=monitored?.status||"Unknown";
    if(status==="Unknown"&&hours!==null&&hours<=6)status="Online";
    return {
      name,
      description,
      emulator:cleanName(server.type||server.emu||server.software||"Unknown").toUpperCase(),
      ruleset:inferRuleset(name,description),
      status,
      characters:count.count,
      countUpdatedAt:count.updatedAt,
      countAge:count.age,
      uptime:Number.isFinite(monitored?.uptime)?monitored.uptime:null,
      checkedAt:monitored?.checkedAt||null,
      address:cleanName(server.address||[server.server_host,server.server_port].filter(Boolean).join(":")),
      website:safeUrl(server.website||server.website_url),
      discord:safeUrl(server.discord||server.discord_url),
      details:`https://treestats.net/${encodeURIComponent(name)}`
    };
  }).filter(world=>world.name).sort((a,b)=>(b.characters??-1)-(a.characters??-1)||a.name.localeCompare(b.name));

  return json({
    generatedAt:new Date().toISOString(),
    sources,
    total:worlds.length,
    notice:"Character counts may include bots, macros, and multiple accounts. They are not unique-person counts.",
    worlds
  });
}
