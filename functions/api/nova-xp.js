const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const EVENTS={
  conversation:{xp:6,skill:'conversation'},
  navigation:{xp:4,skill:'navigation'},
  tour:{xp:12,skill:'navigation'},
  music:{xp:5,skill:'music'},
  wildlife:{xp:5,skill:'wildlife'},
  archive:{xp:5,skill:'archive'},
  games:{xp:5,skill:'games'},
  joke:{xp:3,skill:'humor'},
  riddle:{xp:4,skill:'humor'},
  page_explain:{xp:6,skill:'archive'},
  returning_visitor:{xp:10,skill:'conversation'},
  owner_teach:{xp:20,skill:'archive'}
};
const RANKS=[
  [1,'Awakening'],[3,'Navigator'],[6,'Archivist'],[10,'Pathfinder'],[15,'Storyweaver'],[22,'Constellation Keeper'],[30,'Starlight Curator'],[40,'Astral Sage'],[55,'Nova Prime']
];

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'GET, POST, OPTIONS'}});
  const db=env.NOVA_DB||env.CHESS_DB||null;
  if(!db)return json({ok:false,error:'Nova experience storage is not connected.'},503);
  try{
    await ensureDb(db);
    if(request.method==='GET')return json(await snapshot(db));
    if(request.method!=='POST')return json({error:'Use GET or POST.'},405);
    const body=await request.json().catch(()=>({}));
    const type=String(body?.type||'').toLowerCase();
    const def=EVENTS[type];
    if(!def)return json({error:'Unknown Nova experience event.'},400);
    const label=clean(body?.label).slice(0,120);
    await db.prepare(`INSERT INTO nova_xp_events (event_type,skill,xp,label,created_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP)`).bind(type,def.skill,def.xp,label).run();
    await db.prepare(`INSERT INTO nova_xp (id,total_xp,encounters,updated_at) VALUES (1,?,1,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET total_xp=total_xp+excluded.total_xp,encounters=encounters+1,updated_at=CURRENT_TIMESTAMP`).bind(def.xp).run();
    await db.prepare(`INSERT INTO nova_skills (skill,xp,encounters,updated_at) VALUES (?,?,1,CURRENT_TIMESTAMP) ON CONFLICT(skill) DO UPDATE SET xp=xp+excluded.xp,encounters=encounters+1,updated_at=CURRENT_TIMESTAMP`).bind(def.skill,def.xp).run();
    await trimEvents(db);
    return json(await snapshot(db));
  }catch(error){console.error('Nova XP API error',error);return json({ok:false,error:'Nova experience system is temporarily offline.'},500)}
}

async function ensureDb(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_xp (id INTEGER PRIMARY KEY CHECK(id=1), total_xp INTEGER NOT NULL DEFAULT 0, encounters INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_skills (skill TEXT PRIMARY KEY, xp INTEGER NOT NULL DEFAULT 0, encounters INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_xp_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, skill TEXT NOT NULL, xp INTEGER NOT NULL, label TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`INSERT OR IGNORE INTO nova_xp (id,total_xp,encounters) VALUES (1,0,0)`).run();
}

async function snapshot(db){
  const row=await db.prepare(`SELECT total_xp,encounters,updated_at FROM nova_xp WHERE id=1`).first();
  const skills=(await db.prepare(`SELECT skill,xp,encounters FROM nova_skills ORDER BY xp DESC, skill ASC`).all())?.results||[];
  const recent=(await db.prepare(`SELECT event_type,skill,xp,label,created_at FROM nova_xp_events ORDER BY id DESC LIMIT 8`).all())?.results||[];
  const total=Number(row?.total_xp||0),level=levelFor(total),rank=rankFor(level),next=nextFor(level);
  return {ok:true,totalXp:total,encounters:Number(row?.encounters||0),level,rank,nextLevelXp:next,levelProgress:Math.max(0,Math.min(1,(total-xpForLevel(level))/Math.max(1,next-xpForLevel(level)))),skills,recent,updatedAt:row?.updated_at||null};
}
function xpForLevel(level){return Math.max(0,Math.round(75*Math.pow(Math.max(0,level-1),1.55)))}
function levelFor(xp){let level=1;while(level<99&&xp>=xpForLevel(level+1))level++;return level}
function nextFor(level){return level>=99?xpForLevel(99):xpForLevel(level+1)}
function rankFor(level){let rank=RANKS[0][1];for(const [min,name] of RANKS)if(level>=min)rank=name;return rank}
async function trimEvents(db){await db.prepare(`DELETE FROM nova_xp_events WHERE id NOT IN (SELECT id FROM nova_xp_events ORDER BY id DESC LIMIT 500)`).run()}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
