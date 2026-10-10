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
  const context = canvas.getContext('2d');
  const plateContext = plate.getContext('2d');
  const shipContext = shipPlate.getContext('2d');
  if (!context || !plateContext || !shipContext) return;
  canvas.className = 'rp-living-flood';
  canvas.setAttribute('aria-hidden', 'true');
  const backdrop = document.createElement('img');
  backdrop.className = 'rp-ancient-landscape';
  backdrop.alt = 'An imagined ancient landscape after the flood: rugged mountains, exposed stone, bare trees and receding water.';
  backdrop.src = '/assets/rainbow-promise/ancient-flood-landscape.webp';
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
    // Cache exactly the same centered cover crop as the static landscape.
    plate.width = Math.ceil(width + 32);
    plate.height = Math.ceil(height + 16);
    const scale = Math.max(width / landscape.naturalWidth, height / landscape.naturalHeight);
    const sw = landscape.naturalWidth * scale, sh = landscape.naturalHeight * scale;
    plateContext.clearRect(0, 0, plate.width, plate.height);
    plateContext.drawImage(landscape, 16 + (width - sw) / 2, 8 + (height - sh) / 2, sw, sh);
    draw(0);
  }

  function draw(seconds) {
    context.clearRect(0, 0, width, height);
    // The generated plate's open water starts below its rocky shoreline.
    // Leave all land still; displacement grows gradually towards the viewer.
    const start = height * .56;
    const still = motion.matches;
    for (let y = start; y < height; y += 3) {
      const depth = (y - start) / (height - start);
      const dx = still ? 0 : (Math.sin(y * .045 - seconds * 1.1) + .42 * Math.sin(y * .093 + seconds * .7)) * depth * 6;
      const dy = still ? 0 : Math.sin(y * .035 + seconds * .9) * depth * 1.15;
      const band = Math.min(3, height - y);
      context.drawImage(plate, 16 + dx, 8 + y + dy, width, band, 0, y, width, band + .35);
    }

    const shipWidth = Math.min(860, width * (width < 700 ? .93 : .76));
    const shipHeight = shipWidth * ark.naturalHeight / ark.naturalWidth;
    const waterline = height * .715;
    const amplitude = Math.max(3, Math.min(6, height * .0075));
    const swell = x => still ? 0 : amplitude * (Math.sin((x / width - .5) * 3.8 + seconds * .85) + .33 * Math.sin((x / width - .5) * 9 - seconds * 1.4));
    // A heavy hull responds more slowly than the passing crest. Water continues
    // moving independently and intermittently covers/reveals the wet timber.
    const heave = still ? 0 : amplitude * .72 * Math.sin(seconds * .85 - .35);
    const sway = still ? 0 : Math.sin(seconds * .33) * width * .002;
    const left = (width - shipWidth) / 2 + sway;
    const roll = still ? 0 : Math.atan2(swell(left + shipWidth) - swell(left), shipWidth) * .62;
    const aboveWater = .79;
    const visibleHeight = shipHeight * aboveWater;
    const surface = x => waterline + swell(x) + (still ? 0 : Math.sin(x * .047 - seconds * 1.7) * 1.25);
    const waveEdge = () => {
      context.moveTo(0, surface(0));
      for (let x = 8; x < width; x += 8) context.lineTo(x, surface(x));
      context.lineTo(width, surface(width));
    };
    shipContext.clearRect(0, 0, width, height);
    shipContext.save();
    shipContext.translate(width / 2 + sway, waterline + heave);
    shipContext.rotate(roll);
    shipContext.drawImage(ark, -shipWidth / 2, -visibleHeight, shipWidth, shipHeight);
    shipContext.restore();

    // Reflect the actual timber image from the waterline down, broken into
    // independent narrow strips rather than a blurred generic ship silhouette.
    for (let y = 0; y < visibleHeight; y += 3) {
      const band = Math.min(3, visibleHeight - y);
      const fraction = y / visibleHeight;
      context.globalAlpha = .33 * (1 - fraction) ** 1.7;
      const ripple = Math.sin(y * .21 - seconds * 1.5) * (2 + fraction * 9);
      const ratio = shipPlate.width / width;
      const sy = Math.max(0, waterline - y - band);
      context.drawImage(shipPlate, 0, sy * ratio, shipPlate.width, band * ratio,
        ripple, waterline + swell(width / 2) + y * .65, width, band * .65 + .3);
    }
    context.globalAlpha = 1;

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

    // A drifting ark displaces water gently, without a motorboat's V wake.
    for (let i = 0; i < 5; i++) {
      const phase = ((seconds * .14 + i / 5) % 1);
      const fade = Math.sin(phase * Math.PI) * .13;
      context.strokeStyle = `rgba(203,221,220,${fade.toFixed(4)})`;
      context.lineWidth = .6 + phase * .8;
      context.beginPath();
      context.ellipse(width / 2 + sway, surface(width / 2) + 4 + phase * 16, shipWidth * (.47 + phase * .13), 3 + phase * 13, 0, .05, Math.PI - .05);
      context.stroke();
    }
    // Short irregular wavelets hide the cutout seam where wet timber meets water.
    for (let i = 0; i < 35; i++) {
      const x = left + shipWidth * (.045 + i / 38);
      const wave = still ? 0 : Math.sin(i * 2.1 - seconds * 1.3);
      context.strokeStyle = `rgba(191,210,213,${(.23 + .13 * wave).toFixed(4)})`;
      context.lineWidth = 1 + Math.max(0, wave) * .7;
      context.beginPath(); context.moveTo(x, surface(x) + .4);
      const end = x + 5 + (i % 4) * 2;
      context.quadraticCurveTo((x + end) / 2, surface(x) - 1.2, end, surface(end) + .3); context.stroke();
    }
    wrap.dataset.arkWaterTime = seconds.toFixed(2);
    wrap.dataset.arkHeave = heave.toFixed(3);
    wrap.dataset.arkRoll = roll.toFixed(5);
    wrap.dataset.arkSurface = surface(width / 2).toFixed(3);
  }

  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || !visible || motion.matches) return;
    if (now - lastDraw >= 1000 / 30) { draw(now / 1000); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
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
      credit.innerHTML = `<details><summary>Scene &amp; image credits</summary><p>Ark and landscape: AI-created artistic reconstruction. The story’s precise date, terrain and vessel details are not established.</p><p>${originalCredits}</p><p><a href="https://www.biblegateway.com/passage/?search=Genesis%206%3A14-16%3B8%3A3-5&amp;version=KJV" target="_blank" rel="noopener">Genesis: timber ark, proportions and mountains</a></p></details>`;
    }
    resize(); resizeObserver?.observe(wrap); observer?.observe(wrap);
    if (!resizeObserver) window.addEventListener('resize', onResize, {passive: true});
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
  }
  landscape.onload = activate; ark.onload = activate;
  // Keep the existing scene if either local asset cannot load.
  landscape.src = '/assets/rainbow-promise/ancient-flood-landscape.webp';
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
