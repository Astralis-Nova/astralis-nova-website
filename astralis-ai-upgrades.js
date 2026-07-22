(() => {
  "use strict";

  const ASSETS = {
    core: "/astralis-nova-core.svg",
    alien: "/astralis-ai-alien.svg",
    comet: "/astralis-comet-portal.svg",
    ocean: "/planet-ocean-real.svg",
    volcanic: "/planet-volcanic-real.svg",
    ice: "/planet-ice-real.svg",
    amethyst: "/planet-amethyst-real.svg",
    earth: "/astralis-earth.png",
    mars: "/astralis-mars.png",
    gas: "/astralis-gas-giant.png"
  };

  function installStyles() {
    if (document.getElementById("astralisAiUpgradeStyles")) return;
    const style = document.createElement("style");
    style.id = "astralisAiUpgradeStyles";
    style.textContent = `
      /* Astralis Nova AI visual upgrade */
      .astralis-worlds{isolation:isolate}
      .astralis-worlds::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(80,176,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(80,176,255,.035) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,transparent,black 20%,black 82%,transparent);opacity:.7}

      .astralis-sun-card.ai-nova-core{position:relative;justify-content:flex-start!important;gap:28px!important;min-height:196px!important;overflow:hidden;border-color:rgba(255,195,92,.56)!important;background:radial-gradient(circle at 18% 50%,rgba(255,142,60,.19),transparent 25rem),radial-gradient(circle at 82% 22%,rgba(88,95,255,.13),transparent 22rem),linear-gradient(125deg,rgba(7,15,31,.96),rgba(25,8,39,.94))!important;box-shadow:inset 0 0 40px rgba(255,98,108,.06),0 18px 52px rgba(0,0,0,.34),0 0 35px rgba(255,111,99,.08)!important}
      .astralis-sun-card.ai-nova-core::before{content:"";position:absolute;inset:-40% -20%;pointer-events:none;background:conic-gradient(from 0deg,transparent,rgba(102,213,255,.08),transparent 28%,rgba(255,98,190,.08),transparent 58%,rgba(255,207,91,.07),transparent);animation:novaScanner 18s linear infinite}
      .nova-core-visual{position:relative;z-index:1;flex:0 0 154px;width:154px;height:154px;display:grid;place-items:center;transform-style:preserve-3d;transition:transform .25s ease}
      .nova-core-visual>img{display:block;width:148px;height:148px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(255,190,80,.38)) drop-shadow(0 0 34px rgba(139,74,255,.23));animation:novaCoreBreathe 5.4s ease-in-out infinite}
      .nova-ai-node{position:absolute;width:8px;height:8px;border-radius:50%;background:#d8ffff;box-shadow:0 0 8px #7feeff,0 0 18px rgba(100,200,255,.8);animation:novaNodeOrbit 8s linear infinite}
      .nova-ai-node.n1{left:6px;top:74px;animation-delay:-1s}.nova-ai-node.n2{right:9px;top:28px;animation-delay:-3s}.nova-ai-node.n3{right:16px;bottom:18px;animation-delay:-5s}.nova-ai-node.n4{left:28px;bottom:7px;animation-delay:-7s}
      .nova-core-copy{position:relative;z-index:1;min-width:0;max-width:720px}
      .nova-core-kicker{display:inline-flex;align-items:center;gap:7px;margin-bottom:8px;padding:5px 9px;border:1px solid rgba(135,218,255,.34);border-radius:999px;color:#a7e9ff;background:rgba(8,31,55,.62);font-size:.68rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .nova-core-kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:#71ffd0;box-shadow:0 0 9px #71ffd0;animation:novaStatusPulse 2s ease-in-out infinite}
      .nova-core-copy strong{display:block!important;font-size:clamp(1.35rem,2vw,1.9rem)!important;letter-spacing:-.02em;background:linear-gradient(90deg,#fff8c8,#ffad65 38%,#ff72c7 68%,#8bdcff);-webkit-background-clip:text;background-clip:text;color:transparent!important;text-shadow:0 0 24px rgba(255,144,95,.12)}
      .nova-core-copy>span{display:block;margin-top:7px;color:#d1daea!important;line-height:1.55!important}
      .nova-core-status{display:flex;align-items:center;gap:8px;margin-top:12px;color:#8fb1cf;font:700 .73rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.035em}
      .nova-core-status::before{content:"AI";display:grid;place-items:center;width:25px;height:20px;border-radius:6px;background:linear-gradient(135deg,#168bff,#d82fa7);color:white;font-size:.62rem;box-shadow:0 0 12px rgba(86,147,255,.28)}

      #astralisBiographyPortal.ai-comet-portal{min-height:92px!important;background:radial-gradient(circle at 15% 50%,rgba(68,182,255,.16),transparent 35%),linear-gradient(110deg,rgba(7,24,45,.97),rgba(31,10,52,.94))!important}
      #astralisBiographyPortal.ai-comet-portal::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 0 28%,rgba(255,255,255,.05) 37%,transparent 47%);transform:translateX(-120%);animation:cometPortalSweep 7s ease-in-out infinite}
      .astralis-bio-comet.ai-comet-art{flex:0 0 94px!important;width:94px!important;height:66px!important;display:grid!important;place-items:center!important;animation:aiCometFloat 4.2s ease-in-out infinite!important}
      .astralis-bio-comet.ai-comet-art img{display:block;width:104px;height:66px;object-fit:contain;filter:drop-shadow(0 0 11px rgba(111,211,255,.48));transform:rotate(-5deg)}
      .astralis-bio-comet.ai-comet-art::before,.astralis-bio-comet.ai-comet-art::after{content:none!important}

      .relic-icon.ai-relic-icon{position:relative!important;width:62px!important;height:62px!important;flex:0 0 62px!important;overflow:visible!important}
      .ai-planet-shell{position:relative;display:grid;width:60px;height:60px;place-items:center;isolation:isolate}
      .ai-planet-shell::before{content:"";position:absolute;inset:3px;border:1px solid rgba(128,210,255,.36);border-radius:50%;transform:rotate(-18deg) scaleX(1.18);box-shadow:0 0 9px rgba(90,170,255,.16);animation:relicOrbitRing 9s linear infinite}
      .ai-planet-shell::after{content:"";position:absolute;width:5px;height:5px;border-radius:50%;right:1px;top:25px;background:#dfffff;box-shadow:0 0 8px #8beaff,0 0 14px rgba(116,218,255,.8);animation:relicSatellite 4.8s ease-in-out infinite}
      .ai-planet-shell img{position:relative;z-index:1;display:block!important;width:54px!important;height:54px!important;object-fit:contain!important;background:transparent!important;mix-blend-mode:normal!important;filter:drop-shadow(0 0 8px rgba(95,168,255,.26))!important;animation:aiPlanetDrift 6.4s ease-in-out infinite!important}
      .relic-link-card:nth-child(2n) .ai-planet-shell img{animation-delay:-2s!important}.relic-link-card:nth-child(3n) .ai-planet-shell img{animation-delay:-4s!important}
      .relic-link-card:hover .ai-planet-shell{transform:scale(1.08)}
      .relic-link-card:hover .ai-planet-shell img{filter:drop-shadow(0 0 13px rgba(124,207,255,.52))!important}

      .martian-counter.ai-visitor-console{position:relative;overflow:hidden;border-color:rgba(91,255,196,.44)!important;background:radial-gradient(circle at 18% 20%,rgba(67,255,159,.14),transparent 29%),radial-gradient(circle at 90% 70%,rgba(69,119,255,.11),transparent 34%),linear-gradient(145deg,rgba(2,12,20,.99),rgba(0,4,8,.99))!important}
      .martian-counter.ai-visitor-console::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 7px,rgba(104,255,190,.025) 8px);animation:alienScan 8s linear infinite}
      .martian-head.ai-alien-mascot{position:relative!important;z-index:1;flex:0 0 74px!important;width:74px!important;height:70px!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;animation:alienHover 4.6s ease-in-out infinite!important}
      .martian-head.ai-alien-mascot::before,.martian-head.ai-alien-mascot::after{content:none!important}
      .martian-head.ai-alien-mascot img{display:block;width:74px;height:70px;object-fit:contain;filter:drop-shadow(0 0 9px rgba(86,255,175,.42))}
      .ai-alien-radar{position:absolute;inset:5px;border:1px solid rgba(100,255,198,.32);border-radius:50%;animation:alienRadar 3.2s ease-out infinite;pointer-events:none}
      .martian-counter.ai-visitor-console .martian-signal{position:relative;z-index:1}
      .martian-counter.ai-visitor-console .martian-signal strong{background:linear-gradient(90deg,#8dffbd,#82e8ff,#c697ff);-webkit-background-clip:text;background-clip:text;color:transparent!important}

      @keyframes novaScanner{to{transform:rotate(360deg)}}
      @keyframes novaCoreBreathe{0%,100%{transform:scale(.97) rotate(-1deg);filter:drop-shadow(0 0 15px rgba(255,190,80,.32)) drop-shadow(0 0 28px rgba(139,74,255,.2))}50%{transform:scale(1.035) rotate(1deg);filter:drop-shadow(0 0 25px rgba(255,190,80,.52)) drop-shadow(0 0 44px rgba(139,74,255,.3))}}
      @keyframes novaNodeOrbit{0%,100%{transform:translate(0,0) scale(.8);opacity:.55}50%{transform:translate(5px,-7px) scale(1.2);opacity:1}}
      @keyframes novaStatusPulse{0%,100%{opacity:.55;transform:scale(.86)}50%{opacity:1;transform:scale(1.08)}}
      @keyframes cometPortalSweep{0%,62%{transform:translateX(-120%)}85%,100%{transform:translateX(140%)}}
      @keyframes aiCometFloat{0%,100%{transform:translate(0,1px) rotate(-2deg)}50%{transform:translate(6px,-5px) rotate(2deg)}}
      @keyframes relicOrbitRing{to{transform:rotate(342deg) scaleX(1.18)}}
      @keyframes relicSatellite{0%,100%{transform:translate(0,0);opacity:.55}50%{transform:translate(-7px,-6px);opacity:1}}
      @keyframes aiPlanetDrift{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
      @keyframes alienHover{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-3px) rotate(1deg)}}
      @keyframes alienRadar{0%{transform:scale(.72);opacity:.7}100%{transform:scale(1.38);opacity:0}}
      @keyframes alienScan{to{background-position:0 160px}}

      @media(max-width:640px){
        .astralis-sun-card.ai-nova-core{align-items:flex-start!important;gap:15px!important;padding:18px!important}
        .nova-core-visual{flex-basis:104px;width:104px;height:104px}.nova-core-visual>img{width:102px;height:102px}
        .nova-ai-node{display:none}.nova-core-copy strong{font-size:1.18rem!important}.nova-core-status{font-size:.66rem}
        .relic-icon.ai-relic-icon{width:50px!important;height:50px!important;flex-basis:50px!important}.ai-planet-shell{width:48px;height:48px}.ai-planet-shell img{width:44px!important;height:44px!important}
        .martian-head.ai-alien-mascot,.martian-head.ai-alien-mascot img{width:58px!important;height:55px!important;flex-basis:58px!important}
      }
      @media(prefers-reduced-motion:reduce){.astralis-sun-card.ai-nova-core::before,.nova-core-visual>img,.nova-ai-node,#astralisBiographyPortal.ai-comet-portal::after,.astralis-bio-comet.ai-comet-art,.ai-planet-shell::before,.ai-planet-shell::after,.ai-planet-shell img,.martian-head.ai-alien-mascot,.ai-alien-radar,.martian-counter.ai-visitor-console::before{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function upgradeNovaCore() {
    const card = document.querySelector(".astralis-sun-card");
    if (!card || card.dataset.aiUpgraded === "true") return false;
    card.dataset.aiUpgraded = "true";
    card.classList.add("ai-nova-core");
    card.innerHTML = `
      <div class="nova-core-visual" aria-hidden="true">
        <img src="${ASSETS.core}" alt="">
        <span class="nova-ai-node n1"></span><span class="nova-ai-node n2"></span>
        <span class="nova-ai-node n3"></span><span class="nova-ai-node n4"></span>
      </div>
      <div class="nova-core-copy">
        <span class="nova-core-kicker">Central intelligence online</span>
        <strong>Astralis Nova Core</strong>
        <span>The central star where music, memory, Arizona night skies, old-web spirit, and imagination are fused into one living signal.</span>
        <small class="nova-core-status" aria-live="polite">Neural starlight synchronized.</small>
      </div>`;

    const visual = card.querySelector(".nova-core-visual");
    if (visual && matchMedia("(pointer:fine)").matches) {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        visual.style.transform = `perspective(500px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      card.addEventListener("pointerleave", () => { visual.style.transform = ""; });
    }

    const messages = [
      "Neural starlight synchronized.",
      "Twenty-seven songs mapped across the constellation.",
      "Creative signal stable. Imagination engines warm.",
      "Old-web memories preserved in the quantum archive."
    ];
    let messageIndex = 0;
    const status = card.querySelector(".nova-core-status");
    window.setInterval(() => {
      if (!status || !status.isConnected) return;
      messageIndex = (messageIndex + 1) % messages.length;
      status.textContent = messages[messageIndex];
    }, 9000);
    return true;
  }

  function upgradeCometPortal() {
    const portal = document.getElementById("astralisBiographyPortal");
    if (!portal || portal.dataset.aiComet === "true") return false;
    portal.dataset.aiComet = "true";
    portal.classList.add("ai-comet-portal");
    const comet = portal.querySelector(".astralis-bio-comet");
    if (comet) {
      comet.className = "astralis-bio-comet ai-comet-art";
      comet.innerHTML = `<img src="${ASSETS.comet}" alt="" aria-hidden="true">`;
    }
    const title = portal.querySelector(".astralis-bio-copy strong");
    const copy = portal.querySelector(".astralis-bio-copy small");
    if (title) title.textContent = "FOLLOW THE LIVING COMET";
    if (copy) copy.textContent = "Ride the luminous trail into the story of Ramon Bivens and Astralis Nova";
    return true;
  }

  function relicAssetFor(card, index) {
    const text = card?.textContent?.toLowerCase() || "";
    if (text.includes("flower")) return ASSETS.ocean;
    if (text.includes("unborn")) return ASSETS.amethyst;
    if (text.includes("river")) return ASSETS.ice;
    if (text.includes("magic")) return ASSETS.amethyst;
    if (text.includes("smile")) return ASSETS.volcanic;
    if (text.includes("cry")) return ASSETS.ice;
    if (text.includes("angels")) return ASSETS.earth;
    if (text.includes("orbit")) return ASSETS.gas;
    return [ASSETS.ocean, ASSETS.volcanic, ASSETS.ice, ASSETS.amethyst, ASSETS.earth, ASSETS.mars, ASSETS.gas][index % 7];
  }

  function upgradeRelicPlanets() {
    const icons = [...document.querySelectorAll(".relic-icon")];
    if (!icons.length) return false;
    icons.forEach((icon, index) => {
      if (icon.dataset.aiPlanet === "true") return;
      icon.dataset.aiPlanet = "true";
      icon.classList.add("ai-relic-icon");
      const card = icon.closest(".relic-link-card");
      const src = relicAssetFor(card, index);
      icon.innerHTML = `<span class="ai-planet-shell"><img src="${src}" alt="" aria-hidden="true" loading="lazy"></span>`;
    });
    return true;
  }

  function upgradeAlien() {
    const counter = document.querySelector(".martian-counter");
    const head = document.querySelector(".martian-head");
    if (!counter || !head || counter.dataset.aiAlien === "true") return false;
    counter.dataset.aiAlien = "true";
    counter.classList.add("ai-visitor-console");
    head.className = "martian-head ai-alien-mascot";
    head.innerHTML = `<img src="${ASSETS.alien}" alt="" aria-hidden="true"><span class="ai-alien-radar"></span>`;
    const label = counter.querySelector(".martian-signal strong");
    if (label) label.textContent = "Astralis AI Visitor Detector";
    const status = counter.querySelector(".martian-counter-status");
    if (status && /scanning/i.test(status.textContent)) status.textContent = "AI receiver scanning the cosmic neighborhood…";
    return true;
  }

  function applyAll() {
    installStyles();
    const results = [upgradeNovaCore(), upgradeCometPortal(), upgradeRelicPlanets(), upgradeAlien()];
    return results.every(Boolean);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll, { once: true });
  } else {
    applyAll();
  }

  const observer = new MutationObserver(() => {
    applyAll();
    if (document.querySelector(".astralis-sun-card.ai-nova-core") && document.querySelector("#astralisBiographyPortal.ai-comet-portal") && document.querySelector(".martian-counter.ai-visitor-console")) {
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 12000);
})();
