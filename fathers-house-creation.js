(() => {
'use strict';
const anchor=document.querySelector('.lazarus-section');
if(!anchor)return;
const section=document.createElement('section');
section.className='creation-vista';
section.innerHTML='<p class="eyebrow">The wonder of creation</p><h2>A Living World</h2><p class="creation-status" style="margin:-.4em auto 1em;color:#d8e7ee;font:12px/1.4 system-ui;letter-spacing:.08em">LIVING WORLD · MOTION EDITION 4 <span class="creation-motion-state"></span></p><div class="creation-frame" role="img" aria-label="A heavenly garden with a rainbow, crystalline flowers, waterfalls, a whale and a star-filled sky"><img class="creation-image" src="assets/heavenly-garden.webp" alt="" decoding="async"><canvas class="creation-life" aria-hidden="true"></canvas></div>';
const style=document.createElement('style');
style.textContent=`.creation-vista{max-width:1320px;margin:48px auto;padding:0 16px;text-align:center}.creation-vista h2{font-size:clamp(1.65rem,4vw,2.8rem);margin:.3em 0 .7em;color:#fff0c4}.creation-frame{position:relative;overflow:hidden;isolation:isolate;border-radius:20px;border:1px solid rgba(255,227,175,.36);box-shadow:0 20px 70px #030714b0,0 0 24px #f5c07522;aspect-ratio:1672/941;background:#101930}.creation-frame img,.creation-frame canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.creation-frame canvas{pointer-events:none}.creation-life{z-index:2}.creation-vista[hidden]{display:none}@media(max-width:600px){.creation-vista{margin:32px auto;padding:0 8px}.creation-frame{border-radius:12px}}`;
document.head.append(style);section.hidden=true;anchor.before(section);
const img=section.querySelector('img'),frame=section.querySelector('.creation-frame'),fx=section.querySelector('canvas'),ctx=fx.getContext('2d');
const motion=document.getElementById('motionToggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let started=false,visible=true,last=0,elapsed=0,raf=0,patches=[],whale=null,cleanArt=null,deerHead=null,W=0,H=0;
const random=(a,b)=>a+Math.random()*(b-a),tau=Math.PI*2;
// Only these small feathered photographic surfaces may move. The original art,
// architecture, rainbow, paths, rocks, shoreline, deer and whale never warp.
// All positions are normalized against the actual heavenly-garden artwork.
const regions=[
 // Waterfalls: narrow cores, never neighboring rock or buildings.
 {x:.494,y:.316,rx:.009,ry:.057,kind:'fall',speed:1.1},
 {x:.536,y:.333,rx:.007,ry:.054,kind:'fall',speed:.93},
 {x:.568,y:.346,rx:.009,ry:.052,kind:'fall',speed:1.25},
 {x:.562,y:.469,rx:.013,ry:.022,kind:'fall',speed:1.2},
 {x:.368,y:.522,rx:.017,ry:.014,kind:'fall',speed:.9},
 {x:.397,y:.573,rx:.020,ry:.027,kind:'fall',speed:1.05},
 // Small stretches of water; keep the horizon and the whale's outline intact.
 {x:.768,y:.484,rx:.078,ry:.019,kind:'sea',speed:.8},
 {x:.895,y:.501,rx:.085,ry:.017,kind:'sea',speed:1.1},
 {x:.679,y:.546,rx:.058,ry:.014,kind:'sea',speed:1.4},
 {x:.486,y:.639,rx:.048,ry:.019,kind:'sea',speed:.73},
 {x:.925,y:.475,rx:.072,ry:.027,kind:'sea',speed:1.12},
 {x:.810,y:.510,rx:.075,ry:.028,kind:'sea',speed:1.35},
 {x:.711,y:.525,rx:.047,ry:.017,kind:'sea',speed:.97},
 {x:.775,y:.377,rx:.067,ry:.036,kind:'cloud',speed:.35},
 {x:.928,y:.388,rx:.068,ry:.032,kind:'cloud',speed:.25},
 {x:.630,y:.310,rx:.050,ry:.028,kind:'cloud',speed:.29},
 // Branch tips and leaves only, not trunks or flowers in front of the path.
 {x:.288,y:.089,rx:.047,ry:.055,kind:'leaf',speed:.8},
 {x:.403,y:.048,rx:.051,ry:.037,kind:'leaf',speed:1.03},
 {x:.090,y:.090,rx:.027,ry:.056,kind:'leaf',speed:.67},
 {x:.157,y:.182,rx:.015,ry:.064,kind:'leaf',speed:1.17},
 {x:.404,y:.379,rx:.040,ry:.027,kind:'leaf',speed:.87},
 {x:.450,y:.447,rx:.028,ry:.022,kind:'leaf',speed:1.26},
 {x:.198,y:.919,rx:.031,ry:.034,kind:'leaf',speed:.73},
 {x:.072,y:.804,rx:.046,ry:.039,kind:'leaf',speed:.91},
 {x:.873,y:.085,rx:.057,ry:.045,kind:'galaxy',speed:.18},
 {x:.667,y:.185,rx:.039,ry:.036,kind:'galaxy',speed:.13}
];

 // Reference coordinates follow the original artwork, not the viewport.
 const RW=1648,RH=928;
 function surface(w=RW,h=RH){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function trace(g,pts){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
 function eraseArea(g,pts,dx,dy,soft=2){
   const mask=surface(),m=mask.getContext('2d');m.filter='blur('+soft+'px)';m.fillStyle='#fff';trace(m,pts);m.fill();
   const c=surface(),a=c.getContext('2d');a.drawImage(img,dx,dy,RW,RH);
   a.globalCompositeOperation='destination-in';a.drawImage(mask,0,0);g.drawImage(c,0,0);
 }
 function buildArtwork(){
   cleanArt=surface();const g=cleanArt.getContext('2d');g.drawImage(img,0,0,RW,RH);
   // Remove the three still doves using adjacent cloud/sky pixels before adding
   // their moving counterparts. Soft masks keep the original sky continuous.
   eraseArea(g,[[421,222],[439,215],[450,220],[450,235],[438,244],[421,240]],-23,7,3);
   eraseArea(g,[[453,243],[472,244],[483,258],[480,275],[463,276],[452,264]],-23,-9,3);
   eraseArea(g,[[579,248],[596,246],[611,254],[615,269],[605,283],[586,283],[576,268]],-33,9,4);
   // Preserve the real deer's head and neck as a separate photographic layer.
   const neck=[[369,473],[376,461],[377,451],[374,440],[372,435],[380,438],[387,444],[395,435],[401,439],[401,446],[397,454],[396,463],[390,469],[385,479],[379,483],[369,481]];
   const spr=surface(64,64),d=spr.getContext('2d');d.translate(-356,-425);trace(d,neck);d.clip();d.drawImage(img,0,0,RW,RH);
   deerHead=spr;
   eraseArea(g,neck,-48,0,1.8);
 }
 function animateDeer(t){
   if(!deerHead)return;
   // Small, irregular grazing glances with the neck attached at the shoulder.
   const x=W/RW,y=H/RH;
   ctx.save();ctx.scale(x,y);ctx.translate(375,477);
   const cycle=(t+1.4)%11,look=Math.sin(cycle*.72)*.055;
   const grazing=cycle>4&&cycle<8?Math.sin((cycle-4)/4*Math.PI)*.27:0;
   ctx.rotate(look+grazing);ctx.drawImage(deerHead,356-375,425-477);ctx.restore();
 }

function makePatch(r){
 const x=Math.round(r.x*W-r.rx*W),y=Math.round(r.y*H-r.ry*H);
 const w=Math.max(4,Math.round(r.rx*W*2)),h=Math.max(4,Math.round(r.ry*H*2));
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const mask=document.createElement('canvas');mask.width=w;mask.height=h;
 const mc=mask.getContext('2d');mc.save();mc.translate(w/2,h/2);mc.scale(w/2,h/2);
 const g=mc.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#fff');g.addColorStop(.40,'rgba(255,255,255,.9)');g.addColorStop(.75,'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=g;mc.fillRect(-1,-1,2,2);mc.restore();
 return {...r,x,y,w,h,c,mask,pc:c.getContext('2d')};
}
function resize(){
 const b=frame.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);
 if(!b.width||!ctx)return;
 W=Math.max(1,Math.round(b.width*d));H=Math.max(1,Math.round(b.height*d));
 if(fx.width===W&&fx.height===H&&patches.length)return;
 fx.width=W;fx.height=H;patches=regions.map(makePatch);whale=makeWhale();
}
// A separate photographic ocean window moves the whales as a rigid group.
// The mask is opaque over both animals and fades only in surrounding water.
function makeWhale(){
 const x=Math.round(W*.725),y=Math.round(H*.552),w=Math.round(W*.275),h=Math.round(H*.245);
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const mask=document.createElement('canvas');mask.width=w;mask.height=h;
 const mc=mask.getContext('2d');
 // Separate horizontal and vertical feathering, with no hard rectangular seam.
 let g=mc.createLinearGradient(0,0,w,0);
 g.addColorStop(0,'transparent');g.addColorStop(.095,'#fff');g.addColorStop(.94,'#fff');g.addColorStop(1,'transparent');
 mc.fillStyle=g;mc.fillRect(0,0,w,h);
 mc.globalCompositeOperation='destination-in';g=mc.createLinearGradient(0,0,0,h);
 g.addColorStop(0,'transparent');g.addColorStop(.09,'#fff');g.addColorStop(.90,'#fff');g.addColorStop(1,'transparent');
 mc.fillStyle=g;mc.fillRect(0,0,w,h);
 return {x,y,w,h,c,mask,pc:c.getContext('2d')};
}
function swimWhales(t){
 if(!whale)return;
 const {x,y,w,h,c,mask,pc}=whale,k=W/1648;
 pc.clearRect(0,0,w,h);pc.globalCompositeOperation='source-over';
 pc.save();pc.translate(w*.50,h*.42);
 pc.rotate(Math.sin(t*.62)*.019);
 pc.translate(-w*.50,-h*.42);
 pc.drawImage(cleanArt||img,-x+12*k*Math.sin(t*.43),-y+9*k*Math.sin(t*.62),W,H);
 pc.restore();pc.globalCompositeOperation='destination-in';pc.drawImage(mask,0,0);pc.globalCompositeOperation='source-over';
 ctx.drawImage(c,x,y);
}
function patch(p,t){
 const {pc,c,mask,x,y,w,h,kind,speed}=p,scale=W/1648;
 pc.clearRect(0,0,w,h);pc.globalCompositeOperation='source-over';
 // Move only a copy of the local photographic texture through a fixed soft mask.
 // Two overlapping, faded samples make the waterfall flow continuous.
 const sample=(dx,dy,a,angle=0)=>{
   pc.save();pc.globalAlpha=a;
   pc.translate(w/2,h/2);pc.rotate(angle);pc.translate(-w/2,-h/2);
   pc.drawImage(cleanArt||img,-x+dx,-y+dy,W,H);pc.restore();
 };
 if(kind==='fall'){
   const q=(t*speed*.85)%1;
   sample(0,q*24*scale,Math.sin(q*Math.PI)*.88);
   const z=(q+.5)%1;sample(0,z*24*scale,Math.sin(z*Math.PI)*.65);
 }else if(kind==='sea'){
   const q=(t*speed*.38)%1,z=(q+.5)%1;
   sample(8*scale*Math.sin(q*tau),q*11*scale,Math.sin(q*Math.PI)*.93);
   sample(8*scale*Math.sin(z*tau),z*11*scale,Math.sin(z*Math.PI)*.75);
 }else if(kind==='leaf'){
   const wind=Math.sin(t*speed*.85+p.x*14)+.33*Math.sin(t*1.9+p.y*17);
   sample(wind*6.0*scale,Math.sin(t*.8+p.y*12)*1.5*scale,.85,wind*.022);
 }else if(kind==='cloud'){
   sample(Math.sin(t*speed)*11*scale,Math.sin(t*speed*.6)*2*scale,.75);
 }else{
   sample(0,0,.72,Math.sin(t*speed)*.085);
 }
 pc.globalCompositeOperation='destination-in';pc.globalAlpha=1;pc.drawImage(mask,0,0);
 pc.globalCompositeOperation='source-over';
 ctx.drawImage(c,x,y);
}
const stars=Array.from({length:52},()=>({x:random(.62,.99),y:random(.005,.28),p:random(0,tau),r:random(.45,1.5)}));
const motes=Array.from({length:24},()=>({x:random(.035,.50),y:random(.50,.96),p:random(0,tau),s:random(.28,.7),r:random(.6,1.6)}));
const bubbles=Array.from({length:36},()=>({x:random(.74,.98),y:random(.70,.93),p:random(0,1),r:random(1.0,3.4),s:random(.065,.11)}));
const fish=Array.from({length:12},(_,i)=>({x:random(.71,.98),y:random(.76,.91),p:random(0,tau),s:random(.014,.027),r:random(2.0,3.7)}));
function glow(x,y,r,a,color){
 if(a<=0)return;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=r*3;ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fill();ctx.restore();
}
function mist(x,y,rx,ry,a){
 ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(227,249,255,'+a+')');g.addColorStop(1,'rgba(227,249,255,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function bird(x,y,s,t,bank=0){
 const flap=Math.sin(t*6.8),wing=5+6*flap;
 ctx.save();ctx.translate(x,y);ctx.rotate(bank);ctx.scale(s,s);
 const g=ctx.createLinearGradient(0,-11,0,7);g.addColorStop(0,'#fffdf3');g.addColorStop(.6,'#fff0ca');g.addColorStop(1,'#a6a6ab');ctx.fillStyle=g;
 // Separate wing silhouettes articulate at the shoulder; a pointed tail trails.
 for(const dir of [-1,1]){
   ctx.save();ctx.scale(dir,1);ctx.beginPath();ctx.moveTo(0,1);ctx.quadraticCurveTo(4,-wing*.8,13,-wing);
   ctx.quadraticCurveTo(11,-wing+4,8,2);ctx.lineTo(6,0);ctx.lineTo(4,4);ctx.quadraticCurveTo(2,3,0,1);ctx.fill();ctx.restore();
 }
 ctx.fillStyle='#fff6dd';ctx.beginPath();ctx.ellipse(0,1,2.5,4,0,0,tau);ctx.fill();
 ctx.beginPath();ctx.moveTo(-1.7,3);ctx.lineTo(-3,8);ctx.lineTo(3,7);ctx.lineTo(1.6,3);ctx.fill();
 ctx.restore();
}
// Visible water flow following the painted cascades. Thin, translucent droplets
// follow gravity, with irregular spacing and soft tapered ends.
const cascades=[
 [.494,.257,.014,.115,1.25], [.536,.263,.008,.123,1.15], [.569,.286,.009,.105,1.40],
 [.558,.449,.017,.045,1.05], [.365,.508,.020,.030,.95], [.397,.545,.022,.063,1.25]
];
function fallingWater(t){
 const k=W/1000;
 for(let n=0;n<cascades.length;n++){
  const [x,y,rx,len,rate]=cascades[n];
  for(let i=0;i<24;i++){
   const q=(t*rate*.55+i*.173+n*.19)%1;
   const lane=((i*.618033+n*.37)%1-.5)*rx*1.45;
   const px=(x+lane+Math.sin(i*2.1+t*.8)*rx*.12)*W;
   const py=(y+q*q*len)*H;
   const dy=(.008+.016*q)*H;
   const a=Math.sin(q*Math.PI)*(.18+.20*((i*.37)%1));
   const grad=ctx.createLinearGradient(px,py-dy,px,py);
   grad.addColorStop(0,'rgba(230,250,255,0)');grad.addColorStop(.64,'rgba(224,248,255,'+a*.6+')');grad.addColorStop(1,'rgba(255,255,245,'+a+')');
   ctx.strokeStyle=grad;ctx.lineWidth=Math.max(.55,k*(.65+(i%4)*.28));ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(px,py-dy);ctx.quadraticCurveTo(px+k*.65,py-dy*.4,px+k*.9,py);ctx.stroke();
  }
 }
}
function oceanGlints(t){
 const k=W/1000;
 // Wave crests drift along the real ocean surface, not across the garden or whale.
 for(let i=0;i<30;i++){
   const q=(t*.12+i*.147)%1,x=(.65+.34*((i*.618)%1)+.007*Math.sin(q*6.28))*W;
   const y=(.451+.088*((i*.271)%1)+q*.012)*H;
   const length=(5+(i%7)*2.2)*k,a=Math.sin(q*Math.PI)*.40;
   const g=ctx.createLinearGradient(x-length,y,x+length,y);
   g.addColorStop(0,'rgba(222,249,255,0)');g.addColorStop(.5,'rgba(222,249,255,'+a+')');g.addColorStop(1,'rgba(222,249,255,0)');
   ctx.strokeStyle=g;ctx.lineWidth=Math.max(.6,k*.95);ctx.beginPath();ctx.moveTo(x-length,y);ctx.quadraticCurveTo(x,y-1.5*k,x+length,y);ctx.stroke();
 }
}
function draw(t){
 if(!ctx||!W||!H)return;ctx.clearRect(0,0,W,H);if(cleanArt)ctx.drawImage(cleanArt,0,0,W,H);const k=W/1000;
 for(const p of patches)patch(p,t);
 swimWhales(t);
 animateDeer(t);
 fallingWater(t);
 oceanGlints(t);
 // Soft rising spray at the actual bases of the falls. No synthetic stripes.
 for(const [x,y,rx,ry] of [[.50,.375,.029,.022],[.55,.393,.034,.024],[.57,.492,.024,.015],[.41,.608,.033,.017]]){
   const drift=Math.sin(t*.45+x*12)*.004;
   mist((x+drift)*W,(y-.005*Math.sin(t*.73))*H,rx*W,ry*H,.11+.035*Math.sin(t*.8+x*16));
 }
 for(const s of stars)glow(s.x*W,s.y*H,s.r*k,.12+.52*Math.pow(.5+.5*Math.sin(t*.8+s.p),4),'#e4edff');
 for(const m of motes)glow((m.x+.012*Math.sin(t*m.s+m.p))*W,(m.y+.018*Math.cos(t*m.s*.8+m.p))*H,m.r*k,.12+.45*Math.pow(.5+.5*Math.sin(t*1.1+m.p),2),'#ffe9a4');
 // Uneven wave sparkle, with small dots rather than repeating bands.
 for(let i=0;i<40;i++){
   const a=(t*.19+i*.137)%1,x=.61+.38*((i*.61803)%1),y=.465+.065*((i*.27183)%1);
   glow((x+.006*Math.sin(t*.7+i))*W,y*H,(.45+(i%4)*.29)*k,Math.sin(a*Math.PI)*.40,'#dbfbff');
 }
 // Floating bubbles and a small school give the underwater world movement without
 // stretching the whale or repainting the ocean's surface.
 for(const b of bubbles){
   const a=(t*b.s+b.p)%1,x=(b.x+.006*Math.sin(a*8+b.p*20))*W,y=(b.y-a*.16)*H;
   ctx.save();ctx.globalAlpha=Math.sin(a*Math.PI)*.34;ctx.strokeStyle='#b4f3ff';ctx.lineWidth=Math.max(.45,k*.65);ctx.beginPath();ctx.arc(x,y,b.r*k*(.65+a*.45),0,tau);ctx.stroke();ctx.restore();
 }
 for(const f of fish){
   const a=(t*f.s+f.x)%1,x=(.70+.29*a)*W,y=(f.y+.004*Math.sin(t*1.4+f.p))*H;
   ctx.save();ctx.translate(x,y);ctx.scale(k,k);ctx.fillStyle='rgba(164,229,236,.48)';ctx.beginPath();ctx.ellipse(0,0,f.r,f.r*.38,0,0,tau);ctx.fill();ctx.beginPath();ctx.moveTo(-f.r*.6,0);ctx.lineTo(-f.r*1.7,-f.r*.5);ctx.lineTo(-f.r*1.7,f.r*.5);ctx.closePath();ctx.fill();ctx.restore();
 }
 for(let i=0;i<6;i++){
   const a=(t*(.022+i*.002)+i*.161)%1;
   const x=.18+a*.46,y=.22+.055*Math.sin(a*6+i*.8)+.014*Math.sin(t*.7+i);
   ctx.save();ctx.globalAlpha=Math.min(1,a*12,(1-a)*12);
   bird(x*W,y*H,k*(.64+i*.10),t+i*.73,.17*Math.cos(a*6+i*.8));ctx.restore();
 }
 // Distant birds follow independent circling flight paths.
 for(let i=0;i<3;i++){const a=t*.23+i*2.1;bird((.66+.055*Math.cos(a))*W,(.29+.017*Math.sin(a))*H,k*.47,t+i,.2*Math.cos(a));}
 // Moonlight and underwater caustics breathe independently of the fixed horizon.
 mist(.898*W,.273*H,.064*W,.09*H,.035+.025*Math.sin(t*.5));
 for(let i=0;i<12;i++){const a=(t*.14+i*.083)%1;mist((.75+.24*((i*.618)%1))*W,(.58+a*.12)*H,.013*W,.021*H,.06*Math.sin(a*Math.PI));}
}
function active(){return started&&visible&&!document.hidden&&!reduced.matches&&motion?.getAttribute('aria-pressed')!=='true';}
function loop(now){raf=0;if(!active()){last=0;return;}if(last)elapsed+=Math.min((now-last)/1000,.05);last=now;draw(elapsed);raf=requestAnimationFrame(loop);}
function sync(){const indicator=section.querySelector('.creation-motion-state');if(indicator)indicator.textContent=(reduced.matches||motion?.getAttribute('aria-pressed')==='true')?' · PAUSED':' · ACTIVE';if(active()&&!raf){last=0;raf=requestAnimationFrame(loop);}else if(!active()&&raf){cancelAnimationFrame(raf);raf=0;last=0;}}
function ready(){
 if(started||!img.naturalWidth)return;started=true;section.hidden=false;
 frame.style.aspectRatio=img.naturalWidth+'/'+img.naturalHeight;
 buildArtwork();resize();if(!reduced.matches)draw(0);
 if('ResizeObserver'in window)new ResizeObserver(()=>{resize();if(!reduced.matches)draw(elapsed);}).observe(frame);
 if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();},{rootMargin:'120px'}).observe(section);
 if(motion)new MutationObserver(sync).observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
 document.addEventListener('visibilitychange',sync);window.addEventListener('resize',()=>{resize();if(!reduced.matches)draw(elapsed);},{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches&&ctx)ctx.clearRect(0,0,W,H);sync();});
 sync();
}
img.addEventListener('load',ready,{once:true});img.addEventListener('error',()=>{section.hidden=true;},{once:true});if(img.complete)ready();
})();