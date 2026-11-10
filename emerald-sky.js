(() => {
  'use strict';
  const root = document.getElementById('emeraldSky');
  const canvas = document.getElementById('emeraldSkyCanvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!root || !ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...root.querySelectorAll('button[data-sky-mode]')];
  const phaseLabel = document.getElementById('skyPhaseLabel');
  let width = 1, height = 1, dpr = 1, frame = null, last = 0, elapsed = 0;
  let mode = 'auto', phase = .29, night = .65, visible = true, paused = reduced.matches;
  let seed = 71327;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 310 }, () => ({ x: random(), y: random() * .88, size: .35 + random() * 1.3, phase: random() * Math.PI * 2, depth: random() }));
  // Cache the nebular dust; never repaint a large pixel-noise field per frame.
  const dust = document.createElement('canvas'); dust.width = 720; dust.height = 440;
  const dc = dust.getContext('2d');
  if (dc) {
    const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    const noise = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
      fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
      return (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy) + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
    };
    const image = dc.createImageData(dust.width, dust.height);
    for (let y = 0; y < dust.height; y++) for (let x = 0; x < dust.width; x++) {
      let n = 0, amplitude = .5, frequency = 1;
      for (let o = 0; o < 5; o++) { n += noise(x / 83 * frequency, y / 61 * frequency) * amplitude; frequency *= 2.03; amplitude *= .5; }
      const axis = y / dust.height - (.82 - x / dust.width * .64);
      const band = Math.exp(-axis * axis * 25);
      const density = Math.max(0, n - .28) * band;
      const i = (y * dust.width + x) * 4;
      image.data[i] = 110 + n * 98; image.data[i + 1] = 126 + n * 94; image.data[i + 2] = 169 + n * 72;
      image.data[i + 3] = Math.min(122, density * 236);
    }
    dc.putImageData(image, 0, 0);
  }
  function lighting() {
    const target = mode === 'day' ? 0 : mode === 'dusk' ? .5 : mode === 'night' ? 1 : (1 - Math.cos(phase * Math.PI * 2)) / 2;
    night = target;
    root.style.setProperty('--sky-night', night.toFixed(3));
    root.style.setProperty('--sky-day', (1 - night).toFixed(3));
    root.style.setProperty('--sky-dusk', (1 - Math.abs(night * 2 - 1)).toFixed(3));
    const label = night < .23 ? 'Daylight · a world unfolding' : night > .8 ? 'Night · worlds beyond one world' : 'Twilight · a threshold between worlds';
    if (phaseLabel.textContent !== label) phaseLabel.textContent = label;
    root.dataset.skyPhase = night < .23 ? 'day' : night > .8 ? 'night' : 'dusk';
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#060d20'); bg.addColorStop(.55, '#102237'); bg.addColorStop(1, '#092019');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = .25 + night * .75;
    const drift = Math.sin(elapsed * .004) * 8;
    ctx.drawImage(dust, -30 + drift, -12, width + 60, height * .9);
    for (const star of stars) {
      const x = ((star.x * width + elapsed * .28 * star.depth) % width + width) % width;
      const y = star.y * height;
      const twinkle = .65 + .35 * Math.sin(elapsed * .45 + star.phase);
      ctx.globalAlpha = (.14 + night * .86) * twinkle;
      ctx.fillStyle = star.depth > .7 ? '#f9e9c6' : '#c7e7f0';
      ctx.beginPath(); ctx.arc(x, y, star.size, 0, Math.PI * 2); ctx.fill();
      if (star.size > 1.5) { ctx.globalAlpha *= .24; ctx.beginPath(); ctx.arc(x, y, star.size * 3.8, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    canvas.dataset.skyTime = elapsed.toFixed(2);
  }
  function resize() {
    const rect = root.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw();
  }
  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden) return;
    if (!last || now - last >= 50) {
      const dt = last ? Math.min((now - last) / 1000, .2) : 0; last = now;
      elapsed += dt;
      if (mode === 'auto') { phase = (phase + dt / 240) % 1; lighting(); }
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0;
    const running = !paused && visible && !document.hidden;
    root.dataset.motion = running ? 'running' : 'paused';
    canvas.dataset.skyState = running ? 'running' : paused ? 'paused' : 'offscreen';
    if (running) frame = requestAnimationFrame(tick);
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.skyMode; root.dataset.skyMode = mode;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    lighting(); draw();
  }));
  const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio > .01; sync(); }, { threshold: .01 });
  observer.observe(root); new ResizeObserver(resize).observe(root);
  document.addEventListener('visibilitychange', sync);
  window.EmeraldSky = { pause(value) { paused = Boolean(value); sync(); } };
  lighting(); resize(); sync();
})();
