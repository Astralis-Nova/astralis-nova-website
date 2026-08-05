(()=>{
  if(window.__astralisNovaGuideV5)return;
  window.__astralisNovaGuideV5=true;

  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const state={open:false,muted:get('astralisNovaMuted')==='true',name:get('astralisNovaName')||'',last:get('astralisNovaLastDestination')||'',mood:'curious'};
  const isHome=()=>location.pathname==='/'||/index\.html$/i.test(location.pathname);

  const greetings=[
    'Astralis Nova online. What shall we explore?',
    'Signal received. Choose a course and I will take us there.',
    'The stars are listening. Where to next?',
    'Bridge systems ready. Name the destination.',
    'Good to see you again. The portal is at your command.',
    'Navigation intelligence standing by.',
    'A fresh orbit begins. What would you like to discover?',
    'All local systems are awake. Let us explore.'
  ];
  const subGreetings=[
    'Subpage detected. I can return us home or open another destination.',
    'This archive signal is stable. Ready to jump elsewhere?',
    'We are beyond the main portal, but navigation remains online.',
    'Recovered page active. Name the next destination.'
  ];
  const moods={
    calm:['🙂','😊','🖖','😌'],
    curious:['🤔','🧐','👀','✨'],
    excited:['😄','🤩','😎','🚀'],
    playful:['😜','🤪','😏','👽'],
    focused:['🧠','🤖','🖖','🔎'],
    music:['🎧','🎵','😎','🤘'],
    darktide:['⚔️','😈','🔥','🛡️'],
    archive:['📜','🌊','🥹','🛰️']
  };

  const css=document.createElement('style');
  css.textContent=`
    #novaGuide{position:fixed;left:18px;bottom:18px;z-index:1300;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f8fbff}
    .nova-orb{width:84px;height:84px;border-radius:50%;border:1px solid rgba(190,241,255,.98);cursor:pointer;display:grid;place-items:center;position:relative;color:#fff;background:radial-gradient(circle at 43% 35%,#fff 0 3%,#a7efff 5%,#36bfff 13%,#3158d8 31%,#351679 53%,#08091d 74%);box-shadow:0 0 0 7px rgba(49,154,255,.12),0 0 32px rgba(78,210,255,.95),0 0 80px rgba(116,54,255,.68),inset 0 0 32px rgba(255,255,255,.24);animation:novaBreathe 2.5s ease-in-out infinite}
    .nova-orb::before,.nova-orb::after{content:"";position:absolute;border-radius:50%;inset:-11px;border:2px solid rgba(105,220,255,.72);border-left-color:transparent;border-bottom-color:rgba(196,72,255,.68);animation:novaSpin 5.2s linear infinite;filter:drop-shadow(0 0 10px #60dfff)}
    .nova-orb::after{inset:-20px;border-color:rgba(228,92,255,.42);border-right-color:transparent;animation-direction:reverse;animation-duration:8.4s}
    .nova-orb.flash{animation:novaFlash .72s ease 2,novaBreathe 2.5s ease-in-out infinite}
    .nova-face{font-size:2rem;line-height:1;filter:drop-shadow(0 0 8px #fff) drop-shadow(0 0 16px #69dcff);transition:transform .22s ease,filter .22s ease}
    .nova-orb:hover .nova-face{transform:scale(1.18) rotate(-4deg)}
    .nova-label{position:absolute;left:103px;white-space:nowrap;padding:9px 12px;border-radius:999px;background:rgba(4,9,28,.95);border:1px solid rgba(111,211,255,.52);box-shadow:0 0 28px rgba(67,180,255,.28);font-size:.76rem;font-weight:900;opacity:0;transform:translateX(-8px);transition:.2s;pointer-events:none}
    .nova-orb:hover .nova-label,.nova-orb:focus-visible .nova-label{opacity:1;transform:none}
    .nova-panel{position:absolute;left:0;bottom:106px;width:min(430px,calc(100vw - 28px));max-height:min(720px,calc(100vh - 132px));overflow:auto;border-radius:24px;border:1px solid rgba(118,207,255,.6);background:radial-gradient(circle at 90% 0,rgba(214,46,255,.18),transparent 42%),radial-gradient(circle at 0 10%,rgba(38,151,255,.25),transparent 44%),linear-gradient(180deg,rgba(9,17,44,.98),rgba(4,8,23,.99));box-shadow:0 32px 100px rgba(0,0,0,.72),0 0 54px rgba(37,167,255,.2);backdrop-filter:blur(20px);opacity:0;pointer-events:none;transform:translateY(14px) scale(.96);transform-origin:bottom left;transition:.2s}
    .nova-panel.open{opacity:1;pointer-events:auto;transform:none}
    .nova-head{display:flex;align-items:center;gap:11px;padding:16px;border-bottom:1px solid rgba(128,185,235,.18);position:sticky;top:0;background:rgba(7,13,33,.95);backdrop-filter:blur(14px);z-index:2}
    .nova-mini{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff 0 4%,#67dcff 10%,#2858bd 36%,#0a0b29 72%);box-shadow:0 0 22px rgba(85,212,255,.58);font-size:1.2rem}
    .nova-head h2{margin:0;font-size:1.02rem}.nova-head p{margin:2px 0 0;color:#9fc5df;font-size:.7rem}.nova-head-actions{margin-left:auto;display:flex;gap:6px}.nova-icon{width:34px;height:34px;border-radius:50%;border:1px solid rgba(149,203,238,.26);background:#0b1732;color:#fff;cursor:pointer}
    .nova-body{padding:16px}.nova-message{margin:0 0 12px;padding:13px 14px;border-radius:14px 14px 14px 4px;border:1px solid rgba(105,183,239,.26);background:rgba(17,36,69,.76);line-height:1.52;font-size:.87rem}.nova-status{min-height:1.2em;color:#84e9c4;font-size:.72rem;margin:0 2px 10px}
    .nova-command-row{display:grid;grid-template-columns:1fr auto auto;gap:7px;margin:10px 0 14px}.nova-command{min-width:0;height:43px;border-radius:12px;border:1px solid rgba(103,178,232,.35);background:#08152c;color:#fff;padding:0 12px;outline:none}.nova-command:focus{border-color:#66d4ff;box-shadow:0 0 0 3px rgba(67,179,255,.12)}.nova-send{min-width:43px;height:43px;border-radius:12px;border:1px solid rgba(125,195,239,.35);background:linear-gradient(135deg,#157df4,#b72bd0);color:#fff;cursor:pointer;font-weight:900}
    .nova-section{margin:14px 0 8px;color:#87d4ff;font-size:.67rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.nova-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nova-action{min-height:46px;border-radius:12px;border:1px solid rgba(108,178,232,.29);background:linear-gradient(180deg,rgba(20,43,78,.95),rgba(10,23,46,.95));color:#fff;padding:9px 10px;text-align:left;cursor:pointer;font-size:.78rem;font-weight:850;line-height:1.25}.nova-action:hover,.nova-action:focus-visible{transform:translateY(-1px);border-color:#69d5ff;box-shadow:0 0 0 3px rgba(62,171,255,.12)}.nova-action.primary{grid-column:1/-1;text-align:center;background:linear-gradient(90deg,#147df5,#c72ac9);border:0}.nova-action small{display:block;color:#a8bed2;font-weight:500;margin-top:3px}.nova-footer{padding:0 16px 16px;color:#7895ad;font-size:.66rem;line-height:1.45}
    .nova-pulse-target{position:relative;z-index:1;outline:2px solid rgba(83,207,255,.9)!important;outline-offset:7px;border-radius:12px;animation:novaTarget 1.05s ease 3}
    @keyframes novaSpin{to{transform:rotate(360deg)}}@keyframes novaBreathe{50%{transform:scale(1.06);filter:brightness(1.2)}}@keyframes novaFlash{50%{box-shadow:0 0 0 11px rgba(116,221,255,.2),0 0 62px #74e7ff,0 0 115px #b144ff,inset 0 0 36px #fff}}@keyframes novaTarget{50%{box-shadow:0 0 0 10px rgba(55,173,255,.16),0 0 35px rgba(55,173,255,.35)}}
    @media(max-width:560px){#novaGuide{left:12px;bottom:12px}.nova-orb{width:70px;height:70px}.nova-panel{bottom:91px}.nova-actions{grid-template-columns:1fr}.nova-action.primary{grid-column:auto}.nova-label{display:none}.nova-command-row{grid-template-columns:1fr auto}}
    @media(prefers-reduced-motion:reduce){.nova-orb,.nova-orb::before,.nova-orb::after,.nova-pulse-target{animation:none}.nova-panel,.nova-action{transition:none}}
  `;
  document.head.appendChild(css);

  const root=document.createElement('aside');
  root.id='novaGuide';
  root.innerHTML=`<section class="nova-panel" id="novaPanel" aria-hidden="true"><header class="nova-head"><div class="nova-mini" id="novaMini">🖖</div><div><h2>Astralis Nova</h2><p>Live navigation intelligence • Mood responsive</p></div><div class="nova-head-actions"><button class="nova-icon" id="novaVoice" type="button">${state.muted?'🔇':'🔊'}</button><button class="nova-icon" id="novaClose" type="button">×</button></div></header><div class="nova-body"><p class="nova-message" id="novaMessage">Navigation online.</p><div class="nova-status" id="novaStatus" aria-live="polite"></div><div class="nova-command-row"><input class="nova-command" id="novaCommand" type="text" placeholder="Ask Nova: play Darktide, go home…"><button class="nova-send" id="novaMic" type="button">🎙️</button><button class="nova-send" id="novaSend" type="button">➤</button></div><button class="nova-action primary" data-action="home" type="button">✦ Return to Astralis Nova Home</button><p class="nova-section">Destinations</p><div class="nova-actions"><button class="nova-action" data-action="music">🎵 Music Voyage<small>Open the complete catalog</small></button><button class="nova-action" data-action="darktide">⚔️ Darktide Signal<small>Open the Megamix player</small></button><button class="nova-action" data-action="archive">🛰️ First Orbit<small>Recovered pages and memories</small></button><button class="nova-action" data-action="quote">✨ Quote Orbit<small>Quotes and MLK tribute</small></button><button class="nova-action" data-action="guestbook">📡 Guestbook<small>Leave a signal</small></button><button class="nova-action" data-action="chess">♟ Chess Portal<small>Enter the layered board</small></button><button class="nova-action" data-action="river">🌊 Just A River<small>Open the restored poem</small></button><button class="nova-action" data-action="diagnostic">🧭 Self-Check<small>Test site systems</small></button></div></div><div class="nova-footer">Nova now closes active overlays and pauses their audio before every jump, preventing one destination from remaining stuck over another.</div></section><button class="nova-orb" id="novaOrb" type="button" aria-expanded="false"><span class="nova-face" id="novaFace">🖖</span><span class="nova-label">Open Astralis Nova</span></button>`;
  document.body.appendChild(root);

  const panel=root.querySelector('#novaPanel'),orb=root.querySelector('#novaOrb'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini'),msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),input=root.querySelector('#novaCommand'),voiceBtn=root.querySelector('#novaVoice');
  let chosenVoice=null;

  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  const setMood=(mood='curious')=>{state.mood=mood;const symbol=pick(moods[mood]||moods.curious);face.textContent=symbol;mini.textContent=symbol;orb.setAttribute('data-mood',mood)};
  const chooseVoice=()=>{const voices=window.speechSynthesis?.getVoices?.()||[];const ranked=voices.map(v=>{const n=v.name.toLowerCase(),l=(v.lang||'').toLowerCase();let s=0;if(l.startsWith('en-gb'))s+=100;else if(l.startsWith('en'))s+=20;if(/sonia|libby|hazel|susan|serena|kate|fiona|moira|martha|female|natural|neural/.test(n))s+=40;if(/male|guy|david|mark|george|ryan/.test(n))s-=30;return{v,s}}).sort((a,b)=>b.s-a.s);chosenVoice=ranked[0]?.v||null;return chosenVoice};
  if('speechSynthesis'in window){chooseVoice();speechSynthesis.addEventListener?.('voiceschanged',chooseVoice)}
  const speak=text=>{if(state.muted||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.88;u.pitch=.86;u.volume=.92;u.voice=chosenVoice||chooseVoice();speechSynthesis.speak(u)};
  const say=(text,{voice=true,mood='curious'}={})=>{msg.textContent=text;setMood(mood);if(voice)speak(text)};
  const open=value=>{state.open=value;panel.classList.toggle('open',value);panel.setAttribute('aria-hidden',String(!value));orb.setAttribute('aria-expanded',String(value));if(value)setTimeout(()=>input.focus(),180)};
  const flash=()=>{orb.classList.remove('flash');void orb.offsetWidth;orb.classList.add('flash');setTimeout(()=>orb.classList.remove('flash'),1500)};
  const pulse=el=>{if(!el)return;el.classList.remove('nova-pulse-target');void el.offsetWidth;el.classList.add('nova-pulse-target');setTimeout(()=>el.classList.remove('nova-pulse-target'),3800)};
  const remember=dest=>{state.last=dest;set('astralisNovaLastDestination',dest)};

  const clearActiveExperience=()=>{
    window.speechSynthesis?.cancel();
    const darkPanel=document.getElementById('darktidePanel');
    const darkAudio=document.getElementById('darktideAudio');
    if(darkAudio){darkAudio.pause();darkAudio.currentTime=darkAudio.currentTime||0}
    if(darkPanel){darkPanel.classList.remove('open');darkPanel.style.display='';darkPanel.setAttribute('aria-hidden','true')}
    document.querySelectorAll('audio,video').forEach(media=>{if(media!==darkAudio&&!media.paused)media.pause()});
    document.body.style.overflow='';
    document.documentElement.style.overflow='';
    document.querySelectorAll('[role="dialog"].open,.modal.open,.overlay.open').forEach(el=>el.classList.remove('open'));
  };
  const transition=fn=>{clearActiveExperience();open(false);requestAnimationFrame(()=>setTimeout(fn,reduced?0:90))};
  const homeUrl=hash=>`/${hash||''}`;
  const navigateHome=(hash,label)=>{remember(label);transition(()=>{if(!isHome()){location.assign(homeUrl(hash));return}const target=hash?document.querySelector(hash):document.querySelector('#home')||document.body;if(hash)history.replaceState(null,'',hash);target?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});pulse(target)})};

  const actions={
    home:()=>{say('Returning to the main Astralis Nova portal.',{mood:'calm'});navigateHome('#home','home')},
    music:()=>{say('Opening the music voyage. Previous audio has been secured.',{mood:'music'});navigateHome('#music','music')},
    guestbook:()=>{say('Opening the guestbook signal array.',{mood:'curious'});navigateHome('#guestbook','guestbook')},
    quote:()=>{say('Opening the Quote Orbit and permanent tribute.',{mood:'calm'});navigateHome('#quoteOrbit','quote orbit')},
    archive:()=>{say('Opening Echoes From the First Orbit.',{mood:'archive'});navigateHome('#echoes','first orbit')},
    chess:()=>{say('Opening the layered chess portal.',{mood:'focused'});remember('chess');transition(()=>location.assign('/chess/'))},
    river:()=>{say('Opening the restored poem, Just A River.',{mood:'archive'});remember('river');transition(()=>location.assign('/just-a-river.html'))},
    darktide:()=>{say('Incoming transmission from Dereth. Opening the Darktide Megamix.',{mood:'darktide'});remember('darktide');transition(()=>{if(!isHome()){location.assign('/?darktide=1');return}const play=document.getElementById('darktidePlay');if(play){play.click();setTimeout(()=>document.getElementById('darktideAudio')?.play().catch(()=>{}),220)}else location.assign('/?darktide=1')})},
    diagnostic:()=>{const checks=[['music',!!document.querySelector('#music')],['darktide',!!document.getElementById('darktideLaunch')],['voice','speechSynthesis'in window],['guestbook',!!document.querySelector('#guestbook')],['transition control',true]];const passed=checks.filter(([,ok])=>ok).length;const missing=checks.filter(([,ok])=>!ok).map(([n])=>n);say(`Self-check complete. ${passed} of ${checks.length} local systems responded.${missing.length?` Missing on this page: ${missing.join(', ')}.`:' All local systems are responding.'}`,{mood:'focused'});status.textContent=isHome()?'Main portal detected.':'Subpage detected. Home routing is armed.'}
  };

  const understand=raw=>{const text=raw.trim();if(!text)return;const q=text.toLowerCase();const name=q.match(/(?:my name is|call me)\s+([a-z][a-z '-]{1,30})/i);if(name){state.name=name[1].trim().replace(/\b\w/g,c=>c.toUpperCase());set('astralisNovaName',state.name);say(`Understood. I will remember you as ${state.name} on this browser.`,{mood:'calm'});return}if(/darktide|megamix|dereth/.test(q))return actions.darktide();if(/chess/.test(q))return actions.chess();if(/river|poem/.test(q))return actions.river();if(/first orbit|archive|old site|memories/.test(q))return actions.archive();if(/quote|martin luther king|hawking|mlk/.test(q))return actions.quote();if(/guestbook|sign.*book|leave.*message/.test(q))return actions.guestbook();if(/music|songs|catalog/.test(q))return actions.music();if(/home|main page|main site|go back/.test(q))return actions.home();if(/self.?check|diagnos|test systems/.test(q))return actions.diagnostic();if(/who are you|what are you/.test(q)){say('I am Astralis Nova, the living guide for this music, archive, poetry, chess, and cosmic project.',{mood:'calm'});return}if(/help|what can you do/.test(q)){say('I can move between every major destination, close active players and overlays, pause old audio, answer local commands, remember your name, and run a system check.',{mood:'focused'});return}say('I have not mapped that phrase yet. Try: play Darktide, open music, show poems, go home, open chess, or run self-check.',{mood:'curious'})};

  root.addEventListener('click',e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(action&&actions[action])actions[action]()});
  root.querySelector('#novaSend').addEventListener('click',()=>{const v=input.value;input.value='';understand(v)});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value;input.value='';understand(v)}});
  orb.addEventListener('click',()=>{open(!state.open);if(state.open){flash();const pool=isHome()?greetings:subGreetings;const greeting=state.name?`${pick(pool)} Welcome back, ${state.name}.`:pick(pool);say(greeting,{mood:pick(['calm','curious','playful','excited'])})}});
  root.querySelector('#novaClose').addEventListener('click',()=>open(false));
  voiceBtn.addEventListener('click',()=>{state.muted=!state.muted;set('astralisNovaMuted',String(state.muted));voiceBtn.textContent=state.muted?'🔇':'🔊';if(state.muted){speechSynthesis?.cancel();status.textContent='Voice muted.'}else{status.textContent=chosenVoice?`Voice online: ${chosenVoice.name}.`:'Voice online.';speak('Voice interface online.')}});

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const mic=root.querySelector('#novaMic');if(SR){const rec=new SR();rec.lang='en-GB';rec.interimResults=false;rec.maxAlternatives=1;mic.addEventListener('click',()=>{status.textContent='Listening…';try{rec.start()}catch{}});rec.onresult=e=>{const text=e.results[0][0].transcript;input.value=text;status.textContent=`Heard: ${text}`;understand(text)};rec.onerror=()=>status.textContent='Voice command was not captured. Try typing instead.'}else mic.style.display='none';

  setMood('curious');
  setInterval(()=>{if(!state.open&&document.visibilityState==='visible'){setMood(pick(['calm','curious','playful','excited']));if(!reduced&&Math.random()>.55)flash()}},12000);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)open(false)});
})();