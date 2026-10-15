(() => {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const radians = Math.PI / 180;
  // Approximate visible-light water dispersion. Geometrical caustics locate
  // each wavelength; finite widths stand in for droplet size and camera blur.
  function caustic(wavelength, order = 1) {
    const n = 1.324 + .003 / (wavelength / 1000) ** 2;
    const k = order + 1;
    const i = Math.asin(Math.sqrt((k * k - n * n) / (k * k - 1)));
    const r = Math.asin(Math.sin(i) / n);
    return (order === 1 ? 4 * r - 2 * i : Math.PI + 2 * i - 6 * r) / radians;
  }
  function spectralRGB(w) {
    let r = 0, g = 0, b = 0;
    if (w < 440) { r = (440 - w) / 60; b = 1; }
    else if (w < 490) { g = (w - 440) / 50; b = 1; }
    else if (w < 510) { g = 1; b = (510 - w) / 20; }
    else if (w < 580) { r = (w - 510) / 70; g = 1; }
    else if (w < 645) { r = 1; g = (645 - w) / 65; }
    else r = 1;
    const sensitivity = w < 420 ? .35 + .65 * (w - 380) / 40 : w > 700 ? 1 - .5 * (w - 700) / 40 : 1;
    return [r, g, b].map(value => value * sensitivity);
  }
  function spectrum(order) {
    const count = 1536, rows = [], step = 65 / (count - 1);
    let peak = 0;
    const lines = [];
    for (let w = 380; w <= 720; w += 8) lines.push({ angle: caustic(w, order), rgb: spectralRGB(w) });
    for (let index = 0; index < count; index++) {
      const angle = index * step, rgb = [0, 0, 0];
      for (const line of lines) {
        const delta = angle - line.angle;
        const width = order === 1 ? .16 : .22;
        const edge = Math.exp(-.5 * (delta / width) ** 2);
        const inner = order === 1 ? -delta : delta;
        const tail = inner > 0 ? .10 * Math.exp(-inner / .8) * smooth(0, .15, inner) : 0;
        const color = line.rgb;
        for (let c = 0; c < 3; c++) rgb[c] += color[c] * (edge + tail);
      }
      const intensity = Math.max(...rgb);
      peak = Math.max(peak, intensity);
      rows.push({ rgb, intensity });
    }
    return rows.map(({ rgb, intensity }) => [
      ...rgb.map(value => Math.round(255 * (.16 + .84 * Math.pow(value / Math.max(.00001, intensity), .85)))),
      clamp(intensity / peak) * (order === 1 ? .52 : .14)
    ]);
  }
  const primarySpectrum = spectrum(1), secondarySpectrum = spectrum(2);
  function state(seconds, still = false) {
    const t = still ? 16 : ((seconds % 42) + 42) % 42;
    return {
      t,
      primary: smooth(1.5, 10.5, t) * (1 - smooth(23, 33, t)),
      secondary: smooth(9, 16, t) * (1 - smooth(21, 29, t))
    };
  }
  function rainDensity(x, t) {
    return clamp(.65 + .26 * Math.sin(x * 5.3 - t * .13 + .7) + .22 * Math.sin(x * 10.6 + t * .17 + 1.3));
  }
  function plates(width, height) {
    const primary = new Uint8ClampedArray(width * height * 4);
    const secondary = new Uint8ClampedArray(primary.length);
    const atmosphere = new Uint8ClampedArray(primary.length);
    const scale = Math.max(width / 1536, height / 1024);
    const left = (width - 1536 * scale) / 2, top = (height - 1024 * scale) / 2;
    const focal = 680 / Math.tan(caustic(700) * radians);
    for (let y = 0; y < height; y++) {
      const sy = (y - top) / scale;
      const horizon = 1 - smooth(445, 625, sy);
      if (horizon === 0 || sy > 800) continue;
      for (let x = 0; x < width; x++) {
        const sx = (x - left) / scale;
        const angle = Math.atan2(Math.hypot(sx - 768, sy - 800), focal) / radians;
        const index = Math.min(1535, Math.round(angle / 65 * 1535));
        const i = (y * width + x) * 4, p = primarySpectrum[index], q = secondarySpectrum[index];
        const rainTexture = .96 + .04 * Math.sin(sx * .095 + sy * .003) * Math.sin(sx * .031);
        primary[i] = p[0]; primary[i + 1] = p[1]; primary[i + 2] = p[2];
        primary[i + 3] = Math.round(p[3] * horizon * rainTexture * 255);
        secondary[i] = q[0]; secondary[i + 1] = q[1]; secondary[i + 2] = q[2];
        secondary[i + 3] = Math.round(q[3] * horizon * rainTexture * 255);
        // Scattered white light inside; a restrained darker gap outside the bow.
        const interior = (1 - smooth(38.5, 41, angle)) * .055;
        const darkBand = smooth(42.7, 44.2, angle) * (1 - smooth(48.5, 50.3, angle)) * .065;
        const color = interior > 0 ? 239 : 13;
        atmosphere[i] = color; atmosphere[i + 1] = interior > 0 ? 242 : 24; atmosphere[i + 2] = interior > 0 ? 237 : 34;
        atmosphere[i + 3] = Math.round(Math.max(interior, darkBand) * horizon * 255);
      }
    }
    return { width, height, primary, secondary, atmosphere };
  }
  function renderer(canvas, makeCanvas, shadeCanvas = null) {
    const ctx = canvas.getContext('2d');
    const shade = shadeCanvas?.getContext('2d');
    if (!ctx) return null;
    const layers = {}, veil = makeCanvas(), v = veil.getContext('2d');
    let width = 0, height = 0;
    function resize(w, h, ratio = 1) {
      const scale = Math.min(ratio, 1, 640 / w, 480 / h);
      const nextWidth = Math.max(1, Math.round(w * scale)), nextHeight = Math.max(1, Math.round(h * scale));
      if (width === nextWidth && height === nextHeight) return;
      width = canvas.width = nextWidth; height = canvas.height = nextHeight;
      if (shadeCanvas) { shadeCanvas.width = width; shadeCanvas.height = height; }
      veil.width = width; veil.height = height;
      const data = plates(width, height);
      for (const name of ['primary', 'secondary', 'atmosphere']) {
        const plate = layers[name] || (layers[name] = makeCanvas());
        plate.width = width; plate.height = height;
        const c = plate.getContext('2d'), pixels = c.createImageData(width, height);
        pixels.data.set(data[name]); c.putImageData(pixels, 0, 0);
      }
    }
    function curtain(t, offset = 0) {
      // Broad drifting rain shafts modulate sections of the bow independently.
      v.clearRect(0, 0, width, height);
      const density = v.createLinearGradient(0, 0, width, height * .2);
      for (let i = 0; i <= 24; i++) density.addColorStop(i / 24, `rgba(255,255,255,${rainDensity(i / 24, t + offset).toFixed(4)})`);
      v.fillStyle = density; v.fillRect(0, 0, width, height);
    }
    function draw(seconds, still = false) {
      const p = state(seconds, still);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      if (shade) {
        shade.clearRect(0, 0, width, height); shade.globalAlpha = p.primary;
        shade.drawImage(layers.atmosphere, 0, 0); shade.globalAlpha = 1;
      } else {
        ctx.globalAlpha = p.primary; ctx.drawImage(layers.atmosphere, 0, 0);
      }
      // Each light plate is masked offscreen, so the darker optical gap remains
      // below the light instead of being erased by destination-in compositing.
      for (const [name, strength, offset] of [['primary', p.primary, 0], ['secondary', p.secondary, 4]]) {
        curtain(p.t, offset);
        v.globalCompositeOperation = 'source-in';
        v.drawImage(layers[name], 0, 0);
        v.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = strength; ctx.drawImage(veil, 0, 0);
      }
      ctx.globalAlpha = 1;
      return p;
    }
    return { resize, draw };
  }
  window.RainbowPromiseOptics = { caustic, state, rainDensity, plates, renderer };
  if (typeof document === 'undefined') return;
  const wrap = document.querySelector('.rainbow-wrap');
  const fallback = wrap?.querySelector('.rp-rainbow-light');
  if (!wrap || !fallback) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'rp-rainbow-optics';
  canvas.setAttribute('aria-hidden', 'true');
  const shadeCanvas = document.createElement('canvas');
  shadeCanvas.className = 'rp-rainbow-shade'; shadeCanvas.setAttribute('aria-hidden', 'true');
  const paint = renderer(canvas, () => document.createElement('canvas'), shadeCanvas);
  if (!paint) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, last = null, painted = -Infinity, elapsed = 0, visible = true, disposed = false;
  function draw() {
    const p = paint.draw(elapsed, motion.matches);
    canvas.dataset.rainbowTime = p.t.toFixed(3);
    canvas.dataset.rainbowStrength = p.primary.toFixed(3);
  }
  function resize() { paint.resize(wrap.clientWidth, wrap.clientHeight, window.devicePixelRatio || 1); draw(); }
  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || !visible || motion.matches) { last = null; return; }
    if (last !== null) elapsed += Math.min(80, Math.max(0, now - last)) / 1000;
    last = now;
    if (now - painted >= 1000 / 12) { draw(); painted = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = null;
    if (disposed) return;
    if (motion.matches) draw();
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }
  resize(); wrap.appendChild(shadeCanvas); wrap.appendChild(canvas); fallback.hidden = true;
  const size = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  const visibility = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: '80px' }) : null;
  size?.observe(wrap); visibility?.observe(wrap);
  if (!size) window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync);
  sync();
  window.addEventListener('pagehide', () => {
    disposed = true; cancelAnimationFrame(frame); size?.disconnect(); visibility?.disconnect();
    document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync);
    window.removeEventListener('resize', resize);
  }, { once: true });
})();
