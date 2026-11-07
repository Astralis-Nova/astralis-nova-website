/* Continuous photographic motion, with feathered masks protecting the stonework. */
(() => {
  'use strict';
  const W=1672,H=941;
  function fallback(image,bethany) {
    const canvas=document.createElement('canvas'); canvas.width=960; canvas.height=540;
    const ctx=canvas.getContext('2d'); if(!ctx) return null;
    const patch=document.createElement('canvas'); patch.width=960; patch.height=540;
    const pc=patch.getContext('2d');
    const regions=bethany?[[650,70,350,90,2],[1260,40,250,80,2],[860,230,110,90,2]]:
      [[1080,525,145,30,0],[1120,575,155,35,0],[1090,630,170,42,0],
       [990,699,260,40,0],[1140,749,330,48,0],[1380,810,370,62,0],[1380,910,390,100,0],
       [666,592,52,101,1],[487,545,31,70,1],[1222,436,30,51,1],[858,428,25,27,1],
       [1375,704,38,36,1],[986,631,29,21,1],[1095,852,28,50,1],
       [450,250,180,70,4],[1520,325,145,55,4],[681,686,100,30,5],[1225,481,100,27,5],
       [100,780,150,230,3],[600,785,170,175,3],[1510,840,205,150,3],
       [300,500,120,88,3],[436,401,95,65,3],[1430,608,150,70,3],
       [330,65,225,90,3],[221,260,40,150,3]];
    return {backend:'canvas',draw(time) {
      const sx=960/W,sy=540/H;
      ctx.setTransform(sx,0,0,sy,0,0);ctx.drawImage(image,0,0,W,H);
      for(const [x,y,rx,ry,kind] of regions) {
        const left=Math.max(0,x-rx-2),top=Math.max(0,y-ry-2);
        const width=Math.min(W,x+rx+2)-left,height=Math.min(H,y+ry+2)-top;
        pc.setTransform(sx,0,0,sy,0,0);pc.clearRect(left,top,width,height);
        pc.save();pc.beginPath();pc.rect(left,top,width,height);pc.clip();
        pc.globalCompositeOperation='source-over';pc.globalAlpha=1;
        if(kind<2) {
          const phase=time*.3%1,other=(phase+.5)%1,blend=Math.abs(phase-.5)*2;
          const flowX=kind===1?0:18,flowY=kind===1?63:26;
          pc.globalCompositeOperation='lighter';pc.globalAlpha=1-blend;
          pc.drawImage(image,flowX*phase,flowY*phase,W,H);
          pc.globalAlpha=blend;pc.drawImage(image,flowX*other,flowY*other,W,H);
        } else {
          const dx=Math.sin(time*(kind===4?.16:.85)+x*.008)*(kind===4?15:7);
          const dy=Math.cos(time*.65+y*.01)*(kind===5?3:1.8);
          pc.drawImage(image,dx,dy,W,H);
        }
        pc.globalAlpha=1;pc.globalCompositeOperation='destination-in';
        pc.translate(x,y);pc.scale(rx,ry);
        const mask=pc.createRadialGradient(0,0,.45,0,0,1);
        mask.addColorStop(0,'#000');mask.addColorStop(1,'#0000');
        pc.fillStyle=mask;pc.fillRect(-2,-2,4,4);pc.restore();
        ctx.drawImage(patch,left*sx,top*sy,width*sx,height*sy,left,top,width,height);
      }
      return canvas;
    }};
  }

  function create(image,options={}) {
    const bethany=options.scene==='bethany';
    const canvas=document.createElement('canvas'); canvas.width=window.innerWidth<700?960:1440; canvas.height=Math.round(canvas.width*H/W);
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
    const softFallback=fallback(image,bethany); if(!gl) { console.warn('Father’s House: WebGL unavailable; using canvas motion.'); return softFallback; }
    const vertexSource=`attribute vec2 position; varying vec2 uv;
      void main(){uv=vec2((position.x+1.0)*.5,(1.0-position.y)*.5);gl_Position=vec4(position,0.0,1.0);}`;
    const fragmentSource=`
      precision highp float; varying vec2 uv;
      uniform sampler2D photograph; uniform float time; uniform float bethany;
      const vec2 size=vec2(1672.0,941.0);
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+1.0),f.x),f.y);}
      float ellipse(vec2 p,vec2 c,vec2 r){return 1.0-smoothstep(.55,1.0,length((p-c)/r));}
      float box(vec2 p,vec4 b){vec2 e=min(p-b.xy,b.zw-p);return smoothstep(0.0,14.0,min(e.x,e.y));}
      vec3 photo(vec2 p){return texture2D(photograph,clamp(p/size,.001,.999)).rgb;}
      void main(){
        vec2 p=uv*size;vec3 base=photo(p);
        float gust=sin(time*.85+p.x*.008)+.35*sin(time*1.37+p.y*.017);
        if(bethany>.5){
          float leaves=ellipse(p,vec2(650.0,80.0),vec2(380.0,100.0));
          leaves=max(leaves,ellipse(p,vec2(1260.0,50.0),vec2(300.0,110.0)));
          leaves=max(leaves,ellipse(p,vec2(860.0,245.0),vec2(130.0,110.0)));
          vec3 color=photo(p+vec2(gust*5.0,sin(time+p.x*.01)*1.6)*leaves);
          float sun=ellipse(p,vec2(1400.0,90.0),vec2(450.0,320.0));
          color+=vec3(1.0,.77,.4)*sun*(.008+.007*sin(time*.38));gl_FragColor=vec4(color,1.0);return;
        }
        float falls=box(p,vec4(616.0,495.0,721.0,693.0));
        falls=max(falls,box(p,vec4(456.0,477.0,521.0,615.0)));
        falls=max(falls,box(p,vec4(1192.0,388.0,1255.0,484.0)));
        falls=max(falls,box(p,vec4(1334.0,390.0,1418.0,439.0)));
        falls=max(falls,box(p,vec4(1480.0,385.0,1518.0,420.0)));
        falls=max(falls,box(p,vec4(830.0,398.0,885.0,458.0)));
        falls=max(falls,box(p,vec4(1330.0,671.0,1407.0,739.0)));
        falls=max(falls,box(p,vec4(952.0,610.0,1014.0,649.0)));
        falls=max(falls,box(p,vec4(1084.0,680.0,1165.0,713.0)));
        falls=max(falls,box(p,vec4(1060.0,805.0,1123.0,895.0)));
        float river=ellipse(p,vec2(1080.0,525.0),vec2(170.0,40.0));
        river=max(river,ellipse(p,vec2(1120.0,574.0),vec2(170.0,45.0)));
        river=max(river,ellipse(p,vec2(1090.0,630.0),vec2(190.0,60.0)));
        river=max(river,ellipse(p,vec2(990.0,699.0),vec2(300.0,55.0)));
        river=max(river,ellipse(p,vec2(1140.0,749.0),vec2(380.0,70.0)));
        river=max(river,ellipse(p,vec2(1380.0,808.0),vec2(420.0,85.0)));
        river=max(river,ellipse(p,vec2(1380.0,900.0),vec2(430.0,145.0)));
        float cyan=smoothstep(.78,.97,base.b/(base.g+.001))*smoothstep(.99,1.15,base.g/(base.r+.001));
        float foam=smoothstep(.65,.89,min(base.r,min(base.g,base.b)));river*=max(cyan,foam*.75);
        float plants=ellipse(p,vec2(100.0,780.0),vec2(155.0,235.0));
        plants=max(plants,ellipse(p,vec2(600.0,785.0),vec2(175.0,185.0)));
        plants=max(plants,ellipse(p,vec2(1510.0,840.0),vec2(215.0,160.0)));
        plants=max(plants,ellipse(p,vec2(300.0,500.0),vec2(130.0,95.0)));
        plants=max(plants,ellipse(p,vec2(436.0,401.0),vec2(105.0,70.0)));
        plants=max(plants,ellipse(p,vec2(1430.0,608.0),vec2(160.0,80.0)));
        plants=max(plants,ellipse(p,vec2(330.0,65.0),vec2(235.0,100.0)));
        plants=max(plants,ellipse(p,vec2(221.0,260.0),vec2(42.0,160.0)));
        float clouds=ellipse(p,vec2(450.0,250.0),vec2(185.0,73.0));
        clouds=max(clouds,ellipse(p,vec2(1530.0,323.0),vec2(150.0,60.0)));
        clouds=max(clouds,ellipse(p,vec2(1460.0,419.0),vec2(170.0,38.0)));
        float mist=ellipse(p,vec2(681.0,686.0),vec2(110.0,35.0));
        mist=max(mist,ellipse(p,vec2(1225.0,481.0),vec2(110.0,32.0)));
        mist=max(mist,ellipse(p,vec2(1390.0,738.0),vec2(100.0,25.0)));
        vec2 offset=vec2(gust*7.5,sin(time*1.1+p.x*.012)*2.2)*plants;
        offset+=vec2(sin(time*.16)*15.0,cos(time*.19+p.x*.002)*2.0)*clouds;
        offset+=vec2(sin(time*.65+p.x*.01)*9.0,cos(time*.52)*3.0)*mist;
        vec3 color=photo(p+offset);float depth=clamp((p.y-480.0)/460.0,0.0,1.0);
        float turbulence=noise(p*vec2(.055,.023)-vec2(time*.12,time*.8))-.5;
        float phase=fract(time*.3),other=fract(phase+.5),blend=abs(phase-.5)*2.0;
        vec2 riverFlow=vec2(mix(-7.0,24.0,depth),12.0+depth*26.0);
        vec2 direction=mix(riverFlow,vec2(turbulence*3.0,63.0),falls);
        vec2 ripple=vec2(sin(p.y*.15-time*2.4)*1.7,turbulence*3.4);
        vec3 flow=mix(photo(p-direction*phase+ripple),photo(p-direction*other+ripple),blend);
        color=mix(color,flow,max(river,falls)*.97);
        float sparkle=noise(p*vec2(.07,.13)-vec2(time*.3,time*.7));
        color+=vec3(.16,.2,.2)*smoothstep(.75,.96,sparkle)*river*(.3+.7*depth);
        float spray=noise(p*vec2(.018,.06)+vec2(time*.25,-time*.45));color+=vec3(.1,.12,.13)*spray*mist;
        float windows=box(p,vec4(600.0,240.0,1350.0,405.0))*smoothstep(1.3,2.2,base.r/(base.b+.01))*smoothstep(.4,.9,base.r);
        color+=vec3(.04,.022,.004)*windows*(.5+.5*sin(time*.38+p.x*.045));
        float door=ellipse(p,vec2(1037.0,367.0),vec2(120.0,185.0));
        color+=vec3(1.0,.68,.27)*(.018+.015*sin(time*.43)+.007*sin(time*.71))*door;
        float reflection=ellipse(p,vec2(1054.0,730.0),vec2(60.0,230.0))*river;
        color+=vec3(.055,.041,.015)*reflection*(.5+.5*sin(time*1.1+p.y*.055));gl_FragColor=vec4(color,1.0);
      }`;
    function initialize(){
      function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('Father’s House shader:',gl.getShaderInfoLog(s));gl.deleteShader(s);return null;}return s;}
      const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);if(!vs||!fs)return null;
      const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(program,'photograph'),0);
      gl.uniform1f(gl.getUniformLocation(program,'bethany'),bethany?1:0);const clock=gl.getUniformLocation(program,'time');
      return time=>{gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(clock,time);gl.drawArrays(gl.TRIANGLES,0,6);return canvas;};
    }
    let render=initialize();canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();render=null;});
    canvas.addEventListener('webglcontextrestored',()=>{render=initialize();});
    return {get backend(){return render?'webgl':'canvas';},draw(time){return render?render(time):softFallback&&softFallback.draw(time);}};
  }
  window.FathersHouseWater={create};
})();
