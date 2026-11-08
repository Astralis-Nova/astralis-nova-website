(() => {
  'use strict';
  // The artwork stays fixed. Only the independent cloud shell and air move.
  const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
  const fragment = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec3 sphere;
    uniform float clock;
    float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float noise(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float clouds(vec3 p){float n=0.,a=.53;for(int i=0;i<5;i++){n+=a*noise(p);p=p*2.03+vec3(7.1,4.8,3.6);a*=.49;}return n;}
    void main(){
      vec2 p=(gl_FragCoord.xy-sphere.xy)/sphere.z;
      float r=length(p);
      if(r>1.058){gl_FragColor=vec4(0.);return;}
      if(r>1.){
        float rim=(1.-smoothstep(1.,1.058,r))*.22;
        float light=.45+.55*max(0.,dot(normalize(vec3(p,.12)),normalize(vec3(-.65,.65,.5))));
        gl_FragColor=vec4(.54,.85,.59,rim*light);return;
      }
      vec3 n=vec3(p,sqrt(max(0.,1.-r*r)));
      float angle=clock*.021;
      vec3 q=vec3(n.x*cos(angle)+n.z*sin(angle),n.y,-n.x*sin(angle)+n.z*cos(angle));
      // Differential flow and latitude shear create changing cloud fronts.
      q.x+=.11*sin(q.y*6.+clock*.032);
      q.z+=.08*cos(q.y*8.-clock*.023);
      float field=clouds(q*5.9+vec3(3.4,1.7,clock*.006));
      float fine=noise(q*37.+vec3(clock*.018,0.,0.));
      float cover=smoothstep(.49,.69,field+fine*.075);
      float veil=smoothstep(.42,.62,clouds(q*9.2+vec3(8.3,clock*.003,4.1)))*.17;
      float light=max(0.,dot(n,normalize(vec3(-.55,.65,.8))));
      float edge=smoothstep(0.,.12,n.z);
      float alpha=(cover*.72+veil)*edge*(.48+.52*light);
      vec3 color=mix(vec3(.44,.57,.47),vec3(.99,.97,.82),.25+.75*light);
      // Fine density variation reads as cloud relief rather than solid white paint.
      color*=.84+.16*fine;
      gl_FragColor=vec4(color,min(alpha,.83));
    }`;

  function create(originalCanvas, options = {}) {
    let canvas=originalCanvas,gl=null,program=null,uniforms=null,fallback=null;
    let width=1,height=1,dpr=1,bounds={x:0,y:0,r:1};
    let paused=false,visible=true,frame=null,last=0,time=0,cloudClock=0;
    let wind=options.wind ?? .65,targetWind=wind,destroyed=false;
    const thumbnail=Boolean(options.thumbnail),fps=thumbnail?12:24;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    paused=reduced.matches;
    const image=options.image;
    const air=options.airCanvas,airContext=air?.getContext('2d');
    let airWidth=1,airHeight=1;
    let seed=options.thumbnail?17831:78319;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const leaves=Array.from({length:12},()=>({x:.1+random()*.9,y:random(),size:3+random()*5,depth:.4+random()*.6,phase:random()*6.28}));
    const patches=Array.from({length:30},()=>({longitude:random()*6.28,latitude:(random()-.5)*2.5,size:.08+random()*.17,phase:random()*6.28}));
    const puff=document.createElement('canvas');puff.width=puff.height=128;
    const puffContext=puff.getContext('2d');
    if(puffContext){
      const pixels=puffContext.createImageData(128,128);
      const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+19.3)*43758.5453;return n-Math.floor(n);};
      const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return(a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;};
      for(let y=0;y<128;y++)for(let x=0;x<128;x++){
        let value=0,weight=.56,frequency=1;
        for(let octave=0;octave<5;octave++){value+=noise(x/19*frequency,y/23*frequency)*weight;frequency*=2.07;weight*=.48;}
        const edge=Math.max(0,1-Math.hypot((x-64)/63,(y-64)/61));
        const density=Math.max(0,Math.min(1,(value-.34)*2.8));
        const i=(y*128+x)*4;
        pixels.data[i]=240;pixels.data[i+1]=244;pixels.data[i+2]=222;
        pixels.data[i+3]=Math.round(density*Math.min(1,edge*3.8)*210);
      }
      puffContext.putImageData(pixels,0,0);
    }
    function useFallback(){
      if(gl){const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;gl=null;}
      fallback=canvas.getContext('2d');canvas.dataset.weatherBackend='canvas';
    }
    try{
      gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false,powerPreference:'low-power'});
      if(!gl)useFallback();
      else{
        const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
        const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
        program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
        gl.deleteShader(vs);gl.deleteShader(fs);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Cloud shader link failed');
        gl.useProgram(program);
        const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const attribute=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
        uniforms={resolution:gl.getUniformLocation(program,'resolution'),sphere:gl.getUniformLocation(program,'sphere'),clock:gl.getUniformLocation(program,'clock')};
        canvas.dataset.weatherBackend='webgl';
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();useFallback();observer?.disconnect();observer?.observe(canvas);sizeObserver?.disconnect();sizeObserver?.observe(canvas);resize();});
      }
    }catch{useFallback();}
    function resize(){
      const box=canvas.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);
      dpr=thumbnail?1:Math.min(devicePixelRatio||1,innerWidth<600?1.15:1);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      if(image){
        const iw=image.naturalWidth||1536,ih=image.naturalHeight||1024;
        const scale=Math.max(width/iw,height/ih);
        const position=getComputedStyle(image).objectPosition.split(' ').map(value=>parseFloat(value)/100);
        const x=(width-iw*scale)*(position[0]||0),y=(height-ih*scale)*(position[1]||0);
        bounds={x:x+iw*(1081/1536)*scale,y:y+ih*(490/1024)*scale,r:450*(iw/1536)*scale};
      }else bounds={x:width*.5,y:height*.5,r:Math.min(width,height)*.49};
      if(gl)gl.viewport(0,0,canvas.width,canvas.height);
      if(fallback)fallback.setTransform(dpr,0,0,dpr,0,0);
      if(airContext){const ab=air.getBoundingClientRect();airWidth=ab.width;airHeight=ab.height;air.width=Math.round(airWidth*dpr);air.height=Math.round(airHeight*dpr);airContext.setTransform(dpr,0,0,dpr,0,0);}
      draw();
    }
    function drawFallback(){
      if(!fallback)return;
      fallback.clearRect(0,0,width,height);fallback.save();fallback.beginPath();fallback.arc(bounds.x,bounds.y,bounds.r,0,Math.PI*2);fallback.clip();
      for(const patch of patches){
        const longitude=patch.longitude+cloudClock*.021;
        const z=Math.cos(longitude)*Math.cos(patch.latitude);if(z<=0)continue;
        const x=bounds.x+Math.sin(longitude)*Math.cos(patch.latitude)*bounds.r;
        const y=bounds.y+Math.sin(patch.latitude)*bounds.r;
        const size=bounds.r*patch.size*(.8+.2*Math.sin(time*.15+patch.phase));
        fallback.globalAlpha=Math.min(1,z*1.8)*.75;
        const projected=Math.max(.15,z);
        fallback.drawImage(puff,x-size*projected,y-size*.6,size*2*projected,size*1.2);
      }
      fallback.restore();
    }
    function drawAir(){
      if(!airContext)return;
      airContext.clearRect(0,0,airWidth,airHeight);
      for(const leaf of leaves){
        const x=leaf.x*airWidth,y=leaf.y*airHeight;
        airContext.save();airContext.translate(x,y);airContext.rotate(leaf.phase+time*(.2+wind*.2));
        airContext.scale(1,.4+.4*Math.abs(Math.sin(time*.6+leaf.phase)));
        airContext.globalAlpha=(.18+leaf.depth*.3)*Math.min(1,.25+wind);
        airContext.fillStyle=leaf.depth>.7?'#d9dc9a':'#a3c58b';
        airContext.beginPath();airContext.moveTo(-leaf.size,0);airContext.bezierCurveTo(-leaf.size*.1,-leaf.size*.65,leaf.size*.8,-leaf.size*.5,leaf.size,0);airContext.bezierCurveTo(leaf.size*.1,leaf.size*.65,-leaf.size*.8,leaf.size*.5,-leaf.size,0);airContext.fill();
        airContext.strokeStyle='#e8e6b3';airContext.lineWidth=.45;airContext.beginPath();airContext.moveTo(-leaf.size,0);airContext.lineTo(leaf.size,0);airContext.stroke();airContext.restore();
      }
    }
    function draw(){
      if(gl){gl.useProgram(program);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform3f(uniforms.sphere,bounds.x*dpr,(height-bounds.y)*dpr,bounds.r*dpr);gl.uniform1f(uniforms.clock,cloudClock);gl.drawArrays(gl.TRIANGLES,0,6);}
      else drawFallback();
      drawAir();
    }
    function tick(now){
      frame=null;if(destroyed||paused||!visible||document.hidden)return;
      if(!last||now-last>=1000/fps){
        const dt=last?Math.min((now-last)/1000,.15):0;last=now;time+=dt;
        wind+=(targetWind-wind)*Math.min(1,dt*2.5);cloudClock+=dt*(.13+wind*1.7);
        if(airContext)for(const leaf of leaves){
          const gust=1+.3*Math.sin(time*.67+leaf.phase);
          leaf.x+=dt*(3+wind*22)*leaf.depth*gust/airWidth;
          leaf.y+=dt*(2+Math.sin(time*.5+leaf.phase)*5+wind*1.5)*leaf.depth/airHeight;
          if(leaf.x>1.06){leaf.x=-.04;leaf.y=random();}
          if(leaf.y>1.04)leaf.y=-.02;if(leaf.y<-.04)leaf.y=1.02;
        }
        draw();
      }
      frame=requestAnimationFrame(tick);
    }
    function sync(){
      if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;
      const running=!paused&&visible&&!document.hidden&&!destroyed;
      canvas.dataset.weatherState=running?'running':paused?'paused':'offscreen';
      if(running)frame=requestAnimationFrame(tick);
    }
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'80px'}):null;
    observer?.observe(canvas);
    const sizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;sizeObserver?.observe(canvas);
    const onReduced=event=>{paused=event.matches;sync();};
    addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',onReduced);
    image?.addEventListener('load',resize,{once:true});resize();sync();
    return{pause(value){paused=Boolean(value);sync();},setWind(value){targetWind=Math.max(0,Math.min(1.5,value));},destroy(){destroyed=true;sync();observer?.disconnect();sizeObserver?.disconnect();removeEventListener('resize',resize);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onReduced);},get canvas(){return canvas;}};
  }
  window.EmeraldWeather={create};
  const portal=document.querySelector('.emerald-planet-surface');
  if(portal&&!portal.querySelector('canvas')){
    const canvas=document.createElement('canvas');canvas.className='emerald-portal-weather';canvas.setAttribute('aria-hidden','true');portal.appendChild(canvas);
    create(canvas,{thumbnail:true,wind:.65});
  }
})();
