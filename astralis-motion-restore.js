(() => {
  "use strict";

  const STYLE_ID = "astralisMotionRestoreStyles";

  function removeReducedMotionRules() {
    for (const sheet of [...document.styleSheets]) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (!rules) continue;

      for (let index = rules.length - 1; index >= 0; index -= 1) {
        const rule = rules[index];
        if (rule.type !== CSSRule.MEDIA_RULE) continue;
        const mediaText = rule.media?.mediaText || rule.conditionText || "";
        if (!mediaText.includes("prefers-reduced-motion")) continue;
        try {
          sheet.deleteRule(index);
        } catch {
          // A browser may expose a readable stylesheet but still reject edits.
        }
      }
    }
  }

  function installMotionStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
    }

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

  function restoreVisibleSections() {
    document.querySelectorAll(".astralis-perf-paused").forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom >= -320 && rect.top <= window.innerHeight + 320) {
        section.classList.remove("astralis-perf-paused");
      }
    });
  }

  function restoreMotion() {
    document.documentElement.classList.add("astralis-motion-enabled");
    removeReducedMotionRules();
    installMotionStyles();
    restoreVisibleSections();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restoreMotion, { once: true });
  } else {
    restoreMotion();
  }

  window.addEventListener("load", restoreMotion, { once: true });
  [500, 1800, 3800, 7200].forEach(delay => window.setTimeout(restoreMotion, delay));
})();
