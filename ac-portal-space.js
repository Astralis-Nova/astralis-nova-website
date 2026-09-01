(() => {
  'use strict';
  const image = document.getElementById('portalSpaceImage');
  const button = document.getElementById('portalSpaceToggle');
  if (!image || !button) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = false;
  function setPlaying(value) {
    playing = value;
    image.src = '/assets/ac-portals/portal-space-' + (playing ? 'motion' : 'still') + '.webp';
    button.dataset.playing = String(playing);
    document.documentElement.dataset.acMotion = playing ? 'on' : 'off';
    button.setAttribute('aria-label', playing ? 'Pause title and portal animation' : 'Play title and portal animation');
  }
  button.hidden = false;
  button.addEventListener('click', () => setPlaying(!playing));
  preference.addEventListener('change', event => setPlaying(!event.matches));
  image.addEventListener('error', () => {
    if (playing) setPlaying(false);
  });
  setPlaying(!preference.matches);
})();
