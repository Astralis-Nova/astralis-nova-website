(() => {
  'use strict';
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;
  const landscape = new Image();
  const ark = new Image();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  const plate = document.createElement('canvas');
  const shipPlate = document.createElement('canvas');
  const lightPlate = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const plateContext = plate.getContext('2d');
  const shipContext = shipPlate.getContext('2d');
  const lightContext = lightPlate.getContext('2d');
  if (!context || !plateContext || !shipContext || !lightContext) return;
  canvas.className = 'rp-living-flood';
  canvas.setAttribute('aria-hidden', 'true');
  const backdrop = document.createElement('img');
  backdrop.className = 'rp-ancient-landscape';
  backdrop.alt = 'An imagined ancient landscape after the flood: rugged mountains, exposed stone, bare trees and receding water.';
  backdrop.src = '/assets/rainbow-promise/ancient-flood-landscape-clean.webp';
  const style = document.createElement('style');
  style.textContent = `
    .rp-ancient-landscape,.rp-living-flood{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
    .rp-ancient-landscape{z-index:1;object-fit:cover;object-position:center center}
    .rp-living-flood{z-index:18}
    .rp-ancient-ready .rp-sky,.rp-ancient-ready .rp-cloud-photo,.rp-ancient-ready .rp-water,
    .rp-ancient-ready .rp-water-glint,.rp-ancient-ready .rp-shimmer-band,
    .rp-ancient-ready .rp-ark-group,.rp-ancient-ready .rp-ark-reflection{display:none}
    .rp-ancient-ready .rp-covenant-halo{opacity:.12;animation:none;bottom:25%}
    .rp-ancient-ready .rp-covenant-ring,.rp-ancient-ready .rp-covenant-motes{display:none}
    .rp-ancient-ready .rp-sunbreak{left:78%;opacity:.1;animation:none}
    .rp-ancient-ready .rp-covenant-beam{opacity:.1;animation:none}
    .rp-ancient-ready .rp-vapor{opacity:.2;bottom:39%}
    .rp-covenant-motion .rp-ancient-ready::before{background:linear-gradient(180deg,transparent 55%,rgba(3,9,16,.12))}
    .rp-covenant-motion .rp-ancient-ready::after{box-shadow:inset 0 0 55px rgba(1,6,11,.13),inset 0 -70px 85px rgba(2,7,12,.28)}
    .rp-ancient-ready .rp-credit{max-width:43%;padding:8px 10px;border-radius:12px;background:rgba(4,14,21,.58);font-size:.55rem}
    .rp-ancient-ready .rp-credit details{max-width:100%}.rp-ancient-ready .rp-credit summary{cursor:pointer;min-height:24px;line-height:24px}
    .rp-ancient-ready .rp-credit p{font-size:inherit;line-height:1.45;margin:4px 0;max-width:280px;color:inherit}
    .rp-ancient-ready .rp-caption{background:linear-gradient(180deg,rgba(8,23,40,.25),rgba(4,11,19,.74))}
    @media(max-width:700px){.rp-ancient-ready .rp-credit{top:12px;max-width:52%}.rp-ancient-ready .rp-caption span{font-size:.76rem}}
  `;
  let width = 0, height = 0, frame = 0, lastDraw = -Infinity;
  let lastTick = null, elapsed = 0, waterPixels = null;
  let visible = true, disposed = false, ready = false;

  function resize() {
    width = Math.max(1, wrap.clientWidth);
    height = Math.max(1, wrap.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    shipPlate.width = Math.ceil(width * ratio);
    shipPlate.height = Math.ceil(height * ratio);
    shipContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    // A small normal-lighting buffer supplies moving slopes and glints without
    // reading the full photograph or running a full-resolution CPU shader.
    lightPlate.width = Math.ceil(width / 12);
    lightPlate.height = Math.ceil(height * .44 / 5);
    waterPixels = lightContext.createImageData(lightPlate.width, lightPlate.height);
    // Cache exactly the same centered cover crop as the static landscape.
    plate.width = Math.ceil(width + 32);
    plate.height = Math.ceil(height + 16);
    const scale = Math.max(width / landscape.naturalWidth, height / landscape.naturalHeight);
    const sw = landscape.naturalWidth * scale, sh = landscape.naturalHeight * scale;
    plateContext.clearRect(0, 0, plate.width, plate.height);
    plateContext.drawImage(landscape, 16 + (width - sw) / 2, 8 + (height - sh) / 2, sw, sh);
    draw(motion.matches ? 0 : elapsed);
  }

  // Three crossing wave trains in perspective space: long swell, shorter wind
  // waves and capillary detail. Phase travels through the scene; wave size and
  // texture displacement grow towards the viewer while the shoreline stays put.
  function waterAt(x, y, seconds) {
    const depth = Math.max(0, Math.min(1, (y / height - .56) / .44));
    const perspective = .17 + depth * .83;
    const u = (x / width - .5) / perspective, v = 1 / perspective;
    const p = u * 7.4 + v * 9.3 - seconds * .86;
    const q = u * 16.1 - v * 18.9 - seconds * 1.42;
    const r = u * 45 + v * 40 - seconds * 2.05;
    return {
      height: depth * (9 * Math.sin(p) + 3.8 * Math.sin(q) + 1.1 * Math.sin(r)),
      slope: .43 * Math.cos(p) + .23 * Math.cos(q) + .09 * Math.cos(r),
      glint: Math.max(0, Math.cos(p) * .68 + Math.cos(q) * .32) ** 8 * depth,
      drift: depth * (Math.cos(p) * 4.5 + Math.sin(q) * 1.8)
    };
  }

  function lightWater(seconds) {
    const data = waterPixels.data;
    for (let row = 0; row < lightPlate.height; row++) for (let col = 0; col < lightPlate.width; col++) {
      const y = height * .56 + (row + .5) / lightPlate.height * height * .44;
      const wave = waterAt((col + .5) / lightPlate.width * width, y, seconds);
      const sun = wave.slope > 0;
      const i = (row * lightPlate.width + col) * 4;
      data[i] = sun ? 210 : 4;
      data[i + 1] = sun ? 216 : 20;
      data[i + 2] = sun ? 204 : 31;
      const shoreFade = Math.min(1, (y - height * .56) / 35);
      data[i + 3] = Math.round(Math.min(65, Math.abs(wave.slope) * 34 + wave.glint * 47) * shoreFade);
    }
    lightContext.putImageData(waterPixels, 0, 0);
  }

  function draw(seconds) {
    context.clearRect(0, 0, width, height);
    // The generated plate's open water starts below its rocky shoreline.
    // Leave all land still; displacement grows gradually towards the viewer.
    const start = height * .56;
    const still = motion.matches;
    const t = still ? 0 : seconds;
    for (let y = start; y < height; y += 3) {
      const wave = waterAt(width * .5, y, t);
      const dx = wave.drift;
      const dy = wave.height * .32;
      const band = Math.min(3, height - y);
      context.drawImage(plate, 16 + dx, 8 + y + dy, width, band, 0, y, width, band + .35);
    }

    const shipWidth = Math.min(860, width * (width < 700 ? .93 : .76));
    const shipHeight = shipWidth * ark.naturalHeight / ark.naturalWidth;
    const waterline = height * .715;
    const swell = (x, time = t) => waterAt(x, waterline, time).height;
    // A heavy hull responds more slowly than the passing crest. Water continues
    // moving independently and intermittently covers/reveals the wet timber.
    // Sample the wave under the whole hull, with a delayed, damped response.
    // A crest moving past one end must not lift the entire vessel instantly.
    const heave = (swell(width * .5, t - .72) * .5 +
      swell(width * .5 - shipWidth * .3, t - .72) * .25 +
      swell(width * .5 + shipWidth * .3, t - .72) * .25) * .82;
    const sway = Math.sin(t * .33) * width * .0024;
    const surge = Math.sin(t * .41 - .3) * .8;
    const left = (width - shipWidth) / 2 + sway;
    const pitch = Math.atan2(swell(left + shipWidth, t - .55) - swell(left, t - .55), shipWidth) * .58;
    const aboveWater = .79;
    const visibleHeight = shipHeight * aboveWater;
    const surface = x => waterline + swell(x);
    const waveEdge = () => {
      context.moveTo(0, surface(0));
      for (let x = 8; x < width; x += 8) context.lineTo(x, surface(x));
      context.lineTo(width, surface(width));
    };
    shipContext.clearRect(0, 0, width, height);
    shipContext.save();
    shipContext.translate(width / 2 + sway, waterline + heave + surge);
    shipContext.rotate(pitch);
    shipContext.drawImage(ark, -shipWidth / 2, -visibleHeight, shipWidth, shipHeight);
    shipContext.restore();

    // Reflect the actual timber image from the waterline down, broken into
    // independent narrow strips rather than a blurred generic ship silhouette.
    for (let y = 0; y < visibleHeight; y += 3) {
      const band = Math.min(3, visibleHeight - y);
      const fraction = y / visibleHeight;
      context.globalAlpha = .38 * (1 - fraction) ** 1.7;
      const reflectedWave = waterAt(width * .5, waterline + y * .65, t);
      const ripple = reflectedWave.drift * (1 + fraction) + Math.sin(y * .21 - t * 1.5) * (1 + fraction * 5);
      const ratio = shipPlate.width / width;
      const sy = Math.max(0, waterline - y - band);
      context.drawImage(shipPlate, 0, sy * ratio, shipPlate.width, band * ratio,
        ripple, waterline + swell(width / 2) + y * .65 + reflectedWave.height * .16, width, band * .65 + .6);
    }
    context.globalAlpha = 1;
    lightWater(t);
    context.drawImage(lightPlate, 0, start, width, height - start);

    // Soft contact shadow gives the hull weight without a hard sticker outline.
    context.save();
    context.globalAlpha = .27;
    const shadow = context.createRadialGradient(width / 2 + sway, waterline, 2, width / 2 + sway, waterline, shipWidth * .55);
    shadow.addColorStop(0, '#07121b'); shadow.addColorStop(1, 'rgba(7,18,27,0)');
    context.fillStyle = shadow;
    context.translate(0, waterline); context.scale(1, .055);
    context.beginPath(); context.ellipse(width / 2 + sway, 0, shipWidth * .55, shipWidth * .5, 0, 0, Math.PI * 2); context.fill();
    context.restore();
    // The clipping boundary is the water's moving surface, not the ship's pose.
    context.save();
    context.beginPath(); waveEdge();
    context.lineTo(width, 0); context.lineTo(0, 0); context.closePath(); context.clip();
    context.drawImage(shipPlate, 0, 0, width, height);
    context.restore();

    // A thin sheet of actual water washes over the wet lower timbers. Its top
    // edge is the same wave field used by the lighting, flotation and reflection.
    context.save();
    context.beginPath();
    context.moveTo(left + 8, surface(left + 8) - .5);
    for (let x = left + 16; x < left + shipWidth - 8; x += 8) context.lineTo(x, surface(x) - .5);
    context.lineTo(left + shipWidth - 8, waterline + 12);
    context.lineTo(left + 8, waterline + 12); context.closePath(); context.clip();
    context.globalAlpha = .82;
    context.drawImage(plate, 16, 8 + waterline - 8, width, 22, 0, waterline - 8, width, 22);
    context.restore();

    // A drifting ark displaces water gently, without a motorboat's V wake.
    for (let i = 0; i < 3; i++) {
      const phase = ((t * .14 + i / 3) % 1);
      const fade = Math.sin(phase * Math.PI) * .065;
      context.strokeStyle = `rgba(203,221,220,${fade.toFixed(4)})`;
      context.lineWidth = .6 + phase * .8;
      context.beginPath();
      context.ellipse(width / 2 + sway, surface(width / 2) + 4 + phase * 16, shipWidth * (.47 + phase * .13), 3 + phase * 13, 0, .05, Math.PI - .05);
      context.stroke();
    }
    // Short irregular wavelets hide the cutout seam where wet timber meets water.
    for (let i = 0; i < 35; i++) {
      const x = left + shipWidth * (.045 + i / 38);
      const wave = waterAt(x, waterline, t);
      const pulse = Math.max(0, wave.slope);
      context.strokeStyle = `rgba(205,221,216,${(.09 + .28 * pulse).toFixed(4)})`;
      context.lineWidth = .7 + pulse * 1.1;
      context.beginPath(); context.moveTo(x, surface(x) + .4);
      const end = x + 5 + (i % 4) * 2;
      context.quadraticCurveTo((x + end) / 2, surface(x) - 1.2, end, surface(end) + .3); context.stroke();
    }
    wrap.dataset.arkWaterTime = seconds.toFixed(2);
    wrap.dataset.arkHeave = heave.toFixed(3);
    wrap.dataset.arkPitch = pitch.toFixed(5);
    wrap.dataset.arkSurface = surface(width / 2).toFixed(3);
  }

  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || !visible || motion.matches) return;
    if (lastTick !== null) elapsed += Math.min(80, now - lastTick) / 1000;
    lastTick = now;
    if (now - lastDraw >= 1000 / 30) { draw(elapsed); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
    lastTick = null;
    if (!ready || disposed) return;
    if (motion.matches) draw(0);
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => ready && resize()) : null;
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true; sync();
  }, {rootMargin: '80px'}) : null;
  const onResize = () => ready && resize();
  function activate() {
    if (disposed || ready || !landscape.naturalWidth || !ark.naturalWidth) return;
    ready = true;
    document.head.appendChild(style);
    wrap.prepend(backdrop); wrap.appendChild(canvas);
    wrap.classList.add('rp-ancient-ready');
    wrap.querySelector('.rp-ark-group')?.setAttribute('aria-label', 'A reconstructed timber ark afloat on receding floodwaters below an imagined ancient mountain landscape');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Noah’s Ark after the storm, an artistic interpretation of Genesis with moving water, rugged land and a rainbow');
    const caption = wrap.querySelector('.rp-caption');
    if (caption) caption.innerHTML = '<div><strong>The waters recede. The mountains emerge. Hope remains.</strong><span>A timber ark rides the swell beneath a rainbow, beside flood-scoured rock and ancient uplands inspired by Genesis 6–9.</span></div><div class="rp-tag">After the storm</div>';
    const credit = wrap.querySelector('.rp-credit');
    if (credit) {
      const originalCredits = credit.innerHTML.replace(/^Storm and Ark texture:.*?<br>/, '');
      credit.innerHTML = `<details><summary>Scene &amp; image credits</summary><p>Ark, landscape and full bird flight poses: AI-created artistic reconstruction. The story’s precise date, terrain and vessel details are not established.</p><p>${originalCredits}</p><p><a href="https://www.biblegateway.com/passage/?search=Genesis%206%3A14-16%3B8%3A3-5&amp;version=KJV" target="_blank" rel="noopener">Genesis: timber ark, proportions and mountains</a></p></details>`;
    }
    resize(); resizeObserver?.observe(wrap); observer?.observe(wrap);
    if (!resizeObserver) window.addEventListener('resize', onResize, {passive: true});
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
  }
  landscape.onload = activate; ark.onload = activate;
  // Keep the existing scene if either local asset cannot load.
  landscape.src = '/assets/rainbow-promise/ancient-flood-landscape-clean.webp';
  ark.src = '/assets/rainbow-promise/timber-ark.webp';
  if (landscape.complete && ark.complete) activate();
  window.addEventListener('pagehide', () => {
    disposed = true; cancelAnimationFrame(frame);
    resizeObserver?.disconnect(); observer?.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    window.removeEventListener('resize', onResize);
  }, {once: true});
})();
