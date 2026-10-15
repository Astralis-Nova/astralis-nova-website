/* A depth flight, not a flat sprite orbit. Shared by the controller and QA. */
((root) => {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Promise flight pattern: a sustained side-forward approach, a near pass
  // continuing nose-first to the right, then a distant return behind the scene.
  const knots = [[.50,.23,19],[.27,.18,18],[.35,.24,8],[.49,.34,3.8],
    [.60,.40,1.4],[.79,.30,1.1],[.91,.17,13],[.70,.13,18],[.42,.20,17]];
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
    const near=Math.min(1250,width*1.04,(height-top)*1.35);
    // Same accelerating perspective relation as the Promise birds. Centre the
    // animal in world space; do not slide it around to fit a shrinking box.
    const size=near*2.3/(Math.max(.85,depth)+1.2);
    const x=nx*width-size/2;
    const y=top+ny*(height-top)-size/2;
    const approach = clamp(smooth(-.4, 3, -dz) * .82 + (1 - smooth(1.1,4.5,depth)) * .42);
    const heading=Math.atan2(dy*(height-top),Math.abs(dx*width))*180/Math.PI;
    return { x, y, size, depth, dx, dy, dz, approach, heading,
      facing: dx >= 0 ? 1 : -1,
      bank: clamp(heading*.55,-20,20)*(dx>=0?1:-1),
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
      bob: Math.sin(angle-.9)*3*activity,
      chest: Math.sin(angle-.6)*3.5*activity,
      neck: Math.sin(seconds*1.35-.6)*1.5-lag*1.5*activity,
      legs: -6+Math.sin(seconds*1.15-1.2)*4+lag*2*activity,
      wrist: Math.sin(angle-.9)*2.6*activity,
      head: Math.sin(angle-.9)*-.75*activity,
      tail: Math.sin(seconds*2.05-.6)*8+lag*4.5*activity,
      bank: Math.sin(seconds*.65)*1.3*(1-approach)
    };
  }
  function weights(phase, glide) {
    const frame=phase*6, first=Math.floor(frame)%6;
    // Brief eased transitions keep the original scales crisp between poses.
    const blend=smooth(.28,.72,frame-Math.floor(frame));
    const map=new Map();
    for(const [index,weight] of [[first,(1-blend)*(1-glide)],[(first+1)%6,blend*(1-glide)],[1,glide]]) map.set(index,(map.get(index)||0)+weight);
    return [...map].filter(([,w])=>w>0);
  }
  const rig = { clamp, mix, smooth, route, pose, weights };
  root.AstralisDragonRig = rig;
})(typeof window === 'undefined' ? globalThis : window);
