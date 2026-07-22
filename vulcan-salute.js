(() => {
  "use strict";

  if (document.getElementById("astralisVulcanBlessing")) return;

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-blessing{
      position:fixed!important;
      right:14px!important;
      bottom:142px!important;
      z-index:99999!important;
      width:clamp(142px,14vw,210px)!important;
      padding:0!important;
      border:0!important;
      background:transparent!important;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
      filter:drop-shadow(0 12px 24px rgba(0,0,0,.55)) drop-shadow(0 0 22px rgba(83,155,255,.32));
      animation:vulcanRealFloat 6.4s ease-in-out infinite;
    }
    .vulcan-real-shell{position:relative;display:grid;justify-items:center;gap:4px;isolation:isolate}
    .vulcan-real-aura{
      position:absolute;
      z-index:-1;
      inset:8% 7% 13%;
      border-radius:50%;
      background:radial-gradient(circle at 50% 54%,rgba(114,220,255,.24),transparent 46%),radial-gradient(circle at 50% 58%,rgba(148,94,255,.18),transparent 68%);
      box-shadow:0 0 34px rgba(77,166,255,.22),inset 0 0 26px rgba(140,221,255,.12);
      animation:vulcanRealPulse 4.2s ease-in-out infinite;
    }
    .vulcan-real-photo{display:block;width:100%;height:auto;pointer-events:none;transform-origin:50% 85%;transition:filter .24s ease,transform .24s ease}
    .vulcan-blessing:hover .vulcan-real-photo,.vulcan-blessing:focus-visible .vulcan-real-photo{transform:scale(1.045);filter:brightness(1.08) saturate(1.08)}
    .vulcan-real-caption{
      display:block;
      margin-top:-9px;
      padding:4px 10px 5px;
      border-radius:999px;
      background:rgba(3,12,23,.72);
      color:#eaf9ff;
      font-size:.66rem;
      font-weight:700;
      letter-spacing:.15em;
      line-height:1.35;
      text-align:center;
      text-transform:uppercase;
      text-shadow:0 0 12px rgba(111,208,255,.38);
      box-shadow:0 0 18px rgba(69,154,255,.14);
      white-space:nowrap;
    }
    .vulcan-real-spark{position:absolute;width:6px;height:6px;border-radius:50%;background:#e8fbff;box-shadow:0 0 10px #8de8ff;pointer-events:none;animation:vulcanRealTwinkle 3.1s ease-in-out infinite}
    .vulcan-real-spark.s1{top:18%;left:11%;animation-delay:.3s}
    .vulcan-real-spark.s2{top:27%;right:8%;animation-delay:1.2s}
    .vulcan-real-spark.s3{bottom:22%;left:7%;animation-delay:2.1s}
    .vulcan-real-spark.s4{bottom:18%;right:12%;animation-delay:.8s}
    .vulcan-blessing:focus-visible{outline:2px solid #8de8ff;outline-offset:5px;border-radius:28px}
    .vulcan-real-signal{
      position:fixed;
      z-index:100000;
      max-width:min(360px,calc(100vw - 24px));
      padding:12px 14px;
      border:1px solid rgba(113,206,255,.56);
      border-radius:14px;
      background:radial-gradient(circle at 10% 20%,rgba(47,165,255,.16),transparent 35%),rgba(3,12,23,.97);
      color:#e4f4ff;
      box-shadow:0 16px 42px rgba(0,0,0,.5),0 0 28px rgba(69,154,255,.16);
      font-size:.85rem;
      line-height:1.5;
      pointer-events:none;
      opacity:0;
      transform:translateY(8px) scale(.98);
      transition:opacity .22s ease,transform .22s ease;
    }
    .vulcan-real-signal.show{opacity:1;transform:none}
    .vulcan-real-signal strong{display:block;margin-bottom:5px;color:#91eaff;letter-spacing:.05em}
    @keyframes vulcanRealFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes vulcanRealPulse{0%,100%{transform:scale(.96);opacity:.72}50%{transform:scale(1.06);opacity:1}}
    @keyframes vulcanRealTwinkle{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.45)}}
    @media(max-width:700px){.vulcan-blessing{right:8px!important;bottom:126px!important;width:138px!important}.vulcan-real-caption{font-size:.56rem;letter-spacing:.11em}}
    @media(prefers-reduced-motion:reduce){.vulcan-blessing,.vulcan-real-aura,.vulcan-real-spark{animation:none!important}}
  `;
  document.head.appendChild(style);

  const widget = document.createElement("button");
  widget.id = "astralisVulcanBlessing";
  widget.className = "vulcan-blessing";
  widget.type = "button";
  widget.setAttribute("aria-label", "Live long and prosper Vulcan salute");
  widget.innerHTML = `
    <span class="vulcan-real-shell">
      <span class="vulcan-real-aura" aria-hidden="true"></span>
      <span class="vulcan-real-spark s1" aria-hidden="true"></span>
      <span class="vulcan-real-spark s2" aria-hidden="true"></span>
      <span class="vulcan-real-spark s3" aria-hidden="true"></span>
      <span class="vulcan-real-spark s4" aria-hidden="true"></span>
      <img class="vulcan-real-photo" src="/vulcan-salute-realistic.svg?v=20260722a" alt="">
      <span class="vulcan-real-caption">Live Long and Prosper</span>
    </span>
  `;

  const signal = document.createElement("div");
  signal.className = "vulcan-real-signal";
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