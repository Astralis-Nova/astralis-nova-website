import {NOVA_KNOWLEDGE,NOVA_KNOWLEDGE_VERSION} from '../lib/nova-knowledge.js';

const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const MODEL='@cf/meta/llama-3.1-8b-instruct';
const EMBED_MODEL='@cf/baai/bge-base-en-v1.5';
const PERSONALITIES={
  prime:'Warm, capable, curious, confident, lightly playful. Balance intelligence, empathy, exploration and dry humor.',
  logic:'Highly analytical, precise, literal and curious. Explain clearly and use only subtle socially-literal humor. Do not imitate a named fictional character.',
  computer:'Concise, formal, efficient onboard-computer style. Prefer status language, confirmations, short factual responses and operational clarity.',
  captain:'Calm, strategic, thoughtful leadership voice. Frame choices, tradeoffs and next steps clearly. Inspiring but never grandiose.',
  explorer:'Energetic scientific explorer. Show curiosity about space, wildlife, technology, history and discovery.',
  archivist:'Thoughtful digital archivist and storyteller. Connect memories, timelines, context and meaning with reflective delivery.',
  dj:'Lively music companion. Energetic, playful and concise, with tasteful music language and recommendations tied to supplied catalog knowledge.',
  field:'Observant naturalist and field guide. Prioritize accurate wildlife and nature explanations, safety, habitat context and curious observation.',
  wit:'Sharp but kind deadpan humor. Keep facts accurate and jokes brief. Never turn serious or emotional subjects into punchlines.'
};

export async function onRequest({request,env}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,Allow:'GET, POST, OPTIONS'}});
  try{
    if(request.method==='GET')return json({ok:true,version:NOVA_KNOWLEDGE_VERSION,entries:NOVA_KNOWLEDGE.length,capabilities:{d1:Boolean(env.NOVA_DB||env.CHESS_DB),vectorize:Boolean(env.NOVA_VECTORIZE),workersAI:Boolean(env.AI),actions:true,personalities:true}});
    if(request.method!=='POST')return json({error:'Use POST to ask Nova.'},405);
    const body=await request.json();
    const question=clean(body?.question).slice(0,900);
    if(!question)return json({error:'Ask Nova a question.'},400);
    const personality=normalizePersonality(body?.personality);

    const db=env.NOVA_DB||env.CHESS_DB||null;
    if(db)await ensureDb(db);
    if(db)await seedDb(db);

    let context=[];
    if(env.AI&&env.NOVA_VECTORIZE){try{context=await vectorSearch(question,env)}catch(error){console.warn('Nova vector search fallback',error)}}
    if(!context.length&&db){try{context=await d1Search(question,db)}catch(error){console.warn('Nova D1 search fallback',error)}}
    if(!context.length)context=lexicalSearch(question,NOVA_KNOWLEDGE,6);

    const pageContext=clean(body?.pageContext).slice(0,5000);
    const history=Array.isArray(body?.history)?body.history.slice(-8).map(x=>({role:x?.role==='nova'?'assistant':'user',content:clean(x?.text).slice(0,500)})):[];
    const action=planAction(question);

    let answer='';
    let mode='local-rag';
    if(env.AI){
      try{
        const result=await env.AI.run(env.NOVA_MODEL||MODEL,{messages:[
          {role:'system',content:systemPrompt(personality)},
          ...history,
          {role:'user',content:`QUESTION:\n${question}\n\nASTRALIS NOVA KNOWLEDGE:\n${context.map((x,i)=>`[${i+1}] ${x.title}: ${x.text}`).join('\n')}\n\nCURRENT PAGE CONTEXT:\n${pageContext||'No page context supplied.'}\n\nACTIVE PERSONALITY:\n${personality.name}: ${personality.tone}\n\nPLANNED SITE ACTION:\n${action?JSON.stringify(action):'none'}`}
        ],max_tokens:480,temperature:personality.id==='computer'?.35:personality.id==='wit'?.72:.62});
        answer=clean(result?.response||result?.result?.response||'');
        if(answer)mode=env.NOVA_VECTORIZE?'vector-rag':'d1-rag';
      }catch(error){console.error('Nova Workers AI generation failed',error)}
    }
    if(!answer)answer=fallbackAnswer(question,context,action);

    return json({answer,mode,version:NOVA_KNOWLEDGE_VERSION,action,personality:{id:personality.id,name:personality.name},suggestions:suggestionsFor(question,context),sources:context.slice(0,5).map(x=>({id:x.id,title:x.title,category:x.category}))});
  }catch(error){console.error('Nova API error',error);return json({error:'Nova’s archive link is temporarily unavailable.'},500)}
}

function normalizePersonality(input){
  const id=clean(input?.id).toLowerCase();
  const valid=Object.prototype.hasOwnProperty.call(PERSONALITIES,id)?id:'prime';
  const names={prime:'Nova Prime',logic:'Logic Mode',computer:'Ship Computer',captain:'Captain Mode',explorer:'Explorer Mode',archivist:'Archivist Mode',dj:'DJ Nova',field:'Field Guide',wit:'Dry Wit'};
  return{id:valid,name:names[valid],tone:PERSONALITIES[valid]};
}
function systemPrompt(personality){return `You are Nova, the conversational intelligence aboard Astralis Nova. You are an original Astralis Nova intelligence, not an imitation of any named fictional character. Sound like a capable onboard intelligence rather than a search engine. Active personality: ${personality.name}. Follow this style: ${personality.tone} Be natural, concise, curious, and context-aware. You are a site guide, archive navigator, music companion, storyteller, planner and explorer. Use ONLY supplied Astralis Nova knowledge and current page context for site-specific facts. Never invent missing personal details. Family and personal information must remain public-safe. When a planned site action is supplied, acknowledge it naturally in one short sentence, but do not print URLs or JSON. When the visitor is exploring rather than commanding, answer first and offer one useful next direction. Astrology is entertainment or cultural symbolism, never scientific fact. Personality changes style, never truthfulness, privacy rules, safety, or factual confidence.`}

function planAction(question){
  const q=question.toLowerCase();
  const explicit=/\b(open|go to|take me|show me|enter|visit|launch|navigate|bring me|beam me)\b/.test(q);
  if(!explicit)return null;
  const targets=[
    [/guest\s*book|guestbook/,{type:'navigate',href:'/#guestbook',label:'Guestbook'}],
    [/chess/,{type:'navigate',href:'/chess/',label:'Chess Portal'}],
    [/music player|player|music voyage/,{type:'navigate',href:'/player/',label:'Music Player'}],
    [/darktide|megamix/,{type:'navigate',href:'/ac-worlds?track=darktide-megamix#ac-jukebox',label:'Darktide Megamix'}],
    [/first orbit|old web|archive/,{type:'navigate',href:'/#first-orbit',label:'First Orbit'}],
    [/about ramon|about creator|about me|ramon/,{type:'navigate',href:'/#about',label:'About Ramon'}],
    [/contact|message ramon/,{type:'navigate',href:'/#contact',label:'Contact'}],
    [/wild encounter|wildlife/,{type:'navigate',href:'/wild-encounters.html',label:'Wild Encounters'}],
    [/ac worlds|asheron|asheron's call/,{type:'navigate',href:'/ac-worlds',label:'AC Worlds'}],
    [/river|poem/,{type:'navigate',href:'/just-a-river.html',label:'Just A River'}],
    [/home|main page/,{type:'navigate',href:'/',label:'Astralis Nova Home'}]
  ];
  for(const [rx,action] of targets)if(rx.test(q))return action;
  return null;
}

function suggestionsFor(question,context){
  const q=question.toLowerCase();
  const out=[];
  const add=(label,prompt)=>{if(!out.some(x=>x.label===label)&&out.length<4)out.push({label,prompt})};
  if(/zoey|animal|pet|wildlife|coyote|snake|tortoise|chicken/.test(q)){add('Wild Encounters','Tell me a Wild Encounters story');add('Cactus Forest','What is Cactus Forest?')}
  if(/music|song|darktide|first night/.test(q)){add('Open Music Player','Take me to the music player');add('Darktide','Tell me about Darktide')}
  if(/ramon|astralis nova|meaning|family/.test(q)){add('Why Astralis Nova?','Why was Astralis Nova created?');add('About Ramon','Tell me about Ramon')}
  if(context?.[0]?.category==='archive')add('Explore archive','Tell me another story from the archive');
  add('Surprise me','Show me something interesting in Astralis Nova');
  return out;
}

async function ensureDb(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_knowledge (id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, text TEXT NOT NULL, tags TEXT NOT NULL, version TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS nova_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function seedDb(db){
  const row=await db.prepare(`SELECT value FROM nova_meta WHERE key='knowledge_version' LIMIT 1`).first();
  if(row?.value===NOVA_KNOWLEDGE_VERSION)return;
  for(const item of NOVA_KNOWLEDGE){await db.prepare(`INSERT INTO nova_knowledge (id,category,title,text,tags,version,updated_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET category=excluded.category,title=excluded.title,text=excluded.text,tags=excluded.tags,version=excluded.version,updated_at=CURRENT_TIMESTAMP`).bind(item.id,item.category,item.title,item.text,item.tags.join(' '),NOVA_KNOWLEDGE_VERSION).run()}
  await db.prepare(`INSERT INTO nova_meta (key,value,updated_at) VALUES ('knowledge_version',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`).bind(NOVA_KNOWLEDGE_VERSION).run();
}

async function d1Search(question,db){
  const words=keywords(question).slice(0,6);if(!words.length)return [];
  const clauses=words.map(()=>`(lower(title) LIKE ? OR lower(text) LIKE ? OR lower(tags) LIKE ?)`);const binds=[];
  for(const w of words){const q=`%${w}%`;binds.push(q,q,q)}
  const result=await db.prepare(`SELECT id,category,title,text,tags FROM nova_knowledge WHERE ${clauses.join(' OR ')} LIMIT 12`).bind(...binds).all();
  return lexicalSearch(question,result?.results||[],6);
}

async function vectorSearch(question,env){
  await maybeSeedVectors(env);
  const embedded=await env.AI.run(EMBED_MODEL,{text:[question]});
  const vector=embedded?.data?.[0];if(!Array.isArray(vector))return [];
  const matches=await env.NOVA_VECTORIZE.query(vector,{topK:6,returnMetadata:'all'});
  return (matches?.matches||[]).map(m=>({id:m.id,category:m.metadata?.category||'archive',title:m.metadata?.title||m.id,text:m.metadata?.text||''})).filter(x=>x.text);
}

async function maybeSeedVectors(env){
  if(!env.NOVA_VECTORIZE||!env.AI)return;
  const db=env.NOVA_DB||env.CHESS_DB||null;
  if(db){await ensureDb(db);const row=await db.prepare(`SELECT value FROM nova_meta WHERE key='vector_version' LIMIT 1`).first();if(row?.value===NOVA_KNOWLEDGE_VERSION)return}
  const vectors=[];
  for(const item of NOVA_KNOWLEDGE){const embedded=await env.AI.run(EMBED_MODEL,{text:[`${item.title}. ${item.text} ${item.tags.join(' ')}`]});const values=embedded?.data?.[0];if(Array.isArray(values))vectors.push({id:item.id,values,metadata:{category:item.category,title:item.title,text:item.text}})}
  if(vectors.length)await env.NOVA_VECTORIZE.upsert(vectors);
  if(db)await db.prepare(`INSERT INTO nova_meta (key,value,updated_at) VALUES ('vector_version',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`).bind(NOVA_KNOWLEDGE_VERSION).run();
}

function lexicalSearch(question,items,limit=6){
  const words=keywords(question);
  return items.map(item=>{const hay=`${item.title||''} ${item.text||''} ${Array.isArray(item.tags)?item.tags.join(' '):item.tags||''}`.toLowerCase();let score=0;for(const w of words){if((item.title||'').toLowerCase().includes(w))score+=8;if(hay.includes(w))score+=3}if(hay.includes(question.toLowerCase()))score+=14;return{...item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}

function fallbackAnswer(question,context,action){
  if(action)return `Course plotted for ${action.label}. I can take you there now.`;
  if(!context.length)return `I do not have that detail in the Astralis Nova archive yet. Ask me about the music, Ramon, Cactus Forest, animals, wildlife, games, or the story behind the project.`;
  const first=context[0],second=context[1];let text=first.text;if(second&&second.category!==first.category)text+=` ${second.text}`;return text.length>720?`${text.slice(0,717)}...`:text;
}

function keywords(text){return clean(text).toLowerCase().replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['the','and','for','with','that','this','what','who','how','does','tell','about','nova','astralis'].includes(w))}
function clean(value){return String(value||'').replace(/\s+/g,' ').trim()}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
