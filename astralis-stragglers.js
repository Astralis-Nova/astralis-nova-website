(() => {
  "use strict";

  const ASSETS = {
    flower: "/planet-ocean-real.svg?v=20260722p",
    unborn: "/planet-lunar-real.svg?v=20260722p",
    river: "/planet-ice-real.svg?v=20260722p",
    magic: "/planet-amethyst-real.svg?v=20260722p",
    smile: "/planet-diamond-real.svg?v=20260722p",
    cry: "/planet-rogue-aurora.svg?v=20260722p",
    angels: "/astralis-earth.png",
    orbit: "/astralis-gas-giant.png"
  };

  function installStyles() {
    if (document.getElementById("astralisStragglerStyles")) return;
    const style = document.createElement("style");
    style.id = "astralisStragglerStyles";
    style.textContent = `
      .hero{overflow:hidden;isolation:isolate}
      .hero-inner{position:relative;z-index:3}
      .astralis-hero-galaxy{
        position:absolute;
        z-index:2;
        right:-2%;
        top:-8%;
        width:clamp(410px,50vw,790px);
        aspect-ratio:1;
        pointer-events:none;
        opacity:.9;
        mix-blend-mode:screen;
        filter:saturate(1.2) contrast(1.08) drop-shadow(0 0 34px rgba(116,142,255,.32)) drop-shadow(0 0 70px rgba(255,117,208,.12));
        transform-origin:50% 50%;
        animation:astralisGalaxyOrbit 42s linear infinite;
        will-change:transform;
      }
      .astralis-hero-galaxy img{
        display:block;
        width:100%;
        height:100%;
        object-fit:contain;
        background:transparent;
        transform-origin:50% 50%;
        animation:astralisGalaxyBreathe 8.5s ease-in-out infinite;
      }
      .astralis-hero-galaxy::before{content:none!important;display:none!important}
      .astralis-hero-galaxy::after{
        content:"";
        position:absolute;
        inset:24%;
        border-radius:50%;
        background:conic-gradient(from 10deg,transparent,rgba(126,218,255,.2),transparent 20%,rgba(255,132,219,.2),transparent 49%,rgba(255,228,141,.16),transparent 76%);
        filter:blur(10px);
        animation:astralisGalaxyCounterSpin 19s linear infinite;
      }

      .relic-icon.straggler-planet{overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important}
      .relic-icon.straggler-planet .ai-planet-shell{--ring:#8bdcff;--moon:#dfffff;--tilt:-18deg;--stretch:1.18;--orbit-speed:10s;position:relative;display:grid;place-items:center;background:transparent!important}
      .relic-icon.straggler-planet .ai-planet-shell::before{border-color:color-mix(in srgb,var(--ring) 62%,transparent)!important;box-shadow:0 0 10px color-mix(in srgb,var(--ring) 32%,transparent)!important;animation:stragglerOrbit var(--orbit-speed) linear infinite!important}
      .relic-icon.straggler-planet .ai-planet-shell::after{background:var(--moon)!important;box-shadow:0 0 8px var(--moon),0 0 15px color-mix(in srgb,var(--ring) 72%,transparent)!important;animation:stragglerMoon 5.4s ease-in-out infinite!important}
      .relic-icon.straggler-planet .ai-planet-shell img{display:block!important;background:transparent!important;mix-blend-mode:normal!important;filter:drop-shadow(0 0 9px color-mix(in srgb,var(--ring) 48%,transparent))!important}
      .relic-icon.straggler-planet .relic-v1{--ring:#5de7ff;--moon:#dfffff;--tilt:-24deg;--stretch:1.23;--orbit-speed:9s}
      .relic-icon.straggler-planet .relic-v2{--ring:#eef5ff;--moon:#adcbff;--tilt:22deg;--stretch:1.12;--orbit-speed:12s}
      .relic-icon.straggler-planet .relic-v3{--ring:#9eeaff;--moon:#fff;--tilt:-9deg;--stretch:1.28;--orbit-speed:11s}
      .relic-icon.straggler-planet .relic-v4{--ring:#df8cff;--moon:#ffb9f2;--tilt:31deg;--stretch:1.14;--orbit-speed:8.5s}
      .relic-icon.straggler-planet .relic-v5{--ring:#c2f0ff;--moon:#ffffff;--tilt:-33deg;--stretch:1.2;--orbit-speed:10.5s}
      .relic-icon.straggler-planet .relic-v6{--ring:#82fbff;--moon:#f7d8ff;--tilt:13deg;--stretch:1.3;--orbit-speed:13s}
      .relic-icon.straggler-planet .relic-v7{--ring:#68d9ff;--moon:#e5ffff;--tilt:-16deg;--stretch:1.15;--orbit-speed:9.7s}
      .relic-icon.straggler-planet .relic-v8{--ring:#a99cff;--moon:#ffd6fb;--tilt:27deg;--stretch:1.25;--orbit-speed:12.6s}
      .relic-icon.straggler-planet:nth-of-type(2n) .ai-planet-shell::after{right:auto!important;left:0!important;top:15px!important}
      .relic-icon.straggler-planet:nth-of-type(3n) .ai-planet-shell::after{top:auto!important;bottom:2px!important;right:9px!important}

      @keyframes astralisGalaxyOrbit{to{transform:rotate(360deg)}}
      @keyframes astralisGalaxyCounterSpin{to{transform:rotate(360deg)}}
      @keyframes astralisGalaxyBreathe{0%,100%{transform:scale(.98);opacity:.9;filter:brightness(.96)}50%{transform:scale(1.045);opacity:1;filter:brightness(1.14)}}
      @keyframes stragglerOrbit{from{transform:rotate(var(--tilt)) scaleX(var(--stretch))}to{transform:rotate(calc(var(--tilt) + 360deg)) scaleX(var(--stretch))}}
      @keyframes stragglerMoon{0%,100%{transform:translate(0,0) scale(.82);opacity:.58}50%{transform:translate(-6px,-5px) scale(1.18);opacity:1}}

      @media(max-width:800px){
        .astralis-hero-galaxy{right:-12%;top:4%;width:510px;opacity:.72}
      }
      @media(max-width:520px){
        .astralis-hero-galaxy{right:-23%;top:7%;width:440px;opacity:.64;filter:saturate(1.18) contrast(1.08) drop-shadow(0 0 25px rgba(116,142,255,.26))}
      }
      @media(prefers-reduced-motion:reduce){.astralis-hero-galaxy,.astralis-hero-galaxy img,.astralis-hero-galaxy::after,.relic-icon.straggler-planet .ai-planet-shell::before,.relic-icon.straggler-planet .ai-planet-shell::after{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function addHeroGalaxy() {
    const hero = document.querySelector(".hero");
    if (!hero || hero.querySelector(".astralis-hero-galaxy")) return false;
    const galaxy = document.createElement("div");
    galaxy.className = "astralis-hero-galaxy";
    galaxy.setAttribute("aria-hidden", "true");
    galaxy.innerHTML = '<img src="/astralis-hero-galaxy-spin.svg?v=20260722m" alt="">';
    hero.appendChild(galaxy);
    return true;
  }

  function relicKey(card, index) {
    const text = card?.textContent?.toLowerCase() || "";
    if (text.includes("flower")) return "flower";
    if (text.includes("unborn")) return "unborn";
    if (text.includes("river")) return "river";
    if (text.includes("magic")) return "magic";
    if (text.includes("smile")) return "smile";
    if (text.includes("cry")) return "cry";
    if (text.includes("angels")) return "angels";
    if (text.includes("orbit")) return "orbit";
    return ["flower","unborn","river","magic","smile","cry","angels","orbit"][index % 8];
  }

  function diversifyRelicPlanets() {
    const icons = [...document.querySelectorAll(".relic-link-card .relic-icon")];
    if (!icons.length) return false;
    icons.forEach((icon, index) => {
      const key = relicKey(icon.closest(".relic-link-card"), index);
      const variant = `relic-v${index + 1}`;
      const currentImage = icon.querySelector("img");
      const desiredImage = new URL(ASSETS[key], window.location.href).href;
      const alreadyCorrect = icon.dataset.stragglerPlanet === key && currentImage?.src === desiredImage && icon.querySelector(`.${variant}`);
      if (alreadyCorrect) return;
      icon.classList.add("ai-relic-icon", "straggler-planet");
      icon.dataset.stragglerPlanet = key;
      icon.innerHTML = `<span class="ai-planet-shell ${variant}"><img src="${ASSETS[key]}" alt="" aria-hidden="true" loading="lazy"></span>`;
    });
    return true;
  }

  function apply() {
    installStyles();
    addHeroGalaxy();
    diversifyRelicPlanets();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, {once:true});
  else apply();

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, {childList:true, subtree:true});
  window.setTimeout(() => observer.disconnect(), 12000);
})();