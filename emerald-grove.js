(() => {
  'use strict';
  function create(){
    const canvas=document.getElementById('groveLife'),ctx=canvas?.getContext('2d');
    if(!ctx)return null;
    const scene=document.getElementById('groveScene');
    const status=document.getElementById('groveStatus');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let paused=reduced.matches,visible=true,ready=false,frame=null,last=0,time=0,wind=.65;
    let width=1,height=1,dpr=1,seed=93617,background=null;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const actors=[
      {kind:'deer',x:.40,y:.80,min:.34,max:.55,size:110,speed:17,dir:1,state:'walk',age:0,duration:6,phase:.2,poses:[]},
      {kind:'elephant',x:.71,y:.75,min:.56,max:.85,size:174,speed:11,dir:-1,state:'walk',age:0,duration:8,phase:1.4,poses:[]},
      {kind:'dog',x:.51,y:.91,min:.42,max:.78,size:67,speed:23,dir:1,state:'graze',age:0,duration:3,phase:3.1,poses:[]}
    ];
    const leaves=Array.from({length:9},()=>({x:random(),y:random(),phase:random()*6.28,size:2+random()*3}));
    const load=url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not load '+url));image.src=url;});
    function prepare(image){
      const frames=[];
      for(let i=0;i<8;i++){
        const sx=Math.floor(i%4*image.width/4),sy=Math.floor(Math.floor(i/4)*image.height/2);
        const sw=Math.floor((i%4+1)*image.width/4)-sx,sh=Math.floor((Math.floor(i/4)+1)*image.height/2)-sy;
        const c=document.createElement('canvas');c.width=sw;c.height=sh;const cc=c.getContext('2d');
        cc.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
        const pixels=cc.getImageData(0,0,sw,sh).data;let l=sw,t=sh,r=0,b=0;
        for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>210){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
        if(r<=l||b<=t)throw Error('Empty animal pose');
        // Cropping atlas cells preserves the generated anatomy and transparent edges.
        const part=document.createElement('canvas');part.width=r-l+3;part.height=b-t+3;
        part.getContext('2d').drawImage(c,Math.max(0,l-1),Math.max(0,t-1),part.width,part.height,0,0,part.width,part.height);
        frames.push(part);
      }
      return frames;
    }
    function resize(){
      const rect=scene.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
      dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);draw();
    }
    function pose(actor){
      if(actor.state==='walk')return Math.floor((time*(actor.kind==='elephant'?2.8:actor.kind==='dog'?5.2:4.4)+actor.phase)%4);
      if(actor.state==='graze')return 4;
      if(actor.state==='rest')return 5;
      if(actor.state==='turn')return actor.turnPose;
      return 6;
    }
    function choose(actor,state){
      actor.previous=pose(actor);actor.transition=0;actor.state=state;actor.age=0;
      actor.duration=state==='walk'?4+random()*7:state==='rest'?5+random()*6:state==='turn'?.85:3+random()*4;
      if(state==='turn')actor.turnPose=random()>.45?6:7;
    }
    function update(dt){
      time+=dt;
      for(const actor of actors){
        actor.age+=dt;if(actor.transition!==undefined)actor.transition+=dt;
        if(actor.state==='walk'){
          actor.x+=actor.dir*actor.speed*(width<600?.64:1)*dt/width;
          const target=actor.size*(width<600?.78:Math.min(1,width/1060));
          const margin=actor.poses[0].width*target/actor.poses[0].height/width*.5+.025;
          const min=Math.max(actor.min,margin),max=Math.min(actor.max,1-margin);
          if(actor.x<min||actor.x>max){actor.x=Math.max(min,Math.min(max,actor.x));choose(actor,'turn');}
        }
        if(actor.age>=actor.duration){
          if(actor.state==='turn'){actor.dir*=-1;choose(actor,'walk');}
          else{const roll=random();choose(actor,roll<.48?'walk':roll<.72?'graze':roll<.89?'look':'rest');}
        }
      }
    }
    function animal(actor){
      if(!actor.poses.length)return;
      const target=actor.size*(width<600?.78:Math.min(1,width/1060));
      const scale=target/actor.poses[0].height;
      const x=actor.x*width,y=actor.y*height;
      const current=pose(actor),sprite=actor.poses[current];
      const breadth=actor.kind==='elephant'?target*.75:actor.kind==='deer'?target*.58:target*.7;
      ctx.save();ctx.translate(x,y);
      const shadow=ctx.createRadialGradient(0,0,0,0,0,breadth);shadow.addColorStop(0,'rgba(22,31,7,.42)');shadow.addColorStop(1,'rgba(22,31,7,0)');ctx.save();ctx.scale(1,.16);ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,breadth,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.scale(actor.dir,1);
      const breathe=actor.state==='walk'?Math.sin(time*7+actor.phase)*.5:Math.sin(time*1.65+actor.phase)*.3;
      const paint=(part,alpha,index)=>{const poseScale=index>=6?target/part.height:scale;ctx.globalAlpha=alpha;ctx.drawImage(part,-part.width*poseScale/2,-part.height*poseScale+breathe,part.width*poseScale,part.height*poseScale);};
      paint(sprite,1,current);
      ctx.restore();
    }
    function pond(){
      // Rings stay in the small pond; the bank and tree never deform.
      const scale=Math.max(width/background.width,height/background.height);
      const ox=(width-background.width*scale)*.5,oy=height-background.height*scale;
      ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
      ctx.beginPath();ctx.moveTo(0,740);ctx.lineTo(220,770);ctx.lineTo(380,840);ctx.lineTo(440,941);ctx.lineTo(0,941);ctx.closePath();ctx.clip();
      for(let i=0;i<5;i++){const phase=(time*.12+i*.21)%1;ctx.strokeStyle=`rgba(239,235,164,${(1-phase)*.22})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(85+i*42,830+i%2*57,6+phase*43,2+phase*11,0,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
    function air(){
      for(const leaf of leaves){const x=((leaf.x+time*(.004+wind*.006))%1)*width,y=((leaf.y+time*.008)%1)*height;ctx.save();ctx.translate(x,y);ctx.rotate(leaf.phase+time*.6);ctx.fillStyle='rgba(228,219,125,.46)';ctx.beginPath();ctx.ellipse(0,0,leaf.size,leaf.size*.35,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      for(let i=0;i<3;i++){
        const x=width*(.17+i*.19)+Math.sin(time*.35+i*2)*width*.055,y=height*(.4+i*.055)+Math.sin(time*.8+i)*12;
        const flap=.15+.85*Math.abs(Math.sin(time*9+i));ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(time*.5+i)*.2);ctx.fillStyle=i===1?'#e2b36d':'#d2dca1';ctx.beginPath();ctx.ellipse(-3*flap,0,3.8*flap,2.6,-.3,0,Math.PI*2);ctx.ellipse(3*flap,0,3.8*flap,2.6,.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b4731';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,3);ctx.stroke();ctx.restore();
      }
    }
    function draw(){
      ctx.clearRect(0,0,width,height);if(!ready)return;
      pond();for(const actor of [...actors].sort((a,b)=>a.y-b.y))animal(actor);air();
    }
    function tick(now){frame=null;if(paused||!visible||document.hidden||!ready)return;
      if(!last||now-last>=42){const dt=last?Math.min((now-last)/1000,.12):0;last=now;update(dt);draw();}
      frame=requestAnimationFrame(tick);
    }
    function sync(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;
      canvas.dataset.groveState=!ready?'loading':paused?'paused':!visible||document.hidden?'offscreen':'running';
      if(ready&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);
    }
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'90px'});observer.observe(scene);
    const sizes=new ResizeObserver(resize);sizes.observe(scene);
    document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',event=>{paused=event.matches;sync();});
    Promise.all([load('/assets/emerald-wisdom/grove-v1.webp'),...actors.map(a=>load('/assets/emerald-wisdom/'+a.kind+'-poses-v2.webp'))]).then(images=>{
      background=images[0];actors.forEach((actor,i)=>actor.poses=prepare(images[i+1]));ready=true;status.textContent='Deer, elephant, and dog · choose an animal below to explore its teaching.';resize();sync();
    }).catch(()=>{status.textContent='The grove artwork is available. The moving animals could not load; reload to try again. You can still explore their teachings below.';canvas.dataset.groveState='unavailable';});
    resize();sync();
    return{pause(value){paused=Boolean(value);sync();},setWind(value){wind=value;},lookAt(kind){const actor=actors.find(a=>a.kind===kind);if(actor&&ready){choose(actor,'look');draw();}}};
  }
  window.EmeraldGrove={create};
})();
