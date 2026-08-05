(()=>{
  if(window.__astralisNovaGuideLoaded)return;
  window.__astralisNovaGuideLoaded=true;

  const prefersReducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const state={
    open:false,
    muted:localStorage.getItem('astralisNovaMuted')==='true',
    firstVisit:localStorage.getItem('astralisNovaVisited')!=='true'
  };

  const style=document.createElement('style');
  style.textContent=`
    #novaGuide{position:fixed;right:18px;bottom:18px;z-index:1100;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7fbff}
    .nova-orb-button{width:68px;height:68px;border-radius:50%;border:1px solid rgba(129,214,255,.82);cursor:pointer;display:grid;place-items:center;position:relative;background:radial-gradient(circle at 44% 38%,#e8fbff 0 3%,#70d9ff 5%,#1c6fcf 18%,#162760 42%,#070b22 69%);box-shadow:0 0 0 5px rgba(38,126,255,.10),0 0 34px rgba(52,174,255,.55),inset 0 0 24px rgba(255,255,255,.14);color:white}
    .nova-orb-button::before,.nova-orb-button::after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(131,222,255,.46);inset:-8px;animation:novaOrbit 7s linear infinite}
    .nova-orb-button::after{inset:-14px;border-color:rgba(237,72,220,.28);animation-direction:reverse;animation-duration:11s}
    .nova-orb-core{font-size:1.45rem;text-shadow:0 0 14px white;filter:drop-shadow(0 0 8px #65d7ff)}
    .nova-orb-label{position:absolute;right:78px;white-space:nowrap;padding:8px 11px;border-radius:999px;border:1px solid rgba(111,196,255,.38);background:rgba(4,10,27,.88);box-shadow:0 12px 30px rgba(0,0,0,.34);font-size:.76rem;font-weight:850;letter-spacing:.04em;pointer-events:none;opacity:0;transform:translateX(8px);transition:.2s ease}
    .nova-orb-button:hover .nova-orb-label,.nova-orb-button:focus-visible .nova-orb-label{opacity:1;transform:none}
    .nova-panel{position:absolute;right:0;bottom:82px;width:min(390px,calc(100vw - 28px));max-height:min(650px,calc(100vh - 120px));overflow:auto;border-radius:22px;border:1px solid rgba(101,192,255,.48);background:radial-gradient(circle at 85% 0,rgba(226,40,209,.15),transparent 42%),radial-gradient(circle at 5% 10%,rgba(29,138,255,.22),transparent 46%),linear-gradient(180deg,rgba(9,17,40,.97),rgba(4,8,22,.98));box-shadow:0 28px 90px rgba(0,0,0,.68),0 0 40px rgba(35,150,255,.14);backdrop-filter:blur(18px);transform-origin:bottom right;opacity:0;pointer-events:none;transform:translateY(12px) scale(.96);transition:.22s ease}
    .nova-panel.open{opacity:1;pointer-events:auto;transform:none}
    .nova-panel-header{display:flex;align-items:center;gap:12px;padding:17px 17px 13px;border-bottom:1px solid rgba(116,175,228,.18);position:sticky;top:0;background:rgba(7,13,31,.92);backdrop-filter:blur(14px);z-index:2}
    .nova-mini-orb{width:43px;height:43px;flex:0 0 43px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#dffcff 0 5%,#52cfff 10%,#164fa1 37%,#080c28 72%);box-shadow:0 0 20px rgba(65,194,255,.48);font-size:1.08rem}
    .nova-panel-header h2{font-size:1rem;margin:0 0 2px;letter-spacing:.04em}
    .nova-panel-header p{margin:0;color:#9fc1dc;font-size:.71rem}
    .nova-header-actions{margin-left:auto;display:flex;gap:6px}
    .nova-icon-btn{width:34px;height:34px;border-radius:50%;border:1px solid rgba(151,193,231,.25);background:#0b1730;color:#fff;cursor:pointer}
    .nova-body{padding:16px}
    .nova-message{margin:0 0 14px;padding:13px 14px;border:1px solid rgba(105,183,239,.23);border-radius:14px 14px 14px 4px;background:rgba(17,36,66,.72);color:#dcecff;line-height:1.52;font-size:.87rem}
    .nova-status{min-height:1.2em;color:#7fe5c0;font-size:.72rem;margin:-5px 2px 12px}
    .nova-section-label{margin:15px 0 8px;color:#85cfff;font-size:.68rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .nova-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .nova-action{min-height:44px;border-radius:12px;border:1px solid rgba(109,174,229,.28);background:linear-gradient(180deg,rgba(19,42,75,.94),rgba(10,23,45,.94));color:#fff;padding:9px 10px;text-align:left;cursor:pointer;font-size:.78rem;font-weight:800;line-height:1.25;transition:.16s ease}
    .nova-action:hover,.nova-action:focus-visible{transform:translateY(-1px);border-color:#67cfff;box-shadow:0 0 0 3px rgba(50,160,255,.12)}
    .nova-action.primary{grid-column:1/-1;text-align:center;background:linear-gradient(90deg,#147df5,#c72ac9);border:0}
    .nova-action small{display:block;color:#a7bed2;font-weight:500;margin-top:3px}
    .nova-footer{padding:0 16px 16px;color:#7894ad;font-size:.66rem;line-height:1.45}
    .nova-pulse-target{position:relative;z-index:1;animation:novaTargetPulse 1.15s ease 3;outline:2px solid rgba(76,193,255,.82)!important;outline-offset:6px;border-radius:12px}
    .nova-toast{position:absolute;right:0;bottom:82px;width:min(340px,calc(100vw - 28px));padding:12px 14px;border-radius:14px;border:1px solid rgba(100,192,255,.38);background:rgba(5,12,29,.95);box-shadow:0 18px 50px rgba(0,0,0,.48);font-size:.82rem;line-height:1.45;opacity:0;pointer-events:none;transform:translateY(8px);transition:.2s ease}
    .nova-toast.show{opacity:1;transform:none}
    @keyframes novaOrbit{to{transform:rotate(360deg)}}
    @keyframes novaTargetPulse{50%{box-shadow:0 0 0 9px rgba(55,173,255,.16),0 0 30px rgba(55,173,255,.28)}}
    @media(max-width:560px){#novaGuide{right:12px;bottom:12px}.nova-orb-button{width:60px;height:60px}.nova-panel{bottom:72px}.nova-actions{grid-template-columns:1fr}.nova-action.primary{grid-column:auto}.nova-orb-label{display:none}}
    @media(prefers-reduced-motion:reduce){.nova-orb-button::before,.nova-orb-button::after,.nova-pulse-target{animation:none}.nova-panel,.nova-toast,.nova-action{transition:none}}
  `;
  document.head.appendChild(style);

  const root=document.createElement('aside');
  root.id='novaGuide';
  root.setAttribute('aria-label','Astralis Nova site guide');
  root.innerHTML=`
    <div class="nova-toast" id="novaToast" role="status" aria-live="polite"></div>
    <section class="nova-panel" id="novaPanel" aria-hidden="true" aria-labelledby="novaTitle">
      <header class="nova-panel-header">
        <div class="nova-mini-orb" aria-hidden="true">✦</div>
        <div><h2 id="novaTitle">Astralis Nova</h2><p>Cosmic guide • Site navigation intelligence</p></div>
        <div class="nova-header-actions">
          <button class="nova-icon-btn" id="novaVoice" type="button" aria-label="Toggle Nova voice">${state.muted?'🔇':'🔊'}</button>
          <button class="nova-icon-btn" id="novaClose" type="button" aria-label="Close Nova guide">×</button>
        </div>
      </header>
      <div class="nova-body">
        <p class="nova-message" id="novaMessage">Welcome aboard. I can guide you through the music, recovered memories, quotes, and transmissions hidden across Astralis Nova.</p>
        <div class="nova-status" id="novaStatus" aria-live="polite"></div>
        <button class="nova-action primary" data-nova-action="tour" type="button">🚀 Begin the Quick Tour</button>
        <p class="nova-section-label">Destinations</p>
        <div class="nova-actions">
          <button class="nova-action" data-nova-action="music" type="button">🎵 Music Voyage<small>Explore the song catalog</small></button>
          <button class="nova-action" data-nova-action="darktide" type="button">⚔️ Darktide Signal<small>Open the Megamix transmission</small></button>
          <button class="nova-action" data-nova-action="archive" type="button">🛰️ First Orbit<small>Visit restored memories</small></button>
          <button class="nova-action" data-nova-action="quote" type="button">✨ Quote Orbit<small>Find the words among the stars</small></button>
          <button class="nova-action" data-nova-action="guestbook" type="button">📡 Guestbook<small>Leave a signal behind</small></button>
          <button class="nova-action" data-nova-action="surprise" type="button">🎲 Surprise Me<small>Choose a random portal</small></button>
        </div>
      </div>
      <div class="nova-footer">Voice uses your browser’s built-in speech system. Nova only speaks after you interact with the guide.</div>
    </section>
    <button class="nova-orb-button" id="novaOrb" type="button" aria-expanded="false" aria-controls="novaPanel" aria-label="Open Astralis Nova guide">
      <span class="nova-orb-core" aria-hidden="true">✦</span><span class="nova-orb-label">Ask Nova to guide you</span>
    </button>`;
  document.body.appendChild(root);

  const panel=root.querySelector('#novaPanel');
  const orb=root.querySelector('#novaOrb');
  const message=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const voiceButton=root.querySelector('#novaVoice');
  const toast=root.querySelector('#novaToast');
  let toastTimer;

  const messages={
    welcome:'Welcome aboard. I can guide you through the music, recovered memories, quotes, and transmissions hidden across Astralis Nova.',
    music:'Opening the music voyage. Twenty-seven signals and counting, each one carrying a different piece of the Astralis Nova story.',
    darktide:'Incoming transmission from Dereth. The Darktide Megamix has been reforged and is ready for battle.',
    archive:'Entering Echoes From the First Orbit, where early pages, poems, and MIDI signals have been restored from the old web.',
    quote:'Locating the Quote Orbit and its permanent tribute to courage, love, curiosity, and forward motion.',
    guestbook:'Opening the guestbook. Visitors may leave a signal for future travelers to discover.',
    surprise:'Plotting an unpredictable course. Hold onto the nearest gravity rail.',
    tour:'Tour initialized. We will begin with the music collection, then trace the site’s strongest signals.'
  };

  const speak=text=>{
    if(state.muted||!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.rate=.94;
    utterance.pitch=.94;
    utterance.volume=.9;
    const voices=window.speechSynthesis.getVoices();
    const preferred=voices.find(v=>/en-US/i.test(v.lang)&&/natural|aria|guy|david|mark|zira/i.test(v.name))||voices.find(v=>/^en/i.test(v.lang));
    if(preferred)utterance.voice=preferred;
    window.speechSynthesis.speak(utterance);
  };

  const say=(text,shouldSpeak=true)=>{
    message.textContent=text;
    if(shouldSpeak)speak(text);
  };

  const showToast=text=>{
    clearTimeout(toastTimer);
    toast.textContent=text;
    toast.classList.add('show');
    toastTimer=setTimeout(()=>toast.classList.remove('show'),5200);
  };

  const setOpen=open=>{
    state.open=open;
    panel.classList.toggle('open',open);
    panel.setAttribute('aria-hidden',String(!open));
    orb.setAttribute('aria-expanded',String(open));
    orb.setAttribute('aria-label',open?'Close Astralis Nova guide':'Open Astralis Nova guide');
    if(open){localStorage.setItem('astralisNovaVisited','true');setTimeout(()=>root.querySelector('[data-nova-action="tour"]')?.focus(),230)}
  };

  const findByText=(selector,patterns)=>[...document.querySelectorAll(selector)].find(el=>patterns.some(pattern=>pattern.test((el.textContent||'').trim())));
  const resolveTarget=action=>{
    const selectors={
      music:['#music','[id*="music" i]','.catalog','.main'],
      archive:['#echoes','#first-orbit','[id*="archive" i]','[id*="orbit" i]'],
      quote:['#quoteOrbit','[id*="quote" i]','.quote-card'],
      guestbook:['#guestbook','[id*="guest" i]','.guestbook']
    };
    for(const selector of selectors[action]||[]){const found=document.querySelector(selector);if(found)return found}
    if(action==='archive')return findByText('section,article,div,h2,h3',[/Echoes From the First Orbit/i,/First Orbit/i,/Just A River/i]);
    if(action==='quote')return findByText('section,article,div,h2,h3',[/Quote Orbit/i,/Martin Luther King/i,/Stephen Hawking/i]);
    if(action==='guestbook')return findByText('section,article,div,h2,h3',[/Guestbook/i,/Leave a signal/i]);
    if(action==='music')return findByText('section,main,div,h2',[/All Songs/i,/Music/i,/catalog/i]);
    return null;
  };

  const spotlight=(target,label)=>{
    if(!target){status.textContent=`I could not lock onto ${label} on this page.`;return false}
    target.scrollIntoView({behavior:prefersReducedMotion?'auto':'smooth',block:'center'});
    target.classList.remove('nova-pulse-target');
    void target.offsetWidth;
    target.classList.add('nova-pulse-target');
    setTimeout(()=>target.classList.remove('nova-pulse-target'),4200);
    status.textContent=`Destination located: ${label}.`;
    return true;
  };

  const openDarktide=()=>{
    const play=document.getElementById('darktidePlay');
    if(play){play.click();status.textContent='Darktide transmission opened.';return}
    const banner=document.getElementById('darktideLaunch');
    if(banner)spotlight(banner,'Darktide transmission');
    else location.href='/?darktide=1';
  };

  const runAction=action=>{
    const text=messages[action]||messages.welcome;
    say(text);
    if(action==='darktide'){openDarktide();return}
    if(action==='tour'){
      const target=resolveTarget('music');
      spotlight(target,'music collection');
      showToast('Nova Tour 1/3: Explore the music. Return to Nova for First Orbit and the Quote Orbit.');
      return;
    }
    if(action==='surprise'){
      const choices=['music','darktide','archive','quote','guestbook'];
      runAction(choices[Math.floor(Math.random()*choices.length)]);
      return;
    }
    spotlight(resolveTarget(action),action==='archive'?'Echoes From the First Orbit':action==='quote'?'Quote Orbit':action==='guestbook'?'guestbook':'music collection');
  };

  orb.addEventListener('click',()=>setOpen(!state.open));
  root.querySelector('#novaClose').addEventListener('click',()=>setOpen(false));
  voiceButton.addEventListener('click',()=>{
    state.muted=!state.muted;
    localStorage.setItem('astralisNovaMuted',String(state.muted));
    voiceButton.textContent=state.muted?'🔇':'🔊';
    voiceButton.setAttribute('aria-label',state.muted?'Enable Nova voice':'Mute Nova voice');
    status.textContent=state.muted?'Voice muted. Text guidance remains active.':'Voice enabled. Audio channel open.';
    if(!state.muted)speak('Voice channel online. Astralis Nova standing by.');
    else window.speechSynthesis?.cancel();
  });
  root.querySelectorAll('[data-nova-action]').forEach(button=>button.addEventListener('click',()=>runAction(button.dataset.novaAction)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.open)setOpen(false)});

  if(state.firstVisit){
    setTimeout(()=>showToast('Astralis Nova online. Open the glowing star for a guided tour of the site.'),1700);
  }
})();