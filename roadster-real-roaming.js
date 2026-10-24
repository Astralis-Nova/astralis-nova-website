(() => {
 'use strict';
 // An original animated photo cutout based on a real Tesla 2026 publicity photograph.
 // Image courtesy of Tesla, Inc. Thruster plumes and orbit are simulated effects.
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const craft=document.createElement('div');
 craft.id='astralis-real-roadster';
 craft.setAttribute('aria-label','Floating white thruster Roadster');
 craft.innerHTML="<a class=\"roadster-real-link\" href=\"https://www.youtube.com/watch?v=r5vsHHPVhJg\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"Official Tesla Roadster photo · Watch the October 2026 real thruster video\" aria-label=\"Real white 2026 Tesla Roadster photograph with simulated thruster flight. Open Tesla stunt video.\">\n<div class=\"roadster-real-core\" data-thrust=\"forward\">\n<svg class=\"roadster-photo-art\" viewBox=\"145 178 825 282\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Photo cutout of the new white Tesla Roadster, credited to Tesla\">\n <defs>\n  <clipPath id=\"roadsterPhotoCut\">\n   <path d=\"M187 318 C191 293 222 279 274 268 C313 237 369 201 422 199 C478 196 532 198 550 200 C601 198 651 228 707 255 L791 274 C808 277 813 290 811 309 L809 368 C808 391 800 395 791 397 C793 412 774 427 750 426 C732 422 731 408 723 402 L612 404 C608 427 583 438 566 439 C538 439 524 431 514 410 L211 412 C188 411 186 400 186 380 Z\"/>\n  </clipPath>\n  <linearGradient id=\"novaPhotographicJet\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n   <stop offset=\"0%\" stop-color=\"#efffff\" stop-opacity=\".88\"/>\n   <stop offset=\"28%\" stop-color=\"#a8ecff\" stop-opacity=\".75\"/>\n   <stop offset=\"72%\" stop-color=\"#84caff\" stop-opacity=\".28\"/>\n   <stop offset=\"100%\" stop-color=\"#81caff\" stop-opacity=\"0\"/>\n  </linearGradient>\n  <linearGradient id=\"novaPhotographicLift\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n   <stop offset=\"0%\" stop-color=\"#f3ffff\" stop-opacity=\".8\"/>\n   <stop offset=\"50%\" stop-color=\"#a5eaff\" stop-opacity=\".4\"/>\n   <stop offset=\"100%\" stop-color=\"#8bdcff\" stop-opacity=\"0\"/>\n  </linearGradient>\n  <radialGradient id=\"novaRealRoadsterGlow\">\n   <stop offset=\"0%\" stop-color=\"#96eaff\" stop-opacity=\".22\"/>\n   <stop offset=\"100%\" stop-color=\"#96eaff\" stop-opacity=\"0\"/>\n  </radialGradient>\n </defs>\n <ellipse class=\"roadster-glow-ring\" cx=\"502\" cy=\"342\" rx=\"395\" ry=\"130\" fill=\"url(#novaRealRoadsterGlow)\"/>\n <!-- Cold-gas styled plumes are simulated effects, NOT part of the photograph. -->\n <g class=\"thruster-plume thruster-plume-soft\">\n  <path d=\"M783 300 C862 266 912 276 963 309 C898 318 846 329 791 328 Z\" fill=\"url(#novaPhotographicJet)\"/>\n  <path d=\"M778 360 C849 348 913 367 967 391 C876 390 820 380 777 376 Z\" fill=\"url(#novaPhotographicJet)\"/>\n </g>\n <g class=\"thruster-lift\">\n  <path d=\"M538 412 C520 429 517 444 527 459 L567 462 C577 446 571 434 563 414Z\" fill=\"url(#novaPhotographicLift)\"/>\n  <path d=\"M733 395 C718 423 723 446 745 462 L772 462 C783 440 763 418 763 399Z\" fill=\"url(#novaPhotographicLift)\"/>\n </g>\n <g clip-path=\"url(#roadsterPhotoCut)\"><image class=\"roadster-real-photo\" id=\"roadster-real-photo-source\" x=\"0\" y=\"0\" width=\"1000\" height=\"563\" preserveAspectRatio=\"none\" href=\"https://www.notateslakiller.com/img/tesla-roadster-pagina-oficiala-fata-1200.jpg\" />\n</g>\n</svg>\n<div class=\"roadster-photo-fallback\" hidden><svg viewBox=\"0 0 440 210\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">\n<defs>\n <linearGradient id=\"novaWhiteRoadsterPaint\" x1=\"0%\" y1=\"0%\" x2=\"95%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#fff\"/><stop offset=\"30%\" stop-color=\"#f6faff\"/><stop offset=\"65%\" stop-color=\"#d5dfe9\"/><stop offset=\"100%\" stop-color=\"#9cabbc\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterGlass\" x1=\"0%\" y1=\"0%\" x2=\"95%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#050c17\"/><stop offset=\"50%\" stop-color=\"#204963\"/><stop offset=\"100%\" stop-color=\"#07101c\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterJet\" x1=\"100%\" y1=\"0%\" x2=\"0%\" y2=\"0%\"><stop offset=\"0%\" stop-color=\"#fff\" stop-opacity=\".92\"/><stop offset=\"45%\" stop-color=\"#9eeaff\" stop-opacity=\".81\"/><stop offset=\"100%\" stop-color=\"#80d6ff\" stop-opacity=\"0\"/></linearGradient>\n <linearGradient id=\"novaWhiteRoadsterLift\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#fcffff\" stop-opacity=\".92\"/><stop offset=\"50%\" stop-color=\"#a3e8ff\" stop-opacity=\".66\"/><stop offset=\"100%\" stop-color=\"#a3e8ff\" stop-opacity=\"0\"/></linearGradient>\n <radialGradient id=\"novaWhiteRoadsterAura\"><stop offset=\"0%\" stop-color=\"#75dafa\" stop-opacity=\".55\"/><stop offset=\"100%\" stop-color=\"#75dafa\" stop-opacity=\"0\"/></radialGradient>\n <linearGradient id=\"novaWhiteRoadsterWheel\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop stop-color=\"#516270\"/><stop offset=\"55%\" stop-color=\"#121b28\"/><stop offset=\"100%\" stop-color=\"#334354\"/></linearGradient>\n</defs>\n<ellipse class=\"roadster-glow-ring\" cx=\"220\" cy=\"119\" rx=\"158\" ry=\"68\" fill=\"url(#novaWhiteRoadsterAura)\"/>\n<!-- Directional cold-gas-style jets; no fiery exhaust -->\n<g class=\"thruster-plume thruster-plume-soft\"><path d=\"M83 101 C52 87 22 88 1 97 C19 110 43 116 85 113Z\" fill=\"url(#novaWhiteRoadsterJet)\"/><path d=\"M84 130 C56 124 22 135 5 147 C32 149 61 143 87 137Z\" fill=\"url(#novaWhiteRoadsterJet)\"/></g>\n<g class=\"thruster-lift\"><path d=\"M165 161 C147 177 151 195 172 208 C182 192 179 179 178 164Z\" fill=\"url(#novaWhiteRoadsterLift)\"/><path d=\"M236 167 C224 186 225 196 240 209 C252 192 252 178 245 166Z\" fill=\"url(#novaWhiteRoadsterLift)\"/><path d=\"M308 157 C290 174 290 191 304 204 C316 191 319 175 314 158Z\" fill=\"url(#novaWhiteRoadsterLift)\"/></g>\n<!-- Black rubber performance tires -->\n<g><circle cx=\"148\" cy=\"144\" r=\"31\" fill=\"#070d16\" stroke=\"#798a99\" stroke-width=\"3\"/><circle cx=\"307\" cy=\"144\" r=\"31\" fill=\"#070d16\" stroke=\"#798a99\" stroke-width=\"3\"/><circle cx=\"148\" cy=\"144\" r=\"19\" fill=\"url(#novaWhiteRoadsterWheel)\"/><circle cx=\"307\" cy=\"144\" r=\"19\" fill=\"url(#novaWhiteRoadsterWheel)\"/><circle cx=\"148\" cy=\"144\" r=\"6\" fill=\"#697f93\"/><circle cx=\"307\" cy=\"144\" r=\"6\" fill=\"#697f93\"/></g>\n<!-- Aerodynamic car, standalone on transparent backdrop -->\n<path d=\"M79 119 C87 105 107 93 142 84 L180 49 Q193 36 233 36 Q278 35 307 52 L350 75 Q382 89 410 97 Q432 105 432 121 Q429 133 406 138 L363 141 Q353 111 307 110 Q267 110 255 141 L201 141 Q193 110 148 109 Q109 109 95 144 L77 144 Q71 135 79 119Z\" fill=\"url(#novaWhiteRoadsterPaint)\" stroke=\"#fdfdff\" stroke-width=\"2.5\"/>\n<!-- side sculpting -->\n<path d=\"M102 119 Q208 107 274 112 Q355 115 398 117\" stroke=\"#9fb6c8\" stroke-width=\"2.1\" fill=\"none\" opacity=\".62\"/>\n<path d=\"M113 133 Q207 137 280 133 Q350 133 407 126\" stroke=\"#798fa6\" stroke-width=\"2\" fill=\"none\" opacity=\".43\"/>\n<!-- roofline glass and windshield -->\n<path d=\"M180 54 Q198 42 234 42 Q278 39 308 56 L332 72 L280 76 Q231 81 187 76 L156 73Z\" fill=\"url(#novaWhiteRoadsterGlass)\" stroke=\"#d4f2ff\" stroke-opacity=\".78\" stroke-width=\"1.8\"/>\n<path d=\"M184 54 Q213 62 261 65 Q305 66 327 71\" fill=\"none\" stroke=\"#a8eaff\" stroke-width=\"2\" opacity=\".48\"/>\n<path d=\"M272 43 L291 75\" fill=\"none\" stroke=\"#b5e1f5\" opacity=\".68\" stroke-width=\"2.6\"/>\n<path d=\"M340 80 Q376 91 414 100\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" opacity=\".75\"/>\n<!-- headlights -->\n<path d=\"M384 103 L419 110\" stroke=\"#dbfaff\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<path d=\"M387 109 L420 114\" stroke=\"#90dcff\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".85\"/>\n<!-- rear lights and exterior trim -->\n<path d=\"M88 108 Q82 122 90 136\" stroke=\"#fd4766\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/>\n<path d=\"M108 100 Q102 119 108 136\" stroke=\"#e3f7ff\" stroke-opacity=\".75\" stroke-width=\"2\" fill=\"none\"/>\n<path d=\"M220 114 L244 115\" stroke=\"#71879a\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n</svg></div>\n<span class=\"roadster-real-label\">TESLA PHOTO · THRUSTERS SIMULATED</span>\n</div></a>";
 document.body.appendChild(craft);
 const SECONDARY_IMAGE_URL="https://img.numerama.com/www.numerama.com/wp-content/uploads/2026/10/tesla-roadster-223.jpg?key=62c643d0";
 const body=craft.querySelector('.roadster-real-core');
 // Source one: credited Tesla publicity photograph. If its original host blocks
 // image embedding, retry with a second Tesla publicity image at a known scale.
 // The previous SVG stays hidden as a final graceful fallback.
 const photo=craft.querySelector('#roadster-real-photo-source');
 const artwork=craft.querySelector('.roadster-photo-art');
 const fallback=craft.querySelector('.roadster-photo-fallback');
 let photoAttempt=0;
 photo.addEventListener('error',()=>{
  if(photoAttempt===0){
   photoAttempt=1;
   photo.setAttribute('transform','translate(-314 -259) scale(1.6)');
   photo.setAttribute('href',SECONDARY_IMAGE_URL);
  }else if(photoAttempt===1){
   photoAttempt=2;artwork.hidden=true;fallback.hidden=false;
  }
 });

 let width=0,height=0,elapsed=0,previousTime=0,frame=0;
 let previousX=0,previousY=0,previousFacing=1;
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 function measure(){const rect=craft.getBoundingClientRect();width=rect.width;height=rect.height}
 function fly(seconds){
  const topbar=document.querySelector('.topbar');
  const bottom=topbar?topbar.getBoundingClientRect().bottom:84;
  const minX=10,maxX=Math.max(minX,window.innerWidth-width-12);
  const minY=Math.min(Math.max(bottom+16,95),Math.max(95,window.innerHeight-height-25));
  const maxY=Math.max(minY,window.innerHeight-height-22);
  // Drift across the screen like the original red Starman, but on a different orbit.
  // Two slower waves and a smaller active thruster wiggle create independently varied motion.
  const x=clamp(minX+(maxX-minX)*(.50+.39*Math.sin(seconds/8.7)+.075*Math.sin(seconds/2.8)),minX,maxX);
  const y=clamp(minY+(maxY-minY)*(.44+.33*Math.cos(seconds/7.6)+.075*Math.sin(seconds/3.4)),minY,maxY);
  const dx=x-previousX,dy=y-previousY;
  if(Math.abs(dx)>.08)previousFacing=dx<0?-1:1;
  const bank=clamp(dy*.43,-10,10)+2.1*Math.sin(seconds/2.5);
  // One short kickflip roughly once per 46 seconds, with no movement on reduced-motion devices.
  const phase=(seconds+22)%46;
  const progress=clamp((phase-0.7)/1.25,0,1);
  const ease=progress*progress*(3-2*progress);
  const flip=phase>.7&&phase<1.95?ease*360:0;
  craft.style.setProperty('--roadster-real-x',Math.round(x)+'px');
  craft.style.setProperty('--roadster-real-y',Math.round(y)+'px');
  craft.style.setProperty('--roadster-facing',String(previousFacing));
  craft.style.setProperty('--roadster-bank',bank.toFixed(2)+'deg');
  craft.style.setProperty('--roadster-flip',flip.toFixed(1)+'deg');
  body.dataset.thrust=(phase>0.7&&phase<2.7)||Math.sin(seconds*.64)>.8?'lift':(Math.abs(dx)+Math.abs(dy)<.5?'coast':'forward');
  previousX=x;previousY=y;
 }
 function animate(now){
  frame=0;
  if(document.hidden||reduced.matches){previousTime=0;return}
  if(previousTime)elapsed+=Math.min(now-previousTime,100)/1000;
  previousTime=now;
  fly(elapsed);
  frame=requestAnimationFrame(animate);
 }
 function sync(){
  cancelAnimationFrame(frame);frame=0;previousTime=0;measure();
  if(document.hidden)return;
  if(reduced.matches){
   craft.style.setProperty('--roadster-real-x',Math.max(12,window.innerWidth-width-16)+'px');
   craft.style.setProperty('--roadster-real-y','110px');
   craft.style.setProperty('--roadster-facing','1');
   craft.style.setProperty('--roadster-bank','0deg');
   craft.style.setProperty('--roadster-flip','0deg');
   body.dataset.thrust='coast';
  }else{fly(elapsed);frame=requestAnimationFrame(animate)}
 }
 window.addEventListener('resize',sync,{passive:true});
 document.addEventListener('visibilitychange',sync);
 if(reduced.addEventListener)reduced.addEventListener('change',sync);
 sync();
})();