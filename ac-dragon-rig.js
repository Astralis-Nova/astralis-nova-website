/* A depth flight, not a flat sprite orbit. Shared by the controller and QA. */
((root) => {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Retain the Promise camera loop. Approach attitude is level; banking is
  // reserved for the distant retreat, rather than following the path tangent.
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
  function route(progress,width,height,top=80,seconds=0) {
    const phase=((progress%1)+1)%1+.04;
    const [nx,ny,depth]=spline(phase),next=spline(phase+.003);
    const dx=next[0]-nx,dy=next[1]-ny,dz=next[2]-depth;
    top=Math.min(top,Math.max(12,height*.24));
    const scale=3.5/(Math.max(.85,depth)+1.2);
    const base=Math.min(380,Math.max(220,width*.32),Math.max(150,(height-top)*.65));
    const size=base*scale;
    // Promise's centred depth growth and light flight lift, with dragon-sized art.
    const beat=seconds*2.45+.045*Math.sin(seconds*.7),p=((beat%1)+1)%1;
    const stroke=p<.43?Math.cos(Math.PI*p/.43):-Math.cos(Math.PI*(p-.43)/.57);
    const cycle=seconds%6.8;
    const envelope=Math.min(1,Math.max(0,(4.7-cycle)*5)+Math.max(0,(cycle-6.5)*5));
    const lift=(Math.sin(seconds*1.1)*5-stroke*envelope*6)*Math.min(1.3,scale);
    const x=nx*width-size/2,y=top+ny*(height-top)+lift-size/2;
    const retreating=dz>0;
    const turn=clamp(dx*90,-1,1),turnBlend=retreating?clamp((depth-4.3)/8):0;
    const yaw=Math.tanh(dx*300);
    const approach=clamp(smooth(-.4,3,-dz/.003)*.82+(1-smooth(1.1,4.5,depth))*.42);
    return {x,y,size,depth,dx,dy,dz,approach,scale,lift,
      facing:dx>=0?1:-1,profile:.82+.18*Math.abs(yaw),
      bank:turn*5*turnBlend,pitch:0,opacity:.52+.46*Math.min(1,scale)};
  }
  function pose(seconds, approach = 0, launch = false) {
    // A firm downstroke, slower recovery and short glides give the body weight.
    const glide = launch ? 0 : smooth(.42,.78,Math.sin(seconds*.38-.7));
    const frequency = launch ? 1.45 : 1.02;
    const beat = seconds * frequency + Math.sin(seconds*.7)*.035;
    const phase = ((beat % 1)+1)%1, angle = phase*Math.PI*2;
    const stroke = Math.sin(angle), lag = Math.sin(angle - .65), activity = 1-glide*.88;
    const adjustment=Math.max(0,Math.sin(seconds*.62-.4))**8;
    const limbs=[0,.9,2.1,2.9].map((offset,index)=>({
      knee:-7+adjustment*(index<2?17:14)+Math.sin(seconds*1.12+offset)*8+lag*2*activity,
      ankle:7-adjustment*13+Math.sin(seconds*1.37+offset-.4)*9,
      curl:clamp(.47+Math.sin(seconds*1.67+offset)*.39+adjustment*.12+glide*.08)
    }));
    const eyePhase=(seconds+.83)%6.9;
    const blinkPulse=(center,half)=>1-smooth(0,half,Math.abs(eyePhase-center));
    const blink=Math.max(blinkPulse(.18,.18),Math.floor((seconds+.83)/6.9)%3===1?blinkPulse(.52,.14):0);
    return { phase, glide, activity,limbs,blink,
      gaze:[Math.sin(seconds*.37)*1.05+Math.sin(seconds*1.21)*.35,Math.sin(seconds*.49-.7)*.55],
      bob: Math.sin(angle-.9)*3*activity,
      chest: Math.sin(angle-.6)*4.2*activity,
      neck: Math.sin(seconds*1.35-.6)*1.5-lag*1.5*activity,
      legs: -6+Math.sin(seconds*1.15-1.2)*4+lag*2*activity,
      wrist: Math.sin(angle-.9)*2.6*activity,
      head: Math.sin(seconds*1.08-.9)*1.6+Math.sin(angle-.9)*-.25*activity,
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
