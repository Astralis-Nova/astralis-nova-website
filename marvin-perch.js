(() => {
  'use strict';
  const button = document.getElementById('novaMarvin');
  const message = document.getElementById('novaMarvinMessage');
  if (!button || !message || button.dataset.installed) return;
  button.dataset.installed = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lines = [
    'I claim this Nova for Mars. The Nova has filed an appeal.',
    'A rotating planet? I specifically requested a stationary office.',
    'That beagle has a flying house. My commute suddenly seems inadequate.',
    'My view of Venus is excellent. The doghouse traffic is another matter.',
    'Mission report: excellent sphere. Questionable parking.'
  ];
  let line = 0, visible = true, timer;
  function sync() { button.classList.toggle('is-resting', document.hidden || !visible || reduced.matches); }
  function dismiss() {
    clearTimeout(timer); message.hidden = true; button.classList.remove('is-greeting');
  }
  button.disabled = false;
  button.addEventListener('click', () => {
    dismiss();
    message.textContent = lines[line++ % lines.length];
    message.hidden = false;
    void button.offsetWidth;
    button.classList.add('is-greeting');
    timer = setTimeout(dismiss, 5500);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting); sync();
    }, { rootMargin: '80px' });
    observer.observe(button);
  }
  sync();
  fetch('/marvin-perch.svg?v=20261014marvin1', { credentials: 'same-origin' })
    .then(response => response.ok ? response.text() : '')
    .then(svg => {
      if (!svg.startsWith('<svg')) return;
      button.innerHTML = svg;
      button.querySelector('svg').setAttribute('aria-hidden', 'true');
    }).catch(() => { /* The local image remains available as a still fallback. */ });
})();
