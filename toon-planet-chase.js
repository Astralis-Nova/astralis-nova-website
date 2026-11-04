(() => {
  "use strict";

  const canvas = document.querySelector(".surface-desert-chase");
  const paint = canvas?.getContext("2d");
  if (!paint) return;

  const surface = canvas.closest(".region-surface");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const tau = Math.PI * 2;
  const duration = 8.5;
  let width = 1, height = 1, density = 1;
  let visible = false, frame = 0, timer = 0, start = 0, lastPaint = 0, sightings = 0;

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const phase = (time, from, to) => clamp((time - from) / (to - from), 0, 1);
  const easeOut = amount => 1 - (1 - amount) ** 2;

  function shape(color, outline) {
    paint.fillStyle = color;
    paint.fill(outline);
  }

  function shade(top, bottom, light, shadow) {
    const gradient = paint.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, light);
    gradient.addColorStop(1, shadow);
    return gradient;
  }

  function line(color, size, points) {
    paint.beginPath();
    paint.moveTo(...points[0]);
    for (const point of points.slice(1)) paint.lineTo(...point);
    paint.strokeStyle = color;
    paint.lineWidth = size;
    paint.lineCap = "round";
    paint.lineJoin = "round";
    paint.stroke();
  }

  function ellipse(color, x, y, rx, ry, angle = 0) {
    paint.beginPath();
    paint.ellipse(x, y, rx, ry, angle, 0, tau);
    paint.fillStyle = color;
    paint.fill();
  }

  const bird = {
    tail: new Path2D("M-10 -20Q-28 -24 -54 -37Q-52 -29 -43 -25L-52 -27Q-45 -20 -29 -17L-40 -18Q-30 -13 -13 -14Z"),
    body: new Path2D("M-24 -19Q-20 -30 -3 -30Q8 -29 17 -37L19 -42L24 -39Q23 -28 16 -21Q11 -15 -3 -14Q-14 -14 -24 -19Z"),
    wing: new Path2D("M-18 -21Q-10 -29 5 -27Q12 -25 3 -20Q-7 -16 -18 -21Z"),
    head: new Path2D("M14 -38Q14 -45 22 -47L19 -52L26 -47L29 -49L28 -45Q36 -42 31 -37Q26 -33 19 -35Z"),
    beak: new Path2D("M30 -43L46 -40L30 -37Z")
  };
  const coyote = {
    tail: new Path2D("M-25 -35Q-45 -35 -55 -29Q-67 -21 -78 -21Q-82 -18 -77 -14Q-65 -12 -51 -20Q-43 -25 -24 -25Z"),
    torso: new Path2D("M-34 -35Q-33 -46 -13 -44L4 -42Q17 -44 23 -38Q29 -32 21 -22Q13 -18 5 -22Q-3 -25 -13 -23Q-27 -23 -34 -30Z"),
    saddle: new Path2D("M-34 -34Q-33 -46 -13 -44L4 -42Q16 -45 22 -39Q11 -36 4 -37Q-15 -36 -27 -31Z"),
    chest: new Path2D("M7 -29Q16 -35 18 -41Q19 -49 26 -51L39 -46Q33 -39 29 -36Q27 -29 20 -22Q13 -20 7 -29Z"),
    head: new Path2D("M20 -44Q16 -49 21 -54L18 -68Q25 -66 29 -56L32 -55L34 -70Q39 -64 39 -54Q44 -52 47 -49L60 -45L61 -42L53 -39L39 -40Q32 -35 23 -39Z"),
    innerEar: new Path2D("M34 -57L35 -65Q37 -61 37 -56Z"),
    muzzle: new Path2D("M38 -45Q45 -47 50 -45L60 -43L53 -39L40 -40Z")
  };

  function drawBird(x, y, size, direction, time, running, jump) {
    ellipse("rgba(5,6,8,.29)", x, y + 1, size * (23 + jump * .08), size * 3);
    paint.save();
    paint.translate(x, y - jump);
    paint.scale(size * direction, size);
    const stride = time * tau * 5.2;
    const bob = running ? Math.sin(stride * 2) * 1.45 : Math.sin(time * 6) * .5;
    paint.translate(0, bob);
    for (let leg = 0; leg < 2; leg += 1) {
      const swing = running ? Math.sin(stride + leg * Math.PI) : (leg ? -2 : 2) / 16;
      const lift = running ? Math.max(0, Math.cos(stride + leg * Math.PI)) * 8 : 0;
      const foot = swing * 17;
      const ink = leg ? "#b2a17e" : "#756b60";
      line(ink, 2.4, [[-3, -18], [foot * .46 - 4, -9 - lift * .35], [foot, -2 - lift], [foot + 7, -1 - lift]]);
    }
    shape("#655d4d", bird.tail);
    line("#958978", 1.5, [[-51, -34], [-34, -27], [-17, -21]]);
    shape(shade(-37, -13, "#8e8473", "#b4a58d"), bird.body);
    shape(shade(-29, -18, "#807668", "#51493f"), bird.wing);
    for (let feather = 0; feather < 4; feather += 1) {
      line("#a89a7f", 1.4, [[-13 + feather * 4, -22], [-8 + feather * 4, -25]]);
    }
    shape("#887d64", bird.head);
    shape("#c1ae86", bird.beak);
    ellipse("#e7cd82", 28, -42, 2.1, 2);
    ellipse("#262627", 28.5, -42, .9, 1.2);
    paint.restore();
  }

  function drawCoyote(x, y, size, direction, time, running, skid, lookingUp) {
    ellipse("rgba(4,5,7,.32)", x, y + 2, size * 46, size * 5);
    paint.save();
    paint.translate(x, y);
    paint.scale(size * direction, size);
    const stride = time * tau * 3.4;
    const bob = running ? Math.sin(stride * 2) * 3.6 : Math.sin(time * 5) * .6;
    paint.translate(0, bob + skid * 3);
    paint.rotate((running ? Math.sin(stride) * .047 : 0) + skid * .12);
    const leg = (hip, hind, offset, front) => {
      const swing = running ? Math.sin(stride + offset) : 0;
      const reach = swing * (hind ? 20 : 24) + skid * (hind ? -11 : 20);
      const lift = running ? Math.max(0, Math.cos(stride + offset)) * 12 : 0;
      const knee = [hip + reach * .45 + (hind ? 7 : -4), -16 - lift * .36];
      const foot = [hip + reach, -2 - lift];
      const ink = front ? "#ad9674" : "#74665a";
      line(ink, hind ? 7 : 5.5, [[hip, -29], knee]);
      line(ink, 3.3, [knee, foot, [foot[0] + 5, foot[1]]]);
    };
    leg(-25, true, 1.3, false);
    leg(17, false, 4.4, false);

    paint.save();
    paint.translate(-29, -31);
    paint.rotate(Math.sin(stride * .66) * (running ? .11 : .035) + skid * .18);
    paint.translate(29, 31);
    shape("#786c5d", coyote.tail);
    line("#a5977b", 2, [[-68, -19], [-55, -23], [-38, -31], [-28, -32]]);
    paint.restore();

    shape(shade(-45, -20, "#95836d", "#796857"), coyote.torso);
    shape(shade(-46, -30, "#a0927f", "#5c544d"), coyote.saddle);
    leg(-27, true, 4.5, true);
    leg(16, false, 1.1, true);
    shape(shade(-51, -21, "#a99a7e", "#877459"), coyote.chest);

    paint.save();
    paint.translate(25, -42);
    paint.rotate(-lookingUp * .24 + skid * .085);
    paint.translate(-25, 42);
    shape(shade(-68, -38, "#a6977e", "#807260"), coyote.head);
    shape("#6d6056", coyote.innerEar);
    shape("#c7b89a", coyote.muzzle);
    ellipse("#e4bf68", 41, -49, 2.2, 1.6);
    ellipse("#252830", 42, -49, .8, 1.05);
    ellipse("#3a3430", 60, -43.7, 2.4, 1.8);
    paint.restore();
    paint.restore();
  }

  function drawDust(x, y, time, size) {
    if (time < 0 || time > 1.55) return;
    const fade = Math.sin(Math.PI * time / 1.55);
    for (let i = 0; i < 7; i += 1) {
      const radius = size * (5 + i * 1.7 + time * 5);
      const cx = x - size * (i * 7 + time * 26);
      const cy = y - size * (i % 3 * 3 + time * 10);
      const cloud = paint.createRadialGradient(cx, cy, 0, cx, cy, radius);
      cloud.addColorStop(0, `rgba(187,170,142,${fade * (.25 - i * .021)})`);
      cloud.addColorStop(1, "rgba(187,170,142,0)");
      ellipse(cloud, cx, cy, radius, radius * .55);
    }
  }

  function scene(time) {
    paint.clearRect(0, 0, width, height);
    const wash = clamp(width * .5 + Math.max(width, height) * .095, width * .57, width * .72);
    const unit = clamp(width / 1100, .66, 1.24);
    const ground = x => height * .722 + (x / width - .5) * height * .064;

    const birdPerch = wash + width * .14;
    const coyoteStop = wash - width * .07;
    const coyoteRun = phase(time, .56, 3.15);
    const brake = phase(time, 3.15, 3.83);
    const retreat = phase(time, 6.22, duration);
    const coyoteX = retreat
      ? mix(coyoteStop, -120 * unit, retreat)
      : mix(-100 * unit, coyoteStop - width * .105, coyoteRun) + width * .105 * easeOut(brake);
    if (time >= .56) {
      const skid = Math.sin(brake * Math.PI);
      drawDust(coyoteX - 22 * unit, ground(coyoteX), time - 3.21, unit);
      drawCoyote(coyoteX, ground(coyoteX), unit, retreat ? -1 : 1, time,
        time < 3.15 || retreat > 0, skid, Math.sin(Math.PI * phase(time, 3.9, 6.15)));
    }

    const crossing = phase(time, 0, 2.65);
    const exit = phase(time, 5.72, 7.0);
    const birdX = exit ? mix(birdPerch, width + 76 * unit, exit) : mix(-55 * unit, birdPerch, crossing);
    const leap = Math.sin(Math.PI * phase(birdX, wash - width * .06, wash + width * .08));
    const birdRunning = crossing < 1 || exit > 0;
    if (exit < 1) {
      drawBird(birdX, ground(birdX) - 3 * unit, unit * .79,
        birdRunning || time < 2.94 ? 1 : -1, time, birdRunning, leap * 24 * unit);
    }
  }

  function resize() {
    width = canvas.parentElement.clientWidth || 1;
    height = canvas.parentElement.clientHeight || 1;
    density = Math.min(devicePixelRatio || 1, 1.4, 1800 / width, 1600 / height);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    paint.setTransform(density, 0, 0, density, 0, 0);
  }

  function tick(now) {
    const time = (now - start) / 1000;
    if (time >= duration) {
      frame = 0;
      canvas.hidden = true;
      schedule(39000);
      return;
    }
    if (now - lastPaint >= 1000 / 30) {
      scene(time);
      lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function schedule(delay) {
    if (timer || frame || !visible || document.hidden || reduced.matches) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (!visible || document.hidden || reduced.matches) return;
      paint.clearRect(0, 0, width, height);
      canvas.hidden = false;
      start = performance.now();
      lastPaint = 0;
      sightings += 1;
      frame = requestAnimationFrame(tick);
    }, delay);
  }

  function sync() {
    if (visible && !document.hidden && !reduced.matches) {
      schedule(sightings ? 13000 : 5000);
      return;
    }
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
    canvas.hidden = true;
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener?.("change", sync);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= .3;
      sync();
    }, { threshold: .3 }).observe(surface);
  } else {
    visible = true;
    sync();
  }
})();
