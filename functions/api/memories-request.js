const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});}
function clean(v,n){return String(v??"").replace(/\u0000/g,"").trim().slice(0,n);}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
async function hashVisitor(request,salt){const ip=request.headers.get("CF-Connecting-IP")||"unknown";const bytes=new TextEncoder().encode(`${salt}:${ip}`);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");}
async function notifyOwner(env,requestRow,baseUrl){
  const destination=env.MEMORIES_NOTIFY_EMAIL||env.FORM_DESTINATION;
  if(!destination) return false;
  const approve=`${baseUrl}/api/memories-approve?id=${encodeURIComponent(requestRow.id)}&decision=approve&token=${encodeURIComponent(requestRow.approval_token)}`;
  const deny=`${baseUrl}/api/memories-approve?id=${encodeURIComponent(requestRow.id)}&decision=deny&token=${encodeURIComponent(requestRow.approval_token)}`;
  const body=new FormData();
  body.append("name","Astralis Nova Memories");
  body.append("email",requestRow.email);
  body.append("_subject",`Memories access request: ${requestRow.name}`);
  body.append("message",`New Cherished Memories access request\n\nName: ${requestRow.name}\nEmail: ${requestRow.email}\nRelationship: ${requestRow.relationship||"Not provided"}\nNote: ${requestRow.note||"Not provided"}\n\nAPPROVE:\n${approve}\n\nDENY:\n${deny}\n\nThese links are private approval links. Do not forward this message.`);
  try{const r=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destination)}`,{method:"POST",body,headers:{Accept:"application/json"}});return r.ok;}catch(e){console.error("Memories owner notification failed",e);return false;}
}
export async function onRequestPost({request,env}){
  if(!env.DB) return json({error:"The Memories database is not connected."},503);
  const len=Number(request.headers.get("content-length")||0);if(len>12000)return json({error:"Submission is too large."},413);
  let body;try{body=await request.json();}catch{return json({error:"Invalid submission."},400);}
  if(clean(body.website,120))return json({ok:true,message:"Your request has been received."});
  const name=clean(body.name,80),email=clean(body.email,160).toLowerCase(),relationship=clean(body.relationship,120),note=clean(body.note,600);
  if(!name)return json({error:"Please enter your name."},400);if(!validEmail(email))return json({error:"Please enter a valid email address."},400);
  const now=new Date().toISOString();const ipHash=await hashVisitor(request,env.GUESTBOOK_SALT||"astralis-nova-memories");
  try{
    const member=await env.DB.prepare(`SELECT id,status FROM memory_people WHERE email=? COLLATE NOCASE LIMIT 1`).bind(email).first();
    if(member?.status==="approved")return json({ok:true,alreadyApproved:true,message:"This email is already approved for the Memories archive."});
    const recent=await env.DB.prepare(`SELECT id,status,created_at FROM memory_access_requests WHERE email=? COLLATE NOCASE ORDER BY created_at DESC LIMIT 1`).bind(email).first();
    if(recent?.status==="pending"){return json({ok:true,alreadyPending:true,message:"An access request for this email is already waiting for approval."});}
    const row={id:crypto.randomUUID(),name,email,relationship,note,approval_token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-",""),created_at:now};
    await env.DB.prepare(`INSERT INTO memory_access_requests (id,name,email,relationship,note,status,approval_token,created_at,updated_at,ip_hash) VALUES (?,?,?,?,?,'pending',?,?,?,?,?)`).bind(row.id,row.name,row.email,row.relationship,row.note,row.approval_token,now,now,ipHash).run();
    const url=new URL(request.url);const notified=await notifyOwner(env,row,`${url.protocol}//${url.host}`);
    return json({ok:true,notified,message:notified?"Your request was sent to Ramon for approval.":"Your request was saved and is waiting for Ramon to review."},201);
  }catch(error){console.error("Memories access request failed",error);return json({error:"The access request could not be saved right now."},500);}
}
