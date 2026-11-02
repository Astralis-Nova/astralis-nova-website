(() => {
 'use strict';
 // Complete, locally hosted illustrated Roadster cutout. Flight effects are simulated.
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const craft=document.createElement('div');
 craft.id='astralis-real-roadster';
 craft.setAttribute('aria-label','Floating white thruster Roadster');
 craft.innerHTML=`<a class="roadster-real-link" href="https://www.youtube.com/watch?v=r5vsHHPVhJg" target="_blank" rel="noopener noreferrer" aria-label="White Roadster illustration with simulated thruster flight. Watch video.">
 <div class="roadster-real-core" data-thrust="forward">
  <div class="roadster-solid-model">
   <span class="roadster-rear-jet jet-upper" aria-hidden="true"></span>
   <span class="roadster-rear-jet jet-lower" aria-hidden="true"></span>
   <span class="roadster-lift-jet lift-front" aria-hidden="true"></span>
   <span class="roadster-lift-jet lift-rear" aria-hidden="true"></span>
   <img class="roadster-complete-underbody" src="/assets/roadster-white-underbody-v2.webp" alt="" aria-hidden="true" decoding="async">
   <img class="roadster-complete-car" src="/assets/roadster-white-complete-v2.webp" alt="Complete white Roadster with black glass roof, full body and performance wheels" decoding="async">
  </div>
  <span class="roadster-real-label">ROADSTER ILLUSTRATION · SIMULATED FLIGHT</span>
 </div></a>`;
 document.body.appendChild(craft);
 const body=craft.querySelector('.roadster-real-core');
 const model=craft.querySelector('.roadster-solid-model');

 // Flight-control upgrade: inertia continues between cold-gas thruster bursts.
 // A transparent particle layer stays behind the actual Tesla photo cutout.
 const trail=document.createElement('canvas');
 trail.id='astralis-roadster-flight-trail';
 trail.setAttribute('aria-hidden','true');
 document.body.appendChild(trail);
 const ctx=trail.getContext('2d',{alpha:true});
 const clamp=(value,lo,hi)=>Math.min(hi,Math.max(lo,value));
 let width=0,height=0,elapsed=0,previousTime=0,frame=0;
 let posX=0,posY=0,vx=0,vy=0,facing=1,ready=false;
 let particles=[],emission=0,canvasWidth=0,canvasHeight=0;
 const isSmall=()=>window.innerWidth<700;
 function range(){
  const header=document.querySelector('.topbar');
  const headerBottom=header?header.getBoundingClientRect().bottom:75;
  const left=8,right=Math.max(left,window.innerWidth-width-8);
  const top=Math.min(Math.max(headerBottom+12,82),Math.max(8,window.innerHeight-height-14));
  const bottom=Math.max(top,window.innerHeight-height-14);
  return {left,right,top,bottom};
 }
 function resizeTrail(){
  if(!ctx)return;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  canvasWidth=window.innerWidth;canvasHeight=window.innerHeight;
  trail.width=Math.round(canvasWidth*dpr);
  trail.height=Math.round(canvasHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  particles=[];
 }
 function measure(){
  width=craft.offsetWidth;height=craft.offsetHeight;
  craft.style.setProperty('--roadster-half-thickness',(width*.105).toFixed(2)+'px');
  const limits=range();
  if(!ready){
   posX=clamp(window.innerWidth*.24,limits.left,limits.right);
   posY=clamp(limits.top+(limits.bottom-limits.top)*.54,limits.top,limits.bottom);
   vx=clamp(window.innerWidth*.058,29,88);
   vy=-clamp(window.innerHeight*.018,6,19);
   ready=true;
  }else{
   posX=clamp(posX,limits.left,limits.right);
   posY=clamp(posY,limits.top,limits.bottom);
   vx=clamp(vx,-Math.max(34,window.innerWidth*.095),Math.max(34,window.innerWidth*.095));
  }
  resizeTrail();
 }
 function drawParticles(dt,engine,doingFlip){
  if(!ctx)return;
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];
   p.age+=dt;
   if(p.age>=p.life){particles.splice(i,1);continue;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   const fade=Math.pow(1-p.age/p.life,1.6);
   ctx.beginPath();
   ctx.strokeStyle='rgba(139,217,255,'+(fade*(p.flare?.54:.30)).toFixed(3)+')';
   ctx.lineWidth=p.size*fade;
   ctx.lineCap='round';
   ctx.moveTo(p.x,p.y);
   ctx.lineTo(p.x-p.vx*.072,p.y-p.vy*.072);
   ctx.stroke();
  }
  // The complete sprite faces left; its rear is on the right, regardless
  // of whether its nose is pointing toward the left or right edge.
  emission+=dt*(engine>.7?26:7)*(isSmall()?.70:1);
  const limit=isSmall()?42:68;
  while(emission>=1){
   emission--;
   if(particles.length>=limit)continue;
   const fromX=posX+(facing>0?.13:.87)*width;
   const fromY=posY+height*(.43+Math.random()*.20);
   particles.push({
    x:fromX,y:fromY,
    vx:-facing*(52+85*Math.random())-vx*.12,
    vy:(Math.random()-.5)*(doingFlip?115:42)-vy*.1,
    age:0,life:.52+Math.random()*.60,
    size:1+Math.random()*(doingFlip?3.1:2.2),
    flare:engine>.7
   });
  }
 }
 function fly(dt){
  elapsed+=dt;
  const limits=range();
  const speedLimit=clamp(window.innerWidth*.095,34,136);
  const phase=(elapsed+9)%22;
  const rolling=phase>=.20&&phase<=2.40;
  const boostCycle=elapsed%17;
  // Thruster ignition boosts velocity. Coasting retains momentum in vacuum.
  const engine=(boostCycle<2.6||(boostCycle>8.6&&boostCycle<10.3)||rolling)?1:.12;
  if(dt>0){
   vx+=(vx<0?-1:1)*speedLimit*.28*engine*dt;
   vx=clamp(vx,-speedLimit,speedLimit);
   // Smaller attitude-control jets steer broad arcs, not a looping sine orbit.
   const targetVy=speedLimit*(.27*Math.sin(elapsed*.31)+.13*Math.cos(elapsed*.17));
   vy+=(targetVy-vy)*Math.min(1,dt*.42);
   posX+=vx*dt;
   posY+=vy*dt;
   if(posX>=limits.right){posX=limits.right;vx=-Math.max(29,Math.abs(vx)*.89)}
   if(posX<=limits.left){posX=limits.left;vx=Math.max(29,Math.abs(vx)*.89)}
   if(posY>=limits.bottom){posY=limits.bottom;vy=-Math.max(13,Math.abs(vy))}
   if(posY<=limits.top){posY=limits.top;vy=Math.max(13,Math.abs(vy))}
  }
  facing=vx<0?-1:1;
  // Matched complete top and underside sprites provide a closed-body roll illusion.
  const progress=clamp((phase-.20)/2.20,0,1);
  const eased=(1-Math.cos(Math.PI*progress))*.5;
  const flip=rolling?360*eased:0;
  model.dataset.roll=rolling?'active':'idle';
  const rollCos=Math.cos(flip*Math.PI/180);
  const underside=clamp((.16-rollCos)/.32,0,1);
  craft.style.setProperty('--roadster-under-opacity',underside.toFixed(3));
  craft.style.setProperty('--roadster-top-opacity',(1-underside).toFixed(3));
  craft.style.setProperty('--roadster-roll-height',(.32+.68*Math.abs(rollCos)).toFixed(3));
  const bank=clamp(Math.atan2(vy,Math.abs(vx))*180/Math.PI,-23,23)
    +2.2*Math.sin(elapsed*.80);
  const nose=5*Math.sin(elapsed*.41)+(rolling?12*Math.sin(Math.PI*progress):0);
  const depth=1+.055*Math.sin(elapsed*.23);
  craft.style.setProperty('--roadster-real-x',posX.toFixed(1)+'px');
  craft.style.setProperty('--roadster-real-y',posY.toFixed(1)+'px');
  craft.style.setProperty('--roadster-facing',String(-facing));
  craft.style.setProperty('--roadster-bank',bank.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-flip',flip.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-nose',nose.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-depth',depth.toFixed(3));
  craft.style.setProperty('--roadster-boost',String(engine));
  body.dataset.thrust=rolling?'lift':(engine>.7?'forward':'coast');
  drawParticles(dt,engine,rolling);
 }
 function animate(now){
  frame=0;
  if(document.hidden||reduced.matches){previousTime=0;return;}
  const dt=previousTime?Math.min((now-previousTime)/1000,.05):0;
  previousTime=now;
  // Hold position under a pointer so the real-photo video link stays clickable.
  const held=craft.matches(':hover,:focus-within');
  if(held){drawParticles(dt,0,false);}
  else{fly(dt);}
  frame=requestAnimationFrame(animate);
 }
 function sync(){
  cancelAnimationFrame(frame);
  frame=0;previousTime=0;
  measure();
  if(document.hidden)return;
  if(reduced.matches){
   const limits=range();
   craft.style.setProperty('--roadster-real-x',limits.right+'px');
   craft.style.setProperty('--roadster-real-y',limits.top+'px');
   craft.style.setProperty('--roadster-facing','1');
   craft.style.setProperty('--roadster-bank','0deg');
   craft.style.setProperty('--roadster-flip','0deg');
   model.dataset.roll='idle';
   craft.style.setProperty('--roadster-under-opacity','0');
   craft.style.setProperty('--roadster-top-opacity','1');
   craft.style.setProperty('--roadster-roll-height','1');
   craft.style.setProperty('--roadster-nose','0deg');
   craft.style.setProperty('--roadster-depth','1');
   craft.style.setProperty('--roadster-boost','0');
   body.dataset.thrust='coast';
   if(ctx)ctx.clearRect(0,0,canvasWidth,canvasHeight);
  }else{
   fly(0);
   frame=requestAnimationFrame(animate);
  }
 }
 window.addEventListener('resize',sync,{passive:true});
 document.addEventListener('visibilitychange',sync);
 if(reduced.addEventListener)reduced.addEventListener('change',sync);
 sync();
})();

