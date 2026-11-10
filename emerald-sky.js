(() => {
  'use strict';
  const root = document.getElementById('emeraldSky');
  const canvas = document.getElementById('emeraldSkyCanvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!root || !ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...root.querySelectorAll('button[data-sky-mode]')];
  const phaseLabel = document.getElementById('skyPhaseLabel');
  let width = 1, height = 1, dpr = 1, frame = null, last = 0, elapsed = 0;
  let mode = 'auto', phase = .29, night = .65, visible = true, paused = reduced.matches;
  let seed = 71327;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 310 }, () => ({ x: random(), y: random() * .88, size: .35 + random() * 1.3, phase: random() * Math.PI * 2, depth: random() }));
  // Cache the nebular dust; never repaint a large pixel-noise field per frame.
  const dust = document.createElement('canvas'); dust.width = 720; dust.height = 440;
  const dc = dust.getContext('2d');
  if (dc) {
    const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    const noise = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
      fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
      return (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy) + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
    };
    const image = dc.createImageData(dust.width, dust.height);
    for (let y = 0; y < dust.height; y++) for (let x = 0; x < dust.width; x++) {
      let n = 0, amplitude = .5, frequency = 1;
      for (let o = 0; o < 5; o++) { n += noise(x / 83 * frequency, y / 61 * frequency) * amplitude; frequency *= 2.03; amplitude *= .5; }
      const axis = y / dust.height - (.82 - x / dust.width * .64);
      const band = Math.exp(-axis * axis * 25);
      const density = Math.max(0, n - .28) * band;
      const i = (y * dust.width + x) * 4;
      image.data[i] = 110 + n * 98; image.data[i + 1] = 126 + n * 94; image.data[i + 2] = 169 + n * 72;
      image.data[i + 3] = Math.min(122, density * 236);
    }
    dc.putImageData(image, 0, 0);
  }
  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(random) {
    return Math.sqrt(-2 * Math.log(Math.max(random(), 1e-7))) * Math.cos(2 * Math.PI * random());
  }

  function cloudSprite(color) {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const ctx = sprite.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${color},.65)`);
    gradient.addColorStop(.25, `rgba(${color},.32)`);
    gradient.addColorStop(.6, `rgba(${color},.08)`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return sprite;
  }

  function armPoint(t, arm, random, spread = 1, angleOffset = 0) {
    const radius = 62 + 464 * Math.pow(t, .86);
    const angle = arm * Math.PI + 4.8 * t + .10 * Math.sin(t * 16 + arm) + angleOffset;
    const scatter = (8 + 19 * t) * spread;
    const r = radius + gaussian(random) * scatter;
    const a = angle + gaussian(random) * .025 * spread;
    return {x:CENTER + r * Math.cos(a), y:CENTER + r * Math.sin(a), t};
  }

  function drawGalaxy(canvas) {
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return false;
    canvas.width = canvas.height = SIZE;
    const random = seededRandom(20261007);
    const clouds = [cloudSprite("194,214,241"), cloudSprite("147,185,235"), cloudSprite("229,221,201"), cloudSprite("230,158,186")];
    const dust = cloudSprite("0,0,0");
    if (clouds.some(sprite => !sprite) || !dust) return false;
    ctx.globalCompositeOperation = "screen";

    const halo = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 550);
    halo.addColorStop(0, "rgba(255,229,181,.34)");
    halo.addColorStop(.20, "rgba(218,214,208,.19)");
    halo.addColorStop(.49, "rgba(132,161,205,.08)");
    halo.addColorStop(.83, "rgba(90,134,197,.025)");
    halo.addColorStop(1, "rgba(90,134,197,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Irregular luminous clouds, rather than smooth outlined spiral ribbons.
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 1550; i += 1) {
        const t = random();
        const p = armPoint(t, arm, random, 1.2);
        const size = 18 + random() * 40 + 20 * t;
        const density = .6 + .4 * Math.sin(t * 43 + arm * 2);
        ctx.globalAlpha = (.06 + random() * .13) * density * (1 - .55 * t);
        const sprite = t < .25 ? clouds[2] : clouds[random() < .55 ? 0 : 1];
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      // Fainter branching arms keep the outer disk asymmetric and feathered.
      for (let i = 0; i < 360; i += 1) {
        const t = .35 + random() * .62;
        const p = armPoint(t, arm, random, 1.5, .46);
        const size = 24 + random() * 35;
        ctx.globalAlpha = .035 * (1 - t);
        ctx.drawImage(clouds[1], p.x - size / 2, p.y - size / 2, size, size);
      }
    }

    // Dust absorbs light along the inner edge of each arm. Ragged clouds avoid
    // evenly spaced rings and allow the underlying space to show through.
    ctx.globalCompositeOperation = "destination-out";
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 1600; i += 1) {
        const t = .08 + random() * .86;
        const p = armPoint(t, arm, random, .40, -.085);
        const size = 8 + random() * 23;
        ctx.globalAlpha = (.16 + random() * .28) * (1 - .45 * t);
        ctx.drawImage(dust, p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    ctx.globalCompositeOperation = "screen";

    // Fine individual stars blend into dense stellar populations at display size.
    const starColors = ["235,242,253", "190,215,249", "161,198,239", "255,231,191"];
    ctx.globalAlpha = 1;
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 6400; i += 1) {
        const t = random();
        const p = armPoint(t, arm, random, random() < .2 ? 2.6 : .85);
        const size = .25 + random() * .75;
        const alpha = (.13 + random() * .55) * (1 - .60 * Math.pow(t, 3));
        const color = t < .24 ? starColors[3] : starColors[Math.floor(random() * 3)];
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Small blue clusters and occasional rose emission nebulae.
      for (let i = 0; i < 105; i += 1) {
        const t = .22 + random() * .70;
        const p = armPoint(t, arm, random, .8, .045);
        const size = 8 + random() * 16;
        ctx.globalAlpha = .18 + random() * .28;
        ctx.drawImage(clouds[random() < .23 ? 3 : 1], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // Diffuse disk stars and the warm, densely packed older stellar bulge.
    for (let i = 0; i < 2600; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.min(555, Math.abs(gaussian(random)) * 170);
      const x = CENTER + radius * Math.cos(angle);
      const y = CENTER + radius * Math.sin(angle);
      const warm = radius < 150;
      ctx.fillStyle = `rgba(${warm ? "255,231,194" : "211,223,243"},${.08 + random() * (warm ? .36 : .20)})`;
      ctx.fillRect(x, y, .5 + random() * .7, .5 + random() * .7);
    }

    const bulge = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 175);
    bulge.addColorStop(0, "rgba(255,252,236,.99)");
    bulge.addColorStop(.10, "rgba(255,243,214,.84)");
    bulge.addColorStop(.28, "rgba(255,224,184,.46)");
    bulge.addColorStop(.56, "rgba(230,192,157,.15)");
    bulge.addColorStop(1, "rgba(210,183,162,0)");
    ctx.fillStyle = bulge;
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Fade every edge to transparency so no rotating rectangle can appear.
    ctx.globalCompositeOperation = "destination-in";
    const edge = ctx.createRadialGradient(CENTER, CENTER, 480, CENTER, CENTER, 603);
    edge.addColorStop(0, "rgba(0,0,0,1)");
    edge.addColorStop(.55, "rgba(0,0,0,.65)");
    edge.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = "source-over";
    return true;
  }


  // Equirectangular textures are sampled through a sphere, not slid across a flat disk.
  // Geometry and lighting are cached; only longitude and independent clouds change.
  function makeBody(selector, kind, size, speed) {
    const host = root.querySelector(selector);
    if (!host) return null;
    const surface = document.createElement('canvas');
    surface.className = 'sky-body-canvas'; surface.width = surface.height = size;
    surface.setAttribute('aria-hidden', 'true');
    const context = surface.getContext('2d');
    if (!context) return null;
    const tw = 512, th = 256, texture = new Uint8ClampedArray(tw * th * 3), cloudMap=new Float32Array(tw*th);
    const h = (x,y) => { const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v); };
    const noise = (x,y) => {
      const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;
      fx*=fx*(3-2*fx);fy*=fy*(3-2*fy);
      return (h(ix,iy)*(1-fx)+h(ix+1,iy)*fx)*(1-fy)+(h(ix,iy+1)*(1-fx)+h(ix+1,iy+1)*fx)*fy;
    };
    const craters=Array.from({length:65},()=>({x:random()*tw,y:random()*th,r:2+random()*15}));
    for(let y=0;y<th;y++)for(let x=0;x<tw;x++){
      const lon=x/tw*Math.PI*2,lat=(y/th-.5)*Math.PI;
      // Periodic noise is seamless at the longitude wrap.
      const n=noise(Math.cos(lon)*3.8+12,Math.sin(lon)*3.8+y/29)*.6+noise(Math.cos(lon)*12+31,Math.sin(lon)*12+y/9)*.3+noise(x/3,y/3)*.1;
      let color;
      if(kind==='gas'){
        const bands=.5+.5*Math.sin(y*.33+n*4.5+Math.sin(lon*3)*.32);
        const storm=Math.exp(-Math.pow((x-332)/29,2)-Math.pow((y-157)/10,2));
        color=[92+bands*74+n*38+storm*52,123+bands*62+n*30-storm*36,126+bands*48+n*35-storm*44];
      }else if(kind==='ocean'){
        const continental=noise(Math.cos(lon)*2.1+13,Math.sin(lon)*2.1+y/63)*.7+noise(Math.cos(lon)*6.8+24,Math.sin(lon)*6.8+y/22)*.3;
        const land=Math.max(0,Math.min(1,(continental-.5)*18));
        cloudMap[y*tw+x]=Math.max(0,Math.min(1,(noise(Math.cos(lon)*7+21,Math.sin(lon)*7+y/14)-.55)*4));
        color=[14+land*61,55+land*62,99-land*38];
        if(Math.abs(lat)>1.25)color=[181,199,202];
      }else if(kind==='sun'){
        const gran=noise(x/2,y/2),flow=.5+.5*Math.sin(lon*11+n*9+y*.2);
        color=[255,155+n*65+gran*22,45+flow*30+gran*22];
      }else{
        let relief=0;
        for(const c of craters){
          const dx=Math.min(Math.abs(x-c.x),tw-Math.abs(x-c.x));
          const d=Math.hypot(dx,y-c.y)/c.r;
          if(d<1.25)relief+=d<.85?-.16*(1-d):.2*Math.max(0,1-Math.abs(d-1)*4);
        }
        const v=kind==='rock'?122:175, tone=(n-.5)*91+relief*120;
        color=[v+tone+12,v+tone+7,v+tone+(kind==='rock'?-12:8)];
      }
      const i=(y*tw+x)*3;for(let k=0;k<3;k++)texture[i+k]=color[k];
    }
    const pixels=context.createImageData(size,size), map=[];
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const nx=(x+.5-size/2)/(size/2-1),ny=-(y+.5-size/2)/(size/2-1),r2=nx*nx+ny*ny;
      if(r2>1)continue;
      const nz=Math.sqrt(1-r2),u=Math.atan2(nx,nz)/(2*Math.PI)+.5,v=.5-Math.asin(ny)/Math.PI;
      const light=Math.max(0,nx*-.58+ny*.44+nz*.68);
      const shade=kind==='sun'?.76+.24*nz:.07+.93*Math.pow(light,.85);
      map.push({i:(y*size+x)*4,u:u*tw,v:Math.min(th-1,Math.floor(v*th)),shade,edge:Math.pow(1-nz,3)*light,alpha:Math.min(1,(1-r2)*size/2)});
    }
    host.appendChild(surface);host.classList.add('sky-body-rendered');
    return {draw(t){
      const offset=t*speed;
      for(const p of map){
        const tx=((Math.floor(p.u+offset)%tw)+tw)%tw,si=(p.v*tw+tx)*3;
        const cloud=kind==='ocean'?cloudMap[p.v*tw+((Math.floor(p.u+offset*1.35+31)%tw)+tw)%tw]*.78:0;
        for(let k=0;k<3;k++)pixels.data[p.i+k]=(texture[si+k]*(1-cloud)+225*cloud)*p.shade+p.edge*(kind==='gas'?[28,53,60][k]:[16,34,53][k]);
        pixels.data[p.i+3]=255*p.alpha;
      }
      context.putImageData(pixels,0,0);surface.dataset.rotation=(offset/tw*360%360).toFixed(1);
    }};
  }
  const bodies=[
    makeBody('.sky-world-large','gas',160,5.2),
    makeBody('.sky-world-small','ocean',80,7.1),
    makeBody('.sky-world-far','rock',40,3.5),
    makeBody('.sky-moon-art','moon',176,1.9),
    makeBody('.sky-sun-art','sun',176,3.8)
  ].filter(Boolean);
  const galaxy=document.createElement('canvas');
  const SIZE=1280,CENTER=SIZE/2;
  drawGalaxy(galaxy);
  function drawGalaxySky() {
    ctx.save();
    ctx.globalAlpha=(.22+night*.47);
    ctx.globalCompositeOperation='screen';
    ctx.translate(width*.60,height*.31);ctx.rotate(-.32);ctx.scale(1,.46);
    ctx.rotate(elapsed*.018);
    const diameter=Math.max(650,Math.min(1160,width*1.02));
    ctx.drawImage(galaxy,-diameter/2,-diameter/2,diameter,diameter);
    ctx.restore();
  }
  function drawMeteor(){
    const cycle=elapsed%14;
    if(cycle<3.5||cycle>4.65)return;
    const p=(cycle-3.5)/1.15, x=width*(.25+p*.38),y=height*(.14+p*.19);
    const length=65+Math.sin(p*Math.PI)*75;
    ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)*(.15+night*.7);
    const trail=ctx.createLinearGradient(x-length,y-length*.5,x,y);
    trail.addColorStop(0,'#bbdff000');trail.addColorStop(1,'#eaf6ff');
    ctx.strokeStyle=trail;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-length,y-length*.5);ctx.lineTo(x,y);ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,1.7,0,Math.PI*2);ctx.fill();ctx.restore();
  }


  function lighting() {
    const target = mode === 'day' ? 0 : mode === 'dusk' ? .5 : mode === 'night' ? 1 : (1 - Math.cos(phase * Math.PI * 2)) / 2;
    night = target;
    root.style.setProperty('--sky-night', night.toFixed(3));
    root.style.setProperty('--sky-day', (1 - night).toFixed(3));
    root.style.setProperty('--sky-dusk', (1 - Math.abs(night * 2 - 1)).toFixed(3));
    const label = night < .23 ? 'Daylight · a world unfolding' : night > .8 ? 'Night · worlds beyond one world' : 'Twilight · a threshold between worlds';
    if (phaseLabel.textContent !== label) phaseLabel.textContent = label;
    root.dataset.skyPhase = night < .23 ? 'day' : night > .8 ? 'night' : 'dusk';
  }
  const starGlow=document.createElement('canvas');starGlow.width=starGlow.height=48;
  const glowContext=starGlow.getContext('2d');
  if(glowContext){const g=glowContext.createRadialGradient(24,24,0,24,24,24);g.addColorStop(0,'#d7efffbb');g.addColorStop(.12,'#c4e6ff55');g.addColorStop(.4,'#a8d5f51a');g.addColorStop(1,'#a8d5f500');glowContext.fillStyle=g;glowContext.fillRect(0,0,48,48);}
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#060d20'); bg.addColorStop(.55, '#102237'); bg.addColorStop(1, '#092019');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = .25 + night * .75;
    const drift = Math.sin(elapsed * .025) * 20;
    ctx.drawImage(dust, -30 + drift, -12, width + 60, height * .9);
    drawGalaxySky();
    for (const star of stars) {
      const x = ((star.x * width + elapsed * (1.1 + 2.6 * star.depth)) % width + width) % width;
      const y = star.y * height + Math.sin(elapsed * .04 + star.phase) * (2 + star.depth * 4);
      const twinkle = .65 + .35 * Math.sin(elapsed * 1.15 + star.phase);
      ctx.globalAlpha = (.14 + night * .86) * twinkle;
      ctx.fillStyle = star.depth > .7 ? '#f9e9c6' : '#c7e7f0';
      ctx.beginPath(); ctx.arc(x, y, star.size, 0, Math.PI * 2); ctx.fill();
      if (star.size > 1.5) { ctx.globalAlpha *= .7; ctx.drawImage(starGlow,x-11,y-11,22,22); }
    }
    ctx.globalAlpha = 1;
    drawMeteor();
    bodies.forEach(body => body.draw(elapsed));
    canvas.dataset.skyTime = elapsed.toFixed(2);
    canvas.dataset.renderer = "spherical-textures-v2";
  }
  function resize() {
    const rect = root.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw();
  }
  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden) return;
    if (!last || now - last >= 50) {
      const dt = last ? Math.min((now - last) / 1000, .2) : 0; last = now;
      elapsed += dt;
      if (mode === 'auto') { phase = (phase + dt / 240) % 1; lighting(); }
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0;
    const running = !paused && visible && !document.hidden;
    root.dataset.motion = running ? 'running' : 'paused';
    canvas.dataset.skyState = running ? 'running' : paused ? 'paused' : 'offscreen';
    if (running) frame = requestAnimationFrame(tick);
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.skyMode; root.dataset.skyMode = mode;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    lighting(); draw();
  }));
  const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio > .01; sync(); }, { threshold: .01 });
  observer.observe(root); new ResizeObserver(resize).observe(root);
  document.addEventListener('visibilitychange', sync);
  window.EmeraldSky = { pause(value) { paused = Boolean(value); sync(); } };
  lighting(); resize(); sync();
})();

