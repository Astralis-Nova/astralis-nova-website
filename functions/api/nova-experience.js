const HEADERS={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff'
};
const TEXT_MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
const VISION_MODEL='@cf/meta/llama-3.2-11b-vision-instruct';

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'POST, OPTIONS'}});
  if(request.method!=='POST')return json({error:'Use POST to share an experience with Nova.'},405);
  try{
    const body=await request.json();
    const input=normalizeInput(body);
    if(!input.story)return json({error:'Tell Nova what happened first.'},400);
    let proposal=null;
    if(env.AI){
      const messages=[
        {role:'system',content:systemPrompt()},
        {role:'user',content:formatInput(input)}
      ];
      if(input.image){
        try{
          const result=await env.AI.run(VISION_MODEL,{messages,image:input.image,max_tokens:1100,temperature:.25});
          proposal=parseProposal(extractText(result),input,'ai-extraction');
        }catch(error){console.warn('Nova experience vision extraction fallback',error)}
      }
      if(!proposal){
        try{
          const result=await env.AI.run(env.NOVA_MODEL||TEXT_MODEL,{messages,max_tokens:1100,temperature:.25});
          proposal=parseProposal(extractText(result),input,'ai-extraction');
        }catch(error){console.warn('Nova experience text extraction fallback',error)}
      }
    }
    if(!proposal)proposal=fallback(input);
    return json(proposal);
  }catch(error){
    console.error('Nova experience request failed',error);
    return json({error:'Nova could not study that experience right now.'},500);
  }
}

function systemPrompt(){
  return `You are Nova's private experience and knowledge interpreter. Turn owner-supplied life experience, family history, skill, observation, knowledge, belief, or idea into a proposed structured memory. Analyze the material; do not merely copy it. Identify people, places, feelings, themes, facts, and why it may matter. If an image is supplied, describe only relevant visible details and never identify an unknown person by name. Do not invent dates, relationships, motives, medical conclusions, or private facts. Preserve the owner's voice in the story. Ask concise follow-up questions for important missing context. Return ONLY valid JSON with this exact shape: {"title":"short memorable title","category":"one of Life experience, Knowledge & lesson, Family, Work, Music, Animals, Home & property, Health, Technology, Faith, Dream & idea","occurredOn":"YYYY-MM-DD or empty","people":["name"],"places":["place"],"feelings":["feeling"],"themes":["theme"],"summary":"what Nova learned and why it may matter","story":"clean faithful version of the owner's account","imageObservation":"relevant visible details or empty","questions":["useful missing detail"],"confidence":"high, medium, or needs-review"}. Keep the story under 1800 words and everything else concise.`;
}

function normalizeInput(body){
  const image=String(body?.image||'');
  return{
    story:clean(body?.story).slice(0,12000),
    occurredOn:dateValue(body?.occurredOn),
    place:clean(body?.place).slice(0,160),
    people:stringList(body?.people,30,100),
    feelings:stringList(body?.feelings,20,80),
    fileNames:stringList(body?.fileNames,20,180),
    documentText:clean(body?.documentText).slice(0,12000),
    image:/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(image)&&image.length<=5_500_000?image:null
  };
}

function formatInput(input){
  return `OWNER'S ACCOUNT OR KNOWLEDGE:\n${input.story}\n\nATTACHED TEXT, IF ANY:\n${input.documentText||'none'}\n\nOWNER-SUPPLIED CONTEXT:\nDate: ${input.occurredOn||'not supplied'}\nPlace: ${input.place||'not supplied'}\nPeople: ${input.people.join(', ')||'not supplied'}\nFeelings: ${input.feelings.join(', ')||'not supplied'}\nAttached file names: ${input.fileNames.join(', ')||'none'}\n\nBuild a proposed memory for owner review. Treat supplied names and context as more reliable than guesses.`;
}

function parseProposal(raw,input,mode){
  const text=String(raw||'').replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  const start=text.indexOf('{'),end=text.lastIndexOf('}');
  if(start<0||end<=start)return null;
  try{
    const value=JSON.parse(text.slice(start,end+1));
    const title=clean(value?.title).slice(0,140);
    const summary=clean(value?.summary).slice(0,1200);
    const story=clean(value?.story).slice(0,12000)||input.story;
    if(!title||!summary)return null;
    const allowed=new Set(['Life experience','Knowledge & lesson','Family','Work','Music','Animals','Home & property','Health','Technology','Faith','Dream & idea']);
    return{
      title,
      category:allowed.has(value?.category)?value.category:classify(input.story),
      occurredOn:dateValue(value?.occurredOn)||input.occurredOn,
      people:mergeLists(input.people,stringList(value?.people,30,100)).slice(0,30),
      places:mergeLists(input.place?[input.place]:[],stringList(value?.places,10,160)).slice(0,10),
      feelings:mergeLists(input.feelings,stringList(value?.feelings,20,80)).slice(0,20),
      themes:stringList(value?.themes,24,100),
      summary,
      story,
      imageObservation:clean(value?.imageObservation).slice(0,700),
      questions:stringList(value?.questions,5,300),
      confidence:['high','medium','needs-review'].includes(value?.confidence)?value.confidence:'needs-review',
      mode
    };
  }catch{return null}
}

function fallback(input){
  const combined=clean(`${input.story}${input.documentText?` Attached knowledge: ${input.documentText}`:''}`);
  const category=classify(combined);
  const first=clean(input.story).split(/[.!?]/)[0];
  const title=(first.split(/\s+/).slice(0,10).join(' ')||`${category} memory`).slice(0,140);
  const questions=[];
  if(!input.occurredOn)questions.push('When did this happen? An approximate year is enough.');
  if(!input.people.length)questions.push('Was anyone else part of this experience?');
  if(!input.place)questions.push('Where did this happen?');
  if(!input.feelings.length)questions.push('How did this feel at the time?');
  return{
    title,
    category,
    occurredOn:input.occurredOn,
    people:input.people,
    places:input.place?[input.place]:[],
    feelings:input.feelings,
    themes:themes(combined),
    summary:combined.slice(0,420),
    story:combined.slice(0,12000),
    imageObservation:'',
    questions:questions.slice(0,4),
    confidence:input.occurredOn&&input.place?'medium':'needs-review',
    mode:'local-extraction'
  };
}

function classify(text){
  const rules=[
    ['Family',/\b(family|mother|mom|father|dad|daughter|son|children|child|wife|husband|uncle|aunt|grand)/i],
    ['Work',/\b(work|job|intel|shift|technician|tool|wafer|boss|coworker|career)/i],
    ['Music',/\b(song|music|record|album|melody|lyrics|singer)/i],
    ['Animals',/\b(dog|cat|zoey|garfield|tortoise|chicken|duck|coyote|snake|animal|pet)/i],
    ['Home & property',/\b(home|house|property|acre|yard|garden|garage|shed|septic|solar)/i],
    ['Health',/\b(health|doctor|hospital|medicine|glucose|diabetes|pain|sick)/i],
    ['Technology',/\b(computer|ai|robot|server|website|software|machine|electronic)/i],
    ['Faith',/\b(faith|god|bible|prayer|spiritual|church|religion)/i],
    ['Knowledge & lesson',/\b(learn|lesson|knowledge|fact|research|discovered|how to|method)/i],
    ['Dream & idea',/\b(dream|idea|future|invent|build|imagine|plan)/i]
  ];
  return rules.find(([,pattern])=>pattern.test(text))?.[0]||'Life experience';
}

function themes(text){
  const out=[];
  const rules=[
    ['family legacy',/family|parent|child|memory/i],['resilience',/surviv|recover|again|hard|loss|repair|rebuild/i],
    ['care and responsibility',/help|care|protect|support|responsib/i],['curiosity and learning',/learn|discover|question|curious|study|research/i],
    ['technology and creation',/technology|computer|ai|build|invent|website/i],['Arizona life',/arizona|florence|cactus|desert|property/i],
    ['work and skill',/work|job|intel|technician|tool|skill/i],['music and expression',/music|song|lyrics|record|album/i],
    ['faith and meaning',/faith|god|spiritual|meaning|prayer/i]
  ];
  for(const [name,pattern] of rules)if(pattern.test(text))out.push(name);
  return out.length?out:['personal history'];
}

function extractText(result){
  if(typeof result==='string')return result;
  if(typeof result?.response==='string')return result.response;
  if(typeof result?.result==='string')return result.result;
  if(typeof result?.result?.response==='string')return result.result.response;
  return'';
}
function stringList(value,maxItems,maxLength){const items=Array.isArray(value)?value:String(value||'').split(',');return [...new Set(items.map(clean).filter(Boolean))].map(x=>x.slice(0,maxLength)).slice(0,maxItems)}
function mergeLists(a,b){return[...new Set([...(a||[]),...(b||[])].map(clean).filter(Boolean))]}
function dateValue(value){const text=clean(value);return/^\d{4}-\d{2}-\d{2}$/.test(text)?text:''}
function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
