(() => {
 'use strict';
 // An original animated photo cutout based on a real Tesla 2026 publicity photograph.
 // Image courtesy of Tesla, Inc. Thruster plumes and orbit are simulated effects.
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const craft=document.createElement('div');
 craft.id='astralis-real-roadster';
 craft.setAttribute('aria-label','Floating white thruster Roadster');
 craft.innerHTML="<a class=\"roadster-real-link\" href=\"https://www.youtube.com/watch?v=r5vsHHPVhJg\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"Official Tesla Roadster photo · Watch the October 2026 real thruster video\" aria-label=\"Real white 2026 Tesla Roadster photograph with simulated thruster flight. Open Tesla stunt video.\">\n<div class=\"roadster-real-core\" data-thrust=\"forward\">\n<svg class=\"roadster-photo-art\" viewBox=\"145 178 825 282\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Photo cutout of the new white Tesla Roadster, credited to Tesla\">\n <defs>\n  <clipPath id=\"roadsterPhotoCut\">\n   <path d=\"M187 318 C191 293 222 279 274 268 C313 237 369 201 422 199 C478 196 532 198 550 200 C601 198 651 228 707 255 L791 274 C808 277 813 290 811 309 L809 368 C808 391 800 395 791 397 C793 412 774 427 750 426 C732 422 731 408 723 402 L612 404 C608 427 583 438 566 439 C538 439 524 431 514 410 L211 412 C188 411 186 400 186 380 Z\"/>\n  </clipPath>\n  <linearGradient id=\"novaPhotographicJet\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n   <stop offset=\"0%\" stop-color=\"#efffff\" stop-opacity=\".88\"/>\n   <stop offset=\"28%\" stop-color=\"#a8ecff\" stop-opacity=\".75\"/>\n   <stop offset=\"72%\" stop-color=\"#84caff\" stop-opacity=\".28\"/>\n   <stop offset=\"100%\" stop-color=\"#81caff\" stop-opacity=\"0\"/>\n  </linearGradient>\n  <linearGradient id=\"novaPhotographicLift\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n   <stop offset=\"0%\" stop-color=\"#f3ffff\" stop-opacity=\".8\"/>\n   <stop offset=\"50%\" stop-color=\"#a5eaff\" stop-opacity=\".4\"/>\n   <stop offset=\"100%\" stop-color=\"#8bdcff\" stop-opacity=\"0\"/>\n  </linearGradient>\n  <radialGradient id=\"novaRealRoadsterGlow\">\n   <stop offset=\"0%\" stop-color=\"#96eaff\" stop-opacity=\".22\"/>\n   <stop offset=\"100%\" stop-color=\"#96eaff\" stop-opacity=\"0\"/>\n  </radialGradient>\n </defs>\n <ellipse class=\"roadster-glow-ring\" cx=\"502\" cy=\"342\" rx=\"395\" ry=\"130\" fill=\"url(#novaRealRoadsterGlow)\"/>\n <!-- Cold-gas styled plumes are simulated effects, NOT part of the photograph. -->\n <g class=\"thruster-plume thruster-plume-soft\"><g transform=\"translate(998 0) scale(-1 1)\">\n  <path d=\"M783 300 C862 266 912 276 963 309 C898 318 846 329 791 328 Z\" fill=\"url(#novaPhotographicJet)\"/>\n  <path d=\"M778 360 C849 348 913 367 967 391 C876 390 820 380 777 376 Z\" fill=\"url(#novaPhotographicJet)\"/>\n </g></g>\n <g class=\"thruster-lift\">\n  <path d=\"M538 412 C520 429 517 444 527 459 L567 462 C577 446 571 434 563 414Z\" fill=\"url(#novaPhotographicLift)\"/>\n  <path d=\"M733 395 C718 423 723 446 745 462 L772 462 C783 440 763 418 763 399Z\" fill=\"url(#novaPhotographicLift)\"/>\n </g>\n <g clip-path=\"url(#roadsterPhotoCut)\"><image class=\"roadster-real-photo\" id=\"roadster-real-photo-source\" x=\"0\" y=\"0\" width=\"1000\" height=\"563\" preserveAspectRatio=\"none\" href=\"https://www.notateslakiller.com/img/tesla-roadster-pagina-oficiala-fata-1200.jpg\" />\n</g>\n</svg>\n<div class=\"roadster-photo-fallback\" hidden><svg viewBox=\"0 0 440 210\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">\n<defs>\n <linearGradient id=\"novaWhiteRoadsterPaint\" x1=\"0%\" y1=\"0%\" x2=\"95%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#fff\"/><stop offset=\"30%\" stop-color=\"#f6faff\"/><stop offset=\"65%\" stop-color=\"#d5dfe9\"/><stop offset=\"100%\" stop-color=\"#9cabbc\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterGlass\" x1=\"0%\" y1=\"0%\" x2=\"95%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#050c17\"/><stop offset=\"50%\" stop-color=\"#204963\"/><stop offset=\"100%\" stop-color=\"#07101c\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterJet\" x1=\"100%\" y1=\"0%\" x2=\"0%\" y2=\"0%\"><stop offset=\"0%\" stop-color=\"#fff\" stop-opacity=\".92\"/><stop offset=\"45%\" stop-color=\"#9eeaff\" stop-opacity=\".81\"/><stop offset=\"100%\" stop-color=\"#80d6ff\" stop-opacity=\"0\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterLift\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#fcffff\" stop-opacity=\".92\"/><stop offset=\"50%\" stop-color=\"#a3e8ff\" stop-opacity=\".66\"/><stop offset=\"100%\" stop-color=\"#a3e8ff\" stop-opacity=\"0\"/></linearGradient>\n <radialGradient id=\"novaWhiteRoadsterAura\"><stop offset=\"0%\" stop-color=\"#75dafa\" stop-opacity=\".55\"/><stop offset=\"100%\" stop-color=\"#75dafa\" stop-opacity=\"0\"/></radialGradient>\n <linearGradient id=\"novaWhiteRoadsterWheel\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop stop-color=\"#516270\"/><stop offset=\"55%\" stop-color=\"#121b28\"/><stop offset=\"100%\" stop-color=\"#334354\"/></linearGradient>\n</defs>\n<ellipse class=\"roadster-glow-ring\" cx=\"220\" cy=\"119\" rx=\"158\" ry=\"68\" fill=\"url(#novaWhiteRoadsterAura)\"/>\n<!-- Directional cold-gas-style jets; no fiery exhaust -->\n<g class=\"thruster-plume thruster-plume-soft\"><path d=\"M83 101 C52 87 22 88 1 97 C19 110 43 116 85 113Z\" fill=\"url(#novaWhiteRoadsterJet)\"/><path d=\"M84 130 C56 124 22 135 5 147 C32 149 61 143 87 137Z\" fill=\"url(#novaWhiteRoadsterJet)\"/></g>\n<g class=\"thruster-lift\"><path d=\"M165 161 C147 177 151 195 172 208 C182 192 179 179 178 164Z\" fill=\"url(#novaWhiteRoadsterLift)\"/><path d=\"M236 167 C224 186 225 196 240 209 C252 192 252 178 245 166Z\" fill=\"url(#novaWhiteRoadsterLift)\"/><path d=\"M308 157 C290 174 290 191 304 204 C316 191 319 175 314 158Z\" fill=\"url(#novaWhiteRoadsterLift)\"/></g>\n<!-- Black rubber performance tires -->\n<g><circle cx=\"148\" cy=\"144\" r=\"31\" fill=\"#070d16\" stroke=\"#798a99\" stroke-width=\"3\"/><circle cx=\"307\" cy=\"144\" r=\"31\" fill=\"#070d16\" stroke=\"#798a99\" stroke-width=\"3\"/><circle cx=\"148\" cy=\"144\" r=\"19\" fill=\"url(#novaWhiteRoadsterWheel)\"/><circle cx=\"307\" cy=\"144\" r=\"19\" fill=\"url(#novaWhiteRoadsterWheel)\"/><circle cx=\"148\" cy=\"144\" r=\"6\" fill=\"#697f93\"/><circle cx=\"307\" cy=\"144\" r=\"6\" fill=\"#697f93\"/></g>\n<!-- Aerodynamic car, standalone on transparent backdrop -->\n<path d=\"M79 119 C87 105 107 93 142 84 L180 49 Q193 36 233 36 Q278 35 307 52 L350 75 Q382 89 410 97 Q432 105 432 121 Q429 133 406 138 L363 141 Q353 111 307 110 Q267 110 255 141 L201 141 Q193 110 148 109 Q109 109 95 144 L77 144 Q71 135 79 119Z\" fill=\"url(#novaWhiteRoadsterPaint)\" stroke=\"#fdfdff\" stroke-width=\"2.5\"/>\n<!-- side sculpting -->\n<path d=\"M102 119 Q208 107 274 112 Q355 115 398 117\" stroke=\"#9fb6c8\" stroke-width=\"2.1\" fill=\"none\" opacity=\".62\"/>\n<path d=\"M113 133 Q207 137 280 133 Q350 133 407 126\" stroke=\"#798fa6\" stroke-width=\"2\" fill=\"none\" opacity=\".43\"/>\n<!-- roofline glass and windshield -->\n<path d=\"M180 54 Q198 42 234 42 Q278 39 308 56 L332 72 L280 76 Q231 81 187 76 L156 73Z\" fill=\"url(#novaWhiteRoadsterGlass)\" stroke=\"#d4f2ff\" stroke-opacity=\".78\" stroke-width=\"1.8\"/>\n<path d=\"M184 54 Q213 62 261 65 Q305 66 327 71\" fill=\"none\" stroke=\"#a8eaff\" stroke-width=\"2\" opacity=\".48\"/>\n<path d=\"M272 43 L291 75\" fill=\"none\" stroke=\"#b5e1f5\" opacity=\".68\" stroke-width=\"2.6\"/>\n<path d=\"M340 80 Q376 91 414 100\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" opacity=\".75\"/>\n<!-- headlights -->\n<path d=\"M384 103 L419 110\" stroke=\"#dbfaff\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<path d=\"M387 109 L420 114\" stroke=\"#90dcff\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".85\"/>\n<!-- rear lights and exterior trim -->\n<path d=\"M88 108 Q82 122 90 136\" stroke=\"#fd4766\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/>\n<path d=\"M108 100 Q102 119 108 136\" stroke=\"#e3f7ff\" stroke-opacity=\".75\" stroke-width=\"2\" fill=\"none\"/>\n<path d=\"M220 114 L244 115\" stroke=\"#71879a\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n</svg></div>\n<span class=\"roadster-real-label\">TESLA PHOTO · THRUSTERS SIMULATED</span>\n</div></a>";
 document.body.appendChild(craft);
 const SECONDARY_IMAGE_URL="https://img.numerama.com/www.numerama.com/wp-content/uploads/2026/10/tesla-roadster-223.jpg?key=62c643d0";
 const body=craft.querySelector('.roadster-real-core');
 // Source one: credited Tesla publicity photograph. If its original host blocks
 // image embedding, retry with a second Tesla publicity image at a known scale.
 // The previous SVG stays hidden as a final graceful fallback.
 const photo=craft.querySelector('#roadster-real-photo-source');
 const artwork=craft.querySelector('.roadster-photo-art');

 const fallback=craft.querySelector('.roadster-photo-fallback');
 // Physical roll illusion: original photograph on the near side, a rear photo
 // skin on the far side, and separate top / underside geometry at true depth.
 const model=document.createElement('div');
 model.className='roadster-solid-model';
 body.insertBefore(model,artwork);
 model.appendChild(artwork);
 model.appendChild(fallback);
 artwork.classList.add('roadster-model-front');
 function duplicateFace(source,extraClass){
  const clone=source.cloneNode(true);
  clone.classList.add(extraClass);
  clone.setAttribute('aria-hidden','true');
  // Prefix cloned gradient/mask/element IDs, avoiding collisions.
  const ids=[...clone.querySelectorAll('[id]')];
  for(const node of ids){
   const old=node.id;
   const updated=old+'-back';
   const elements=[clone,...clone.querySelectorAll('*')];
   for(const element of elements){
    for(const attr of [...element.attributes]){
     if(attr.value.includes('url(#'+old+')'))
      element.setAttribute(attr.name,attr.value.replaceAll('url(#'+old+')','url(#'+updated+')'));
     if(attr.value==='#'+old)element.setAttribute(attr.name,'#'+updated);
    }
   }
   node.id=updated;
  }
  return clone;
 }
 const farSide=duplicateFace(artwork,'roadster-model-rear');
 const farFallback=duplicateFace(fallback,'roadster-model-fallback-rear');
 model.appendChild(farSide);
 model.appendChild(farFallback);
 const farPhoto=farSide.querySelector('.roadster-real-photo');
 const surfaces=[
   {name:'roadster-model-underbody',markup:"\n<defs><linearGradient id=\"rb-metal\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#eff5f7\"/><stop offset=\".17\" stop-color=\"#70808e\"/><stop offset=\".58\" stop-color=\"#26323d\"/><stop offset=\"1\" stop-color=\"#b8c5d2\"/></linearGradient><linearGradient id=\"rb-tire\"><stop stop-color=\"#070c12\"/><stop offset=\".5\" stop-color=\"#27353f\"/><stop offset=\"1\" stop-color=\"#090f17\"/></linearGradient><radialGradient id=\"rb-thruster\"><stop stop-color=\"#f1ffff\"/><stop offset=\".35\" stop-color=\"#8fdcff\"/><stop offset=\"1\" stop-color=\"#397ea0\" stop-opacity=\".1\"/></radialGradient></defs>\n<path d=\"M115 36 Q145 12 177 37 L199 63 L199 222 L175 259 Q139 271 111 249Z\" fill=\"url(#rb-tire)\"/><path d=\"M585 33 Q619 10 651 35 L674 61 L674 220 L649 255 Q616 273 586 250Z\" fill=\"url(#rb-tire)\"/>\n<path d=\"M63 143 L132 67 Q205 28 298 35 L627 48 Q748 69 796 144 Q731 221 630 239 L298 255 Q204 254 129 217Z\" fill=\"url(#rb-metal)\" stroke=\"#cbd9e6\" stroke-width=\"5\"/>\n<path d=\"M91 143 L179 79 L630 89 Q729 112 754 143 L629 203 L181 206Z\" fill=\"#121d27\" stroke=\"#8b9fae\" stroke-width=\"3\"/>\n<path d=\"M205 98 L565 96 L565 189 L203 193Z\" fill=\"#3b4c58\" stroke=\"#b2c4d1\" stroke-width=\"3\"/>\n<g stroke=\"#9cb0be\" stroke-width=\"3\" opacity=\".76\"><path d=\"M236 104V190 M281 103V190 M325 103V188 M369 103V188 M413 103V188 M457 103V188 M501 103V188 M543 103V188\"/><path d=\"M164 89 L239 208 M174 202 L240 90 M572 93 L649 204 M581 205 L657 95\"/></g>\n<rect x=\"209\" y=\"121\" width=\"384\" height=\"47\" rx=\"12\" fill=\"#081522\" stroke=\"#82939f\" stroke-width=\"4\"/>\n<g stroke=\"#9cb6c7\" stroke-width=\"2\" opacity=\".62\"><path d=\"M244 131V158 M286 131V158 M328 131V158 M370 131V158 M412 131V158 M454 131V158 M496 131V158 M538 131V158\"/></g>\n<g fill=\"#121d29\" stroke=\"#90a6b5\" stroke-width=\"5\"><ellipse cx=\"129\" cy=\"96\" rx=\"31\" ry=\"28\"/><ellipse cx=\"129\" cy=\"194\" rx=\"31\" ry=\"28\"/><ellipse cx=\"625\" cy=\"89\" rx=\"33\" ry=\"29\"/><ellipse cx=\"625\" cy=\"199\" rx=\"33\" ry=\"29\"/></g>\n<ellipse cx=\"119\" cy=\"144\" rx=\"25\" ry=\"28\" fill=\"url(#rb-thruster)\"/><path d=\"M143 112 L84 92 M143 174 L84 196\" stroke=\"#bce6f3\" stroke-width=\"5\" opacity=\".75\"/>\n<path d=\"M705 92 L779 123 M705 193 L779 166\" stroke=\"#fff\" stroke-width=\"5\" opacity=\".72\"/>"},
   {name:'roadster-model-topside',markup:"\n<defs><linearGradient id=\"rt-paint\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#fcfeff\"/><stop offset=\".42\" stop-color=\"#d5e3ef\"/><stop offset=\".71\" stop-color=\"#f9fcff\"/><stop offset=\"1\" stop-color=\"#8ca2b3\"/></linearGradient><linearGradient id=\"rt-glass\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#071420\"/><stop offset=\".5\" stop-color=\"#294a62\"/><stop offset=\"1\" stop-color=\"#06111c\"/></linearGradient></defs>\n<path d=\"M42 144 Q75 76 174 49 Q283 25 506 31 L663 44 Q752 63 806 143 Q750 223 655 246 L504 254 Q266 269 173 230 Q79 210 42 144Z\" fill=\"url(#rt-paint)\" stroke=\"#f2f8ff\" stroke-width=\"6\"/>\n<path d=\"M207 66 Q286 42 412 49 Q489 51 540 78 Q566 108 562 143 Q565 181 540 207 Q485 239 410 239 Q283 241 207 218 Q249 178 251 143 Q248 105 207 66Z\" fill=\"url(#rt-glass)\" stroke=\"#8ebacb\" stroke-width=\"5\"/>\n<path d=\"M378 53 Q401 143 375 236\" stroke=\"#cff5ff\" stroke-width=\"6\" opacity=\".65\" fill=\"none\"/><path d=\"M539 78 Q585 144 541 206\" stroke=\"#fff\" stroke-width=\"8\" opacity=\".85\" fill=\"none\"/>\n<path d=\"M591 80 Q699 89 765 141 Q701 188 591 207\" stroke=\"#a1b3c1\" stroke-width=\"4\" fill=\"none\"/><path d=\"M99 142L177 105 M99 142L178 181\" stroke=\"#b8cad9\" stroke-width=\"5\"/>\n<path d=\"M773 114 L790 129 M773 172 L790 155\" stroke=\"#d0f7ff\" stroke-width=\"10\" stroke-linecap=\"round\"/><path d=\"M58 108L71 105 M58 179L71 182\" stroke=\"#ff6076\" stroke-width=\"8\" stroke-linecap=\"round\"/>"}
 ];
 for(const surface of surfaces){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 825 290');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('roadster-model-surface',surface.name);
  svg.innerHTML=surface.markup;
  model.appendChild(svg);
 }
 let photoAttempt=0;
 photo.addEventListener('error',()=>{
  if(photoAttempt===0){
   photoAttempt=1;
   photo.setAttribute('transform','translate(-314 -259) scale(1.6)');
   photo.setAttribute('href',SECONDARY_IMAGE_URL);
   farPhoto.setAttribute('transform','translate(-314 -259) scale(1.6)');
   farPhoto.setAttribute('href',SECONDARY_IMAGE_URL);
  }else if(photoAttempt===1){
   photoAttempt=2;artwork.hidden=true;farSide.hidden=true;fallback.hidden=false;farFallback.hidden=false;
  }
 });


 // Flight-control upgrade: inertia continues between cold-gas thruster bursts.
 // A transparent particle layer stays behind the actual Tesla photo cutout.
 const trail=document.createElement('canvas');
 trail.id='astralis-roadster-flight-trail';
 trail.setAttribute('aria-hidden','true');
 document.body.appendChild(trail);
 const ctx=trail.getContext('2d',{alpha:true});
 const clamp=(value,lo,hi)=>Math.min(hi,Math.max(lo,value));
 let width=0,height=0,elapsed=0,previousTime=0,frame=0;
 let posX=0,posY=0,vx=0,vy=0,facing=1,ready=false;
 let particles=[],emission=0,canvasWidth=0,canvasHeight=0;
 const isSmall=()=>window.innerWidth<700;
 function range(){
  const header=document.querySelector('.topbar');
  const headerBottom=header?header.getBoundingClientRect().bottom:75;
  const left=8,right=Math.max(left,window.innerWidth-width-8);
  const top=Math.min(Math.max(headerBottom+12,82),Math.max(8,window.innerHeight-height-14));
  const bottom=Math.max(top,window.innerHeight-height-14);
  return {left,right,top,bottom};
 }
 function resizeTrail(){
  if(!ctx)return;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  canvasWidth=window.innerWidth;canvasHeight=window.innerHeight;
  trail.width=Math.round(canvasWidth*dpr);
  trail.height=Math.round(canvasHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  particles=[];
 }
 function measure(){
  width=craft.offsetWidth;height=craft.offsetHeight;
  craft.style.setProperty('--roadster-half-thickness',(width*.14).toFixed(2)+'px');
  const limits=range();
  if(!ready){
   posX=clamp(window.innerWidth*.24,limits.left,limits.right);
   posY=clamp(limits.top+(limits.bottom-limits.top)*.54,limits.top,limits.bottom);
   vx=clamp(window.innerWidth*.058,29,88);
   vy=-clamp(window.innerHeight*.018,6,19);
   ready=true;
  }else{
   posX=clamp(posX,limits.left,limits.right);
   posY=clamp(posY,limits.top,limits.bottom);
   vx=clamp(vx,-Math.max(34,window.innerWidth*.095),Math.max(34,window.innerWidth*.095));
  }
  resizeTrail();
 }
 function drawParticles(dt,engine,doingFlip){
  if(!ctx)return;
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];
   p.age+=dt;
   if(p.age>=p.life){particles.splice(i,1);continue;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   const fade=Math.pow(1-p.age/p.life,1.6);
   ctx.beginPath();
   ctx.strokeStyle='rgba(139,217,255,'+(fade*(p.flare?.54:.30)).toFixed(3)+')';
   ctx.lineWidth=p.size*fade;
   ctx.lineCap='round';
   ctx.moveTo(p.x,p.y);
   ctx.lineTo(p.x-p.vx*.072,p.y-p.vy*.072);
   ctx.stroke();
  }
  // The jets are positioned at the back of the pictured car, regardless
  // of whether its nose is pointing toward the left or right edge.
  emission+=dt*(engine>.7?26:7)*(isSmall()?.70:1);
  const limit=isSmall()?42:68;
  while(emission>=1){
   emission--;
   if(particles.length>=limit)continue;
   const fromX=posX+(facing>0?.13:.87)*width;
   const fromY=posY+height*(.43+Math.random()*.20);
   particles.push({
    x:fromX,y:fromY,
    vx:-facing*(52+85*Math.random())-vx*.12,
    vy:(Math.random()-.5)*(doingFlip?115:42)-vy*.1,
    age:0,life:.52+Math.random()*.60,
    size:1+Math.random()*(doingFlip?3.1:2.2),
    flare:engine>.7
   });
  }
 }
 function fly(dt){
  elapsed+=dt;
  const limits=range();
  const speedLimit=clamp(window.innerWidth*.095,34,136);
  const phase=(elapsed+9)%22;
  const rolling=phase>=.20&&phase<=2.40;
  const boostCycle=elapsed%17;
  // Thruster ignition boosts velocity. Coasting retains momentum in vacuum.
  const engine=(boostCycle<2.6||(boostCycle>8.6&&boostCycle<10.3)||rolling)?1:.12;
  if(dt>0){
   vx+=(vx<0?-1:1)*speedLimit*.28*engine*dt;
   vx=clamp(vx,-speedLimit,speedLimit);
   // Smaller attitude-control jets steer broad arcs, not a looping sine orbit.
   const targetVy=speedLimit*(.27*Math.sin(elapsed*.31)+.13*Math.cos(elapsed*.17));
   vy+=(targetVy-vy)*Math.min(1,dt*.42);
   posX+=vx*dt;
   posY+=vy*dt;
   if(posX>=limits.right){posX=limits.right;vx=-Math.max(29,Math.abs(vx)*.89)}
   if(posX<=limits.left){posX=limits.left;vx=Math.max(29,Math.abs(vx)*.89)}
   if(posY>=limits.bottom){posY=limits.bottom;vy=-Math.max(13,Math.abs(vy))}
   if(posY<=limits.top){posY=limits.top;vy=Math.max(13,Math.abs(vy))}
  }
  facing=vx<0?-1:1;
  // Barrel roll around the car's own long axis, eased in and out.
  const progress=clamp((phase-.20)/2.20,0,1);
  const eased=(1-Math.cos(Math.PI*progress))*.5;
  const flip=rolling?360*eased:0;
  model.dataset.roll=rolling?'active':'idle';
  const bank=clamp(Math.atan2(vy,Math.abs(vx))*180/Math.PI,-23,23)
    +2.2*Math.sin(elapsed*.80);
  const nose=5*Math.sin(elapsed*.41)+(rolling?12*Math.sin(Math.PI*progress):0);
  const depth=1+.055*Math.sin(elapsed*.23);
  craft.style.setProperty('--roadster-real-x',posX.toFixed(1)+'px');
  craft.style.setProperty('--roadster-real-y',posY.toFixed(1)+'px');
  craft.style.setProperty('--roadster-facing',String(facing));
  craft.style.setProperty('--roadster-bank',bank.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-flip',flip.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-nose',nose.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-depth',depth.toFixed(3));
  craft.style.setProperty('--roadster-boost',String(engine));
  body.dataset.thrust=rolling?'lift':(engine>.7?'forward':'coast');
  drawParticles(dt,engine,rolling);
 }
 function animate(now){
  frame=0;
  if(document.hidden||reduced.matches){previousTime=0;return;}
  const dt=previousTime?Math.min((now-previousTime)/1000,.05):0;
  previousTime=now;
  // Hold position under a pointer so the real-photo video link stays clickable.
  const held=craft.matches(':hover,:focus-within');
  if(held){drawParticles(dt,0,false);}
  else{fly(dt);}
  frame=requestAnimationFrame(animate);
 }
 function sync(){
  cancelAnimationFrame(frame);
  frame=0;previousTime=0;
  measure();
  if(document.hidden)return;
  if(reduced.matches){
   const limits=range();
   craft.style.setProperty('--roadster-real-x',limits.right+'px');
   craft.style.setProperty('--roadster-real-y',limits.top+'px');
   craft.style.setProperty('--roadster-facing','1');
   craft.style.setProperty('--roadster-bank','0deg');
   craft.style.setProperty('--roadster-flip','0deg');
   model.dataset.roll='idle';
   craft.style.setProperty('--roadster-nose','0deg');
   craft.style.setProperty('--roadster-depth','1');
   craft.style.setProperty('--roadster-boost','0');
   body.dataset.thrust='coast';
   if(ctx)ctx.clearRect(0,0,canvasWidth,canvasHeight);
  }else{
   fly(0);
   frame=requestAnimationFrame(animate);
  }
 }
 window.addEventListener('resize',sync,{passive:true});
 document.addEventListener('visibilitychange',sync);
 if(reduced.addEventListener)reduced.addEventListener('change',sync);
 sync();
})();
