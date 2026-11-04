(() => {
  "use strict";

  const canvas = document.querySelector(".surface-desert-chase");
  const paint = canvas?.getContext("2d");
  if (!paint) return;

  const surface = canvas.closest(".region-surface");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = matchMedia("(max-width: 800px)");
  const tau = Math.PI * 2;
  const duration = 8.5;
  // Each pass takes a different side of the wash and follows a curve in depth.
  const routes = [
    { direction: 1, level: .745, curve: -.050, depth: 1, crossing: .61 },
    { direction: -1, level: .672, curve: -.034, depth: .81, crossing: .48, behindCactus: true },
    { direction: 1, level: .786, curve: .028, depth: 1.10, crossing: .62 }
  ];
  let width = 1, height = 1, density = 1;
  let visible = false, frame = 0, timer = 0, start = 0, lastPaint = 0, sightings = 0;

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const phase = (time, from, to) => clamp((time - from) / (to - from), 0, 1);
  const easeOut = amount => 1 - (1 - amount) ** 2;
  const pulse = (time, from, to) => Math.sin(Math.PI * phase(time, from, to));

  // Coordinates trace the center saguaro in the 1200px Cactus Forest cover.
  const saguaro = new Path2D("M523 752L525 676Q515 676 509 661Q502 644 504 612Q507 602 511 611Q511 650 526 664L529 521Q529 511 534 510Q538 510 538 522L540 665Q553 665 555 614Q560 608 562 617Q562 671 548 678L543 679L544 747Z");

  function shape(color, outline) {
    paint.fillStyle = color;
    paint.fill(outline);
  }

  function inked(color, outline, ink = "#272332") {
    shape(color, outline);
    paint.strokeStyle = ink;
    paint.lineWidth = 1.5;
    paint.lineJoin = "round";
    paint.stroke(outline);
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

  // Compare the in-motion silhouettes with the Chuck Jones Center character sheets.
  const bird = {
    tail: new Path2D("M-10 -40C-29 -44 -40 -67 -82 -81C-66 -84 -55 -76 -47 -72C-58 -86 -69 -95 -87 -98C-69 -104 -51 -95 -39 -84C-48 -99 -60 -110 -79 -117C-58 -118 -36 -103 -22 -83C-15 -73 -14 -58 -4 -50Z"),
    body: new Path2D("M-27 -48C-18 -52 -10 -45 0 -43C10 -43 15 -52 15 -65C15 -75 10 -84 14 -91L26 -90C25 -79 29 -71 28 -63C28 -49 19 -34 7 -29C-7 -24 -20 -32 -27 -48Z"),
    wing: new Path2D("M-23 -44C-18 -51 -7 -49 2 -44Q10 -38 3 -34Q-7 -29 -18 -34L-11 -36Q-19 -36 -23 -44Z"),
    head: new Path2D("M11 -88C8 -91 5 -97 9 -104C5 -109 -2 -111 -11 -109C-6 -116 5 -117 14 -111C10 -119 2 -122 -5 -122C4 -128 16 -124 24 -116C26 -125 23 -129 20 -131C32 -130 40 -121 38 -113Q48 -108 46 -98Q42 -88 30 -87Q25 -82 19 -84Z"),
    beak: new Path2D("M41 -100Q51 -103 65 -101Q71 -100 69 -96Q64 -91 51 -88Q44 -84 39 -89Q35 -93 41 -100Z")
  };
  const coyote = {
    tail: new Path2D("M-8 -47C-27 -42 -38 -47 -49 -57Q-62 -71 -84 -64L-73 -60L-96 -56L-78 -53L-94 -48L-77 -48L-86 -41Q-70 -45 -62 -42L-67 -36Q-54 -41 -49 -38Q-33 -24 -10 -36Z"),
    torso: new Path2D("M-13 -39Q-22 -52 -13 -63Q-6 -73 -11 -88Q-9 -95 3 -96Q13 -95 17 -86Q11 -74 12 -64Q15 -59 21 -49Q25 -39 14 -33Q-3 -30 -13 -39Z"),
    chest: new Path2D("M4 -91L15 -93Q21 -81 13 -70L17 -68L14 -63Q23 -55 22 -46Q21 -36 12 -34Q2 -34 -1 -43Q-4 -53 1 -63Q8 -76 4 -91Z"),
    head: new Path2D("M-12 -83Q-25 -87 -19 -101L-15 -107Q-25 -114 -33 -136L-36 -148L-27 -144Q-20 -138 -15 -133L-17 -140L-10 -133L2 -117L7 -119Q0 -135 4 -145L3 -154L11 -150L17 -139L16 -144L23 -137Q28 -125 26 -116Q37 -112 42 -104L54 -101L48 -90Q35 -88 23 -89Q4 -79 -12 -83Z"),
    cheek: new Path2D("M-12 -107Q-1 -107 7 -101Q15 -95 21 -99Q37 -106 58 -108L66 -104L64 -99Q49 -98 38 -94L45 -92L35 -90L38 -87L24 -89L28 -85L15 -87L17 -82L4 -87L3 -82L-8 -87Q-22 -90 -21 -97Q-21 -103 -12 -107Z"),
    ear: new Path2D("M-30 -141Q-20 -137 -6 -117L-12 -116Q-23 -125 -30 -141ZM8 -146Q17 -139 21 -119L15 -119Q11 -127 8 -146Z")
  };

  function drawBird(x, y, size, direction, time, running, jump, sprint) {
    ellipse("rgba(5,6,8,.32)", x, y + 1, size * (24 + jump * .08), size * 3.5);
    paint.save();
    paint.translate(x, y - jump);
    paint.scale(size * direction, size);
    const stride = time * tau * 7.4;
    const look = pulse(time, 2.77, 3.54);
    const blink = pulse(time, 4.74, 4.90);
    paint.translate(0, running ? Math.sin(stride * 2) * 1.7 : Math.sin(time * 5) * .7);
    if (sprint > 0) {
      line(`rgba(152,169,205,${sprint * .27})`, 2.1, [[-89, -35], [-57, -34]]);
      line(`rgba(208,187,153,${sprint * .22})`, 1.4, [[-72, -12], [-33, -11]]);
    }

    for (let leg = 0; leg < 2; leg += 1) {
      const angle = stride + leg * Math.PI;
      const reach = running ? Math.sin(angle) * 25 : leg ? -5 : 4;
      const lift = running ? Math.max(0, Math.cos(angle)) * 13 : 0;
      const ink = leg ? "#cf773d" : "#804b35";
      line(ink, 3, [[-4, -36], [-8 + reach * .38, -17], [reach, -2 - lift], [reach + 8, -1 - lift]]);
      line(ink, 1.6, [[reach + 3, -2 - lift], [reach + 9, -4 - lift]]);
    }

    paint.save();
    paint.translate(-15, -45);
    paint.rotate(Math.sin(time * (running ? 17 : 4)) * (running ? .14 : .045));
    paint.translate(15, 45);
    inked(shade(-117, -39, "#4c70b1", "#253a76"), bird.tail, "#19284e");
    line("#83a1c8", 1.15, [[-68, -111], [-47, -96], [-31, -77]]);
    line("#354982", 1.25, [[-69, -96], [-51, -85], [-39, -73]]);
    paint.restore();

    inked(shade(-90, -28, "#77a8d0", "#3c659d"), bird.body, "#20365b");
    inked(shade(-49, -30, "#4d6da5", "#2d487b"), bird.wing, "#23365a");
    line("#91b6d3", 1.25, [[17, -78], [19, -66], [17, -57], [14, -51]]);
    paint.save();
    paint.translate(21, -88);
    paint.rotate(sprint * .19 - look * .16);
    paint.translate(-21, 88);
    inked(shade(-128, -84, "#304a85", "#1d2959"), bird.head, "#172440");
    ellipse("#bdc8cc", 36.5, -102, 5.25, mix(9, 1.05, blink), .19);
    ellipse("#f2edcf", 42.5, -101, 6.2, mix(9.8, 1.12, blink), .25);
    ellipse("#242438", 44.5 - look * 2.6, -100, 2.3, mix(3.65, .48, blink));
    inked(shade(-103, -88, "#f7d361", "#d3963c"), bird.beak, "#77542d");
    line("#845e38", 1.15, [[42, -92], [54, -94], [65, -97]]);
    paint.restore();
    paint.restore();
  }

  function drawCoyote(x, y, size, direction, time, running, skid, lookingUp) {
    ellipse("rgba(4,5,7,.34)", x, y + 2, size * 41, size * 5);
    paint.save();
    paint.translate(x, y);
    paint.scale(size * direction, size);
    const stride = time * tau * 3.9;
    const flinch = pulse(time, 3.79, 4.17);
    const doubleTake = pulse(time, 5.54, 6.30) * Math.sin((time - 5.54) * 22);
    const blink = pulse(time, 4.43, 4.62);
    paint.translate(0, running ? Math.sin(stride * 2) * 3.2 : skid * 8 + flinch * 4);
    paint.rotate(running ? .23 + Math.sin(stride) * .06 : -.24 * skid + flinch * .11);

    const leg = (offset, near) => {
      const reach = running ? Math.sin(stride + offset) * 34 : skid * (near ? 32 : 19);
      const lift = running ? Math.max(0, Math.cos(stride + offset)) * 19 : 0;
      const hip = near ? 1 : -7;
      const knee = [hip - 10 + reach * .51, -18 - lift * .42 - (near ? 2 : 0)];
      const foot = [hip + reach, -4 - lift];
      const ink = near ? "#946047" : "#644636";
      line(ink, 8, [[hip, -39], knee]);
      line(ink, 5.7, [knee, foot]);
      ellipse(near ? "#ac7455" : "#74513f", foot[0] + 4, foot[1] + 1, 9, 4);
      if (near) line("#cfaa8b", 1.15, [[foot[0] + 8, foot[1] + 1], [foot[0] + 11, foot[1] + 1]]);
    };

    const arm = (offset, near) => {
      const reach = running ? Math.sin(stride + offset) * 25 : (near ? 11 : -8) + (near ? 26 : -15) * skid + 9 * flinch;
      const elbow = [reach * .51 - 6, -61 - Math.abs(reach) * .2];
      const hand = [reach + 8, -51 - (running ? Math.max(0, reach) * .67 : 0) - 20 * skid];
      line(near ? "#9f6a50" : "#634434", 6, [[4, -78], elbow, hand]);
      ellipse(near ? "#bc8565" : "#805b48", hand[0], hand[1], 4.5, 5.5, -.5);
    };

    leg(Math.PI, false);
    arm(0, false);
    paint.save();
    paint.translate(-12, -43);
    paint.rotate(Math.sin(time * (running ? 14 : 5)) * .15 - skid * .28);
    paint.translate(12, 43);
    inked(shade(-65, -30, "#9c664a", "#603d32"), coyote.tail, "#432c28");
    line("#bc8a6b", 1.2, [[-76, -60], [-63, -58], [-54, -53]]);
    paint.restore();
    inked(shade(-95, -33, "#ab754c", "#794932"), coyote.torso, "#492e29");
    shape(shade(-92, -34, "#e0aa85", "#bd815d"), coyote.chest);
    leg(0, true);
    arm(Math.PI, true);

    paint.save();
    paint.translate(4, -85);
    paint.rotate(-lookingUp * .25 + skid * .095 + doubleTake * .24);
    paint.translate(-4, 85);
    inked(shade(-152, -83, "#b37851", "#885238"), coyote.head, "#462f2a");
    shape("#e0a488", coyote.ear);
    const eyeHeight = mix(11 + flinch, 1.1, blink);
    ellipse("#c3a162", 22, -108, 6.3, eyeHeight, -.39);
    ellipse("#f6df91", 30.5, -108.5, 7.3 + flinch, eyeHeight, -.36);
    ellipse("#39292d", 33.3 - doubleTake * 2.5, -107 + lookingUp * 1.8, 2.65, mix(4.7, .6, blink), -.17);
    line("#5a352a", 3.2, [[16, -116 - 4 * flinch], [24, -120 - 5 * flinch], [34, -116 - 4 * flinch]]);
    inked(shade(-108, -82, "#e5b090", "#c98c6f"), coyote.cheek, "#654238");
    ellipse("#292332", 64.5, -105, 7.6, 4.6, -.13);
    ellipse("#8e7b83", 66, -106.5, 2.5, 1.05, -.2);
    line("#865442", 1.35, [[23, -92], [34, -95], [47, -98]]);
    line("#f1c5a0", 1.2, [[-15, -96], [-11, -100], [-4, -99]]);
    ellipse("#9c6754", 43, -101, .95, .85);
    ellipse("#9c6754", 48, -101.8, .85, .75);
    paint.restore();
    paint.restore();
  }

  function drawDust(x, y, time, size, direction) {
    if (time < 0 || time > 1.55) return;
    const fade = Math.sin(Math.PI * time / 1.55);
    for (let i = 0; i < 7; i += 1) {
      const radius = size * (5 + i * 1.7 + time * 5);
      const cx = x - direction * size * (i * 7 + time * 26);
      const cy = y - size * (i % 3 * 3 + time * 10);
      const cloud = paint.createRadialGradient(cx, cy, 0, cx, cy, radius);
      cloud.addColorStop(0, `rgba(187,170,142,${fade * (.25 - i * .021)})`);
      cloud.addColorStop(1, "rgba(187,170,142,0)");
      ellipse(cloud, cx, cy, radius, radius * .55);
    }
  }

  function scene(time) {
    paint.clearRect(0, 0, width, height);
    const route = routes[(sightings - 1) % routes.length];
    const direction = route.direction;
    const unit = clamp(width / 1120, .58, 1.22) * route.depth;
    const wash = width * route.crossing;
    const screenX = distance => direction === 1 ? distance : width - distance;
    const ground = distance => {
      const progress = clamp(distance / width, 0, 1);
      return height * (route.level + route.curve * Math.sin(progress * Math.PI) + (progress - .5) * .053);
    };

    const birdPerch = wash + width * .16;
    const coyoteStop = wash - width * .066;
    const coyoteRun = phase(time, .63, 3.08);
    const brake = phase(time, 3.08, 3.81);
    const retreat = phase(time, 6.34, duration);
    const coyoteX = retreat
      ? mix(coyoteStop, -128 * unit, retreat)
      : mix(-108 * unit, coyoteStop - width * .10, coyoteRun) + width * .10 * easeOut(brake);
    if (time >= .63) {
      const skid = Math.sin(brake * Math.PI);
      drawDust(screenX(coyoteX - 19 * unit), ground(coyoteX), time - 3.15, unit, direction);
      drawCoyote(screenX(coyoteX), ground(coyoteX), unit, retreat ? -direction : direction,
        time, time < 3.08 || retreat > 0, skid, Math.sin(Math.PI * phase(time, 3.84, 6.21)));
    }

    const crossing = phase(time, 0, 2.51);
    const exit = phase(time, 5.53, 6.76);
    const birdX = exit ? mix(birdPerch, width + 100 * unit, exit ** 1.45)
      : mix(-61 * unit, birdPerch, easeOut(crossing ** 1.24));
    const leap = Math.sin(Math.PI * phase(birdX, wash - width * .048, wash + width * .09));
    const birdRunning = crossing < 1 || exit > 0;
    if (exit < 1) {
      if (birdRunning) {
        const sprint = exit ? (time - 5.53) : time;
        drawDust(screenX(birdX - 16 * unit), ground(birdX), .22 + sprint % .66, unit * .68, direction);
      }
      const sprint = Math.max(pulse(time, .12, 1.64), pulse(time, 5.54, 6.77));
      drawBird(screenX(birdX), ground(birdX) - 2 * unit, unit * .92,
        (birdRunning || time < 2.77 ? 1 : -1) * direction, time, birdRunning, leap * 25 * unit, sprint);
    }
    if (route.behindCactus) {
      const coverSize = Math.max(width, height);
      paint.save();
      paint.globalCompositeOperation = "destination-out";
      paint.translate((width - coverSize) / 2, (height - coverSize) * (narrow.matches ? .45 : .5));
      paint.scale(coverSize / 1200, coverSize / 1200);
      shape("#000", saguaro);
      paint.restore();
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
      schedule(11500);
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
      schedule(sightings ? 6500 : 3800);
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
