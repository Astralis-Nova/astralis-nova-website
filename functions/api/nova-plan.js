const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const MODEL='@cf/meta/llama-3.1-8b-instruct';

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'POST, OPTIONS'}});
  if(request.method!=='POST')return json({error:'Use POST.'},405);
  try{
    const body=await request.json();
    const goal=clean(body?.goal).slice(0,800);
    if(!goal)return json({error:'Give Nova a goal.'},400);
    const availableLinks=normalizeLinks(body?.availableLinks).slice(0,100);
    const pageContext=clean(body?.pageContext).slice(0,5000);
    let plan=null;
    if(env.AI){
      try{
        const result=await env.AI.run(env.NOVA_MODEL||MODEL,{messages:[
          {role:'system',content:`You are Nova's goal planner for the Astralis Nova website. Convert the visitor's goal into a short safe plan using only these step types: navigate, ask, tour, media. Return ONLY compact JSON with shape {"summary":"...","steps":[...]}. navigate requires href and label and href must be chosen from AVAILABLE LINKS exactly. ask requires prompt. tour requires no extra fields. media may only use operation "play" or "pause". Use 1 to 5 steps. Prefer answering with ask when a goal is informational. Prefer navigate when a destination is obvious. Never create external URLs, admin actions, purchases, form submissions, deletions, account changes, or arbitrary clicks.`},
          {role:'user',content:`GOAL:\n${goal}\n\nCURRENT PAGE:\n${pageContext||'unknown'}\n\nAVAILABLE LINKS:\n${JSON.stringify(availableLinks)}`}
        ],max_tokens:420,temperature:.2});
        plan=parsePlan(result?.response||result?.result?.response||'',availableLinks);
      }catch(error){console.warn('Nova planner AI fallback',error)}
    }
    if(!plan)plan=fallbackPlan(goal,availableLinks);
    return json({ok:true,goal,plan,mode:env.AI?'ai-plan':'local-plan'});
  }catch(error){console.error('Nova planner error',error);return json({error:'Nova could not plot that course.'},500)}
}

function parsePlan(raw,links){
  const match=String(raw||'').match(/\{[\s\S]*\}/);if(!match)return null;
  try{
    const obj=JSON.parse(match[0]);
    if(!Array.isArray(obj.steps))return null;
    const allowed=new Map(links.map(x=>[x.href,x]));
    const steps=[];
    for(const s of obj.steps.slice(0,5)){
      if(s?.type==='navigate'&&allowed.has(String(s.href||''))){const l=allowed.get(String(s.href));steps.push({type:'navigate',href:l.href,label:clean(s.label||l.label||'destination').slice(0,80)})}
      else if(s?.type==='ask'&&clean(s.prompt))steps.push({type:'ask',prompt:clean(s.prompt).slice(0,500)});
      else if(s?.type==='tour')steps.push({type:'tour'});
      else if(s?.type==='media'&&['play','pause'].includes(s.operation))steps.push({type:'media',operation:s.operation});
    }
    if(!steps.length)return null;
    return{summary:clean(obj.summary||'Course plotted.').slice(0,180),steps};
  }catch{return null}
}

function fallbackPlan(goal,links){
  const q=goal.toLowerCase();
  const find=(rx)=>links.find(x=>rx.test(`${x.label} ${x.href}`.toLowerCase()));
  const steps=[];
  const wild=find(/wild|snake|coyote|tortoise|animal/), music=find(/music player|player|song|music/), chess=find(/chess/), archive=find(/archive|first orbit|history/);
  if(/tour|show me around|explore/.test(q))steps.push({type:'tour'});
  if(/wild|animal|snake|coyote/.test(q)&&wild)steps.push({type:'navigate',href:wild.href,label:wild.label||'Wild Encounters'});
  if(/chess/.test(q)&&chess)steps.push({type:'navigate',href:chess.href,label:chess.label||'Chess'});
  if(/archive|oldest|history/.test(q)&&archive)steps.push({type:'navigate',href:archive.href,label:archive.label||'Archive'});
  if(/music|song|play/.test(q)&&music)steps.push({type:'navigate',href:music.href,label:music.label||'Music Player'});
  if(/play/.test(q))steps.push({type:'media',operation:'play'});
  if(!steps.length)steps.push({type:'ask',prompt:goal});
  return{summary:'I plotted a safe local course from what is available here.',steps:steps.slice(0,5)};
}

function normalizeLinks(value){if(!Array.isArray(value))return[];const out=[];for(const x of value){const href=clean(x?.href),label=clean(x?.label);if(!href||!href.startsWith('/'))continue;if(/^\/\//.test(href))continue;if(!out.some(y=>y.href===href))out.push({href:href.slice(0,500),label:label.slice(0,120)})}return out}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
