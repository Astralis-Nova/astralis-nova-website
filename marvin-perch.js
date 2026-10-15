(() => {
  'use strict';
  const button = document.getElementById('novaMarvin');
  const message = document.getElementById('novaMarvinMessage');
  const rig = window.NovaMarvinRig;
  if (!button || !message || !rig || button.dataset.installed) return;
  button.dataset.installed = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lines = [
    'One small zap for Mars. One enormous complaint from Nova management.',
    'My ray gun is fully charged. My parking permit is still pending.',
    'That beagle has a flying house. I have a ray gun. We are both overqualified for traffic duty.',
    'Venus is finally in view. Please ask the doghouse to use the other lane.',
    'Mission report: the laser works. The planet continues to ignore my instructions.'
  ];
  let line = 0, visible = true, timer, frame = 0, last = null, clock = 0, parts;
  function paused() {
    return document.hidden || !visible || reduced.matches || document.documentElement.classList.contains('space-motion-paused');
  }
  function draw() {
    if (!parts) return;
    const p = rig.pose(clock);
    parts.balance.setAttribute('transform', `rotate(${p.balance} 124 270)`);
    parts.arm.setAttribute('transform', `rotate(${p.arm} 145 183)`);
    parts.head.setAttribute('transform', `rotate(${p.head} 123 165)`);
    parts.pupils.setAttribute('transform', `translate(${p.gaze} 0)`);
    parts.eyes.setAttribute('transform', `translate(0 120) scale(1 ${p.eyeScale}) translate(0 -120)`);
    parts.plume.setAttribute('transform', `rotate(${p.plume} 120 48)`);
    parts.light.setAttribute('opacity', p.charge * .85);
    parts.laser.setAttribute('opacity', p.beam);
    parts.rings.setAttribute('transform', `translate(${p.travel} 0)`);
  }
  function tick(now) {
    frame = 0;
    if (paused()) { last = null; return; }
    if (last !== null) clock += Math.min(80, Math.max(0, now - last));
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const rest = paused();
    button.classList.toggle('is-resting', rest);
    if (rest) { cancelAnimationFrame(frame); frame = 0; last = null; }
    else if (parts && !frame) frame = requestAnimationFrame(tick);
  }
  function dismiss() { clearTimeout(timer); message.hidden = true; }
  button.disabled = false;
  button.addEventListener('click', () => {
    dismiss();
    message.textContent = lines[line++ % lines.length];
    message.hidden = false;
    if (!paused()) { clock = 3000; last = null; draw(); sync(); }
    timer = setTimeout(dismiss, 5500);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting); sync();
    }, { rootMargin: '80px' });
    observer.observe(button);
  }
  sync();
  fetch('/marvin-perch.svg?v=20261015laser2', { credentials: 'same-origin' })
    .then(response => response.ok ? response.text() : '')
    .then(svg => {
      if (!svg.startsWith('<svg')) return;
      button.innerHTML = svg;
      button.querySelector('svg').setAttribute('aria-hidden', 'true');
      const names = { balance: 'balance', arm: 'gun-arm', head: 'head', pupils: 'pupils', eyes: 'eyes', plume: 'plume', light: 'gun-light', laser: 'laser', rings: 'laser-rings' };
      parts = Object.fromEntries(Object.entries(names).map(([key, name]) => [key, button.querySelector(`.marvin-${name}`)]));
      draw(); sync();
    }).catch(() => { /* The local image remains available as a still fallback. */ });
})();
