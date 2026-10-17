(() => {
  'use strict';
  // Visibility and offscreen controllers own pause state. Never force animations running.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    document.documentElement.classList.toggle('astralis-motion-enabled', !reduced.matches);
    document.getElementById('astralisMotionRestoreStyles')?.remove();
  }
  reduced.addEventListener('change', sync); sync();
})();
