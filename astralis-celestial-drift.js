(()=>{
  const upgradeRiver=()=>{
    const card=document.querySelector('.relic-link-card[href*="soldierboy602/river.html"]');
    if(!card)return;
    card.href='/just-a-river.html';
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.setAttribute('aria-label','Open the restored Just A River poem page');
    const title=card.querySelector('strong');
    const description=card.querySelector('small');
    if(title)title.textContent='Just A River';
    if(description)description.textContent='A flowing twilight restoration with the poem, preserved MIDI, and original archive link.';
  };

  const addDarktideLaunch=()=>{
    if(document.getElementById('darktideLaunch'))return;
    const style=document.createElement('style');
    style.textContent=`
      #darktideLaunch{position:relative;z-index:45;overflow:hidden;border-bottom:1px solid rgba(255,94,94,.45);background:linear-gradient(100deg,#17030b 0%,#3b0719 35%,#160923 70%,#061323 100%);box-shadow:0 10px 32px rgba(0,0,0,.38)}
      #darktideLaunch::before{content:"";position:absolute;inset:-80%;pointer-events:none;background:conic-gradient(from 180deg,transparent,rgba(255,55,102,.16),transparent,rgba(71,151,255,.14),transparent);animation:darktideSweep 9s linear infinite}
      .darktide-launch-inner{position:relative;width:min(1500px,calc(100% - 36px));margin:auto;min-height:86px;display:flex;align-items:center;justify-content:space-between;gap:22px;padding:14px 0}
      .darktide-launch-copy{display:flex;align-items:center;gap:14px;min-width:0}
      .darktide-sigil{width:54px;height:54px;flex:0 0 54px;border-radius:50%;display:grid;place-items:center;font-size:1.55rem;background:radial-gradient(circle,#ff476f 0 8%,#541020 34%,#13040a 68%);border:1px solid rgba(255,109,139,.72);box-shadow:0 0 24px rgba(255,35,91,.42),inset 0 0 18px rgba(255,255,255,.08);animation:darktidePulse 2.4s ease-in-out infinite}
      .darktide-kicker{margin:0 0 3px;color:#ff89a4;font-size:.7rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
      .darktide-title{margin:0;font-size:clamp(1rem,2vw,1.35rem);line-height:1.15}
      .darktide-sub{margin:4px 0 0;color:#c7d2e2;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .darktide-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}
      .darktide-action{min-height:40px;padding:9px 15px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(6,12,23,.66);color:#fff;font-weight:900;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px}
      .darktide-action.primary{border:0;background:linear-gradient(90deg,#f22b5f,#8d35e8);box-shadow:0 0 18px rgba(231,40,105,.24)}
      .darktide-action:hover,.darktide-action:focus-visible{transform:translateY(-1px);filter:brightness(1.12)}
      #darktidePanel{display:none;position:fixed;inset:0;z-index:1000;background:rgba(1,3,8,.82);backdrop-filter:blur(14px);padding:22px;align-items:center;justify-content:center}
      #darktidePanel.open{display:flex}
      .darktide-panel-card{width:min(680px,100%);position:relative;overflow:hidden;border-radius:22px;border:1px solid rgba(255,89,131,.52);background:radial-gradient(circle at 50% 0,rgba(160,32,77,.32),transparent 42%),linear-gradient(180deg,#100713,#050910);box-shadow:0 30px 90px rgba(0,0,0,.62),0 0 42px rgba(236,22,92,.16);padding:30px;text-align:center}
      .darktide-panel-card h2{margin:5px 0 9px;font-size:clamp(2rem,6vw,3.4rem);letter-spacing:-.04em}
      .darktide-panel-card p{margin:0 auto 20px;max-width:540px;color:#c6d0df;line-height:1.6}
      .darktide-panel-card audio{width:100%;margin:10px 0 20px}
      .darktide-close{position:absolute;right:14px;top:12px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#0d111b;color:#fff;cursor:pointer;font-size:1.15rem}
      .darktide-share-status{min-height:1.3em;margin-top:10px;color:#8ee3bd;font-size:.82rem}
      @keyframes darktidePulse{50%{transform:scale(1.06);box-shadow:0 0 34px rgba(255,35,91,.58),inset 0 0 18px rgba(255,255,255,.12)}}
      @keyframes darktideSweep{to{transform:rotate(360deg)}}
      @media(max-width:760px){.darktide-launch-inner{align-items:flex-start;flex-direction:column;padding:13px 0}.darktide-actions{width:100%;justify-content:flex-start}.darktide-sub{white-space:normal}.darktide-action{flex:1}.darktide-sigil{width:46px;height:46px;flex-basis:46px}}
      @media(prefers-reduced-motion:reduce){#darktideLaunch::before,.darktide-sigil{animation:none}}
    `;
    document.head.appendChild(style);
    const banner=document.createElement('section');
    banner.id='darktideLaunch';
    banner.setAttribute('aria-label','New Darktide Megamix release');
    banner.innerHTML=`<div class="darktide-launch-inner"><div class="darktide-launch-copy"><div class="darktide-sigil" aria-hidden="true">⚔️</div><div><p class="darktide-kicker">Incoming transmission from Dereth</p><h2 class="darktide-title">NEW: Darktide Megamix</h2><p class="darktide-sub">Four Darktide battle tracks reforged into one continuous remix.</p></div></div><div class="darktide-actions"><button class="darktide-action primary" id="darktidePlay" type="button">▶ Play the Remix</button><button class="darktide-action" id="darktideShare" type="button">🔗 Copy Share Link</button></div></div>`;
    const topbar=document.querySelector('.topbar');
    if(topbar)topbar.insertAdjacentElement('afterend',banner);else document.body.prepend(banner);
    const panel=document.createElement('div');
    panel.id='darktidePanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','darktidePanelTitle');
    panel.innerHTML=`<div class="darktide-panel-card"><button class="darktide-close" id="darktideClose" type="button" aria-label="Close Darktide player">×</button><p class="darktide-kicker">Astralis Nova presents</p><h2 id="darktidePanelTitle">Darktide Megamix</h2><p>The strongest moments from four Darktide songs, cut apart and reforged into one battle transmission for the old warriors of Dereth.</p><audio id="darktideAudio" controls preload="metadata" src="/Audio/Darktide-Megamix.mp3">Your browser does not support audio playback.</audio><div class="darktide-actions" style="justify-content:center"><button class="darktide-action primary" id="darktidePanelShare" type="button">🔗 Copy Share Link</button><a class="darktide-action" href="#music" id="darktideExplore">Explore All Songs</a></div><div class="darktide-share-status" id="darktideShareStatus" aria-live="polite"></div></div>`;
    document.body.appendChild(panel);
    const openPanel=()=>{panel.classList.add('open');document.body.style.overflow='hidden';history.replaceState(null,'',`${location.pathname}?darktide=1${location.hash||''}`)};
    const closePanel=()=>{panel.classList.remove('open');document.body.style.overflow='';document.getElementById('darktideAudio')?.pause()};
    const copyLink=async()=>{const url=`${location.origin}${location.pathname}?darktide=1`;const status=document.getElementById('darktideShareStatus');try{await navigator.clipboard.writeText(url);if(status)status.textContent='Share link copied. Transmission ready.'}catch{window.prompt('Copy this Darktide share link:',url)}};
    document.getElementById('darktidePlay')?.addEventListener('click',openPanel);document.getElementById('darktideClose')?.addEventListener('click',closePanel);document.getElementById('darktideShare')?.addEventListener('click',copyLink);document.getElementById('darktidePanelShare')?.addEventListener('click',copyLink);document.getElementById('darktideExplore')?.addEventListener('click',closePanel);panel.addEventListener('click',event=>{if(event.target===panel)closePanel()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))closePanel()});
    if(new URLSearchParams(location.search).get('darktide')==='1')setTimeout(openPanel,350);
  };

  const loadScript=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.dataset[key]='true';
    script.async=false;
    document.head.appendChild(script);
  };
  const loadQuoteAudit=()=>loadScript('/quote-attribution-audit.js?v=20260805a','quoteAudit');
  const loadNovaGuide=()=>loadScript('/nova-guide.js?v=20260805g','novaGuide');
  const loadTipJar=()=>loadScript('/feeling-tipsy.js?v=20260805c','feelingTipsy');
  const loadFloatingLayout=()=>loadScript('/floating-controls-layout.js?v=20260805b','floatingControlsLayout');
  const loadDanielLink=()=>loadScript('/daniel-story-link.js?v=20260805e','danielStoryLink');

  const finish=()=>{upgradeRiver();loadQuoteAudit();addDarktideLaunch();loadNovaGuide();loadTipJar();loadFloatingLayout();loadDanielLink()};
  const core=document.createElement('script');core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@391ac37395e6de4dd8158a04476b059060495fee/astralis-celestial-drift.js';core.async=false;core.onload=finish;core.onerror=finish;document.head.appendChild(core);
})();