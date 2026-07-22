(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed;
      right:18px;
      bottom:102px;
      z-index:37;
      width:clamp(118px,12vw,180px);
      padding:0;
      border:0;
      background:transparent;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      filter:drop-shadow(0 10px 18px rgba(5,14,34,.42));
      animation:vulcanFloat 6.6s ease-in-out infinite;
    }
    .vulcan-shell{position:relative;display:grid;justify-items:center;gap:8px}
    .vulcan-aura{
      position:relative;
      width:100%;
      aspect-ratio:1 / 1.1;
      display:grid;
      place-items:center;
      border-radius:999px;
      background:
        radial-gradient(circle at 50% 38%,rgba(157,220,255,.26),transparent 35%),
        radial-gradient(circle at 50% 60%,rgba(175,118,255,.16),transparent 54%),
        radial-gradient(circle at 50% 50%,rgba(6,13,28,.92),rgba(1,4,12,.22) 72%,transparent 80%);
      box-shadow:inset 0 0 24px rgba(129,208,255,.15),0 0 34px rgba(84,154,255,.16);
      overflow:hidden;
    }
    .vulcan-aura::before{
      content:"";
      position:absolute;
      inset:10%;
      border-radius:50%;
      border:1px solid rgba(140,220,255,.18);
      box-shadow:0 0 18px rgba(121,190,255,.14),inset 0 0 20px rgba(164,115,255,.1);
      animation:vulcanPulse 4.8s ease-in-out infinite;
    }
    .vulcan-aura::after{
      content:"";
      position:absolute;
      inset:22%;
      border-radius:50%;
      background:radial-gradient(circle,rgba(117,232,255,.14),transparent 68%);
      filter:blur(10px);
      animation:vulcanPulse 5.8s ease-in-out infinite reverse;
    }
    .vulcan-salute-art{
      position:relative;
      z-index:2;
      width:86%;
      height:auto;
      overflow:visible;
      transform-origin:50% 88%;
      animation:vulcanHandBreath 5.5s ease-in-out infinite;
    }
    .vulcan-salute-art .energy-line{animation:vulcanEnergy 2.8s ease-in-out infinite}
    .vulcan-salute-art .highlight-spark{animation:vulcanSpark 3.1s ease-in-out infinite;transform-origin:center}
    .vulcan-stars{position:absolute;inset:0;pointer-events:none;z-index:1}
    .vulcan-stars span{
      position:absolute;
      width:5px;
      height:5px;
      border-radius:50%;
      background:#dff8ff;
      box-shadow:0 0 8px rgba(173,238,255,.92);
      animation:vulcanTwinkle 3.5s ease-in-out infinite;
    }
    .vulcan-stars span:nth-child(1){top:18%;left:20%;animation-delay:.2s}
    .vulcan-stars span:nth-child(2){top:28%;right:21%;animation-delay:1.1s}
    .vulcan-stars span:nth-child(3){bottom:26%;left:18%;animation-delay:1.9s}
    .vulcan-stars span:nth-child(4){bottom:18%;right:22%;animation-delay:.8s}
    .vulcan-stars span:nth-child(5){top:50%;left:10%;animation-delay:2.4s}
    .vulcan-stars span:nth-child(6){top:54%;right:10%;animation-delay:1.6s}
    .vulcan-caption{
      display:block;
      padding:4px 10px 0;
      color:#dff5ff;
      font-size:.66rem;
      letter-spacing:.2em;
      text-transform:uppercase;
      text-align:center;
      text-shadow:0 0 12px rgba(111,208,255,.26);
      opacity:.92;
    }
    .vulcan-blessing:hover .vulcan-caption,.vulcan-blessing:focus-visible .vulcan-caption{color:#fff}
    .vulcan-blessing:hover .vulcan-aura,.vulcan-blessing:focus-visible .vulcan-aura{
      box-shadow:inset 0 0 28px rgba(129,208,255,.24),0 0 42px rgba(84,154,255,.28);
    }
    .vulcan-blessing:focus-visible{outline:2px solid #8de8ff;outline-offset:5px;border-radius:24px}
    .vulcan-blessing-signal{
      position:fixed;
      right:18px;
      bottom:286px;
      z-index:81;
      max-width:min(360px,calc(100vw - 28px));
      padding:12px 14px;
      border:1px solid rgba(113,206,255,.52);
      border-radius:14px;
      background:radial-gradient(circle at 10% 20%,rgba(47,165,255,.14),transparent 35%),rgba(3,12,23,.96);
      color:#e4f4ff;
      box-shadow:0 16px 42px rgba(0,0,0,.46),0 0 25px rgba(69,154,255,.12);
      font-size:.84rem;
      line-height:1.5;
      opacity:0;
      pointer-events:none;
      transform:translateY(8px) scale(.98);
      transition:opacity .22s ease,transform .22s ease;
    }
    .vulcan-blessing-signal.show{opacity:1;transform:none}
    .vulcan-blessing-signal strong{display:block;margin-bottom:5px;color:#91eaff;letter-spacing:.05em}
    .vulcan-blessing-signal span{display:block;color:#f3f8ff}
    @keyframes vulcanFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes vulcanPulse{0%,100%{transform:scale(.98);opacity:.76}50%{transform:scale(1.04);opacity:1}}
    @keyframes vulcanHandBreath{0%,100%{transform:scale(.985) rotate(-1deg)}50%{transform:scale(1.02) rotate(1deg)}}
    @keyframes vulcanEnergy{0%,100%{opacity:.55}50%{opacity:1}}
    @keyframes vulcanSpark{0%,100%{opacity:.38;transform:scale(.88)}50%{opacity:1;transform:scale(1.12)}}
    @keyframes vulcanTwinkle{0%,100%{opacity:.28;transform:scale(.8)}50%{opacity:1;transform:scale(1.4)}}
    @media(max-width:700px){
      .vulcan-blessing{right:12px;bottom:88px;width:104px}
      .vulcan-caption{font-size:.58rem;letter-spacing:.16em}
      .vulcan-blessing-signal{right:12px;bottom:230px;max-width:min(280px,calc(100vw - 24px))}
    }
    @media(prefers-reduced-motion:reduce){
      .vulcan-blessing,.vulcan-aura::before,.vulcan-aura::after,.vulcan-salute-art,.vulcan-salute-art .energy-line,.vulcan-salute-art .highlight-spark,.vulcan-stars span{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement("button");
  widget.id = "astralisVulcanBlessing";
  widget.className = "vulcan-blessing";
  widget.type = "button";
  widget.setAttribute("aria-label", "Live long and prosper hand blessing");
  widget.innerHTML = `
    <span class="vulcan-shell">
      <span class="vulcan-aura" aria-hidden="true">
        <span class="vulcan-stars"><span></span><span></span><span></span><span></span><span></span><span></span></span>
        <svg class="vulcan-salute-art" viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="vulcanPalm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f3d2bb"/><stop offset="38%" stop-color="#d9ab8c"/><stop offset="72%" stop-color="#b98367"/><stop offset="100%" stop-color="#976450"/>
            </linearGradient>
            <linearGradient id="vulcanShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f8dfcd" stop-opacity=".88"/><stop offset="100%" stop-color="#8f5a49" stop-opacity=".3"/>
            </linearGradient>
            <linearGradient id="vulcanGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#d8fbff"/><stop offset="50%" stop-color="#7ad8ff"/><stop offset="100%" stop-color="#987dff"/>
            </linearGradient>
            <filter id="vulcanBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
          </defs>
          <path class="highlight-spark" d="M110 14l5 9 10 1-7 7 2 10-10-5-9 5 2-10-7-7 10-1z" fill="url(#vulcanGlow)" opacity=".75" filter="url(#vulcanBlur)"/>
          <path class="energy-line" d="M71 24c9 14 11 32 10 47" fill="none" stroke="url(#vulcanGlow)" stroke-width="3" stroke-linecap="round" opacity=".7"/>
          <path class="energy-line" d="M150 24c-9 14-11 32-10 47" fill="none" stroke="url(#vulcanGlow)" stroke-width="3" stroke-linecap="round" opacity=".7"/>
          <g>
            <path d="M98 233c-7-15-11-34-8-56 2-19 8-37 17-53 5-9 11-17 17-24 6-7 15-12 27-12 10 0 20 4 27 10 5 4 8 9 11 14 3 4 8 6 12 5 5-1 10-6 11-13 1-7-1-12-4-17-5-8-13-16-25-22-15-7-34-11-54-11-20 0-40 4-57 13-18 9-31 20-39 34-9 15-12 32-10 49 1 11 5 22 12 33 4 6 3 14-3 19l-11 11c-9 9-11 24-5 35l7 13c3 6 10 9 16 8l63-10z" fill="url(#vulcanPalm)" stroke="#875847" stroke-width="4"/>
            <path d="M80 71c-5-27 3-52 15-62 8-8 19-9 27-2 7 6 10 17 10 31v75c0 12-9 22-20 22s-20-10-20-22z" fill="url(#vulcanPalm)" stroke="#875847" stroke-width="4"/>
            <path d="M128 74c-4-27 4-54 17-64 8-6 18-6 25 0 7 6 11 18 11 33v72c0 13-9 24-21 24s-21-11-21-24z" fill="url(#vulcanPalm)" stroke="#875847" stroke-width="4"/>
            <path d="M54 92c-6-24-4-47 6-60 7-8 17-11 25-7 9 4 14 15 16 30l7 69c1 6-1 13-5 18-4 5-10 8-16 8-10 0-18-7-20-17z" fill="url(#vulcanPalm)" stroke="#875847" stroke-width="4"/>
            <path d="M159 101c-3-21 1-43 10-56 6-8 14-12 22-10 11 3 18 16 18 34l1 60c0 14-9 25-21 25-11 0-20-8-21-19z" fill="url(#vulcanPalm)" stroke="#875847" stroke-width="4"/>
            <path d="M132 120c-4 19-11 37-21 51M91 118c5 19 11 35 20 50M62 118c6 13 15 24 28 33M169 122c-4 11-10 20-18 28" fill="none" stroke="#8c5948" stroke-width="4" stroke-linecap="round"/>
            <path d="M64 169c11 4 24 3 36-2M130 174c10 3 21 2 31-2" fill="none" stroke="#8c5948" stroke-width="4" stroke-linecap="round" opacity=".66"/>
            <path d="M50 148c-16 16-28 35-34 56" fill="none" stroke="#8c5948" stroke-width="10" stroke-linecap="round"/>
            <path d="M24 205c15 7 32 12 53 13 18 1 35-1 50-6" fill="none" stroke="url(#vulcanShade)" stroke-width="10" stroke-linecap="round" opacity=".75"/>
            <path d="M96 165c-5 18-3 45 8 71" fill="none" stroke="#8b5946" stroke-width="12" stroke-linecap="round"/>
            <path d="M108 236c7-18 10-39 10-60" fill="none" stroke="#f5dbc6" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
          </g>
        </svg>
      </span>
      <span class="vulcan-caption">Live Long and Prosper</span>
    </span>
  `;

  const signal = document.createElement("div");
  signal.className = "vulcan-blessing-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>VULCAN BLESSING ONLINE</strong><span>Peace and long life from the Astralis frontier. Live long and prosper. 🖖</span>';

  document.body.append(widget, signal);

  let hideTimer;
  widget.addEventListener("click", () => {
    const rect = widget.getBoundingClientRect();
    const left = Math.min(window.innerWidth - signal.offsetWidth - 12, Math.max(12, rect.right - signal.offsetWidth));
    const top = Math.max(12, rect.top - signal.offsetHeight - 12);
    signal.style.left = `${left}px`;
    signal.style.top = `${top}px`;
    signal.style.right = "auto";
    signal.style.bottom = "auto";
    signal.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => signal.classList.remove("show"), 4600);
  });
})();