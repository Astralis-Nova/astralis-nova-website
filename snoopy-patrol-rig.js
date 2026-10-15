(() => {
  'use strict';
  const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const between = (t, a, b) => ease((t - a) / (b - a));
  const rest = { far: { x: 249, y: 158 }, near: { x: 265, y: 165 } };
  const shoulders = { far: { x: 200, y: 150 }, near: { x: 215, y: 151 } };
  const rim = { far: { x: 166, y: 59 }, near: { x: 227, y: 55 } };
  // One clock owns reach, contact, lens travel, release, and the return.
  function pose(milliseconds) {
    const t = ((milliseconds / 1000) % 18 + 18) % 18;
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
    const grips = { far: transform(rim.far), near: transform(rim.near) };
    const paws = {};
    for (const side of ['far', 'near']) {
      const idle = Math.sin(t * Math.PI * 2 / 3 + (side === 'far' ? .4 : 0)) * 1.3 * (1 - reach);
      paws[side] = {
        x: mix(rest[side].x, grips[side].x, reach),
        y: mix(rest[side].y + idle, grips[side].y, reach)
      };
    }
    return { t, down, reach, contact, angle, scale, paws, grips };
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
  function armPath(side, wrist) {
    const shoulder = shoulders[side], joint = elbow(shoulder, wrist);
    const toward = (from, to, length) => {
      const d = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
      return { x: from.x + (to.x - from.x) * length / d, y: from.y + (to.y - from.y) * length / d };
    };
    const before = toward(joint, shoulder, 7), after = toward(joint, wrist, 7);
    return `M${shoulder.x} ${shoulder.y}L${n(before.x)} ${n(before.y)}Q${n(joint.x)} ${n(joint.y)} ${n(after.x)} ${n(after.y)}L${n(wrist.x)} ${n(wrist.y)}`;
  }
  function goggleTransform(p) {
    return `translate(${n(180 + p.down * 39)} ${n(50 + p.down * 33)}) rotate(${n(p.angle)}) scale(${p.scale}) translate(-180 -50)`;
  }
  function create(visitor, isPaused) {
    const goggles = visitor.querySelector('.ace-goggles');
    const strap = visitor.querySelector('.ace-goggle-side-strap');
    const sides = ['far', 'near'].map(side => ({
      side,
      outline: visitor.querySelector(`[data-ace-arm="${side}"]`),
      fill: visitor.querySelector(`[data-ace-arm-fill="${side}"]`),
      paw: visitor.querySelector(`[data-ace-paw="${side}"]`)
    }));
    if (!goggles || sides.some(s => !s.paw || !s.outline || !s.fill)) return;
    let frame = 0, last, painted = -Infinity, elapsed = 0;
    function draw() {
      const p = pose(elapsed);
      goggles.setAttribute('transform', goggleTransform(p));
      if (strap) strap.style.opacity = String(p.down);
      for (const { side, outline, fill, paw } of sides) {
        const point = p.paws[side], path = armPath(side, point);
        outline.setAttribute('d', path); fill.setAttribute('d', path);
        paw.setAttribute('transform', `translate(${n(point.x)} ${n(point.y)}) rotate(${n(p.angle * p.reach)}) scale(.64)`);
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
  window.NovaFlyingAceRig = { pose, armPath, goggleTransform, create };
})();
