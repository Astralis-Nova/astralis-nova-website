(() => {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ramp = (t, a, b) => ease((t - a) / (b - a));
  const mix = (a, b, t) => a + (b - a) * t;
  const ankles = { left: { x: 104, y: 276 }, right: { x: 150, y: 276 } };
  const rotate = (point, angle, origin) => {
    const r = angle * Math.PI / 180, x = point.x - origin.x, y = point.y - origin.y;
    return { x: origin.x + x * Math.cos(r) - y * Math.sin(r), y: origin.y + x * Math.sin(r) + y * Math.cos(r) };
  };
  // Solve a two-bone limb: planted ankles and a glove's wrist are its endpoints.
  function joint(start, end, upper, lower, side) {
    const dx = end.x - start.x, dy = end.y - start.y, distance = Math.hypot(dx, dy);
    const d = Math.max(.01, Math.min(upper + lower - .01, distance));
    const along = (upper * upper - lower * lower + d * d) / (2 * d);
    const bend = Math.sqrt(Math.max(0, upper * upper - along * along));
    return { x: start.x + dx / distance * along + side * -dy / distance * bend,
      y: start.y + dy / distance * along + side * dx / distance * bend };
  }
  const limbPath = (start, bend, end) => {
    const before = { x: mix(start.x, bend.x, .72), y: mix(start.y, bend.y, .72) };
    const after = { x: mix(bend.x, end.x, .28), y: mix(bend.y, end.y, .28) };
    return `M${start.x} ${start.y}L${before.x} ${before.y}Q${bend.x} ${bend.y} ${after.x} ${after.y}L${end.x} ${end.y}`;
  };
  // All gestures, gaze, knees, charging and recoil share one clock.
  function pose(milliseconds) {
    const t = (((milliseconds % 12000) + 12000) % 12000) / 1000;
    const aim = ramp(t, 3, 4) * (1 - ramp(t, 5.6, 6.7));
    const charge = ramp(t, 4, 4.78) * (1 - ramp(t, 4.82, 5.08));
    const shot = clamp((t - 4.8) / .28);
    const beam = t >= 4.8 && t < 5.08 ? Math.sin(shot * Math.PI) : 0;
    const recoil = ramp(t, 4.8, 4.88) * (1 - ramp(t, 4.88, 5.4));
    const gesture = ramp(t, .4, 1.4) * (1 - ramp(t, 2.1, 2.9)) + ramp(t, 7.3, 8.2) * (1 - ramp(t, 9.3, 10.5));
    const balance = Math.sin(t * Math.PI / 3) * 1.6 - 2 * recoil;
    const shift = Math.sin(t * Math.PI / 3) * 4.5 * (1 - .7 * aim) - recoil * 1.6;
    const bob = (1 - Math.cos(t * Math.PI * 2 / 3)) * 1.15 + recoil * 1.2;
    const hips = {};
    const knees = {};
    for (const [side, x] of [['left', 102], ['right', 145]]) {
      const point = rotate({ x, y: 236 }, balance, { x: 124, y: 236 });
      hips[side] = { x: point.x + shift, y: point.y + bob };
      knees[side] = joint(hips[side], ankles[side], 21, 21, side === 'left' ? 1 : -1);
    }
    const wrist = { x: mix(79, 49, gesture), y: mix(211, 184, gesture) + Math.sin(t * Math.PI * 2 / 3) * gesture * 2 };
    const shoulder = { x: 103, y: 184 };
    const elbow = joint(shoulder, wrist, 29, 29, 1);
    const blinkAt = (center, width) => Math.max(0, 1 - Math.abs(t - center) / width);
    const blink = Math.max(blinkAt(1.7, .12), blinkAt(8.6, .12));
    const turn = Math.sin(t * Math.PI / 6) * (1 - aim) + aim * .7;
    return {
      t, aim, charge, beam, travel: shot * 60, recoil, gesture, balance, shift, bob,
      hips, knees, ankles, wrist, elbow, shoulder,
      arm: 13 - 27 * aim + 6 * recoil,
      handAngle: -18 * gesture + Math.sin(t * Math.PI * 2 / 3) * gesture * 7,
      head: turn * 4 + Math.sin(t * Math.PI * 2 / 3) * gesture,
      headWidth: 1.055 - Math.abs(turn) * .045,
      faceShift: turn * 4,
      gaze: Math.sin(t * Math.PI / 3) * 2 * (1 - aim) + 4 * aim,
      eyeScale: (1 - .94 * blink) * (1 - .12 * aim),
      plume: Math.sin(t * Math.PI * 4 / 3 - .25) * (3 + gesture * 2) + recoil * 7
    };
  }
  window.NovaMarvinRig = { pose, joint, limbPath };
})();
