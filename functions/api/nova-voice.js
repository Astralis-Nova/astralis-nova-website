const MODEL='@cf/deepgram/aura-2-en';
const FEMALE_SPEAKERS=new Set([
  'amalthea','andromeda','asteria','athena','aurora','callista','cora','cordelia','delia','electra','harmonia','helena','hera','iris','janus','juno','pandora','phoebe','thalia','theia','vesta'
]);
const HEADERS={
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff'
};

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'POST, OPTIONS'}});
  if(request.method!=='POST')return json({error:'Use POST.'},405);
  if(!env.AI)return json({error:'Workers AI is unavailable.'},503);
  try{
    const body=await request.json();
    const text=clean(body?.text).slice(0,1200);
    const requested=clean(body?.speaker).toLowerCase();
    const speaker=FEMALE_SPEAKERS.has(requested)?requested:'pandora';
    if(!text)return json({error:'No text supplied.'},400);
    const audio=await env.AI.run(env.NOVA_TTS_MODEL||MODEL,{text,speaker,encoding:'mp3'});
    return new Response(audio,{status:200,headers:{...HEADERS,'Content-Type':'audio/mpeg','X-Nova-Voice':speaker}});
  }catch(error){
    console.error('Nova hosted voice failed',error);
    return json({error:'Nova voice synthesis failed.'},500);
  }
}

function clean(value){return String(value||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...HEADERS,'Content-Type':'application/json; charset=utf-8'}})}
