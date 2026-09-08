const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const EMBED_MODEL='@cf/baai/bge-base-en-v1.5';

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'GET, POST, OPTIONS'}});
  const auth=request.headers.get('authorization')||'';
  const token=auth.replace(/^Bearer\s+/i,'').trim();
  if(!env.ADMIN_TOKEN)return json({error:'Nova owner console is not configured on this deployment.'},503);
  if(!token||token!==env.ADMIN_TOKEN)return json({error:'Owner authorization required.'},401);

  const db=env.NOVA_DB||env.CHESS_DB||null;
  if(!db)return json({error:'Nova database binding is unavailable.'},503);
  await ensureDb(db);

  if(request.method==='GET'){
    const count=await db.prepare(`SELECT COUNT(*) AS count FROM nova_knowledge`).first();
    const custom=await db.prepare(`SELECT COUNT(*) AS count FROM nova_knowledge WHERE version='owner'`).first();
    const latest=await db.prepare(`SELECT id,title,category,updated_at FROM nova_knowledge WHERE version='owner' ORDER BY updated_at DESC LIMIT 12`).all();
    return json({ok:true,knowledge:Number(count?.count||0),ownerKnowledge:Number(custom?.count||0),vectorize:Boolean(env.NOVA_VECTORIZE),workersAI:Boolean(env.AI),latest:latest?.results||[]});
  }

  if(request.method!=='POST')return json({error:'Use GET or POST.'},405);
  let body={};try{body=await request.json()}catch{return json({error:'Invalid JSON body.'},400)}
  const action=String(body?.action||'add');
  if(action!=='add')return json({error:'Unsupported owner action.'},400);

  const title=clean(body?.title).slice(0,140);
  const text=clean(body?.text).slice(0,3000);
  const category=clean(body?.category||'archive').slice(0,60).toLowerCase();
  const tags=Array.isArray(body?.tags)?body.tags.map(clean).filter(Boolean).slice(0,20):clean(body?.tags).split(',').map(x=>clean(x)).filter(Boolean).slice(0,20);
  if(!title||!text)return json({error:'Title and knowledge text are required.'},400);

  const id=`owner-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  await db.prepare(`INSERT INTO nova_knowledge (id,category,title,text,tags,version,updated_at) VALUES (?,?,?,?,?,'owner',CURRENT_TIMESTAMP)`).bind(id,category,title,text,tags.join(' ')).run();

  let vectorized=false;
  if(env.AI&&env.NOVA_VECTORIZE){
    try{
      const embedded=await env.AI.run(EMBED_MODEL,{text:[`${title}. ${text} ${tags.join(' ')}`]});
      const values=embedded?.data?.[0];
      if(Array.isArray(values)){
        await env.NOVA_VECTORIZE.upsert([{id,values,metadata:{category,title,text,source:'owner'}}]);
        vectorized=true;
      }
    }catch(error){console.warn('Nova owner vector upsert failed',error)}
  }

  return json({ok:true,id,title,category,tags,vectorized});
}

async function ensureDb(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_knowledge (id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, text TEXT NOT NULL, tags TEXT NOT NULL, version TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
