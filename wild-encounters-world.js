(()=>{
  "use strict";
  if(window.__astralisWildEncountersWorld)return;
  window.__astralisWildEncountersWorld=true;

  const installStyles=()=>{
    if(document.getElementById("wildEncountersWorldStyles"))return;
    const style=document.createElement("style");
    style.id="wildEncountersWorldStyles";
    style.textContent=`
      .astralis-planet-link[data-world="wild-encounters"]{
        border-color:rgba(174,226,104,.48)!important;
        background:linear-gradient(145deg,rgba(18,28,19,.96),rgba(7,20,22,.96))!important;
        box-shadow:0 16px 42px rgba(0,0,0,.32),0 0 26px rgba(166,226,92,.08)
      }
      .astralis-planet-link[data-world="wild-encounters"]:hover,
      .astralis-planet-link[data-world="wild-encounters"]:focus-visible{
        border-color:#b8ee70!important;
        box-shadow:0 18px 44px rgba(0,0,0,.38),0 0 32px rgba(151,219,86,.18)!important
      }
      .planet-wild{position:relative;background:radial-gradient(circle at 34% 26%,rgba(255,255,230,.25),transparent 18%),linear-gradient(145deg,#5c6b45,#202b22)!important;background-position:center!important;background-size:cover!important;box-shadow:inset -15px -16px 22px rgba(0,0,0,.50),inset 8px 7px 13px rgba(255,238,178,.12),0 0 20px rgba(178,229,95,.35)!important;overflow:visible!important}
      .planet-wild::before{content:"";position:absolute;left:-19%;top:43%;width:138%;height:18%;border:3px solid rgba(208,224,187,.78);border-left-color:rgba(122,151,110,.42);border-radius:50%;transform:rotate(-16deg);box-shadow:0 0 8px rgba(188,224,173,.28);z-index:2}
      .planet-wild::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(110deg,rgba(255,255,255,.16),transparent 35%,rgba(0,0,0,.32) 78%);box-shadow:inset 0 0 0 1px rgba(227,244,211,.24);z-index:1}
      .astralis-planet-link[data-world="wild-encounters"] .astralis-world-badge{border-color:rgba(177,226,105,.46)!important;color:#b8ed75!important;background:rgba(58,87,31,.18)!important}
    `;
    document.head.appendChild(style);
  };

  const installWorld=()=>{
    const system=document.querySelector("#connected-worlds .astralis-system");
    if(!system)return false;
    if(system.querySelector('[data-world="wild-encounters"]'))return true;
    installStyles();
    const card=document.createElement("a");
    card.className="astralis-planet-link";
    card.dataset.world="wild-encounters";
    card.href="/wild-encounters.html";
    card.setAttribute("aria-label","Open Wild Encounters field log");
    card.innerHTML=`
      <span class="astralis-planet planet-wild" aria-hidden="true"></span>
      <span class="astralis-planet-copy">
        <strong>Wild Encounters</strong>
        <span>Real creature encounters, photos, videos, field notes, facts, and humor from Arizona and beyond.</span>
        <span class="astralis-world-badge">Living World</span>
      </span>`;
    system.appendChild(card);
    const planet=card.querySelector('.planet-wild');if(planet)planet.style.setProperty('background-image','linear-gradient(110deg,rgba(255,255,255,.10),rgba(0,0,0,.36)),url("/wild-media/gopher-snake-original.jpg?v=20260830d")','important');
    return true;
  };

  if(!installWorld()){
    const observer=new MutationObserver(()=>{if(installWorld())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }
})();