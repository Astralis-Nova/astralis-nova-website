(() => {
  'use strict';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Conservative upper skyline of the retained 1536x1024 landscape. A soft
  // margin keeps every rock stationary while cloud texture moves above it.
  const ridge = [[0,247],[48,250],[88,242],[108,246],[146,257],[180,268],[214,252],[248,239],[269,243],[299,238],[316,240],[337,225],[350,225],[368,208],[388,212],[407,188],[444,183],[469,177],[491,183],[520,182],[537,202],[559,215],[581,214],[595,234],[618,231],[638,249],[662,245],[679,254],[702,282],[731,285],[763,270],[792,282],[813,287],[838,282],[875,278],[897,267],[920,288],[948,300],[982,316],[1007,313],[1027,327],[1053,335],[1080,339],[1104,350],[1130,348],[1166,340],[1194,327],[1218,327],[1241,341],[1277,342],[1304,333],[1326,347],[1353,342],[1377,351],[1400,349],[1427,354],[1457,346],[1476,355],[1504,353],[1536,356]];
  function ridgeAt(x) {
    x = clamp(x, 0, 1536);
    for (let i = 1; i < ridge.length; i++) if (x <= ridge[i][0]) {
      const a = ridge[i - 1], b = ridge[i];
      return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    }
    return ridge[ridge.length - 1][1];
  }
  const skyline = Float32Array.from({ length: 1536 }, (_, x) => ridgeAt(x));
  function lightAt(seconds, still = false) {
    const t = still ? 0 : seconds;
    const strength = clamp(.5 + .25 * Math.sin(t * .11 - .8) + .14 * Math.sin(t * .037 + .9));
    return { strength, warmth: .025 + strength * .045, shaft: .02 + strength * .055 };
  }
  function advection(seconds) {
    return [48, 0].map(offset => {
      const phase = ((seconds + offset) % 96 + 96) % 96;
      return { age: phase - 48, weight: Math.sin(phase * Math.PI / 96) ** 2 };
    });
  }
  function renderer(cloudCanvas, sunCanvas, image, makeCanvas) {
    const clouds = cloudCanvas.getContext('2d'), sun = sunCanvas.getContext('2d');
    if (!clouds || !sun) return null;
    const texture = makeCanvas(); texture.width = 1536; texture.height = 430;
    const tc = texture.getContext('2d');
    if (!tc) return null;
    tc.drawImage(image, 0, 0, 1536, 1024);
    let pixels;
    try { pixels = tc.getImageData(0, 0, 1536, 430).data; } catch (_) { return null; }
    let width = 0, height = 0, scale, left, top, data, mask, warm, xs, ys, sinX, cosX, sinFine, cosFine;
    const sample = new Float64Array(3), second = new Float64Array(3);
    function read(x, y, output) {
      // Reflect texture edges; never borrow a mountain pixel into the sky.
      x = Math.abs(x % 3070); if (x > 1535) x = 3070 - x;
      y = clamp(y, 0, Math.min(428, skyline[Math.round(x)] - 16));
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      const a = (iy * 1536 + ix) * 4, b = (iy * 1536 + Math.min(ix + 1, 1535)) * 4;
      const c = a + 1536 * 4, d = b + 1536 * 4;
      for (let k = 0; k < 3; k++) output[k] = (pixels[a + k] * (1 - fx) + pixels[b + k] * fx) * (1 - fy) + (pixels[c + k] * (1 - fx) + pixels[d + k] * fx) * fy;
    }
    function resize(w, h, ratio = 1) {
      const factor = Math.min(ratio, 1, 640 / w, 360 / h);
      const nw = Math.max(1, Math.round(w * factor)), nh = Math.max(1, Math.round(h * factor));
      if (nw === width && nh === height) return;
      width = cloudCanvas.width = sunCanvas.width = nw;
      height = cloudCanvas.height = sunCanvas.height = nh;
      scale = Math.max(width / 1536, height / 1024);
      left = (width - 1536 * scale) / 2; top = (height - 1024 * scale) / 2;
      const rows = Math.max(1, Math.min(height, Math.ceil(430 * scale + top)));
      data = clouds.createImageData(width, rows);
      mask = new Float32Array(width * rows); warm = new Float32Array(mask.length);
      xs = new Float32Array(width); ys = new Float32Array(rows);
      sinX = new Float32Array(width); cosX = new Float32Array(width); sinFine = new Float32Array(width); cosFine = new Float32Array(width);
      for (let x = 0; x < width; x++) {
        xs[x] = (x - left) / scale;
        sinX[x] = Math.sin(xs[x] * .008); cosX[x] = Math.cos(xs[x] * .008);
        sinFine[x] = Math.sin(xs[x] * .017); cosFine[x] = Math.cos(xs[x] * .017);
      }
      for (let y = 0; y < rows; y++) {
        ys[y] = (y - top) / scale;
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          mask[i] = smooth(4, 34, ridgeAt(xs[x]) - ys[y]);
          warm[i] = Math.exp(-(((xs[x] - 1260) / 350) ** 2) - ((ys[y] - 150) / 300) ** 2);
        }
      }
    }
    function drawSun(t, light) {
      sun.clearRect(0, 0, width, height);
      sun.save(); sun.translate(left, top); sun.scale(scale, scale);
      // Warm ambient illumination changes slowly with the same cloud opening
      // used by the reflected highlights on the floodwater.
      const grade = sun.createLinearGradient(0, 230, 0, 750);
      grade.addColorStop(0, `rgba(255,205,133,${light.warmth})`);
      grade.addColorStop(.64, `rgba(255,191,104,${light.warmth * .58})`);
      grade.addColorStop(1, 'rgba(255,191,104,0)');
      sun.fillStyle = grade; sun.fillRect(0, 0, 1536, 1024);
      sun.globalCompositeOperation = 'screen';
      sun.filter = 'blur(13px)';
      for (let i = 0; i < 7; i++) {
        const origin = 1240 + i * 12, end = 470 + i * 135;
        const spread = 21 + i % 3 * 12;
        const modulation = .6 + .4 * Math.sin(t * (.065 + i * .007) + i * 1.8) ** 2;
        const beam = sun.createLinearGradient(origin, 140, end, 870);
        beam.addColorStop(0, `rgba(255,238,198,${light.shaft * modulation})`);
        beam.addColorStop(.48, `rgba(255,222,167,${light.shaft * modulation * .75})`);
        beam.addColorStop(1, 'rgba(255,210,140,0)');
        sun.fillStyle = beam; sun.beginPath();
        sun.moveTo(origin - 5, 125); sun.lineTo(origin + 5, 125);
        sun.lineTo(end + spread, 870); sun.lineTo(end - spread, 870); sun.closePath(); sun.fill();
      }
      sun.filter = 'none';
      const glow = sun.createRadialGradient(1260, 135, 8, 1260, 135, 340);
      glow.addColorStop(0, `rgba(255,247,220,${.12 + light.strength * .2})`);
      glow.addColorStop(.25, `rgba(255,220,161,${light.strength * .15})`);
      glow.addColorStop(.65, `rgba(255,190,112,${light.strength * .055})`);
      glow.addColorStop(1, 'rgba(255,190,112,0)');
      sun.fillStyle = glow; sun.fillRect(900, 0, 636, 560);
      sun.restore();
    }
    function draw(seconds, still = false) {
      const t = still ? 0 : seconds, light = lightAt(t), phases = advection(t);
      const output = data.data;
      for (let y = 0; y < ys.length; y++) {
        const sy = ys[y], speed = 1.1 + (1 - sy / 500) * .85;
        const a = sy * .011 + t * .11, b = -sy * .009 - t * .08;
        const sa = Math.sin(a), ca = Math.cos(a), sb = Math.sin(b), cb = Math.cos(b);
        const vertical = Math.cos(sy * .013 + t * .09) * 2;
        for (let x = 0; x < width; x++) {
          const i = y * width + x, index = i * 4;
          if (mask[i] === 0) { output[index + 3] = 0; continue; }
          const sx = xs[x];
          const billow = still ? 0 : (sinX[x] * ca + cosX[x] * sa) * 4 + (sinFine[x] * cb + cosFine[x] * sb) * 2;
          const lift = still ? 0 : Math.sin(sx * .006 + t * .06) * 3 + vertical;
          if (still) read(sx, sy, sample);
          else {
            read(sx - phases[0].age * speed + billow, sy + lift + phases[0].age * .025, sample);
            read(sx - phases[1].age * speed + billow, sy + lift + phases[1].age * .025, second);
            for (let c = 0; c < 3; c++) sample[c] = sample[c] * phases[0].weight + second[c] * phases[1].weight;
          }
          const gain = .975 + warm[i] * (.01 + light.strength * .045);
          output[index] = sample[0] * gain + warm[i] * light.strength * 2;
          output[index + 1] = sample[1] * gain;
          output[index + 2] = sample[2] * gain - warm[i] * light.strength * 2;
          output[index + 3] = mask[i] * 255;
        }
      }
      clouds.putImageData(data, 0, 0); drawSun(t, light);
      return light;
    }
    return { resize, draw };
  }
  window.RainbowPromiseSky = { ridgeAt, lightAt, advection, renderer };
  if (typeof document === 'undefined') return;
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;
  const image = new Image(), cloudCanvas = document.createElement('canvas'), sunCanvas = document.createElement('canvas');
  cloudCanvas.className = 'rp-living-sky'; sunCanvas.className = 'rp-sun-warmth';
  for (const canvas of [cloudCanvas, sunCanvas]) canvas.setAttribute('aria-hidden', 'true');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paint, frame = 0, last = null, lastPaint = -Infinity, elapsed = 0, visible = true, disposed = false;
  let size, visibility;
  const style = document.createElement('style');
  style.textContent = '.rp-living-sky,.rp-sun-warmth{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.rp-living-sky{z-index:2}.rp-sun-warmth{z-index:7}.rp-sky-ready .rp-sunbreak,.rp-sky-ready .rp-covenant-beam{display:none}';
  function draw() { const light = paint.draw(elapsed, motion.matches); cloudCanvas.dataset.skyTime = (motion.matches ? 0 : elapsed).toFixed(3); sunCanvas.dataset.sunlight = light.strength.toFixed(3); }
  function resize() { if (paint) { paint.resize(wrap.clientWidth, wrap.clientHeight, window.devicePixelRatio || 1); draw(); } }
  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || !visible || motion.matches) { last = null; return; }
    if (last !== null) elapsed += Math.min(80, Math.max(0, now - last)) / 1000;
    last = now;
    if (now - lastPaint >= 125) { draw(); lastPaint = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = null;
    if (!paint || disposed) return;
    if (motion.matches) draw();
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }
  image.onload = () => {
    if (disposed || paint) return;
    paint = renderer(cloudCanvas, sunCanvas, image, () => document.createElement('canvas'));
    if (!paint) return;
    document.head.appendChild(style); resize();
    wrap.appendChild(cloudCanvas); wrap.appendChild(sunCanvas); wrap.classList.add('rp-sky-ready');
    size = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    visibility = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: '80px' }) : null;
    size?.observe(wrap); visibility?.observe(wrap);
    if (!size) window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync); sync();
  };
  image.src = '/assets/rainbow-promise/ancient-flood-landscape-clean.webp';
  window.addEventListener('pagehide', () => {
    disposed = true; cancelAnimationFrame(frame); size?.disconnect(); visibility?.disconnect(); image.onload = null;
    document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync); window.removeEventListener('resize', resize);
  }, { once: true });
})();
