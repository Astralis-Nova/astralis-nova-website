/* A depth flight, not a flat sprite orbit. Shared by the controller and QA. */
((root) => {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Distant crossings, two deliberate camera approaches, then a wide retreat.
  const knots = [[.18,.12,2.6],[.82,.18,2.3],[.56,.40,.16],[.14,.65,1.1],
    [.20,.25,2.5],[.78,.22,2.8],[.65,.60,.10],[.35,.76,1.1]];
  const at = index => knots[(index % knots.length + knots.length) % knots.length];
  function spline(progress) {
    const phase = ((progress % 1) + 1) % 1 * knots.length;
    const i = Math.floor(phase), t = phase - i;
    return [0, 1, 2].map(axis => {
      const [a,b,c,d] = [at(i-1)[axis],at(i)[axis],at(i+1)[axis],at(i+2)[axis]];
      return .5 * (2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t);
    });
  }
  function route(progress, width, height, top = 80) {
    const [nx,ny,depth] = spline(progress), before = spline(progress - .0005), after = spline(progress + .0005);
    const dx = (after[0] - before[0]) / .001, dy = (after[1] - before[1]) / .001, dz = (after[2] - before[2]) / .001;
    top = Math.min(top, Math.max(12, height * .24));
    const space = Math.max(64, height - top - 18);
    const near = Math.min(720, width * .92, space * .97);
    const size = near / (1 + Math.max(.075, depth));
    const margin = Math.min(18, width * .025);
    const x = margin + clamp(nx) * Math.max(0, width - size - margin * 2);
    const y = top + clamp(ny) * Math.max(0, height - top - size - margin);
    const approach = clamp(smooth(-.4, 3, -dz) * .82 + (1 - smooth(.2,.9,depth)) * .42);
    return { x, y, size, depth, dx, dy, dz, approach,
      facing: dx >= 0 ? 1 : -1,
      bank: clamp(dy * 5, -19, 19) * (dx >= 0 ? 1 : -1) * (1-approach*.65),
      pitch: clamp(-dz * .9, -8, 9) };
  }
  function pose(seconds, approach = 0, launch = false) {
    // A firm downstroke, slower recovery and short glides give the body weight.
    const glide = launch ? 0 : smooth(.42,.78,Math.sin(seconds*.38-.7));
    const frequency = launch ? 1.45 : 1.02;
    const beat = seconds * frequency + Math.sin(seconds*.7)*.035;
    const phase = ((beat % 1)+1)%1, angle = phase*Math.PI*2;
    const stroke = Math.sin(angle), lag = Math.sin(angle - .65), activity = 1-glide*.88;
    return { phase, glide, activity,
      bob: Math.sin(angle-.9) * 2.2 * activity,
      breath: 1 + Math.sin(seconds*1.75)*.008,
      head: Math.sin(angle-.9)*-.75*activity,
      tail: Math.sin(seconds*2.15-.6)*8 + lag*4.5*activity,
      toes: Math.sin(angle-1.4)*1.2*activity,
      bank: Math.sin(seconds*.8)*1.8*(1-approach),
      stroke, lag };
  }
  function weights(phase, glide) {
    const frame=phase*6, first=Math.floor(frame)%6;
    // Brief eased transitions keep the original scales crisp between poses.
    const blend=smooth(.28,.72,frame-Math.floor(frame));
    const map=new Map();
    for(const [index,weight] of [[first,(1-blend)*(1-glide)],[(first+1)%6,blend*(1-glide)],[2,glide]]) map.set(index,(map.get(index)||0)+weight);
    return [...map].filter(([,w])=>w>0);
  }
  const rig = { clamp, mix, smooth, route, pose, weights };
  root.AstralisDragonRig = rig;
})(typeof window === 'undefined' ? globalThis : window);
