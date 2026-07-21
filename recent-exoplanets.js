(() => {
  "use strict";

  const worlds = [
    { image: "/astralis-earth.png", label: "Visual: Earthlike explorer world", href: "/conquest.html" },
    { image: "/astralis-gas-giant.png", label: "Visual: Giant forge world", href: "https://emulator.ac/", external: true },
    { image: "/astralis-mars.png", label: "Visual: Red creative world", href: "/#live-board" },
    { image: "/astralis-earth.png", label: "Visual: Story world", href: "/biography.html", variant: "violet" },
    { image: "/astralis-gas-giant.png", label: "Visual: Archive orbit world", href: "/#first-orbit", variant: "gold" },
    { image: "/astralis-mars.png", label: "Visual: Visitor moon", href: "/#guestbook", variant: "blue" }
  ];

  function installStyles() {
    document.getElementById("recentExoplanetStyles")?.remove();
    document.getElementById("recentExoplanetStylesV2")?.remove();
    document.getElementById("recentExoplanetStylesV3")?.remove();

    const style = document.createElement("style");
    style.id = "recentExoplanetStylesV4";
    style.textContent = `
      .astralis-worlds-head{max-width:850px!important}
      .astralis-worlds-note{display:block;margin-top:9px;color:#839bb8;font-size:.76rem;line-height:1.55}
      .astralis-planet-link{gap:18px!important;min-height:146px!important;padding:18px!important}
      .astralis-planet.recent-exoplanet{display:grid!important;place-items:center!important;flex:0 0 96px!important;width:96px!important;height:96px!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important;transition:transform .3s ease,filter .3s ease}
      .astralis-planet.recent-exoplanet::before,.astralis-planet.recent-exoplanet::after{content:none!important;display:none!important}
      .astralis-planet.recent-exoplanet img{display:block;width:100%;height:100%;object-fit:contain;background:transparent;animation:recentExoplanetFloat 6.2s ease-in-out infinite;transform-origin:50% 50%;filter:drop-shadow(0 0 12px rgba(77,157,255,.26))}
      .astralis-planet.recent-exoplanet.violet img{filter:hue-rotate(48deg) saturate(1.2) drop-shadow(0 0 12px rgba(191,104,255,.28))}
      .astralis-planet.recent-exoplanet.gold img{filter:hue-rotate(-18deg) saturate(1.12) brightness(1.04) drop-shadow(0 0 12px rgba(255,183,91,.25))}
      .astralis-planet.recent-exoplanet.blue img{filter:hue-rotate(165deg) saturate(.9) brightness(1.08) drop-shadow(0 0 12px rgba(105,185,255,.28))}
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

    const links = [...section.querySelectorAll(".astralis-planet-link")];
    if (links.length < worlds.length) return false;

    section.dataset.realisticPlanets = "true";
    installStyles();

    const intro = section.querySelector(".astralis-worlds-head > p:not(.eyebrow)");
    if (intro) {
      intro.textContent = "Travel through the music, memories, games, communities, and creative places orbiting Astralis Nova.";
      section.querySelector(".astralis-worlds-note")?.remove();
      const note = document.createElement("small");
      note.className = "astralis-worlds-note";
      note.textContent = "Each destination now uses realistic planet artwork while keeping the original Astralis Nova portal links.";
      intro.insertAdjacentElement("afterend", note);
    }

    worlds.forEach((world, index) => {
      const link = links[index];
      const planet = link.querySelector(".astralis-planet");
      const copy = link.querySelector(".astralis-planet-copy");
      if (!planet || !copy) return;

      link.setAttribute("href", world.href);
      if (world.external) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }

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

  if (applyRecentWorlds()) return;

  const observer = new MutationObserver(() => {
    if (applyRecentWorlds()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
})();