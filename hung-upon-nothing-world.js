(()=>{
  "use strict";
  if(window.__astralisHungUponNothingWorld)return;
  window.__astralisHungUponNothingWorld=true;

  const installStyles=()=>{
    if(document.getElementById("hungUponNothingWorldStyles"))return;
    const style=document.createElement("style");
    style.id="hungUponNothingWorldStyles";
    style.textContent=`
      .astralis-planet-link[data-world="hung-upon-nothing"]{
        border-color:rgba(255,211,115,.54)!important;
        background:
          radial-gradient(circle at 17% 18%,rgba(71,165,255,.16),transparent 14rem),
          radial-gradient(circle at 88% 82%,rgba(160,91,255,.13),transparent 15rem),
          linear-gradient(145deg,rgba(10,27,49,.97),rgba(13,9,29,.96))!important;
        box-shadow:0 16px 42px rgba(0,0,0,.32),0 0 25px rgba(255,204,104,.08)
      }
      .astralis-planet-link[data-world="hung-upon-nothing"]:hover,
      .astralis-planet-link[data-world="hung-upon-nothing"]:focus-visible{
        border-color:#ffe09a!important;
        box-shadow:0 18px 44px rgba(0,0,0,.38),0 0 30px rgba(103,190,255,.22),0 0 20px rgba(255,211,115,.15)!important
      }
      .planet-scripture{
        background:url("/astralis-earth.png") center/cover no-repeat!important;
        box-shadow:inset -13px -13px 18px rgba(0,0,0,.30),0 0 18px rgba(101,201,255,.55),0 0 34px rgba(255,208,111,.20)!important
      }
      .planet-scripture::before{
        content:"";position:absolute;inset:-9px;border:1px solid rgba(255,214,128,.42);border-radius:50%;
        box-shadow:0 0 18px rgba(255,210,113,.14);animation:scriptureHalo 4s ease-in-out infinite
      }
      .astralis-planet-link[data-world="hung-upon-nothing"] .astralis-world-badge{
        border-color:rgba(255,211,115,.48)!important;color:#ffda83!important;background:rgba(113,77,19,.16)!important
      }
      .astralis-planet-link[data-world="hung-upon-nothing"] .astralis-planet-copy strong::after{
        content:" ✦";color:#ffd77f;font-size:.76em
      }
      @keyframes scriptureHalo{50%{transform:scale(1.08);opacity:.55}}
      @media(prefers-reduced-motion:reduce){.planet-scripture::before{animation:none}}
    `;
    document.head.appendChild(style);
  };

  const installWorld=()=>{
    const system=document.querySelector("#connected-worlds .astralis-system");
    if(!system)return false;
    if(system.querySelector('[data-world="hung-upon-nothing"]'))return true;

    installStyles();
    const card=document.createElement("a");
    card.className="astralis-planet-link";
    card.dataset.world="hung-upon-nothing";
    card.href="/hung-upon-nothing.html";
    card.setAttribute("aria-label","Open Hung Upon Nothing cosmic scripture world");
    card.innerHTML=`
      <span class="astralis-planet planet-scripture" aria-hidden="true"></span>
      <span class="astralis-planet-copy">
        <strong>Hung Upon Nothing</strong>
        <span>Job 26:7, Earth suspended in space, and the ancient roots of familiar biblical names.</span>
        <span class="astralis-world-badge">Cosmic Scripture World</span>
      </span>`;
    system.appendChild(card);
    return true;
  };

  if(!installWorld()){
    const observer=new MutationObserver(()=>{
      if(installWorld())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }
})();