(() => {
'use strict';
const section=document.createElement('section');
section.className='creation-vista';
section.innerHTML='<p class="eyebrow">The wonder of creation</p><h2>A Living World</h2><div class="creation-frame" role="img" aria-label="A heavenly garden with a rainbow, crystalline flowers, waterfalls, a whale and a star-filled sky"><img class="creation-image" src="assets/heavenly-garden.webp" alt="" decoding="async"><canvas class="creation-water" aria-hidden="true"></canvas><canvas class="creation-life" aria-hidden="true"></canvas></div>';
const anchor=document.querySelector('.lazarus-section');
if(!anchor)return;
const style=document.createElement('style');
style.textContent=`.creation-vista{max-width:1320px;margin:48px auto;padding:0 16px;text-align:center}.creation-vista h2{font-size:clamp(1.65rem,4vw,2.8rem);margin:.3em 0 .7em;color:#fff0c4}.creation-frame{position:relative;overflow:hidden;isolation:isolate;border-radius:20px;border:1px solid rgba(255,227,175,.36);box-shadow:0 20px 70px #030714b0,0 0 24px #f5c07522;aspect-ratio:1672/941;background:#101930}.creation-frame img,.creation-frame canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.creation-frame canvas{pointer-events:none}.creation-water{opacity:0}.creation-frame.gl-ready .creation-water{opacity:1}.creation-life{z-index:2}.creation-vista[hidden]{display:none}@media(max-width:600px){.creation-vista{margin:32px auto;padding:0 8px}.creation-frame{border-radius:12px}}`;
document.head.append(style);
section.hidden=true;anchor.before(section);
const img=section.querySelector('img'),frame=section.querySelector('.creation-frame'),canvas=section.querySelector('.creation-water'),fx=section.querySelector('.creation-life'),ctx=fx.getContext('2d');
const motion=document.getElementById('motionToggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let started=false,visible=true,last=0,elapsed=0,gl=null,program=null,tex=null,uniform=null;
const vertex=`attribute vec2 a; varying vec2 uv; void main(){gl_Position=vec4(a,0.,1.);uv=vec2(a.x*.5+.5, .5-a.y*.5);}`;
const fragment=`precision mediump float;
uniform sampler2D image;uniform float t;varying vec2 uv;
float mask(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.2,1.,length((p-c)/r));}
void main(){
 vec2 p=uv,q=p;
 float sea=mask(p,vec2(.84,.68),vec2(.26,.24));
 float tide=sin(p.y*105.+p.x*12.-t*2.2)+.36*sin(p.y*174.-p.x*18.-t*3.7);
 q.x+=sea*.0034*tide;q.y+=sea*.0023*sin(p.x*42.+p.y*48.-t*2.4);
 float f1=mask(p,vec2(.515,.345),vec2(.086,.12));
 float f2=mask(p,vec2(.42,.58),vec2(.15,.12));
 float f3=mask(p,vec2(.58,.49),vec2(.08,.10));
 float falls=max(f1,max(f2,f3));
 q.y-=falls*.006*sin(p.y*180.-t*6.0);
 q.x+=falls*.0018*sin(p.y*90.-t*4.2);
 float canopy=mask(p,vec2(.21,.10),vec2(.29,.19));
 float garden=mask(p,vec2(.13,.82),vec2(.20,.20));
 float trees=mask(p,vec2(.36,.40),vec2(.19,.15));
 float blossoms=mask(p,vec2(.49,.52),vec2(.11,.12));
 float wind=sin(t*.85+p.x*9.+p.y*5.)+.32*sin(t*1.8+p.y*18.);
 q.x+=(canopy*.0045+trees*.0025+garden*.003+blossoms*.003)*wind;
 q.y+=(canopy+garden+trees+blossoms)*.0014*sin(t*1.1+p.x*15.);
 float sky=mask(p,vec2(.77,.14),vec2(.29,.19));
 float cloud=mask(p,vec2(.73,.33),vec2(.30,.12));
 q.x+=sky*.003*sin(t*.20)+cloud*.006*sin(t*.15+p.y*13.);
 q.y+=sky*.0018*sin(t*.18+p.x*4.);
 float whale=mask(p,vec2(.84,.67),vec2(.13,.11));
 q.y+=whale*.0035*sin(t*.65+p.x*12.);
 q.x+=whale*.002*sin(t*.45+p.y*9.);
 vec3 color=texture2D(image,clamp(q,vec2(.001),vec2(.999))).rgb;
 float glitter=pow(max(0.,sin(p.x*235.+p.y*155.-t*3.2)*sin(p.y*181.-t*2.7)),7.);
 color+=vec3(.15,.22,.25)*glitter*sea;
 float cascade=pow(max(0.,sin(p.y*130.-t*7.+sin(p.x*330.)*2.)),6.);
 color+=vec3(.17,.20,.22)*cascade*falls*.32;
 float prism=mask(p,vec2(.095,.49),vec2(.13,.18))+mask(p,vec2(.48,.80),vec2(.07,.13));
 color+=vec3(.035,.025,.065)*prism*(.5+.5*sin(t*1.2+p.x*45.));
 gl_FragColor=vec4(color,1.);
}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function initGL(){try{gl=canvas.getContext('webgl',{alpha:false,antialias:false});if(!gl)return;program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1i(gl.getUniformLocation(program,'image'),0);uniform=gl.getUniformLocation(program,'t');frame.classList.add('gl-ready');}catch(e){gl=null;frame.classList.remove('gl-ready');}}
const random=(a,b)=>a+Math.random()*(b-a);
const flies=Array.from({length:37},()=>({x:random(.025,.52),y:random(.48,.94),phase:random(0,6.28),speed:random(.35,.9),r:random(.8,2.2)}));
const stars=Array.from({length:34},()=>({x:random(.60,.99),y:random(.015,.22),phase:random(0,6.28),r:random(.45,1.1)}));
function resize(){const r=frame.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);if(!r.width)return;canvas.width=fx.width=Math.max(1,Math.round(r.width*d));canvas.height=fx.height=Math.max(1,Math.round(r.height*d));if(gl)gl.viewport(0,0,canvas.width,canvas.height);}
function dot(x,y,r,alpha,color){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=r*5;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
function bird(x,y,s,t){const flap=Math.sin(t*7);ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle='rgba(255,248,216,.88)';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-2-flap*4);ctx.quadraticCurveTo(-3,-5-flap*3,0,1);ctx.quadraticCurveTo(3,-5-flap*3,7,-2-flap*4);ctx.stroke();ctx.restore();}
function draw(t){if(gl){gl.useProgram(program);gl.uniform1f(uniform,t);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}if(!ctx)return;const w=fx.width,h=fx.height;ctx.clearRect(0,0,w,h);const k=w/1000;
 for(const f of flies){const x=(f.x+Math.sin(t*f.speed+f.phase)*.018+Math.sin(t*.29+f.phase)*.012)*w,y=(f.y+Math.cos(t*f.speed*.8+f.phase)*.017)*h;dot(x,y,f.r*k,.24+.75*Math.pow(.5+.5*Math.sin(t*1.5+f.phase),2),'#fff2a0');}
 for(const s of stars)dot(s.x*w,s.y*h,s.r*k,.14+.75*Math.pow(.5+.5*Math.sin(t*.9+s.phase),4),'#d9e7ff');
 for(let i=0;i<4;i++){let phase=(t*.012+i*.19)%1;bird((.14+phase*.56)*w,(.25+.045*Math.sin(phase*6+i))*h,k*(.65+i*.14),t+i);}
 // Traveling foam glints, softly fading at their ends instead of hard horizontal lines.
 for(let i=0;i<19;i++){let a=(t*.095+i*.137)%1;let x=(.70+.27*((i*.618)%1))*w,y=(.45+.08*a+.12*((i*.271)%1))*h;ctx.strokeStyle='rgba(210,248,255,'+(Math.sin(a*Math.PI)*.22)+')';ctx.lineWidth=1.1*k;ctx.beginPath();ctx.moveTo(x-9*k,y);ctx.quadraticCurveTo(x,y-2*k,x+11*k,y);ctx.stroke();}
}
function loop(now){const paused=reduced.matches||motion?.getAttribute('aria-pressed')==='true';if(visible&&!document.hidden&&!paused){if(last)elapsed+=Math.min((now-last)/1000,.05);draw(elapsed);}last=now;requestAnimationFrame(loop);}
function ready(){if(started||!img.naturalWidth)return;started=true;section.hidden=false;initGL();resize();draw(0);new ResizeObserver(()=>{resize();draw(elapsed);}).observe(frame);if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{rootMargin:'120px'}).observe(section);requestAnimationFrame(loop);}
img.addEventListener('load',ready,{once:true});img.addEventListener('error',()=>{section.hidden=true;},{once:true});if(img.complete)ready();
})();