(() => {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ramp = (t, a, b) => ease((t - a) / (b - a));
  // One clock keeps the gaze, gripped prop, charge and recoil in order.
  function pose(milliseconds) {
    const t = (((milliseconds % 12000) + 12000) % 12000) / 1000;
    const aim = ramp(t, 3, 4) * (1 - ramp(t, 5.6, 6.7));
    const charge = ramp(t, 4, 4.78) * (1 - ramp(t, 4.82, 5.08));
    const shot = clamp((t - 4.8) / .28);
    const beam = t >= 4.8 && t < 5.08 ? Math.sin(shot * Math.PI) : 0;
    const recoil = ramp(t, 4.8, 4.88) * (1 - ramp(t, 4.88, 5.4));
    const blinkAt = (center, width) => Math.max(0, 1 - Math.abs(t - center) / width);
    const blink = Math.max(blinkAt(1.7, .12), blinkAt(8.6, .12));
    return {
      t, aim, charge, beam, travel: shot * 60, recoil,
      arm: 13 - 27 * aim + 6 * recoil,
      balance: Math.sin(t * Math.PI / 3) * 1.4 - 2 * recoil,
      head: Math.sin(t * Math.PI / 6) * 3 * (1 - aim) + 3 * aim,
      gaze: Math.sin(t * Math.PI / 3) * 2 * (1 - aim) + 4 * aim,
      eyeScale: (1 - .94 * blink) * (1 - .26 * aim),
      plume: Math.sin(t * Math.PI * 4 / 3) * 3 + recoil * 7
    };
  }
  window.NovaMarvinRig = { pose };
})();
