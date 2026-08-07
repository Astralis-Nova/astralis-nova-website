(() => {
  "use strict";

  const STYLE_ID = "astralisMotionRestoreStyles";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  function installMotionStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.astralis-motion-enabled body .astralis-galaxy-main,
      html.astralis-motion-enabled body .astralis-galaxy-core,
      html.astralis-motion-enabled body .astralis-galaxy-glow,
      html.astralis-motion-enabled body .roaming-starship,
      html.astralis-motion-enabled body .nova-explorer,
      html.astralis-motion-enabled body .nova-explorer-warp,
      html.astralis-motion-enabled body #astralis-celestial-drift .celestial,
      html.astralis-motion-enabled body .astralis-brand-orbit,
      html.astralis-motion-enabled body .astralis-brand-star,
      html.astralis-motion-enabled body .astralis-sun,
      html.astralis-motion-enabled body .astralis-bio-comet,
      html.astralis-motion-enabled body .relic-icon img,
      html.astralis-motion-enabled body .astralis-planet.recent-exoplanet img {
        animation-play-state: running !important;
      }

      html.astralis-motion-enabled body #astralis-celestial-drift,
      html.astralis-motion-enabled body .roaming-starship,
      html.astralis-motion-enabled body .nova-explorer {
        display: block !important;
      }
    `;

    document.head.appendChild(style);
  }

  function syncMotionPreference() {
    const allowMotion = !reducedMotion?.matches;
    document.documentElement.classList.toggle("astralis-motion-enabled", allowMotion);

    if (allowMotion) {
      installMotionStyles();
    } else {
      document.getElementById(STYLE_ID)?.remove();
    }
  }

  syncMotionPreference();
  reducedMotion?.addEventListener?.("change", syncMotionPreference);
})();
