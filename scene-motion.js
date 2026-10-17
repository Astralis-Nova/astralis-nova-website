(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = new Map();
  function sync() {
    document.documentElement.classList.toggle('astralis-page-hidden', document.hidden);
    document.documentElement.classList.toggle('astralis-reduced-motion', reduced.matches);
    for (const [video, state] of videos) {
      const paused = document.hidden || reduced.matches || !state.visible;
      if (paused && !video.paused) { state.resume = true; video.pause(); }
      else if (!paused && state.resume) { state.resume = false; video.play().catch(() => {}); }
    }
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = videos.get(entry.target);
      if (state) state.visible = entry.isIntersecting;
      else entry.target.classList.toggle('astralis-scene-resting', !entry.isIntersecting);
    }
    sync();
  }, { rootMargin:'100px' }) : null;
  const observed = new WeakSet();
  function observeScenes() {
    for (const scene of document.querySelectorAll('.astralis-music-orbit,.region,.rainbow-wrap,.ac-dragon-stage,#toon-planet-gateway')) {
      if (!observed.has(scene)) { observed.add(scene); observer?.observe(scene); }
    }
    // Only decorative muted autoplay video is controlled; music and user video stay independent.
    for (const video of document.querySelectorAll('video[autoplay]')) {
      if (!video.muted || videos.has(video)) continue;
      videos.set(video, { visible:true, resume:!video.paused || video.autoplay }); observer?.observe(video);
    }
    sync();
  }
  observeScenes();
  new MutationObserver(observeScenes).observe(document.body, { childList:true });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync); sync();
})();
