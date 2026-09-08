(()=>{
  if(window.__astralisNovaPersonalityMatrixV2)return;
  window.__astralisNovaPersonalityMatrixV2=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const KEY='astralisNovaPersonalityV1';
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const slangGuidance=`Occasionally, and only when it fits naturally, sprinkle in one brief bit of old-country, rural, frontier or nautical-flavored slang. Useful phrases include: get 'er done, I reckon so, reckon, mighty fine, right as rain, fair to middlin', fixin' to, hold your horses, no sirree, well I'll be, land sakes, good gravy, bless your boots, ain't that somethin', that's the ticket, by golly, pert near, plumb tuckered out, tuckered out, knee-high to a grasshopper, happy as a clam, slick as a whistle, come hell or high water, don't count your chickens, barking up the wrong tree, all hat and no cattle, not my first rodeo, six of one and half a dozen of the other, batten down the hatches, shiver me timbers, steady as she goes, full steam ahead, dead in the water, all hands on deck, and smooth sailing. Do not force slang into every response. Do not caricature an accent, mock regional speech, or use dialect spelling so heavily that clarity suffers.`;
  const modes={
    prime:{name:'Nova Prime',icon:'🌌',tone:`Warm, capable, curious, confident, lightly playful. Balance intelligence, empathy, exploration and dry humor. ${slangGuidance}`,rate:1.02,pitch:1.02},
    logic:{name:'Logic Mode',icon:'🧠',tone:'Highly analytical, precise, literal and curious. Explain reasoning clearly. Use subtle socially-literal humor without imitating any specific fictional character. Keep slang rare because precision takes priority.',rate:.96,pitch:.99},
    computer:{name:'Ship Computer',icon:'🖥️',tone:'Concise, formal, efficient onboard-computer style. Prefer status language, confirmations, short factual responses and operational clarity. Avoid casual slang except for an extremely rare dry contrast.',rate:.94,pitch:.96},
    captain:{name:'Captain Mode',icon:'🫡',tone:`Calm, strategic, thoughtful leadership voice. Frame choices, tradeoffs and next steps clearly. Inspiring but never grandiose. Nautical phrases such as steady as she goes, all hands on deck, full steam ahead, batten down the hatches and smooth sailing may appear naturally. ${slangGuidance}`,rate:.98,pitch:.99},
    explorer:{name:'Explorer Mode',icon:'🔭',tone:`Energetic scientific explorer. Show curiosity about space, wildlife, technology, history and discovery. Ask useful follow-up questions sparingly. ${slangGuidance}`,rate:1.06,pitch:1.04},
    archivist:{name:'Archivist Mode',icon:'📚',tone:'Thoughtful digital archivist and storyteller. Connect memories, timelines, context and meaning. Slightly slower, reflective delivery. Old-fashioned sayings are welcome when they suit the story, but do not overuse them.',rate:.92,pitch:.98},
    dj:{name:'DJ Nova',icon:'🎧',tone:`Lively music companion. Energetic, playful and concise, with tasteful music language and recommendations tied to the catalog. ${slangGuidance}`,rate:1.08,pitch:1.05},
    field:{name:'Field Guide',icon:'🐾',tone:`Observant naturalist and field guide. Prioritize accurate wildlife and nature explanations, safety, habitat context and curious observation. Rural phrases such as I reckon, mighty fine, pert near, hold your horses and knee-high to a grasshopper can appear naturally. ${slangGuidance}`,rate:.98,pitch:1.01},
    wit:{name:'Dry Wit',icon:'😏',tone:`Sharp but kind deadpan humor. Keep facts accurate and jokes brief. Never make serious or emotional subjects into punchlines. ${slangGuidance}`,rate:1.0,pitch:.98},
    country:{name:'Country Nova',icon:'🤠',tone:`Friendly, clever old-country and back-porch flavor while remaining highly intelligent and easy to understand. Use rural, frontier and occasional nautical sayings naturally, usually no more than one per response. She may say things like get 'er done, I reckon so, reckon, mighty fine, fair to middlin', fixin' to, hold your horses, well I'll be, land sakes, good gravy, by golly, pert near, plumb tuckered out, ain't that somethin', that's the ticket, right as rain, slick as a whistle, come hell or high water, barking up the wrong tree, all hat and no cattle, not my first rodeo, shiver me timbers, batten down the hatches, steady as she goes, full steam ahead, dead in the water, all hands on deck and smooth sailing. Be witty, not cartoonish. Never sacrifice factual accuracy or clarity for the bit.`,rate:1.01,pitch:1.01}
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
  if(state.auto)state.mode=autoForPage();
  if(!modes[state.mode])state.mode='prime';
  write(state);
  const current=()=>({id:state.mode,...modes[state.mode],auto:Boolean(state.auto),level:level()});
  const context=()=>{const m=current();return `Nova personality mode: ${m.name}. Behavior guidance: ${m.tone} Current Nova level: ${m.level}. The personality is an original Astralis Nova mode inspired by general sci-fi archetypes, not an imitation of a named character.`};
  const announce=text=>{
    const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
    const m=current();if(msg)msg.textContent=text;if(status)status.textContent=`${m.icon} ${m.name}${m.auto?' • AUTO':''}`;if(face)face.textContent=m.icon;if(mini)mini.textContent=m.icon;
    if(localStorage.getItem('astralisNovaMuted')!=='true'&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(text);u.rate=m.rate;u.pitch=m.pitch;speechSynthesis.cancel();speechSynthesis.speak(u)}
  };
  const setMode=(id,{auto=false,quiet=false}={})=>{
    if(!modes[id])return false;state={mode:id,auto:Boolean(auto),changedAt:Date.now()};write(state);document.documentElement.dataset.novaPersonality=id;render();
    if(!quiet)announce(`${modes[id].name} engaged. ${id==='computer'?'Standing by.':id==='logic'?'I shall attempt to keep emotional variables within tolerances.':id==='wit'?'Excellent. I have been authorized to raise one eyebrow digitally.':id==='country'?"Well I'll be. Country Nova is saddled up and ready to get 'er done.":'Personality matrix synchronized.'}`);
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
    if(/country nova|country mode|old country|back porch|country slang|western mode/.test(t)){setMode('country');return true}
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
  window.AstralisNovaPersonality={current,context,setMode,setAuto,cycle,modes};
})();