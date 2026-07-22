(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed;
      right:16px;
      bottom:92px;
      z-index:99999;
      width:clamp(190px,17vw,250px);
      padding:0;
      border:0;
      background:transparent;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      isolation:isolate;
      filter:drop-shadow(0 18px 30px rgba(0,0,0,.54));
      animation:vulcanFloat 6.5s ease-in-out infinite;
    }
    .vulcan-tech-frame{
      position:relative;
      display:block;
      width:100%;
      aspect-ratio:300 / 418;
      overflow:visible;
      transform-style:preserve-3d;
    }
    .vulcan-tech-frame::before{
      content:"";
      position:absolute;
      z-index:0;
      inset:11% -7% 17%;
      border-radius:50%;
      background:
        radial-gradient(circle,rgba(105,226,255,.2),transparent 42%),
        radial-gradient(circle,rgba(157,83,255,.16),transparent 68%);
      box-shadow:0 0 45px rgba(75,179,255,.19),inset 0 0 40px rgba(139,96,255,.14);
      animation:vulcanCorePulse 4.2s ease-in-out infinite;
    }
    .vulcan-real-hand{
      position:absolute;
      z-index:5;
      inset:0;
      width:100%;
      height:100%;
      object-fit:contain;
      object-position:center;
      pointer-events:none;
      transform-origin:50% 72%;
      filter:drop-shadow(0 0 9px rgba(90,224,255,.48)) drop-shadow(0 0 18px rgba(164,94,255,.3));
      animation:vulcanHandBreath 5.2s ease-in-out infinite;
    }
    .vulcan-ring{
      position:absolute;
      z-index:2;
      left:50%;
      top:43%;
      translate:-50% -50%;
      border-radius:50%;
      pointer-events:none;
      filter:drop-shadow(0 0 7px rgba(102,219,255,.62));
    }
    .vulcan-ring.outer{
      width:92%;
      aspect-ratio:1;
      background:repeating-conic-gradient(from 5deg,rgba(126,233,255,.95) 0 1.4deg,transparent 1.4deg 9deg);
      -webkit-mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      animation:vulcanClockwise 13s linear infinite;
    }
    .vulcan-ring.middle{
      width:78%;
      aspect-ratio:1;
      border:2px dashed rgba(191,121,255,.62);
      box-shadow:0 0 18px rgba(153,92,255,.18),inset 0 0 17px rgba(90,216,255,.13);
      animation:vulcanCounter 8.5s linear infinite;
    }
    .vulcan-ring.inner{
      width:63%;
      aspect-ratio:1;
      background:conic-gradient(from 20deg,transparent,rgba(93,225,255,.74),transparent 26%,rgba(190,106,255,.66),transparent 61%);
      -webkit-mask:radial-gradient(circle,transparent 73%,#000 74% 79%,transparent 80%);
      mask:radial-gradient(circle,transparent 73%,#000 74% 79%,transparent 80%);
      animation:vulcanClockwise 5.6s linear infinite;
    }
    .vulcan-crosshair{
      position:absolute;
      z-index:1;
      left:50%;
      top:43%;
      translate:-50% -50%;
      width:88%;
      aspect-ratio:1;
      border-radius:50%;
      background:
        linear-gradient(90deg,transparent 49.7%,rgba(142,233,255,.3) 49.8% 50.2%,transparent 50.3%),
        linear-gradient(transparent 49.7%,rgba(142,233,255,.3) 49.8% 50.2%,transparent 50.3%);
      opacity:.64;
      animation:vulcanCrosshair 4.6s ease-in-out infinite;
    }
    .vulcan-orbit{
      position:absolute;
      z-index:7;
      left:50%;
      top:43%;
      translate:-50% -50%;
      width:94%;
      aspect-ratio:1;
      border-radius:50%;
      pointer-events:none;
      animation:vulcanClockwise 7.4s linear infinite;
    }
    .vulcan-orbit.reverse{animation:vulcanCounter 11.3s linear infinite}
    .vulcan-orbit i{
      position:absolute;
      width:7px;
      height:7px;
      border-radius:50%;
      background:#fff;
      box-shadow:0 0 5px #fff,0 0 14px #67e5ff,0 0 26px rgba(170,89,255,.94);
    }
    .vulcan-orbit i:nth-child(1){left:2%;top:48%}
    .vulcan-orbit i:nth-child(2){right:10%;top:12%;width:5px;height:5px}
    .vulcan-orbit i:nth-child(3){right:0;bottom:30%;width:6px;height:6px}
    .vulcan-scan{
      position:absolute;
      z-index:8;
      left:7%;
      right:7%;
      top:7%;
      height:10%;
      border-radius:50%;
      background:linear-gradient(180deg,transparent,rgba(204,249,255,.82),rgba(135,91,255,.56),transparent);
      filter:blur(1.5px) drop-shadow(0 0 9px rgba(100,225,255,.8));
      opacity:0;
      pointer-events:none;
      mix-blend-mode:screen;
      animation:vulcanScan 4.2s linear infinite;
    }
    .vulcan-sweep{
      position:absolute;
      z-index:3;
      left:50%;
      top:43%;
      width:86%;
      aspect-ratio:1;
      translate:-50% -50%;
      border-radius:50%;
      background:conic-gradient(from 0deg,transparent 0 76%,rgba(110,225,255,.12) 83%,rgba(185,111,255,.28) 88%,transparent 94%);
      animation:vulcanClockwise 4.8s linear infinite;
      pointer-events:none;
    }
    .vulcan-corner{
      position:absolute;
      z-index:9;
      width:24px;
      height:24px;
      border-color:rgba(124,229,255,.74);
      filter:drop-shadow(0 0 5px rgba(99,219,255,.62));
      pointer-events:none;
    }
    .vulcan-corner.tl{left:3%;top:18%;border-left:2px solid;border-top:2px solid}
    .vulcan-corner.tr{right:3%;top:18%;border-right:2px solid;border-top:2px solid}
    .vulcan-corner.bl{left:3%;bottom:18%;border-left:2px solid;border-bottom:2px solid}
    .vulcan-corner.br{right:3%;bottom:18%;border-right:2px solid;border-bottom:2px solid}
    .vulcan-status-line{
      position:absolute;
      z-index:10;
      left:8%;
      right:8%;
      bottom:3%;
      display:flex;
      align-items:center;
      gap:8px;
      color:#ddf8ff;
      font:700 .48rem/1.2 system-ui,sans-serif;
      letter-spacing:.16em;
      text-transform:uppercase;
      text-shadow:0 0 10px rgba(100,219,255,.7);
      white-space:nowrap;
    }
    .vulcan-status-line::before,.vulcan-status-line::after{
      content:"";
      height:1px;
      flex:1;
      background:linear-gradient(90deg,transparent,rgba(110,229,255,.86));
      box-shadow:0 0 8px rgba(100,219,255,.62);
    }
    .vulcan-status-line::after{transform:scaleX(-1)}
    .vulcan-blessing:hover .vulcan-real-hand,
    .vulcan-blessing:focus-visible .vulcan-real-hand,
    .vulcan-blessing.energized .vulcan-real-hand{
      filter:drop-shadow(0 0 13px rgba(110,238,255,.84)) drop-shadow(0 0 30px rgba(174,91,255,.52)) brightness(1.08);
    }
    .vulcan-blessing:hover .vulcan-ring.outer,
    .vulcan-blessing:focus-visible .vulcan-ring.outer,
    .vulcan-blessing.energized .vulcan-ring.outer{animation-duration:2.8s}
    .vulcan-blessing:hover .vulcan-ring.middle,
    .vulcan-blessing:focus-visible .vulcan-ring.middle,
    .vulcan-blessing.energized .vulcan-ring.middle{animation-duration:2.2s}
    .vulcan-blessing.energized::after{
      content:"";
      position:absolute;
      z-index:-1;
      left:50%;
      top:43%;
      width:86%;
      aspect-ratio:1;
      border:2px solid rgba(134,235,255,.82);
      border-radius:50%;
      translate:-50% -50%;
      animation:vulcanEnergyBurst 1.25s ease-out 2;
      pointer-events:none;
    }
    .vulcan-blessing:focus-visible{outline:2px solid #8de8ff;outline-offset:5px;border-radius:28px}
    .vulcan-blessing-signal{
      position:fixed;
      z-index:100000;
      max-width:min(400px,calc(100vw - 28px));
      padding:13px 15px 13px 18px;
      border:1px solid rgba(105,220,255,.64);
      border-radius:14px;
      background:linear-gradient(110deg,rgba(80,204,255,.09),transparent 28%,rgba(152,92,255,.09)),rgba(2,10,23,.97);
      color:#eaf8ff;
      box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 28px rgba(78,180,255,.17);
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
    .vulcan-blessing-signal strong{display:block;margin-bottom:5px;color:#94edff;letter-spacing:.07em}
    .vulcan-blessing-signal .vulcan-readout{display:block;margin-top:7px;color:#b8c9ff;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}
    @keyframes vulcanFloat{0%,100%{transform:translateY(0) rotate(-.35deg)}50%{transform:translateY(-8px) rotate(.45deg)}}
    @keyframes vulcanCorePulse{0%,100%{transform:scale(.96);opacity:.58}50%{transform:scale(1.05);opacity:1}}
    @keyframes vulcanClockwise{to{rotate:360deg}}
    @keyframes vulcanCounter{to{rotate:-360deg}}
    @keyframes vulcanCrosshair{0%,100%{opacity:.36;transform:scale(.97)}50%{opacity:.78;transform:scale(1.04)}}
    @keyframes vulcanHandBreath{0%,100%{transform:scale(.985) translateY(1px)}50%{transform:scale(1.025) translateY(-3px)}}
    @keyframes vulcanScan{0%{transform:translateY(-20px);opacity:0}12%{opacity:.9}72%{opacity:.74}100%{transform:translateY(320px);opacity:0}}
    @keyframes vulcanEnergyBurst{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.55);opacity:0}}
    @media(max-width:700px){
      .vulcan-blessing{right:8px;bottom:78px;width:152px}
      .vulcan-status-line{font-size:.38rem;letter-spacing:.1em}
      .vulcan-blessing-signal{max-width:min(300px,calc(100vw - 24px))}
    }
    @media(prefers-reduced-motion:reduce){
      .vulcan-blessing,.vulcan-tech-frame::before,.vulcan-real-hand,.vulcan-ring,.vulcan-crosshair,.vulcan-orbit,.vulcan-scan,.vulcan-sweep{animation:none!important}
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
      <span class="vulcan-ring outer" aria-hidden="true"></span>
      <span class="vulcan-ring middle" aria-hidden="true"></span>
      <span class="vulcan-ring inner" aria-hidden="true"></span>
      <span class="vulcan-crosshair" aria-hidden="true"></span>
      <span class="vulcan-sweep" aria-hidden="true"></span>
      <span class="vulcan-orbit" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="vulcan-orbit reverse" aria-hidden="true"><i></i><i></i><i></i></span>
      <img class="vulcan-real-hand" src="/vulcan-salute-realistic.webp?v=20260722a" alt="">
      <span class="vulcan-scan" aria-hidden="true"></span>
      <span class="vulcan-corner tl" aria-hidden="true"></span>
      <span class="vulcan-corner tr" aria-hidden="true"></span>
      <span class="vulcan-corner bl" aria-hidden="true"></span>
      <span class="vulcan-corner br" aria-hidden="true"></span>
      <span class="vulcan-status-line">Vulcan salute · online</span>
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
    widget.classList.remove("energized");
    void widget.offsetWidth;
    widget.classList.add("energized");

    clearTimeout(hideTimer);
    clearTimeout(energyTimer);
    hideTimer = setTimeout(() => signal.classList.remove("show"), 5200);
    energyTimer = setTimeout(() => widget.classList.remove("energized"), 2900);
  });
})();
