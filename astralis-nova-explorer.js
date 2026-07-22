(() => {
  "use strict";

  if (document.getElementById("astralisNovaExplorer")) return;

  const style = document.createElement("style");
  style.id = "astralisNovaExplorerStyles";
  style.textContent = `
    .nova-explorer{
      position:fixed;
      z-index:34;
      left:-280px;
      top:17vh;
      width:clamp(108px,11vw,176px);
      padding:0;
      border:0;
      background:transparent;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      opacity:.94;
      filter:drop-shadow(0 5px 8px rgba(0,0,0,.42)) drop-shadow(0 0 12px rgba(112,202,255,.3));
      animation:novaExplorerFlight 82s linear infinite;
      will-change:left,top,transform,opacity,filter;
    }
    .nova-explorer img{display:block;width:100%;height:auto;pointer-events:none;transform:none;transform-origin:center;transition:filter .22s ease,transform .22s ease}
    .nova-explorer:hover img,.nova-explorer:focus-visible img{transform:scale(1.08);filter:brightness(1.18) saturate(1.16)}
    .nova-explorer:focus-visible{outline:2px solid #8de8ff;outline-offset:5px;border-radius:999px}
    .nova-explorer-warp{
      position:fixed;
      z-index:33;
      width:214px;
      height:6px;
      pointer-events:none;
      border-radius:999px;
      opacity:0;
      background:linear-gradient(90deg,transparent,rgba(91,191,255,.16),rgba(223,252,255,.92));
      filter:blur(3px);
      transform-origin:right center;
    }
    .nova-explorer.warping{animation-duration:5.1s!important;filter:drop-shadow(0 0 14px rgba(125,228,255,.62)) brightness(1.25)}
    .nova-explorer.warping + .nova-explorer-warp{opacity:.82;animation:novaWarpTrail .9s ease-in-out infinite alternate}
    .nova-explorer-signal{
      position:fixed;
      z-index:80;
      max-width:min(360px,calc(100vw - 28px));
      padding:13px 16px;
      border:1px solid rgba(113,206,255,.58);
      border-radius:14px;
      background:radial-gradient(circle at 10% 20%,rgba(47,165,255,.14),transparent 35%),rgba(3,12,23,.96);
      color:#e4f4ff;
      box-shadow:0 16px 42px rgba(0,0,0,.46),0 0 25px rgba(69,154,255,.12);
      font-size:.85rem;
      line-height:1.5;
      pointer-events:none;
      opacity:0;
      transform:translateY(8px) scale(.98);
      transition:opacity .2s ease,transform .2s ease;
    }
    .nova-explorer-signal.show{opacity:1;transform:none}
    .nova-explorer-signal strong{display:block;margin-bottom:3px;color:#91eaff;letter-spacing:.045em}
    @keyframes novaExplorerFlight{
      0%{left:-280px;top:16vh;transform:rotate(-2deg) scale(.72);opacity:0}
      4%{opacity:.92}
      18%{top:27vh;transform:rotate(1deg) scale(.86)}
      34%{top:12vh;transform:rotate(-1deg) scale(1)}
      52%{top:46vh;transform:rotate(3deg) scale(.92)}
      69%{top:30vh;transform:rotate(-2deg) scale(1.03)}
      84%{top:56vh;transform:rotate(2deg) scale(.86);opacity:.9}
      100%{left:calc(100vw + 290px);top:18vh;transform:rotate(0deg) scale(.72);opacity:0}
    }
    @keyframes novaWarpTrail{from{transform:scaleX(.55);opacity:.35}to{transform:scaleX(1.25);opacity:.94}}
    @media(max-width:700px){.nova-explorer{width:120px;animation-duration:98s;opacity:.8}.nova-explorer-warp{width:138px}}
    @media(prefers-reduced-motion:reduce){.nova-explorer,.nova-explorer-warp{display:none}}
  `;
  document.head.appendChild(style);

  const ship = document.createElement("button");
  ship.id = "astralisNovaExplorer";
  ship.className = "nova-explorer";
  ship.type = "button";
  ship.setAttribute("aria-label", "Astralis Nova classic explorer starship");
  ship.innerHTML = '<img src="/astralis-nova-explorer-classic.svg?v=20260722b" alt="">';

  const trail = document.createElement("span");
  trail.className = "nova-explorer-warp";
  trail.setAttribute("aria-hidden", "true");

  const signal = document.createElement("div");
  signal.className = "nova-explorer-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>NXS ASTRALIS · EXPLORER CLASS</strong>Classic deep-space cruiser online. Star charts aligned. Imagination drive holding steady. ✦';

  document.body.append(ship, trail, signal);

  let hideTimer;
  let warpTimer;

  const positionTrail = () => {
    const rect = ship.getBoundingClientRect();
    trail.style.left = `${rect.left - trail.offsetWidth + 30}px`;
    trail.style.top = `${rect.top + rect.height * .52}px`;
  };

  const flightFrame = () => {
    if (ship.isConnected) {
      positionTrail();
      requestAnimationFrame(flightFrame);
    }
  };
  requestAnimationFrame(flightFrame);

  ship.addEventListener("click", () => {
    const rect = ship.getBoundingClientRect();
    const left = Math.min(window.innerWidth - signal.offsetWidth - 14, Math.max(14, rect.left));
    const top = Math.min(window.innerHeight - 112, Math.max(14, rect.bottom + 10));
    signal.style.left = `${left}px`;
    signal.style.top = `${top}px`;
    signal.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => signal.classList.remove("show"), 4200);
  });

  const scheduleWarp = () => {
    clearTimeout(warpTimer);
    warpTimer = setTimeout(() => {
      ship.classList.add("warping");
      setTimeout(() => ship.classList.remove("warping"), 4900);
      scheduleWarp();
    }, 28000 + Math.random() * 26000);
  };
  scheduleWarp();

  ship.addEventListener("animationiteration", () => {
    const durations = [74, 82, 90, 98];
    ship.style.animationDuration = `${durations[Math.floor(Math.random() * durations.length)]}s`;
  });
})();
