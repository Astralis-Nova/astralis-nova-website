/* A broad Sonoran dust vortex: rising particles orbit a gently wandering core. */
(() => {
  'use strict';
  const scene = document.getElementById('dustDevilScene');
  if (!scene || scene.dataset.ready) return;
  scene.dataset.ready = 'true';
  const canvas = scene.querySelector('canvas');
  const button = scene.querySelector('button');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    button.hidden = true;
    canvas.hidden = true;
    const fallback = document.createElement('p');
    fallback.className = 'dust-devil-fallback';
    fallback.textContent = 'The dust devil animation needs a browser with Canvas support.';
    scene.appendChild(fallback);
    return;
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  let inView = true;
  let width = 0, height = 0, frame = 0, previous = 0, time = 0;
  const TAU = Math.PI * 2;
  // A shared soft dust stamp keeps the animation light on mobile and older GPUs.
  const stamp = document.createElement('canvas');
  stamp.width = stamp.height = 64;
  const stampCtx = stamp.getContext('2d');
  const haze = stampCtx.createRadialGradient(32,32,0,32,32,32);
  haze.addColorStop(0,'rgba(222,182,127,.8)');
  haze.addColorStop(.4,'rgba(197,145,90,.4)');
  haze.addColorStop(1,'rgba(160,111,66,0)');
  stampCtx.fillStyle = haze;
  stampCtx.fillRect(0,0,64,64);
  const dust = Array.from({length:640}, () => ({
    height: Math.random(), angle: Math.random()*TAU,
    radius: .28+Math.random()*.72, size: 7+Math.random()*19,
    speed: .7+Math.random()*.6, shade: .5+Math.random()*.5
  }));
  const grains = Array.from({length:220}, () => ({
    height: Math.random(), angle: Math.random()*TAU,
    radius: .65+Math.random()*.55, speed: .7+Math.random()*.65
  }));
  const groundDust = Array.from({length:100}, () => ({
    angle: Math.random()*TAU, radius: Math.random(), size: 15+Math.random()*25
  }));
  const position = (p, t) => {
    const rise = (p.height+t*.052*p.speed)%1;
    const angle = p.angle+t*(2.4-rise*.75)*p.speed-rise*8;
    const radius = (65+rise*40+Math.sin(rise*7-t*.8)*8)*p.radius;
    const sway = Math.sin(t*.35+rise*2.5)*14+rise*18;
    return {
      x:sway+Math.cos(angle)*radius,
      y:-rise*300+Math.sin(angle)*radius*.19,
      front:(Math.sin(angle)+1)*.5,
      fade:Math.min(1,rise*7)*Math.pow(1-rise,.55), rise
    };
  };
  const paint = () => {
    ctx.clearRect(0,0,width,height);
    const scale = Math.min(width/430,(height-92)/330);
    const center = width*.5+Math.sin(time*.22)*width*.035;
    const ground = height-24;
    ctx.save();
    ctx.translate(center,ground);
    ctx.scale(scale,scale);
    // The low, wide skirt rotates independently of the rising column.
    for (const p of groundDust) {
      const phase = (p.radius+time*.06)%1;
      const angle = p.angle+time*1.3;
      const radius = 45+phase*160;
      const x = Math.cos(angle)*radius;
      const y = Math.sin(angle)*radius*.15-6;
      ctx.globalAlpha = (1-phase)*.27;
      ctx.drawImage(stamp,x-p.size,y-p.size*.4,p.size*2,p.size*.8);
    }
    // Back and front layers give the spinning column depth without rotating a flat image.
    for (let layer=0;layer<2;layer++) {
      for (const p of dust) {
        const v = position(p,time);
        if ((v.front>.5 ? 1 : 0)!==layer) continue;
        const size = p.size*(1+v.rise*.6);
        ctx.globalAlpha = v.fade*(.075+v.front*.19)*p.shade;
        ctx.drawImage(stamp,v.x-size,v.y-size*.65,size*2,size*1.3);
      }
    }
    ctx.fillStyle = '#f1cf9d';
    for (const p of grains) {
      const v = position(p,time);
      ctx.globalAlpha = v.fade*(.12+v.front*.5);
      ctx.fillRect(v.x,v.y,1.2+v.front, .8+v.front*.6);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  };
  const canRun = () => !paused && inView && !document.hidden;
  const tick = now => {
    frame = 0;
    if (!canRun()) { previous = 0; return; }
    if (previous) time += Math.min((now-previous)/1000,.05);
    previous = now;
    paint();
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    button.textContent = paused ? 'Play swirl' : 'Pause swirl';
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused ? 'Play dust devil animation' : 'Pause dust devil animation');
    if (canRun() && !frame) frame = requestAnimationFrame(tick);
    if (!canRun() && frame) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  };
  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1,1.5);
    canvas.width = Math.round(width*ratio);
    canvas.height = Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    paint();
  };
  button.addEventListener('click',() => { paused = !paused; sync(); });
  const onMotion = () => { paused = motion.matches; sync(); };
  if (motion.addEventListener) motion.addEventListener('change',onMotion);
  else if (motion.addListener) motion.addListener(onMotion);
  document.addEventListener('visibilitychange',sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    },{rootMargin:'80px'});
    observer.observe(scene);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize',resize,{passive:true});
  resize();
  sync();
})();
