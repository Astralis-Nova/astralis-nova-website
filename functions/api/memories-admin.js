const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});}
function clean(v,n){return String(v??"").replace(/\u0000/g,"").trim().slice(0,n);}
function authorized(request,env){const h=request.headers.get("authorization")||"";return !!env.ADMIN_TOKEN&&h===`Bearer ${env.ADMIN_TOKEN}`;}
async function ensureTables(db){await db.batch([
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_access_requests (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL COLLATE NOCASE,relationship TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending',approval_token TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,ip_hash TEXT NOT NULL DEFAULT '')`),
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_people (id TEXT PRIMARY KEY,display_name TEXT NOT NULL,email TEXT NOT NULL COLLATE NOCASE UNIQUE,status TEXT NOT NULL DEFAULT 'approved',access_level TEXT NOT NULL DEFAULT 'member',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_albums (id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE COLLATE NOCASE,slug TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_photos (id TEXT PRIMARY KEY,album_id TEXT NOT NULL,title TEXT NOT NULL DEFAULT '',caption TEXT NOT NULL DEFAULT '',object_key TEXT NOT NULL UNIQUE,mime_type TEXT NOT NULL,size_bytes INTEGER NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(album_id) REFERENCES memory_albums(id))`),
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_album_permissions (person_id TEXT NOT NULL,album_id TEXT NOT NULL,can_view INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,PRIMARY KEY(person_id,album_id))`)
]);}
export async function onRequestGet({request,env}){
 if(!env.DB)return json({error:"The Memories database is not connected."},503);
 if(!authorized(request,env))return json({error:"Owner authorization failed."},401);
 await ensureTables(env.DB);
 const [requests,people,albums,photos,permissions]=await Promise.all([
  env.DB.prepare(`SELECT id,name,email,relationship,note,status,created_at,updated_at FROM memory_access_requests ORDER BY created_at DESC LIMIT 200`).all(),
  env.DB.prepare(`SELECT id,display_name,email,status,access_level,created_at,updated_at FROM memory_people ORDER BY display_name COLLATE NOCASE`).all(),
  env.DB.prepare(`SELECT a.id,a.name,a.slug,a.created_at,a.updated_at,COUNT(p.id) photo_count FROM memory_albums a LEFT JOIN memory_photos p ON p.album_id=a.id GROUP BY a.id ORDER BY a.updated_at DESC`).all(),
  env.DB.prepare(`SELECT p.id,p.album_id,a.name album_name,p.title,p.caption,p.mime_type,p.size_bytes,p.created_at FROM memory_photos p JOIN memory_albums a ON a.id=p.album_id ORDER BY p.created_at DESC LIMIT 500`).all(),
  env.DB.prepare(`SELECT person_id,album_id,can_view FROM memory_album_permissions`).all()
 ]);
 return json({ok:true,storageConnected:!!env.MEMORY_PHOTOS,requests:requests.results||[],people:people.results||[],albums:albums.results||[],photos:photos.results||[],permissions:permissions.results||[]});
}
export async function onRequestPost({request,env}){
 if(!env.DB)return json({error:"The Memories database is not connected."},503);
 if(!authorized(request,env))return json({error:"Owner authorization failed."},401);
 await ensureTables(env.DB);let body;try{body=await request.json();}catch{return json({error:"Invalid request."},400);}
 const action=clean(body.action,40),now=new Date().toISOString();
 if(action==="review-request"){
  const id=clean(body.id,80),decision=clean(body.decision,20);if(!id||!["approve","deny"].includes(decision))return json({error:"Invalid review action."},400);
  const req=await env.DB.prepare(`SELECT id,name,email,status FROM memory_access_requests WHERE id=? LIMIT 1`).bind(id).first();if(!req)return json({error:"Request not found."},404);
  if(decision==="approve"){
   const person=await env.DB.prepare(`SELECT id FROM memory_people WHERE email=? COLLATE NOCASE LIMIT 1`).bind(req.email).first();
   if(person?.id)await env.DB.prepare(`UPDATE memory_people SET display_name=?,status='approved',updated_at=? WHERE id=?`).bind(req.name,now,person.id).run();
   else await env.DB.prepare(`INSERT INTO memory_people(id,display_name,email,status,access_level,created_at,updated_at) VALUES(?,?,?,'approved','member',?,?)`).bind(crypto.randomUUID(),req.name,req.email,now,now).run();
  }
  await env.DB.prepare(`UPDATE memory_access_requests SET status=?,approval_token='',updated_at=? WHERE id=?`).bind(decision==="approve"?"approved":"denied",now,id).run();return json({ok:true});
 }
 if(action==="set-person-status"){
  const id=clean(body.id,80),status=clean(body.status,20);if(!id||!["approved","revoked"].includes(status))return json({error:"Invalid member status."},400);
  await env.DB.prepare(`UPDATE memory_people SET status=?,updated_at=? WHERE id=?`).bind(status,now,id).run();return json({ok:true});
 }
 if(action==="set-permission"){
  const personId=clean(body.personId,80),albumId=clean(body.albumId,80),canView=body.canView?1:0;if(!personId||!albumId)return json({error:"Person and album are required."},400);
  if(canView)await env.DB.prepare(`INSERT INTO memory_album_permissions(person_id,album_id,can_view,created_at) VALUES(?,?,1,?) ON CONFLICT(person_id,album_id) DO UPDATE SET can_view=1`).bind(personId,albumId,now).run();
  else await env.DB.prepare(`DELETE FROM memory_album_permissions WHERE person_id=? AND album_id=?`).bind(personId,albumId).run();return json({ok:true});
 }
 return json({error:"Unknown admin action."},400);
}
export async function onRequestDelete({request,env}){
 if(!env.DB)return json({error:"The Memories database is not connected."},503);
 if(!authorized(request,env))return json({error:"Owner authorization failed."},401);
 await ensureTables(env.DB);const u=new URL(request.url),photoId=clean(u.searchParams.get("photo"),80);if(!photoId)return json({error:"Photo id is required."},400);
 const photo=await env.DB.prepare(`SELECT id,object_key FROM memory_photos WHERE id=? LIMIT 1`).bind(photoId).first();if(!photo)return json({error:"Photo not found."},404);
 if(env.MEMORY_PHOTOS)await env.MEMORY_PHOTOS.delete(photo.object_key);await env.DB.prepare(`DELETE FROM memory_photos WHERE id=?`).bind(photoId).run();return json({ok:true});
}
