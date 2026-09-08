(()=>{
  if(window.__astralisNovaRagV1)return;
  window.__astralisNovaRagV1=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const input=root.querySelector('#novaCommand'),msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
  let busy=false;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=k=>v=>{try{localStorage.setItem(k,v)}catch{}};
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const chooseVoice=()=>{if(!('speechSynthesis'in window))return null;const voices=speechSynthesis.getVoices();return voices.find(v=>/^en-IE/i.test(v.lang))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null};
  const speak=text=>{if(get('astralisNovaMuted')==='true'||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.92;const v=chooseVoice();if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)};
  const say=(text,e='🧠')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);speak(text)};
  const history=()=>{try{return JSON.parse(get('astralisNovaConversationLog')||'[]')}catch{return[]}};
  const remember=(role,text)=>{const h=history();h.push({role,text:clean(text).slice(0,600),at:Date.now(),page:location.pathname});try{localStorage.setItem('astralisNovaConversationLog',JSON.stringify(h.slice(-16)))}catch{}};
  const pageContext=()=>{
    const parts=[`Page: ${document.title}`,`Path: ${location.pathname}`];
    document.querySelectorAll('h1,h2,h3,.song h4,.feature-copy h4,[aria-label]').forEach(el=>{if(el.closest('#novaGuide'))return;const t=clean(el.getAttribute('aria-label')||el.textContent);if(t)parts.push(t)});
    const main=document.querySelector('main')||document.body;const body=clean(main?.innerText||'').slice(0,4200);if(body)parts.push(body);
    return clean(parts.join(' | ')).slice(0,5000);
  };
  const ask=async raw=>{
    const question=clean(raw);if(!question||busy)return false;busy=true;remember('visitor',question);if(input)input.value='';if(msg)msg.textContent='Searching the Astralis Nova archive…';if(status)status.textContent='RAG link active • retrieving context';emote('🔎');
    try{
      const response=await fetch('/api/nova',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,pageContext:pageContext(),history:history().slice(-8)})});
      const data=await response.json();if(!response.ok)throw new Error(data?.error||`HTTP ${response.status}`);
      const answer=clean(data?.answer)||'I found the archive, but the answer came back strangely quiet.';remember('nova',answer);say(answer,'🌌');
      root.dataset.novaRagMode=data?.mode||'rag';
      if(status)status.textContent=`${answer} • ${String(data?.mode||'RAG').toUpperCase()}`;
    }catch(error){console.error('Nova RAG request failed',error);say('My deep archive link is temporarily offline, but my local navigation and conversation systems still work.','🛰️')}
    finally{busy=false}
    return true;
  };
  document.addEventListener('click',event=>{const send=event.target.closest?.('#novaSend');if(!send||busy)return;const q=clean(input?.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);
  document.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.target!==input||busy)return;const q=clean(input.value);if(!q)return;setTimeout(()=>{if(clean(input?.value)===q||clean(input?.value)==='')ask(q)},0)},true);

  fetch('/api/nova').then(r=>r.ok?r.json():null).then(data=>{if(!data)return;root.dataset.novaKnowledgeVersion=data.version||'';root.dataset.novaRagReady='true';const actions=root.querySelector('.nova-actions');if(actions&&!root.querySelector('[data-nova-rag-info]')){const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaRagInfo='true';b.innerHTML=`🧠 Deep Archive<small>${data.entries||0} core memories • ${data.capabilities?.workersAI?'AI':'retrieval'} ready</small>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();say(`Deep Archive online with ${data.entries||0} curated core memories. D1 ${data.capabilities?.d1?'connected':'fallback mode'}, Vectorize ${data.capabilities?.vectorize?'connected':'awaiting binding'}, and Workers AI ${data.capabilities?.workersAI?'connected':'awaiting binding'}.`,'🧠')});actions.appendChild(b)}}).catch(()=>{});
})();
