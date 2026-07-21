(() => {
  "use strict";

  const worlds = [
    { image: "/recent-beta-pictoris-d.svg", name: "Beta Pictoris d", year: "2026" },
    { image: "/recent-toi-1752-b.svg", name: "TOI-1752 b", year: "2026" },
    { image: "/recent-wispit-2b.svg", name: "WISPIT 2b", year: "2025", qualifier: "protoplanet" },
    { image: "/recent-toi-5624-b.svg", name: "TOI-5624 b", year: "2026" },
    { image: "/recent-gaia23bra-b.svg", name: "Gaia23bra b", year: "2026" },
    { image: "/recent-toi-1752-c.svg", name: "TOI-1752 c", year: "2026" }
  ];

  function installStyles() {
    if (document.getElementById("recentExoplanetStyles")) return;
    const style = document.createElement("style");
    style.id = "recentExoplanetStyles";
    style.textContent = `
      .astralis-worlds-head{max-width:850px!important}
      .astralis-worlds-note{display:block;margin-top:9px;color:#839bb8;font-size:.76rem;line-height:1.55}
      .astralis-planet-link{gap:18px!important;min-height:146px!important;padding:18px!important}
      .astralis-planet.recent-exoplanet{display:grid!important;place-items:center!important;flex:0 0 92px!important;width:92px!important;height:92px!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important;filter:drop-shadow(0 0 10px rgba(77,157,255,.26));transition:transform .3s ease,filter .3s ease}
      .astralis-planet.recent-exoplanet::before,.astralis-planet.recent-exoplanet::after{content:none!important;display:none!important}
      .astralis-planet.recent-exoplanet img{display:block;width:100%;height:100%;object-fit:contain;animation:recentExoplanetFloat 6.2s ease-in-out infinite;transform-origin:50% 50%}
      .astralis-planet-link:nth-child(3n) .recent-exoplanet img{animation-delay:-1.8s}
      .astralis-planet-link:nth-child(3n+1) .recent-exoplanet img{animation-delay:-3.4s}
      .astralis-planet-link:hover .recent-exoplanet,.astralis-planet-link:focus-visible .recent-exoplanet{transform:translateY(-3px) rotate(3deg) scale(1.06);filter:drop-shadow(0 0 16px rgba(112,192,255,.5))}
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
    if (!section || section.dataset.recentExoplanets === "true") return false;

    const links = [...section.querySelectorAll(".astralis-planet-link")];
    if (links.length < worlds.length) return false;

    section.dataset.recentExoplanets = "true";
    installStyles();

    const intro = section.querySelector(".astralis-worlds-head > p:not(.eyebrow)");
    if (intro) {
      intro.textContent = "Travel through the music, memories, games, communities, and creative places orbiting Astralis Nova.";
      const note = document.createElement("small");
      note.className = "astralis-worlds-note";
      note.textContent = "Each portal now wears an original artist-concept look inspired by a real exoplanet announced in 2025 or 2026. Their exact surface colors remain unknown, so these are science-guided interpretations rather than photographs.";
      intro.insertAdjacentElement("afterend", note);
    }

    worlds.forEach((world, index) => {
      const link = links[index];
      const planet = link.querySelector(".astralis-planet");
      const copy = link.querySelector(".astralis-planet-copy");
      if (!planet || !copy) return;

      planet.className = "astralis-planet recent-exoplanet";
      planet.replaceChildren();

      const image = document.createElement("img");
      image.src = world.image;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.loading = "lazy";
      planet.appendChild(image);

      const origin = document.createElement("span");
      origin.className = "astralis-world-origin";
      origin.textContent = `Visual: ${world.name} · ${world.year}${world.qualifier ? ` ${world.qualifier}` : ""}`;
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
