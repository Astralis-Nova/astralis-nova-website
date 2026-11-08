/* Independent decisions; all movement is rendered from complete, unwarped poses. */
(() => {
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,u)=>a+(b-a)*u;
  const strides={deer:30,elephant:34,dog:27,monkey:32,bull:30,peacock:14,mouse:11,serpent:32,turtle:14,hare:38};
  const actions={
    deer:[['walk',4],['graze',2],['look',1.6],['rest',.5]],elephant:[['walk',4],['sniff',2],['look',1.5],['rest',.6]],dog:[['walk',3],['sniff',2.2],['look',1.4],['rest',1],['groom',1]],
    monkey:[['walk',3],['groom',2.1],['look',1.3],['rest',1]],bull:[['walk',3],['graze',2.5],['look',1.4],['rest',.8]],peacock:[['walk',3.5],['display',1.6],['preen',2],['look',1.2],['rest',.5]],
    mouse:[['walk',4],['nibble',2.6],['sniff',2],['look',1],['rest',.5]],serpent:[['walk',4],['look',2],['rest',1.2]],turtle:[['walk',3],['look',1.4],['rest',1.3]],hare:[['walk',3.8],['graze',2],['look',1.3],['rest',.7]]
  };
  function rng(seed){let n=seed>>>0;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function createMind(o){
    const random=rng(o.seed),range=(a,b)=>mix(a,b,random());let queue=[],recent=[],x=o.x,y=o.y,dir=o.dir,energy=.8,serial=0;
    let blinkStart=-1,blinkAt=range(1,4),gait=range(0,1),lastTime=0,lastX=x,lastY=y;
    const phase=range(0,50),baseY=o.y;
    function decide(){
      const list=(o.tree?[['climb',3],['groom',1.6],['look',1.2],['rest',.9]]:actions[o.kind]).filter(([name])=>!recent.includes(name));
      let roll=random()*list.reduce((n,[name,w])=>n+w*(name==='rest'?1.5-energy:1),0),action=list.at(-1)[0];
      for(const [name,w] of list){roll-=w*(name==='rest'?1.5-energy:1);if(roll<=0){action=name;break;}}
      recent=[...recent.slice(-1),action];
      if(action==='walk'){
        let target=range(o.min,o.max);if(Math.abs(target-x)<.035)target=clamp(x+(x>(o.min+o.max)/2?-1:1)*range(.045,.09),o.min,o.max);
        const facing=target>=x?1:-1;
        if(facing!==dir)queue.push({action:'turn',duration:range(1.1,1.7),x,y,dir:dir,nextDir:facing});
        const duration=clamp(Math.abs(target-x)*1672/(o.speed*range(.85,1.15)),2.5,12);
        queue.push({action,duration,x:target,y:clamp(baseY+range(-.009,.009),baseY-.012,baseY+.012),dir:facing});
      }else if(action==='climb'){
        queue.push({action,duration:range(3.2,6),x:range(.12,.145),y:y<.405?range(.43,.47):range(.33,.38),dir:1});
      }else queue.push({action,duration:range(action==='rest'?3:1.8,action==='rest'?6:4.5),x,y,dir});
    }
    function begin(start){if(!queue.length)decide();const n=queue.shift();return{...n,fromX:x,fromY:y,start,end:start+n.duration,id:serial++};}
    queue.push({action:o.tree?'climb':o.kind==='serpent'?'walk':o.kind==='peacock'?'display':'walk',duration:range(3.5,6),x:o.tree?.137:clamp(x+o.dir*.045,o.min,o.max),y:o.tree?.36:y,dir});
    let state=begin(0);
    return {sample(t){
      while(t>=state.end){x=state.x;y=state.y;dir=state.nextDir??state.dir;energy=clamp(energy+state.duration*(state.action==='rest'?.045:-.012),.2,1);state=begin(state.end);}
      const u=clamp((t-state.start)/state.duration),edge=ease(Math.min((t-state.start)/.4,(state.end-t)/.4));
      const px=mix(state.fromX,state.x,ease(u)),py=mix(state.fromY,state.y,ease(u));
      const travelled=Math.hypot((px-lastX)*1672,(py-lastY)*941);gait+=travelled/(strides[o.kind]||28);lastX=px;lastY=py;
      const dt=Math.max(.001,t-lastTime),speed=clamp(travelled/dt/o.speed/1.45);lastTime=t;
      if(t>=blinkAt){blinkStart=t;blinkAt=t+range(2.3,6.8);}const age=t-blinkStart,blink=age>=0&&age<.19?Math.sin(age/.19*Math.PI)**2:0;
      return{action:state.action,id:state.id,x:px,y:py,dir:state.action==='turn'?(u<.52?state.dir:state.nextDir):state.dir,turn:u,progress:u,weight:edge,speed,gait,time:t+phase,blink,tree:!!o.tree,descending:state.y>state.fromY};
    }};
  }
  function frameAt(kind,m,count){
    const old=count===8,step=((m.gait*1.45)%1+1)%1;
    if(m.tree)return m.action==='climb'?3:2;
    if(m.action==='walk'){
      if(kind==='hare')return Math.sin(m.gait*Math.PI*2)>.30?0:1;
      return Math.min(old?3:1,Math.floor(step*(old?4:2)));
    }
    if(m.action==='turn'){
      if(m.turn<.25||m.turn>.75)return 0;
      if(old)return 6;
      return ['bull','mouse','turtle'].includes(kind)?3:0;
    }
    if(old)return ['graze','sniff'].includes(m.action)?4:['rest','groom'].includes(m.action)?5:6;
    if(kind==='peacock')return m.action==='display'?2:m.action==='rest'?3:0;
    if(kind==='serpent')return m.action==='look'?2:3;
    if(kind==='hare')return m.action==='graze'?3:2;
    return m.action==='look'&&['bull','mouse','turtle'].includes(kind)?3:2;
  }
  window.EmeraldAnimalLife={createMind,frameAt,kinds:Object.keys(strides)};
})();
