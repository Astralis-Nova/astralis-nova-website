(() => {
  const dragon = document.querySelector('.ac-dragon-emblem');
  const canvas = document.getElementById('acDragonCanvas');
  const still = document.getElementById('acDragonStill');
  const toggle = document.getElementById('acDragonToggle');
  if (!dragon || !canvas || !still || !toggle) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const home = dragon.parentElement;
  const art = dragon.querySelector('.ac-dragon-art');
  const stage = document.createElement('div');
  stage.className = 'ac-dragon-stage';
  stage.setAttribute('aria-hidden','true');
  document.body.append(stage);
  const anchor = document.createElement('div');
  anchor.className = 'ac-dragon-anchor';
  anchor.setAttribute('aria-hidden','true');
  home.append(anchor);
  const aura = document.createElement('div');
  aura.className = 'ac-dragon-aura';
  aura.setAttribute('aria-hidden','true');
  art.prepend(aura);
  const fire = document.createElement('canvas');
  fire.className = 'ac-dragon-fire';
  fire.width = 1024;
  fire.height = 768;
  fire.setAttribute('aria-hidden','true');
  art.append(fire);
  const flame = fire.getContext('2d');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sheet = new Image();
  let ready=false, playing=!preference.matches, request=0, previousTime=null, elapsed=0;
  let lastFrame=-1, facing=1, bank=0, particles=[], emission=0;
  let route=[], lengths=[], distance=0, flightSize=180;
  // Rest, awaken, take off, patrol, return, and become the original emblem.
  const timing = {rest:5000,awaken:2800,launch:2800,flight:26000,return:3600,restore:2800};
  const end = {};
  let duration=0;
  for (const [phase,length] of Object.entries(timing)) end[phase]=duration+=length;
  const clamp = value => Math.max(0,Math.min(1,value));
  const ease = value => {value=clamp(value);return value*value*(3-2*value);};
  const mix = (a,b,p) => a+(b-a)*p;
  const updateButton = () => {
    const label=playing?'Pause dragon animation':'Play dragon animation';
    toggle.dataset.playing=String(playing);
    toggle.setAttribute('aria-label',label);
    toggle.title=label;
  };
  const measureRoute = () => {
    flightSize=Math.min(230,Math.max(110,innerWidth*.19));
    const topbar=document.querySelector('.topbar');
    const top=Math.max(78,(topbar?topbar.getBoundingClientRect().bottom:68)+12);
    const margin=Math.max(12,flightSize*.16);
    const left=margin, right=Math.max(left,innerWidth-flightSize-margin);
    const bottom=Math.max(top,innerHeight-flightSize-margin);
    const width=right-left,height=bottom-top;
    // A rounded oval replaces sharp corners.
    route=[];lengths=[];distance=0;
    for(let i=0;i<=160;i++){
      const angle=-Math.PI/2+i/160*Math.PI*2;
      const point={x:left+width*(.5+.5*Math.cos(angle)),y:top+height*(.5+.5*Math.sin(angle))};
      if(i) distance+=Math.hypot(point.x-route[i-1].x,point.y-route[i-1].y);
      route.push(point);lengths.push(distance);
    }
  };
  const flightPosition = progress => {
    const travelled=clamp(progress)*distance;
    let i=1;
    while(i<route.length-1&&lengths[i]<travelled)i++;
    const a=route[i-1],b=route[i],length=lengths[i]-lengths[i-1];
    const p=length?(travelled-lengths[i-1])/length:0;
    return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),dx:b.x-a.x,dy:b.y-a.y};
  };
  const clearFire = () => {
    particles=[];emission=0;
    if(flame)flame.clearRect(0,0,fire.width,fire.height);
    dragon.dataset.breathing='false';fire.hidden=true;
  };
  const renderFire = (dt,power,frame,available) => {
    if(!flame)return;
    // Mouth coordinates follow the six wing frames.
    const mouths=[[441,276],[448,280],[445,274],[441,274],[447,278],[451,278]];
    const mouth=mouths[frame],origin={x:mouth[0],y:mouth[1]+128};
    const length=Math.max(50,Math.min(335,available));
    emission+=dt*power*.18;
    while(emission>=1&&particles.length<170){
      emission--;
      const life=.35+Math.random()*.32;
      particles.push({x:origin.x,y:origin.y,vx:length/life,vy:18+(Math.random()-.5)*95,
        life,age:0,radius:8+Math.random()*14});
    }
    flame.clearRect(0,0,fire.width,fire.height);
    flame.globalCompositeOperation='lighter';
    const seconds=dt/1000;
    particles=particles.filter(p=>p.age<p.life);
    for(const p of particles){
      p.age+=seconds;p.x+=p.vx*seconds;p.y+=p.vy*seconds;
      const age=clamp(p.age/p.life),radius=p.radius*(1+age*1.35),alpha=(1-age)*.65;
      const glow=flame.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
      glow.addColorStop(0,'rgba(255,250,200,'+alpha+')');
      glow.addColorStop(.25,'rgba(255,191,44,'+alpha+')');
      glow.addColorStop(.6,'rgba(255,67,6,'+(alpha*.8)+')');
      glow.addColorStop(1,'rgba(160,20,0,0)');
      flame.fillStyle=glow;
      flame.beginPath();flame.arc(p.x,p.y,radius,0,Math.PI*2);flame.fill();
    }
    flame.globalCompositeOperation='source-over';
    fire.hidden=!(power>0||particles.length>0);
    dragon.dataset.breathing=String(power>0||particles.length>0);
  };
  const dock = () => {
    if(dragon.parentElement!==home)home.append(dragon);
    dragon.dataset.flying='false';dragon.dataset.phase='rest';
    dragon.style.removeProperty('transform');dragon.style.removeProperty('width');
    art.style.setProperty('--dragon-aura','0');
    canvas.style.opacity='0';still.style.opacity='1';canvas.hidden=true;
    clearFire();
  };
  const render = dt => {
    const cycle=elapsed%duration;
    let phase='rest',offset=0;
    for(const name of Object.keys(timing)){
      if(cycle<end[name]){phase=name;break;}
      offset=end[name];
    }
    const progress=clamp((cycle-offset)/timing[phase]);
    dragon.dataset.phase=phase;
    if(phase==='rest'){dock();facing=1;bank=0;return;}
    if(dragon.parentElement!==stage)stage.append(dragon);
    dragon.dataset.flying='true';canvas.hidden=false;
    const homeRect=anchor.getBoundingClientRect();
    let x=homeRect.x,y=homeRect.y,size=homeRect.width;
    let blend=1,glow=0,targetFacing=1,targetBank=0,firePower=0;
    if(phase==='awaken'){
      glow=Math.sin(progress*Math.PI);blend=ease((progress-.3)/.6);
    }else if(phase==='launch'){
      const p=ease(progress),start=route[0];
      x=mix(homeRect.x,start.x,p);y=mix(homeRect.y,start.y,p)-Math.sin(progress*Math.PI)*24;
      size=mix(homeRect.width,flightSize,p);glow=(1-progress)*.3;
    }else if(phase==='flight'){
      const p=flightPosition(progress);
      x=p.x;y=p.y;size=flightSize;targetFacing=p.dx>=0?1:-1;
      targetBank=Math.max(-16,Math.min(16,Math.atan2(p.dy,Math.abs(p.dx))*15))*targetFacing;
      // Three brief breaths during each circuit.
      const flightTime=progress*timing.flight;
      for(const start of [3500,12000,20000]){
        const breath=(flightTime-start)/1500;
        if(breath>0&&breath<1)firePower=Math.sin(breath*Math.PI);
      }
    }else if(phase==='return'){
      const p=ease(progress),start=route[route.length-1];
      x=mix(start.x,homeRect.x,p);y=mix(start.y,homeRect.y,p);
      size=mix(flightSize,homeRect.width,p);
    }else if(phase==='restore'){
      glow=Math.sin(progress*Math.PI);blend=1-ease((progress-.2)/.65);
    }
    const smoothing=1-Math.exp(-dt/110);
    facing=mix(facing,targetFacing,smoothing);bank=mix(bank,targetBank,smoothing);
    if(phase==='awaken'||phase==='restore'){facing=1;bank=0;}
    dragon.style.width=size+'px';
    dragon.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+bank+'deg) scaleX('+facing+')';
    canvas.style.opacity=String(blend);still.style.opacity=String(1-blend);
    art.style.setProperty('--dragon-aura',glow.toFixed(3));
    const frame=Math.floor(elapsed/140)%6;
    if(frame!==lastFrame){
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(sheet,(frame%3)*canvas.width,Math.floor(frame/3)*canvas.height,
        canvas.width,canvas.height,0,0,canvas.width,canvas.height);lastFrame=frame;
    }
    const freeSpace=targetFacing>0?innerWidth-(x+size*.87):x+size*.13;
    const available=Math.max(0,(freeSpace-12)*512/Math.max(1,size));
    renderFire(dt,phase==='flight'&&available>70?firePower:0,frame,available);
  };
  const draw = time => {
    request=0;
    if(!playing||document.hidden||!ready){previousTime=null;return;}
    const dt=previousTime===null?0:Math.min(time-previousTime,100);
    previousTime=time;elapsed+=dt;render(dt);request=requestAnimationFrame(draw);
  };
  const sync = () => {
    if(request)cancelAnimationFrame(request);
    request=0;previousTime=null;updateButton();
    if(playing&&ready&&!document.hidden)request=requestAnimationFrame(draw);
  };
  const park = () => {playing=false;elapsed=0;lastFrame=-1;dock();sync();};
  document.body.append(toggle);toggle.hidden=false;
  toggle.addEventListener('click',()=>{playing=!playing;sync();});
  preference.addEventListener('change',()=>{
    if(preference.matches)park();else{playing=true;sync();}
  });
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('resize',()=>{measureRoute();if(ready&&playing)render(0);},{passive:true});
  sheet.onload=()=>{
    if(!sheet.naturalWidth||sheet.naturalWidth%3||sheet.naturalHeight%2){park();toggle.hidden=true;return;}
    canvas.width=sheet.naturalWidth/3;canvas.height=sheet.naturalHeight/2;
    ready=true;measureRoute();dock();sync();
  };
  sheet.onerror=()=>{park();toggle.hidden=true;};
  sheet.src='/assets/ac-portals/ac-dragon-flight-sheet.webp';
  updateButton();
})();
