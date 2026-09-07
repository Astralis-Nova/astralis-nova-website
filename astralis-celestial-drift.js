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
        min-height:280px;
        padding:36px 20px 48px;
        overflow:hidden;
        perspective:760px;
        isolation:isolate;
      }
      .astralis-music-orbit::before{
        content:'';
        position:absolute;
        width:min(610px,96vw);
        height:178px;
        border:1px solid rgba(104,190,255,.10);
        border-radius:50%;
        transform:rotate(-8deg);
        box-shadow:0 0 55px rgba(51,125,255,.07);
      }
      .astralis-music-system{
        position:relative;
        width:250px;
        height:220px;
        display:grid;
        place-items:center;
        transform-style:preserve-3d;
      }
      .astralis-music-planet{
        position:relative;
        z-index:6;
        width:164px;
        height:164px;
        display:grid;
        place-items:center;
        border-radius:50%;
        overflow:hidden;
        text-decoration:none;
        color:#fff;
        isolation:isolate;
        background:
          radial-gradient(circle at 29% 24%,rgba(220,250,255,.96) 0 1.5%,rgba(96,224,255,.58) 2%,transparent 8%),
          radial-gradient(ellipse at 31% 35%,rgba(71,214,237,.72) 0 8%,transparent 23%),
          radial-gradient(ellipse at 65% 67%,rgba(142,78,209,.55) 0 11%,transparent 27%),
          radial-gradient(ellipse at 72% 34%,rgba(34,72,137,.70) 0 16%,transparent 34%),
          conic-gradient(from 18deg at 49% 51%,#173c75 0 12%,#176888 18%,#332c76 31%,#172b5d 45%,#12647b 59%,#4a307a 73%,#142f64 87%,#173c75 100%);
        border:1px solid rgba(175,231,255,.67);
        box-shadow:
          inset -31px -25px 42px rgba(0,4,18,.70),
          inset 18px 12px 28px rgba(115,229,255,.22),
          0 0 18px rgba(93,212,255,.46),
          0 0 44px rgba(55,120,255,.30),
          0 0 82px rgba(103,64,225,.20);
        animation:astralisMusicFloat 6s ease-in-out infinite;
        transition:transform .22s ease,box-shadow .22s ease;
      }
      .astralis-music-planet::before{
        content:'';
        position:absolute;
        inset:-12%;
        border-radius:50%;
        z-index:-1;
        opacity:.72;
        background:
          repeating-radial-gradient(ellipse at 42% 48%,transparent 0 8px,rgba(153,238,255,.13) 9px 12px,transparent 13px 22px),
          conic-gradient(from 70deg,transparent 0 9%,rgba(117,225,255,.18) 12%,transparent 18% 37%,rgba(192,114,245,.16) 43%,transparent 51% 68%,rgba(78,198,220,.14) 74%,transparent 82% 100%);
        animation:astralisPlanetWeather 32s linear infinite;
      }
      .astralis-music-planet::after{
        content:'';
        position:absolute;
        inset:0;
        border-radius:50%;
        pointer-events:none;
        box-shadow:
          inset 9px 5px 16px rgba(195,248,255,.20),
          inset -28px -20px 38px rgba(0,0,0,.35),
          inset 0 0 0 1px rgba(175,235,255,.18);
        background:linear-gradient(118deg,rgba(255,255,255,.10),transparent 28%,transparent 62%,rgba(0,0,0,.18));
      }
      .astralis-music-planet:hover,
      .astralis-music-planet:focus-visible{
        transform:translateY(-5px) scale(1.045);
        outline:none;
        box-shadow:
          inset -31px -25px 42px rgba(0,4,18,.66),
          inset 18px 12px 28px rgba(115,229,255,.26),
          0 0 28px rgba(93,212,255,.64),
          0 0 62px rgba(55,120,255,.42),
          0 0 102px rgba(168,70,225,.28);
      }
      .astralis-music-planet-core{
        position:relative;
        z-index:8;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:4px;
        text-align:center;
        text-shadow:0 2px 10px rgba(0,0,0,.9),0 0 14px rgba(91,201,255,.7);
      }
      .astralis-music-note{font-size:2.2rem;line-height:1;filter:drop-shadow(0 0 8px rgba(255,255,255,.55))}
      .astralis-music-title{font-size:.83rem;font-weight:900;letter-spacing:.17em}
      .astralis-music-sub{font-size:.58rem;letter-spacing:.10em;color:#d5f1ff;opacity:.94}

      .astralis-natural-orbit{
        position:absolute;
        left:50%;top:50%;
        border-radius:50%;
        transform-style:preserve-3d;
        pointer-events:none;
      }
      .astralis-natural-orbit.one{
        width:232px;height:112px;
        margin:-56px 0 0 -116px;
        transform:rotate(-12deg);
        animation:astralisOrbitOne 12s linear infinite;
        z-index:9;
      }
      .astralis-natural-orbit.two{
        width:286px;height:154px;
        margin:-77px 0 0 -143px;
        transform:rotate(20deg);
        animation:astralisOrbitTwo 19s linear infinite reverse;
        z-index:4;
      }
      .astralis-natural-orbit::before{
        content:'';position:absolute;inset:0;border-radius:50%;
        border:1px solid rgba(143,220,255,.10);
      }
      .astralis-moon{
        position:absolute;
        top:50%;left:0;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:
          radial-gradient(circle at 31% 28%,rgba(255,255,255,.30) 0 5%,transparent 6%),
          radial-gradient(circle at 64% 38%,rgba(21,27,42,.42) 0 9%,transparent 10%),
          radial-gradient(circle at 42% 70%,rgba(24,30,46,.40) 0 7%,transparent 8%),
          radial-gradient(circle at 32% 28%,#c9d1da 0 9%,#818c9c 38%,#414b5b 67%,#141a24 100%);
        box-shadow:inset -7px -6px 12px rgba(0,0,0,.62),inset 3px 3px 6px rgba(255,255,255,.25),0 0 12px rgba(151,218,255,.42);
      }
      .astralis-moon.one{width:34px;height:34px}
      .astralis-moon.two{
        width:23px;height:23px;
        background:
          radial-gradient(circle at 34% 28%,rgba(255,255,255,.28) 0 6%,transparent 7%),
          radial-gradient(circle at 62% 61%,rgba(28,21,40,.38) 0 10%,transparent 11%),
          radial-gradient(circle at 31% 27%,#c7bed4,#7d708d 43%,#40374d 72%,#17131f 100%);
      }
      .astralis-natural-orbit.one .astralis-moon{animation:astralisMoonDepthOne 12s linear infinite}
      .astralis-natural-orbit.two .astralis-moon{animation:astralisMoonDepthTwo 19s linear infinite reverse}

      @keyframes astralisMusicFloat{
        0%,100%{transform:translateY(0) rotate(-.7deg)}
        50%{transform:translateY(-7px) rotate(.7deg)}
      }
      @keyframes astralisPlanetWeather{to{transform:rotate(360deg)}}
      @keyframes astralisOrbitOne{to{transform:rotate(348deg)}}
      @keyframes astralisOrbitTwo{to{transform:rotate(380deg)}}
      @keyframes astralisMoonDepthOne{
        0%,100%{transform:translate(-50%,-50%) scale(.72);filter:brightness(.68);z-index:2}
        25%{transform:translate(-50%,-50%) scale(.94);filter:brightness(.9)}
        50%{transform:translate(-50%,-50%) scale(1.22);filter:brightness(1.28);z-index:12}
        75%{transform:translate(-50%,-50%) scale(.94);filter:brightness(.9)}
      }
      @keyframes astralisMoonDepthTwo{
        0%,100%{transform:translate(-50%,-50%) scale(.8);filter:brightness(.72)}
        50%{transform:translate(-50%,-50%) scale(1.16);filter:brightness(1.18)}
      }
      @media(max-width:620px){
        .astralis-music-orbit{min-height:225px;padding-top:24px}
        .astralis-music-system{width:220px;height:190px}
        .astralis-music-planet{width:138px;height:138px}
        .astralis-natural-orbit.one{width:198px;height:94px;margin:-47px 0 0 -99px}
        .astralis-natural-orbit.two{width:232px;height:122px;margin:-61px 0 0 -116px}
        .astralis-moon.one{width:30px;height:30px}
        .astralis-moon.two{width:20px;height:20px}
        .astralis-music-note{font-size:1.85rem}
        .astralis-music-title{font-size:.72rem}
      }
      @media(prefers-reduced-motion:reduce){
        .astralis-music-planet,.astralis-music-planet::before,.astralis-natural-orbit,.astralis-moon{animation:none!important}
      }
    `;
    document.head.appendChild(style);

    const orbit=document.createElement('section');
    orbit.className='astralis-music-orbit';
    orbit.setAttribute('aria-label','Astralis Nova music player portal');
    orbit.innerHTML=`
      <div class="astralis-music-system">
        <div class="astralis-natural-orbit two" aria-hidden="true"><span class="astralis-moon two"></span></div>
        <a class="astralis-music-planet" id="astralisMusicPlanet" href="/player/" aria-label="Open Astralis Nova Music Player">
          <span class="astralis-music-planet-core">
            <span class="astralis-music-note" aria-hidden="true">♫</span>
            <span class="astralis-music-title">MUSIC</span>
            <span class="astralis-music-sub">ENTER PLAYER</span>
          </span>
        </a>
        <div class="astralis-natural-orbit one" aria-hidden="true"><span class="astralis-moon one"></span></div>
      </div>`;
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
