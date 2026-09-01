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
    button.setAttribute('aria-label', playing ? 'Pause portal space' : 'Play portal space');
  }
  button.hidden = false;
  button.addEventListener('click', () => setPlaying(!playing));
  preference.addEventListener('change', event => setPlaying(!event.matches));
  image.addEventListener('error', () => {
    if (playing) setPlaying(false);
  });
  setPlaying(!preference.matches);
})();
