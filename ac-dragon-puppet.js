/* Local skinning keeps the original AC texture while its joints move separately. */
((root) => {
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  function deform(x,y,seconds,pose) {
    let dx=0,dy=pose.bob*.7;
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
    const legs=smooth(316,356,y)*smooth(195,245,x)*(1-smooth(365,405,x));
    const tuck=pose.legs*Math.PI/180;
    dx+=(-(y-315)*Math.sin(tuck)+(x-295)*(Math.cos(tuck)-1))*legs;
    dy+=((x-295)*Math.sin(tuck)+(y-315)*(Math.cos(tuck)-1))*legs;
    // Wrist flex is small and delayed; the atlas supplies the main power stroke.
    const wing=(1-smooth(230,305,x))*(1-smooth(200,270,y));
    dx+=pose.wrist*wing;dy+=pose.wrist*.45*wing;
    return [x+dx,y+dy];
  }
  function mesh(columns,rows){
    const vertices=[],indices=[];
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)vertices.push([x*512/columns,y*512/rows]);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=y*(columns+1)+x,b=a+1,c=a+columns+2,d=a+columns+1;
      indices.push(a,b,c,a,c,d);
    }
    return {vertices,indices};
  }
  const {vertices,indices}=mesh(20,16),cpuMesh=mesh(8,6);
  function positions(seconds,pose) { return vertices.map(([x,y])=>deform(x,y,seconds,pose)); }
  function createGPU(canvas,image) {
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
      const shifts=[[0,0],[7,4],[4,-2],[0,-2],[6,2],[10,2]];
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
  root.AstralisDragonPuppet={deform,positions,vertices,indices,cpuMesh,createGPU,drawCPU};
})(typeof window==='undefined'?globalThis:window);
