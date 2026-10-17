(() => {
  "use strict";
  const ID = "astralisSpaceBackground";
  const VERSION = "20261017realism";

  function seededRandom(seed) {
    let n = seed >>> 0;
    return () => {
      n += 0x6D2B79F5;
      let t = Math.imul(n ^ (n >>> 15), n | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function renderRingedWorld(texture) {
    const art = document.createElement("canvas");
    art.width = 600;art.height = 380;
    const paint = art.getContext("2d");
    if (!paint) return null;
    const random = seededRandom(71026);
    const bands = [];
    for (let radius = 180; radius < 281; radius += .9) {
      // Broad and fine gaps break up the ring into dusty, uneven bands.
      if (Math.abs(radius - 242) < 3.3 || Math.abs(radius - 267) < 1.1) continue;
      const density = .25 + random() * .34 + .12 * Math.sin(radius * .42);
      bands.push({ radius, alpha: density, warm: random() });
    }
    function rings(front) {
      paint.save();paint.translate(300, 190);paint.rotate(-.16);paint.scale(1, .31);
      const lighting = paint.createLinearGradient(-280, -60, 280, 100);
      lighting.addColorStop(0, '#dad5c7');lighting.addColorStop(.44, '#abaeb0');
      lighting.addColorStop(.7, '#788392');lighting.addColorStop(1, '#454f61');
      paint.strokeStyle = lighting;
      for (const band of bands) {
        paint.globalAlpha = band.alpha * (front ? .94 : .67);
        paint.lineWidth = .75 + band.warm * .75;
        paint.beginPath();paint.arc(0, 0, band.radius, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);paint.stroke();
      }
      paint.restore();
    }
    rings(false);
    // Real cloud texture supplies the spherical body, with its own fixed day/night shading.
    paint.save();paint.filter = 'saturate(.65) contrast(1.08)';
    paint.drawImage(texture, 140, 30, 320, 320);paint.restore();
    rings(true);
    return art;
  }
  window.AstralisSpaceArt = { renderRingedWorld };

  function upgradeRingedWorld() {
    const upgrade = () => {
      const target = document.querySelector('#astralis-celestial-drift .ringed');
      if (!target) return false;
      const texture = new Image();
      texture.decoding = 'async';
      texture.onload = () => {
        const art = renderRingedWorld(texture);
        if (!art) return;
        target.src = art.toDataURL('image/png');
        target.dataset.realismVersion = VERSION;
      };
      texture.src = '/astralis-gas-giant.png';
      return true;
    };
    if (upgrade() || !('MutationObserver' in window)) return;
    // The shared homepage layer arrives after the deferred performance loader.
    const observer = new MutationObserver(() => { if (upgrade()) observer.disconnect(); });
    observer.observe(document.body, { childList: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  }

  function addAsteroids(stage) {
    const random = seededRandom(20261007);
    for (let i = 0; i < 18; i += 1) {
      const rock = document.createElement("div");
      rock.className = "astralis-space-asteroid";
      const texture = document.createElement("span");
      const near = i % 5 === 0;
      const size = near ? 68 + random() * 66 : 13 + random() * 39;
      const duration = near ? 52 + random() * 36 : 100 + random() * 120;
      const y = 4 + random() * 90;
      const atlas = i % 6;
      const vars = {
        "--rock-size": `${size.toFixed(1)}px`,
        "--rock-opacity": (near ? .58 : .18 + random() * .26).toFixed(2),
        "--travel-time": `${duration.toFixed(1)}s`,
        "--travel-delay": `${(-random() * duration).toFixed(1)}s`,
        "--spin-time": `${(40 + random() * 110).toFixed(1)}s`,
        "--rock-angle": `${Math.round(random() * 360)}deg`,
        "--start-x": "112vw", "--end-x": "-20vw",
        "--start-y": `${y.toFixed(1)}vh`,
        "--end-y": `${(y + 8 + random() * 12).toFixed(1)}vh`,
        "--rest-x": `${(7 + random() * 83).toFixed(1)}vw`,
        "--rest-y": `${y.toFixed(1)}vh`,
        "--atlas-x": `${(atlas % 3) * 50}%`,
        "--atlas-y": `${Math.floor(atlas / 3) * 100}%`
      };
      for (const [key, value] of Object.entries(vars)) rock.style.setProperty(key, value);
      rock.append(texture);
      stage.append(rock);
    }
  }

  function boot() {
    if (document.getElementById(ID)) return;
    const stage = document.createElement("div");
    stage.id = ID;
    stage.dataset.spaceVersion = VERSION;
    stage.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    stage.append(canvas);
    addAsteroids(stage);
    document.body.prepend(stage);
    upgradeRingedWorld();
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return; // The CSS background and asteroid layer still work.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    // Cache soft stellar halos once. The animation loop only composites these sprites.
    const starColors = ["231,239,255", "185,211,255", "255,229,198"];
    const halos = starColors.map(color => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 32;
      const light = sprite.getContext("2d");
      if (!light) return null;
      const halo = light.createRadialGradient(16, 16, 0, 16, 16, 16);
      halo.addColorStop(0, `rgba(${color},.68)`);
      halo.addColorStop(.13, `rgba(${color},.27)`);
      halo.addColorStop(.38, `rgba(${color},.055)`);
      halo.addColorStop(1, `rgba(${color},0)`);
      light.fillStyle = halo;light.fillRect(0, 0, 32, 32);
      return sprite;
    });
    let width = 1, height = 1, scale = 1, stars = [], frame = 0;
    let lastFrame = 0, elapsed = 0, lastClock = 0;
    let pointerX = 0, pointerY = 0, parallaxX = 0, parallaxY = 0;
    const FRAME_INTERVAL = 1000 / 24;

    function resize() {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      scale = Math.min(window.devicePixelRatio || 1, 1.5, 2560 / width, 1800 / height);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const random = seededRandom(8301983);
      const count = Math.min(920, Math.max(190, Math.round(width * height / 1450)));
      stars = Array.from({length:count}, () => {
        const depth = .12 + random() * .88;
        const bright = random() < .027;
        const colorIndex = random() < .16 ? 1 : random() < .14 ? 2 : 0;
        return {
          x:random() * (width + 80) - 40,
          y:random() * (height + 80) - 40,
          depth, radius:bright ? .90 + random() * .50 : .20 + Math.pow(random(), 2) * .75,
          alpha:bright ? .72 + random() * .26 : .16 + random() * .53,
          phase:random() * Math.PI * 2, period:9 + random() * 18,
          flicker:random() < .23, bright, colorIndex,
          color:starColors[colorIndex]
        };
      });
      draw(elapsed);
    }

    function draw(seconds) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      parallaxX += (pointerX - parallaxX) * .055;
      parallaxY += (pointerY - parallaxY) * .055;
      const motion = reduced.matches ? 0 : seconds;
      for (const star of stars) {
        const drift = motion * (.055 + star.depth * .19);
        const x = ((star.x - drift + width + 80) % (width + 80) + width + 80) % (width + 80) - 40 + parallaxX * star.depth;
        const y = ((star.y + drift * .17) % (height + 80) + height + 80) % (height + 80) - 40 + parallaxY * star.depth;
        const shimmer = !reduced.matches && star.flicker
          ? .91 + .09 * Math.sin(motion * Math.PI * 2 / star.period + star.phase)
          : 1;
        const alpha = star.alpha * shimmer;
        ctx.fillStyle = `rgba(${star.color},${alpha})`;
        ctx.beginPath();ctx.arc(x, y, star.radius, 0, Math.PI * 2);ctx.fill();
        if (star.bright && halos[star.colorIndex]) {
          const size = 7 + star.radius * 4;
          ctx.globalAlpha = alpha * .65;
          ctx.drawImage(halos[star.colorIndex], x - size / 2, y - size / 2, size, size);
          ctx.globalAlpha = 1;
        }
      }
      // Infrequent streaks have varied routes instead of repeating one identical pass.
      const cycle = Math.floor((seconds + 17) / 67);
      const phase = (seconds + 17) % 67;
      const route = seededRandom(9301 + cycle);
      const duration = 1.6 + route() * .65;
      if (!reduced.matches && phase < duration) {
        const t = phase / duration;
        const startY = .08 + route() * .34;
        const x = width * (1.12 - t * 1.38), y = height * (startY + t * .34);
        const opacity = Math.sin(t * Math.PI) * .55;
        const tail = ctx.createLinearGradient(x, y, x + 94, y - 33);
        tail.addColorStop(0, `rgba(206,228,255,${opacity})`);
        tail.addColorStop(1, "rgba(140,182,235,0)");
        ctx.strokeStyle = tail;ctx.lineWidth = 1.5;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x + 94,y - 33);ctx.stroke();
        ctx.fillStyle = `rgba(244,249,255,${opacity})`;
        ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();
      }
    }

    function tick(now) {
      frame = 0;
      if (document.hidden || reduced.matches) return;
      if (now - lastFrame >= FRAME_INTERVAL) {
        // Cap each time step; resuming a hidden tab never jumps across the sky.
        elapsed += lastClock ? Math.min((now - lastClock) / 1000, .1) : 0;
        lastClock = now;lastFrame = now;
        draw(elapsed);
      }
      frame = window.requestAnimationFrame(tick);
    }

    function syncMotion() {
      window.cancelAnimationFrame(frame);frame = 0;lastClock = 0;
      pointerX = pointerY = parallaxX = parallaxY = 0;
      const paused = document.hidden || reduced.matches;
      stage.classList.toggle("space-motion-paused", paused);
      if (paused) draw(elapsed);
      else frame = window.requestAnimationFrame(tick);
    }
    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    }, {passive:true});
    window.addEventListener("pointermove", event => {
      if (reduced.matches || coarse.matches) return;
      pointerX = (event.clientX / width - .5) * 9;
      pointerY = (event.clientY / height - .5) * 7;
    }, {passive:true});
    document.addEventListener("visibilitychange", syncMotion);
    reduced.addEventListener?.("change", syncMotion);
    resize();syncMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
