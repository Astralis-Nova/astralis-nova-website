/* Hidden ocean cutaway: bounded canvas work, sleeping offscreen and a still
   composition for reduced motion. All sea life is drawn locally, no downloads. */
(() => {
  'use strict';
  const section = document.getElementById('ocean');
  const canvas = section?.querySelector('.ocean-water');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let w = 1, h = 1, frame = 0, visible = false, time = 9, last = 0, painted = 0;
  let seed = 1977;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const plants = Array.from({ length: 26 }, (_, i) => ({
    x: random(), height: .08 + random() * .24, phase: random() * TAU,
    depth: i % 3, lean: (random() - .5) * 30
  }));
  const fish = Array.from({ length: 23 }, (_, i) => ({
    x: random(), y: .25 + random() * .46, speed: .009 + random() * .018,
    size: 9 + random() * 14, phase: random() * TAU, direction: i % 3 ? 1 : -1,
    color: i % 4, far: i > 15
  }));
  const bubbles = Array.from({ length: 30 }, () => ({
    x: random(), y: random(), size: .7 + random() * 2.5, speed: .012 + random() * .017
  }));
  const pebbles = Array.from({ length: 65 }, () => ({x: random(), y: random(), r: 1 + random() * 7}));
  const jellyfish = [{x:.23,y:.40,phase:1,size:22},{x:.76,y:.57,phase:4,size:15}];
  function ellipse(x, y, rx, ry, fill) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  }
  function floor(x) { return h * (.88 + .027 * Math.sin(x / w * 8) + .012 * Math.sin(x / w * 19)); }
  function water(t) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#08101b'); gradient.addColorStop(.07, '#153e40');
    gradient.addColorStop(.16, '#267f8e'); gradient.addColorStop(.35, '#115b76');
    gradient.addColorStop(.7, '#063347'); gradient.addColorStop(1, '#031c2c');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * .48, h * .14, 0, w * .48, h * .2, w * .8);
    glow.addColorStop(0, '#91f6da38'); glow.addColorStop(1, '#99ffdd00');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    // Soft shafts reaching from the illuminated waterline into blue depth.
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 9; i++) {
      const x = w * (i / 8) + Math.sin(t * .16 + i) * 25;
      const ray = ctx.createLinearGradient(x, h * .1, x + w * .2, h * .9);
      ray.addColorStop(0, '#b1ffe516'); ray.addColorStop(.5, '#a2efe508'); ray.addColorStop(1, '#8cffe000');
      ctx.fillStyle = ray; ctx.beginPath(); ctx.moveTo(x, h * .08);
      ctx.lineTo(x + w * .035, h * .08); ctx.lineTo(x + w * .35, h * .94);
      ctx.lineTo(x + w * .10, h * .94); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // Multiple continuous ripples make a visible, liquid surface under the rock.
    for (let layer = 0; layer < 9; layer++) {
      ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 8) {
        const y = h * (.095 + layer * .009) + Math.sin(x / 75 + t * .65 + layer) * (3 + layer * .55)
          + Math.sin(x / 29 - t * .42 + layer * .6) * 1.6;
        if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = layer < 3 ? 1.8 : .8;
      ctx.strokeStyle = `rgba(169,244,227,${.32 - layer * .029})`; ctx.stroke();
    }
    // Uneven ceiling connects naturally to the soil cross-section above.
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0);
    for (let x = w; x >= -12; x -= 12) ctx.lineTo(x, h * (.046 + .012 * Math.sin(x * .019) + .008 * Math.cos(x * .049)));
    ctx.closePath(); ctx.fillStyle = '#111d23'; ctx.fill();
  }
  function seabed(t) {
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, floor(x));
    ctx.lineTo(w, h); ctx.closePath();
    const sand = ctx.createLinearGradient(0, h * .84, 0, h);
    sand.addColorStop(0, '#527778'); sand.addColorStop(.4, '#214950'); sand.addColorStop(1, '#082631');
    ctx.fillStyle = sand; ctx.fill();
    for (const stone of pebbles) {
      const x = stone.x * w, y = floor(x) + stone.y * h * .12;
      ellipse(x, y, stone.r * 1.5, stone.r * .5, '#0a303b88');
      ellipse(x, y - 1, stone.r, stone.r * .45, '#64929144');
    }
    // Slowly shifting caustic highlights on the sand, without pixel filtering.
    ctx.save(); ctx.strokeStyle = '#b1e9d02a'; ctx.lineWidth = 1;
    for (let row = 0; row < 5; row++) {
      ctx.beginPath();
      for (let x = 0; x <= w + 10; x += 6) {
        const y = floor(x) + row * h * .024 + Math.sin(x / 37 + t * .48 + row * 2) * 5;
        if (!x) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function kelp(t, foreground) {
    for (const plant of plants) {
      if ((plant.depth === 0) !== foreground) continue;
      const x = plant.x * w, base = floor(x) + (foreground ? h * .06 : -h * .025);
      const height = plant.height * h * (foreground ? 1 : .68);
      const sway = Math.sin(t * .65 + plant.phase) * height * .075 + plant.lean;
      ctx.strokeStyle = foreground ? '#378c7b' : '#1c656b'; ctx.lineWidth = foreground ? 2.3 : 1.4;
      ctx.beginPath(); ctx.moveTo(x, base); ctx.bezierCurveTo(x-10,base-height*.4,x+sway,base-height*.65,x+sway,base-height); ctx.stroke();
      for (let i = 1; i < 9; i++) {
        const p = i / 9, px = x + sway * p * p, py = base - height * p;
        const side = i % 2 ? 1 : -1, len = height * .14 * (1 - p * .5);
        ctx.fillStyle = foreground ? (i % 2 ? '#3a9c83' : '#226e68') : '#1b6065';
        ctx.beginPath(); ctx.moveTo(px,py+6);
        ctx.quadraticCurveTo(px+side*len,py+3+Math.sin(t+plant.phase+p)*4,px+side*len*.8,py-len*.7);
        ctx.quadraticCurveTo(px+side*len*.2,py-len*.7,px,py+6); ctx.fill();
      }
    }
  }
  function swimmer(f, t) {
    const margin = 80, travel = ((f.x + t * f.speed) % 1) * (w + 2 * margin) - margin;
    const x = f.direction > 0 ? travel : w - travel;
    const y = h * f.y + Math.sin(t * .38 + f.phase) * h * .027;
    const s = f.size * Math.min(1.2, Math.max(.65,w / 950)) * (f.far ? .6 : 1);
    const tail = Math.sin(t * (5 + f.speed * 80) + f.phase);
    const palettes = [['#8ce2d9','#145264'],['#e6bc76','#7d603d'],['#8bb8d7','#23476b'],['#b0d6d5','#33586d']];
    const [light,dark] = palettes[f.color];
    ctx.save(); ctx.translate(x,y); ctx.scale(f.direction,1); ctx.globalAlpha = f.far ? .36 : .88;
    ctx.rotate(Math.cos(t*.38+f.phase)*.045);
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(-s*.65,0);
    ctx.lineTo(-s*1.35,-s*(.36+tail*.12)); ctx.quadraticCurveTo(-s*1.15,0,-s*1.35,s*(.36-tail*.12)); ctx.closePath(); ctx.fill();
    const shade = ctx.createLinearGradient(0,-s*.4,0,s*.45);
    shade.addColorStop(0,dark); shade.addColorStop(.45,light); shade.addColorStop(1,dark);
    ellipse(0,0,s,s*.39,shade);
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(-s*.3,-s*.25); ctx.lineTo(-s*.1,-s*.65); ctx.lineTo(s*.45,-s*.25); ctx.fill();
    ctx.strokeStyle = '#ffffff38'; ctx.lineWidth = .7; ctx.beginPath();ctx.moveTo(-s*.5,-s*.05);ctx.lineTo(s*.4,-s*.09);ctx.stroke();
    ellipse(s*.65,-s*.08,s*.075,s*.075,'#102532');
    ellipse(s*.67,-s*.10,s*.022,s*.022,'#ebffff');
    ctx.globalAlpha *= .6; ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(s*.14,0);
    ctx.lineTo(-s*.15,s*(.25+tail*.09)); ctx.lineTo(-s*.3,s*.03); ctx.fill(); ctx.restore();
  }
  function jelly(j, t) {
    const size = j.size * Math.min(1.2,Math.max(.7,w/950));
    const x = w*j.x + Math.sin(t*.16+j.phase)*w*.045, y=h*j.y+Math.cos(t*.32+j.phase)*h*.025;
    const pulse = 1 + Math.sin(t*1.8+j.phase)*.08;
    ctx.save(); ctx.translate(x,y);ctx.scale(pulse,1/pulse);
    for(let i=0;i<7;i++) {
      ctx.strokeStyle = i%2 ? '#b8f3eb50' : '#85c9df50'; ctx.lineWidth = .9;
      ctx.beginPath();const start=(i-3)*size*.22;ctx.moveTo(start,0);
      for(let k=1;k<=12;k++)ctx.lineTo(start+Math.sin(k*.55-t*1.5+i)*size*.18,size*k*.29);
      ctx.stroke();
    }
    const bell=ctx.createRadialGradient(0,-size*.45,1,0,0,size);
    bell.addColorStop(0,'#d8fff57a');bell.addColorStop(1,'#7bc8e00c');
    ctx.fillStyle=bell;ctx.beginPath();ctx.ellipse(0,0,size,size*.78,0,Math.PI,TAU);
    ctx.quadraticCurveTo(0,size*.2,-size,0);ctx.fill();ctx.strokeStyle='#bcfff36b';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  }
  function draw(t) {
    water(t); seabed(t); kelp(t,false);
    for(const f of fish) if(f.far) swimmer(f,t);
    for(const j of jellyfish) jelly(j,t);
    for(const f of fish) if(!f.far) swimmer(f,t);
    kelp(t,true);
    for(const b of bubbles) {
      const p=(b.y+t*b.speed)%1, y=h*(.96-p*.82);
      const x=w*b.x+Math.sin(t*.7+b.y*17)*8;
      ctx.strokeStyle='#c2ffff35';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(x,y,b.size,0,TAU);ctx.stroke();
      ellipse(x-b.size*.25,y-b.size*.3,b.size*.2,b.size*.15,'#e0ffff55');
    }
  }
  function tick(now) {
    frame=0; time+=Math.min((now-last)/1000,.08);last=now;
    if(now-painted>=1000/30) {draw(time);painted=now;}
    if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function sync() {
    if(frame)cancelAnimationFrame(frame);frame=0;
    if(!visible||document.hidden)return;
    draw(time);
    if(!reduced.matches){last=performance.now();painted=last;frame=requestAnimationFrame(tick);}
  }
  function resize() {
    w=section.clientWidth;h=section.clientHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);sync();
  }
  new ResizeObserver(resize).observe(section);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'100px'}).observe(section);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  resize();
})();
