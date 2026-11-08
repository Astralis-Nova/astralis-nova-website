(() => {
  'use strict';
  function create(options={}) {
    const canvas=document.getElementById('groveLife'),ctx=canvas?.getContext('2d');
    if(!ctx)return null;
    const scene=document.getElementById('groveScene'),viewport=document.getElementById('worldViewport'),hotspots=document.getElementById('creatureHotspots'),status=document.getElementById('groveStatus');
    let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,frame=null,last=0,time=0,wind=.65,width=1,height=1,seed=93617;
    const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    const specs=[
      ['deer',.40,.76,.34,.52,112,15,1],['elephant',.71,.73,.61,.80,183,10,-1],['dog',.53,.86,.45,.66,70,22,1],
      ['monkey',.21,.68,.16,.30,101,18,1],['monkey',.13,.40,.10,.18,85,8,1],
      ['bull',.87,.82,.79,.92,123,11,-1],['peacock',.48,.61,.43,.57,62,9,1],['mouse',.68,.89,.64,.73,28,13,-1],
      ['serpent',.28,.82,.23,.34,34,9,1],['turtle',.10,.88,.05,.18,32,5,1],['hare',.37,.88,.31,.42,54,20,1]
    ];
    const actors=specs.map((s,i)=>({kind:s[0],x:s[1],y:s[2],min:s[3],max:s[4],size:s[5],speed:s[6],dir:s[7],state:i===4?'climb':i%3===0?'walk':'rest',age:0,duration:3+i*.65,phase:i*.7,tree:i===4,poses:[]}));
    const names=new Map((window.EmeraldCreatures||[]).map(c=>[c.id,c.name]));
    for(const actor of actors){
      const button=document.createElement('button');button.className='creature-hit';button.type='button';button.dataset.creature=actor.kind;
      button.setAttribute('aria-label',`Meet the ${names.get(actor.kind)||actor.kind}${actor.tree?' in the tree':''} and explore its stories`);
      const label=document.createElement('span');label.textContent=names.get(actor.kind)||actor.kind;button.append(label);button.hidden=true;
      button.addEventListener('click',()=>options.onSelect?.(actor.kind));
      button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))focusActor(actor,false);});
      hotspots.append(button);actor.button=button;
    }
    const leaves=Array.from({length:15},()=>({x:random(),y:random(),phase:random()*6.28,size:2+random()*3}));
    const load=url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error(url));image.src=url;});
    function prepare(image,columns){
      const frames=[];
      for(let i=0;i<columns*2;i++){
        const sx=Math.floor(i%columns*image.width/columns),sy=Math.floor(Math.floor(i/columns)*image.height/2),sw=Math.floor((i%columns+1)*image.width/columns)-sx,sh=Math.floor(image.height/2);
        const c=document.createElement('canvas');c.width=sw;c.height=sh;const cc=c.getContext('2d');cc.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
        const pixels=cc.getImageData(0,0,sw,sh).data;let l=sw,t=sh,r=0,b=0;
        for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>210){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
        if(r<=l||b<=t)throw Error('Empty pose');
        const part=document.createElement('canvas');part.width=r-l+3;part.height=b-t+3;
        part.getContext('2d').drawImage(c,Math.max(0,l-1),Math.max(0,t-1),part.width,part.height,0,0,part.width,part.height);frames.push(part);
      }
      return frames;
    }
    function resize(){
      const rect=scene.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const dpr=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();
    }
    function pose(a){
      if(a.tree)return a.state==='climb'?3:2;
      if(a.poses.length===8){if(a.state==='walk')return Math.floor((time*(a.kind==='elephant'?2.6:4.5)+a.phase)%4);return a.state==='rest'?5:a.state==='graze'?4:a.state==='turn'?7:6;}
      if(a.state==='walk')return Math.floor(time*(a.kind==='turtle'?1.7:a.kind==='hare'?3.6:2.6)+a.phase)%2;
      if(a.kind==='peacock'||a.kind==='serpent')return a.state==='rest'?3:2;
      return a.state==='graze'&&a.kind==='hare'?3:a.state==='look'&&['bull','mouse','turtle'].includes(a.kind)?3:2;
    }
    function choose(a,state){a.state=state;a.age=0;a.duration=state==='walk'?4+random()*7:state==='turn'?1.2:4+random()*6;}
    function update(dt){
      time+=dt;
      for(const a of actors){
        a.age+=dt;
        if(a.tree){if(a.state==='climb')a.y=.42-Math.sin(a.age*.35)*.045;if(a.age>a.duration)choose(a,a.state==='climb'?'rest':'climb');continue;}
        if(a.state==='walk'){
          a.x+=a.dir*a.speed*dt/1672;
          if(a.x<a.min||a.x>a.max){a.x=Math.max(a.min,Math.min(a.max,a.x));choose(a,'turn');}
        }
        if(a.age>=a.duration){if(a.state==='turn'){a.dir*=-1;choose(a,'walk');}else{const r=random();choose(a,r<.50?'walk':r<.7?'graze':r<.88?'look':'rest');}}
      }
    }
    function animal(a){
      if(!a.poses.length)return;
      const index=pose(a),part=a.poses[index],target=a.size*height/750;
      let scale=target/a.poses[0].height;
      if(a.poses.length===8&&index>=6)scale=target/part.height;
      // Front-facing fan, raised hood, and sitting poses keep the original anatomy.
      if(a.kind==='peacock'&&index===2)scale*=.87;
      const sw=part.width*scale,sh=part.height*scale,x=a.x*width,y=a.y*height;
      const hop=a.kind==='hare'&&a.state==='walk'?Math.abs(Math.sin(time*7))*7*height/750:0;
      const breath=Math.sin(time*1.7+a.phase)*.35;
      ctx.save();ctx.translate(x,y);
      if(!a.tree){const breadth=Math.max(10,target*.65);const shadow=ctx.createRadialGradient(0,0,0,0,0,breadth);shadow.addColorStop(0,'rgba(17,29,7,.36)');shadow.addColorStop(1,'rgba(17,29,7,0)');ctx.save();ctx.scale(1,.17);ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,breadth,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.scale(a.dir,1);ctx.drawImage(part,-sw/2,-sh-hop+breath,sw,sh);ctx.restore();
      const hitW=Math.max(44,sw*.87),hitH=Math.max(44,sh*.91);
      a.button.style.width=hitW+'px';a.button.style.height=hitH+'px';a.button.style.transform=`translate(${x-hitW/2}px,${y-sh-hop}px)`;
    }
    function pond(){
      ctx.save();ctx.scale(width/1672,height/941);ctx.beginPath();ctx.moveTo(0,740);ctx.lineTo(220,770);ctx.lineTo(380,840);ctx.lineTo(440,941);ctx.lineTo(0,941);ctx.closePath();ctx.clip();
      for(let i=0;i<6;i++){const phase=(time*.12+i*.18)%1;ctx.strokeStyle=`rgba(239,235,164,${(1-phase)*.3})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(75+i*40,830+i%2*57,6+phase*46,2+phase*11,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
    }
    function air(){
      // Atmospheric layers move independently, leaving the forest geometry stable.
      for(let i=0;i<3;i++){const x=width*(.24+i*.23)+Math.sin(time*.07+i)*45;const mist=ctx.createRadialGradient(x,height*.61,0,x,height*.61,width*.15);mist.addColorStop(0,'rgba(237,239,185,.045)');mist.addColorStop(1,'rgba(237,239,185,0)');ctx.save();ctx.translate(0,height*.49);ctx.scale(1,.2);ctx.fillStyle=mist;ctx.fillRect(0,0,width,height*3);ctx.restore();}
      for(const l of leaves){const x=((l.x+time*wind*.009)%1)*width,y=((l.y+time*.007)%1)*height;ctx.save();ctx.translate(x,y);ctx.rotate(l.phase+time*wind);ctx.fillStyle='rgba(229,217,123,.55)';ctx.beginPath();ctx.ellipse(0,0,l.size,l.size*.35,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      for(let i=0;i<5;i++){const x=width*(.13+i*.18)+Math.sin(time*.35+i*2)*width*.03,y=height*(.48+i%3*.05)+Math.sin(time*.8+i)*13,flap=.15+.85*Math.abs(Math.sin(time*9+i));ctx.fillStyle=i%2?'#dfa975':'#d7e3a2';ctx.beginPath();ctx.ellipse(x-3*flap,y,4*flap,2.5,-.3,0,Math.PI*2);ctx.ellipse(x+3*flap,y,4*flap,2.5,.3,0,Math.PI*2);ctx.fill();}
    }
    function draw(){ctx.clearRect(0,0,width,height);if(!ready)return;pond();for(const a of [...actors].sort((a,b)=>a.y-b.y))animal(a);air();}
    function tick(now){frame=null;if(paused||document.hidden||!ready)return;if(!last||now-last>=42){const dt=last?Math.min((now-last)/1000,.12):0;last=now;update(dt);draw();}frame=requestAnimationFrame(tick);}
    function sync(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;canvas.dataset.groveState=!ready?'loading':paused?'paused':document.hidden?'offscreen':'running';if(ready&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
    function focusActor(a,smooth=true){viewport.scrollTo({left:a.x*width-viewport.clientWidth*.5,behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});}
    new ResizeObserver(resize).observe(scene);document.addEventListener('visibilitychange',sync);
    const kinds=[...new Set(actors.map(a=>a.kind))];
    Promise.allSettled(kinds.map(async kind=>{const old=['deer','elephant','dog'].includes(kind),image=await load('/assets/emerald-wisdom/'+kind+'-poses-v'+(old?'2':'1')+'.webp');return{kind,poses:prepare(image,old?4:2)};})).then(results=>{
      let count=0;for(const r of results){if(r.status==='fulfilled'){count++;for(const a of actors.filter(a=>a.kind===r.value.kind)){a.poses=r.value.poses;a.button.hidden=false;}}}
      ready=true;status.textContent=count===10?'10 kinds of creatures · swipe sideways to explore the whole forest.':`${count} creatures have arrived. Reload if a creature is missing.`;
      resize();focusActor(actors[2],false);sync();
    });
    resize();sync();
    return{pause(value){paused=Boolean(value);sync();},setWind(value){wind=value;},focusKind(kind){const a=actors.find(a=>a.kind===kind);if(a){focusActor(a);if(a.poses.length)choose(a,'look');draw();}},pan(dir){viewport.scrollBy({left:dir*viewport.clientWidth*.65,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}};
  }
  window.EmeraldGrove={create};
})();
