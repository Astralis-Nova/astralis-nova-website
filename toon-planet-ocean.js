/* A photographic underwater setting with a living dimensional village.
   Background composition is cached; animation sleeps offscreen and honors
   reduced motion. No per-frame filters or pixel readbacks. */
import { createBikiniVillage } from './toon-bikini-bottom.js?v=20261106oceanlife';
(() => {
  'use strict';
  const section = document.getElementById('ocean');
  const canvas = section?.querySelector('.ocean-water');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let w = 1, h = 1, frame = 0, visible = false, time = 3, last = 0, painted = 0;
  let seed = 1977;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const fish = Array.from({ length: 15 }, (_, i) => ({
    x: random(), y: .21 + random() * .30, speed: .009 + random() * .018,
    size: 9 + random() * 14, phase: random() * TAU, direction: i % 3 ? 1 : -1,
    color: i % 4, far: i > 8
  }));
  const bubbles = Array.from({ length: 30 }, () => ({
    x: random(), y: random(), size: .7 + random() * 2.5, speed: .012 + random() * .017
  }));
  const jellyfish = [{x:.23,y:.40,phase:1,size:22},{x:.76,y:.57,phase:4,size:15}];
  function ellipse(x, y, rx, ry, fill) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  }
  const environment = new Image(), background = document.createElement('canvas');
  const village = createBikiniVillage(sync);
  let sceneY = 0, sceneH = 1, requested = false;
  environment.onload = () => { compose(); sync(); };
  function compose() {
    background.width = Math.max(1,Math.round(w));background.height = Math.max(1,Math.round(h));
    const bg = background.getContext('2d');
    const gradient=bg.createLinearGradient(0,0,0,h);
    gradient.addColorStop(0,'#087a92');gradient.addColorStop(.65,'#116c8b');gradient.addColorStop(1,'#3b7779');
    bg.fillStyle=gradient;bg.fillRect(0,0,w,h);
    const bottomPad=w<600?90:20;
    sceneH=Math.min(h-bottomPad,w*2/3);sceneY=h-sceneH-bottomPad;
    if(!environment.complete||!environment.naturalWidth)return;
    // Preserve house proportions and show the complete village on narrow phones.
    // Only the open water above it is extended to fill a tall viewport.
    bg.globalAlpha=.18;
    bg.drawImage(environment,0,0,environment.width,environment.height*.31,0,0,w,h);
    bg.globalAlpha=1;
    const layer=document.createElement('canvas');layer.width=Math.round(w);layer.height=Math.ceil(sceneH);
    const lc=layer.getContext('2d');lc.drawImage(environment,0,0,w,sceneH);
    if(sceneY>2){
      lc.globalCompositeOperation='destination-in';
      const fade=lc.createLinearGradient(0,0,0,sceneH*.23);
      fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');lc.fillStyle=fade;lc.fillRect(0,0,w,sceneH);
    }
    bg.drawImage(layer,0,sceneY);
    const sample=bg.getImageData(Math.floor(w*.5),Math.max(0,Math.floor(sceneY+sceneH-2)),1,1).data;
    const sandTail=bg.createLinearGradient(0,sceneY+sceneH-12,0,h);
    sandTail.addColorStop(0,`rgba(${sample[0]},${sample[1]},${sample[2]},0)`);
    sandTail.addColorStop(.18,`rgb(${sample[0]},${sample[1]},${sample[2]})`);
    sandTail.addColorStop(1,'#285966');bg.fillStyle=sandTail;
    bg.fillRect(0,sceneY+sceneH-12,w,bottomPad+12);
  }
  function water(t) {
    ctx.drawImage(background,0,0,w,h);
    // Moving, irregular refracted light. Overlapping soft ellipses avoid the
    // previous hard triangular beams and keep the photographic detail clear.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<5;i++){
      const x=w*(.12+i*.19)+Math.sin(t*.18+i*2)*w*.035;
      const y=h*(.14+i*.11),r=Math.max(w,h)*(.22+i*.012);
      const glow=ctx.createRadialGradient(x,y,0,x,y,r);
      glow.addColorStop(0,`rgba(162,241,222,${.026+Math.sin(t*.47+i)*.009})`);glow.addColorStop(1,'#9fffe000');
      ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    }
    // Broken, moving caustic nets over the actual textured sandy foreground.
    ctx.lineWidth=.9;
    for(let row=0;row<4;row++){
      ctx.strokeStyle=`rgba(205,255,229,${.06+Math.sin(t*.5+row)*.02})`;ctx.beginPath();
      for(let x=0;x<=w+6;x+=6){
        const y=sceneY+sceneH*(.80+row*.05)+Math.sin(x/43+t*.45+row*1.9)*sceneH*.006+Math.cos(x/19-t*.34)*2;
        if(!x)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.restore();
    // Dark, feathered rock-to-water transition beneath the burrow layer.
    const edge=ctx.createLinearGradient(0,0,0,Math.min(115,h*.13));
    edge.addColorStop(0,'#08101b');edge.addColorStop(.3,'#08101b99');edge.addColorStop(1,'#08101b00');
    ctx.fillStyle=edge;ctx.fillRect(0,0,w,Math.min(115,h*.13));
  }
  function seaGrass(t) {
    for(let side=0;side<2;side++)for(let i=0;i<11;i++){
      const x=side?w-i*w*.009:i*w*.009;
      const y=sceneY+sceneH*(.97+Math.sin(i)*.015),height=sceneH*(.06+(i%4)*.018);
      const sway=Math.sin(t*.7+i*.5+side)*height*.12;
      ctx.lineWidth=1.5+(i%3)*.5;ctx.strokeStyle=i%2?'#40846acc':'#19584dcc';
      ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+3,y-height*.4,x+sway,y-height*.8,x+sway+5,y-height);ctx.stroke();
    }
  }
  function crab(t,index) {
    const x=w*(.13+index*.71)+Math.sin(t*.25+index)*w*.035,y=sceneY+sceneH*(.93+index*.035);
    const size=Math.max(5,Math.min(13,w*.009));
    ctx.save();ctx.translate(x,y);ctx.lineCap='round';
    ellipse(0,3,size*1.7,size*.27,'#173d4370');
    for(let side=-1;side<=1;side+=2)for(let leg=0;leg<3;leg++){
      const step=Math.sin(t*5+leg*2+side)*size*.14;ctx.strokeStyle='#853c29';ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(side*size*.5,0);ctx.lineTo(side*size*(1.1+leg*.12),-size*.2+step);
      ctx.lineTo(side*size*(1.5+leg*.12),size*.35);ctx.stroke();
    }
    const shell=ctx.createLinearGradient(0,-size,0,size*.3);shell.addColorStop(0,'#dd9762');shell.addColorStop(.5,'#ad552f');shell.addColorStop(1,'#632a23');
    ellipse(0,-size*.18,size,size*.53,shell);
    for(const side of [-1,1]){
      ctx.strokeStyle='#9e492e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(side*size*.5,-size*.25);ctx.lineTo(side*size*1.18,-size*.85);ctx.stroke();
      ellipse(side*size*1.22,-size*.97,size*.27,size*.35,'#bf713f');
      ellipse(side*size*.35,-size*.67,size*.11,size*.16,'#122e32');
    }
    ctx.restore();
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
    water(t);
    for(const f of fish) if(f.far) swimmer(f,t);
    for(const j of jellyfish) jelly(j,t);
    for(const f of fish) if(!f.far) swimmer(f,t);
    village.draw(ctx,t,{w,sceneY,sceneH});
    crab(t,0);crab(t,1);seaGrass(t);
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
    if(!requested){requested=true;environment.src='/assets/toon-planet/bikini-bottom-ocean.webp';village.load();}
    draw(time);
    if(!reduced.matches){last=performance.now();painted=last;frame=requestAnimationFrame(tick);}
  }
  function resize() {
    w=section.clientWidth;h=section.clientHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);compose();sync();
  }
  new ResizeObserver(resize).observe(section);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'100px'}).observe(section);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  resize();
})();
