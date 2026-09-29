(() => {
  const car = document.getElementById('astralis-starman-roadster');
  if (!car) return;
  const brain = document.querySelector('.thought-art');
  function sizeRoute() {
    const width = car.offsetWidth, height = car.offsetHeight;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 78;
    const top = Math.min(Math.max(100, headerBottom + 16), Math.max(12, innerHeight - height - 140));
    car.style.setProperty('--roadster-top', top + 'px');
    car.style.setProperty('--roadster-x', Math.max(0, innerWidth - width - 24) + 'px');
    car.style.setProperty('--roadster-y', Math.max(0, innerHeight - top - height - 140) + 'px');
    keepBrainClear();
  }
  function keepBrainClear() {
    if (!brain || document.hidden) return;
    const a = car.getBoundingClientRect(), b = brain.getBoundingClientRect();
    car.classList.toggle('starman-behind-brain',
      a.right > b.left - 20 && a.left < b.right + 20 &&
      a.bottom > b.top - 20 && a.top < b.bottom + 20);
  }
  sizeRoute();
  window.addEventListener('resize', sizeRoute, { passive: true });
  window.addEventListener('scroll', keepBrainClear, { passive: true });
  document.addEventListener('visibilitychange', () => {
    car.classList.toggle('starman-page-hidden', document.hidden);
    keepBrainClear();
  });
  setInterval(keepBrainClear, 200);
})();
