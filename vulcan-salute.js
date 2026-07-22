(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed!important;
      right:16px!important;
      bottom:92px!important;
      z-index:99999!important;
      width:clamp(190px,17vw,250px)!important;
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
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
    }
    .vulcan-tech-frame::before{
      content:"";
      position:absolute;
      z-index:0;
      left:50%;
      top:42%;
      width:92%;
      aspect-ratio:1;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:radial-gradient(circle,rgba(105,226,255,.24),transparent 42%),radial-gradient(circle,rgba(157,83,255,.2),transparent 68%);
      box-shadow:0 0 48px rgba(75,179,255,.24),inset 0 0 44px rgba(139,96,255,.17);
      animation:vulcanCorePulse 4.2s ease-in-out infinite;
    }
    .vulcan-ring{
      position:absolute;
      z-index:2;
      left:50%;
      top:42%;
      transform:translate(-50%,-50%);
      border-radius:50%;
      pointer-events:none;
      filter:drop-shadow(0 0 8px rgba(102,219,255,.65));
    }
    .vulcan-ring.outer{
      width:96%;
      aspect-ratio:1;
      background:repeating-conic-gradient(from 5deg,rgba(126,233,255,.96) 0 1.5deg,transparent 1.5deg 8.5deg);
      -webkit-mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      mask:radial-gradient(circle,transparent 65%,#000 66% 69%,transparent 70%);
      animation:vulcanClockwise 13s linear infinite;
    }
    .vulcan-ring.middle{
      width:82%;
      aspect-ratio:1;
      border:2px dashed rgba(191,121,255,.72);
      box-shadow:0 0 19px rgba(153,92,255,.2),inset 0 0 18px rgba(90,216,255,.15);
      animation:vulcanCounter 8.5s linear infinite;
    }
    .vulcan-ring.inner{
      width:66%;
      aspect-ratio:1;
      background:conic-gradient(from 20deg,transparent,rgba(93,225,255,.78),transparent 26%,rgba(190,106,255,.72),transparent 61%);
      -webkit-mask:radial-gradient(circle,transparent 73%,#000 74% 79%,transparent 80%);
      mask:radial-gradient(circle,transparent 73%,#000 74% 79%,transparent 80%);
      animation:vulcanClockwise 5.6s linear infinite;
    }
    .vulcan-crosshair{
      position:absolute;
      z-index:1;
      left:50%;
      top:42%;
      width:91%;
      aspect-ratio:1;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:linear-gradient(90deg,transparent 49.7%,rgba(142,233,255,.34) 49.8% 50.2%,transparent 50.3%),linear-gradient(transparent 49.7%,rgba(142,233,255,.34) 49.8% 50.2%,transparent 50.3%);
      opacity:.68;
      animation:vulcanCrosshair 4.6s ease-in-out infinite;
    }
    .vulcan-sweep{
      position:absolute;
      z-index:3;
      left:50%;
      top:42%;
      width:89%;
      aspect-ratio:1;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:conic-gradient(from 0deg,transparent 0 76%,rgba(110,225,255,.14) 83%,rgba(185,111,255,.34) 88%,transparent 94%);
      animation:vulcanClockwise 4.8s linear infinite;
      pointer-events:none;
    }
    .vulcan-hand-stage{
      position:absolute;
      z-index:6;
      inset:0;
      display:grid;
      place-items:center;
      pointer-events:none;
      transform-origin:50% 72%;
      animation:vulcanHandBreath 5.2s ease-in-out infinite;
    }
    .vulcan-hand-fallback{
      position:absolute;
      z-index:1;
      width:70%;
      color:#e7b59b;
      filter:drop-shadow(0 0 10px rgba(90,224,255,.72)) drop-shadow(0 0 22px rgba(164,94,255,.44));
      opacity:1;
      transition:opacity .25s ease;
    }
    .vulcan-hand-fallback svg{display:block;width:100%;height:auto;overflow:visible}
    .vulcan-real-hand{
      position:absolute!important;
      z-index:2!important;
      inset:0!important;
      display:block!important;
      visibility:visible!important;
      opacity:0!important;
      width:100%!important;
      height:100%!important;
      max-width:none!important;
      object-fit:contain!important;
      object-position:center!important;
      mix-blend-mode:normal!important;
      filter:drop-shadow(0 0 10px rgba(90,224,255,.52)) drop-shadow(0 0 22px rgba(164,94,255,.34));
      transition:opacity .3s ease,filter .25s ease;
    }
    .vulcan-hand-stage.hand-loaded .vulcan-real-hand{opacity:1!important}
    .vulcan-hand-stage.hand-loaded .vulcan-hand-fallback{opacity:0}
    .vulcan-orbit{
      position:absolute;
      z-index:8;
      left:50%;
      top:42%;
      width:98%;
      aspect-ratio:1;
      transform:translate(-50%,-50%);
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
      z-index:9;
      left:7%;
      right:7%;
      top:5%;
      height:10%;
      border-radius:50%;
      background:linear-gradient(180deg,transparent,rgba(204,249,255,.86),rgba(135,91,255,.64),transparent);
      filter:blur(1.5px) drop-shadow(0 0 10px rgba(100,225,255,.84));
      opacity:0;
      pointer-events:none;
      mix-blend-mode:screen;
      animation:vulcanScan 4.2s linear infinite;
    }
    .vulcan-corner{
      position:absolute;
      z-index:10;
      width:24px;
      height:24px;
      border-color:rgba(124,229,255,.82);
      filter:drop-shadow(0 0 6px rgba(99,219,255,.7));
      pointer-events:none;
    }
    .vulcan-corner.tl{left:2%;top:17%;border-left:2px solid;border-top:2px solid}
    .vulcan-corner.tr{right:2%;top:17%;border-right:2px solid;border-top:2px solid}
    .vulcan-corner.bl{left:2%;bottom:17%;border-left:2px solid;border-bottom:2px solid}
    .vulcan-corner.br{right:2%;bottom:17%;border-right:2px solid;border-bottom:2px solid}
    .vulcan-status-line{
      position:absolute;
      z-index:11;
      left:8%;
      right:8%;
      bottom:2%;
      display:flex;
      align-items:center;
      gap:8px;
      color:#ddf8ff;
      font:700 .5rem/1.2 system-ui,sans-serif;
      letter-spacing:.16em;
      text-transform:uppercase;
      text-shadow:0 0 10px rgba(100,219,255,.72);
      white-space:nowrap;
    }
    .vulcan-status-line::before,.vulcan-status-line::after{
      content:"";
      height:1px;
      flex:1;
      background:linear-gradient(90deg,transparent,rgba(110,229,255,.9));
      box-shadow:0 0 8px rgba(100,219,255,.66);
    }
    .vulcan-status-line::after{transform:scaleX(-1)}
    .vulcan-blessing:hover .vulcan-real-hand,
    .vulcan-blessing:focus-visible .vulcan-real-hand,
    .vulcan-blessing.energized .vulcan-real-hand{
      filter:drop-shadow(0 0 14px rgba(110,238,255,.88)) drop-shadow(0 0 32px rgba(174,91,255,.56)) brightness(1.1);
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
      top:42%;
      width:88%;
      aspect-ratio:1;
      border:2px solid rgba(134,235,255,.86);
      border-radius:50%;
      transform:translate(-50%,-50%) scale(.6);
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
    @keyframes vulcanCorePulse{0%,100%{transform:translate(-50%,-50%) scale(.96);opacity:.58}50%{transform:translate(-50%,-50%) scale(1.05);opacity:1}}
    @keyframes vulcanClockwise{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes vulcanCounter{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
    @keyframes vulcanCrosshair{0%,100%{opacity:.36;transform:translate(-50%,-50%) scale(.97)}50%{opacity:.78;transform:translate(-50%,-50%) scale(1.04)}}
    @keyframes vulcanHandBreath{0%,100%{transform:scale(.985) translateY(1px)}50%{transform:scale(1.025) translateY(-3px)}}
    @keyframes vulcanScan{0%{transform:translateY(-18px);opacity:0}12%{opacity:.92}72%{opacity:.78}100%{transform:translateY(320px);opacity:0}}
    @keyframes vulcanEnergyBurst{0%{transform:translate(-50%,-50%) scale(.6);opacity:.95}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}
    @media(max-width:700px){
      .vulcan-blessing{right:8px!important;bottom:78px!important;width:152px!important}
      .vulcan-status-line{font-size:.38rem;letter-spacing:.1em}
      .vulcan-blessing-signal{max-width:min(300px,calc(100vw - 24px))}
    }
    @media(prefers-reduced-motion:reduce){
      .vulcan-blessing,.vulcan-tech-frame::before,.vulcan-hand-stage,.vulcan-ring,.vulcan-crosshair,.vulcan-orbit,.vulcan-scan,.vulcan-sweep{animation:none!important}
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
      <span class="vulcan-hand-stage" aria-hidden="true">
        <span class="vulcan-hand-fallback">
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" stroke="#78e8ff" stroke-width="7" d="M138.3 80.8c-9.2-33.8 10.5-68.8 44.3-78.4 34-9.6 69.4 10.2 79 44.2L291.9 153.7 305.1 84c6.6-34.7 40.1-57.5 74.8-50.9 31.4 6 53 33.9 52 64.9 10-2.6 20.8-2.8 31.5-.1 34.3 8.6 55.1 43.3 46.6 77.6L454.7 397.2C437.8 464.7 377.2 512 307.6 512h-33.7c-56.9 0-112.2-19-157.2-53.9l-92-71.6c-27.9-21.7-32.9-61.9-11.2-89.8s61.9-32.9 89.8-11.2l17 13.2-51.8-131.2c-13-32.9 3.2-70.1 36-83 11.1-4.4 22.7-5.4 33.7-3.7z"/>
          </svg>
        </span>
        <img class="vulcan-real-hand" alt="">
      </span>
      <span class="vulcan-orbit" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="vulcan-orbit reverse" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="vulcan-scan" aria-hidden="true"></span>
      <span class="vulcan-corner tl" aria-hidden="true"></span>
      <span class="vulcan-corner tr" aria-hidden="true"></span>
      <span class="vulcan-corner bl" aria-hidden="true"></span>
      <span class="vulcan-corner br" aria-hidden="true"></span>
      <span class="vulcan-status-line">Vulcan salute · online</span>
    </span>
  `;

  const handStage = widget.querySelector(".vulcan-hand-stage");
  const hand = widget.querySelector(".vulcan-real-hand");
  hand.addEventListener("load", () => handStage.classList.add("hand-loaded"), { once: true });
  hand.src = "/vulcan-salute-realistic.webp?v=20260722c";

  const signal = document.createElement("div");
  signal.className = "vulcan-blessing-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>VULCAN BLESSING · SYSTEM ONLINE</strong>Peace and long life from the Astralis frontier. Live long and prosper. 🖖<span class="vulcan-readout">Visual core verified · harmony field stable</span>';

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
