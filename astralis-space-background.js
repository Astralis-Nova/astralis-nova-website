(() => {
  "use strict";
  const ID = "astralisSpaceBackground";
  const VERSION = "20261101restoredsky";

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

  function upgradeRingedWorld(host) {
    const upgrade = () => {
      const target = host ? host.querySelector('[data-ringed-world]') : document.querySelector('#astralis-celestial-drift .ringed');
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
    if (upgrade() || host || !('MutationObserver' in window)) return;
    // The shared homepage layer arrives after the deferred performance loader.
    const observer = new MutationObserver(() => { if (upgrade()) observer.disconnect(); });
    observer.observe(document.body, { childList: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  }

  function addAsteroids(stage, count) {
    const random = seededRandom(20261007);
    for (let i = 0; i < count; i += 1) {
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
    const host = document.querySelector('[data-astralis-space]');
    const stageId = host?.dataset.astralisSpace || ID;
    if (document.getElementById(stageId)) return;
    const stage = document.createElement("div");
    stage.id = stageId;
    stage.dataset.spaceVersion = VERSION;
    stage.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    stage.append(canvas);
    addAsteroids(stage, host ? 10 : 18);
    (host || document.body).prepend(stage);
    upgradeRingedWorld(host);
    // A quiet explorer satellite crosses behind all navigation and roaming craft.
    const satellite = document.createElement('div');
    satellite.className = 'astralis-space-satellite';
    satellite.innerHTML = '<svg viewBox="0 0 160 70" aria-hidden="true"><defs><linearGradient id="satMetal"><stop stop-color="#e5ebef"/><stop offset=".5" stop-color="#7e8fa3"/><stop offset="1" stop-color="#283c51"/></linearGradient></defs><path d="M18 23h38v27H18zM104 23h38v27h-38z" fill="#173e72" stroke="#7aafd5" stroke-width="1.5"/><path d="M31 23v27m13-27v27m73-27v27m13-27v27M18 36h38m48 0h38" stroke="#6394bd" stroke-width=".8"/><path d="M56 36h48" stroke="#ccd9e5" stroke-width="4"/><path d="M67 19l20-4 10 15-6 24-23-3-6-17z" fill="url(#satMetal)" stroke="#b8ccdc"/><path d="M80 20V8m-5 0h10m6 21l14-15" stroke="#c3dce8" stroke-width="2"/><ellipse cx="104" cy="13" rx="9" ry="4" transform="rotate(-36 104 13)" fill="#a7bccd"/><circle cx="72" cy="42" r="2" fill="#6fffc7"/></svg>';
    stage.append(satellite);
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
    let inView = true;
    let pointerX = 0, pointerY = 0, parallaxX = 0, parallaxY = 0;
    const FRAME_INTERVAL = 1000 / 24;

    function resize() {
      width = Math.max(1, host?.clientWidth || window.innerWidth);
      height = Math.max(1, host?.clientHeight || window.innerHeight);
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
      // Two staggered meteor lanes: varied directions and tails every few seconds.
      if (!reduced.matches) {
        const lanes = coarse.matches ? 1 : 2;
        for (let lane = 0; lane < lanes; lane += 1) {
          const interval = lane ? 13 : 8.5;
          const clock = seconds + (lane ? 5.2 : 7.8);
          const cycle = Math.floor(clock / interval);
          const phase = clock % interval;
          const route = seededRandom(9301 + cycle * 17 + lane * 491);
          const duration = 1.05 + route() * .75;
          if (phase >= duration) continue;
          const t = phase / duration;
          const rightward = route() > .5;
          const startX = rightward ? -.12 : 1.12;
          const endX = rightward ? 1.12 : -.12;
          const startY = .03 + route() * .47;
          const drop = .18 + route() * .27;
          const x = width * (startX + t * (endX - startX));
          const y = height * (startY + t * drop);
          const opacity = Math.sin(t * Math.PI) * .88;
          const dx = width * (endX - startX), dy = height * drop;
          const length = Math.hypot(dx, dy);
          const tailLength = 76 + route() * 74;
          const tx = x - dx / length * tailLength, ty = y - dy / length * tailLength;
          const tail = ctx.createLinearGradient(x, y, tx, ty);
          tail.addColorStop(0, `rgba(220,240,255,${opacity})`);
          tail.addColorStop(.25, `rgba(138,200,255,${opacity * .55})`);
          tail.addColorStop(1, 'rgba(120,174,235,0)');
          ctx.strokeStyle = tail;ctx.lineWidth = lane ? 1.2 : 1.7;
          ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
          ctx.fillStyle = `rgba(248,252,255,${opacity})`;
          ctx.beginPath();ctx.arc(x,y,lane ? 1.1 : 1.7,0,Math.PI*2);ctx.fill();
        }
      }
    }

    function tick(now) {
      frame = 0;
      if (document.hidden || reduced.matches || !inView) return;
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
      const paused = document.hidden || reduced.matches || !inView;
      stage.classList.toggle("space-motion-paused", paused);
      document.getElementById('astralis-celestial-drift')?.classList.toggle('sky-motion-paused', document.hidden);
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
      const rect = host?.getBoundingClientRect();
      pointerX = ((event.clientX - (rect?.left || 0)) / width - .5) * 9;
      pointerY = ((event.clientY - (rect?.top || 0)) / height - .5) * 7;
    }, {passive:true});
    document.addEventListener("visibilitychange", syncMotion);
    reduced.addEventListener?.("change", syncMotion);
    if (host && 'IntersectionObserver' in window) {
      const visibleThreshold = .025;
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.intersectionRatio >= visibleThreshold;
        syncMotion();
      }, { threshold: visibleThreshold });
      observer.observe(host);
    }
    resize();syncMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
