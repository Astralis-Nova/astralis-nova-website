import{COMBAT_STATS,PIECE_NAMES}from'./combat-core.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export class AstralisCombatScene{
  constructor({canvas,layer,onHealth,onEnd}){
    this.canvas=canvas;this.context=canvas.getContext('2d');this.layer=layer;this.onHealth=onHealth;this.onEnd=onEnd;
    this.keys=new Set();this.touch=new Set();this.projectiles=[];this.particles=[];this.running=false;this.lastTime=0;this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(canvas.parentElement);this.bindInput();
  }

  start(intent,humanSide){
    this.intent=intent;this.humanSide=humanSide;this.projectiles=[];this.particles=[];this.running=false;this.lastTime=performance.now();this.resize();
    const attackerStats=COMBAT_STATS[intent.attacker.type],defenderStats=COMBAT_STATS[intent.defender.type];
    this.units={
      attacker:this.makeUnit('attacker',intent.attacker,attackerStats,.2,.5),
      defender:this.makeUnit('defender',intent.defender,defenderStats,.8,.5)
    };
    this.updateHealth();this.render();
    window.setTimeout(()=>{this.running=true;this.lastTime=performance.now();requestAnimationFrame(time=>this.frame(time))},3100);
  }

  stop(){this.running=false;this.keys.clear();this.touch.clear()}
  makeUnit(side,piece,stats,x,y){return{side,piece,stats:{...stats},x:this.width*x,y:this.height*y,vx:0,vy:0,radius:22,health:stats.health,maxHealth:stats.health,lastShot:-Infinity,angle:side==='attacker'?0:Math.PI,flash:0,aiOrbit:Math.random()>.5?1:-1}}
  resize(){const rect=this.canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);this.width=Math.max(320,rect.width);this.height=Math.max(220,rect.height);this.canvas.width=Math.round(this.width*ratio);this.canvas.height=Math.round(this.height*ratio);this.context.setTransform(ratio,0,0,ratio,0,0)}

  bindInput(){
    const accepted=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter']);
    window.addEventListener('keydown',event=>{if(!this.layer.hidden&&accepted.has(event.code)){event.preventDefault();this.keys.add(event.code)}});
    window.addEventListener('keyup',event=>this.keys.delete(event.code));
    for(const button of this.layer.querySelectorAll('[data-control]')){
      const control=button.dataset.control;
      const down=event=>{event.preventDefault();button.setPointerCapture?.(event.pointerId);this.touch.add(control)};
      const up=event=>{event.preventDefault();this.touch.delete(control)};
      button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up);
    }
  }

  frame(time){if(!this.running)return;const dt=Math.min(.033,(time-this.lastTime)/1000);this.lastTime=time;this.update(dt,time);this.render();if(this.running)requestAnimationFrame(next=>this.frame(next))}
  update(dt,time){
    const human=this.units[this.humanSide],ai=this.units[this.humanSide==='attacker'?'defender':'attacker'];
    this.updateHuman(human,dt,time);this.updateAi(ai,human,dt,time);this.moveUnit(human,dt);this.moveUnit(ai,dt);this.separateUnits(human,ai);this.updateProjectiles(dt);this.updateParticles(dt);
    human.flash=Math.max(0,human.flash-dt);ai.flash=Math.max(0,ai.flash-dt);
    if(human.health<=0||ai.health<=0)this.finish(human.health>0?human.side:ai.side);
  }

  updateHuman(unit,dt,time){
    let x=0,y=0;if(this.keys.has('KeyA')||this.keys.has('ArrowLeft')||this.touch.has('left'))x--;if(this.keys.has('KeyD')||this.keys.has('ArrowRight')||this.touch.has('right'))x++;if(this.keys.has('KeyW')||this.keys.has('ArrowUp')||this.touch.has('up'))y--;if(this.keys.has('KeyS')||this.keys.has('ArrowDown')||this.touch.has('down'))y++;
    const length=Math.hypot(x,y)||1;unit.vx=x/length*unit.stats.speed;unit.vy=y/length*unit.stats.speed;
    const target=this.units[unit.side==='attacker'?'defender':'attacker'];unit.angle=Math.atan2(target.y-unit.y,target.x-unit.x);
    if(this.keys.has('Space')||this.keys.has('Enter')||this.touch.has('fire'))this.fire(unit,time);
  }

  updateAi(unit,target,dt,time){
    const dx=target.x-unit.x,dy=target.y-unit.y,distance=Math.hypot(dx,dy)||1;unit.angle=Math.atan2(dy,dx);
    const desired=230;if(distance>desired+35){unit.vx=dx/distance*unit.stats.speed*.74;unit.vy=dy/distance*unit.stats.speed*.74}else if(distance<desired-45){unit.vx=-dx/distance*unit.stats.speed*.58;unit.vy=-dy/distance*unit.stats.speed*.58}else{unit.vx=-dy/distance*unit.stats.speed*.46*unit.aiOrbit;unit.vy=dx/distance*unit.stats.speed*.46*unit.aiOrbit}
    if(distance<470&&Math.abs(Math.sin(time/830))>.18)this.fire(unit,time+160);
  }

  moveUnit(unit,dt){unit.x=clamp(unit.x+unit.vx*dt,38,this.width-38);unit.y=clamp(unit.y+unit.vy*dt,38,this.height-38)}
  separateUnits(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.radius+b.radius+10;if(d>=min)return;const push=(min-d)/2;a.x-=dx/d*push;a.y-=dy/d*push;b.x+=dx/d*push;b.y+=dy/d*push}
  fire(unit,time){if(time-unit.lastShot<unit.stats.cooldown)return;unit.lastShot=time;const speed=unit.stats.projectileSpeed;this.projectiles.push({owner:unit.side,x:unit.x+Math.cos(unit.angle)*28,y:unit.y+Math.sin(unit.angle)*28,vx:Math.cos(unit.angle)*speed,vy:Math.sin(unit.angle)*speed,radius:5,damage:unit.stats.damage,life:1.75});for(let i=0;i<5;i++)this.spark(unit.x,unit.y,unit.side)}
  updateProjectiles(dt){
    for(const shot of this.projectiles){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;const target=this.units[shot.owner==='attacker'?'defender':'attacker'];if(Math.hypot(shot.x-target.x,shot.y-target.y)<shot.radius+target.radius){target.health=Math.max(0,target.health-shot.damage);target.flash=.13;shot.life=0;for(let i=0;i<16;i++)this.spark(shot.x,shot.y,target.side);this.updateHealth()}}
    this.projectiles=this.projectiles.filter(shot=>shot.life>0&&shot.x>-20&&shot.y>-20&&shot.x<this.width+20&&shot.y<this.height+20);
  }
  spark(x,y,side){const angle=Math.random()*Math.PI*2,speed=45+Math.random()*160;this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.25+Math.random()*.45,max:.7,side})}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.96;p.vy*=.96}this.particles=this.particles.filter(p=>p.life>0)}
  updateHealth(){this.onHealth?.({attacker:this.units.attacker.health/this.units.attacker.maxHealth,defender:this.units.defender.health/this.units.defender.maxHealth})}
  finish(winner){if(!this.running)return;this.running=false;for(let i=0;i<80;i++)this.spark(this.units[winner].x,this.units[winner].y,winner);this.render();window.setTimeout(()=>this.onEnd?.(winner),1050)}

  render(){
    const c=this.context,w=this.width,h=this.height;c.clearRect(0,0,w,h);
    const nebula=c.createRadialGradient(w*.48,h*.42,20,w*.48,h*.42,w*.7);nebula.addColorStop(0,'rgba(72,54,170,.35)');nebula.addColorStop(.42,'rgba(8,61,108,.24)');nebula.addColorStop(1,'rgba(1,4,16,.96)');c.fillStyle=nebula;c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(96,220,255,.11)';c.lineWidth=1;const grid=48;for(let x=(w%grid)/2;x<w;x+=grid){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=(h%grid)/2;y<h;y+=grid){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
    c.fillStyle='rgba(220,247,255,.7)';for(let i=0;i<44;i++){const x=(i*83.71)%w,y=(i*i*19.37)%h;c.fillRect(x,y,i%7===0?1.7:1,i%7===0?1.7:1)}
    for(const p of this.particles){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.side==='attacker'?'#6df1ff':'#d182ff';c.fillRect(p.x-2,p.y-2,4,4)}c.globalAlpha=1;
    for(const shot of this.projectiles){c.fillStyle=shot.owner==='attacker'?'#9bf6ff':'#e4a0ff';c.shadowColor=c.fillStyle;c.shadowBlur=16;c.beginPath();c.arc(shot.x,shot.y,shot.radius,0,Math.PI*2);c.fill()}c.shadowBlur=0;
    this.drawUnit(this.units.attacker);this.drawUnit(this.units.defender);
  }

  drawUnit(unit){const c=this.context,color=unit.side==='attacker'?'#62e8ff':'#c46dff',deep=unit.side==='attacker'?'#0b5f96':'#5b188f';c.save();c.translate(unit.x,unit.y);c.rotate(unit.angle);c.shadowColor=color;c.shadowBlur=unit.flash?34:18;c.fillStyle=unit.flash?'#fff':deep;c.strokeStyle='#efffff';c.lineWidth=2;c.beginPath();c.moveTo(29,0);c.lineTo(-17,-18);c.lineTo(-8,0);c.lineTo(-17,18);c.closePath();c.fill();c.stroke();c.fillStyle=color;c.beginPath();c.arc(-4,0,7,0,Math.PI*2);c.fill();c.strokeStyle=color;c.globalAlpha=.55;c.beginPath();c.moveTo(-16,-10);c.lineTo(-34,-18);c.moveTo(-16,10);c.lineTo(-34,18);c.stroke();c.restore();c.globalAlpha=1;c.font='800 11px system-ui';c.textAlign='center';c.fillStyle='#eaf9ff';c.fillText(PIECE_NAMES[unit.piece.type].toUpperCase(),unit.x,unit.y+39)}
}
