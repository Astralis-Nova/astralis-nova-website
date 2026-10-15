(() => {
  'use strict';
  const scene = document.querySelector('.scene-bg');
  const toggle = document.getElementById('rain-toggle');
  if (!scene || !toggle) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let video = null;
  let timeout;

  // The poster and all page content render before any video decoder is created.
  function stop() {
    window.clearTimeout(timeout);
    scene.classList.remove('is-playing');
    const previous = video;
    video = null;
    if (previous) {
      previous.pause();
      previous.removeAttribute('src');
      previous.load();
      previous.remove();
    }
    toggle.textContent = 'Animate rain';
    toggle.setAttribute('aria-pressed', 'false');
  }

  function start() {
    if (video || reducedMotion.matches) return;
    const current = document.createElement('video');
    current.className = 'scene-video';
    current.muted = true;
    current.defaultMuted = true;
    current.loop = true;
    current.playsInline = true;
    current.setAttribute('playsinline', '');
    current.setAttribute('webkit-playsinline', '');
    current.setAttribute('aria-hidden', 'true');
    current.tabIndex = -1;
    current.poster = '/assets/voices-rain-life-poster.webp';
    current.preload = 'none';
    video = current;
    const pending = () => {
      if (video !== current) return;
      scene.classList.remove('is-playing');
      window.clearTimeout(timeout);
      timeout = window.setTimeout(stop, 8000);
    };
    const reveal = () => {
      if (video !== current) return;
      window.clearTimeout(timeout);
      scene.classList.add('is-playing');
    };
    current.addEventListener('playing', () => {
      if (video !== current) return;
      if (current.requestVideoFrameCallback) current.requestVideoFrameCallback(reveal);
      else reveal();
    });
    current.addEventListener('waiting', pending);
    current.addEventListener('error', () => { if (video === current) stop(); });
    scene.appendChild(current);
    current.src = '/assets/voices-rain-life.mp4';
    toggle.textContent = 'Pause rain';
    toggle.setAttribute('aria-pressed', 'true');
    pending();
    try {
      const playback = current.play();
      if (playback && playback.catch) playback.catch(() => { if (video === current) stop(); });
    } catch { stop(); }
  }

  toggle.hidden = reducedMotion.matches;
  toggle.addEventListener('click', () => { if (video) stop(); else start(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', () => {
    toggle.hidden = reducedMotion.matches;
    if (reducedMotion.matches) stop();
  });

  // Start muted, inline rain on phones as well as desktops. Keep the poster
  // visible until a frame is decoded, and retain the blocked-playback fallback.
  if (!reducedMotion.matches && !navigator.connection?.saveData) start();
})();
