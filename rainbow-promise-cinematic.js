(() => {
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;

  const STORM = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Stormcloud.jpg';
  const RAINBOW = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_rainbow.jpg/768px-The_rainbow.jpg';
  const ARK = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg/1280px-Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('rp-photo-motion');

  const style = document.createElement('style');
  style.textContent = `
    .rp-photo-motion{background:radial-gradient(circle at 50% -4%,rgba(112,154,197,.2),transparent 32%),linear-gradient(180deg,#1c334b,#0c1927 52%,#050c14)!important}
    .rp-photo-motion main{position:relative;z-index:6;padding-top:44px}.rp-photo-motion .hero{padding:20px 0 28px}.rp-photo-motion h1{text-shadow:0 0 48px rgba(222,240,255,.23)}
    .rp-rain-canvas,.rp-lightning,.rp-drizzle,.rp-fog{position:fixed;inset:0;pointer-events:none}.rp-rain-canvas{z-index:2;opacity:.97}.rp-lightning{z-index:50;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 52% 15%,rgba(255,255,255,.85),transparent 21%),linear-gradient(180deg,rgba(255,255,255,.32),transparent)}.rp-drizzle{z-index:3;opacity:.1;background:repeating-linear-gradient(110deg,transparent 0 16px,rgba(224,242,255,.055) 16px 19px,transparent 19px 34px);animation:rpSheet 12s linear infinite}.rp-fog{z-index:4;opacity:.46;filter:blur(16px);background:radial-gradient(circle at 14% 100%,rgba(220,239,255,.14),transparent 24%),radial-gradient(circle at 52% 100%,rgba(208,230,248,.17),transparent 30%),radial-gradient(circle at 88% 100%,rgba(220,239,255,.13),transparent 24%);animation:rpFog 20s ease-in-out infinite alternate}.rp-photo-motion header,.rp-photo-motion main,.rp-photo-motion footer{position:relative;z-index:6}
    .rp-photo-motion .rainbow-wrap{position:relative;height:min(720px,72vw);min-height:520px;max-width:1120px;margin:34px auto 8px;border-radius:34px;overflow:hidden;border:1px solid rgba(190,225,255,.18);box-shadow:0 30px 110px rgba(0,0,0,.52);isolation:isolate;background:#132437}
    .rp-photo-motion .rainbow-wrap::before{content:"";position:absolute;inset:0;z-index:20;pointer-events:none;background:linear-gradient(180deg,rgba(5,15,25,.06),rgba(5,14,23,.2) 42%,rgba(3,9,16,.76) 100%),radial-gradient(ellipse at 53% 16%,rgba(235,245,255,.16),transparent 27%)}
    .rp-photo-motion .rainbow-wrap::after{content:"";position:absolute;inset:0;z-index:21;pointer-events:none;box-shadow:inset 0 0 90px rgba(1,6,11,.28),inset 0 -180px 200px rgba(2,7,12,.72)}
    .rp-sky,.rp-cloud-photo{position:absolute;inset:-7%;background-image:url('${STORM}');background-size:cover;background-position:center 35%;will-change:transform}.rp-sky{z-index:1;filter:saturate(.78) contrast(1.06) brightness(.82);animation:rpSkyPan 34s ease-in-out infinite alternate}.rp-cloud-photo{z-index:4;pointer-events:none;mix-blend-mode:screen}.rp-cloud-back{opacity:.2;filter:blur(4px) brightness(.78) saturate(.75);transform:scale(1.13);mask-image:linear-gradient(180deg,#000 0 62%,transparent 88%);animation:rpCloudBack 43s linear infinite alternate}.rp-cloud-front{opacity:.26;filter:blur(1.5px) brightness(.7) contrast(1.08);transform:scale(1.2);mask-image:linear-gradient(180deg,transparent 0,#000 18% 72%,transparent 96%);animation:rpCloudFront 31s linear infinite alternate-reverse}
    .rp-sunbreak{position:absolute;left:51%;top:2%;width:62%;height:66%;transform:translateX(-50%);z-index:5;opacity:.38;filter:blur(16px);clip-path:polygon(34% 0,66% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(249,252,255,.62),rgba(218,236,249,.08) 78%,transparent);animation:rpLight 12s ease-in-out infinite alternate}
    .rp-rainbow-photo{position:absolute;left:50%;top:3%;width:96%;height:73%;transform:translateX(-50%) scale(1.025);z-index:7;opacity:0;object-fit:cover;object-position:center 43%;filter:saturate(.92) contrast(1.03) brightness(1.04) blur(5px);mix-blend-mode:screen;mask-image:radial-gradient(ellipse at 50% 100%,transparent 0 37%,#000 45% 78%,transparent 92%),linear-gradient(180deg,#000 0 73%,transparent 100%);transition:opacity 7.5s ease,filter 7.5s ease,transform 8s ease}.rp-rainbow-photo.is-visible{opacity:.72;filter:saturate(.96) contrast(1.03) brightness(1.06) blur(.5px);transform:translateX(-50%) scale(1);animation:rpRainbowBreathe 12s ease-in-out 8s infinite alternate}
    .rp-rainbow-haze{position:absolute;left:50%;top:4%;width:98%;height:74%;transform:translateX(-50%);z-index:8;opacity:0;background:radial-gradient(ellipse at 50% 100%,transparent 0 42%,rgba(255,150,159,.13) 49%,rgba(243,205,111,.1) 55%,rgba(118,202,143,.09) 61%,rgba(107,183,232,.09) 67%,rgba(145,112,210,.08) 72%,transparent 80%);filter:blur(18px);transition:opacity 8s ease 1s}.rp-rainbow-haze.is-visible{opacity:.82}
    .rp-ark-photo{position:absolute;left:50%;bottom:20%;width:min(500px,55%);height:37%;transform:translateX(-50%);z-index:12;object-fit:cover;object-position:center 58%;filter:saturate(.72) brightness(.7) contrast(1.18) sepia(.08) drop-shadow(0 12px 20px rgba(0,0,0,.48));clip-path:polygon(3% 18%,97% 18%,97% 90%,3% 90%);mask-image:linear-gradient(180deg,transparent 0,#000 15% 82%,transparent 100%);animation:rpArkBob 6.5s ease-in-out infinite}
    .rp-water{position:absolute;left:-8%;right:-8%;bottom:-3%;height:36%;z-index:10;overflow:hidden;background:linear-gradient(180deg,rgba(127,171,202,.12),rgba(42,75,103,.36) 26%,rgba(14,31,49,.88) 72%,rgba(5,13,22,.98))}.rp-water::before,.rp-water::after{content:"";position:absolute;left:-12%;right:-12%;border-radius:48%;background:repeating-linear-gradient(92deg,rgba(221,240,252,.16) 0 2px,rgba(155,193,220,.05) 2px 12px,transparent 12px 28px);filter:blur(.8px);will-change:transform}.rp-water::before{top:8%;height:48%;opacity:.48;animation:rpWaveA 7s linear infinite}.rp-water::after{top:32%;height:55%;opacity:.34;animation:rpWaveB 10.5s linear infinite reverse}.rp-water-glint{position:absolute;left:5%;right:5%;bottom:3%;height:30%;z-index:11;opacity:.32;filter:blur(5px);background:radial-gradient(ellipse at 50% 0,rgba(225,240,251,.22),transparent 42%),repeating-linear-gradient(90deg,transparent 0 22px,rgba(205,231,247,.12) 22px 30px,transparent 30px 55px);animation:rpGlint 8s ease-in-out infinite alternate}.rp-ark-reflection{position:absolute;left:50%;bottom:2%;width:min(440px,48%);height:25%;transform:translateX(-50%) scaleY(-1);z-index:11;opacity:.16;filter:blur(8px) saturate(.7);background:url('${ARK}') center 58%/cover no-repeat;mask-image:linear-gradient(180deg,#000,transparent 86%);animation:rpReflection 7s ease-in-out infinite}
    .rp-vapor{position:absolute;left:-7%;right:-7%;bottom:21%;height:28%;z-index:13;opacity:.54;filter:blur(24px);background:radial-gradient(ellipse at 18% 57%,rgba(226,240,250,.28),transparent 28%),radial-gradient(ellipse at 51% 64%,rgba(207,228,243,.23),transparent 34%),radial-gradient(ellipse at 84% 56%,rgba(224,239,250,.25),transparent 29%);animation:rpMist 17s ease-in-out infinite alternate}
    .rp-caption{position:absolute;left:20px;right:20px;bottom:18px;z-index:30;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:18px 20px;border-radius:24px;border:1px solid rgba(186,223,255,.14);background:linear-gradient(180deg,rgba(8,23,40,.34),rgba(4,11,19,.65));backdrop-filter:blur(11px);text-align:left}.rp-caption strong{display:block;font-size:1.04rem}.rp-caption span{display:block;color:#cfe7fa;line-height:1.55;margin-top:4px;max-width:700px;font-size:.92rem}.rp-tag{white-space:nowrap;border:1px solid rgba(186,223,255,.16);background:rgba(255,255,255,.045);border-radius:999px;padding:10px 14px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.rp-credit{position:absolute;right:18px;top:14px;z-index:31;color:rgba(232,243,251,.7);font-size:.63rem;line-height:1.45;text-align:right;text-shadow:0 2px 8px rgba(0,0,0,.8)}.rp-credit a{color:inherit}
    @keyframes rpSkyPan{from{transform:scale(1.07) translate3d(-1.2%,0,0)}to{transform:scale(1.12) translate3d(1.4%,-1%,0)}}@keyframes rpCloudBack{from{transform:scale(1.13) translateX(-3%)}to{transform:scale(1.13) translateX(4%)}}@keyframes rpCloudFront{from{transform:scale(1.2) translateX(-4%)}to{transform:scale(1.2) translateX(3%)}}@keyframes rpLight{from{opacity:.25;transform:translateX(-50%) scaleX(.92)}to{opacity:.48;transform:translateX(-50%) scaleX(1.08)}}@keyframes rpRainbowBreathe{from{opacity:.68;filter:saturate(.93) brightness(1.02)}to{opacity:.78;filter:saturate(1.02) brightness(1.1)}}@keyframes rpArkBob{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.15deg)}50%{transform:translateX(-50%) translateY(5px) rotate(.18deg)}}@keyframes rpWaveA{from{transform:translate3d(-3%,0,0) skewX(-4deg)}to{transform:translate3d(4%,3px,0) skewX(4deg)}}@keyframes rpWaveB{from{transform:translate3d(3%,0,0) skewX(3deg)}to{transform:translate3d(-4%,-2px,0) skewX(-3deg)}}@keyframes rpGlint{from{transform:translateX(-2%) scaleY(.92);opacity:.22}to{transform:translateX(2%) scaleY(1.08);opacity:.4}}@keyframes rpReflection{0%,100%{transform:translateX(-50%) scaleY(-1) translateY(0)}50%{transform:translateX(-50%) scaleY(-1) translateY(-5px)}}@keyframes rpMist{from{transform:translateX(-2.5%)}to{transform:translateX(2.5%)}}@keyframes rpSheet{from{transform:translate3d(0,-10%,0)}to{transform:translate3d(-4%,14%,0)}}@keyframes rpFog{from{transform:translateX(-1.5%)}to{transform:translateX(1.5%)}}
    @media(max-width:760px){.rp-photo-motion .rainbow-wrap{min-height:520px;height:min(640px,135vw);border-radius:26px}.rp-rainbow-photo{top:7%;height:65%}.rp-ark-photo{width:72%;height:34%;bottom:22%}.rp-ark-reflection{width:62%}.rp-caption{left:12px;right:12px;bottom:12px;padding:14px;flex-direction:column;align-items:flex-start}.rp-caption span{font-size:.84rem}.rp-credit{right:12px;top:10px;font-size:.55rem}.rp-tag{font-size:.68rem;padding:8px 11px}}
    @media(prefers-reduced-motion:reduce){.rp-rain-canvas{display:none}.rp-drizzle,.rp-fog,.rp-sky,.rp-cloud-photo,.rp-sunbreak,.rp-ark-photo,.rp-water::before,.rp-water::after,.rp-water-glint,.rp-ark-reflection,.rp-vapor{animation:none!important}.rp-rainbow-photo{opacity:.72;filter:saturate(.96) brightness(1.06);transform:translateX(-50%)}.rp-rainbow-haze{opacity:.82}}
  `;
  document.head.appendChild(style);

  wrap.innerHTML = `
    <div class="rp-sky"></div>
    <div class="rp-cloud-photo rp-cloud-back"></div>
    <div class="rp-cloud-photo rp-cloud-front"></div>
    <div class="rp-sunbreak"></div>
    <img class="rp-rainbow-photo" src="${RAINBOW}" alt="A real rainbow appearing through storm clouds">
    <div class="rp-rainbow-haze"></div>
    <img class="rp-ark-photo" src="${ARK}" alt="A full-size Noah's Ark replica above moving water">
    <div class="rp-ark-reflection"></div>
    <div class="rp-water"></div>
    <div class="rp-water-glint"></div>
    <div class="rp-vapor"></div>
    <div class="rp-credit">Storm and Ark: public domain/CC0 via Wikimedia Commons<br>Rainbow: Dietmar Rabich, CC BY-SA 4.0</div>
    <div class="rp-caption"><div><strong>The storm moves, the water answers, and the promise appears.</strong><span>Cloud layers drift at different speeds, the rainbow slowly emerges from the rain, and the ark rides a living surface of ripples and reflected light.</span></div><div class="rp-tag">Living Covenant</div></div>`;

  const rainbow = wrap.querySelector('.rp-rainbow-photo');
  const haze = wrap.querySelector('.rp-rainbow-haze');
  requestAnimationFrame(() => setTimeout(() => {
    rainbow?.classList.add('is-visible');
    haze?.classList.add('is-visible');
  }, reduced ? 0 : 1700));

  const canvas = document.createElement('canvas');
  canvas.className = 'rp-rain-canvas';
  canvas.setAttribute('aria-hidden','true');
  const lightning = document.createElement('div'); lightning.className='rp-lightning'; lightning.setAttribute('aria-hidden','true');
  const drizzle = document.createElement('div'); drizzle.className='rp-drizzle'; drizzle.setAttribute('aria-hidden','true');
  const fog = document.createElement('div'); fog.className='rp-fog'; fog.setAttribute('aria-hidden','true');
  document.body.append(canvas,lightning,drizzle,fog);
  if (reduced) return;

  const ctx = canvas.getContext('2d'); let w=0,h=0,drops=[],frame;
  const makeDrop=()=>{const d=Math.random();return{x:Math.random()*w,y:Math.random()*h-h,len:12+d*28,speed:8+d*18,drift:2+d*3.5,alpha:.08+d*.24,line:.5+d*1.3}};
  function resize(){w=innerWidth;h=innerHeight;const r=Math.min(devicePixelRatio||1,2);canvas.width=w*r;canvas.height=h*r;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(r,0,0,r,0,0);drops=Array.from({length:Math.max(120,Math.floor(w/7))},makeDrop)}
  function draw(){ctx.clearRect(0,0,w,h);for(const d of drops){ctx.beginPath();ctx.lineWidth=d.line;ctx.strokeStyle='rgba(215,236,255,'+d.alpha+')';ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-d.drift,d.y+d.len);ctx.stroke();d.x-=d.drift*.22;d.y+=d.speed;if(d.y>h+40||d.x<-40)Object.assign(d,makeDrop(),{y:-30-Math.random()*h*.35,x:Math.random()*w+40})}frame=requestAnimationFrame(draw)}
  function flash(){lightning.animate([{opacity:0},{opacity:.18,offset:.08},{opacity:.56,offset:.18},{opacity:.08,offset:.5},{opacity:.32,offset:.68},{opacity:0}],{duration:720+Math.random()*460,easing:'ease-out'});wrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.13)'},{filter:'brightness(1.03)'},{filter:'brightness(1)'}],{duration:820,easing:'ease-out'});setTimeout(flash,5000+Math.random()*9500)}
  resize();draw();setTimeout(flash,3800+Math.random()*5000);addEventListener('resize',resize);addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
