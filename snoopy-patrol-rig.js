(() => {
  'use strict';
  const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const between = (t, a, b) => ease((t - a) / (b - a));
  const rest = { far: { x: 249, y: 148 }, near: { x: 265, y: 151 } };
  const shoulders = { far: { x: 200, y: 150 }, near: { x: 215, y: 151 } };
  const rim = { far: { x: 166, y: 59 }, near: { x: 227, y: 55 } };
  // One clock owns reach, contact, lens travel, release, and the return.
  function pose(milliseconds, greeting = false, greetingMilliseconds = milliseconds) {
    const t = (((milliseconds % 18000) + 18000) % 18000) / 1000;
    let down = 0, reach = 0, contact = false;
    if (t >= 2.5 && t < 3.4) reach = between(t, 2.5, 3.4);
    else if (t >= 3.4 && t < 5.3) {
      reach = 1; contact = true; down = between(t, 3.7, 5);
    } else if (t >= 5.3 && t < 6.2) {
      down = 1; reach = 1 - between(t, 5.3, 6.2);
    } else if (t >= 6.2 && t < 10.4) down = 1;
    else if (t >= 10.4 && t < 11.3) {
      down = 1; reach = between(t, 10.4, 11.3);
    } else if (t >= 11.3 && t < 13.3) {
      reach = 1; contact = true; down = 1 - between(t, 11.6, 13);
    } else if (t >= 13.3 && t < 14.2) reach = 1 - between(t, 13.3, 14.2);
    const angle = down * 10, radians = angle * Math.PI / 180;
    const c = Math.cos(radians), s = Math.sin(radians), scale = .8;
    const transform = p => {
      const x = (p.x - 180) * scale, y = (p.y - 50) * scale;
      return { x: 180 + down * 39 + x * c - y * s, y: 50 + down * 33 + x * s + y * c };
    };
    const lookout = between(t, 6.5, 7.5) * (1 - between(t, 9, 10));
    const greetingT = Math.max(0, greetingMilliseconds / 1000);
    const nod = greeting ? Math.sin(greetingT * Math.PI * 2 / 1.25) * 4 * between(greetingT, 0, .15) * (1 - between(greetingT, 2.3, 2.5)) : 0;
    const headAngle = Math.sin(t * Math.PI / 3) * 2.5 - lookout * 12 + nod;
    const headY = -lookout * 1.4;
    const headTransformPoint = point => {
      const angle = headAngle * Math.PI / 180, x = point.x - 213, y = point.y - 134;
      return { x: 213 + x * Math.cos(angle) - y * Math.sin(angle), y: 134 + headY + x * Math.sin(angle) + y * Math.cos(angle) };
    };
    const grips = { far: headTransformPoint(transform(rim.far)), near: headTransformPoint(transform(rim.near)) };
    const paws = {};
    for (const side of ['far', 'near']) {
      const idle = Math.sin(t * Math.PI * 2 / 3 + (side === 'far' ? .4 : 0)) * 1.3 * (1 - reach);
      paws[side] = {
        x: mix(rest[side].x, grips[side].x, reach),
        y: mix(rest[side].y + idle, grips[side].y, reach)
      };
    }
    return { t, down, reach, contact, angle, scale, paws, grips, headAngle, headY, lookout };
  }
  function elbow(shoulder, wrist) {
    const dx = wrist.x - shoulder.x, dy = wrist.y - shoulder.y;
    const distance = Math.hypot(dx, dy);
    const d = clamp(distance, 1, 104.99), upper = 55, lower = 50;
    const along = (upper * upper - lower * lower + d * d) / (2 * d);
    const height = Math.sqrt(Math.max(0, upper * upper - along * along));
    const ux = dx / Math.max(distance, 1), uy = dy / Math.max(distance, 1);
    return { x: shoulder.x + along * ux - height * uy, y: shoulder.y + along * uy + height * ux };
  }
  const n = value => Number(value.toFixed(3));
  function armPath(side, wrist, reach = 1) {
    const shoulder = shoulders[side], solved = elbow(shoulder, wrist);
    // Forward-facing paws shorten the visible foreleg; reaching unfolds it.
    const foreshortening = .76 * (1 - reach);
    const joint = { x: mix(solved.x, (shoulder.x + wrist.x) / 2, foreshortening), y: mix(solved.y, (shoulder.y + wrist.y) / 2, foreshortening) };
    // A filled, tapered silhouette gives Snoopy a rounded foreleg rather than a thin line.
    const unit = (a, b) => {
      const d = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
    };
    const u = unit(shoulder, joint), v = unit(joint, wrist);
    const normalA = { x: -u.y, y: u.x }, normalB = { x: -v.y, y: v.x };
    const sum = { x: normalA.x + normalB.x, y: normalA.y + normalB.y };
    const norm = Math.max(.01, Math.hypot(sum.x, sum.y));
    const middle = { x: sum.x / norm, y: sum.y / norm };
    const widths = side === 'near' ? { shoulder: 8.5, elbow: 9.5, wrist: 6.8 } : { shoulder: 7.3, elbow: 8, wrist: 5.8 };
    const offset = (p, axis, distance) => `${n(p.x + axis.x * distance)} ${n(p.y + axis.y * distance)}`;
    return `M${offset(shoulder, normalA, widths.shoulder)}` +
      `Q${offset(joint, normalA, widths.elbow)} ${offset(joint, middle, widths.elbow)}` +
      `Q${offset(joint, normalB, widths.elbow)} ${offset(wrist, normalB, widths.wrist)}` +
      `Q${offset(wrist, v, widths.wrist)} ${offset(wrist, normalB, -widths.wrist)}` +
      `Q${offset(joint, normalB, -widths.elbow)} ${offset(joint, middle, -widths.elbow)}` +
      `Q${offset(joint, normalA, -widths.elbow)} ${offset(shoulder, normalA, -widths.shoulder)}` +
      `Q${offset(shoulder, u, -widths.shoulder)} ${offset(shoulder, normalA, widths.shoulder)}Z`;
  }

  function goggleTransform(p) {
    return `translate(${n(180 + p.down * 39)} ${n(50 + p.down * 33)}) rotate(${n(p.angle)}) scale(${p.scale}) translate(-180 -50)`;
  }
  function headTransform(p) {
    return `translate(0 ${n(p.headY)}) rotate(${n(p.headAngle)} 213 134)`;
  }
  function scarfPath(milliseconds, short = false) {
    const t = (((milliseconds % 18000) + 18000) % 18000) / 1000;
    const period = short ? .75 : .9;
    const points = [0, .22, .45, .7, 1].map(f => ({
      x: 201 - f * (short ? 101 : 133),
      y: 139 + (short ? f * 11 : -f * 7) + Math.sin(t * Math.PI * 2 / period - f * 6) * f * (short ? 6 : 8)
    }));
    const edges = sign => points.map((p, i) => ({ x: p.x, y: p.y + sign * (4 + i * .9) }));
    const upper = edges(-1), lower = edges(1).reverse();
    const smooth = pts => pts.slice(1).map((b, i) => {
      const a = pts[i], before = pts[Math.max(0, i - 1)], after = pts[Math.min(pts.length - 1, i + 2)];
      return `C${n(a.x + (b.x - before.x) / 6)} ${n(a.y + (b.y - before.y) / 6)} ${n(b.x - (after.x - a.x) / 6)} ${n(b.y - (after.y - a.y) / 6)} ${n(b.x)} ${n(b.y)}`;
    }).join('');
    return `M${n(upper[0].x)} ${n(upper[0].y)}` + smooth(upper) + `L${n(lower[0].x)} ${n(lower[0].y)}` + smooth(lower) + 'Z';
  }

  function create(visitor, isPaused) {
    const goggles = visitor.querySelector('.ace-goggles');
    const strap = visitor.querySelector('.ace-goggle-side-strap');
    const head = visitor.querySelector('.ace-head');
    const scarfLong = visitor.querySelector('.ace-scarf-long');
    const scarfShort = visitor.querySelector('.ace-scarf-short');
    const fringe = visitor.querySelector('.ace-scarf-fringe');
    const sides = ['far', 'near'].map(side => ({
      side,
      outline: visitor.querySelector(`[data-ace-arm="${side}"]`),
      paw: visitor.querySelector(`[data-ace-paw="${side}"]`)
    }));
    if (!goggles || sides.some(s => !s.paw || !s.outline)) return;
    let frame = 0, last, painted = -Infinity, elapsed = 0, greetingStart = 0, wasGreeting = false;
    function draw() {
      const greeting = Boolean(visitor.classList?.contains('ace-greeting'));
      if (greeting && !wasGreeting) greetingStart = elapsed;
      wasGreeting = greeting;
      const p = pose(elapsed, greeting, elapsed - greetingStart);
      if (head) head.setAttribute('transform', headTransform(p));
      if (scarfLong) scarfLong.setAttribute('d', scarfPath(elapsed));
      if (scarfShort) scarfShort.setAttribute('d', scarfPath(elapsed, true));
      if (fringe) {
        const wave = Math.sin(p.t * Math.PI * 2 / .9 - 6) * 8;
        fringe.setAttribute('d', `M68 ${n(127 + wave)}l-7 -2m7 6-8 1m8 3-7 4`);
      }
      goggles.setAttribute('transform', goggleTransform(p));
      if (strap) strap.style.opacity = String(p.down);
      for (const { side, outline, paw } of sides) {
        const point = p.paws[side], path = armPath(side, point, p.reach);
        outline.setAttribute('d', path);
        paw.setAttribute('transform', `translate(${n(point.x)} ${n(point.y)}) rotate(${n((p.angle + p.headAngle) * p.reach)}) scale(.95)`);
      }
      visitor.dataset.goggleAction = p.contact ? 'gripping' : p.reach > 0 ? 'reaching' : p.down ? 'wearing' : 'resting';
    }
    function tick(now) {
      frame = 0;
      if (isPaused()) { last = undefined; return; }
      if (last !== undefined) elapsed += Math.min(80, Math.max(0, now - last));
      last = now;
      if (now - painted >= 32) { draw(); painted = now; }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (isPaused()) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = undefined;
      } else if (!frame) frame = requestAnimationFrame(tick);
    }
    draw(); sync();
    return { sync };
  }
  window.NovaFlyingAceRig = { pose, armPath, goggleTransform, headTransform, scarfPath, create };
})();
