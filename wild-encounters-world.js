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
      .planet-wild{
        background:
          radial-gradient(circle at 70% 30%,rgba(255,218,115,.9) 0 5%,transparent 6%),
          linear-gradient(180deg,#29324a 0 36%,#a95e42 37% 55%,#263326 56% 100%)!important;
        box-shadow:inset -13px -13px 18px rgba(0,0,0,.30),0 0 18px rgba(178,229,95,.42)!important
      }
      .planet-wild::after{content:"🌵";position:absolute;inset:0;display:grid;place-items:center;font-size:1.5rem;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
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
    return true;
  };

  if(!installWorld()){
    const observer=new MutationObserver(()=>{if(installWorld())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }
})();