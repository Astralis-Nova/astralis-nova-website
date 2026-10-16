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
    const approach=clamp(smooth(-.4,3,-dz/.003)*.82+(1-smooth(1.1,4.5,depth))*.42);
    // Keep the Promise orbit; let the dragon's own wingbeat supply its lift.
    const lift=pose(seconds,approach,false,1-smooth(5,9,depth)).heave*Math.min(1.3,scale);
    const x=nx*width-size/2,y=top+ny*(height-top)+lift-size/2;
    const retreating=dz>0;
    const turn=clamp(dx*90,-1,1),turnBlend=retreating?clamp((depth-4.3)/8):0;
    const yaw=Math.tanh(dx*300);
    return {x,y,size,depth,dx,dy,dz,approach,scale,lift,
      facing:dx>=0?1:-1,profile:.82+.18*Math.abs(yaw),
      bank:turn*5*turnBlend,pitch:0,opacity:.52+.46*Math.min(1,scale)};
  }
  function strokePhase(cycle){
    // The recording shows a firm push followed by a longer recovery.
    // Hermite segments share a velocity at the join and cycle seam.
    const down=cycle<.44,t=down?cycle/.44:(cycle-.44)/.56;
    const start=down?0:2/3,end=down?2/3:1,span=down?.44:.56;
    const h=t*t*(3-2*t),tangent=(t*t*t-2*t*t+t)+(t*t*t-t*t);
    return start+(end-start)*h+tangent*.65*span;
  }
  function pose(seconds, approach = 0, launch = false, proximity = 0) {
    const coast=seconds%6.8;
    const glide=launch?0:smooth(5.55,5.8,coast)*(1-smooth(6.45,6.8,coast))*(1-clamp(Math.max(approach,proximity))*.8);
    // Roughly one substantial stroke every 1.4s, as observed in the clip.
    const beat=seconds*.72;
    const cycle=((beat%1)+1)%1,phase=strokePhase(cycle),angle=cycle*Math.PI*2;
    const activity=1-glide*.88;
    const suspension=Math.sin(angle-1.05),adjustment=Math.max(0,Math.sin(seconds*.62-.4))**8;
    const limbs=[0,.18,.48,.63].map((delay,index)=>{
      // The chest moves first; the suspended legs follow and wrists settle last.
      const swing=Math.sin(angle-1.05-delay),wrist=Math.sin(angle-1.65-delay);
      return {
        knee:-9-swing*17*activity+adjustment*(index<2?14:11),
        ankle:7+wrist*14*activity-adjustment*7,
        curl:clamp(.5+swing*.27*activity+Math.sin(seconds*.8+index*.9)*.12+glide*.08),
        lift:(Math.sin(angle-.25-delay)*3.6+Math.sin(seconds*.65+index)*.6)*activity
      };
    });
    const eyePhase=(seconds+.83)%6.9;
    const blinkPulse=(center,half)=>1-smooth(.035,half,Math.abs(eyePhase-center));
    const blink=Math.max(blinkPulse(.18,.18),Math.floor((seconds+.83)/6.9)%3===1?blinkPulse(.52,.14):0);
    const wingTips=[0,.16].map(delay=>Math.sin(angle-1.15-delay)*(3.6*activity+.8)+Math.sin(seconds*3.1-delay)*3.5*glide);
    const heave=-Math.sin(angle-1.05)*4.8*activity;
    return {phase,cycle,angle,glide,activity,limbs,blink,wingTips,heave,
      gaze:[Math.sin(seconds*.37)*1.05+Math.sin(seconds*1.21)*.35,Math.sin(seconds*.49-.7)*.55],
      bob:heave,
      chest:-Math.sin(angle-.95)*6.1*activity,
      neck:Math.sin(angle-1.25)*1.5*activity+Math.sin(seconds*.6)*.65,
      legs:-6-suspension*5*activity,
      wrist:Math.sin(angle-.8)*2.6*activity,
      // A small independent look, with much less beat-by-beat head nodding.
      head:Math.sin(seconds*.65-.9)*.85+Math.sin(angle-1.15)*.15*activity,
      tail:Math.sin(seconds*.85-.6)*20+Math.sin(angle-1.7)*10*activity,
      tailPhase:angle-1.7,
      bank:Math.sin(seconds*.65)*1.3*(1-approach)
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
  const rig = { clamp, mix, smooth, route, strokePhase, pose, weights };
  root.AstralisDragonRig = rig;
})(typeof window === 'undefined' ? globalThis : window);
