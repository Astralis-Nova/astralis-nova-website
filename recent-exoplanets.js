(() => {
  "use strict";

  const worlds = {
    conquest: { image: "/astralis-earth.png", label: "Visual: Earthlike explorer world" },
    acemulator: { image: "/astralis-gas-giant.png", label: "Visual: Giant forge world" },
    "eraser-board": { image: "/astralis-mars.png", label: "Visual: Red creative world" },
    biography: { image: "/planet-lunar-real.svg?v=20260830b", label: "Visual: Biography Moon", variant: "violet" },
    "first-orbit": { image: "/astralis-gas-giant.png", label: "Visual: Archive orbit world", variant: "gold" },
    "rainbow-promise": { image: "/rainbow-portal.svg", label: "Visual: Rainbow after the rain" }
  };

  function installStyles() {
    document.getElementById("recentExoplanetStyles")?.remove();
    document.getElementById("recentExoplanetStylesV2")?.remove();
    document.getElementById("recentExoplanetStylesV3")?.remove();
    document.getElementById("recentExoplanetStylesV4")?.remove();

    const style = document.createElement("style");
    style.id = "recentExoplanetStylesV5";
    style.textContent = `
      .astralis-worlds-head{max-width:850px!important}
      .astralis-worlds-note{display:block;margin-top:9px;color:#839bb8;font-size:.76rem;line-height:1.55}
      .astralis-planet-link{gap:18px!important;min-height:146px!important;padding:18px!important}
      .astralis-planet.recent-exoplanet{display:grid!important;place-items:center!important;flex:0 0 96px!important;width:96px!important;height:96px!important;background:transparent!important;background-color:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important;isolation:isolate!important;transition:transform .3s ease,filter .3s ease}
      .astralis-planet.recent-exoplanet::before,.astralis-planet.recent-exoplanet::after{content:none!important;display:none!important}
      .astralis-planet.recent-exoplanet img{display:block;width:100%;height:100%;object-fit:contain;background:transparent!important;background-color:transparent!important;mix-blend-mode:screen;animation:recentExoplanetFloat 6.2s ease-in-out infinite;transform-origin:50% 50%;filter:drop-shadow(0 0 12px rgba(77,157,255,.26));-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0 58%,rgba(0,0,0,.98) 66%,rgba(0,0,0,.72) 74%,transparent 88%);mask-image:radial-gradient(circle at 50% 50%,#000 0 58%,rgba(0,0,0,.98) 66%,rgba(0,0,0,.72) 74%,transparent 88%)}
      .astralis-planet.recent-exoplanet.violet img{filter:hue-rotate(48deg) saturate(1.2) drop-shadow(0 0 12px rgba(191,104,255,.28))}
      .astralis-planet.recent-exoplanet.gold img{filter:hue-rotate(-18deg) saturate(1.12) brightness(1.04) drop-shadow(0 0 12px rgba(255,183,91,.25))}
      .astralis-planet-link:nth-child(3n) .recent-exoplanet img{animation-delay:-1.8s}
      .astralis-planet-link:nth-child(3n+1) .recent-exoplanet img{animation-delay:-3.4s}
      .astralis-planet-link:hover .recent-exoplanet,.astralis-planet-link:focus-visible .recent-exoplanet{transform:translateY(-3px) rotate(3deg) scale(1.06)}
      .astralis-world-origin{display:block!important;margin-top:7px!important;color:#839dbd!important;font-size:.66rem!important;letter-spacing:.035em;line-height:1.35!important}
      .astralis-world-origin::before{content:"✦ ";color:#e06fd4}
      @keyframes recentExoplanetFloat{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
      @media(max-width:640px){.astralis-planet-link{min-height:126px!important;gap:14px!important}.astralis-planet.recent-exoplanet{flex-basis:78px!important;width:78px!important;height:78px!important}}
      @media(prefers-reduced-motion:reduce){.astralis-planet.recent-exoplanet img{animation:none}.astralis-planet-link:hover .recent-exoplanet,.astralis-planet-link:focus-visible .recent-exoplanet{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function applyRecentWorlds() {
    const section = document.getElementById("connected-worlds");
    if (!section || section.dataset.realisticPlanets === "true") return false;

    const links = [...section.querySelectorAll(".astralis-planet-link[data-world]")];
    if (!links.length) return false;

    section.dataset.realisticPlanets = "true";
    installStyles();

    section.querySelector(".astralis-worlds-note")?.remove();
    const intro = section.querySelector(".astralis-worlds-head > p:not(.eyebrow)");
    if (intro) {
      const note = document.createElement("small");
      note.className = "astralis-worlds-note";
      note.textContent = "Each destination uses realistic planet artwork while preserving its original Astralis Nova portal content and link.";
      intro.insertAdjacentElement("afterend", note);
    }

    links.forEach(link => {
      const world = worlds[link.dataset.world];
      if (!world) return;

      const planet = link.querySelector(".astralis-planet");
      const copy = link.querySelector(".astralis-planet-copy");
      if (!planet || !copy) return;

      planet.className = `astralis-planet recent-exoplanet${world.variant ? ` ${world.variant}` : ""}`;
      planet.replaceChildren();

      const image = document.createElement("img");
      image.src = world.image;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.loading = "lazy";
      planet.appendChild(image);

      copy.querySelectorAll(".astralis-world-origin").forEach(element => element.remove());
      const origin = document.createElement("span");
      origin.className = "astralis-world-origin";
      origin.textContent = world.label;
      copy.appendChild(origin);
    });

    return true;
  }

  applyRecentWorlds();
})();