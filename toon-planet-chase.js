(() => {
  "use strict";

  const canvas = document.querySelector(".surface-desert-chase");
  const paint = canvas?.getContext("2d");
  if (!paint) return;

  const surface = canvas.closest(".region-surface");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const tau = Math.PI * 2;
  const duration = 8.5;
  // Each pass takes a different side of the wash and follows a curve in depth.
  const routes = [
    { direction: 1, level: .745, curve: -.050, depth: 1, crossing: .61 },
    { direction: -1, level: .672, curve: -.034, depth: .81, crossing: .48 },
    { direction: 1, level: .786, curve: .028, depth: 1.10, crossing: .62 }
  ];
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

  // Redrawn for moonlight using the long silhouettes and poses in Chuck Jones's character notes.
  const bird = {
    tail: new Path2D("M-16 -24Q-42 -40 -61 -79Q-44 -71 -35 -55Q-47 -74 -50 -95Q-35 -84 -25 -57Q-32 -79 -29 -88Q-15 -71 -13 -47Q-10 -35 -3 -27Z"),
    body: new Path2D("M-23 -31Q-15 -40 -5 -36Q8 -32 10 -44Q12 -53 13 -67L19 -65Q23 -55 20 -43Q19 -31 12 -24Q3 -17 -11 -20Q-20 -23 -23 -31Z"),
    wing: new Path2D("M-22 -32Q-11 -39 3 -34Q7 -31 4 -28Q-6 -23 -19 -26L-15 -29Z"),
    head: new Path2D("M10 -65Q8 -70 9 -77Q5 -85 -6 -85Q1 -90 12 -84Q8 -93 0 -95Q16 -97 23 -86Q29 -88 35 -84Q41 -80 38 -73Q34 -65 23 -65L18 -61Z"),
    beak: new Path2D("M32 -77Q46 -82 53 -78Q58 -73 51 -70Q41 -65 33 -68Q28 -70 32 -77Z")
  };
  const coyote = {
    tail: new Path2D("M-10 -48Q-28 -42 -47 -49Q-68 -59 -88 -48Q-78 -48 -75 -45L-88 -41Q-79 -41 -74 -38L-80 -34Q-67 -36 -63 -38Q-45 -28 -16 -36Z"),
    torso: new Path2D("M-12 -38Q-20 -50 -11 -62Q-4 -71 -9 -83Q-4 -89 10 -88Q18 -84 15 -72Q10 -62 17 -54Q25 -42 13 -34Q1 -27 -12 -38Z"),
    chest: new Path2D("M7 -84L13 -85Q20 -78 13 -66L16 -63L13 -61Q18 -56 19 -49Q21 -41 12 -37Q4 -37 2 -46Q-3 -55 4 -65Q10 -77 7 -84Z"),
    head: new Path2D("M-6 -83Q-16 -90 -13 -100Q-10 -108 -4 -109Q-14 -119 -19 -135Q-21 -144 -17 -145Q-11 -144 -2 -133L8 -115L11 -116Q8 -132 13 -146Q17 -150 20 -144Q23 -135 22 -118L21 -110Q29 -108 32 -102L39 -99L36 -90Q26 -86 18 -88Q9 -82 -6 -83Z"),
    cheek: new Path2D("M-7 -102Q4 -105 11 -96Q17 -94 23 -97Q33 -101 48 -101L52 -96Q42 -91 31 -91L35 -88L25 -89L28 -85L16 -87Q12 -83 3 -85L7 -80L-5 -84Q-12 -87 -13 -93Z"),
    ear: new Path2D("M-11 -133Q-6 -129 2 -114L-3 -113Q-9 -121 -11 -133ZM15 -137Q19 -129 17 -117L14 -117Z")
  };

  function drawBird(x, y, size, direction, time, running, jump) {
    ellipse("rgba(5,6,8,.32)", x, y + 1, size * (24 + jump * .08), size * 3.5);
    paint.save();
    paint.translate(x, y - jump);
    paint.scale(size * direction, size);
    const stride = time * tau * 6.4;
    paint.translate(0, running ? Math.sin(stride * 2) * 1.7 : Math.sin(time * 5) * .7);

    for (let leg = 0; leg < 2; leg += 1) {
      const angle = stride + leg * Math.PI;
      const reach = running ? Math.sin(angle) * 23 : leg ? -5 : 4;
      const lift = running ? Math.max(0, Math.cos(angle)) * 13 : 0;
      const ink = leg ? "#d78a48" : "#925c40";
      line(ink, 3, [[-4, -25], [-8 + reach * .38, -14], [reach, -2 - lift], [reach + 8, -1 - lift]]);
      line(ink, 1.6, [[reach + 3, -2 - lift], [reach + 9, -4 - lift]]);
    }

    paint.save();
    paint.translate(-17, -30);
    paint.rotate(Math.sin(time * (running ? 17 : 4)) * (running ? .14 : .045));
    paint.translate(17, 30);
    shape(shade(-94, -25, "#425b95", "#232b58"), bird.tail);
    line("#62759b", 1.5, [[-51, -73], [-35, -50], [-19, -37]]);
    paint.restore();

    shape(shade(-69, -20, "#7098bc", "#425f91"), bird.body);
    shape(shade(-40, -24, "#526998", "#29375f"), bird.wing);
    shape("#253458", bird.head);
    ellipse("#e8e5c8", 32, -76, 5.6, 7, .3);
    ellipse("#20243b", 34.5, -75, 2.15, 3);
    shape(shade(-80, -66, "#f2cb60", "#c9933f"), bird.beak);
    line("#795332", 1.25, [[35, -71], [45, -72], [52, -74]]);
    paint.restore();
  }

  function drawCoyote(x, y, size, direction, time, running, skid, lookingUp) {
    ellipse("rgba(4,5,7,.34)", x, y + 2, size * 41, size * 5);
    paint.save();
    paint.translate(x, y);
    paint.scale(size * direction, size);
    const stride = time * tau * 3.9;
    paint.translate(0, running ? Math.sin(stride * 2) * 3.2 : skid * 5);
    paint.rotate(running ? .19 + Math.sin(stride) * .045 : -.15 * skid);

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
      const reach = running ? Math.sin(stride + offset) * 21 : 19 * skid;
      const elbow = [reach * .51 - 6, -61 - Math.abs(reach) * .2];
      const hand = [reach + 8, -53 - Math.max(0, reach) * .67];
      line(near ? "#9f6a50" : "#634434", 6, [[4, -78], elbow, hand]);
      ellipse(near ? "#bc8565" : "#805b48", hand[0], hand[1], 4.5, 5.5, -.5);
    };

    leg(Math.PI, false);
    arm(0, false);
    paint.save();
    paint.translate(-12, -43);
    paint.rotate(Math.sin(time * (running ? 14 : 5)) * .15 - skid * .28);
    paint.translate(12, 43);
    shape(shade(-57, -29, "#9f6a51", "#674436"), coyote.tail);
    paint.restore();
    shape(shade(-88, -29, "#a87356", "#81513c"), coyote.torso);
    shape(shade(-86, -36, "#ce9d7c", "#a87656"), coyote.chest);
    leg(0, true);
    arm(Math.PI, true);

    paint.save();
    paint.translate(4, -85);
    paint.rotate(-lookingUp * .23 + skid * .095);
    paint.translate(-4, 85);
    shape(shade(-148, -84, "#ad7658", "#8a5845"), coyote.head);
    shape("#c99879", coyote.ear);
    shape(shade(-106, -80, "#d4a588", "#bd896d"), coyote.cheek);
    ellipse("#eee1aa", 20, -103, 6.6, 9.4, -.28);
    ellipse("#342833", 23, -102, 2.65, 4.45, -.16);
    line("#694339", 3, [[12, -110], [20, -113], [27, -111]]);
    ellipse("#26232e", 51, -99, 5.8, 4.2, -.18);
    ellipse("#83737a", 52, -100.5, 1.8, .9, -.2);
    line("#805346", 1.3, [[27, -90], [34, -91], [40, -92]]);
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
    const birdX = exit ? mix(birdPerch, width + 90 * unit, exit)
      : mix(-61 * unit, birdPerch, easeOut(crossing));
    const leap = Math.sin(Math.PI * phase(birdX, wash - width * .048, wash + width * .09));
    const birdRunning = crossing < 1 || exit > 0;
    if (exit < 1) {
      if (birdRunning) {
        const sprint = exit ? (time - 5.53) : time;
        drawDust(screenX(birdX - 16 * unit), ground(birdX), .22 + sprint % .66, unit * .68, direction);
      }
      drawBird(screenX(birdX), ground(birdX) - 2 * unit, unit * .86,
        (birdRunning || time < 2.77 ? 1 : -1) * direction, time, birdRunning, leap * 25 * unit);
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
