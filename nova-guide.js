(()=>{
  if(window.__astralisNovaGuideLoaded)return;
  window.__astralisNovaGuideLoaded=true;

  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const get=(k,f='')=>{try{return localStorage.getItem(k)??f}catch{return f}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const memory=JSON.parse(get('astralisNovaMemory','{}')||'{}');
  const state={open:false,muted:get('astralisNovaMuted')==='true',listening:false};

  const css=document.createElement('style');
  css.textContent=`
  #novaGuide{position:fixed;left:20px;bottom:20px;z-index:1200;color:#f7fbff;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
  .nova-orb{width:82px;height:82px;border-radius:50%;border:1px solid rgba(166,235,255,.9);cursor:pointer;position:relative;display:grid;place-items:center;color:#fff;background:radial-gradient(circle at 43% 35%,#fff 0 3%,#9beaff 5%,#25b8ff 13%,#3752d4 31%,#17104f 52%,#030716 74%);box-shadow:0 0 14px #7ee7ff,0 0 35px #238cff,0 0 75px rgba(198,42,255,.72),inset 0 0 28px rgba(255,255,255,.22);animation:novaBreathe 2.1s ease-in-out infinite}
  .nova-orb::before,.nova-orb::after{content:"";position:absolute;border-radius:50%;inset:-12px;border:2px solid rgba(98,224,255,.55);box-shadow:0 0 18px rgba(79,208,255,.5);animation:novaSpin 5s linear infinite}
  .nova-orb::after{inset:-21px;border-color:rgba(236,70,255,.42);border-style:dashed;animation-duration:8s;animation-direction:reverse}
  .nova-core{font-size:1.8rem;text-shadow:0 0 7px #fff,0 0 18px #68dbff;animation:novaFlash 3.4s steps(1,end) infinite}
  .nova-label{position:absolute;left:98px;white-space:nowrap;padding:9px 13px;border-radius:999px;background:rgba(4,10,30,.94);border:1px solid rgba(103,210,255,.55);box-shadow:0 0 20px rgba(39,167,255,.3);font-size:.78rem;font-weight:850;opacity:0;transform:translateX(-8px);transition:.2s;pointer-events:none}
  .nova-orb:hover .nova-label,.nova-orb:focus-visible .nova-label{opacity:1;transform:none}
  .nova-panel{position:absolute;left:0;bottom:108px;width:min(440px,calc(100vw - 28px));max-height:min(720px,calc(100vh - 140px));overflow:auto;border-radius:24px;border:1px solid rgba(107,210,255,.56);background:radial-gradient(circle at 88% 0,rgba(223,49,245,.18),transparent 42%),radial-gradient(circle at 0 20%,rgba(19,141,255,.26),transparent 48%),linear-gradient(180deg,rgba(8,17,43,.98),rgba(3,7,22,.985));box-shadow:0 35px 100px rgba(0,0,0,.75),0 0 55px rgba(32,161,255,.22);backdrop-filter:blur(20px);opacity:0;pointer-events:none;transform:translateY(14px) scale(.95);transform-origin:bottom left;transition:.23s}
  .nova-panel.open{opacity:1;pointer-events:auto;transform:none}
  .nova-head{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid rgba(117,191,238,.2);position:sticky;top:0;z-index:2;background:rgba(5,13,35,.94);backdrop-filter:blur(15px)}
  .nova-avatar{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff 0 4%,#79e4ff 8%,#1b7cdb 33%,#110b3c 70%);box-shadow:0 0 22px #45cfff;font-size:1.2rem}
  .nova-head h2{margin:0;font-size:1.02rem;letter-spacing:.05em}.nova-head p{margin:3px 0 0;color:#93c4e4;font-size:.7rem}.nova-head-actions{margin-left:auto;display:flex;gap:6px}
  .nova-icon{width:35px;height:35px;border-radius:50%;border:1px solid rgba(145,205,242,.3);background:#0b1935;color:#fff;cursor:pointer}
  .nova-body{padding:16px}.nova-message{margin:0 0 12px;padding:14px;border-radius:15px 15px 15px 4px;border:1px solid rgba(111,194,246,.25);background:rgba(18,42,78,.72);line-height:1.55;font-size:.88rem;min-height:68px}
  .nova-status{min-height:1.2em;margin:0 2px 11px;color:#79edc3;font-size:.72rem}.nova-command{display:flex;gap:8px;margin-bottom:10px}.nova-command input{min-width:0;flex:1;height:45px;border-radius:13px;border:1px solid #28486d;background:#071429;color:#fff;padding:0 13px;outline:none}.nova-command input:focus{border-color:#53c9ff;box-shadow:0 0 0 3px rgba(62,174,255,.15)}
  .nova-send{width:45px;height:45px;border:0;border-radius:13px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#168df5,#d42bc8);font-size:1rem}.nova-chips{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 15px}.nova-chip{border:1px solid rgba(111,183,231,.3);background:#0c1c38;color:#dceeff;border-radius:999px;padding:7px 10px;cursor:pointer;font-size:.7rem}
  .nova-title{margin:13px 0 8px;color:#7fd5ff;font-size:.66rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.nova-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nova-action{min-height:45px;border-radius:12px;border:1px solid rgba(111,183,231,.28);background:linear-gradient(180deg,#142d52,#0a1832);color:#fff;padding:9px 10px;text-align:left;cursor:pointer;font-size:.77rem;font-weight:800}.nova-action:hover,.nova-action:focus-visible{border-color:#68d6ff;box-shadow:0 0 0 3px rgba(65,184,255,.12),0 0 20px rgba(69,179,255,.12);transform:translateY(-1px)}
  .nova-action small{display:block;color:#9bb9cf;margin-top:3px;font-weight:500}.nova-memory{margin-top:14px;padding:10px 12px;border-radius:12px;background:rgba(7,19,39,.72);border:1px solid rgba(103,170,217,.18);font-size:.69rem;color:#8aa8bd;line-height:1.45}.nova-listening{animation:novaListen .8s ease-in-out infinite alternate}.nova-pulse-target{outline:2px solid #66d9ff!important;outline-offset:7px;border-radius:12px;animation:novaTarget 1s ease 3}
  @keyframes novaSpin{to{transform:rotate(360deg)}}@keyframes novaBreathe{50%{transform:scale(1.08);filter:brightness(1.25);box-shadow:0 0 18px #fff,0 0 48px #29aaff,0 0 100px rgba(222,45,255,.88),inset 0 0 32px rgba(255,255,255,.32)}}@keyframes novaFlash{0%,91%,100%{opacity:1}92%{opacity:.15}94%{opacity:1}96%{opacity:.3}}@keyframes novaListen{to{box-shadow:0 0 30px #7dffdd}}@keyframes novaTarget{50%{box-shadow:0 0 0 10px rgba(70,190,255,.14),0 0 35px rgba(70,190,255,.28)}}
  @media(max-width:560px){#novaGuide{left:12px;bottom:12px}.nova-orb{width:68px;height:68px}.nova-panel{bottom:91px}.nova-actions{grid-template-columns:1fr}.nova-label{display:none}}
  @media(prefers-reduced-motion:reduce){.nova-orb,.nova-orb::before,.nova-orb::after,.nova-core,.nova-pulse-target{animation:none}.nova-panel,.nova-action{transition:none}}
  `;
  document.head.appendChild(css);

  const root=document.createElement('aside');
  root.id='novaGuide';root.setAttribute('aria-label','Astralis Nova interactive guide');
  root.innerHTML=`<section class="nova-panel" id="novaPanel" aria-hidden="true"><header class="nova-head"><div class="nova-avatar">✦</div><div><h2>ASTRALIS NOVA</h2><p>Interactive site intelligence • Voice • Local memory</p></div><div class="nova-head-actions"><button class="nova-icon" id="novaMic" title="Speak to Nova">🎙️</button><button class="nova-icon" id="novaVoice" title="Toggle voice">${state.muted?'🔇':'🔊'}</button><button class="nova-icon" id="novaClose" title="Close">×</button></div></header><div class="nova-body"><div class="nova-message" id="novaMessage">Welcome aboard. I am Astralis Nova, guide to the music, memories, transmissions, and hidden constellations of this world.</div><div class="nova-status" id="novaStatus" aria-live="polite"></div><form class="nova-command" id="novaForm"><input id="novaInput" autocomplete="off" placeholder="Ask Nova: play Darktide, show poems, run self-check…" aria-label="Ask Astralis Nova"><button class="nova-send" aria-label="Send">➤</button></form><div class="nova-chips"><button class="nova-chip" data-query="play darktide">Play Darktide</button><button class="nova-chip" data-query="show me the music">Music</button><button class="nova-chip" data-query="show first orbit">First Orbit</button><button class="nova-chip" data-query="run self check">Self-check</button></div><div class="nova-title">Destinations</div><div class="nova-actions"><button class="nova-action" data-action="music">🎵 Music Voyage<small>Browse all songs</small></button><button class="nova-action" data-action="darktide">⚔️ Darktide Signal<small>Open the Megamix</small></button><button class="nova-action" data-action="archive">🛰️ First Orbit<small>Restored memories</small></button><button class="nova-action" data-action="quotes">✨ Quote Orbit<small>MLK and Hawking</small></button><button class="nova-action" data-action="guestbook">📡 Guestbook<small>Leave a signal</small></button><button class="nova-action" data-action="chess">♟ Chess Portal<small>Enter the board</small></button><button class="nova-action" data-action="poem">🌊 Just A River<small>Open the restored poem</small></button><button class="nova-action" data-action="surprise">🎲 Surprise Me<small>Plot a random course</small></button></div><div class="nova-memory" id="novaMemory">Nova remembers preferences only on this device. Say “remember my name is …” or “remember I like …”. Nothing is sent to an AI service yet.</div></div></section><button class="nova-orb" id="novaOrb" aria-expanded="false" aria-controls="novaPanel"><span class="nova-core">✦</span><span class="nova-label">Open Astralis Nova</span></button>`;
  document.body.appendChild(root);

  const $=s=>root.querySelector(s), panel=$('#novaPanel'),orb=$('#novaOrb'),msg=$('#novaMessage'),status=$('#novaStatus'),input=$('#novaInput'),mic=$('#novaMic'),voiceBtn=$('#novaVoice');
  let voice=null,recognition=null;
  const chooseVoice=()=>{const vs=speechSynthesis?.getVoices?.()||[];voice=vs.map(v=>{let n=v.name.toLowerCase(),l=(v.lang||'').toLowerCase(),s=0;if(l.startsWith('en-gb'))s+=100;else if(l.startsWith('en'))s+=20;if(/sonia|libby|hazel|serena|susan|kate|fiona|moira|martha|female|natural|neural/.test(n))s+=45;if(/male|guy|david|mark|george/.test(n))s-=35;return{v,s}}).sort((a,b)=>b.s-a.s)[0]?.v||null;return voice};
  if('speechSynthesis'in window){chooseVoice();speechSynthesis.addEventListener?.('voiceschanged',chooseVoice)}
  const speak=text=>{if(state.muted||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.88;u.pitch=.84;u.volume=.94;if(voice||chooseVoice())u.voice=voice;speechSynthesis.speak(u)};
  const say=(text,spoken=true)=>{msg.textContent=text;if(spoken)speak(text)};
  const open=v=>{state.open=v;panel.classList.toggle('open',v);panel.setAttribute('aria-hidden',String(!v));orb.setAttribute('aria-expanded',String(v));if(v)setTimeout(()=>input.focus(),220)};
  const remember=()=>set('astralisNovaMemory',JSON.stringify(memory));
  const targetByText=(rx)=>[...document.querySelectorAll('section,main,article,div')].find(x=>rx.test((x.textContent||'').slice(0,1000)));
  const spotlight=t=>{if(!t)return false;t.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});t.classList.remove('nova-pulse-target');void t.offsetWidth;t.classList.add('nova-pulse-target');setTimeout(()=>t.classList.remove('nova-pulse-target'),3800);return true};
  const destination=(id)=>{
    const map={music:{text:'Opening the music voyage. Every track is a coordinate in the Astralis Nova story.',target:()=>document.querySelector('#music')},archive:{text:'Entering Echoes From the First Orbit, where old pages and MIDI signals still glow.',target:()=>document.querySelector('#echoes,#first-orbit,[id*="orbit" i],[id*="archive" i]')||targetByText(/Echoes From the First Orbit/i)},quotes:{text:'Locating the Quote Orbit and its permanent tribute to courage, curiosity, and forward motion.',target:()=>document.querySelector('#quoteOrbit,[id*="quote" i],.quote-card')||targetByText(/Martin Luther King|Stephen Hawking|Quote Orbit/i)},guestbook:{text:'Opening the guestbook. Leave a signal for the next traveler.',target:()=>document.querySelector('#guestbook')},about:{text:'Opening the Astralis Nova story.',target:()=>document.querySelector('#about')},contact:{text:'Opening communications.',target:()=>document.querySelector('#contact')}};
    if(id==='darktide'){say('Incoming transmission from Dereth. Opening the Darktide Megamix now.');open(false);setTimeout(()=>{const b=document.getElementById('darktidePlay');if(b){b.click();setTimeout(()=>document.getElementById('darktideAudio')?.play().catch(()=>{}),300)}else location.href='/?darktide=1'},180);memory.last='darktide';remember();return}
    if(id==='chess'){say('Opening the Astralis Nova chess portal.');setTimeout(()=>location.href='/chess/',260);return}
    if(id==='poem'){say('Opening Just A River, restored from the First Orbit archive.');setTimeout(()=>location.href='/just-a-river.html',260);return}
    if(id==='surprise'){destination(['music','archive','quotes','darktide','poem','chess'][Math.floor(Math.random()*6)]);return}
    const d=map[id];if(!d)return;say(d.text);const t=d.target();open(false);setTimeout(()=>{if(!spotlight(t)){status.textContent='That destination is not on this page yet.'}},180);memory.last=id;remember();
  };
  const selfCheck=()=>{const checks=[['Music',!!document.querySelector('#music')],['Darktide launcher',!!document.getElementById('darktidePlay')],['Guestbook',!!document.querySelector('#guestbook')],['Quote system',!!document.querySelector('#quoteOrbit,[id*="quote" i],.quote-card')||!!targetByText(/Martin Luther King|Stephen Hawking/)],['Speech',('speechSynthesis'in window)]];const bad=checks.filter(x=>!x[1]);const text=bad.length?`Self-check complete. ${checks.length-bad.length} of ${checks.length} systems responded. Missing signal: ${bad.map(x=>x[0]).join(', ')}.`:`Self-check complete. All ${checks.length} core systems are responding.`;say(text);status.textContent='Diagnostic scan complete.'};
  const answer=q=>{
    const raw=q.trim();if(!raw)return;const s=raw.toLowerCase();
    let m=raw.match(/remember my name is\s+(.+)/i);if(m){memory.name=m[1].trim();remember();say(`Understood. I will remember you as ${memory.name} on this device.`);return}
    m=raw.match(/remember (?:that )?i like\s+(.+)/i);if(m){memory.likes=m[1].trim();remember();say(`Logged locally. You like ${memory.likes}. I will use that when suggesting destinations.`);return}
    if(/forget|clear memory/.test(s)){for(const k of Object.keys(memory))delete memory[k];remember();say('Local visitor memory cleared. Fresh stars, clean chart.');return}
    if(/self.?check|diagnos|what.*broken|fix.*site/.test(s)){selfCheck();return}
    if(/darktide|mega.?mix|dereth/.test(s)){destination('darktide');return}
    if(/chess|board/.test(s)){destination('chess');return}
    if(/river|poem/.test(s)){destination('poem');return}
    if(/music|song|track|listen/.test(s)){destination('music');return}
    if(/first orbit|archive|old site|memories|midi/.test(s)){destination('archive');return}
    if(/quote|king|hawking|dream/.test(s)){destination('quotes');return}
    if(/guest|sign/.test(s)){destination('guestbook');return}
    if(/about|who is ramon|who.*astralis/.test(s)){destination('about');return}
    if(/contact|message/.test(s)){destination('contact');return}
    if(/surprise|random|anything/.test(s)){destination('surprise');return}
    if(/who are you|what are you/.test(s)){say('I am Astralis Nova, the interactive intelligence of this creative world. I can guide, speak, remember local preferences, and inspect site systems. My deeper cloud intelligence is still being forged.');return}
    if(/hello|hi|welcome/.test(s)){say(`Welcome aboard${memory.name?`, ${memory.name}`:''}. Ask me to play Darktide, open a poem, explore music, or run a self-check.`);return}
    say(`I understood the words, but not the destination yet. Try “play Darktide,” “show First Orbit,” “open chess,” “read the quotes,” or “run self-check.”`);
  };

  $('#novaForm').addEventListener('submit',e=>{e.preventDefault();const q=input.value;input.value='';answer(q)});
  root.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a)destination(a);const q=e.target.closest('[data-query]')?.dataset.query;if(q){input.value=q;answer(q)}});
  orb.addEventListener('click',()=>{open(!state.open);if(state.open)say(`Welcome aboard${memory.name?`, ${memory.name}`:''}. I am online and ready.`)});
  $('#novaClose').addEventListener('click',()=>open(false));
  voiceBtn.addEventListener('click',()=>{state.muted=!state.muted;set('astralisNovaMuted',String(state.muted));voiceBtn.textContent=state.muted?'🔇':'🔊';if(state.muted)speechSynthesis?.cancel();else speak('Voice interface online. Astralis Nova standing by.')});
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR){recognition=new SR();recognition.lang='en-US';recognition.interimResults=false;recognition.onstart=()=>{state.listening=true;mic.classList.add('nova-listening');status.textContent='Listening…'};recognition.onend=()=>{state.listening=false;mic.classList.remove('nova-listening')};recognition.onerror=()=>status.textContent='Voice input was unavailable.';recognition.onresult=e=>{const q=e.results[0][0].transcript;input.value=q;answer(q)}}else mic.style.display='none';
  mic.addEventListener('click',()=>{try{recognition?.start()}catch{}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)open(false)});
})();