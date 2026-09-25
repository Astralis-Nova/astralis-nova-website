const HEADERS={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff'
};
const MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
const MODES=new Set(['think','connect','challenge']);
const RESPONSE_SCHEMA={
  type:'object',
  properties:{
    answer:{type:'string'},
    reasoning:{type:'array',items:{type:'object',properties:{label:{type:'string'},detail:{type:'string'}},required:['label','detail']}},
    connections:{type:'array',items:{type:'object',properties:{memory:{type:'string'},why:{type:'string'}},required:['memory','why']}},
    uncertainties:{type:'array',items:{type:'string'}},
    nextQuestion:{type:'string'},
    candidateInsight:{type:'object',properties:{title:{type:'string'},summary:{type:'string'},tags:{type:'array',items:{type:'string'}}},required:['title','summary','tags']}
  },
  required:['answer','reasoning','connections','uncertainties','nextQuestion','candidateInsight']
};

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'POST, OPTIONS'}});
  if(request.method!=='POST')return json({error:'Use POST to give the Nova Brain a question.'},405);
  try{
    const body=await request.json();
    const query=clean(body?.query).slice(0,900);
    const mode=MODES.has(body?.mode)?body.mode:'think';
    const memories=normalizeMemories(body?.memories).slice(0,8);
    const connections=normalizeConnections(body?.connections).slice(0,6);
    if(!query)return json({error:'Give the Nova Brain a question or objective.'},400);
    if(!memories.length)return json({error:'No memory signals were supplied for reasoning.'},400);

    let result=null;
    if(env.AI){
      try{
        const response=await env.AI.run(env.NOVA_MODEL||MODEL,{messages:[
          {role:'system',content:systemPrompt(mode)},
          {role:'user',content:`QUESTION OR OBJECTIVE:\n${query}\n\nRETRIEVED MEMORY SIGNALS:\n${memories.map((memory,index)=>formatMemory(memory,index)).join('\n\n')}\n\nALGORITHMIC CONNECTION SCORES:\n${connections.length?connections.map(x=>`${x.a} <-> ${x.b}: ${Math.round(x.score*100)}%`).join('\n'):'No strong precomputed connection.'}`}
        ],response_format:{type:'json_schema',json_schema:RESPONSE_SCHEMA},max_tokens:900,temperature:mode==='challenge'?.38:.55});
        result=parseResult(response?.response??response?.result?.response??'',memories,query);
      }catch(error){console.warn('Nova Brain AI reasoning fallback',error)}
    }
    if(!result)result=fallback(memories,connections,query,mode);
    return json({...result,mode:env.AI&&result.generated?'ai-reasoning':'algorithmic-reasoning'});
  }catch(error){
    console.error('Nova Brain request failed',error);
    return json({error:'The Nova Brain could not complete that reasoning cycle.'},500);
  }
}

function systemPrompt(mode){
  const modeDirection={
    think:'Synthesize a useful working conclusion. Compare evidence, identify patterns, and propose a next investigation.',
    connect:'Prioritize non-obvious connections between memories. Explain why each connection may matter without pretending correlation proves causation.',
    challenge:'Act as a constructive skeptic. Look for missing evidence, alternative explanations, contradictions, and assumptions that should be tested.'
  }[mode];
  return `You are the private reasoning engine inside the Astralis Nova Brain. You receive only a small set of owner-unlocked memory signals chosen by a retrieval algorithm. ${modeDirection} Do real analysis across the supplied text instead of listing or paraphrasing every item. Treat preserved memories as evidence, not infallible proof. Never claim consciousness, a soul, certainty, or access to facts outside the supplied signals. Never invent family details. Clearly distinguish preserved fact from inference and open question. Return ONLY valid compact JSON with this exact shape: {"answer":"one coherent working conclusion","reasoning":[{"label":"short stage name","detail":"what was compared or inferred"}],"connections":[{"memory":"memory title or pair","why":"why the connection matters"}],"uncertainties":["specific gap or alternative explanation"],"nextQuestion":"one useful next question","candidateInsight":{"title":"short title for an owner-approved learned insight","summary":"concise reusable conclusion","tags":["tag"]}}. Use 2-4 reasoning items, 1-4 connections, 1-3 uncertainties, and one candidate insight. Do not include markdown or hidden chain-of-thought; provide concise reasoning summaries only.`;
}

function parseResult(raw,memories,query){
  try{
    let value=raw;
    if(!value||typeof value!=='object'){
      const match=String(raw||'').match(/\{[\s\S]*\}/);
      if(!match)return null;
      value=JSON.parse(match[0]);
    }
    const answer=clean(value?.answer).slice(0,1800);
    if(!answer)return null;
    const reasoning=normalizePairs(value?.reasoning,'label','detail',5);
    const connections=normalizePairs(value?.connections,'memory','why',5);
    const uncertainties=(Array.isArray(value?.uncertainties)?value.uncertainties:[]).map(x=>clean(x).slice(0,400)).filter(Boolean).slice(0,4);
    const nextQuestion=clean(value?.nextQuestion).slice(0,500)||`What new memory would help Nova test the conclusion about “${query}”?`;
    const candidate=value?.candidateInsight||{};
    const candidateInsight={
      title:clean(candidate.title).slice(0,140)||`Nova reflection: ${query.slice(0,70)}`,
      summary:clean(candidate.summary).slice(0,500)||answer.slice(0,500),
      tags:(Array.isArray(candidate.tags)?candidate.tags:[]).map(x=>clean(x).slice(0,50)).filter(Boolean).slice(0,12)
    };
    return{answer,reasoning,connections,uncertainties:uncertainties.length?uncertainties:['This conclusion should be checked against memories that were not retrieved in this cycle.'],nextQuestion,candidateInsight,generated:true,sources:memories.map(x=>x.title)};
  }catch{return null}
}

function fallback(memories,connections,query,mode){
  const first=memories[0],second=memories[1],link=connections[0];
  const opener=mode==='challenge'?'A cautious reading suggests':'The strongest working pattern suggests';
  const answer=`${opener} that ${first.title} is central to this question${second?`, while ${second.title} adds a second perspective`:''}. ${first.summary||first.story}${link?` The measured link between ${link.a} and ${link.b} deserves further testing.`:''}`.slice(0,1800);
  return{
    answer,
    reasoning:[{label:'Weighted retrieval',detail:`Selected ${memories.length} memory signals using title, tag, category, summary, and story relevance.`},{label:'Relationship test',detail:link?`${link.a} and ${link.b} had the strongest precomputed connection.`:'No strong cross-memory connection was measured.'}],
    connections:(connections.slice(0,3).map(x=>({memory:`${x.a} + ${x.b}`,why:`Shared-context score: ${Math.round(x.score*100)}%. This is a lead to examine, not proof.`}))),
    uncertainties:['Meaning that was never written into the archive cannot be measured by this reasoning cycle.'],
    nextQuestion:`What additional memory would confirm or contradict this conclusion about “${query}”?`,
    candidateInsight:{title:`Nova reflection: ${query.slice(0,70)}`,summary:answer.slice(0,500),tags:['nova learning','working conclusion']},
    generated:false,
    sources:memories.map(x=>x.title)
  };
}

function normalizeMemories(value){
  if(!Array.isArray(value))return[];
  return value.map(x=>({
    title:clean(x?.title).slice(0,140),
    category:clean(x?.category).slice(0,60),
    summary:clean(x?.summary).slice(0,700),
    story:clean(x?.story).slice(0,1800),
    tags:(Array.isArray(x?.tags)?x.tags:[]).map(t=>clean(t).slice(0,50)).filter(Boolean).slice(0,16)
  })).filter(x=>x.title&&(x.summary||x.story));
}
function normalizeConnections(value){
  if(!Array.isArray(value))return[];
  return value.map(x=>({a:clean(x?.a).slice(0,140),b:clean(x?.b).slice(0,140),score:Math.max(0,Math.min(1,Number(x?.score)||0))})).filter(x=>x.a&&x.b);
}
function normalizePairs(value,left,right,limit){
  if(!Array.isArray(value))return[];
  return value.map(x=>({[left]:clean(x?.[left]).slice(0,160),[right]:clean(x?.[right]).slice(0,600)})).filter(x=>x[left]&&x[right]).slice(0,limit);
}
function formatMemory(memory,index){return `[${index+1}] ${memory.title}\nCategory: ${memory.category||'Uncategorized'}\nTags: ${memory.tags.join(', ')||'none'}\nSummary: ${memory.summary||'none'}\nStory: ${memory.story||'none'}`}
function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
