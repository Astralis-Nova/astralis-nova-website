(() => {
'use strict';
const anchor=document.querySelector('.lazarus-section');
if(!anchor)return;
const section=document.createElement('section');
section.className='creation-vista';
section.innerHTML='<p class="eyebrow">The wonder of creation</p><h2>A Living World</h2><p class="creation-status" style="margin:-.4em auto 1em;color:#d8e7ee;font:12px/1.4 system-ui;letter-spacing:.08em">LIVING WORLD · MOTION EDITION 6 <span class="creation-motion-state"></span></p><div class="creation-frame" role="img" aria-label="A heavenly garden with a rainbow, crystalline flowers, waterfalls, a whale and a star-filled sky"><img class="creation-image" src="assets/heavenly-garden.webp" alt="" decoding="async"><canvas class="creation-life" aria-hidden="true"></canvas></div>';
const style=document.createElement('style');
style.textContent=`.creation-vista{max-width:1320px;margin:48px auto;padding:0 16px;text-align:center}.creation-vista h2{font-size:clamp(1.65rem,4vw,2.8rem);margin:.3em 0 .7em;color:#fff0c4}.creation-frame{position:relative;overflow:hidden;isolation:isolate;border-radius:20px;border:1px solid rgba(255,227,175,.36);box-shadow:0 20px 70px #030714b0,0 0 24px #f5c07522;aspect-ratio:1672/941;background:#101930}.creation-frame img,.creation-frame canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.creation-frame canvas{pointer-events:none}.creation-life{z-index:2}.creation-vista[hidden]{display:none}@media(max-width:600px){.creation-vista{margin:32px auto;padding:0 8px}.creation-frame{border-radius:12px}}`;
document.head.append(style);section.hidden=true;anchor.before(section);
const img=section.querySelector('img'),frame=section.querySelector('.creation-frame'),fx=section.querySelector('canvas'),ctx=fx.getContext('2d');
const motion=document.getElementById('motionToggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let started=false,visible=true,last=0,elapsed=0,raf=0,patches=[],whale=null,cleanArt=null,deerHead=null,deerParts=null,W=0,H=0;
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
 {x:.873,y:.085,rx:.083,ry:.067,kind:'galaxy',speed:.24},
 {x:.667,y:.185,rx:.059,ry:.049,kind:'galaxy',speed:.21},
 {x:.613,y:.713,rx:.042,ry:.032,kind:'surf',speed:1.05},
 {x:.710,y:.842,rx:.032,ry:.041,kind:'surf',speed:1.3},
 {x:.753,y:.890,rx:.043,ry:.038,kind:'surf',speed:1.16},
 {x:.888,y:.548,rx:.105,ry:.020,kind:'surf',speed:.82},
 {x:.980,y:.526,rx:.040,ry:.022,kind:'surf',speed:.96},
 {x:.318,y:.061,rx:.059,ry:.041,kind:'branch',speed:.72},
 {x:.462,y:.046,rx:.064,ry:.049,kind:'branch',speed:.68},
 {x:.545,y:.029,rx:.068,ry:.025,kind:'branch',speed:.84},
 {x:.379,y:.340,rx:.047,ry:.031,kind:'branch',speed:.78},
 {x:.427,y:.365,rx:.040,ry:.028,kind:'branch',speed:1.05},
 {x:.140,y:.167,rx:.020,ry:.065,kind:'branch',speed:.90}
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
   // Remove the whole original deer, including ears, hooves and old shadow.
   // Inpaint from surrounding boundary pixels, never clone from the deer itself.
   const X=310,Y=422,BW=106,BH=110;
   const patch=surface(BW,BH),p=patch.getContext('2d');p.drawImage(img,X,Y,BW,BH,0,0,BW,BH);
   const data=p.getImageData(0,0,BW,BH),original=new Uint8ClampedArray(data.data);
   const m=surface(BW,BH),mg=m.getContext('2d');mg.translate(-X,-Y);
   const outline=[[320,471],[324,459],[337,455],[358,454],[368,457],[369,445],[368,430],[380,429],[389,437],[400,430],[407,436],[407,450],[400,464],[393,476],[385,487],[387,524],[375,527],[365,525],[360,498],[355,498],[356,524],[341,525],[331,525],[320,523],[318,502],[320,486]];
   mg.fillStyle='#fff';trace(mg,outline);mg.fill();
   const mask=mg.getImageData(0,0,BW,BH).data,inside=new Uint8Array(BW*BH);
   for(let i=0;i<inside.length;i++)inside[i]=mask[i*4+3]>0?1:0;
   // Initialize from clean boundary pixels on each row, then diffuse color
   // inward. All source samples are outside the full original deer silhouette.
   const pixels=new Float32Array(original);
   for(let y=1;y<BH-1;y++)for(let x=1;x<BW-1;x++){
     const i=y*BW+x;if(!inside[i])continue;
     let l=x-1,q=x+1;while(l>0&&inside[y*BW+l])l--;while(q<BW-1&&inside[y*BW+q])q++;
     const w=(x-l)/Math.max(1,q-l);
     for(let c=0;c<3;c++)pixels[i*4+c]=original[(y*BW+l)*4+c]*(1-w)+original[(y*BW+q)*4+c]*w;
   }
   for(let iter=0;iter<90;iter++)for(let y=1;y<BH-1;y++)for(let x=1;x<BW-1;x++){
     const i=y*BW+x;if(!inside[i])continue;
     for(let c=0;c<3;c++)pixels[i*4+c]=(pixels[(i-1)*4+c]+pixels[(i+1)*4+c]+pixels[(i-BW)*4+c]+pixels[(i+BW)*4+c])*.25;
   }
   // Restore fine meadow texture with small deterministic luminance variation.
   for(let i=0;i<inside.length;i++)if(inside[i]){
     const x=i%BW,y=Math.floor(i/BW),grain=(Math.sin(x*21.37+y*13.71)*2.8+Math.sin(x*4.2+y*3.5)*2.3);
     for(let c=0;c<3;c++)data.data[i*4+c]=pixels[i*4+c]+grain;
   }
   p.putImageData(data,0,0);g.drawImage(patch,X,Y);
   // Retain the photographic torso and head, with an alpha matte that rejects
   // the yellow-green meadow. Legs are clean articulated shapes, not grass crops.
   const shapes={
    trunk:[[328,475],[332,468],[341,463],[352,461],[361,461],[371,465],[377,470],[378,479],[371,486],[357,490],[344,490],[334,485]],
    head:[[369,473],[375,462],[376,451],[374,441],[373,436],[380,438],[387,444],[395,436],[400,439],[400,445],[397,453],[395,463],[390,469],[384,478],[379,481],[370,480]]
   };
   deerParts={};
   for(const [name,pts] of Object.entries(shapes)){
     const c=surface(92,100),d=c.getContext('2d');d.translate(-317,-426);trace(d,pts);d.clip();d.drawImage(img,0,0,RW,RH);
     const m=d.getImageData(0,0,c.width,c.height),v=m.data;
     for(let i=0;i<v.length;i+=4){
       if(!v[i+3])continue;
       const red=v[i],green=v[i+1],blue=v[i+2],warm=red-green;
       // Suppress yellow-green grass as well as purely green spill.
       if(green>blue+17&&warm<12){v[i+3]=Math.round(v[i+3]*Math.max(0,Math.min(1,(warm+3)/15)));}
       else if(green>red-5&&green>blue+12){v[i+1]=Math.min(green,red*.85);}
     }
     d.putImageData(m,0,0);deerParts[name]=c;
   }
 }
 function animateDeer(t){
   if(!deerParts)return;
   const cycle=t%24;
   const path=cycle<9?cycle/9:cycle<12?1:cycle<21?1-(cycle-12)/9:0;
   const eased=path*path*(3-2*path),moving=cycle<9||cycle>=12&&cycle<21;
   const dir=cycle<11||cycle>=22?1:-1,walk=moving?Math.min(1,Math.sin(path*Math.PI)*3):0;
   const px=360+68*eased,py=517-13*Math.sin(eased*Math.PI);
   const stride=t*4.8,look=Math.sin(t*.65)*.07;
   const graze=!moving?Math.sin(Math.max(0,Math.min(1,cycle<12?(cycle-9)/3:(cycle-21)/3))*Math.PI)*.45:0;
   ctx.save();ctx.scale(W/RW,H/RH);
   ctx.fillStyle='rgba(30,39,17,.23)';ctx.beginPath();ctx.ellipse(px,py+3,25,4.5,0,0,tau);ctx.fill();
   ctx.translate(px,py);ctx.scale(dir,1);ctx.translate(-360,-517);
   const bob=walk*Math.abs(Math.sin(stride))*-1.3;
   const part=(name,pivotX,pivotY,angle,dy=0)=>{
     ctx.save();ctx.translate(pivotX,pivotY+dy);ctx.rotate(angle);ctx.drawImage(deerParts[name],317-pivotX,426-pivotY);ctx.restore();
   };
   // Each leg has a knee and a lower segment. Tapered tan/brown contours,
   // shaded joints and small dark hooves contain no background pixels.
   function leg(x,y,hind,phase,far){
     const swing=Math.sin(stride+phase)*walk, lift=Math.max(0,Math.cos(stride+phase))*walk;
     const kneeX=x+(hind?-3:2)+swing*5,kneeY=y+15+bob;
     const footX=x+swing*9+(hind?-1:1),footY=517-lift*5;
     const upper=ctx.createLinearGradient(x-3,y,x+4,y);upper.addColorStop(0,far?'#71502e':'#a66d35');upper.addColorStop(.5,far?'#ad8050':'#d4a05b');upper.addColorStop(1,far?'#6d4b2c':'#986334');
     ctx.fillStyle=upper;ctx.beginPath();ctx.moveTo(x-3,y+bob-2);ctx.quadraticCurveTo(kneeX-3,kneeY-7,kneeX-1.7,kneeY);ctx.lineTo(kneeX+1.7,kneeY);ctx.quadraticCurveTo(x+4,y+5+bob,x+3,y+bob-2);ctx.closePath();ctx.fill();
     const lower=ctx.createLinearGradient(kneeX,kneeY,footX,footY);lower.addColorStop(0,far?'#9a7042':'#c08c4e');lower.addColorStop(1,'#62472c');ctx.fillStyle=lower;
     ctx.beginPath();ctx.moveTo(kneeX-1.6,kneeY-1);ctx.lineTo(footX-1.15,footY-1);ctx.lineTo(footX+1.3,footY-1);ctx.lineTo(kneeX+1.7,kneeY-1);ctx.closePath();ctx.fill();
     ctx.fillStyle='#493a29';ctx.beginPath();ctx.ellipse(footX+.5,footY,2.1,1.5,0,0,tau);ctx.fill();
   }
   leg(335,482,true,0,true);leg(370,482,false,Math.PI,true);
   part('trunk',360,482,.012*Math.sin(stride)*walk,bob);
   leg(345,485,true,Math.PI,false);leg(377,482,false,0,false);
   part('head',375,477,look+graze,bob);
   ctx.restore();
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
 }else if(kind==='surf'){
   const q=(t*speed*.6)%1,z=(q+.5)%1;
   sample(8*scale*Math.sin(q*tau),q*15*scale,Math.sin(q*Math.PI)*.95);
   sample(8*scale*Math.sin(z*tau),z*15*scale,Math.sin(z*Math.PI)*.85);
 }else if(kind==='branch'){
   const gust=Math.sin(t*speed+p.x*17)+.32*Math.sin(t*1.7+p.y*12);
   sample(gust*9*scale,Math.sin(t*speed*.9)*3*scale,.92,gust*.046);
 }else if(kind==='leaf'){
   const wind=Math.sin(t*speed*.85+p.x*14)+.33*Math.sin(t*1.9+p.y*17);
   sample(wind*6.0*scale,Math.sin(t*.8+p.y*12)*1.5*scale,.85,wind*.022);
 }else if(kind==='cloud'){
   sample(Math.sin(t*speed)*11*scale,Math.sin(t*speed*.6)*2*scale,.75);
 }else{
   sample(4*scale*Math.sin(t*speed),2*scale*Math.cos(t*speed),.88,Math.sin(t*speed)*.20);
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
// Shore-break foam travels around the foreground rocks in uneven bursts.
// The texture motion above supplies the actual photographed water; these
// short-lived droplets make the impacts visible even on a small phone.
const breakers=[[.614,.715,.026,.022],[.710,.845,.018,.031],[.752,.888,.023,.023],[.89,.545,.065,.010]];
function shoreBreak(t){
 const k=W/1000;
 for(let n=0;n<breakers.length;n++){
   const [x,y,rx,ry]=breakers[n],phase=(t*.64+n*.29)%1;
   for(let i=0;i<32;i++){
    const a=(phase+i*.031)%1,seed=((i*.618+n*.37)%1)-.5;
    const px=(x+seed*rx*2+a*.006)*W,py=(y-a*ry*1.5+a*a*ry)*H;
    const alpha=Math.sin(a*Math.PI)*(.25+.38*((i*.37)%1));
    glow(px,py,(.5+(i%4)*.35)*k,alpha,'#e7fbff');
   }
   mist((x+.008*Math.sin(phase*tau))*W,y*H,rx*W*.7,ry*H*.8,.10+.12*Math.sin(phase*Math.PI));
 }
}
function shootingStars(t){
 // Irregular meteor events, exclusively in the open cosmic sky.
 const events=[{period:13,offset:1.1,x:.91,y:.045,len:.105},{period:19,offset:6.3,x:.76,y:.055,len:.083},{period:27,offset:12,x:.98,y:.10,len:.09}];
 for(const e of events){
   const age=(t+e.offset)%e.period;
   if(age>1.45)continue;
   const q=age/1.45,x=(e.x-e.len*q)*W,y=(e.y+.045*q)*H;
   const dx=.055*W,dy=-.024*H,a=Math.sin(q*Math.PI);
   const g=ctx.createLinearGradient(x+dx,y+dy,x,y);
   g.addColorStop(0,'rgba(185,213,255,0)');g.addColorStop(.65,'rgba(201,227,255,'+a*.35+')');g.addColorStop(1,'rgba(255,250,224,'+a+')');
   ctx.save();ctx.strokeStyle=g;ctx.lineWidth=Math.max(.7,W/850);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+dx,y+dy);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
   glow(x,y,W/650,a,'#fff7df');
 }
}
function draw(t){
 if(!ctx||!W||!H)return;ctx.clearRect(0,0,W,H);if(cleanArt)ctx.drawImage(cleanArt,0,0,W,H);const k=W/1000;
 for(const p of patches)patch(p,t);
 swimWhales(t);
 animateDeer(t);
 fallingWater(t);
 oceanGlints(t);
 shoreBreak(t);
 shootingStars(t);
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