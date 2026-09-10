const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});}
function clean(v,n){return String(v??"").replace(/\u0000/g,"").trim().slice(0,n);}
function slug(v){return clean(v,80).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"album";}
async function ensureTables(db){await db.batch([
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_albums (id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE COLLATE NOCASE,slug TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
 db.prepare(`CREATE TABLE IF NOT EXISTS memory_photos (id TEXT PRIMARY KEY,album_id TEXT NOT NULL,title TEXT NOT NULL DEFAULT '',caption TEXT NOT NULL DEFAULT '',object_key TEXT NOT NULL UNIQUE,mime_type TEXT NOT NULL,size_bytes INTEGER NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(album_id) REFERENCES memory_albums(id))`),
 db.prepare(`CREATE INDEX IF NOT EXISTS idx_memory_photos_album ON memory_photos(album_id,created_at DESC)`)
]);}
export async function onRequestPost({request,env}){
 if(!env.DB)return json({error:"The Memories database is not connected."},503);
 if(!env.MEMORY_PHOTOS)return json({error:"Private photo storage is not connected yet. Add an R2 binding named MEMORY_PHOTOS in Cloudflare."},503);
 const auth=request.headers.get("authorization")||"";const supplied=auth.startsWith("Bearer ")?auth.slice(7):"";
 if(!env.ADMIN_TOKEN||!supplied||supplied!==env.ADMIN_TOKEN)return json({error:"Owner authorization failed."},401);
 let form;try{form=await request.formData();}catch{return json({error:"Invalid upload."},400);}
 const photo=form.get("photo"),albumName=clean(form.get("album"),100),title=clean(form.get("title"),160),caption=clean(form.get("caption"),1200);
 if(!albumName)return json({error:"Album name is required."},400);
 if(!(photo instanceof File))return json({error:"Choose a photo to upload."},400);
 const allowed=new Set(["image/jpeg","image/png","image/webp","image/heic","image/heif"]);if(!allowed.has(photo.type))return json({error:"Use a JPG, PNG, WebP, HEIC, or HEIF image."},415);
 if(photo.size>25*1024*1024)return json({error:"Photo is larger than 25 MB."},413);
 await ensureTables(env.DB);const now=new Date().toISOString();let album=await env.DB.prepare(`SELECT id,name,slug FROM memory_albums WHERE name=? COLLATE NOCASE LIMIT 1`).bind(albumName).first();
 if(!album){const id=crypto.randomUUID();let s=slug(albumName);const exists=await env.DB.prepare(`SELECT id FROM memory_albums WHERE slug=? LIMIT 1`).bind(s).first();if(exists)s=`${s}-${id.slice(0,8)}`;await env.DB.prepare(`INSERT INTO memory_albums(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)`).bind(id,albumName,s,now,now).run();album={id,name:albumName,slug:s};}
 const ext=photo.type==="image/jpeg"?"jpg":photo.type==="image/png"?"png":photo.type==="image/webp"?"webp":photo.type==="image/heic"?"heic":"heif";const photoId=crypto.randomUUID();const key=`albums/${album.slug}/${now.slice(0,10)}/${photoId}.${ext}`;
 await env.MEMORY_PHOTOS.put(key,photo.stream(),{httpMetadata:{contentType:photo.type},customMetadata:{album:album.name,title:title||"",uploadedAt:now}});
 try{await env.DB.prepare(`INSERT INTO memory_photos(id,album_id,title,caption,object_key,mime_type,size_bytes,created_at) VALUES(?,?,?,?,?,?,?,?)`).bind(photoId,album.id,title,caption,key,photo.type,photo.size,now).run();}catch(e){await env.MEMORY_PHOTOS.delete(key);throw e;}
 return json({ok:true,id:photoId,album:album.name,title,size:photo.size},201);
}
