/* Local skinning keeps the original AC texture while its joints move separately. */
((root) => {
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  // Coordinates are in the head-stabilized atlas, not the raw source cells.
  // Near/far forelegs and the two overlapping rear legs get separate chains.
  const frontFrames=[
    [[[244,300],[239,330],[235,351]],[[291,296],[300,317],[289,330]],[[252,319],[257,338],[255,347]],[[246,326],[247,344],[246,353]]],
    [[[245,300],[249,330],[246,351]],[[294,297],[306,320],[300,333]],[[259,322],[266,339],[265,347]],[[251,327],[255,344],[254,354]]],
    [[[246,300],[248,331],[244,352]],[[291,297],[302,318],[296,332]],[[257,321],[264,338],[264,346]],[[250,326],[253,343],[251,354]]],
    [[[250,302],[260,334],[252,352]],[[305,300],[319,321],[307,335]],[[265,323],[275,340],[274,348]],[[258,329],[266,347],[265,356]]],
    [[[253,302],[262,332],[257,352]],[[311,299],[325,323],[315,339]],[[271,322],[282,340],[280,350]],[[263,328],[270,346],[269,357]]],
    [[[247,299],[252,331],[246,350]],[[297,296],[307,317],[299,331]],[[260,320],[268,337],[267,346]],[[253,325],[258,342],[256,352]]]
  ];
  const sideLimbs=[[[317,293],[340,309],[353,324]],[[337,282],[357,296],[367,309]],
    [[254,323],[237,350],[231,370]],[[275,316],[277,336],[280,353]]];
  function limbAnchors(front,weights){
    if(!front)return sideLimbs;
    return frontFrames[0].map((chain,i)=>chain.map((point,j)=>point.map((_,axis)=>
      weights.reduce((sum,[frame,weight])=>sum+frontFrames[frame][i][j][axis]*weight,0))));
  }
  function limbOffset(x,y,pose){
    const limbs=pose.limbAnchors||(pose.frontView?frontFrames[0]:sideLimbs);
    let dx=0,dy=0,total=0;
    limbs.forEach(([hip,ankle,toe],i)=>{
      const joint=pose.limbs?.[i];if(!joint)return;
      const weight=Math.exp(-(((x-ankle[0])/17)**2))*smooth(hip[1],ankle[1],y)*(1-smooth(toe[1]+5,toe[1]+20,y));
      if(weight<.0001)return;
      // Mirrored anatomical axes: elbows tuck in; wrists counter-rotate.
      // The palm follows the forearm instead of turning both claws the same way.
      const handed=pose.frontView?(i%2===0?1:-1):1;
      const knee=joint.knee*handed*Math.PI/180,lower=joint.ankle*handed*Math.PI/180;
      const lowerWeight=smooth(ankle[1]-6,toe[1],y);
      const claw=smooth(toe[1]-10,toe[1]+3,y)*Math.exp(-(((x-toe[0])/15)**2));
      const localX=x-ankle[0],localY=y-ankle[1];
      const footX=localX*Math.cos(lower)-localY*Math.sin(lower);
      const footY=localX*Math.sin(lower)+localY*Math.cos(lower);
      const px=x+(footX-localX)*lowerWeight,py=y+(footY-localY)*lowerWeight;
      dx+=((px-hip[0])*Math.cos(knee)-(py-hip[1])*Math.sin(knee)+hip[0]-x
        +(x-toe[0])*(.5-joint.curl)*.34*claw)*weight;
      dy+=((px-hip[0])*Math.sin(knee)+(py-hip[1])*Math.cos(knee)+hip[1]-y
        -joint.curl*5.5*claw)*weight;
      total+=weight;
    });
    return [dx/Math.max(1,total),dy/Math.max(1,total)];
  }
  function deform(x,y,seconds,pose) {
    const limb=limbOffset(x,y,pose);
    if(pose.frontView){
      const middle=Math.exp(-(((x-255)/90)**2));
      const chest=middle*Math.exp(-(((y-305)/65)**2));
      const neck=middle*(1-smooth(240,310,y));
      const reach=smooth(325,470,y),tail=reach*reach*middle;
      const breath=(x-255)*.015*Math.sin(seconds*1.7)*chest;
      const wing=(1-middle)*(1-smooth(250,330,y));
      const head=smooth(266,291,x)*smooth(160,190,y)*(1-smooth(226,252,y));
      const headAngle=pose.head*Math.PI/180;
      const hx=(-(y-224)*Math.sin(headAngle)+(x-285)*(Math.cos(headAngle)-1))*head;
      const hy=((x-285)*Math.sin(headAngle)+(y-224)*(Math.cos(headAngle)-1))*head;
      return [x+hx+limb[0]+breath+Math.sin(seconds*2.05-reach*2.5)*(4+reach*12)*tail+pose.neck*neck+pose.wrist*wing*(x<255?-1:1),
        y+hy+limb[1]+pose.bob*.7+pose.chest*chest-pose.chest*.65*neck+Math.sin(seconds*1.4-reach*2)*3*tail+pose.wrist*.45*wing];
    }
    let dx=limb[0],dy=limb[1]+pose.bob*.7;
    const chest=Math.exp(-(((x-292)/68)**2)-((y-298)/64)**2);
    dx+=(x-292)*.008*Math.sin(seconds*1.7)*chest;
    dy+=pose.chest*chest;
    const neck=smooth(305,395,x)*(1-smooth(290,340,y));
    const angle=pose.neck*Math.PI/180;
    dx+=(-(y-280)*Math.sin(angle)+(x-315)*(Math.cos(angle)-1))*neck;
    dy+=((x-315)*Math.sin(angle)+(y-280)*(Math.cos(angle)-1)-pose.chest*.7)*neck;
    const tail=(1-smooth(185,270,x))*smooth(285,332,y);
    const distance=clamp((265-x)/245);
    dx+=Math.sin(seconds*1.7-distance*2)*2*tail;
    dy+=Math.sin(seconds*2.05-distance*3.3)*(4+21*distance*distance)*tail;
    // Wrist flex is small and delayed; the atlas supplies the main power stroke.
    const wing=(1-smooth(230,305,x))*(1-smooth(200,270,y));
    dx+=pose.wrist*wing;dy+=pose.wrist*.45*wing;
    return [x+dx,y+dy];
  }
  function mesh(xs,ys){
    const vertices=[],indices=[],columns=xs.length-1,rows=ys.length-1;
    for(const y of ys)for(const x of xs)vertices.push([x,y]);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=y*(columns+1)+x,b=a+1,c=a+columns+2,d=a+columns+1;indices.push(a,b,c,a,c,d);
    }
    return {vertices,indices};
  }
  // Extra vertices around knees, ankles, claws and neck keep their movement local.
  const {vertices,indices}=mesh([0,32,64,96,128,160,190,210,225,240,255,270,285,300,315,330,350,380,420,460,490,512],
    [0,32,64,96,128,160,185,205,225,245,270,290,305,320,335,350,365,380,405,440,475,512]);
  const cpuMesh=mesh([0,85,170,205,220,232,244,256,268,280,292,304,318,335,355,380,440,512],
    [0,85,170,205,235,270,290,302,314,326,338,350,362,374,395,450,512]);
  function positions(seconds,pose) { return vertices.map(([x,y])=>deform(x,y,seconds,pose)); }
  const forwardAnchors=[[320,250],[307,249],[312,250],[306,201],[302,204],[307,204]];
  const forwardEyes=Array.from({length:6},()=>[293,203]);
  function face(ctx,seconds,pose,weights){
    if(!pose.frontView)return null;
    const center=weights.reduce((v,[frame,weight])=>[v[0]+forwardEyes[frame][0]*weight,v[1]+forwardEyes[frame][1]*weight],[0,0]);
    const eye=deform(...center,seconds,pose),blink=pose.blink||0,gaze=pose.gaze||[0,0];
    ctx.save();ctx.globalCompositeOperation='source-atop';ctx.translate(...eye);ctx.rotate(.55);
    ctx.beginPath();ctx.ellipse(0,0,3.6,2.15,0,0,Math.PI*2);ctx.clip();
    if(blink<.95){
      ctx.globalAlpha=.8*(1-blink);ctx.fillStyle='#120a0c';ctx.beginPath();ctx.ellipse(gaze[0],gaze[1],1.05,1.65,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.7*(1-blink);ctx.fillStyle='#ffe9c3';ctx.beginPath();ctx.ellipse(-.9+gaze[0]*.4,-.6,.55,.4,0,0,Math.PI*2);ctx.fill();
    }
    if(blink>.001){
      ctx.globalAlpha=1;ctx.fillStyle='#9b2523';const edge=-2.5+5.5*blink;
      ctx.fillRect(-4,-3,8,edge+3);ctx.lineWidth=.85;ctx.strokeStyle='#d64c3d';ctx.beginPath();ctx.moveTo(-3.5,edge);ctx.quadraticCurveTo(0,edge+.4,3.5,edge);ctx.stroke();
    }
    ctx.restore();return {eye,blink,gaze};
  }
  function createGPU(canvas,image,front=false) {
    let gl;
    try { gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true}); } catch(_){return null;}
    if(!gl || typeof gl.createShader!=='function')return null;
    const resources=[];
    try {
      canvas.width=canvas.height=512;
      const compile=(type,source)=>{const shader=gl.createShader(type);resources.push(['shader',shader]);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('shader');return shader;};
      const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(aPosition.x/256.0-1.0,1.0-aPosition.y/256.0,0.,1.);}');
      const fragment=compile(gl.FRAGMENT_SHADER,`precision highp float;
        uniform sampler2D uAtlas;uniform vec3 uFrames;uniform vec3 uWeights;
        uniform vec2 uShift0;uniform vec2 uShift1;uniform vec2 uShift2;varying vec2 vUV;
        vec4 cell(float frame,vec2 shift){vec2 p=vUV*512.+shift;
          if(p.x<0.||p.y<0.||p.x>511.||p.y>511.)return vec4(0.);
          vec2 uv=(vec2(mod(frame,3.),floor(frame/3.))*512.+p+.5)/vec2(1536.,1024.);
          vec4 color=texture2D(uAtlas,vec2(uv.x,1.-uv.y));return vec4(color.rgb*color.a,color.a);}
        void main(){gl_FragColor=cell(uFrames.x,uShift0)*uWeights.x+cell(uFrames.y,uShift1)*uWeights.y+cell(uFrames.z,uShift2)*uWeights.z;}`);
      const program=gl.createProgram();resources.push(['program',program]);gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');gl.useProgram(program);
      const buffer=(type,data,usage)=>{const value=gl.createBuffer();resources.push(['buffer',value]);gl.bindBuffer(type,value);gl.bufferData(type,data,usage);return value;};
      const position=buffer(gl.ARRAY_BUFFER,new Float32Array(vertices.length*2),gl.DYNAMIC_DRAW);
      const attribute=(name)=>{const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);};attribute('aPosition');
      const uv=buffer(gl.ARRAY_BUFFER,new Float32Array(vertices.flat().map(v=>v/512)),gl.STATIC_DRAW);attribute('aUV');
      const index=buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
      const texture=gl.createTexture();resources.push(['texture',texture]);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      if(gl.getError()!==gl.NO_ERROR)throw Error('texture');
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program,'uAtlas'),0);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.viewport(0,0,512,512);
      const uniforms={};for(const n of ['uFrames','uWeights','uShift0','uShift1','uShift2'])uniforms[n]=gl.getUniformLocation(program,n);
      const shifts=front?forwardAnchors.map(([x,y])=>[x-314,y-240]):[[0,0],[7,4],[4,-2],[0,-2],[6,2],[10,2]];
      let lost=false;
      const onLost=event=>{event.preventDefault();lost=true;};canvas.addEventListener('webglcontextlost',onLost);
      return {draw(seconds,pose,weights){
        if(lost || gl.isContextLost())return false;
        const output=new Float32Array(positions(seconds,pose).flat());
        gl.bindBuffer(gl.ARRAY_BUFFER,position);gl.bufferSubData(gl.ARRAY_BUFFER,0,output);
        const entries=[...weights];while(entries.length<3)entries.push([0,0]);
        gl.uniform3f(uniforms.uFrames,...entries.map(v=>v[0]));gl.uniform3f(uniforms.uWeights,...entries.map(v=>v[1]));
        entries.forEach(([frame],i)=>gl.uniform2f(uniforms['uShift'+i],...shifts[frame]));
        gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);return true;
      },destroy(){canvas.removeEventListener('webglcontextlost',onLost);for(const[type,value]of resources)gl['delete'+type[0].toUpperCase()+type.slice(1)](value);}};
    } catch(_) {for(const[type,value]of resources)gl['delete'+type[0].toUpperCase()+type.slice(1)](value);return null;}
  }
  function drawCPU(ctx,texture,seconds,pose) {
    const {vertices,indices}=cpuMesh;
    const points=vertices.map(([x,y])=>deform(x,y,seconds,pose));ctx.clearRect(0,0,512,512);
    for(let i=0;i<indices.length;i+=3){
      const ids=indices.slice(i,i+3),s=ids.map(n=>vertices[n]),d=ids.map(n=>points[n]);
      const [a,b,c]=s,[u,v,w]=d,det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
      const m11=((v[0]-u[0])*(c[1]-a[1])-(w[0]-u[0])*(b[1]-a[1]))/det;
      const m21=((w[0]-u[0])*(b[0]-a[0])-(v[0]-u[0])*(c[0]-a[0]))/det;
      const m12=((v[1]-u[1])*(c[1]-a[1])-(w[1]-u[1])*(b[1]-a[1]))/det;
      const m22=((w[1]-u[1])*(b[0]-a[0])-(v[1]-u[1])*(c[0]-a[0]))/det;
      const cx=(u[0]+v[0]+w[0])/3,cy=(u[1]+v[1]+w[1])/3;
      const expanded=d.map(([x,y])=>{const r=Math.hypot(x-cx,y-cy)||1;return [x+(x-cx)/r*.45,y+(y-cy)/r*.45];});
      ctx.save();ctx.beginPath();ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();
      ctx.setTransform(m11,m12,m21,m22,u[0]-m11*a[0]-m21*a[1],u[1]-m12*a[0]-m22*a[1]);
      const minX=Math.max(0,Math.min(...s.map(p=>p[0]))-1),minY=Math.max(0,Math.min(...s.map(p=>p[1]))-1);
      const sw=Math.min(512,Math.max(...s.map(p=>p[0]))+1)-minX,sh=Math.min(512,Math.max(...s.map(p=>p[1]))+1)-minY;
      ctx.drawImage(texture,minX,minY,sw,sh,minX,minY,sw,sh);ctx.restore();
    }
  }
  root.AstralisDragonPuppet={forwardAnchors,forwardEyes,limbAnchors,limbOffset,face,deform,positions,vertices,indices,cpuMesh,createGPU,drawCPU};
})(typeof window==='undefined'?globalThis:window);
