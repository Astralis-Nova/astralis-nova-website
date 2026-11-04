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
  const passes = [
    { draw: wildlifeScene, wait: 1500 },
    { draw: scene, wait: 1000 },
    { draw: devilScene, wait: 5100 },
    { draw: scene, wait: 9500 },
    { draw: wildlifeScene, wait: 1000 },
    { draw: scene, wait: 1000 },
    { draw: devilScene, wait: 5100 }
  ];
  // Each pass takes a different side of the wash and follows a curve in depth.
  const routes = [
    { direction: 1, level: .745, curve: -.050, depth: 1, crossing: .61 },
    { direction: -1, level: .672, curve: -.034, depth: .81, crossing: .48, behindCactus: true },
    { direction: 1, level: .786, curve: .028, depth: 1.10, crossing: .62 }
  ];
  let width = 1, height = 1, density = 1;
  let visible = false, frame = 0, timer = 0, start = 0, lastPaint = 0, chases = 0, passIndex = 0;

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
    const route = routes[chases % routes.length];
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

  // Squat, shaggy silhouette and a wide jaw from the studio model sheets.
  const devil = {
    body: new Path2D("M-54 -93L-58 -101L-47 -99L-47 -108L-37 -106Q-27 -123 -10 -123L-4 -132L0 -124L10 -135L14 -125L23 -130L25 -122Q43 -119 51 -105L61 -107L58 -98L67 -96L61 -87Q65 -67 53 -49Q47 -33 31 -23Q14 -11 0 -14Q-18 -12 -34 -26Q-59 -48 -58 -70Z"),
    bib: new Path2D("M-33 -68Q-19 -78 0 -75Q23 -78 37 -66Q43 -50 24 -31Q3 -18 -18 -30Q-40 -44 -33 -68Z"),
    muzzle: new Path2D("M-47 -92L-54 -86L-45 -85L-49 -78L-38 -79Q-44 -59 -20 -52Q-4 -47 20 -52Q46 -56 45 -76L54 -77L49 -82L56 -86L47 -91Q28 -98 0 -95Q-26 -98 -47 -92Z"),
    mouth: new Path2D("M-38 -80Q-21 -88 1 -84Q25 -89 39 -78Q44 -66 27 -58Q0 -49 -26 -60Q-40 -66 -38 -80Z"),
    teeth: new Path2D("M-35 -81Q-22 -86 1 -83Q23 -87 36 -80L28 -69L24 -78L15 -73L10 -81L1 -75L-6 -81L-13 -74L-20 -81L-24 -70Z"),
    fangs: new Path2D("M-30 -62L-25 -73L-18 -59ZM22 -59L27 -73L34 -64Z")
  };
  const dustStamp = document.createElement("canvas");
  dustStamp.width = dustStamp.height = 48;
  const stamp = dustStamp.getContext("2d");
  const dustGlow = stamp.createRadialGradient(24, 24, 0, 24, 24, 24);
  dustGlow.addColorStop(0, "#d0ad84");
  dustGlow.addColorStop(.42, "#c2a48266");
  dustGlow.addColorStop(1, "#9d826400");
  stamp.fillStyle = dustGlow;
  stamp.fillRect(0, 0, 48, 48);

  function drawDevil(x, y, unit, turn, spin, time) {
    const facing = Math.cos(turn);
    paint.save();
    paint.translate(x, y);
    paint.scale(unit * mix(1, .62 + .38 * Math.abs(facing), spin), unit);
    paint.rotate(Math.sin(turn) * spin * .19 + Math.sin(time * 8) * (1 - spin) * .04);
    paint.translate(0, -Math.sin(turn * 2) * spin * 4);
    const sweep = Math.sin(turn) * spin * 15;
    line("#85533b", 15, [[-32, -76], [-52, -64 + sweep], [-67, -46 + sweep]]);
    line("#ac7652", 16, [[30, -76], [51, -62 - sweep], [69, -46 - sweep]]);
    ellipse("#b07c59", -68, -46 + sweep, 9, 10, -.3);
    ellipse("#b98158", 69, -46 - sweep, 9, 10, .32);
    ellipse("#a57553", -20, -10, 19, 8, -.14);
    ellipse("#ba8963", 22, -10, 19, 8, .14);
    for (const toe of [-26, -18, 18, 26]) {
      line("#694638", 1.6, [[toe, -8], [toe + 1, -4]]);
    }
    ellipse("#79523e", -49, -108, 10, 13, -.45);
    ellipse("#a17053", 49, -107, 10, 13, .45);
    ellipse("#d5a37d", 51, -108, 5, 7, .43);
    inked(shade(-129, -18, "#b57c4d", "#784831"), devil.body, "#513528");

    // The face narrows on quarter turns and disappears when his back comes around.
    const face = mix(1, clamp((facing + .10) * 2.8, 0, 1), spin);
    paint.globalAlpha = face;
    paint.translate(Math.sin(turn) * spin * 15, 0);
    shape(shade(-78, -23, "#d4a276", "#b17b54"), devil.bib);
    ellipse("#f2dfab", -13, -99, 10, 12, .36);
    ellipse("#f2dfab", 13, -99, 10, 12, -.36);
    ellipse("#34232a", -8, -99, 3, 5);
    ellipse("#34232a", 8, -99, 3, 5);
    line("#674031", 4, [[-24, -108], [-14, -108], [-4, -102]]);
    line("#674031", 4, [[4, -102], [14, -108], [24, -108]]);
    inked(shade(-96, -51, "#e4b790", "#ca936f"), devil.muzzle, "#714934");
    shape("#482831", devil.mouth);
    ellipse("#bd6862", 6, -61.5, 15, 5.2, -.12);
    shape("#f3dfb9", devil.teeth);
    shape("#f3dfb9", devil.fangs);
    ellipse("#3d2c30", 0, -91, 13, 6);
    ellipse("#a38372", 3, -93, 5, 1.5);
    for (const side of [-1, 1]) {
      line("#694835", 1.4, [[side * 39, -83], [side * 56, -88]]);
      line("#694835", 1.4, [[side * 41, -79], [side * 58, -79]]);
    }
    paint.restore();
  }

  function drawVortex(x, y, unit, time, strength, front) {
    if (strength <= .01) return;
    paint.save();
    paint.translate(x, y);
    paint.scale(unit, unit);
    // Reuse a soft stamp for the rising dust and split the helix around the character.
    for (let i = 0; i < 96; i += 1) {
      const rise = (i / 96 + time * (.31 + (i % 5) * .019)) % 1;
      const angle = i * 2.39996 + time * (16 - rise * 3) - rise * 9;
      const near = Math.sin(angle);
      if ((near >= 0) !== front) continue;
      const radius = (20 + rise * 53) * (.61 + (i % 7) * .071);
      const px = Math.cos(angle) * radius + Math.sin(time * 4 + rise * 4) * rise * 9;
      const py = -rise * 161 + near * radius * .22;
      const size = 9 + (i % 9) * 2 + rise * 9;
      const fade = Math.min(1, rise * 9) * (1 - rise) ** .56;
      paint.globalAlpha = strength * fade * (front ? .53 : .34);
      paint.drawImage(dustStamp, px - size, py - size * .66, size * 2, size * 1.32);
      if (i % 4 === 0) {
        ellipse("#e0be8a", px, py, 1.3 + (i % 3) * .35, 1);
      }
    }
    paint.globalAlpha = 1;
    // Curved streaks make the turning motion readable through the dust.
    for (let i = 0; i < 6; i += 1) {
      const angle = time * 18 + i * .91;
      const near = Math.sin(angle);
      if ((near >= 0) !== front) continue;
      const radius = 22 + i * 8;
      paint.beginPath();
      paint.ellipse(0, -12 - i * 24, radius, radius * .22, -.10, angle, angle + 1.03);
      paint.strokeStyle = `rgba(222,195,157,${strength * (.42 - i * .035)})`;
      paint.lineWidth = 3.1 - i * .30;
      paint.stroke();
    }
    paint.restore();
  }

  function devilScene(time) {
    paint.clearRect(0, 0, width, height);
    const arrival = easeOut(phase(time, 0, 2.55));
    const circle = phase(time, 2.55, 4.75) * tau;
    const departure = phase(time, 6.05, 8.25) ** 1.2;
    const x = width * (mix(-.23, .49, arrival) + Math.sin(circle) * .137 + departure * .76);
    const y = height * (.74 + (1 - Math.cos(circle)) * .032 + departure * .068);
    const unit = clamp(width / 1020, .64, 1.20);
    const spin = (1 - phase(time, 4.48, 5.12)) + phase(time, 5.86, 6.15);
    const turn = time * 25;
    ellipse("rgba(4,5,7,.32)", x, y - unit * 2, 39 * unit, 5 * unit);
    if (spin > .01) drawDust(x - unit * 13, y + unit * 3, .30 + time % .78, unit * spin, 1);
    drawVortex(x, y, unit, time, spin, false);
    drawDevil(x, y, unit, turn, spin, time);
    drawVortex(x, y, unit, time, spin, true);
  }

  function drawSquirrel(time, unit) {
    const x = width * .27;
    const y = height * .745;
    const peek = easeOut(phase(time, .15, .76)) * (1 - phase(time, 3.15, 3.58));
    const dash = pulse(time, 1.12, 3.12);
    const stride = Math.sin(time * tau * 5) * pulse(time, 1.12, 3.12);

    paint.save();
    paint.globalAlpha = phase(time, 0, .22) * (1 - phase(time, 3.56, 3.85));
    ellipse("#594337", x, y, 15 * unit, 4 * unit, -.05);
    ellipse("#251f27", x, y - unit, 10 * unit, 2.8 * unit);

    // Keep the squirrel below the lip of the burrow while it peeks out.
    paint.beginPath();
    paint.rect(0, 0, width, y + 2 * unit);
    paint.clip();
    paint.translate(x + dash * 42 * unit, y + (1 - peek) * 38 * unit);
    paint.scale(unit, unit);
    ellipse("#241d22", 0, -1, 15, 3);
    line("#b29374", 4.7, [[-9, -9], [-22, -7], [-35, -13 + stride * 3], [-42, -19 + stride * 3]]);
    line("#544238", 4, [[-37, -15 + stride * 3], [-42, -19 + stride * 3]]);
    ellipse("#b59373", -3, -12, 17, 10, -.20);
    ellipse("#e1c29a", 4, -10, 12, 6, -.28);
    ellipse("#a07c64", 12, -28, 3.8, 4.3);
    ellipse("#c6a17f", 15, -22, 9.5, 7.5, -.15);
    ellipse("#e8cbab", 20, -19, 6.8, 4);
    ellipse("#2a252b", 18, -24, 2.1, 2.1);
    ellipse("#f8e9c6", 18.5, -24.6, .6, .6);
    ellipse("#3b2c2c", 25, -21, 1.7, 1.4);
    ellipse("#9d7a62", -7 + stride * 6, -3, 7, 2.6);
    ellipse("#c9a17d", 11 - stride * 5, -3, 5.6, 2.1);
    paint.restore();
  }

  function drawRabbit(time, unit) {
    const arrival = phase(time, 1.55, 3.50);
    const exit = phase(time, 4.30, 5.93);
    const progress = .54 * arrival + .46 * exit;
    const hop = Math.abs(Math.sin(Math.PI * 4 * (arrival + exit)));
    const x = mix(width + 47 * unit, -47 * unit, progress);
    const y = height * (.79 + .014 * Math.sin(progress * Math.PI));
    const twitch = .28 * pulse(time, 3.57, 3.79) - .20 * pulse(time, 3.86, 4.13);

    ellipse(`rgba(22,17,22,${.40 - .20 * hop})`, x, y, 21 * unit, 3.5 * unit);
    paint.save();
    paint.translate(x, y - 13 * unit * hop);
    paint.scale(-unit, unit);
    ellipse("#eadbcb", -20, -14, 7.5, 6.5);
    ellipse("#947967", -6, -17, 21, 14, -.20);
    ellipse("#bda08a", -8, -20, 17, 10, -.22);
    ellipse("#d2b8a0", 4, -13, 14, 9, -.35);
    ellipse("#a68771", 8, -40, 4.1, 13, -.42 - .45 * hop - twitch);
    ellipse("#c5a58e", 16, -42, 4.8, 14, -.20 - .50 * hop + twitch);
    ellipse("#a97673", 16, -45, 2.3, 9, -.20 - .50 * hop + twitch);
    ellipse("#b19178", 15, -25, 12, 10, -.30);
    ellipse("#e7cfb9", 23, -21, 6.8, 4.2);
    ellipse("#29232a", 19, -28, 2.5, 2.7);
    ellipse("#faedd0", 19.6, -28.8, .8, .8);
    ellipse("#61454b", 29, -22, 1.7, 1.4);
    ellipse("#a88a76", -7 - hop * 10, -3, 10, 3, -.16 + hop * .46);
    ellipse("#cfb097", 13 + hop * 6, -3 - hop * 5, 6.6, 2.5, hop * .6);
    paint.restore();
  }

  function drawKangarooRat(time, unit) {
    const progress = phase(time, 5.35, 8.32);
    const hop = Math.abs(Math.sin(Math.PI * progress * 8));
    const x = mix(-42 * unit, width + 73 * unit, progress);
    const y = height * (.72 + progress * .036);
    ellipse(`rgba(22,17,22,${.35 - .20 * hop})`, x, y, 12 * unit, 2.5 * unit);
    paint.save();
    paint.translate(x, y - hop * 24 * unit);
    paint.scale(unit, unit);
    line("#ac896d", 2.8, [[-8, -12], [-20, -8], [-32, -10 + 7 * hop], [-44, -18 + 9 * hop]]);
    ellipse("#6c534b", -45, -18 + 9 * hop, 5.5, 2.4, .55);
    ellipse("#be9473", -2, -14, 12, 10, -.62);
    ellipse("#f0d8b6", 3, -13, 8, 7, -.52);
    ellipse("#bf9b83", 3, -30, 4.4, 6.1, -.44);
    ellipse("#9d6f6d", 3, -31, 2.3, 3.5, -.44);
    ellipse("#caa281", 10, -24, 9, 7);
    ellipse("#f1dab9", 15, -21, 5.8, 3.6);
    ellipse("#2a2228", 13, -26, 2.9, 3);
    ellipse("#fff1d0", 13.7, -27, .8, .8);
    ellipse("#37272b", 20, -22, 1.4, 1.5);
    line("#a77c62", 2.7, [[-1, -10], [-7, -6 - 4 * hop], [8 - 13 * hop, -2]]);
    ellipse("#d1a788", 9 - 13 * hop, -2, 6.6, 2.1, hop * .42);
    ellipse("#b38970", 9, -13, 3.4, 1.6, -.3);
    paint.restore();
  }

  function wildlifeScene(time) {
    paint.clearRect(0, 0, width, height);
    const unit = clamp(width / 940, .71, 1.19);
    if (time >= 5.35 && time < 8.32) drawKangarooRat(time, unit * .94);
    if (time < 3.85) drawSquirrel(time, unit);
    if (time >= 1.55 && time < 5.93) drawRabbit(time, unit * 1.04);
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
    const { draw } = passes[passIndex];
    if (time >= duration) {
      frame = 0;
      canvas.hidden = true;
      if (draw === scene) chases += 1;
      passIndex = (passIndex + 1) % passes.length;
      schedule(passes[passIndex].wait);
      return;
    }
    if (now - lastPaint >= 1000 / 30) {
      draw(time);
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
      frame = requestAnimationFrame(tick);
    }, delay);
  }

  function sync() {
    if (visible && !document.hidden && !reduced.matches) {
      schedule(passes[passIndex].wait);
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
