(()=>{
  if(window.__astralisNovaCapabilitiesV1)return;
  window.__astralisNovaCapabilitiesV1=true;

  const root=document.getElementById('novaGuide');
  if(!root)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const input=root.querySelector('#novaCommand');
  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const face=root.querySelector('#novaFace');
  const mini=root.querySelector('#novaMini');
  const setFace=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const say=text=>{if(msg)msg.textContent=text;if(status)status.textContent=text;setFace('🧠');if(localStorage.getItem('astralisNovaMuted')!=='true'&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)}};

  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  let recognition=null;
  let listening=false;

  const startListening=()=>{
    if(!SpeechRecognition){say('Voice input is not available in this browser yet. You can still type to me.');return}
    if(listening){try{recognition?.stop()}catch{};return}
    recognition=new SpeechRecognition();
    recognition.lang='en-GB';
    recognition.interimResults=true;
    recognition.continuous=false;
    recognition.maxAlternatives=1;
    recognition.onstart=()=>{listening=true;setFace('🎙️');if(status)status.textContent='Listening…'};
    recognition.onresult=event=>{
      let transcript='';
      for(let i=event.resultIndex;i<event.results.length;i++)transcript+=event.results[i][0]?.transcript||'';
      transcript=clean(transcript);
      if(input)input.value=transcript;
      if(status)status.textContent=transcript?`I heard: ${transcript}`:'Listening…';
      if(event.results[event.results.length-1]?.isFinal&&transcript){setTimeout(()=>window.AstralisNovaAsk?.(transcript),120)}
    };
    recognition.onerror=event=>{listening=false;setFace('🛰️');if(status)status.textContent=`Voice input: ${event.error||'unavailable'}`};
    recognition.onend=()=>{listening=false;if(status&&!/I heard:/i.test(status.textContent))status.textContent='Voice input ready'};
    try{recognition.start()}catch{}
  };

  const currentPageSummary=()=>{
    const headings=[...document.querySelectorAll('h1,h2,h3')].map(x=>clean(x.textContent)).filter(Boolean).slice(0,12);
    const links=[...document.querySelectorAll('a[href]')].filter(a=>{try{return new URL(a.href,location.href).origin===location.origin}catch{return false}}).length;
    const media=document.querySelectorAll('audio,video').length;
    return {title:document.title,path:location.pathname,headings,links,media};
  };

  const diagnostics=async()=>{
    const page=currentPageSummary();
    let nova={};
    try{const r=await fetch('/api/nova',{headers:{Accept:'application/json'},cache:'no-store'});nova=await r.json()}catch{}
    const voice=window.AstralisNovaVoice?.current?.();
    const memory=window.AstralisNovaAutonomy?.profile?.();
    const parts=[
      `Page: ${page.title}.`,
      `${page.links} internal links detected.`,
      `${page.media} media elements.`,
      `Archive: ${nova.entries??'unknown'} entries.`,
      `D1 ${nova.capabilities?.d1?'online':'unknown'}, Vectorize ${nova.capabilities?.vectorize?'online':'unknown'}, Workers AI ${nova.capabilities?.workersAI?'online':'unknown'}.`,
      voice?.name?`Voice: ${voice.name}.`:'',
      memory?`Local visitor memory: ${memory.visits||0} page visits.`:''
    ].filter(Boolean).join(' ');
    say(parts);
  };

  const unknownKey='astralisNovaUnknownQuestionsV1';
  const readUnknown=()=>{try{return JSON.parse(localStorage.getItem(unknownKey)||'[]')}catch{return[]}};
  const noteUnknown=q=>{const list=readUnknown();list.push({q:clean(q).slice(0,240),page:location.pathname,at:Date.now()});try{localStorage.setItem(unknownKey,JSON.stringify(list.slice(-50)))}catch{}};
  const oldAsk=window.AstralisNovaAsk;
  if(oldAsk&&!window.__astralisNovaAskWrappedV1){
    window.__astralisNovaAskWrappedV1=true;
    window.AstralisNovaAsk=async q=>{
      const before=clean(msg?.textContent);
      const out=await oldAsk(q);
      setTimeout(()=>{
        const after=clean(msg?.textContent);
        if(/do not have that detail|don't know yet|do not know yet|archive.*not.*establish|temporarily offline/i.test(after)&&after!==before)noteUnknown(q);
      },700);
      return out;
    };
  }

  const addControls=()=>{
    const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-nova-capability]'))return;
    const make=(label,small,handler)=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaCapability='true';b.innerHTML=`${label}<small>${small}</small>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();handler()});actions.appendChild(b)};
    make('🎙️ Talk to Nova','Voice input',startListening);
    make('🧾 Explain This Page','Nova summarizes where you are',()=>window.AstralisNovaAsk?.('Explain this page to me and point out the most interesting thing here'));
    make('🩺 Systems Check','Archive, AI, links, voice, memory',diagnostics);
    make('❓ Curiosity Queue','Questions I could not answer',()=>{const list=readUnknown();say(list.length?`I have ${list.length} unanswered question${list.length===1?'':'s'} saved on this device. The latest was: ${list[list.length-1].q}`:'My curiosity queue is empty. Either I am doing well or nobody has asked me about quantum chickens yet.')});
  };
  addControls();

  window.AstralisNovaCapabilities={startListening,diagnostics,currentPageSummary,unknownQuestions:readUnknown};
})();
