(() => {
  'use strict';

  const KMLE_PAGE = 'https://www.audacy.com/kmle1079';
  const KMLE_STREAM = '/api/kmle';

  function install(){
    const tuner = document.querySelector('.tuner-module');
    if (!tuner || tuner.dataset.kmleFallbackInstalled === 'true') return false;
    tuner.dataset.kmleFallbackInstalled = 'true';

    const slider = tuner.querySelector('#tunerSlider');
    const station = tuner.querySelector('#tunerStation');
    const status = tuner.querySelector('#tunerStatus');
    const searchPanel = tuner.querySelector('.tuner-search-panel');
    const searchInput = tuner.querySelector('#radioSearch');
    const searchBtn = tuner.querySelector('#radioSearchBtn');
    const mainAudio = document.getElementById('audio');
    if (!slider || !station || !status || !searchPanel) return false;

    // Dedicated radio element. KMLE is routed through our same-origin endpoint so
    // the radio can safely use its own EQ/reverb Web Audio graph.
    const radioAudio = new Audio();
    radioAudio.preload = 'none';
    radioAudio.src = KMLE_STREAM;
    radioAudio.volume = Number(document.getElementById('volume')?.value || .85);
    radioAudio.setAttribute('playsinline','');
    window.legacy83KmleAudio = radioAudio;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tuner-kmle-live';
    btn.textContent = '▶ 107.9 KMLE • PLAY LIVE';
    btn.hidden = true;
    btn.style.cssText = 'min-height:38px;border:1px solid #5a5140;border-radius:2px;background:linear-gradient(#887a58,#413b2c);color:#fff0bd;font-weight:900;letter-spacing:.04em;cursor:pointer;';
    searchPanel.appendChild(btn);

    const official = document.createElement('button');
    official.type = 'button';
    official.textContent = 'OPEN KMLE / AUDACY';
    official.hidden = true;
    official.style.cssText = btn.style.cssText + 'margin-top:4px;';
    official.addEventListener('click',()=>window.open(KMLE_PAGE,'_blank','noopener,noreferrer'));
    searchPanel.appendChild(official);

    function is1079(){ return Math.abs(Number(slider.value) - 107.9) < 0.05; }
    function setLabel(){
      const kmleLabel = 'KMLE • KMLE COUNTRY 107.9';
      if (station.textContent !== kmleLabel) station.textContent = kmleLabel;
      tuner.classList.add('is-tuned');
      const freq = tuner.querySelector('#tunerFrequency');
      const units = tuner.querySelector('#tunerUnits');
      if (freq) freq.textContent = '107.9';
      if (units) units.textContent = 'MHz';
    }
    function notify(playing){
      document.body.classList.toggle('legacy83-radio-live',!!playing);
      window.dispatchEvent(new CustomEvent('legacy83-radio-state',{detail:{playing:!!playing,station:{name:'KMLE Country 107.9',_call:'KMLE',_frequency:107.9,url:KMLE_STREAM}}}));
    }
    async function playKmle(){
      if(!is1079()) return;
      try{
        mainAudio?.pause();
        setLabel();
        status.textContent='107.9 KMLE • CONNECTING…';
        if(!radioAudio.src.endsWith(KMLE_STREAM)) radioAudio.src = KMLE_STREAM;
        radioAudio.load();
        await radioAudio.play();
        status.textContent='107.9 KMLE • LIVE';
        btn.textContent='❚❚ 107.9 KMLE • PAUSE';
        official.hidden = true;
        notify(true);
      }catch(err){
        console.warn('KMLE stream failed',err);
        status.textContent='107.9 KMLE • STREAM BLOCKED';
        btn.textContent='▶ 107.9 KMLE • RETRY LIVE';
        official.hidden=false;
        notify(false);
      }
    }
    function stopKmle(){
      radioAudio.pause();
      btn.textContent='▶ 107.9 KMLE • PLAY LIVE';
      notify(false);
    }

    btn.addEventListener('click',()=>radioAudio.paused?playKmle():stopKmle());
    radioAudio.addEventListener('playing',()=>{status.textContent='107.9 KMLE • LIVE';btn.textContent='❚❚ 107.9 KMLE • PAUSE';official.hidden=true;notify(true);});
    radioAudio.addEventListener('waiting',()=>{status.textContent='107.9 KMLE • BUFFERING…';});
    radioAudio.addEventListener('stalled',()=>{status.textContent='107.9 KMLE • BUFFERING…';});
    radioAudio.addEventListener('error',()=>{status.textContent='107.9 KMLE • STREAM ERROR';btn.textContent='▶ 107.9 KMLE • RETRY LIVE';official.hidden=false;notify(false);});
    radioAudio.addEventListener('pause',()=>{if(is1079())btn.textContent='▶ 107.9 KMLE • PLAY LIVE';notify(false);});
    document.getElementById('volume')?.addEventListener('input',e=>{radioAudio.volume=Number(e.currentTarget.value);});

    let refreshing = false;
    function refresh(){
      if (refreshing) return;
      refreshing = true;
      try {
        const at1079 = is1079();
        if (at1079) {
          setLabel();
          btn.hidden = false;
          official.hidden = radioAudio.error ? false : true;
        } else {
          btn.hidden = true;
          official.hidden = true;
          if(!radioAudio.paused) stopKmle();
        }
      } finally {
        refreshing = false;
      }
    }

    // 107.9 has one owner only. Capture the dial change before the generic tuner
    // can launch a second directory stream through the main song audio element.
    slider.addEventListener('change',e=>{
      if(!is1079()) return;
      e.stopImmediatePropagation();
      setLabel();
      playKmle();
    },true);

    slider.addEventListener('input',()=>refresh());

    // Searching 107.9/KMLE should tune and play immediately, without also running
    // the generic Radio Browser search path.
    searchBtn?.addEventListener('click',e=>{
      const q=(searchInput?.value||'').trim().toUpperCase();
      if(q!=='107.9'&&q!=='107.9 FM'&&q!=='KMLE') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      slider.value='107.9';
      setLabel();
      refresh();
      playKmle();
    },true);

    searchInput?.addEventListener('keydown',e=>{
      const q=(searchInput.value||'').trim().toUpperCase();
      if(e.key!=='Enter'||(q!=='107.9'&&q!=='107.9 FM'&&q!=='KMLE')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      slider.value='107.9';
      setLabel();
      refresh();
      playKmle();
    },true);

    const observer = new MutationObserver(()=>requestAnimationFrame(refresh));
    observer.observe(status,{childList:true,characterData:true,subtree:true});
    observer.observe(station,{childList:true,characterData:true,subtree:true});

    setTimeout(refresh,300);
    return true;
  }

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
