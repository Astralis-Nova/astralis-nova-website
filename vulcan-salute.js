(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed;
      right:16px;
      bottom:104px;
      z-index:99999;
      width:clamp(158px,15vw,220px);
      padding:0;
      border:0;
      background:transparent;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      animation:vulcanFloat 6.8s ease-in-out infinite;
      filter:drop-shadow(0 16px 26px rgba(0,0,0,.52));
      isolation:isolate;
    }
    .vulcan-tech-frame{
      position:relative;
      display:grid;
      place-items:center;
      aspect-ratio:1 / 1.22;
      transform-style:preserve-3d;
    }
    .vulcan-core-glow{
      position:absolute;
      inset:12% 5% 23%;
      border-radius:50%;
      background:
        radial-gradient(circle at 50% 46%,rgba(104,222,255,.25),transparent 38%),
        radial-gradient(circle at 50% 54%,rgba(149,94,255,.2),transparent 62%);
      box-shadow:inset 0 0 42px rgba(92,202,255,.18),0 0 38px rgba(109,87,255,.16);
      animation:vulcanCorePulse 4.2s ease-in-out infinite;
    }
    .vulcan-ring{
      position:absolute;
      border-radius:50%;
      pointer-events:none;
      opacity:.88;
      filter:drop-shadow(0 0 8px rgba(98,215,255,.42));
    }
    .vulcan-ring.outer{
      inset:12% 3% 26%;
      background:repeating-conic-gradient(from 12deg,rgba(120,229,255,.9) 0 1deg,transparent 1deg 9deg);
      -webkit-mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      animation:vulcanClockwise 15s linear infinite;
    }
    .vulcan-ring.middle{
      inset:18% 9% 31%;
      border:1px dashed rgba(187,121,255,.58);
      box-shadow:inset 0 0 18px rgba(114,214,255,.12),0 0 16px rgba(167,99,255,.13);
      animation:vulcanCounter 10s linear infinite;
    }
    .vulcan-ring.inner{
      inset:25% 16% 37%;
      background:conic-gradient(from 90deg,transparent,rgba(107,225,255,.52),transparent 28%,rgba(184,113,255,.48),transparent 64%);
      -webkit-mask:radial-gradient(circle,transparent 73%,#000 74% 78%,transparent 79%);
      mask:radial-gradient(circle,transparent 73%,#000 74% 78%,transparent 79%);
      animation:vulcanClockwise 6.6s linear infinite;
    }
    .vulcan-hud-crosshair{
      position:absolute;
      inset:15% 6% 28%;
      border-radius:50%;
      background:
        linear-gradient(90deg,transparent 49.6%,rgba(139,231,255,.24) 49.8% 50.2%,transparent 50.4%),
        linear-gradient(transparent 49.6%,rgba(139,231,255,.24) 49.8% 50.2%,transparent 50.4%);
      opacity:.58;
      animation:vulcanCrosshair 5s ease-in-out infinite;
    }
    .vulcan-orbit{
      position:absolute;
      z-index:5;
      inset:12% 2% 27%;
      border-radius:50%;
      animation:vulcanOrbit 8.8s linear infinite;
      pointer-events:none;
    }
    .vulcan-orbit.reverse{animation-direction:reverse;animation-duration:12.8s;transform:rotate(48deg)}
    .vulcan-orbit span{
      position:absolute;
      width:6px;
      height:6px;
      border-radius:50%;
      background:#effdff;
      box-shadow:0 0 5px #fff,0 0 14px #62dcff,0 0 22px rgba(157,99,255,.78);
    }
    .vulcan-orbit span:nth-child(1){left:2%;top:48%}
    .vulcan-orbit span:nth-child(2){right:8%;top:17%;width:4px;height:4px}
    .vulcan-orbit span:nth-child(3){right:1%;bottom:29%;width:5px;height:5px}
    .vulcan-hand-svg{
      position:relative;
      z-index:4;
      width:78%;
      height:auto;
      overflow:visible;
      transform-origin:50% 78%;
      animation:vulcanHandPulse 4.8s ease-in-out infinite;
      filter:drop-shadow(0 0 12px rgba(82,204,255,.38)) drop-shadow(0 0 22px rgba(145,93,255,.2));
    }
    .vulcan-hand-svg .vulcan-circuit{animation:vulcanCircuitFlicker 3.2s ease-in-out infinite}
    .vulcan-hand-svg .vulcan-circuit:nth-of-type(2){animation-delay:.7s}
    .vulcan-hand-svg .vulcan-circuit:nth-of-type(3){animation-delay:1.4s}
    .vulcan-hand-svg .vulcan-scan-band{animation:vulcanScanBand 3.8s linear infinite}
    .vulcan-data-row{
      position:absolute;
      z-index:7;
      left:4%;
      right:4%;
      bottom:5%;
      display:flex;
      align-items:center;
      gap:7px;
      color:#c8f4ff;
      font:600 .5rem/1.2 system-ui,sans-serif;
      letter-spacing:.15em;
      text-transform:uppercase;
      text-shadow:0 0 9px rgba(95,213,255,.5);
      white-space:nowrap;
    }
    .vulcan-data-row::before,.vulcan-data-row::after{
      content:"";
      height:1px;
      flex:1;
      background:linear-gradient(90deg,transparent,rgba(112,226,255,.72));
      box-shadow:0 0 8px rgba(92,213,255,.52);
    }
    .vulcan-data-row::after{transform:scaleX(-1)}
    .vulcan-blessing:hover .vulcan-hand-svg,
    .vulcan-blessing:focus-visible .vulcan-hand-svg,
    .vulcan-blessing.energized .vulcan-hand-svg{
      filter:drop-shadow(0 0 15px rgba(101,226,255,.72)) drop-shadow(0 0 30px rgba(160,94,255,.42));
    }
    .vulcan-blessing:hover .vulcan-ring.outer,
    .vulcan-blessing:focus-visible .vulcan-ring.outer,
    .vulcan-blessing.energized .vulcan-ring.outer{animation-duration:3.2s}
    .vulcan-blessing:hover .vulcan-ring.middle,
    .vulcan-blessing:focus-visible .vulcan-ring.middle,
    .vulcan-blessing.energized .vulcan-ring.middle{animation-duration:2.6s}
    .vulcan-blessing:focus-visible{
      outline:2px solid #8de8ff;
      outline-offset:5px;
      border-radius:28px;
    }
    .vulcan-blessing-signal{
      position:fixed;
      z-index:100000;
      max-width:min(390px,calc(100vw - 28px));
      padding:13px 15px 13px 17px;
      border:1px solid rgba(105,220,255,.62);
      border-radius:14px;
      background:
        linear-gradient(110deg,rgba(80,204,255,.08),transparent 28%,rgba(152,92,255,.08)),
        rgba(2,10,23,.97);
      color:#eaf8ff;
      box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 28px rgba(78,180,255,.16);
      font-size:.85rem;
      line-height:1.5;
      opacity:0;
      pointer-events:none;
      transform:translateY(8px) scale(.98);
      transition:opacity .22s ease,transform .22s ease;
      overflow:hidden;
    }
    .vulcan-blessing-signal::before{
      content:"";
      position:absolute;
      inset:0 auto 0 0;
      width:3px;
      background:linear-gradient(#7eeaff,#9e72ff,#7eeaff);
      box-shadow:0 0 12px rgba(116,222,255,.75);
    }
    .vulcan-blessing-signal.show{opacity:1;transform:none}
    .vulcan-blessing-signal strong{
      display:block;
      margin-bottom:5px;
      color:#94edff;
      letter-spacing:.07em;
    }
    .vulcan-blessing-signal .vulcan-readout{
      display:block;
      margin-top:7px;
      color:#b8c9ff;
      font-size:.72rem;
      letter-spacing:.08em;
      text-transform:uppercase;
    }
    @keyframes vulcanFloat{
      0%,100%{transform:translateY(0) rotate(-.4deg)}
      50%{transform:translateY(-8px) rotate(.5deg)}
    }
    @keyframes vulcanCorePulse{
      0%,100%{transform:scale(.96);opacity:.66}
      50%{transform:scale(1.04);opacity:1}
    }
    @keyframes vulcanClockwise{to{transform:rotate(360deg)}}
    @keyframes vulcanCounter{to{transform:rotate(-360deg)}}
    @keyframes vulcanOrbit{to{transform:rotate(360deg)}}
    @keyframes vulcanCrosshair{
      0%,100%{opacity:.34;transform:scale(.98)}
      50%{opacity:.72;transform:scale(1.03)}
    }
    @keyframes vulcanHandPulse{
      0%,100%{transform:scale(.985);opacity:.94}
      50%{transform:scale(1.025);opacity:1}
    }
    @keyframes vulcanCircuitFlicker{
      0%,100%{opacity:.35}
      50%{opacity:1}
    }
    @keyframes vulcanScanBand{
      0%{transform:translateY(-220px);opacity:0}
      12%{opacity:.8}
      68%{opacity:.72}
      100%{transform:translateY(690px);opacity:0}
    }
    @media(max-width:700px){
      .vulcan-blessing{right:9px;bottom:82px;width:136px}
      .vulcan-data-row{font-size:.41rem;letter-spacing:.09em}
      .vulcan-blessing-signal{max-width:min(300px,calc(100vw - 24px))}
    }
    @media(prefers-reduced-motion:reduce){
      .vulcan-blessing,.vulcan-core-glow,.vulcan-ring,.vulcan-hud-crosshair,
      .vulcan-orbit,.vulcan-hand-svg,.vulcan-circuit,.vulcan-scan-band{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement("button");
  widget.id = "astralisVulcanBlessing";
  widget.className = "vulcan-blessing";
  widget.type = "button";
  widget.setAttribute("aria-label", "Activate the Live Long and Prosper sci-fi blessing");
  widget.innerHTML = `
    <span class="vulcan-tech-frame">
      <span class="vulcan-core-glow" aria-hidden="true"></span>
      <span class="vulcan-ring outer" aria-hidden="true"></span>
      <span class="vulcan-ring middle" aria-hidden="true"></span>
      <span class="vulcan-ring inner" aria-hidden="true"></span>
      <span class="vulcan-hud-crosshair" aria-hidden="true"></span>
      <span class="vulcan-orbit" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="vulcan-orbit reverse" aria-hidden="true"><span></span><span></span><span></span></span>
      <svg class="vulcan-hand-svg" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Font Awesome Free 7.3.1 hand-spock, CC BY 4.0, Fonticons, Inc. -->
        <defs>
          <linearGradient id="vulcanHandFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffe2cf"/>
            <stop offset="38%" stop-color="#dda987"/>
            <stop offset="72%" stop-color="#bd7d73"/>
            <stop offset="100%" stop-color="#714d70"/>
          </linearGradient>
          <linearGradient id="vulcanEdgeGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#dffcff"/>
            <stop offset="48%" stop-color="#64ddff"/>
            <stop offset="100%" stop-color="#b27aff"/>
          </linearGradient>
          <linearGradient id="vulcanScanFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7de8ff" stop-opacity="0"/>
            <stop offset="48%" stop-color="#eaffff" stop-opacity=".74"/>
            <stop offset="52%" stop-color="#9b78ff" stop-opacity=".58"/>
            <stop offset="100%" stop-color="#7de8ff" stop-opacity="0"/>
          </linearGradient>
          <filter id="vulcanSvgGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <path id="vulcanHandShape" d="M138.3 80.8c-9.2-33.8 10.5-68.8 44.3-78.4 34-9.6 69.4 10.2 79 44.2L291.9 153.7 305.1 84c6.6-34.7 40.1-57.5 74.8-50.9 31.4 6 53 33.9 52 64.9 10-2.6 20.8-2.8 31.5-.1 34.3 8.6 55.1 43.3 46.6 77.6L454.7 397.2C437.8 464.7 377.2 512 307.6 512l-33.7 0c-56.9 0-112.2-19-157.2-53.9l-92-71.6c-27.9-21.7-32.9-61.9-11.2-89.8s61.9-32.9 89.8-11.2l17 13.2-51.8-131.2c-13-32.9 3.2-70.1 36-83 11.1-4.4 22.7-5.4 33.7-3.7zm77.1-21.2c-2.4-8.5-11.2-13.4-19.7-11s-13.4 11.2-11 19.7l54.8 182.4c3.5 12.3-3.3 25.2-15.4 29.3s-25.3-2-30-13.9L142.9 138.1c-3.2-8.2-12.5-12.3-20.8-9s-12.3 12.5-9 20.8l73.3 185.6c12 30.3-23.7 57-49.4 37L73.8 323.4c-7-5.4-17-4.2-22.5 2.8s-4.2 17 2.8 22.5l92 71.6c36.5 28.4 81.4 43.8 127.7 43.8l33.7 0c47.5 0 89-32.4 100.5-78.5l55.4-221.6c2.1-8.6-3.1-17.3-11.6-19.4s-17.3 3.1-19.4 11.6l-26 104c-2.9 11.7-13.4 19.9-25.5 19.9-16.5 0-28.9-15-25.8-31.2L383.7 99c1.7-8.7-4-17.1-12.7-18.7S354 84.3 352.3 93L320.5 260c-2.2 11.6-12.4 20-24.2 20-11 0-20.7-7.3-23.7-17.9L215.4 59.6z"/>
          <clipPath id="vulcanHandClip"><use href="#vulcanHandShape"/></clipPath>
        </defs>
        <use href="#vulcanHandShape" fill="url(#vulcanHandFill)" stroke="url(#vulcanEdgeGlow)" stroke-width="7" stroke-linejoin="round" filter="url(#vulcanSvgGlow)"/>
        <g clip-path="url(#vulcanHandClip)" fill="none" stroke="url(#vulcanEdgeGlow)" stroke-linecap="round">
          <path class="vulcan-circuit" d="M78 337h74l24-25h76l31 31h96" stroke-width="3"/>
          <path class="vulcan-circuit" d="M155 405h54l23-23h85l28 28h55" stroke-width="2.6"/>
          <path class="vulcan-circuit" d="M181 143v62l29 30v61M325 118v74l-25 26v64" stroke-width="2.4"/>
          <circle class="vulcan-circuit" cx="176" cy="312" r="7" stroke-width="3"/>
          <circle class="vulcan-circuit" cx="283" cy="343" r="6" stroke-width="2.5"/>
          <circle class="vulcan-circuit" cx="209" cy="405" r="5" stroke-width="2.2"/>
          <rect class="vulcan-scan-band" x="-30" y="-90" width="580" height="120" fill="url(#vulcanScanFill)" stroke="none"/>
        </g>
        <path d="M111 350c48 35 92 53 147 61 51 8 99 1 141-22" fill="none" stroke="#fff" stroke-opacity=".23" stroke-width="5" stroke-linecap="round"/>
      </svg>
      <span class="vulcan-data-row">Live Long · Prosper</span>
    </span>
  `;

  const signal = document.createElement("div");
  signal.className = "vulcan-blessing-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>VULCAN BLESSING · SYSTEM ONLINE</strong>Peace and long life from the Astralis frontier. Live long and prosper. 🖖<span class="vulcan-readout">Biometric salute recognized · harmony field stable</span>';

  document.body.append(widget, signal);

  let hideTimer;
  let energyTimer;

  widget.addEventListener("click", () => {
    const rect = widget.getBoundingClientRect();
    const left = Math.min(window.innerWidth - signal.offsetWidth - 12, Math.max(12, rect.right - signal.offsetWidth));
    const top = Math.max(12, rect.top - signal.offsetHeight - 12);

    signal.style.left = `${left}px`;
    signal.style.top = `${top}px`;
    signal.classList.add("show");
    widget.classList.add("energized");

    clearTimeout(hideTimer);
    clearTimeout(energyTimer);
    hideTimer = setTimeout(() => signal.classList.remove("show"), 5200);
    energyTimer = setTimeout(() => widget.classList.remove("energized"), 2700);
  });
})();