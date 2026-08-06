(() => {
  "use strict";

  const worlds = [
    { match: link => link.pathname === "/conquest.html", image: "/astralis-earth.png", label: "Visual: Earthlike explorer world" },
    { match: link => link.hostname === "emulator.ac", image: "/astralis-gas-giant.png", label: "Visual: Giant forge world", external: true },
    { match: link => link.pathname === "/biography.html", image: "/astralis-earth.png", label: "Visual: Story world", variant: "violet" },
    { match: link => link.hash === "#first-orbit", image: "/astralis-gas-giant.png", label: "Visual: Archive orbit world", variant: "gold" },
    { match: link => link.hash === "#guestbook", image: "/astralis-earth.png", label: "Visual: Visitor guestbook world", variant: "violet" },
    {
      match: link => link.pathname === "/rainbow-promise.html",
      image: "/rainbow-portal.svg",
      label: "Visual: Rainbow after the rain",
      title: "Rainbow Promise",
      description: "Rain, Noah’s ark, the covenant, and hope carried across the sky after a storm.",
      badge: "Reflection World",
      ariaLabel: "Open The Rainbow Promise reflection"
    }
  ];

  function installStyles() {
    document.querySelectorAll('[id^="recentExoplanetStyles"]').forEach(element => element.remove());
    const style = document.createElement("style");
    style.id = "recentExoplanetStylesV6";
    style.textContent = `
      .astralis-worlds-head{max-width:850px!important}
      .astralis-worlds-note{display:block;margin-top:9px;color:#839bb8;font-size:.76rem;line-height:1.55}
      .astralis-planet-link{gap:18px!important;min-height:146px!important;padding:18px!important}
      .astralis-planet.recent-exoplanet{display:grid!important;place-items:center!important;flex:0 0 96px!important;width:96px!important;height:96px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important;isolation:isolate!important;transition:transform .3s ease,filter .3s ease}
      .astralis-planet.recent-exoplanet::before,.astralis-planet.recent-exoplanet::after{content:none!important;display:none!important}
      .astralis-planet.recent-exoplanet img{display:block;width:100%;height:100%;object-fit:contain;background:transparent!important;mix-blend-mode:screen;animation:recentExoplanetFloat 6.2s ease-in-out infinite;transform-origin:50% 50%;filter:drop-shadow(0 0 12px rgba(77,157,255,.26));-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0 58%,rgba(0,0,0,.98) 66%,rgba(0,0,0,.72) 74%,transparent 88%);mask-image:radial-gradient(circle at 50% 50%,#000 0 58%,rgba(0,0,0,.98) 66%,rgba(0,0,0,.72) 74%,transparent 88%)}
      .astralis-planet.recent-exoplanet.violet img{filter:hue-rotate(48deg) saturate(1.2) drop-shadow(0 0 12px rgba(191,104,255,.28))}
      .astralis-planet.recent-exoplanet.gold img{filter:hue-rotate(-18deg) saturate(1.12) brightness(1.04) drop-shadow(0 0 12px rgba(255,183,91,.25))}
      .astralis-planet-link:hover .recent-exoplanet,.astralis-planet-link:focus-visible .recent-exoplanet{transform:translateY(-3px) rotate(3deg) scale(1.06)}
      .astralis-world-origin{display:block!important;margin-top:7px!important;color:#839dbd!important;font-size:.66rem!important;letter-spacing:.035em;line-height:1.35!important}
      .astralis-world-origin::before{content:"✦ ";color:#e06fd4}
      @keyframes recentExoplanetFloat{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
      @media(max-width:640px){.astralis-planet-link{min-height:126px!important;gap:14px!important}.astralis-planet.recent-exoplanet{flex-basis:78px!important;width:78px!important;height:78px!important}}
      @media(prefers-reduced-motion:reduce){.astralis-planet.recent-exoplanet img{animation:none}.astralis-planet-link:hover .recent-exoplanet,.astralis-planet-link:focus-visible .recent-exoplanet{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function decorate(link, world) {
    if (link.id === "astralisUnknownSignalWorld" || link.dataset.realisticDestination === "true") return;
    const planet = link.querySelector(".astralis-planet");
    const copy = link.querySelector(".astralis-planet-copy");
    if (!planet || !copy) return;

    link.dataset.realisticDestination = "true";
    if (world.ariaLabel) link.setAttribute("aria-label", world.ariaLabel);
    if (world.external) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }

    planet.className = `astralis-planet recent-exoplanet${world.variant ? ` ${world.variant}` : ""}`;
    planet.replaceChildren();
    const image = document.createElement("img");
    image.src = world.image;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.loading = "lazy";
    planet.appendChild(image);

    if (world.title) copy.querySelector("strong").textContent = world.title;
    if (world.description) {
      const description = [...copy.querySelectorAll(":scope > span")].find(span => !span.classList.contains("astralis-world-badge") && !span.classList.contains("astralis-world-origin"));
      if (description) description.textContent = world.description;
    }
    if (world.badge) copy.querySelector(".astralis-world-badge").textContent = world.badge;

    copy.querySelectorAll(".astralis-world-origin").forEach(element => element.remove());
    const origin = document.createElement("span");
    origin.className = "astralis-world-origin";
    origin.textContent = world.label;
    copy.appendChild(origin);
  }

  function applyRecentWorlds() {
    const section = document.getElementById("connected-worlds");
    if (!section) return false;
    installStyles();

    const intro = section.querySelector(".astralis-worlds-head > p:not(.eyebrow)");
    if (intro && !section.querySelector(".astralis-worlds-note")) {
      intro.textContent = "Travel through the music, memories, games, communities, and creative places orbiting Astralis Nova.";
      const note = document.createElement("small");
      note.className = "astralis-worlds-note";
      note.textContent = "Each destination keeps its original link and receives artwork by destination, never by card position.";
      intro.insertAdjacentElement("afterend", note);
    }

    section.querySelectorAll(".astralis-planet-link").forEach(card => {
      if (card.id === "astralisUnknownSignalWorld") return;
      const url = new URL(card.getAttribute("href") || "", location.href);
      const world = worlds.find(candidate => candidate.match(url));
      if (world) decorate(card, world);
    });
    return true;
  }

  if (applyRecentWorlds()) {
    const section = document.getElementById("connected-worlds");
    const observer = new MutationObserver(applyRecentWorlds);
    observer.observe(section, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
    return;
  }

  const observer = new MutationObserver(() => {
    if (!applyRecentWorlds()) return;
    observer.disconnect();
    const section = document.getElementById("connected-worlds");
    const sectionObserver = new MutationObserver(applyRecentWorlds);
    sectionObserver.observe(section, { childList: true, subtree: true });
    setTimeout(() => sectionObserver.disconnect(), 10000);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
})();