(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed!important;
      right:12px!important;
      bottom:96px!important;
      z-index:99999!important;
      width:clamp(138px,12vw,184px)!important;
      padding:0!important;
      border:0!important;
      background:transparent!important;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
      filter:drop-shadow(0 12px 24px rgba(0,0,0,.5)) drop-shadow(0 0 20px rgba(75,166,255,.28));
      animation:vulcanFloat 6.4s ease-in-out infinite;
    }
    .vulcan-shell{position:relative;display:grid;justify-items:center;isolation:isolate}
    .vulcan-orbit{
      position:absolute;
      inset:6% 3% 13%;
      border-radius:50%;
      border:2px solid rgba(142,225,255,.48);
      background:conic-gradient(from 20deg,transparent,rgba(103,224,255,.18),transparent 34%,rgba(175,109,255,.2),transparent 71%);
      box-shadow:0 0 20px rgba(85,203,255,.46),0 0 42px rgba(136,92,255,.26),inset 0 0 26px rgba(79,176,255,.2);
      animation:vulcanOrbit 10s linear infinite,vulcanPulse 4s ease-in-out infinite;
    }
    .vulcan-hand-svg{display:block;width:100%;height:auto;overflow:visible;position:relative;z-index:2}
    .vulcan-hand-svg .pair-left{transform-box:fill-box;transform-origin:72% 100%;animation:vulcanLeftPair 3.6s ease-in-out infinite}
    .vulcan-hand-svg .pair-center{transform-box:fill-box;transform-origin:50% 100%;animation:vulcanCenterPair 4s ease-in-out infinite}
    .vulcan-hand-svg .thumb-group{transform-box:fill-box;transform-origin:0% 82%;animation:vulcanThumb 3.2s ease-in-out infinite}
    .vulcan-hand-svg .hand-highlight{animation:vulcanHighlight 3.8s ease-in-out infinite}
    .vulcan-spark{position:absolute;z-index:4;width:5px;height:5px;border-radius:50%;background:#eaffff;box-shadow:0 0 10px #82e8ff;pointer-events:none;animation:vulcanSpark 3.1s ease-in-out infinite}
    .vulcan-spark.s1{top:18%;left:9%;animation-delay:.2s}.vulcan-spark.s2{top:26%;right:8%;animation-delay:1.1s}.vulcan-spark.s3{bottom:25%;left:7%;animation-delay:2s}.vulcan-spark.s4{bottom:17%;right:11%;animation-delay:.7s}
    .vulcan-caption{display:block;position:relative;z-index:6;margin-top:-12px;max-width:100%;padding:5px 9px 6px;border:1px solid rgba(122,208,255,.25);border-radius:999px;background:rgba(3,12,23,.86);color:#eefaff;font-size:.58rem;font-weight:800;letter-spacing:.12em;line-height:1.25;text-align:center;text-transform:uppercase;text-shadow:0 0 10px rgba(111,208,255,.42);box-shadow:0 0 18px rgba(69,154,255,.18);white-space:normal}
    .vulcan-blessing:hover .vulcan-hand-svg,.vulcan-blessing:focus-visible .vulcan-hand-svg{filter:brightness(1.07) saturate(1.06)}
    .vulcan-blessing:focus-visible{outline:2px solid #8de8ff;outline-offset:4px;border-radius:24px}
    .vulcan-signal{position:fixed;z-index:100000;max-width:min(340px,calc(100vw - 24px));padding:12px 14px;border:1px solid rgba(113,206,255,.56);border-radius:14px;background:radial-gradient(circle at 10% 20%,rgba(47,165,255,.16),transparent 35%),rgba(3,12,23,.97);color:#e4f4ff;box-shadow:0 16px 42px rgba(0,0,0,.5),0 0 28px rgba(69,154,255,.16);font-size:.84rem;line-height:1.5;pointer-events:none;opacity:0;transform:translateY(8px) scale(.98);transition:opacity .22s ease,transform .22s ease}
    .vulcan-signal.show{opacity:1;transform:none}.vulcan-signal strong{display:block;margin-bottom:5px;color:#91eaff;letter-spacing:.05em}
    @keyframes vulcanFloat{0%,100%{transform:translateY(0) rotate(-.35deg)}50%{transform:translateY(-6px) rotate(.35deg)}}
    @keyframes vulcanOrbit{to{transform:rotate(360deg)}}
    @keyframes vulcanPulse{0%,100%{opacity:.7;scale:.97}50%{opacity:1;scale:1.035}}
    @keyframes vulcanLeftPair{0%,100%{transform:rotate(-.8deg)}50%{transform:rotate(1.2deg) translateY(-1px)}}
    @keyframes vulcanCenterPair{0%,100%{transform:rotate(.45deg)}50%{transform:rotate(-.7deg) translateY(-1.4px)}}
    @keyframes vulcanThumb{0%,100%{transform:rotate(-.4deg)}50%{transform:rotate(2.4deg) translateX(1px)}}
    @keyframes vulcanHighlight{0%,100%{opacity:.35}50%{opacity:.72}}
    @keyframes vulcanSpark{0%,100%{opacity:.25;transform:scale(.78)}50%{opacity:1;transform:scale(1.45)}}
    @media(max-width:700px){.vulcan-blessing{right:7px!important;bottom:82px!important;width:116px!important}.vulcan-caption{margin-top:-9px;padding:4px 6px 5px;font-size:.47rem;letter-spacing:.09em}.vulcan-spark{width:4px;height:4px}}
    @media(prefers-reduced-motion:reduce){.vulcan-blessing,.vulcan-orbit,.vulcan-hand-svg .pair-left,.vulcan-hand-svg .pair-center,.vulcan-hand-svg .thumb-group,.vulcan-hand-svg .hand-highlight,.vulcan-spark{animation:none!important}}
  `;
  document.head.appendChild(style);

  const widget = document.createElement("button");
  widget.id = "astralisVulcanBlessing";
  widget.className = "vulcan-blessing";
  widget.type = "button";
  widget.setAttribute("aria-label", "Animated live long and prosper salute");
  widget.innerHTML = `
    <span class="vulcan-shell">
      <span class="vulcan-orbit" aria-hidden="true"></span>
      <span class="vulcan-spark s1" aria-hidden="true"></span>
      <span class="vulcan-spark s2" aria-hidden="true"></span>
      <span class="vulcan-spark s3" aria-hidden="true"></span>
      <span class="vulcan-spark s4" aria-hidden="true"></span>
      <svg class="vulcan-hand-svg" viewBox="0 0 240 330" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffd9c0"/>
            <stop offset="35%" stop-color="#e9b28f"/>
            <stop offset="72%" stop-color="#c88466"/>
            <stop offset="100%" stop-color="#985f4c"/>
          </linearGradient>
          <radialGradient id="palmGlow" cx="45%" cy="38%" r="70%">
            <stop offset="0%" stop-color="#ffe9d9" stop-opacity=".8"/>
            <stop offset="70%" stop-color="#d29576" stop-opacity=".12"/>
            <stop offset="100%" stop-color="#8d5545" stop-opacity="0"/>
          </radialGradient>
          <filter id="handShadow" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#12274f" flood-opacity=".42"/>
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#5bc9ff" flood-opacity=".28"/>
          </filter>
        </defs>
        <g filter="url(#handShadow)">
          <g class="pair-left">
            <rect x="38" y="54" width="31" height="130" rx="15.5" fill="url(#skin)" transform="rotate(-17 53.5 184)"/>
            <rect x="55" y="34" width="34" height="150" rx="17" fill="url(#skin)" transform="rotate(-12 72 184)"/>
            <path d="M43 82c8-4 15-4 22-1M62 67c8-4 16-3 23 0" fill="none" stroke="#9e624e" stroke-opacity=".48" stroke-width="2.2" stroke-linecap="round"/>
          </g>
          <g class="pair-center">
            <rect x="112" y="16" width="34" height="174" rx="17" fill="url(#skin)"/>
            <rect x="145" y="28" width="34" height="162" rx="17" fill="url(#skin)"/>
            <path d="M118 56c9-4 17-4 24 0M151 67c8-4 17-4 24 0" fill="none" stroke="#9e624e" stroke-opacity=".48" stroke-width="2.2" stroke-linecap="round"/>
          </g>
          <path d="M66 164c8-19 27-29 52-29h42c25 0 44 14 51 38 7 23 3 49-6 70l-20 47c-7 17-24 28-43 28H91c-20 0-37-12-45-30l-18-42c-9-22-11-47-4-69 6-17 21-27 42-13Z" fill="url(#skin)" stroke="#875443" stroke-width="3.5"/>
          <path d="M54 212c14-18 30-28 50-31 22-4 42 2 58 17M52 238c19-8 37-10 54-6 18 4 35 13 49 27M82 184c-6 23-5 46 3 69M132 181c2 17 8 32 19 46M171 190c-9 13-15 27-18 43" fill="none" stroke="#955c49" stroke-opacity=".58" stroke-width="3" stroke-linecap="round"/>
          <path class="hand-highlight" d="M76 160c14-12 31-17 50-17h31c20 0 34 8 42 22-19-5-38-6-57-3-23 3-45 13-66 29-7-9-7-20 0-31Z" fill="url(#palmGlow)"/>
          <g class="thumb-group">
            <path d="M169 213c14-20 31-39 47-45 11-4 21 1 24 10 4 10 0 20-10 28l-35 34c-9 9-21 8-28 0-7-8-6-18 2-27Z" fill="url(#skin)" stroke="#875443" stroke-width="3.5"/>
            <path d="M187 196c8-4 15-4 22-1" fill="none" stroke="#9e624e" stroke-opacity=".48" stroke-width="2.2" stroke-linecap="round"/>
          </g>
          <path d="M83 304c16 5 35 7 57 5 18-1 34-5 47-11" fill="none" stroke="#f2c5aa" stroke-opacity=".25" stroke-width="6" stroke-linecap="round"/>
        </g>
      </svg>
      <span class="vulcan-caption">Live Long &amp; Prosper</span>
    </span>
  `;

  const signal = document.createElement("div");
  signal.className = "vulcan-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>VULCAN BLESSING ONLINE</strong>Peace and long life from the Astralis frontier. Live long and prosper. 🖖';
  document.body.append(widget, signal);

  let hideTimer;
  widget.addEventListener("click", () => {
    const rect = widget.getBoundingClientRect();
    const left = Math.min(window.innerWidth - signal.offsetWidth - 12, Math.max(12, rect.right - signal.offsetWidth));
    const top = Math.max(12, rect.top - signal.offsetHeight - 12);
    signal.style.left = `${left}px`;
    signal.style.top = `${top}px`;
    signal.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => signal.classList.remove("show"), 4800);
  });
})();