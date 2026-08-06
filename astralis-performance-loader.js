(() => {
  "use strict";

  const VERSION = "20260806c";
  const loaded = new Map();

  function loadScript(src) {
    if (loaded.has(src)) return loaded.get(src);
    const promise = new Promise((resolve, reject) => {
      const absolute = new URL(src, location.href).href;
      const existing = [...document.scripts].find(script => script.src === absolute);
      if (existing) {
        existing.addEventListener("load", () => resolve(existing), { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (existing.dataset.astralisLoaded === "true") resolve(existing);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.addEventListener("load", () => {
        script.dataset.astralisLoaded = "true";
        resolve(script);
      }, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
    loaded.set(src, promise);
    return promise;
  }

  async function loadSequence(sources) {
    for (const src of sources) {
      try { await loadScript(src); }
      catch (error) { console.warn("Astralis asset unavailable:", src, error); }
    }
  }

  function installPerformanceStyles() {
    if (document.getElementById("astralisPerformanceStyles")) return;
    const style = document.createElement("style");
    style.id = "astralisPerformanceStyles";
    style.textContent = `
      .section-shell,.astralis-worlds,.martian-counter-wrap{content-visibility:auto;contain-intrinsic-size:1px 760px}
      .astralis-perf-paused,.astralis-perf-paused *,html.astralis-page-hidden *,html.astralis-page-hidden *::before,html.astralis-page-hidden *::after{animation-play-state:paused!important}
      @media(max-width:700px){.section-shell,.astralis-worlds,.martian-counter-wrap{contain-intrinsic-size:1px 980px}}
    `;
    document.head.appendChild(style);
  }

  function optimizeImages() {
    const hero = document.querySelector(".hero");
    document.querySelectorAll("img").forEach(image => {
      image.decoding = "async";
      if (!hero?.contains(image) && !image.closest(".topbar")) image.loading = "lazy";
    });
  }

  function pauseWhenHidden() {
    const sync = () => document.documentElement.classList.toggle("astralis-page-hidden", document.hidden);
    document.addEventListener("visibilitychange", sync, { passive: true });
    sync();
  }

  function manageOffscreenMotion() {
    if (!("IntersectionObserver" in window)) return;
    const selector = ".section-shell,.astralis-worlds,.martian-counter-wrap,.live-board-panel,.first-orbit,.culture-grid";
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("astralis-perf-paused", !entry.isIntersecting));
    }, { rootMargin: "320px 0px", threshold: 0.01 });
    document.querySelectorAll(selector).forEach(element => observer.observe(element));
  }

  function lazyLoadMidi() {
    const target = document.getElementById("first-orbit") || document.querySelector("midi-player");
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadScript("https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.4.0").catch(() => {});
    }, { rootMargin: "1000px 0px" });
    observer.observe(target);
  }

  const critical = [
    "/site-fixes.js?v=20260720c",
    "/cosmic-worlds.js?v=20260806c",
    "/remove-retired-links.js?v=20260806b",
    "/realistic-orbit.js?v=20260721b",
    "/astralis-celestial-drift.js?v=20260722m",
    "/astralis-ai-upgrades.js?v=20260722q",
    "/astralis-stragglers.js?v=20260722q",
    "/realistic-galaxy-upgrade.js?v=20260722r",
    "/astralis-brand-orbit.js?v=20260722s",
    "/final-visual-fixes.js?v=20260722q",
    "/astralis-nova-explorer.js?v=20260722e"
  ];

  const deferred = [
    "/rickroll-planet.js?v=20260722a",
    "/recent-exoplanets.js?v=20260806b",
    "/conquest-media.js?v=20260720a",
    "/vulcan-salute.js?v=20260722l",
    "/cosmic-chuckles.js?v=20260722a",
    "/hawking-quote-data-a.js?v=20260722a",
    "/hawking-quote-data-b.js?v=20260722a",
    "/hawking-quote.js?v=20260722a"
  ];

  async function boot() {
    installPerformanceStyles();
    optimizeImages();
    pauseWhenHidden();
    lazyLoadMidi();
    await loadSequence(critical);
    optimizeImages();
    manageOffscreenMotion();
    const runDeferred = () => loadSequence(deferred);
    if ("requestIdleCallback" in window) requestIdleCallback(runDeferred, { timeout: 2200 });
    else setTimeout(runDeferred, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  window.AstralisPerformance = { version: VERSION, loadScript };
})();
