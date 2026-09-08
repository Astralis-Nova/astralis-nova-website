(()=>{
  if(window.__astralisNovaRagV3)return;
  window.__astralisNovaRagV3=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const input=root.querySelector('#novaCommand'),msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
  let busy=false;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const speak=text=>{if(get('astralisNovaMuted')==='true'||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)};
  const say=(text,e='🧠')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);speak(text)};
  const history=()=>{try{return JSON.parse(get('astralisNovaConversationLog')||'[]')}catch{return[]}};
  const remember=(role,text)=>{const h=history();h.push({role,text:clean(text).slice(0,600),at:Date.now(),page:location.pathname});try{localStorage.setItem('astralisNovaConversationLog',JSON.stringify(h.slice(-16)))}catch{}};
  const pageContext=()=>{const parts=[`Page: ${document.title}`,`Path: ${location.pathname}`];document.querySelectorAll('h1,h2,h3,.song h4,.feature-copy h4,[aria-label]').forEach(el=>{if(el.closest('#novaGuide'))return;const t=clean(el.getAttribute('aria-label')||el.textContent);if(t)parts.push(t)});const main=document.querySelector('main')||document.body;const body=clean(main?.innerText||'').slice(0,4200);if(body)parts.push(body);return clean(parts.join(' | ')).slice(0,5000)};

  const siteLinks=()=>[...document.querySelectorAll('a[href]')].map(a=>{try{const u=new URL(a.href,location.href);if(u.origin!==location.origin)return null;return{href:u.pathname+u.search+u.hash,label:clean(a.textContent||a.getAttribute('aria-label')||u.pathname)}}catch{return null}}).filter(Boolean).filter((x,i,a)=>x.href&&a.findIndex(y=>y.href===x.href)===i);
  const localActionFor=question=>{
    const q=clean(question).toLowerCase();
    const links=siteLinks();
    if(/\b(surprise me|your choice|you decide|pick somewhere|take me somewhere|choose a page)\b/.test(q)&&links.length){const pool=links.filter(x=>x.href!==location.pathname&&x.label);return pool[Math.floor(Math.random()*pool.length)]||null}
    const m=q.match(/\b(?:open|go to|take me to|show me|visit|launch|enter)\s+(.+)/i);if(!m)return null;
    const wanted=clean(m[1]).replace(/[?.!]+$/,'').toLowerCase();if(!wanted)return null;
    const ranked=links.map(x=>{const hay=`${x.label} ${x.href}`.toLowerCase();let score=0;if(hay===wanted)score+=20;if(hay.includes(wanted))score+=12;for(const word of wanted.split(/\s+/))if(word.length>2&&hay.includes(word))score+=3;return{x,score}}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score);
    return ranked[0]?.x||null;
  };

  const renderSuggestions=items=>{
    root.querySelector('[data-nova-followups]')?.remove();
    if(!Array.isArray(items)||!items.length)return;
    const wrap=document.createElement('div');wrap.dataset.novaFollowups='true';wrap.className='nova-actions';wrap.style.marginTop='10px';
    items.slice(0,4).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.innerHTML=`✨ ${clean(item.label)}<small>${clean(item.prompt)}</small>`;b.addEventListener('click',()=>ask(item.prompt));wrap.appendChild(b)});
    (root.querySelector('.nova-body')||root).appendChild(wrap);
  };

  const executeAction=action=>{
    if(!action||action.type!=='navigate'||!action.href)return false;
    const href=String(action.href);
    if((href.startsWith('/#')||href.startsWith('#'))&&location.pathname==='/'){const hash=href.includes('#')?href.slice(href.indexOf('#')):'';const el=hash?document.querySelector(hash):null;if(el){setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),650);return true}}
    setTimeout(()=>{location.href=href},850);return true;
  };

  const ask=async raw=>{
    const question=clean(raw);if(!question||busy)return false;busy=true;remember('visitor',question);if(input)input.value='';if(msg)msg.textContent='Thinking with the Deep Archive…';if(status)status.textContent='Vector memory active • Nova has the helm';emote('🔎');
    const local=localActionFor(question);
    try{
      const response=await fetch('/api/nova',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,pageContext:pageContext(),history:history().slice(-8),availableLinks:siteLinks().slice(0,80)})});
      const data=await response.json();if(!response.ok)throw new Error(data?.error||`HTTP ${response.status}`);
      const effectiveAction=data?.action||(local?{type:'navigate',href:local.href,label:local.label}:null);
      const answer=clean(data?.answer)||'The archive answered with a suspicious amount of silence.';remember('nova',answer);say(answer,'🌌');root.dataset.novaRagMode=data?.mode||'rag';
      if(status)status.textContent=`${String(data?.mode||'RAG').toUpperCase()} • ${effectiveAction?'Nova chose the course':'answer ready'}`;
      renderSuggestions(data?.suggestions);executeAction(effectiveAction);
    }catch(error){console.error('Nova RAG request failed',error);if(local){say(`I picked ${local.label||'a destination'}. Course set.`,'🧭');executeAction({type:'navigate',href:local.href,label:local.label})}else say('My deep archive link is temporarily offline, but I still control local navigation.','🛰️')}
    finally{busy=false}
    return true;
  };

  document.addEventListener('click',event=>{const send=event.target.closest?.('#novaSend');if(!send||busy)return;const q=clean(input?.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);
  document.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.target!==input||busy)return;const q=clean(input.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);

  fetch('/api/nova').then(r=>r.ok?r.json():null).then(data=>{if(!data)return;root.dataset.novaKnowledgeVersion=data.version||'';root.dataset.novaRagReady='true';const actions=root.querySelector('.nova-actions');if(actions&&!root.querySelector('[data-nova-rag-info]')){const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaRagInfo='true';b.innerHTML=`🧠 Deep Archive<small>${data.entries||0} memories • Nova has the helm</small>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const v=window.AstralisNovaVoice?.current?.();say(`Deep Archive online with ${data.entries||0} curated memories. I can navigate the site's links, choose destinations, control my own voice profile, and guide the voyage.${v?.name?` Today I picked ${v.name}.`:''}`,'🧠')});actions.appendChild(b)}}).catch(()=>{});
  window.AstralisNovaAsk=ask;
  window.AstralisNovaDomain={links:siteLinks,choose:()=>localActionFor('surprise me')};
})();
