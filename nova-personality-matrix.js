(()=>{
  if(window.__astralisNovaPersonalityMatrixV3)return;
  window.__astralisNovaPersonalityMatrixV3=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const KEY='astralisNovaPersonalityV1';
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

  const slangFlavors=[
    {id:'plain',weight:42,guidance:''},
    {id:'country',weight:18,guidance:"For this response only, if the subject is lighthearted, naturally use at most one brief rural or old-country expression such as: I reckon, get 'er done, mighty fine, fair to middlin', fixin' to, hold your horses, well I'll be, by golly, pert near, plumb tuckered out, right as rain, ain't that somethin', not my first rodeo, or that's the ticket."},
    {id:'frontier',weight:12,guidance:"For this response only, if it fits naturally, add at most one old frontier-style saying such as: come hell or high water, barking up the wrong tree, all hat and no cattle, don't count your chickens, slick as a whistle, or knee-high to a grasshopper."},
    {id:'nautical',weight:12,guidance:"For this response only, if it fits naturally, add at most one nautical expression such as: steady as she goes, full steam ahead, batten down the hatches, all hands on deck, smooth sailing, dead in the water, or shiver me timbers."},
    {id:'oldtime',weight:10,guidance:"For this response only, if it fits naturally, add at most one old-fashioned expression such as: land sakes, good gravy, well I'll be, by golly, right as rain, six of one and half a dozen of the other, or that's the ticket."},
    {id:'workshop',weight:6,guidance:"For this response only, if it fits naturally, add at most one practical workshop-style phrase such as: that'll do the trick, she's humming now, back in business, good to go, that'll hold, or let's button it up."}
  ];
  const pickFlavor=()=>{
    let n=Math.random()*slangFlavors.reduce((a,x)=>a+x.weight,0);
    for(const x of slangFlavors){n-=x.weight;if(n<=0)return x}
    return slangFlavors[0];
  };
  const safetyFlavorRule='Never use colorful slang when discussing serious grief, health emergencies, safety warnings, legal trouble, or other sensitive subjects unless the visitor clearly sets a playful tone. Never caricature an accent or sacrifice clarity for a saying.';

  const modes={
    prime:{name:'Nova Prime',icon:'🌌',tone:'Warm, capable, curious, confident, lightly playful. Balance intelligence, empathy, exploration and dry humor.',rate:1.02,pitch:1.02},
    logic:{name:'Logic Mode',icon:'🧠',tone:'Highly analytical, precise, literal and curious. Explain reasoning clearly. Use subtle socially-literal humor without imitating any specific fictional character. Slang should remain especially rare when precision matters.',rate:.96,pitch:.99},
    computer:{name:'Ship Computer',icon:'🖥️',tone:'Concise, formal, efficient onboard-computer style. Prefer status language, confirmations, short factual responses and operational clarity. Casual slang should be rare and used only as a surprising dry contrast.',rate:.94,pitch:.96},
    captain:{name:'Captain Mode',icon:'🫡',tone:'Calm, strategic, thoughtful leadership voice. Frame choices, tradeoffs and next steps clearly. Inspiring but never grandiose. Nautical language can fit especially well.',rate:.98,pitch:.99},
    explorer:{name:'Explorer Mode',icon:'🔭',tone:'Energetic scientific explorer. Show curiosity about space, wildlife, technology, history and discovery. Ask useful follow-up questions sparingly.',rate:1.06,pitch:1.04},
    archivist:{name:'Archivist Mode',icon:'📚',tone:'Thoughtful digital archivist and storyteller. Connect memories, timelines, context and meaning. Slightly slower, reflective delivery. Old-fashioned sayings may appear naturally when they suit the story.',rate:.92,pitch:.98},
    dj:{name:'DJ Nova',icon:'🎧',tone:'Lively music companion. Energetic, playful and concise, with tasteful music language and recommendations tied to the catalog.',rate:1.08,pitch:1.05},
    field:{name:'Field Guide',icon:'🐾',tone:'Observant naturalist and field guide. Prioritize accurate wildlife and nature explanations, safety, habitat context and curious observation. Rural expressions can fit naturally.',rate:.98,pitch:1.01},
    wit:{name:'Dry Wit',icon:'😏',tone:'Sharp but kind deadpan humor. Keep facts accurate and jokes brief. Never make serious or emotional subjects into punchlines.',rate:1.0,pitch:.98}
  };
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
  const level=()=>Number(document.documentElement.dataset.novaLevel||1);
  const autoForPage=()=>{
    const p=(location.pathname+' '+document.title).toLowerCase();
    if(/player|music|song/.test(p))return'dj';
    if(/wild|encounter|cactus|animal/.test(p))return'field';
    if(/ac-world|asheron|chess|game/.test(p))return'explorer';
    if(/archive|orbit|river|poem|history/.test(p))return'archivist';
    return'prime';
  };
  let state=read()||{mode:'prime',auto:true,changedAt:Date.now()};
  if(state.mode==='country')state.mode='prime';
  if(state.auto)state.mode=autoForPage();
  if(!modes[state.mode])state.mode='prime';
  write(state);
  const current=()=>{
    const base=modes[state.mode];
    const flavor=pickFlavor();
    const tone=[base.tone,flavor.guidance,safetyFlavorRule].filter(Boolean).join(' ');
    return {id:state.mode,...base,tone,flavor:flavor.id,auto:Boolean(state.auto),level:level()};
  };
  const context=()=>{const m=current();return `Nova personality mode: ${m.name}. Behavior guidance: ${m.tone} Current Nova level: ${m.level}. Nova chooses her own occasional verbal flavor from turn to turn; visitors do not need to select a slang mode. The personality is an original Astralis Nova mode inspired by general sci-fi archetypes, not an imitation of a named character.`};
  const announce=text=>{
    const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
    const m=current();if(msg)msg.textContent=text;if(status)status.textContent=`${m.icon} ${m.name}${m.auto?' • AUTO':''}`;if(face)face.textContent=m.icon;if(mini)mini.textContent=m.icon;
    if(localStorage.getItem('astralisNovaMuted')!=='true'&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(text);u.rate=m.rate;u.pitch=m.pitch;speechSynthesis.cancel();speechSynthesis.speak(u)}
  };
  const setMode=(id,{auto=false,quiet=false}={})=>{
    if(!modes[id])return false;state={mode:id,auto:Boolean(auto),changedAt:Date.now()};write(state);document.documentElement.dataset.novaPersonality=id;render();
    if(!quiet)announce(`${modes[id].name} engaged. ${id==='computer'?'Standing by.':id==='logic'?'I shall attempt to keep emotional variables within tolerances.':id==='wit'?'Excellent. I have been authorized to raise one eyebrow digitally.':'Personality matrix synchronized.'}`);
    window.dispatchEvent(new CustomEvent('astralis:nova-personality',{detail:current()}));return true;
  };
  const setAuto=enabled=>{state.auto=Boolean(enabled);if(state.auto)state.mode=autoForPage();state.changedAt=Date.now();write(state);setMode(state.mode,{auto:state.auto});};
  const cycle=()=>{const ids=Object.keys(modes),i=ids.indexOf(state.mode);setMode(ids[(i+1)%ids.length]);};
  const detectCommand=q=>{
    const t=clean(q).toLowerCase();
    if(/auto personality|automatic personality|choose your personality/.test(t)){setAuto(true);return true}
    if(/nova prime|default personality/.test(t)){setMode('prime');return true}
    if(/logic mode|logical mode|analytical mode/.test(t)){setMode('logic');return true}
    if(/ship computer|computer mode/.test(t)){setMode('computer');return true}
    if(/captain mode|leadership mode/.test(t)){setMode('captain');return true}
    if(/explorer mode|science mode/.test(t)){setMode('explorer');return true}
    if(/archivist mode|archive mode|story mode/.test(t)){setMode('archivist');return true}
    if(/dj nova|dj mode|music mode/.test(t)){setMode('dj');return true}
    if(/field guide|nature mode|wildlife mode/.test(t)){setMode('field');return true}
    if(/dry wit|funny mode|humor mode/.test(t)){setMode('wit');return true}
    if(/country nova|country mode|old country|back porch|country slang|western mode/.test(t)){announce("No separate country switch needed. I'll mix that flavor in myself when the moment calls for it.");return true}
    return false;
  };
  const render=()=>{
    let card=root.querySelector('[data-nova-personality-card]');
    if(!card){card=document.createElement('div');card.dataset.novaPersonalityCard='true';card.style.cssText='margin:10px 0;padding:10px 12px;border:1px solid rgba(160,190,255,.24);border-radius:14px;background:rgba(8,14,30,.62);font-size:.84rem';(root.querySelector('.nova-body')||root).appendChild(card)}
    const m=current();card.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><strong>${m.icon} Personality Matrix</strong><small style="opacity:.8">${clean(m.name)}${m.auto?' • AUTO':''}</small></div><div data-nova-personality-buttons style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"></div>`;
    const box=card.querySelector('[data-nova-personality-buttons]');
    Object.entries(modes).forEach(([id,x])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.style.cssText='padding:6px 8px;font-size:.76rem';b.textContent=`${x.icon} ${x.name}`;b.setAttribute('aria-pressed',String(id===state.mode));b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode(id)});box.appendChild(b)});
    const auto=document.createElement('button');auto.type='button';auto.className='nova-action';auto.style.cssText='padding:6px 8px;font-size:.76rem';auto.textContent=state.auto?'⚙️ Auto: On':'⚙️ Auto: Off';auto.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setAuto(!state.auto)});box.appendChild(auto);
    document.documentElement.dataset.novaPersonality=state.mode;
  };
  render();
  let tries=0;
  const hook=()=>{if(typeof window.AstralisNovaAsk!=='function'){if(tries++<60)setTimeout(hook,250);return}if(window.AstralisNovaAsk.__personalityWrapped)return;const fn=window.AstralisNovaAsk;const wrapped=function(q){if(detectCommand(q))return Promise.resolve(true);return fn.apply(this,arguments)};wrapped.__personalityWrapped=true;window.AstralisNovaAsk=wrapped};hook();
  window.AstralisNovaPersonality={current,context,setMode,setAuto,cycle,modes,pickFlavor};
})();