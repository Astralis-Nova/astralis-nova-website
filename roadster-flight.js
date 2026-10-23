(function(){
'use strict';
const canvas=document.getElementById('flight'),ctx=canvas.getContext('2d');
if(!ctx)return;
const $=id=>document.getElementById(id);
const els={mode:$('mode'),speed:$('speed'),reserve:$('reserve'),gas:$('gas'),bar:$('gas-bar'),vector:$('vector'),response:$('response'),status:$('status'),auto:$('auto')};
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const keys=new Set(),pointerKeys=new Map(),particles=[],stars=[];
const ship={x:0,y:0,vx:0,vy:0,angle:0,gas:100,auto:!reduced.matches,boost:false,thrust:0};
let w=0,h=0,dpr=1,last=0,t=0,carry=0,hudTick=0,waypoint=null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function resize(){
 const box=canvas.getBoundingClientRect(),ow=w,oh=h;
 w=Math.max(320,box.width);h=Math.max(300,box.height);dpr=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 if(!ow){ship.x=w*.32;ship.y=h*.57}
 else{ship.x=clamp(ship.x*w/ow,70,w-70);ship.y=clamp(ship.y*h/oh,85,h-65)}
 stars.length=0;let seed=57821;
 function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 for(let i=0;i<175;i++)stars.push({x:rnd()*w,y:rnd()*h,r:rnd()*1.5+.35,p:rnd()*6.28});
 draw();
}
function syncAuto(){
 els.mode.textContent=ship.auto?'NOVA AUTOPILOT':'MANUAL CONTROL';
 els.auto.setAttribute('aria-pressed',String(ship.auto));
 els.auto.textContent=ship.auto?'✦ AUTOPILOT ON':'✦ ENGAGE AUTOPILOT';
}
function manual(){if(ship.auto){ship.auto=false;waypoint=null;syncAuto()}}
function hold(name,yes){if(yes){keys.add(name);manual()}else keys.delete(name)}
document.querySelectorAll('[data-hold]').forEach(btn=>{
 const name=btn.dataset.hold;
 btn.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'&&e.button!==0)return;
  e.preventDefault();btn.setPointerCapture(e.pointerId);pointerKeys.set(e.pointerId,name);
  hold(name,true);btn.classList.add('pressed');
 });
 function release(e){
  if(pointerKeys.get(e.pointerId)===name){pointerKeys.delete(e.pointerId);hold(name,false)}
  btn.classList.remove('pressed');
 }
 btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',release);btn.addEventListener('lostpointercapture',release);
});
const keyboard={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right',q:'spinLeft',e:'spinRight',shift:'boost',' ':'boost'};
window.addEventListener('keydown',e=>{
 if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 const k=e.key.toLowerCase(),name=keyboard[k];
 if(name){e.preventDefault();hold(name,true);return}
 if(e.repeat)return;
 if(k==='p'){ship.auto=!ship.auto;waypoint=null;keys.clear();syncAuto()}
 if(k==='r')reset();
});
window.addEventListener('keyup',e=>{const name=keyboard[e.key.toLowerCase()];if(name){e.preventDefault();keys.delete(name)}});
window.addEventListener('blur',()=>{keys.clear();pointerKeys.clear();document.querySelectorAll('.pressed').forEach(btn=>btn.classList.remove('pressed'))});
function reset(){ship.x=w*.32;ship.y=h*.57;ship.vx=ship.vy=ship.angle=0;ship.gas=100;waypoint=null;keys.clear();particles.length=0;carry=0}
$('reset').addEventListener('click',reset);
els.auto.addEventListener('click',()=>{ship.auto=!ship.auto;waypoint=null;keys.clear();syncAuto()});
canvas.addEventListener('pointerdown',e=>{
 const r=canvas.getBoundingClientRect();
 waypoint={x:clamp(e.clientX-r.left,70,w-70),y:clamp(e.clientY-r.top,85,h-65)};
 ship.auto=true;keys.clear();syncAuto();
});
function rr(x,y,width,height,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,width,height,r);else ctx.rect(x,y)}
function step(dt){
 t+=dt;
 let dx=0,dy=0,spin=0;
 if(ship.auto){
  let goal=waypoint;
  if(!goal)goal={x:w*(.5+.33*Math.cos(t*.59)),y:h*(.51+.28*Math.sin(t*.95))};
  if(waypoint&&Math.hypot(goal.x-ship.x,goal.y-ship.y)<34)waypoint=null;
  dx=clamp((goal.x-ship.x)*.018-ship.vx*.026,-1,1);
  dy=clamp((goal.y-ship.y)*.018-ship.vy*.026,-1,1);
 }else{
  dx=Number(keys.has('right'))-Number(keys.has('left'));
  dy=Number(keys.has('down'))-Number(keys.has('up'));
  spin=Number(keys.has('spinRight'))-Number(keys.has('spinLeft'));
 }
 const norm=Math.hypot(dx,dy);if(norm>1){dx/=norm;dy/=norm}
 ship.boost=keys.has('boost')&&!ship.auto;
 const active=norm>.04&&ship.gas>3,accel=ship.boost?780:470;
 ship.thrust=active?norm:0;
 if(active){ship.vx+=dx*accel*dt;ship.vy+=dy*accel*dt;ship.gas=Math.max(0,ship.gas-dt*(ship.auto?1.6:ship.boost?12:4.5))}
 else ship.gas=Math.min(100,ship.gas+dt*11);
 if(ship.auto)ship.gas=Math.min(100,ship.gas+dt*2);
 const drag=Math.exp(-1.5*dt);ship.vx*=drag;ship.vy*=drag;
 const speed=Math.hypot(ship.vx,ship.vy),cap=ship.boost?475:270;
 if(speed>cap){ship.vx*=cap/speed;ship.vy*=cap/speed}
 ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;
 const wallX=Math.min(77,w*.17),wallY=85;
 if(ship.x<wallX||ship.x>w-wallX){ship.x=clamp(ship.x,wallX,w-wallX);ship.vx*=-.35}
 if(ship.y<wallY||ship.y>h-62){ship.y=clamp(ship.y,wallY,h-62);ship.vy*=-.35}
 if(spin)ship.angle+=spin*dt*2.8;
 else if(speed>12){
  const desired=Math.atan2(ship.vy,ship.vx);
  const diff=Math.atan2(Math.sin(desired-ship.angle),Math.cos(desired-ship.angle));
  ship.angle+=diff*Math.min(1,dt*4);
 }
 if(active){
  carry+=dt*(ship.boost?185:115);
  while(carry>=1){carry--;if(particles.length>320)particles.shift();
   const side=(Math.random()-.5)*38,px=-Math.sin(ship.angle),py=Math.cos(ship.angle);
   particles.push({x:ship.x-dx*67+px*side,y:ship.y-dy*67+py*side,
    vx:ship.vx*.17-dx*(85+Math.random()*180)+(Math.random()-.5)*35,
    vy:ship.vy*.17-dy*(85+Math.random()*180)+(Math.random()-.5)*35,
    life:.35+Math.random()*.47,max:.82,r:2+Math.random()*5});
  }
 }
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
  if(p.life<=0)particles.splice(i,1);
 }
 hudTick+=dt;
 if(hudTick>.12){hudTick=0;const v=Math.hypot(ship.vx,ship.vy),g=Math.round(ship.gas);
  els.speed.textContent=Math.round(v)+' px/s';els.reserve.textContent=g+'%';els.gas.textContent=g+'%';
  els.bar.style.width=g+'%';els.vector.textContent=ship.auto?'AUTO':dx||dy?(Math.round(Math.atan2(dy,dx)*180/Math.PI)+'°'):'IDLE';
  els.response.textContent=ship.thrust?'JET FIRING':spin?'ROLLING':'COASTING';
  els.status.textContent=ship.gas<=3?'GAS RECOVERY ACTIVE':ship.thrust?'DIRECTIONAL JETS FIRING':'THRUSTER SYSTEM ONLINE';
 }
}
function backdrop(){
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#020714');bg.addColorStop(.65,'#061b39');bg.addColorStop(1,'#1d2840');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 const nebula=ctx.createRadialGradient(w*.66,h*.33,5,w*.66,h*.33,w*.65);
 nebula.addColorStop(0,'rgba(79,65,155,.29)');nebula.addColorStop(1,'rgba(8,12,28,0)');
 ctx.fillStyle=nebula;ctx.fillRect(0,0,w,h);
 for(const st of stars){const alpha=.36+.52*(.5+.5*Math.sin(t*.75+st.p));
 ctx.fillStyle='rgba(218,243,255,'+alpha+')';ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,7);ctx.fill()}
 const mx=w*.84,my=h*.27,mr=Math.min(w*.088,56);
 const halo=ctx.createRadialGradient(mx,my,4,mx,my,mr*2.3);
 halo.addColorStop(0,'rgba(178,221,255,.21)');halo.addColorStop(1,'rgba(178,221,255,0)');
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mx,my,mr*2.3,0,7);ctx.fill();
 const moon=ctx.createRadialGradient(mx-mr*.35,my-mr*.4,0,mx,my,mr);
 moon.addColorStop(0,'#ddeaf7');moon.addColorStop(.72,'#7d99b5');moon.addColorStop(1,'#263951');
 ctx.fillStyle=moon;ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();
 ctx.fillStyle='rgba(22,47,70,.17)';
 for(const c of [[-.25,.1,.14],[.18,-.17,.11],[.3,.24,.19],[-.14,-.36,.09]]){ctx.beginPath();ctx.arc(mx+c[0]*mr,my+c[1]*mr,mr*c[2],0,7);ctx.fill()}
 ctx.fillStyle='#0b1726';ctx.beginPath();ctx.moveTo(0,h*.9);
 for(let i=0;i<=14;i++)ctx.lineTo(w*i/14,h*(.86+Math.sin(i*2.2)*.045));ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
 const floor=ctx.createLinearGradient(0,h*.75,0,h);floor.addColorStop(0,'rgba(30,86,139,0)');floor.addColorStop(1,'rgba(9,29,48,.4)');ctx.fillStyle=floor;ctx.fillRect(0,h*.7,w,h*.3);
}
function drawParticles(){
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const p of particles){
  ctx.globalAlpha=clamp(p.life/p.max,0,1)*.77;
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.4);
  g.addColorStop(0,'rgba(242,255,255,.97)');g.addColorStop(.24,'rgba(131,230,255,.88)');g.addColorStop(1,'rgba(53,184,249,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*2.4,0,7);ctx.fill();
 }
 ctx.restore();
}
function roadster(){
 ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.angle);
 const sc=clamp(w/650,.64,1.05);ctx.scale(sc,sc);
 ctx.shadowColor='rgba(62,168,244,.35)';ctx.shadowBlur=24;
 // Four dark performance tires, seen from above.
 ctx.fillStyle='#090e1a';ctx.strokeStyle='#61788f';ctx.lineWidth=2;
 for(const x of [-66,52])for(const y of [-38,38]){
  rr(x-20,y-14,40,28,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#2a3341';rr(x-12,y-8,24,16,6);ctx.fill();ctx.fillStyle='#090e1a';
 }
 // Ground glow and forward body.
 const aura=ctx.createRadialGradient(0,0,5,0,0,115);
 aura.addColorStop(0,'rgba(57,197,255,.19)');aura.addColorStop(1,'rgba(57,197,255,0)');
 ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,0,115,65,0,0,7);ctx.fill();
 const paint=ctx.createLinearGradient(-100,-32,95,28);
 paint.addColorStop(0,'#500d22');paint.addColorStop(.28,'#b61f3b');paint.addColorStop(.59,'#f05267');paint.addColorStop(.88,'#b71c37');paint.addColorStop(1,'#681128');
 ctx.fillStyle=paint;ctx.strokeStyle='#f68ba1';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.moveTo(-98,-28);ctx.quadraticCurveTo(-98,-39,-72,-43);
 ctx.lineTo(32,-40);ctx.quadraticCurveTo(80,-39,111,-17);
 ctx.quadraticCurveTo(125,0,111,17);ctx.quadraticCurveTo(80,39,32,40);
 ctx.lineTo(-72,43);ctx.quadraticCurveTo(-98,39,-98,28);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;
 // Glass roof and sculpted hood.
 const glass=ctx.createLinearGradient(-38,-28,50,28);
 glass.addColorStop(0,'#040b16');glass.addColorStop(.5,'#24506e');glass.addColorStop(1,'#030b16');
 ctx.fillStyle=glass;ctx.strokeStyle='#a6dfff88';
 ctx.beginPath();ctx.moveTo(-41,-27);ctx.quadraticCurveTo(-7,-32,37,-22);
 ctx.quadraticCurveTo(48,0,37,22);ctx.quadraticCurveTo(-7,32,-41,27);
 ctx.quadraticCurveTo(-53,0,-41,-27);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(8,-27);ctx.lineTo(8,27);ctx.stroke();
 ctx.strokeStyle='#ffffff70';ctx.lineWidth=1.6;
 ctx.beginPath();ctx.moveTo(42,-31);ctx.quadraticCurveTo(78,-24,102,-12);ctx.moveTo(42,31);ctx.quadraticCurveTo(78,24,102,12);ctx.stroke();
 // Headlights and rear light strip.
 ctx.lineWidth=5;ctx.strokeStyle='#e2fbff';ctx.shadowColor='#a8f5ff';ctx.shadowBlur=13;
 ctx.beginPath();ctx.moveTo(95,-22);ctx.lineTo(106,-16);ctx.moveTo(95,22);ctx.lineTo(106,16);ctx.stroke();
 ctx.strokeStyle='#ff405f';ctx.shadowColor='#ff3455';ctx.shadowBlur=12;ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(-96,-24);ctx.lineTo(-96,24);ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#152739';ctx.fillRect(-106,-20,8,40);
 for(const offset of [-14,-5,5,14]){
  ctx.fillStyle='#91e7ff';ctx.beginPath();ctx.arc(-108,offset,3,0,7);ctx.fill();
 }
 // Active white-blue nozzle bloom.
 if(ship.thrust){
  ctx.globalAlpha=.34+.3*Math.sin(t*38);ctx.strokeStyle='#b6faff';ctx.lineWidth=4;ctx.shadowColor='#7ae6ff';ctx.shadowBlur=18;
  ctx.beginPath();ctx.ellipse(0,0,118,56,0,0,7);ctx.stroke();
 }
 ctx.restore();
}
function draw(){if(!w)return;ctx.clearRect(0,0,w,h);backdrop();drawParticles();roadster();if(waypoint){ctx.strokeStyle='#80e8ffaa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(waypoint.x,waypoint.y,17+3*Math.sin(t*4),0,7);ctx.stroke()}}
function frame(now){
 if(document.hidden){last=now;requestAnimationFrame(frame);return}
 const dt=last?Math.min((now-last)/1000,.04):0;last=now;
 if(!reduced.matches||keys.size||ship.auto){step(dt)}
 draw();requestAnimationFrame(frame);
}
reduced.addEventListener('change',()=>{if(reduced.matches){ship.auto=false;waypoint=null;syncAuto()}});
window.addEventListener('resize',resize,{passive:true});
resize();syncAuto();requestAnimationFrame(frame);
})();