(()=>{
  if(window.__astralisNovaRagV2)return;
  window.__astralisNovaRagV2=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const input=root.querySelector('#novaCommand'),msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
  let busy=false;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const chooseVoice=()=>{if(!('speechSynthesis'in window))return null;const voices=speechSynthesis.getVoices();return voices.find(v=>/^en-IE/i.test(v.lang))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null};
  const speak=text=>{if(get('astralisNovaMuted')==='true'||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.92;const v=chooseVoice();if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)};
  const say=(text,e='🧠')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);speak(text)};
  const history=()=>{try{return JSON.parse(get('astralisNovaConversationLog')||'[]')}catch{return[]}};
  const remember=(role,text)=>{const h=history();h.push({role,text:clean(text).slice(0,600),at:Date.now(),page:location.pathname});try{localStorage.setItem('astralisNovaConversationLog',JSON.stringify(h.slice(-16)))}catch{}};
  const pageContext=()=>{const parts=[`Page: ${document.title}`,`Path: ${location.pathname}`];document.querySelectorAll('h1,h2,h3,.song h4,.feature-copy h4,[aria-label]').forEach(el=>{if(el.closest('#novaGuide'))return;const t=clean(el.getAttribute('aria-label')||el.textContent);if(t)parts.push(t)});const main=document.querySelector('main')||document.body;const body=clean(main?.innerText||'').slice(0,4200);if(body)parts.push(body);return clean(parts.join(' | ')).slice(0,5000)};

  const renderSuggestions=items=>{
    root.querySelector('[data-nova-followups]')?.remove();
    if(!Array.isArray(items)||!items.length)return;
    const wrap=document.createElement('div');wrap.dataset.novaFollowups='true';wrap.className='nova-actions';wrap.style.marginTop='10px';
    items.slice(0,4).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.innerHTML=`✨ ${clean(item.label)}<small>${clean(item.prompt)}</small>`;b.addEventListener('click',()=>ask(item.prompt));wrap.appendChild(b)});
    (root.querySelector('.nova-body')||root).appendChild(wrap);
  };

  const executeAction=action=>{
    if(!action||action.type!=='navigate'||!action.href)return;
    const href=String(action.href);
    if(href.startsWith('/#')&&location.pathname==='/'){const el=document.querySelector(href.slice(1));if(el){setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),650);return}}
    setTimeout(()=>{location.href=href},850);
  };

  const ask=async raw=>{
    const question=clean(raw);if(!question||busy)return false;busy=true;remember('visitor',question);if(input)input.value='';if(msg)msg.textContent='Thinking with the Deep Archive…';if(status)status.textContent='Vector memory active • plotting response';emote('🔎');
    try{
      const response=await fetch('/api/nova',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,pageContext:pageContext(),history:history().slice(-8)})});
      const data=await response.json();if(!response.ok)throw new Error(data?.error||`HTTP ${response.status}`);
      const answer=clean(data?.answer)||'The archive answered with a suspicious amount of silence.';remember('nova',answer);say(answer,'🌌');root.dataset.novaRagMode=data?.mode||'rag';
      if(status)status.textContent=`${String(data?.mode||'RAG').toUpperCase()} • ${data?.action?'course plotted':'answer ready'}`;
      renderSuggestions(data?.suggestions);executeAction(data?.action);
    }catch(error){console.error('Nova RAG request failed',error);say('My deep archive link is temporarily offline, but local navigation is still available.','🛰️')}
    finally{busy=false}
    return true;
  };

  document.addEventListener('click',event=>{const send=event.target.closest?.('#novaSend');if(!send||busy)return;const q=clean(input?.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);
  document.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.target!==input||busy)return;const q=clean(input.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);

  fetch('/api/nova').then(r=>r.ok?r.json():null).then(data=>{if(!data)return;root.dataset.novaKnowledgeVersion=data.version||'';root.dataset.novaRagReady='true';const actions=root.querySelector('.nova-actions');if(actions&&!root.querySelector('[data-nova-rag-info]')){const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaRagInfo='true';b.innerHTML=`🧠 Deep Archive<small>${data.entries||0} memories • AI + Vector actions ready</small>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();say(`Deep Archive online with ${data.entries||0} curated memories. D1, Vectorize, Workers AI, and site actions are ${data.capabilities?.actions?'online':'partially online'}.`,'🧠')});actions.appendChild(b)}}).catch(()=>{});
  window.AstralisNovaAsk=ask;
})();
