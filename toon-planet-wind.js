(() => {
  "use strict";

  const canvas = document.querySelector(".surface-brush-motion");
  const paint = canvas?.getContext("2d");
  if (!paint) return;

  const cover = canvas.parentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 800px)");
  const image = new Image();
  // Normalized rectangles on the original cover, with roots at each lower edge.
  const brush = [
    { area: [.04, .52, .22, .18], delay: 0, bend: .021 },
    { area: [.24, .62, .20, .17], delay: .55, bend: .025 },
    { area: [.52, .61, .19, .18], delay: 1.18, bend: .023 },
    { area: [.67, .32, .33, .37], delay: 1.75, bend: .016 }
  ];
  const gustPeriod = 14;
  const frameInterval = 1000 / 24;
  let patches = [], frame = 0, lastFrame = 0, elapsed = 0, inView = false;

  function resize() {
    const width = cover.clientWidth;
    const height = cover.clientHeight;
    if (!image.naturalWidth || !width || !height) return;

    const density = Math.min(1.25, window.devicePixelRatio || 1, 1760 / width, 1440 / height);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);

    // Match the photo's CSS background-size: cover and responsive focal point.
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const photoWidth = image.naturalWidth * scale;
    const photoHeight = image.naturalHeight * scale;
    const left = (canvas.width - photoWidth) * .5;
    const top = (canvas.height - photoHeight) * (narrow.matches ? .45 : .5);

    patches = brush.map(({ area: [x, y, w, h], delay, bend }) => {
      const sprite = document.createElement("canvas");
      sprite.width = Math.round(w * photoWidth);
      sprite.height = Math.round(h * photoHeight);
      const stamp = sprite.getContext("2d");
      stamp.drawImage(image, x * image.naturalWidth, y * image.naturalHeight,
        w * image.naturalWidth, h * image.naturalHeight, 0, 0, sprite.width, sprite.height);
      stamp.globalCompositeOperation = "destination-in";
      stamp.scale(sprite.width / 2, sprite.height / 2);
      const feather = stamp.createRadialGradient(1, 1, .57, 1, 1, 1);
      feather.addColorStop(0, "#fff");
      feather.addColorStop(1, "#fff0");
      stamp.fillStyle = feather;
      stamp.fillRect(0, 0, 2, 2);

      return {
        sprite, delay,
        left: Math.round(left + x * photoWidth),
        top: Math.round(top + y * photoHeight),
        bend: Math.min(34 * density, bend * photoWidth)
      };
    }).filter(patch => patch.left < canvas.width && patch.left + patch.sprite.width > 0);
  }

  function draw(now) {
    frame = 0;
    if (now - lastFrame >= frameInterval) {
      elapsed += lastFrame ? Math.min((now - lastFrame) / 1000, .12) : 0;
      lastFrame = now;
      paint.clearRect(0, 0, canvas.width, canvas.height);
      for (const { sprite, delay, left, top, bend } of patches) {
        const phase = ((elapsed + gustPeriod - delay) % gustPeriod) / 5.1;
        if (phase >= 1) continue;
        const gust = Math.sin(phase * Math.PI) ** 1.6 * (.78 + .22 * Math.sin(phase * 21));
        // Bend the tips downwind and taper the movement to zero at the roots.
        for (let row = 0; row < sprite.height; row += 6) {
          const rows = Math.min(6, sprite.height - row);
          const shift = Math.round(bend * gust * (1 - row / sprite.height) ** 1.45);
          paint.drawImage(sprite, 0, row, sprite.width, rows,
            left + shift, top + row, sprite.width, rows);
        }
      }
    }
    frame = window.requestAnimationFrame(draw);
  }

  function sync() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    if (reduced.matches) paint.clearRect(0, 0, canvas.width, canvas.height);
    if (patches.length && inView && !document.hidden && !reduced.matches) {
      frame = window.requestAnimationFrame(draw);
    }
  }

  image.onload = () => { resize(); sync(); };
  image.src = "/cover-3.jpg";
  window.addEventListener("resize", () => { resize(); sync(); }, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener?.("change", sync);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .05;
      sync();
    }, { threshold: .05 }).observe(cover);
  } else {
    inView = true;
  }
})();
