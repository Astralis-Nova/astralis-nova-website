(() => {
  'use strict';
  const rig = window.AstralisDragonRig;
  const puppet=window.AstralisDragonPuppet;
  if (!rig || !puppet) return;
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
  const sheet = new Image(),forwardSheet=new Image();
  const posePlate = document.createElement('canvas'), bodyPlate = document.createElement('canvas');
  posePlate.width = posePlate.height = bodyPlate.width = bodyPlate.height = 512;
  const poseContext = posePlate.getContext('2d'), bodyContext = bodyPlate.getContext('2d');
  if (!poseContext || !bodyContext) return;
  const gpuCanvas=document.createElement('canvas'),forwardGpuCanvas=document.createElement('canvas');
  let gpu=null,forwardGPU=null,forwardReady=false,forwardLoaded=0,disposed = false;
  let ready=false, playing=!preference.matches, request=0, previousTime=null, elapsed=0;
  let facing=1, bank=0, particles=[], emission=0, paintClock=-Infinity;
  let mouth={x:441,y:276};
  let route=[], flightSize=180;
  // Rest, awaken, take off, patrol, return, and become the original emblem.
  const timing = {rest:5000,awaken:2800,launch:2800,flight:28000,return:3600,restore:2800};
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
    const topbar=document.querySelector('.topbar');
    const top=Math.max(78,(topbar?topbar.getBoundingClientRect().bottom:68)+12);
    route = [rig.route(0, innerWidth, innerHeight, top)];
    flightSize=route[0].size;
    route.top=top;
  };
  const flightPosition = progress => rig.route(progress, innerWidth, innerHeight, route.top,progress*28);
  function paintBody(seconds,approach,launching,view=0,proximity=0) {
    const pose=rig.pose(seconds,approach,launching,proximity),weights=rig.weights(pose.phase,pose.glide);
    const sideAnchors=[[441,276],[448,280],[445,274],[441,274],[447,278],[451,278]];
    context.clearRect(0,0,512,512);
    for(const [front,weight] of [[false,1-view],[true,view]]){
      if(weight<.0001)continue;
      const image=front?forwardSheet:sheet,anchors=front?puppet.forwardAnchors:sideAnchors;
      const target=front?[314,240]:[441,276],state={...pose,frontView:front,limbAnchors:puppet.limbAnchors(front,weights)};
      poseContext.clearRect(0,0,512,512);poseContext.globalCompositeOperation='lighter';
      for(const [frame,alpha] of weights){
        poseContext.globalAlpha=alpha;
        poseContext.drawImage(image,(frame%3)*512,Math.floor(frame/3)*512,512,512,target[0]-anchors[frame][0],target[1]-anchors[frame][1],512,512);
      }
      poseContext.globalAlpha=1;poseContext.globalCompositeOperation='source-over';
      bodyContext.clearRect(0,0,512,512);
      const renderer=front?forwardGPU:gpu,surface=front?forwardGpuCanvas:gpuCanvas;
      const accelerated=renderer?.draw(seconds,state,weights);
      if(renderer&&!accelerated){renderer.destroy();if(front)forwardGPU=null;else gpu=null;}
      if(accelerated)bodyContext.drawImage(surface,0,0);else puppet.drawCPU(bodyContext,posePlate,seconds,state);
      puppet.face(bodyContext,seconds,state,weights);
      dragon.dataset.renderer=accelerated?'gpu':'canvas';
      context.save();context.globalCompositeOperation='lighter';context.globalAlpha=weight;
      context.translate(256,290);if(facing<0)context.scale(-1,1);
      context.rotate(pose.bank*Math.PI/180);context.drawImage(bodyPlate,-256,-290,512,512);context.restore();
    }
    context.save();context.globalCompositeOperation='source-atop';
    const sheen=context.createLinearGradient(40,0,470,512);
    sheen.addColorStop(0,'rgba(255,176,108,.06)');sheen.addColorStop(.5,'rgba(255,97,57,.02)');sheen.addColorStop(1,'rgba(255,50,35,.07)');
    context.fillStyle=sheen;context.fillRect(0,0,512,512);context.restore();
    const activeFront=view>.5,anchor=activeFront?[322,232]:[441,276];
    const head=puppet.deform(...anchor,seconds,{...pose,frontView:activeFront}),angle=pose.bank*Math.PI/180;
    mouth={x:256+(head[0]-256)*Math.cos(angle)-(head[1]-290)*Math.sin(angle),
      y:290+(head[0]-256)*Math.sin(angle)+(head[1]-290)*Math.cos(angle)};
    dragon.dataset.wingPhase=pose.phase.toFixed(3);dragon.dataset.glide=pose.glide.toFixed(3);
    dragon.dataset.tailFlex=pose.tail.toFixed(3);dragon.dataset.eyeBlink=pose.blink.toFixed(3);
    dragon.dataset.wingFlex=pose.wingTips.map(tip=>tip.toFixed(2)).join(':');
    dragon.dataset.clawCurl=pose.limbs.map(limb=>limb.curl.toFixed(2)).join(':');dragon.dataset.flightView=view>.5?'toward-viewer':'side';
  }
  const clearFire = () => {
    particles=[];emission=0;
    if(flame)flame.clearRect(0,0,fire.width,fire.height);
    dragon.dataset.breathing='false';fire.hidden=true;
  };
  const renderFire = (dt,power,available) => {
    if(!flame)return;
    // The full-body poses are stabilized to this common mouth anchor.
    const origin={x:mouth.x,y:mouth.y+128};
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
    let blend=1,glow=0,targetFacing=1,targetBank=0,firePower=0,approach=0,depth=2.6,profile=1,atmosphere=1,forwardBlend=0;
    const departureFacing=route[0].x+flightSize/2>=homeRect.x+homeRect.width/2?1:-1;
    if(phase==='awaken'){
      targetFacing=departureFacing;
      glow=Math.sin(progress*Math.PI);blend=ease((progress-.3)/.6);
    }else if(phase==='launch'){
      const p=ease(progress),start=route[0];
      targetFacing=departureFacing;
      x=mix(homeRect.x,start.x,p);y=mix(homeRect.y,start.y,p)-Math.sin(progress*Math.PI)*24;
      size=mix(homeRect.width,flightSize,p);glow=(1-progress)*.3;forwardBlend=ease((progress-.75)/.25);
    }else if(phase==='flight'){
      const p=flightPosition(progress);
      x=p.x;y=p.y;size=p.size;targetFacing=p.facing;targetBank=p.bank;
      forwardBlend=1;approach=p.approach;depth=p.depth;profile=p.profile;atmosphere=p.opacity;glow=.10+approach*.12;
      // Three brief breaths during each circuit.
      const flightTime=progress*timing.flight;
      for(const start of [3500,12000,20000]){
        const breath=(flightTime-start)/1500;
        if(breath>0&&breath<1)firePower=Math.sin(breath*Math.PI);
      }
    }else if(phase==='return'){
      const p=ease(progress),start=route[0];
      targetFacing=-departureFacing;
      x=mix(start.x,homeRect.x,p);y=mix(start.y,homeRect.y,p);
      size=mix(flightSize,homeRect.width,p);forwardBlend=1-ease(progress/.3);
    }else if(phase==='restore'){
      glow=Math.sin(progress*Math.PI);blend=1-ease((progress-.2)/.65);
    }
    const smoothing=1-Math.exp(-dt/110);
    facing=mix(facing,targetFacing,smoothing);bank=mix(bank,targetBank,smoothing);
    // Choose the departure heading while still docked, before any translation.
    if(phase==='awaken'||phase==='restore'){facing=targetFacing;bank=0;}
    if(phase==='launch'||phase==='return')facing=targetFacing;
    dragon.style.width=size+'px';
    // Keep the original AC artwork. Banking foreshortens it during turns,
    // without the old zero-width mirror collapse.
    dragon.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+bank+'deg)';
    fire.style.transform=facing<0?'scaleX(-1)':'none';
    dragon.dataset.depth=depth.toFixed(3);dragon.dataset.approach=approach.toFixed(3);
    dragon.dataset.flightSize=size.toFixed(2);
    dragon.dataset.flightDirection=facing>=0?'right':'left';
    dragon.dataset.flightCenterX=(x+size/2).toFixed(2);
    dragon.dataset.flightCenterY=(y+size/2).toFixed(2);
    art.style.setProperty('--dragon-proximity',String(1/(1+Math.max(0,depth))));
    canvas.style.filter='drop-shadow(0 1px 2px rgba(0,0,0,.45)) drop-shadow(0 0 '+(1+approach*2).toFixed(1)+'px rgba(255,88,38,.22))';
    // Promise's camera motion keeps the approaching silhouette level.
    canvas.style.transform='scaleX('+profile.toFixed(4)+')';
    canvas.style.opacity=String(blend*atmosphere);still.style.opacity=String(1-blend);
    art.style.setProperty('--dragon-aura',glow.toFixed(3));
    forwardBlend=forwardReady?forwardBlend*ease((elapsed-forwardLoaded)/700):0;
    const seconds=elapsed/1000;
    if(elapsed-paintClock>=1000/((forwardBlend>.5?forwardGPU:gpu)?40:20) || dt===0) {
      paintBody(seconds,approach,phase==='launch',forwardBlend,1-rig.smooth(5,9,depth));paintClock=elapsed;
    }
    const headFraction=forwardBlend>.5?314/512:.87;
    const freeSpace=targetFacing>0?innerWidth-(x+size*headFraction):x+size*(1-headFraction);
    const available=Math.max(0,(freeSpace-12)*512/Math.max(1,size));
    renderFire(dt,phase==='flight'&&Math.abs(facing)>.8&&available>70?firePower:0,available);
  };
  const draw = time => {
    request=0;
    if(disposed||!playing||document.hidden||!ready){previousTime=null;return;}
    const dt=previousTime===null?0:Math.min(time-previousTime,100);
    previousTime=time;elapsed+=dt;render(dt);request=requestAnimationFrame(draw);
  };
  const sync = () => {
    if(request)cancelAnimationFrame(request);
    request=0;previousTime=null;updateButton();
    if(!disposed&&playing&&ready&&!document.hidden)request=requestAnimationFrame(draw);
  };
  const park = () => {playing=false;elapsed=0;paintClock=-Infinity;dock();sync();};
  document.body.append(toggle);toggle.hidden=false;
  const onToggle=()=>{playing=!playing;sync();};
  toggle.addEventListener('click',onToggle);
  const onPreference=()=>{if(preference.matches)park();else{playing=true;sync();}};
  preference.addEventListener('change',onPreference);
  document.addEventListener('visibilitychange',sync);
  const onResize=()=>{measureRoute();if(ready&&playing)render(0);};
  window.addEventListener('resize',onResize,{passive:true});
  sheet.onload=()=>{
    if(disposed)return;
    if(sheet.naturalWidth!==1536||sheet.naturalHeight!==1024){park();toggle.hidden=true;return;}
    canvas.width=sheet.naturalWidth/3;canvas.height=sheet.naturalHeight/2;
    gpu=puppet.createGPU(gpuCanvas,sheet);
    ready=true;measureRoute();dock();sync();
  };
  sheet.onerror=()=>{park();toggle.hidden=true;};
  forwardSheet.onload=()=>{
    if(disposed||forwardSheet.naturalWidth!==1536||forwardSheet.naturalHeight!==1024)return;
    forwardReady=true;forwardLoaded=elapsed;forwardGPU=puppet.createGPU(forwardGpuCanvas,forwardSheet,true);
  };
  forwardSheet.onerror=()=>{forwardReady=false;};
  forwardSheet.src='/assets/ac-portals/ac-dragon-toward-cycle.webp';
  sheet.src='/assets/ac-portals/ac-dragon-flight-sheet.webp';
  window.addEventListener('pagehide',()=>{
    disposed=true;cancelAnimationFrame(request);request=0;clearFire();gpu?.destroy();forwardGPU?.destroy();gpu=null;forwardGPU=null;
    sheet.onload=sheet.onerror=forwardSheet.onload=forwardSheet.onerror=null;
    document.removeEventListener('visibilitychange',sync);
    window.removeEventListener('resize',onResize);
    preference.removeEventListener('change',onPreference);
    toggle.removeEventListener('click',onToggle);
  },{once:true});
  updateButton();
})();
