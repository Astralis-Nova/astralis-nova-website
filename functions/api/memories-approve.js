function page(title,message,ok=true){return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#060914;color:#eef6ff;font-family:system-ui;padding:24px}.card{max-width:620px;padding:34px;border:1px solid #233653;border-radius:22px;background:#0d1425;box-shadow:0 25px 70px #0008}h1{margin-top:0;color:${ok?'#a8e6c0':'#ffb1b1'}}a{color:#9bd7ff}</style></head><body><div class="card"><h1>${title}</h1><p>${message}</p><p><a href="/memories/">Open Cherished Memories</a></p></div></body></html>`,{status:ok?200:400,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}})}
function clean(v,n){return String(v??"").trim().slice(0,n);}
export async function onRequestGet({request,env}){
  if(!env.DB)return page("Archive unavailable","The Memories database is not connected.",false);
  const u=new URL(request.url),id=clean(u.searchParams.get("id"),80),token=clean(u.searchParams.get("token"),180),decision=clean(u.searchParams.get("decision"),20).toLowerCase();
  if(!id||!token||!["approve","deny"].includes(decision))return page("Invalid approval link","This approval link is incomplete or invalid.",false);
  try{
    const req=await env.DB.prepare(`SELECT id,name,email,status,approval_token FROM memory_access_requests WHERE id=? LIMIT 1`).bind(id).first();
    if(!req||req.approval_token!==token)return page("Approval link rejected","This link is invalid or has already been replaced.",false);
    if(req.status!=="pending")return page("Request already reviewed",`${req.name}'s request is already marked ${req.status}.`,true);
    const now=new Date().toISOString();
    if(decision==="deny"){
      await env.DB.prepare(`UPDATE memory_access_requests SET status='denied',approval_token='',updated_at=? WHERE id=?`).bind(now,id).run();
      return page("Access denied",`${req.name}'s request has been denied. No archive access was granted.`,true);
    }
    const person=await env.DB.prepare(`SELECT id FROM memory_people WHERE email=? COLLATE NOCASE LIMIT 1`).bind(req.email).first();
    if(person?.id){await env.DB.prepare(`UPDATE memory_people SET display_name=?,status='approved',updated_at=? WHERE id=?`).bind(req.name,now,person.id).run();}
    else{await env.DB.prepare(`INSERT INTO memory_people (id,display_name,email,status,access_level,created_at,updated_at) VALUES (?,?,?,'approved','member',?,?)`).bind(crypto.randomUUID(),req.name,req.email,now,now).run();}
    await env.DB.prepare(`UPDATE memory_access_requests SET status='approved',approval_token='',updated_at=? WHERE id=?`).bind(now,id).run();
    return page("Access approved",`${req.name} (${req.email}) is now saved as an approved person in the Cherished Memories archive.`,true);
  }catch(error){console.error("Memories approval failed",error);return page("Approval failed","The request could not be updated. Please try again from the original email.",false);}
}
