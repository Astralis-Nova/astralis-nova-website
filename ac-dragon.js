(() => {
  const video = document.getElementById('acDragonVideo');
  const still = document.getElementById('acDragonStill');
  const toggle = document.getElementById('acDragonToggle');
  if (!video || !still || !toggle) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let wantsToPlay = !reducedMotion.matches;
  let loaded = false;

  const updateButton = () => {
    const playing = !video.paused;
    const label = playing ? 'Pause dragon animation' : 'Play dragon animation';
    toggle.dataset.playing = String(playing);
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };
  const applyPlayback = async () => {
    if (!wantsToPlay || document.hidden) {
      video.pause();
      updateButton();
      return;
    }
    if (!loaded) {
      video.querySelectorAll('source').forEach(source => {
        source.src = source.dataset.src;
      });
      video.load();
      loaded = true;
    }
    try {
      await video.play();
      if (!wantsToPlay || document.hidden) {
        video.pause();
        return;
      }
      still.hidden = true;
      video.hidden = false;
    } catch {
      wantsToPlay = false;
      video.hidden = true;
      still.hidden = false;
    }
    updateButton();
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    wantsToPlay = !wantsToPlay;
    void applyPlayback();
  });
  video.addEventListener('playing', updateButton);
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => {
    wantsToPlay = false;
    video.hidden = true;
    still.hidden = false;
    toggle.hidden = true;
  });
  reducedMotion.addEventListener('change', () => {
    wantsToPlay = !reducedMotion.matches;
    if (reducedMotion.matches) {
      video.hidden = true;
      still.hidden = false;
    }
    void applyPlayback();
  });
  document.addEventListener('visibilitychange', () => void applyPlayback());
  void applyPlayback();
})();
