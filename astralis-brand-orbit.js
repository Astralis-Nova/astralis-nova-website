(() => {
  "use strict";

  const STYLE_ID = "astralisBrandOrbitStyles";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .logo.astralis-orbit-logo{
        display:inline-flex!important;
        align-items:center!important;
        gap:10px!important;
        min-width:max-content;
      }
      .astralis-brand-emblem{
        position:relative;
        flex:0 0 42px;
        width:42px;
        height:42px;
        display:block;
        filter:drop-shadow(0 0 8px rgba(80,208,255,.30));
      }
      .astralis-brand-emblem svg{display:block;width:100%;height:100%;overflow:visible}
      .astralis-brand-orbit{
        transform-origin:32px 32px;
        animation:astralisBrandPlanetOrbit 5.2s linear infinite;
        will-change:transform;
      }
      .astralis-brand-star{
        transform-origin:32px 32px;
        animation:astralisBrandStarPulse 4.4s ease-in-out infinite;
      }
      .astralis-brand-copy{display:block;line-height:1.05}
      .astralis-brand-name{display:block}
      .astralis-orbit-logo small{margin-top:4px}
      @keyframes astralisBrandPlanetOrbit{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
      @keyframes astralisBrandStarPulse{
        0%,100%{opacity:.92;filter:brightness(.96)}
        50%{opacity:1;filter:brightness(1.16)}
      }
      @media(max-width:560px){
        .logo.astralis-orbit-logo{gap:7px!important;font-size:1.08rem!important}
        .astralis-brand-emblem{flex-basis:35px;width:35px;height:35px}
        .astralis-orbit-logo small{font-size:.56rem!important}
      }
      @media(prefers-reduced-motion:reduce){
        .astralis-brand-orbit,.astralis-brand-star{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function emblemMarkup() {
    return `
      <span class="astralis-brand-emblem" aria-hidden="true">
        <svg viewBox="0 0 64 64" focusable="false">
          <defs>
            <linearGradient id="astralisLogoOrbit" x1="8" y1="10" x2="56" y2="55">
              <stop stop-color="#7a86ff"/>
              <stop offset=".48" stop-color="#47e6ff"/>
              <stop offset="1" stop-color="#ff69db"/>
            </linearGradient>
            <linearGradient id="astralisLogoStar" x1="32" y1="8" x2="32" y2="56">
              <stop stop-color="#b5fbff"/>
              <stop offset=".48" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#ee9dff"/>
            </linearGradient>
            <filter id="astralisLogoGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="32" cy="32" r="23" fill="rgba(5,10,37,.72)" stroke="url(#astralisLogoOrbit)" stroke-width="2.4"/>
          <g class="astralis-brand-star" filter="url(#astralisLogoGlow)">
            <path d="M32 9c2.6 13.6 4.4 17.2 17.7 23C36.4 37.8 34.6 41.4 32 55c-2.6-13.6-4.4-17.2-17.7-23C27.6 26.2 29.4 22.6 32 9Z" fill="url(#astralisLogoStar)"/>
            <circle cx="32" cy="32" r="3" fill="#fff"/>
          </g>
          <g class="astralis-brand-orbit">
            <circle cx="55" cy="32" r="4.3" fill="#dfffff" filter="url(#astralisLogoGlow)"/>
            <circle cx="55" cy="32" r="2.1" fill="#69e8ff"/>
          </g>
        </svg>
      </span>`;
  }

  function upgradeLogo() {
    installStyles();
    const logo = document.querySelector(".logo");
    if (!logo || logo.dataset.orbitLogo === "true") return Boolean(logo);
    logo.dataset.orbitLogo = "true";
    logo.classList.add("astralis-orbit-logo");
    logo.setAttribute("aria-label", "Astralis Nova, home");
    logo.innerHTML = `${emblemMarkup()}<span class="astralis-brand-copy"><span class="astralis-brand-name">ASTRALIS NOVA</span><small>Music by Ramon Bivens</small></span>`;
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", upgradeLogo, {once:true});
  } else {
    upgradeLogo();
  }

  const observer = new MutationObserver(() => {
    if (upgradeLogo()) observer.disconnect();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  window.setTimeout(() => observer.disconnect(), 10000);
})();
