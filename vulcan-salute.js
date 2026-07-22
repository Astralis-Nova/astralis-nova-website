(() => {
  "use strict";

  document.getElementById("astralisVulcanBlessing")?.remove();
  document.getElementById("astralisVulcanBlessingStyles")?.remove();

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-footer-blessing{
      position:relative!important;
      z-index:2!important;
      display:flex!important;
      justify-content:flex-end!important;
      width:100%!important;
      box-sizing:border-box!important;
      margin:48px 0 0!important;
      padding:30px max(18px,5vw) 118px!important;
      overflow:hidden!important;
      background:linear-gradient(180deg,transparent,rgba(4,12,28,.42));
      pointer-events:none;
    }
    .vulcan-footer-button{
      position:relative!important;
      width:138px!important;
      max-width:138px!important;
      min-width:0!important;
      height:auto!important;
      padding:0!important;
      margin:0!important;
      border:0!important;
      border-radius:24px!important;
      background:transparent!important;
      box-shadow:none!important;
      color:inherit!important;
      appearance:none!important;
      cursor:pointer!important;
      pointer-events:auto!important;
      animation:vulcanFooterFloat 6.4s ease-in-out infinite;
    }
    .vulcan-footer-shell{display:grid;justify-items:center;gap:0}
    .vulcan-footer-art{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 12px 18px rgba(0,0,0,.42)) drop-shadow(0 0 11px rgba(96,195,255,.22))}
    .vulcan-left-pair{transform-origin:76px 173px;animation:vulcanLeftPair 3.7s ease-in-out infinite}
    .vulcan-right-pair{transform-origin:145px 173px;animation:vulcanRightPair 4.1s ease-in-out infinite}
    .vulcan-thumb{transform-origin:166px 178px;animation:vulcanThumb 3.4s ease-in-out infinite}
    .vulcan-ring{transform-origin:120px 154px;animation:vulcanRing 11s linear infinite,vulcanRingPulse 4.2s ease-in-out infinite}
    .vulcan-star{transform-origin:center;animation:vulcanStar 3.1s ease-in-out infinite}
    .vulcan-star.s2{animation-delay:.9s}.vulcan-star.s3{animation-delay:1.8s}.vulcan-star.s4{animation-delay:2.5s}
    .vulcan-footer-caption{
      position:relative;
      z-index:3;
      max-width:132px;
      margin-top:-15px;
      padding:5px 9px 6px;
      border:1px solid rgba(126,210,255,.34);
      border-radius:999px;
      background:rgba(3,12,23,.9);
      color:#f1fbff;
      font-size:.54rem;
      font-weight:800;
      letter-spacing:.105em;
      line-height:1.3;
      text-align:center;
      text-transform:uppercase;
      text-shadow:0 0 10px rgba(113,215,255,.38);
      box-shadow:0 0 18px rgba(69,154,255,.18);
    }
    .vulcan-footer-button:hover .vulcan-footer-art,.vulcan-footer-button:focus-visible .vulcan-footer-art{filter:brightness(1.08) saturate(1.08) drop-shadow(0 0 15px rgba(104,211,255,.34))}
    .vulcan-footer-button:focus-visible{outline:2px solid #8de8ff!important;outline-offset:5px!important}
    .vulcan-footer-message{
      position:absolute;
      right:max(18px,5vw);
      bottom:62px;
      max-width:min(320px,calc(100vw - 32px));
      padding:10px 13px;
      border:1px solid rgba(113,206,255,.48);
      border-radius:13px;
      background:rgba(3,12,23,.97);
      color:#e8f7ff;
      box-shadow:0 14px 34px rgba(0,0,0,.44),0 0 22px rgba(69,154,255,.13);
      font-size:.8rem;
      line-height:1.45;
      opacity:0;
      transform:translateY(7px) scale(.98);
      transition:opacity .2s ease,transform .2s ease;
      pointer-events:none;
    }
    .vulcan-footer-message.show{opacity:1;transform:none}
    .vulcan-footer-message strong{display:block;margin-bottom:3px;color:#91eaff;letter-spacing:.05em}
    @keyframes vulcanFooterFloat{0%,100%{transform:translateY(0) rotate(-.3deg)}50%{transform:translateY(-5px) rotate(.3deg)}}
    @keyframes vulcanLeftPair{0%,100%{transform:rotate(-.7deg)}50%{transform:rotate(1.15deg)}}
    @keyframes vulcanRightPair{0%,100%{transform:rotate(.65deg)}50%{transform:rotate(-.9deg)}}
    @keyframes vulcanThumb{0%,100%{transform:rotate(-.3deg)}50%{transform:rotate(2deg)}}
    @keyframes vulcanRing{to{transform:rotate(360deg)}}
    @keyframes vulcanRingPulse{0%,100%{opacity:.62}50%{opacity:1}}
    @keyframes vulcanStar{0%,100%{opacity:.25;transform:scale(.78)}50%{opacity:1;transform:scale(1.35)}}
    @media(max-width:700px){
      .vulcan-footer-blessing{justify-content:center!important;margin-top:34px!important;padding:24px 12px 108px!important}
      .vulcan-footer-button{width:104px!important;max-width:104px!important}
      .vulcan-footer-caption{max-width:104px;margin-top:-11px;padding:4px 6px 5px;font-size:.43rem;letter-spacing:.075em}
      .vulcan-footer-message{right:50%;bottom:55px;transform:translate(50%,7px) scale(.98);text-align:center}
      .vulcan-footer-message.show{transform:translate(50%,0) scale(1)}
    }
    @media(prefers-reduced-motion:reduce){.vulcan-footer-button,.vulcan-left-pair,.vulcan-right-pair,.vulcan-thumb,.vulcan-ring,.vulcan-star{animation:none!important}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.id = "astralisVulcanBlessing";
  section.className = "vulcan-footer-blessing";
  section.setAttribute("aria-label", "Live long and prosper blessing");
  section.innerHTML = `
    <button class="vulcan-footer-button" type="button" aria-label="Open the live long and prosper blessing">
      <span class="vulcan-footer-shell">
        <svg class="vulcan-footer-art" viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="vfsSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd2b5"/><stop offset=".45" stop-color="#f2ad84"/><stop offset="1" stop-color="#c9795c"/></linearGradient>
            <linearGradient id="vfsSkinLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe1cb"/><stop offset="1" stop-color="#df8f6b"/></linearGradient>
            <radialGradient id="vfsPortal" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#2a7ed4" stop-opacity=".12"/><stop offset=".6" stop-color="#6635b8" stop-opacity=".18"/><stop offset="1" stop-color="#051020" stop-opacity="0"/></radialGradient>
            <filter id="vfsGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <ellipse cx="120" cy="154" rx="105" ry="118" fill="url(#vfsPortal)"/>
          <g class="vulcan-ring"><ellipse cx="120" cy="154" rx="91" ry="104" fill="none" stroke="#7fe7ff" stroke-opacity=".55" stroke-width="2" filter="url(#vfsGlow)"/><path d="M31 147a91 104 0 0 1 178-13" fill="none" stroke="#ae80ff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/></g>
          <circle class="vulcan-star s1" cx="34" cy="126" r="3.2" fill="#eaffff" filter="url(#vfsGlow)"/><circle class="vulcan-star s2" cx="203" cy="109" r="2.8" fill="#d7f9ff" filter="url(#vfsGlow)"/><circle class="vulcan-star s3" cx="48" cy="220" r="2.5" fill="#f3e8ff" filter="url(#vfsGlow)"/><circle class="vulcan-star s4" cx="198" cy="230" r="3" fill="#dcfbff" filter="url(#vfsGlow)"/>
          <g class="vulcan-left-pair">
            <rect x="34" y="70" width="28" height="112" rx="14" fill="url(#vfsSkinLight)" stroke="#8d513f" stroke-width="3" transform="rotate(-8 48 168)"/>
            <rect x="60" y="42" width="31" height="140" rx="15.5" fill="url(#vfsSkinLight)" stroke="#8d513f" stroke-width="3" transform="rotate(-4 75.5 170)"/>
            <path d="M38 112c8-3 16-3 24 0M64 92c9-3 18-3 27 0" fill="none" stroke="#b9684f" stroke-width="3" stroke-linecap="round" opacity=".7"/>
          </g>
          <g class="vulcan-right-pair">
            <rect x="119" y="22" width="33" height="160" rx="16.5" fill="url(#vfsSkinLight)" stroke="#8d513f" stroke-width="3" transform="rotate(2 135.5 170)"/>
            <rect x="148" y="39" width="31" height="143" rx="15.5" fill="url(#vfsSkinLight)" stroke="#8d513f" stroke-width="3" transform="rotate(5 163.5 170)"/>
            <path d="M122 82c10-3 20-3 30 0M151 96c9-3 18-3 27 0" fill="none" stroke="#b9684f" stroke-width="3" stroke-linecap="round" opacity=".7"/>
          </g>
          <path d="M49 153c0-22 18-40 40-40h63c25 0 45 20 45 45v67c0 42-34 76-76 76h-6c-38 0-69-31-69-69z" fill="url(#vfsSkin)" stroke="#8d513f" stroke-width="4"/>
          <g class="vulcan-thumb"><path d="M164 162c15-13 28-31 42-42 9-7 22-5 28 5 5 9 2 20-6 27l-44 43c-10 10-27 10-37 0-8-9-5-23 17-33z" fill="url(#vfsSkinLight)" stroke="#8d513f" stroke-width="4"/></g>
          <path d="M72 188c20-23 50-29 79-16M75 220c26-18 59-17 86 2M101 163c-2 41 7 76 26 103M136 164c0 33 8 62 24 87" fill="none" stroke="#a95e4c" stroke-width="4" stroke-linecap="round" opacity=".55"/>
          <path d="M59 168c28 8 53 7 75-3" fill="none" stroke="#ffd8bd" stroke-width="4" stroke-linecap="round" opacity=".3"/>
        </svg>
        <span class="vulcan-footer-caption">Live Long &amp; Prosper</span>
      </span>
    </button>
    <div class="vulcan-footer-message" role="status"><strong>ASTRALIS BLESSING</strong>Peace and long life from the Astralis frontier. 🖖</div>
  `;

  document.body.appendChild(section);

  const button = section.querySelector(".vulcan-footer-button");
  const message = section.querySelector(".vulcan-footer-message");
  let hideTimer;
  button.addEventListener("click", () => {
    message.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => message.classList.remove("show"), 4600);
  });
})();