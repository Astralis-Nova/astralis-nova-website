(()=>{
  // Preserve shared Megamix links after moving the featured player to AC Worlds.
  if(new URLSearchParams(location.search).get('darktide')==='1'){
    location.replace('/ac-worlds?track=darktide-megamix#ac-jukebox');
    return;
  }
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

  const installMusicPlanet=()=>{
    if(document.getElementById('astralisMusicPlanet'))return;
    const footer=document.querySelector('footer');
    if(!footer)return;

    const style=document.createElement('style');
    style.textContent=`
      .astralis-music-orbit{
        position:relative;
        z-index:4;
        display:flex;
        justify-content:center;
        align-items:center;
        min-height:230px;
        padding:28px 20px 42px;
        overflow:hidden;
      }
      .astralis-music-orbit::before{
        content:'';
        position:absolute;
        width:min(560px,92vw);
        height:150px;
        border:1px solid rgba(93,177,255,.18);
        border-radius:50%;
        transform:rotate(-7deg);
        box-shadow:0 0 44px rgba(51,125,255,.08);
      }
      .astralis-music-planet{
        position:relative;
        width:148px;
        height:148px;
        display:grid;
        place-items:center;
        border-radius:50%;
        text-decoration:none;
        color:#fff;
        isolation:isolate;
        background:
          radial-gradient(circle at 34% 28%,rgba(255,255,255,.95) 0 2%,rgba(173,231,255,.72) 3%,transparent 8%),
          radial-gradient(circle at 30% 24%,#58d4ff 0 7%,transparent 24%),
          radial-gradient(circle at 68% 72%,#7b35ff 0 8%,transparent 27%),
          radial-gradient(circle at 55% 48%,#123d9e 0 34%,#07183f 64%,#020815 100%);
        border:1px solid rgba(169,224,255,.62);
        box-shadow:
          inset -22px -26px 34px rgba(0,0,0,.56),
          inset 14px 12px 26px rgba(125,222,255,.24),
          0 0 28px rgba(43,166,255,.42),
          0 0 70px rgba(96,75,255,.28);
        animation:astralisMusicFloat 4.8s ease-in-out infinite;
        transition:transform .22s ease,box-shadow .22s ease;
      }
      .astralis-music-planet::before{
        content:'';
        position:absolute;
        inset:50% auto auto 50%;
        width:188px;
        height:42px;
        transform:translate(-50%,-50%) rotate(-14deg);
        border:7px solid rgba(125,211,255,.58);
        border-left-color:rgba(236,62,185,.54);
        border-right-color:rgba(125,99,255,.62);
        border-radius:50%;
        filter:drop-shadow(0 0 8px rgba(88,190,255,.46));
        z-index:-1;
      }
      .astralis-music-planet::after{
        content:'';
        position:absolute;
        inset:-20px;
        border-radius:50%;
        border:1px solid rgba(103,193,255,.15);
        animation:astralisMusicPulse 2.8s ease-in-out infinite;
      }
      .astralis-music-planet:hover,
      .astralis-music-planet:focus-visible{
        transform:translateY(-6px) scale(1.055);
        outline:none;
        box-shadow:
          inset -22px -26px 34px rgba(0,0,0,.52),
          inset 14px 12px 26px rgba(125,222,255,.28),
          0 0 38px rgba(43,166,255,.62),
          0 0 92px rgba(236,22,140,.34);
      }
      .astralis-music-planet-core{
        position:relative;
        z-index:2;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:4px;
        text-align:center;
        text-shadow:0 2px 10px rgba(0,0,0,.82),0 0 12px rgba(91,201,255,.55);
      }
      .astralis-music-note{
        font-size:2.15rem;
        line-height:1;
        filter:drop-shadow(0 0 7px rgba(255,255,255,.48));
      }
      .astralis-music-title{
        font-size:.82rem;
        font-weight:900;
        letter-spacing:.17em;
      }
      .astralis-music-sub{
        font-size:.58rem;
        letter-spacing:.10em;
        color:#c8eaff;
        opacity:.9;
      }
      @keyframes astralisMusicFloat{
        0%,100%{transform:translateY(0) rotate(-1deg)}
        50%{transform:translateY(-13px) rotate(1deg)}
      }
      @keyframes astralisMusicPulse{
        0%,100%{transform:scale(.96);opacity:.28}
        50%{transform:scale(1.08);opacity:.72}
      }
      @media(max-width:620px){
        .astralis-music-orbit{min-height:195px;padding-top:20px}
        .astralis-music-planet{width:126px;height:126px}
        .astralis-music-planet::before{width:158px;height:36px}
        .astralis-music-note{font-size:1.8rem}
        .astralis-music-title{font-size:.7rem}
      }
      @media(prefers-reduced-motion:reduce){
        .astralis-music-planet,.astralis-music-planet::after{animation:none}
      }
    `;
    document.head.appendChild(style);

    const orbit=document.createElement('section');
    orbit.className='astralis-music-orbit';
    orbit.setAttribute('aria-label','Astralis Nova music player portal');
    orbit.innerHTML=`
      <a class="astralis-music-planet" id="astralisMusicPlanet" href="/player/" aria-label="Open Astralis Nova Music Player">
        <span class="astralis-music-planet-core">
          <span class="astralis-music-note" aria-hidden="true">♫</span>
          <span class="astralis-music-title">MUSIC</span>
          <span class="astralis-music-sub">ENTER PLAYER</span>
        </span>
      </a>`;
    footer.parentNode.insertBefore(orbit,footer);
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
  const loadFloatingLayout=()=>loadScript('/floating-controls-layout.js?v=20260830b','floatingControlsLayout');

  const finish=()=>{upgradeRiver();installMusicPlanet();loadQuoteAudit();loadNovaGuide();loadTipJar();loadFloatingLayout()};
  const core=document.createElement('script');core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@391ac37395e6de4dd8158a04476b059060495fee/astralis-celestial-drift.js';core.async=false;core.onload=finish;core.onerror=finish;document.head.appendChild(core);
})();
