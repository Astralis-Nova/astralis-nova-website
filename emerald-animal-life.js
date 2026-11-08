/* Joint-driven motion and independent decisions, adapted from Toon Planet's rigs. */
(() => {
  'use strict';
  const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,u)=>a+(b-a)*u;
  const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const limb=(hip,knee,foot,phase,band)=>({hip,knee,foot,phase,band});
  const profiles={
    deer:{stride:30,neck:[.70,.43],eye:[.88,.16],ear:[.79,.08],tail:[.18,.48],tailZone:[0,.24,.38,.68],headZone:[.65,.96,.0,.48],legs:[
      limb([.27,.60],[.18,.78],[.10,.97],0,[.04,.29]),limb([.36,.61],[.37,.79],[.45,.99],.5,[.29,.49]),limb([.62,.58],[.60,.81],[.60,.99],.5,[.51,.67]),limb([.67,.55],[.71,.71],[.82,.95],0,[.67,.87])]},
    elephant:{stride:34,neck:[.72,.33],eye:[.83,.22],ear:[.69,.25],tail:[.18,.44],tailZone:[0,.18,.36,.84],headZone:[.72,1,.0,.47],trunk:true,legs:[
      limb([.22,.63],[.21,.79],[.15,.97],0,[.05,.27]),limb([.33,.67],[.35,.84],[.43,.99],.5,[.27,.47]),limb([.65,.63],[.65,.83],[.65,.99],.5,[.54,.71]),limb([.77,.58],[.85,.70],[.80,.82],0,[.71,.88])]},
    dog:{stride:27,neck:[.74,.46],eye:[.90,.20],ear:[.83,.07],tail:[.22,.43],tailZone:[0,.31,0,.51],headZone:[.72,1,.0,.49],legs:[
      limb([.26,.60],[.20,.78],[.09,.99],0,[.02,.26]),limb([.34,.63],[.37,.80],[.44,.99],.5,[.26,.49]),limb([.66,.60],[.65,.82],[.67,.99],.5,[.56,.73]),limb([.71,.58],[.77,.80],[.91,.97],0,[.73,.98])]},
    monkey:{stride:32,neck:[.80,.45],eye:[.91,.30],ear:[.84,.29],tail:[.22,.49],tailZone:[0,.55,0,.40],headZone:[.78,1,.18,.48],legs:[
      limb([.30,.64],[.19,.79],[.10,.99],0,[.02,.32]),limb([.40,.65],[.41,.85],[.45,.97],.5,[.32,.48]),limb([.64,.58],[.59,.81],[.55,.99],.5,[.48,.66]),limb([.70,.58],[.79,.79],[.95,.99],0,[.66,1])]},
    bull:{stride:30,neck:[.77,.35],eye:[.91,.21],ear:[.82,.20],tail:[.17,.48],tailZone:[0,.18,.36,.90],headZone:[.76,1,.0,.43],legs:[
      limb([.24,.64],[.19,.82],[.15,.97],0,[.03,.29]),limb([.34,.64],[.38,.85],[.46,.99],.5,[.29,.49]),limb([.65,.60],[.63,.81],[.65,.98],.5,[.52,.70]),limb([.73,.59],[.77,.78],[.86,.98],0,[.70,.94])]},
    peacock:{stride:14,neck:[.78,.48],eye:[.89,.11],ear:[.87,.03],tail:[.63,.58],tailZone:[0,.60,.56,1],headZone:[.75,1,0,.52],legs:[
      limb([.65,.70],[.64,.83],[.60,.99],0,[.55,.72]),limb([.79,.63],[.80,.84],[.88,.99],.5,[.72,.95])]},
    mouse:{stride:11,neck:[.69,.40],eye:[.86,.33],ear:[.74,.16],tail:[.35,.62],tailZone:[0,.33,.53,1],headZone:[.69,1,.05,.56],legs:[
      limb([.42,.72],[.35,.89],[.39,.98],0,[.26,.49]),limb([.56,.77],[.57,.90],[.66,.99],.5,[.49,.69]),limb([.79,.63],[.78,.81],[.84,.93],0,[.79,.95]),limb([.73,.72],[.73,.88],[.77,.99],.5,[.68,.79])]},
    turtle:{stride:14,neck:[.76,.48],eye:[.95,.19],ear:null,tail:[.12,.69],tailZone:[0,.18,.62,.82],headZone:[.75,1,.0,.60],shell:true,legs:[
      limb([.19,.67],[.13,.80],[.08,.95],0,[0,.28]),limb([.38,.74],[.40,.82],[.43,.88],.5,[.28,.49]),limb([.69,.59],[.76,.76],[.87,.95],.5,[.66,1]),limb([.59,.68],[.59,.81],[.64,.88],0,[.49,.66])]},
    hare:{stride:38,neck:[.73,.47],eye:[.88,.37],ear:[.72,.17],tail:[.10,.65],tailZone:[0,.19,.54,.77],headZone:[.68,1,0,.59],legs:[
      limb([.40,.64],[.24,.80],[.47,.97],0,[.17,.48]),limb([.66,.59],[.61,.77],[.55,.84],.12,[.48,.74])]},
    serpent:{stride:32,neck:[.86,.51],eye:[.95,.37],ear:null,legs:[]}
  };
  const climbRig={...profiles.monkey,neck:[.49,.34],eye:[.55,.16],ear:[.45,.20],tail:[.37,.66],tailZone:[0,.34,.24,.82],headZone:[.36,.68,0,.37],legs:[
    limb([.53,.68],[.72,.79],[.65,.95],0,[.55,.89]),limb([.45,.68],[.35,.87],[.44,.99],.5,[.29,.55]),limb([.56,.40],[.73,.25],[.91,.08],.5,[.63,1]),limb([.46,.41],[.47,.24],[.55,.19],0,[.39,.63])]
  };
  const quietFeatures={
    deer:{neck:[.77,.52],eye:[.86,.23],ear:[.85,.08],tail:[.11,.79],tailZone:[0,.23,.70,.99],headZone:[.72,1,0,.55]},
    elephant:{neck:[.68,.40],eye:[.78,.29],ear:[.60,.30],headZone:[.62,.98,0,.51]},
    dog:{neck:[.70,.48],eye:[.80,.23],ear:[.73,.09],tail:[.24,.83],tailZone:[0,.33,.78,1],headZone:[.64,.98,0,.52]},
    monkey:{neck:[.68,.30],eye:[.77,.09],ear:[.65,.13],tail:[.40,.81],tailZone:[0,.40,.11,.96],headZone:[.59,.93,0,.32]},
    bull:{neck:[.75,.42],eye:[.85,.23],ear:[.76,.28],tail:[.12,.65],tailZone:[0,.28,.60,1],headZone:[.70,1,0,.45]},
    mouse:{neck:[.72,.42],eye:[.78,.31],ear:[.66,.15],tail:[.47,.85],tailZone:[0,.48,.81,1],headZone:[.66,.98,0,.48]},
    hare:{neck:[.70,.38],eye:[.81,.20],ear:[.64,.08],tail:[.17,.86],tailZone:[0,.22,.79,1],headZone:[.62,1,0,.46]},
    turtle:{neck:[.76,.60],eye:[.96,.39],ear:null,headZone:[.75,1,.20,.65]},
    peacock:{neck:[.53,.47],eye:[.56,.24],ear:[.56,.11],headZone:[.47,.67,.10,.46]}
  };
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
      const travelled=Math.hypot((px-lastX)*1672,(py-lastY)*941);gait+=travelled/(profiles[o.kind].stride||28);lastX=px;lastY=py;
      const dt=Math.max(.001,t-lastTime),speed=clamp(travelled/dt/o.speed/1.45);lastTime=t;
      if(t>=blinkAt){blinkStart=t;blinkAt=t+range(2.3,6.8);}const age=t-blinkStart,blink=age>=0&&age<.19?Math.sin(age/.19*Math.PI)**2:0;
      return{action:state.action,id:state.id,x:px,y:py,dir:state.action==='turn'?(u<.52?state.dir:state.nextDir):state.dir,turn:u,progress:u,weight:edge,speed,gait,time:t+phase,blink,tree:!!o.tree,descending:state.y>state.fromY};
    }};
  }
  function solveLimb(hip,foot,upper,lower,bend){
    const dx=foot[0]-hip[0],dy=foot[1]-hip[1],d=clamp(Math.hypot(dx,dy),Math.abs(upper-lower)+1e-5,upper+lower-1e-5),a=Math.atan2(dy,dx);
    const angle=Math.acos(clamp((upper*upper+d*d-lower*lower)/(2*upper*d),-1,1));
    return[hip,[hip[0]+Math.cos(a+bend*angle)*upper,hip[1]+Math.sin(a+bend*angle)*upper],[hip[0]+Math.cos(a)*d,hip[1]+Math.sin(a)*d]];
  }
  const rotate=(x,y,origin,angle)=>{const c=Math.cos(angle),s=Math.sin(angle),dx=x-origin[0],dy=y-origin[1];return[origin[0]+dx*c-dy*s,origin[1]+dx*s+dy*c];};
  function prepareMotion(kind,motion,frame){
    const articulated=frame===0||(motion.tree&&frame===3),quiet=(kind==='deer'||kind==='elephant'||kind==='dog')?frame===5:frame===2;
    let profile=motion.tree&&frame===3?climbRig:quiet?{...profiles[kind],...quietFeatures[kind]}:profiles[kind];
    if(kind==='deer'&&frame===4)profile={...profile,neck:[.75,.61],eye:[.88,.79],ear:[.84,.61],headZone:[.74,1,.44,1]};
    if(kind==='dog'&&frame===4)profile={...profile,neck:[.73,.48],eye:[.86,.59],ear:[.80,.41],headZone:[.71,1,.30,.86]};
    if(kind==='hare'&&frame===3)profile={...profile,neck:[.77,.50],eye:[.89,.72],ear:[.80,.33],headZone:[.70,1,.23,1]};
    const walking=motion.action==='walk'||motion.action==='climb';
    const activity=motion.weight,clock=motion.time;
    const p={...motion,kind,frame,profile,walking,articulated,move:walking?motion.speed:0,head:Math.sin(clock*1.2)*.022+Math.sin(clock*.41)*.014};
    if(['graze','sniff','nibble','groom','preen'].includes(motion.action))p.head+=Math.sin(clock*(kind==='mouse'?8:kind==='dog'?3.5:2.2))*.045*activity;
    p.breath=profile.shell?0:Math.sin(clock*(kind==='elephant'?1.6:kind==='mouse'?4.4:2.6))*.003;
    p.ear=ease((Math.sin(clock*1.7)-.82)/.18)*Math.sin(clock*22)*.12;
    p.tailAngle=Math.sin(clock*(kind==='dog'?6.8:kind==='monkey'?2.8:3.8))*(kind==='dog'?.12:.065);
    p.chains=[];
    // Rest and front-view photographs keep their silhouette; only local features move.
    if(articulated){
      for(const leg of profile.legs){
        const phase=(motion.gait+leg.phase)%1,stance=.64,step=phase<stance?.5-phase/stance:-.5+ease((phase-stance)/(1-stance));
        const lift=phase<stance?0:Math.sin((phase-stance)/(1-stance)*Math.PI);
        const amount=p.move*(kind==='turtle'?.6:1),stride=kind==='mouse'?.10:kind==='peacock'?.065:.115;
        let foot=[leg.foot[0]+step*stride*amount,leg.foot[1]-lift*(kind==='hare'?.16:.07)*amount];
        if(motion.tree){foot=[leg.foot[0]+Math.sin((motion.gait+leg.phase)*TAU)*.055*amount,leg.foot[1]+Math.cos((motion.gait+leg.phase)*TAU)*.075*amount];}
        const hip=[leg.hip[0],leg.hip[1]+p.breath],upper=length(leg.hip,leg.knee),lower=length(leg.knee,leg.foot);
        const cross=(leg.knee[0]-leg.hip[0])*(leg.foot[1]-leg.hip[1])-(leg.knee[1]-leg.hip[1])*(leg.foot[0]-leg.hip[0]);
        p.chains.push(solveLimb(hip,foot,upper,lower,cross>0?-1:1));
      }
    }
    return p;
  }
  function segmentMap(x,y,a,b,c,d){const p=rotate(x,y,a,Math.atan2(d[1]-c[1],d[0]-c[0])-Math.atan2(b[1]-a[1],b[0]-a[0]));return[p[0]+c[0]-a[0],p[1]+c[1]-a[1]];}
  function deformPoint(x,y,p){
    const r=p.profile,t=p.time;
    if(p.kind==='serpent'){
      if(p.frame===0){const w=Math.sin(Math.PI*clamp(x))*.8+.2;return[x+Math.sin(t*3.2-x*8)*.008*p.move,y+Math.sin(t*3.6-x*9)*.10*w*(.25+p.move*.75)];}
      const weight=ease((.78-y)/.55);return[x+Math.sin(t*1.5)*.025*weight,y+Math.sin(t*1.8)*.006*weight];
    }
    let point=[x,y+p.breath*clamp((.82-y)/.50)];
    const side=true;
    if(p.articulated&&p.chains.length){
      let best=Infinity,result=null;
      r.legs.forEach((leg,i)=>{
        const arm=p.tree&&i>=2;
        if(x<leg.band[0]||x>leg.band[1]||(arm?y>leg.hip[1]-.02:y<leg.hip[1]+.04))return;
        const source=[leg.hip,leg.knee,leg.foot];let nearest=Infinity,total=0,rx=0,ry=0;
        for(let b=0;b<2;b++){
          const a=source[b],e=source[b+1],dx=e[0]-a[0],dy=e[1]-a[1],u=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)),dist=Math.hypot(x-a[0]-dx*u,y-a[1]-dy*u);
          const w=1/(1+(dist/.026)**4),q=segmentMap(x,y,a,e,p.chains[i][b],p.chains[i][b+1]);rx+=q[0]*w;ry+=q[1]*w;total+=w;nearest=Math.min(nearest,dist);
        }
        if(nearest<best){best=nearest;result={x:rx/total,y:ry/total,w:ease(((arm?leg.hip[1]-y:y-leg.hip[1])-.035)/.11)*(1-ease((nearest-.045)/.065))};}
      });
      if(result){point[0]=mix(point[0],result.x,result.w);point[1]=mix(point[1],result.y,result.w);}
    }
    if(side&&r.tailZone){
      const [l,h,top,bottom]=r.tailZone;
      if(x>=l&&x<=h&&y>=top&&y<=bottom){
        const w=ease((h-x)/(h-l)*1.4),q=rotate(...point,r.tail,p.tailAngle*w);point=[mix(point[0],q[0],w),mix(point[1],q[1],w)];
        point[1]+=Math.sin(t*3.5-x*8)*.009*w;
      }
    }
    if(side&&r.trunk&&x>.84&&y>.29){const w=ease((y-.29)/.55);point[0]+=Math.sin(t*2.4-y*5)*.033*w;point[1]+=Math.sin(t*1.5-y*3)*.012*w;}
    if(p.kind==='peacock'&&p.frame===2){const w=clamp((.68-y)/.6);point[0]+=(x-.5)*Math.sin(t*1.8)*.018*w;point[1]+=Math.sin(x*12+t*2.6)*.006*w;}
    if(side&&r.headZone){
      const [l,h,top,bottom]=r.headZone,w=ease((x-l)/(h-l)*3)*(1-ease((y-bottom+.10)/.10));
      if(w>0){const q=rotate(...point,r.neck,p.head);point=[mix(point[0],q[0],w),mix(point[1],q[1],w)];}
      if(r.ear){const w=clamp(1-Math.hypot((x-r.ear[0])/.06,(y-r.ear[1])/.11));const q=rotate(...point,r.ear,p.ear*w);point=q;}
      const eye=r.eye,ew=clamp(1-Math.hypot((x-eye[0])/.027,(y-eye[1])/.025));point[1]+= (eye[1]-y)*p.blink*ew*.92;
    }else{
      // Quiet poses still breathe, shift their head, and twitch an ear.
      const h=ease((x-.60)/.25)*(1-ease((y-.48)/.2));point[1]+=Math.sin(t*1.3)*.006*h;
      if(p.kind==='monkey'&&p.action==='groom')point[0]+=Math.sin(t*7)*.008*ease((y-.35)/.2)*(1-ease((y-.72)/.15));
    }
    if(p.kind==='mouse'&&p.frame===2&&p.action==='nibble'){const w=clamp(1-Math.hypot((x-.83)/.16,(y-.66)/.15));point[0]+=Math.sin(t*8)*.009*w;point[1]+=Math.cos(t*8)*.012*w;}
    if(p.kind==='monkey'&&p.frame===2&&p.action==='groom'){const w=ease((y-.35)/.2)*(1-ease((y-.75)/.15));point[0]+=Math.sin(t*7)*.01*w;}
    return point;
  }
  function createRenderer(){
    const surface=document.createElement('canvas');let gl;
    try{gl=surface.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:true});}catch{}
    if(!gl){const f=createFallback();f.reason='no-webgl';return f;}
    try{
      const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Animal shader');return s;};
      const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 point;attribute vec2 uv;uniform vec2 viewport;varying vec2 tex;void main(){gl_Position=vec4(point.x/viewport.x*2.-1.,1.-point.y/viewport.y*2.,0.,1.);tex=uv;}'));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D fur;varying vec2 tex;void main(){gl_FragColor=texture2D(fur,tex);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Animal program');gl.useProgram(program);
      const buffer=gl.createBuffer(),ib=gl.createBuffer(),point=gl.getAttribLocation(program,'point'),uv=gl.getAttribLocation(program,'uv'),vp=gl.getUniformLocation(program,'viewport');
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(point);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(point,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
      gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      const cols=42,rows=30,vertices=[],indices=[];
      for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)vertices.push([x/cols,y/rows]);
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=a+cols+1;indices.push(a,b,c,b,c+1,c);}
      const data=new Float32Array(vertices.length*4);vertices.forEach(([x,y],i)=>{data[i*4+2]=x;data[i*4+3]=y;});gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
      const textures=new WeakMap();let lost=false,fallback;
      surface.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});
      return{mode:'webgl-joints',begin(w,h,dpr){if(lost){fallback??=createFallback();fallback.begin(w,h,dpr);return;}if(surface.width!==Math.round(w*dpr)||surface.height!==Math.round(h*dpr)){surface.width=Math.round(w*dpr);surface.height=Math.round(h*dpr);}gl.viewport(0,0,surface.width,surface.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(vp,w,h);},
        draw(part,p,x,y,sw,sh,dir,hop){if(lost){fallback.draw(part,p,x,y,sw,sh,dir,hop);return;}
          let texture=textures.get(part);if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,part);textures.set(part,texture);}else gl.bindTexture(gl.TEXTURE_2D,texture);
          vertices.forEach(([u,v],i)=>{const q=deformPoint(u,v,p);data[i*4]=x+(q[0]-.5)*sw*dir;data[i*4+1]=y+(q[1]-1)*sh-hop;});
          gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
        },finish(ctx,w,h){if(lost)fallback.finish(ctx,w,h);else ctx.drawImage(surface,0,0,w,h);}};
    }catch(error){const f=createFallback();f.reason=String(error.message);return f;}
  }
  function createFallback(){
    // Rasterize small joint meshes on demand, then reuse them between stride phases.
    // The bounded cache avoids thousands of full-atlas draws on every phone frame.
    let target=[],serial=0,bytes=0;const ids=new WeakMap(),cache=new Map(),cols=10,rows=8,pad=9;
    function raster(a){
      if(!ids.has(a.part))ids.set(a.part,serial++);
      const w=Math.max(40,Math.min(300,Math.ceil(a.sw))),h=Math.max(32,Math.min(200,Math.ceil(a.sh)));
      const moving=a.p.walking,phase=moving?Math.floor((a.p.gait%1)*18):Math.floor((a.p.time%5)/5*24),speed=Math.round(a.p.move*3),blink=Math.round(a.p.blink*2);
      const key=[ids.get(a.part),a.p.action,phase,speed,blink,w,h].join(':');
      if(cache.has(key)){const hit=cache.get(key);cache.delete(key);cache.set(key,hit);return hit;}
      const surface=document.createElement('canvas');surface.width=w+pad*2;surface.height=h+pad*2;const ctx=surface.getContext('2d');
      const points=[];for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const q=deformPoint(x/cols,y/rows,a.p);points.push([q[0]*w+pad,q[1]*h+pad]);}
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const i=y*(cols+1)+x;
        for(const tri of [[i,i+1,i+cols+1],[i+1,i+cols+2,i+cols+1]]){
          const src=tri.map(n=>[n%(cols+1)*a.part.width/cols,Math.floor(n/(cols+1))*a.part.height/rows]),dst=tri.map(n=>points[n]);
          const [p,q,r]=src,[P,Q,R]=dst,bx=q[0]-p[0],by=q[1]-p[1],cx=r[0]-p[0],cy=r[1]-p[1],den=bx*cy-by*cx;
          const A=((Q[0]-P[0])*cy-(R[0]-P[0])*by)/den,B=((Q[1]-P[1])*cy-(R[1]-P[1])*by)/den,C=((R[0]-P[0])*bx-(Q[0]-P[0])*cx)/den,D=((R[1]-P[1])*bx-(Q[1]-P[1])*cx)/den;
          const mx=(P[0]+Q[0]+R[0])/3,my=(P[1]+Q[1]+R[1])/3,inflate=v=>{const d=Math.hypot(v[0]-mx,v[1]-my)||1;return[v[0]+(v[0]-mx)*.35/d,v[1]+(v[1]-my)*.35/d];};
          ctx.save();ctx.beginPath();ctx.moveTo(...inflate(P));ctx.lineTo(...inflate(Q));ctx.lineTo(...inflate(R));ctx.closePath();ctx.clip();ctx.transform(A,B,C,D,P[0]-A*p[0]-C*p[1],P[1]-B*p[0]-D*p[1]);ctx.drawImage(a.part,0,0);ctx.restore();
        }
      }
      // Flatten this tiny mesh before caching; do not retain a long clip display list.
      const pixels=ctx.getImageData(0,0,surface.width,surface.height);ctx.clearRect(0,0,surface.width,surface.height);ctx.putImageData(pixels,0,0);
      const item={surface,w,h,cost:surface.width*surface.height*4};cache.set(key,item);bytes+=item.cost;
      while(cache.size>160||bytes>20*1024*1024){const oldest=cache.keys().next().value;bytes-=cache.get(oldest).cost;cache.delete(oldest);}
      return item;
    }
    return{mode:'canvas-joints',begin(){target=[];},draw(part,p,x,y,sw,sh,dir,hop){target.push({part,p,x,y,sw,sh,dir,hop});},finish(ctx){
      for(const a of target){const r=raster(a);ctx.save();ctx.translate(a.x,a.y-a.hop);ctx.scale(a.dir,1);ctx.drawImage(r.surface,-a.sw/2-pad*a.sw/r.w,-a.sh-pad*a.sh/r.h,a.sw*(1+pad*2/r.w),a.sh*(1+pad*2/r.h));ctx.restore();}
    }};
  }
  window.EmeraldAnimalLife={createMind,prepareMotion,deformPoint,solveLimb,createRenderer,profiles};
})();
