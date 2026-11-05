/* Species-specific choices share a clock but never a fixed patrol sequence. */
(function(root){
'use strict';
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,u)=>a+(b-a)*u;
function rng(seed){
 let n=(seed??Math.floor(Math.random()*4294967296))>>>0;
 return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
}
const profiles={
 roadrunner:[['walk',2],['run',1.4],['preen',1.3],['look',1.4],['hop',.8],['crouch',.7],['rest',.4],['stretch',.7]],
 coyote:[['stalk',2],['walk',1],['run',.8],['sniff',1.2],['sit',1.2],['lie',.8],['scratch',.7],['stretch',.7],['look',1]],
 taz:[['wander',1.7],['spin',1.6],['sniff',1.1],['crouch',.9],['rest',.8],['look',.8],['stretch',.6]],
 squirrel:[['walk',2],['run',1],['sniff',1.4],['crouch',1],['sit',1.1],['lie',.5],['groom',1.2],['stretch',.6]],
 rabbit:[['hop',2.2],['sniff',1.7],['crouch',1.1],['sit',.9],['lie',.7],['groom',1.2],['stretch',.6]],
 rat:[['hop',2.2],['sniff',1.1],['nibble',1.6],['crouch',.8],['sit',1],['rest',.7],['groom',.9]]
};
function create(options={}){
 const random=rng(options.seed),range=(a,b)=>mix(a,b,random());
 const bounds=options.bounds||[.12,.88],level=options.level??.76;
 let x=options.x??range(...bounds),y=level,facing=random()<.5?1:-1,queue=[],recent=[],id=0;
 let blinkStart=-1,nextBlink=range(.8,4),energy=range(.55,.95);
 const phase=range(0,80);
 function choose(){
  const list=(profiles[options.kind]||profiles.squirrel).filter(([a])=>!recent.includes(a));
  let roll=random()*list.reduce((sum,[a,w])=>sum+w*(a==='rest'||a==='lie'?1.3-energy:1),0),action=list.at(-1)[0];
  for(const [a,w]of list){roll-=w*(a==='rest'||a==='lie'?1.3-energy:1);if(roll<=0){action=a;break;}}
  recent=[...recent.slice(-1),action];
  const moving=['walk','run','hop','stalk','wander','spin'].includes(action);
  let target=moving?range(...bounds):x;
  if(moving&&Math.abs(target-x)<.045)target=clamp(x+(x>(bounds[0]+bounds[1])/2?-1:1)*range(.06,.2),...bounds);
  const dir=target>=x?1:-1;
  if(moving&&dir!==facing){
   const from=facing===1?0:Math.PI;
   queue.push({action:'turn',duration:range(.75,1.45),fromYaw:from,toYaw:from+(random()<.5?1:-1)*Math.PI,facing:dir,x,y});
  }
  const speed=action==='run'||action==='spin'?.19:action==='stalk'?.052:.09;
  const duration=moving?clamp(Math.abs(target-x)/speed,1.1,6.8):range(action==='lie'?3:1.3,action==='lie'?6:4.2);
  queue.push({action,duration,x:target,y:level+(moving?range(-.012,.012):y-level),facing:moving?dir:facing});
 }
 function begin(start){
  if(!queue.length)choose();
  const s=queue.shift();return{...s,start,end:start+s.duration,fromX:x,fromY:y,id:id++};
 }
 let state={action:'look',duration:range(.5,1.7),start:0,end:0,x,y,fromX:x,fromY:y,facing,id:id++};state.end=state.duration;
 return{
  sample(t){
   while(t>=state.end){x=state.x;y=state.y;facing=state.facing;energy=clamp(energy+state.duration*(['rest','lie','sit'].includes(state.action)?.03:-.012),.15,1);state=begin(state.end);}
   const u=clamp((t-state.start)/state.duration),weight=ease(Math.min((t-state.start)/.35,(state.end-t)/.35));
   const moving=['walk','run','hop','stalk','wander','spin'].includes(state.action);
   const speed=moving?Math.sin(Math.PI*u)*(state.action==='run'||state.action==='spin'?1:state.action==='stalk'?.35:.65):0;
   if(t>=nextBlink){blinkStart=t;nextBlink=t+range(2.3,6.7);}
   const b=t-blinkStart,blink=b>=0&&b<.18?Math.sin(b/.18*Math.PI)**2:0;
   const yaw=state.action==='turn'?mix(state.fromYaw,state.toYaw,ease(u)):state.facing===1?0:Math.PI;
   return{action:state.action,id:state.id,time:t+phase,x:mix(state.fromX,state.x,ease(u)),y:mix(state.fromY,state.y,ease(u)),facing:Math.cos(yaw)>=0?1:-1,yaw,speed,weight,blink,
    crouch:state.action==='crouch'?weight:0,sit:['sit','nibble'].includes(state.action)?weight:0,
    lie:['lie','rest'].includes(state.action)?weight:0,preen:['preen','groom','scratch'].includes(state.action)?weight:0,
    stretch:state.action==='stretch'?weight:0,spin:state.action==='spin'?weight:0,
    hop:state.action==='hop'?Math.abs(Math.sin((t+phase)*TAU*2.6))*speed:0,
    look:Math.sin((t+phase)*1.3)*weight,tail:Math.sin((t+phase)*3.2)*.08};
  }
 };
}
function flight(options={}){
 const random=rng(options.seed),range=(a,b)=>mix(a,b,random()),raven=options.kind==='raven';
 let blinkStart=-1,nextBlink=range(1,4);
 let previous=0,travel=0,wingTime=0,start=0,end=range(2,5),lastMode='',current={dx:0,dy:0,rate:1,wing:1,glide:0,bank:0},target=current,mode='flap';
 function choose(at){
  current=target;start=at;
  const choices=(raven?['flap','glide','circle','look']:['flap','flap','glide','circle','look']).filter(x=>x!==lastMode);
  mode=choices[Math.floor(random()*choices.length)];lastMode=mode;
  end=at+range(mode==='glide'?.6:2,mode==='glide'?(raven?2.6:1.2):6.5);
  target={dx:range(-.055,.055),dy:range(-.03,.03),rate:range(.8,1.2),wing:range(.87,1.12),glide:mode==='glide'?range(.65,.98):mode==='circle'?.22:0,bank:range(-1.8,1.8)};
 }
 choose(0);
 return{sample(seconds){
  while(seconds>=end)choose(end);
  const u=ease(clamp((seconds-start)/Math.min(1.2,end-start))),p={};
  for(const k of Object.keys(target))p[k]=mix(current[k],target[k],u);
  const dt=clamp(seconds-previous,0,.2);previous=seconds;travel+=dt*p.rate;wingTime+=dt*p.wing;
  if(seconds>=nextBlink){blinkStart=seconds;nextBlink=seconds+range(2.5,7);}
  const age=seconds-blinkStart,blink=age>=0&&age<.18?Math.sin(age/.18*Math.PI)**2:0;
  return{...p,travel,wingTime,blink,action:mode};
 }};
}
function gestureClock(period=18000,seed){
 const random=rng(seed),range=(a,b)=>mix(a,b,random());
 let start=0,rate=range(.86,1.14),active=period/rate,rest=range(2500,12000),lastInput=0;
 return{
  sample(ms){
   if(ms<lastInput)start=ms;lastInput=ms;
   while(ms>=start+active+rest){start+=active+rest;rate=range(.86,1.14);active=period/rate;rest=range(2500,14000);}
   const local=ms-start,resting=local>=active;
   return{clock:resting?0:local*rate,resting};
  },
  reset(ms,source=0){start=ms-source/rate;active=period/rate;rest=range(2500,14000);lastInput=ms;}
 };
}
root.NovaCreatureLife={create,flight,gestureClock,rng,range:(a,b)=>mix(a,b,Math.random())};
})(typeof window==='undefined'?globalThis:window);
