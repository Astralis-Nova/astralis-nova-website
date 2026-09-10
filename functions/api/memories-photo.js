function clean(v,n){return String(v??"").replace(/\u0000/g,"").trim().slice(0,n);}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});}
function authorized(request,env){const h=request.headers.get("authorization")||"";return !!env.ADMIN_TOKEN&&h===`Bearer ${env.ADMIN_TOKEN}`;}
export async function onRequestGet({request,env}){
 if(!env.DB||!env.MEMORY_PHOTOS)return json({error:"Private photo storage is not connected."},503);
 if(!authorized(request,env))return json({error:"Owner authorization failed."},401);
 const u=new URL(request.url),id=clean(u.searchParams.get("id"),80);if(!id)return json({error:"Photo id is required."},400);
 const row=await env.DB.prepare(`SELECT object_key,mime_type FROM memory_photos WHERE id=? LIMIT 1`).bind(id).first();if(!row)return json({error:"Photo not found."},404);
 const object=await env.MEMORY_PHOTOS.get(row.object_key);if(!object)return json({error:"Photo object is missing."},404);
 const headers=new Headers();headers.set("content-type",row.mime_type||object.httpMetadata?.contentType||"application/octet-stream");headers.set("cache-control","private, no-store");headers.set("x-content-type-options","nosniff");return new Response(object.body,{headers});
}
