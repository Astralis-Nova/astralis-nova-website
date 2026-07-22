(() => {
  "use strict";

  if (document.getElementById("astralisNovaExplorer")) return;

  const style = document.createElement("style");
  style.id = "astralisNovaExplorerStyles";
  style.textContent = `
    .nova-explorer{
      position:fixed;
      z-index:34;
      left:-260px;
      top:17vh;
      width:clamp(92px,10vw,158px);
      padding:0;
      border:0;
      background:transparent;
      appearance:none;
      cursor:pointer;
      pointer-events:auto;
      opacity:.92;
      filter:drop-shadow(0 5px 8px rgba(0,0,0,.42)) drop-shadow(0 0 10px rgba(90,192,255,.28));
      animation:novaExplorerFlight 76s linear infinite;
      will-change:left,top,transform,opacity,filter;
    }
    .nova-explorer img{display:block;width:100%;height:auto;pointer-events:none;transition:filter .22s ease,transform .22s ease}
    .nova-explorer:hover img,.nova-explorer:focus-visible img{transform:scale(1.08);filter:brightness(1.18) saturate(1.16)}
    .nova-explorer:focus-visible{outline:2px solid #8de8ff;outline-offset:5px;border-radius:999px}
    .nova-explorer-warp{
      position:fixed;
      z-index:33;
      width:190px;
      height:5px;
      pointer-events:none;
      border-radius:999px;
      opacity:0;
      background:linear-gradient(90deg,transparent,rgba(91,191,255,.26),rgba(223,252,255,.92));
      filter:blur(3px);
      transform-origin:right center;
    }
    .nova-explorer.warping{animation-duration:4.8s!important;filter:drop-shadow(0 0 14px rgba(125,228,255,.62)) brightness(1.25)}
    .nova-explorer.warping + .nova-explorer-warp{opacity:.78;animation:novaWarpTrail .9s ease-in-out infinite alternate}
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
      0%{left:-260px;top:17vh;transform:rotate(-5deg) scale(.72);opacity:0}
      4%{opacity:.9}
      18%{top:28vh;transform:rotate(2deg) scale(.86)}
      34%{top:12vh;transform:rotate(-2deg) scale(1)}
      52%{top:47vh;transform:rotate(5deg) scale(.9)}
      69%{top:31vh;transform:rotate(-3deg) scale(1.03)}
      84%{top:58vh;transform:rotate(4deg) scale(.84);opacity:.88}
      100%{left:calc(100vw + 270px);top:19vh;transform:rotate(0deg) scale(.72);opacity:0}
    }
    @keyframes novaWarpTrail{from{transform:scaleX(.55);opacity:.35}to{transform:scaleX(1.25);opacity:.9}}
    @media(max-width:700px){.nova-explorer{width:105px;animation-duration:94s;opacity:.78}.nova-explorer-warp{width:125px}}
    @media(prefers-reduced-motion:reduce){.nova-explorer,.nova-explorer-warp{display:none}}
  `;
  document.head.appendChild(style);

  const ship = document.createElement("button");
  ship.id = "astralisNovaExplorer";
  ship.className = "nova-explorer";
  ship.type = "button";
  ship.setAttribute("aria-label", "Astralis Nova explorer starship");
  ship.innerHTML = '<img src="/astralis-nova-explorer.svg" alt="">';

  const trail = document.createElement("span");
  trail.className = "nova-explorer-warp";
  trail.setAttribute("aria-hidden", "true");

  const signal = document.createElement("div");
  signal.className = "nova-explorer-signal";
  signal.setAttribute("role", "status");
  signal.innerHTML = '<strong>NSS ASTRALIS · NX-27</strong>Exploration vessel online. Music charts loaded. Imagination drive holding steady. ✦';

  document.body.append(ship, trail, signal);

  let hideTimer;
  let warpTimer;

  const positionTrail = () => {
    const rect = ship.getBoundingClientRect();
    trail.style.left = `${rect.left - trail.offsetWidth + 25}px`;
    trail.style.top = `${rect.top + rect.height * .53}px`;
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
      setTimeout(() => ship.classList.remove("warping"), 4700);
      scheduleWarp();
    }, 28000 + Math.random() * 26000);
  };
  scheduleWarp();

  ship.addEventListener("animationiteration", () => {
    const durations = [70, 76, 84, 92];
    ship.style.animationDuration = `${durations[Math.floor(Math.random() * durations.length)]}s`;
  });
})();