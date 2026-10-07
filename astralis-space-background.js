(() => {
  "use strict";
  const ID = "astralisSpaceBackground";
  const VERSION = "20261007space";

  function seededRandom(seed) {
    let n = seed >>> 0;
    return () => {
      n += 0x6D2B79F5;
      let t = Math.imul(n ^ (n >>> 15), n | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
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
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return; // The CSS background and asteroid layer still work.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
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
      const count = Math.min(880, Math.max(170, Math.round(width * height / 1750)));
      stars = Array.from({length:count}, () => {
        const depth = .12 + random() * .88;
        const bright = random() < .045;
        return {
          x:random() * (width + 80) - 40,
          y:random() * (height + 80) - 40,
          depth, radius:bright ? 1 + random() * .65 : .24 + random() * .72,
          alpha:bright ? .66 + random() * .28 : .14 + random() * .50,
          phase:random() * Math.PI * 2, period:5 + random() * 14,
          flicker:random() < .32, bright,
          color:random() < .17 ? "178,205,255" : random() < .14 ? "255,225,187" : "231,239,255"
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
        const drift = motion * (.45 + star.depth * 1.1);
        const x = ((star.x - drift + width + 80) % (width + 80) + width + 80) % (width + 80) - 40 + parallaxX * star.depth;
        const y = ((star.y + drift * .17) % (height + 80) + height + 80) % (height + 80) - 40 + parallaxY * star.depth;
        const shimmer = !reduced.matches && star.flicker
          ? .70 + .30 * Math.sin(motion * Math.PI * 2 / star.period + star.phase)
          : 1;
        const alpha = star.alpha * shimmer;
        ctx.fillStyle = `rgba(${star.color},${alpha})`;
        ctx.beginPath();ctx.arc(x, y, star.radius, 0, Math.PI * 2);ctx.fill();
        if (star.bright) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
          glow.addColorStop(0, `rgba(${star.color},${alpha * .27})`);
          glow.addColorStop(1, `rgba(${star.color},0)`);
          ctx.fillStyle = glow;ctx.fillRect(x - 6, y - 6, 12, 12);
          ctx.strokeStyle = `rgba(${star.color},${alpha * .24})`;
          ctx.lineWidth = .55;
          ctx.beginPath();ctx.moveTo(x - 3.8, y);ctx.lineTo(x + 3.8, y);
          ctx.moveTo(x, y - 3.8);ctx.lineTo(x, y + 3.8);ctx.stroke();
        }
      }
      // A distant comet crosses for three seconds, then leaves a quiet sky.
      const phase = (seconds + 13) % 43;
      if (!reduced.matches && phase < 3.2) {
        const t = phase / 3.2;
        const x = width * (1.15 - t * 1.38), y = height * (.12 + t * .45);
        const opacity = Math.sin(t * Math.PI) * .65;
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
