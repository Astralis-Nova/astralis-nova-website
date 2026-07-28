(() => {
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;

  document.body.classList.add('rp-cinematic');
  const style = document.createElement('style');
  style.textContent = `
    .rp-cinematic{
      background:radial-gradient(circle at 50% 0%,rgba(106,151,204,.17),transparent 28%),linear-gradient(180deg,#1e3651 0%,#122235 24%,#091420 58%,#050c14 100%)!important;
    }
    .rp-cinematic body::before{opacity:.2}
    .rp-cinematic main{position:relative;z-index:5;padding-top:44px}
    .rp-cinematic .hero{padding:20px 0 28px}
    .rp-cinematic h1{text-shadow:0 0 42px rgba(255,255,255,.22)}
    .rp-rain-canvas,.rp-lightning,.rp-drizzle,.rp-fog{position:fixed;inset:0;pointer-events:none}
    .rp-rain-canvas{z-index:2;opacity:.96}
    .rp-lightning{z-index:50;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.78),transparent 20%),linear-gradient(180deg,rgba(255,255,255,.3),transparent)}
    .rp-drizzle{z-index:3;opacity:.12;background:repeating-linear-gradient(110deg,transparent 0 16px,rgba(224,242,255,.06) 16px 19px,transparent 19px 34px);animation:rpSheet 12s linear infinite}
    .rp-fog{z-index:4;opacity:.5;filter:blur(14px);background:radial-gradient(circle at 15% 100%,rgba(220,239,255,.14),transparent 24%),radial-gradient(circle at 50% 100%,rgba(208,230,248,.16),transparent 28%),radial-gradient(circle at 85% 100%,rgba(220,239,255,.14),transparent 24%);animation:rpFog 20s ease-in-out infinite alternate}
    .rp-cinematic header,.rp-cinematic main,.rp-cinematic footer{position:relative;z-index:6}
    .rp-cinematic .rainbow-wrap{
      position:relative;height:min(720px,72vw);min-height:520px;max-width:1120px;margin:34px auto 8px;border-radius:34px;overflow:hidden;
      border:1px solid rgba(182,221,255,.2);box-shadow:0 26px 90px rgba(0,0,0,.44);isolation:isolate;
      background:linear-gradient(180deg,rgba(154,189,219,.16),rgba(79,107,145,.14) 18%,rgba(16,31,48,.24) 44%,rgba(5,12,20,.78)),radial-gradient(circle at 50% 16%,rgba(229,240,255,.16),transparent 18%),linear-gradient(180deg,#4c6684 0%,#263b56 18%,#132537 44%,#091521 67%,#060c14 100%);
    }
    .rp-cinematic .rainbow-wrap::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.14),transparent 18%),linear-gradient(180deg,rgba(255,255,255,.04),transparent 28%,rgba(255,255,255,.03) 38%,transparent 50%);mix-blend-mode:screen;opacity:.85;z-index:2}
    .rp-cinematic .rainbow-wrap::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -140px 160px rgba(3,7,12,.66);z-index:20;pointer-events:none}
    .rp-glow{position:absolute;left:50%;top:14%;width:min(460px,56vw);height:min(460px,56vw);transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.52),rgba(241,247,255,.23) 22%,rgba(204,223,255,0) 58%);filter:blur(9px);animation:rpGlow 8s ease-in-out infinite alternate;z-index:1}
    .rp-rainbow{position:absolute;left:50%;top:10%;transform:translateX(-50%);width:min(900px,96%);height:min(520px,56vw);max-height:500px;z-index:5;filter:drop-shadow(0 0 24px rgba(198,230,255,.22))}
    .rp-band{position:absolute;left:50%;transform:translateX(-50%);border-radius:50% 50% 0 0/100% 100% 0 0;border:clamp(10px,1.4vw,16px) solid transparent;border-bottom:none;opacity:.95;mix-blend-mode:screen}
    .rp-b1{width:100%;height:100%;border-color:rgba(239,96,114,.9)}.rp-b2{width:92%;height:92%;top:4.5%;border-color:rgba(242,144,58,.88)}.rp-b3{width:84%;height:84%;top:8.8%;border-color:rgba(244,207,78,.86)}.rp-b4{width:76%;height:76%;top:13%;border-color:rgba(92,198,118,.84)}.rp-b5{width:68%;height:68%;top:17.2%;border-color:rgba(76,174,232,.84)}.rp-b6{width:60%;height:60%;top:21.4%;border-color:rgba(77,122,227,.82)}.rp-b7{width:52%;height:52%;top:25.6%;border-color:rgba(159,92,215,.8)}
    .rp-cloud{position:absolute;border-radius:999px;background:linear-gradient(180deg,rgba(247,251,255,.93),rgba(167,193,214,.9));filter:drop-shadow(0 16px 28px rgba(0,0,0,.25));z-index:8}
    .rp-cloud::before,.rp-cloud::after{content:"";position:absolute;border-radius:50%;background:inherit}
    .rp-c1{left:5%;top:43%;width:270px;height:80px;animation:rpCloud 15s ease-in-out infinite alternate}.rp-c1::before{width:116px;height:116px;left:34px;bottom:22px}.rp-c1::after{width:92px;height:92px;right:34px;bottom:18px}
    .rp-c2{right:5%;top:41%;width:300px;height:88px;animation:rpCloud 18s ease-in-out infinite alternate-reverse}.rp-c2::before{width:122px;height:122px;left:38px;bottom:24px}.rp-c2::after{width:102px;height:102px;right:38px;bottom:18px}
    .rp-c3{left:16%;top:28%;width:220px;height:64px;opacity:.45;filter:blur(2px);animation:rpCloud 24s ease-in-out infinite alternate}.rp-c3::before{width:96px;height:96px;left:28px;bottom:18px}.rp-c3::after{width:78px;height:78px;right:28px;bottom:14px}
    .rp-c4{right:18%;top:26%;width:230px;height:68px;opacity:.42;filter:blur(2px);animation:rpCloud 26s ease-in-out infinite alternate-reverse}.rp-c4::before{width:100px;height:100px;left:26px;bottom:20px}.rp-c4::after{width:82px;height:82px;right:26px;bottom:15px}
    .rp-mist{position:absolute;left:-8%;right:-8%;bottom:22%;height:28%;z-index:7;opacity:.88;filter:blur(22px);background:radial-gradient(circle at 20% 50%,rgba(222,238,250,.22),transparent 22%),radial-gradient(circle at 52% 56%,rgba(210,230,247,.2),transparent 28%),radial-gradient(circle at 82% 48%,rgba(227,240,252,.18),transparent 24%);animation:rpMist 14s ease-in-out infinite alternate}
    .rp-horizon{position:absolute;left:0;right:0;bottom:23%;height:18%;z-index:6;background:linear-gradient(180deg,rgba(144,183,214,0),rgba(143,188,224,.12) 60%,rgba(165,204,232,.18));filter:blur(10px)}
    .rp-ark{position:absolute;left:50%;bottom:26%;transform:translateX(-50%);width:190px;height:74px;z-index:10;opacity:.86}.rp-ark::before{content:"";position:absolute;left:0;right:0;bottom:0;height:44px;background:linear-gradient(180deg,rgba(46,29,19,.96),rgba(18,10,6,.94));clip-path:polygon(10% 10%,88% 10%,100% 74%,0 74%);border-radius:0 0 22px 22px}.rp-ark::after{content:"";position:absolute;left:34%;bottom:30px;width:62px;height:18px;border-radius:16px 16px 4px 4px;background:linear-gradient(180deg,rgba(54,34,23,.96),rgba(25,16,10,.94))}
    .rp-water{position:absolute;left:0;right:0;bottom:0;height:31%;z-index:3;background:linear-gradient(180deg,rgba(134,177,209,.1),rgba(34,67,95,.2) 24%,rgba(13,27,43,.8) 72%,rgba(6,14,23,.95))}.rp-water::before,.rp-water::after{content:"";position:absolute;left:-10%;right:-10%;border-radius:50%;background:repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 7px,transparent 7px 22px);opacity:.12;filter:blur(1px)}.rp-water::before{top:22%;height:30%;animation:rpRipple 7s linear infinite}.rp-water::after{top:42%;height:28%;animation:rpRipple 9s linear infinite reverse}
    .rp-reflection{position:absolute;left:50%;bottom:6%;transform:translateX(-50%) scaleY(-1);width:min(780px,84%);height:150px;z-index:4;opacity:.16;filter:blur(10px);clip-path:ellipse(40% 60% at 50% 0%);background:linear-gradient(180deg,rgba(239,96,114,.28) 0 11%,rgba(242,144,58,.22) 11% 22%,rgba(244,207,78,.2) 22% 33%,rgba(92,198,118,.18) 33% 44%,rgba(76,174,232,.18) 44% 55%,rgba(77,122,227,.16) 55% 66%,rgba(159,92,215,.14) 66% 77%,transparent 77%)}
    .rp-caption{position:absolute;left:20px;right:20px;bottom:18px;z-index:15;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:18px 20px;border-radius:24px;border:1px solid rgba(186,223,255,.16);background:linear-gradient(180deg,rgba(8,23,40,.38),rgba(4,11,19,.58));backdrop-filter:blur(10px);text-align:left}.rp-caption strong{display:block;font-size:1.04rem}.rp-caption span{display:block;color:#cfe7fa;line-height:1.6;margin-top:4px;max-width:700px;font-size:.94rem}.rp-tag{white-space:nowrap;border:1px solid rgba(186,223,255,.18);background:rgba(255,255,255,.05);border-radius:999px;padding:10px 14px;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
    @keyframes rpGlow{from{transform:translateX(-50%) translateY(0)}to{transform:translateX(-50%) translateY(8px) scale(1.03)}}@keyframes rpCloud{from{transform:translateX(0)}to{transform:translateX(18px)}}@keyframes rpMist{from{transform:translateX(-2.5%)}to{transform:translateX(2.5%)}}@keyframes rpRipple{from{transform:translateX(-3%)}to{transform:translateX(3%)}}@keyframes rpSheet{from{transform:translate3d(0,-10%,0)}to{transform:translate3d(-4%,14%,0)}}@keyframes rpFog{from{transform:translateX(-1.5%)}to{transform:translateX(1.5%)}}@keyframes skyPulse{from{opacity:.76}to{opacity:1}}
    @media(max-width:980px){.rp-caption{flex-direction:column;align-items:flex-start}.rp-ark{width:170px}.rp-c1{width:220px;height:72px}.rp-c2{width:240px;height:76px}}
    @media(max-width:760px){.rp-cinematic .rainbow-wrap{min-height:500px;height:min(600px,122vw);border-radius:26px}.rp-glow{top:16%;width:70vw;height:70vw}.rp-rainbow{top:16%;height:50vw}.rp-c1{left:2%;top:44%;transform:scale(.7)}.rp-c2{right:2%;top:42%;transform:scale(.72)}.rp-c3{left:10%;top:26%;transform:scale(.75)}.rp-c4{right:10%;top:24%;transform:scale(.75)}.rp-caption{left:14px;right:14px;bottom:14px;padding:16px}.rp-caption span{font-size:.9rem}.rp-ark{width:132px;height:54px;bottom:29%}.rp-ark::after{width:48px;bottom:24px}}
    @media(prefers-reduced-motion:reduce){.rp-rain-canvas{display:none}.rp-drizzle,.rp-fog,.rp-cloud,.rp-mist,.rp-water::before,.rp-water::after{animation:none!important}}
  `;
  document.head.appendChild(style);

  wrap.innerHTML = `
    <div class="rp-glow"></div>
    <div class="rp-rainbow" aria-hidden="true">
      <span class="rp-band rp-b1"></span><span class="rp-band rp-b2"></span><span class="rp-band rp-b3"></span>
      <span class="rp-band rp-b4"></span><span class="rp-band rp-b5"></span><span class="rp-band rp-b6"></span><span class="rp-band rp-b7"></span>
    </div>
    <div class="rp-cloud rp-c3"></div><div class="rp-cloud rp-c4"></div>
    <div class="rp-mist"></div><div class="rp-horizon"></div>
    <div class="rp-cloud rp-c1"></div><div class="rp-cloud rp-c2"></div>
    <div class="rp-ark" aria-hidden="true"></div><div class="rp-reflection" aria-hidden="true"></div><div class="rp-water" aria-hidden="true"></div>
    <div class="rp-caption"><div><strong>Rain meets light. The promise becomes visible.</strong><span>A storm-soaked sky, a living rainbow, and the silhouette of the ark turn this reflection into a cinematic moment—part weather, part memory, part covenant.</span></div><div class="rp-tag">After the Storm</div></div>`;

  const canvas = document.createElement('canvas');
  canvas.className = 'rp-rain-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const lightning = document.createElement('div');
  lightning.className = 'rp-lightning';
  lightning.setAttribute('aria-hidden', 'true');
  const drizzle = document.createElement('div');
  drizzle.className = 'rp-drizzle';
  drizzle.setAttribute('aria-hidden', 'true');
  const fog = document.createElement('div');
  fog.className = 'rp-fog';
  fog.setAttribute('aria-hidden', 'true');
  document.body.append(canvas, lightning, drizzle, fog);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, drops = [], frame;
  const makeDrop = () => {
    const d = Math.random();
    return {x:Math.random()*w,y:Math.random()*h-h,len:12+d*28,speed:8+d*18,drift:2+d*3.5,alpha:.08+d*.24,line:.5+d*1.3};
  };
  function resize(){
    w = innerWidth; h = innerHeight;
    const r = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w*r; canvas.height = h*r; canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(r,0,0,r,0,0);
    drops = Array.from({length:Math.max(120,Math.floor(w/7))},makeDrop);
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const d of drops){
      ctx.beginPath(); ctx.lineWidth=d.line; ctx.strokeStyle='rgba(215,236,255,'+d.alpha+')';
      ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-d.drift,d.y+d.len); ctx.stroke();
      d.x-=d.drift*.22; d.y+=d.speed;
      if(d.y>h+40||d.x<-40) Object.assign(d,makeDrop(),{y:-30-Math.random()*h*.35,x:Math.random()*w+40});
    }
    frame=requestAnimationFrame(draw);
  }
  function flash(){
    lightning.animate([{opacity:0},{opacity:.16,offset:.08},{opacity:.52,offset:.18},{opacity:.08,offset:.5},{opacity:.3,offset:.68},{opacity:0}],{duration:700+Math.random()*420,easing:'ease-out'});
    wrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.12)'},{filter:'brightness(1.03)'},{filter:'brightness(1)'}],{duration:780,easing:'ease-out'});
    setTimeout(flash,4500+Math.random()*9000);
  }
  resize(); draw(); setTimeout(flash,3500+Math.random()*5000);
  addEventListener('resize',resize);
  addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
