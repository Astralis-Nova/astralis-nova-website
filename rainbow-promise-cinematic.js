(() => {
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;

  document.body.classList.add('rp-cinematic');

  const style = document.createElement('style');
  style.textContent = `
    .rp-cinematic{
      background:
        radial-gradient(circle at 48% -4%,rgba(117,161,207,.18),transparent 31%),
        linear-gradient(180deg,#203a56 0%,#14283b 24%,#0a1724 60%,#050c14 100%)!important;
    }
    .rp-cinematic main{position:relative;z-index:5;padding-top:44px}
    .rp-cinematic .hero{padding:20px 0 28px}
    .rp-cinematic h1{text-shadow:0 0 46px rgba(226,241,255,.22)}
    .rp-rain-canvas,.rp-lightning,.rp-drizzle,.rp-fog{position:fixed;inset:0;pointer-events:none}
    .rp-rain-canvas{z-index:2;opacity:.96}
    .rp-lightning{z-index:50;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 48% 17%,rgba(255,255,255,.8),transparent 21%),linear-gradient(180deg,rgba(255,255,255,.3),transparent)}
    .rp-drizzle{z-index:3;opacity:.12;background:repeating-linear-gradient(110deg,transparent 0 16px,rgba(224,242,255,.06) 16px 19px,transparent 19px 34px);animation:rpSheet 12s linear infinite}
    .rp-fog{z-index:4;opacity:.5;filter:blur(14px);background:radial-gradient(circle at 15% 100%,rgba(220,239,255,.14),transparent 24%),radial-gradient(circle at 50% 100%,rgba(208,230,248,.16),transparent 28%),radial-gradient(circle at 85% 100%,rgba(220,239,255,.14),transparent 24%);animation:rpFog 20s ease-in-out infinite alternate}
    .rp-cinematic header,.rp-cinematic main,.rp-cinematic footer{position:relative;z-index:6}

    .rp-cinematic .rainbow-wrap{
      position:relative;height:min(720px,72vw);min-height:520px;max-width:1120px;margin:34px auto 8px;border-radius:34px;overflow:hidden;
      border:1px solid rgba(182,221,255,.18);box-shadow:0 28px 100px rgba(0,0,0,.46);isolation:isolate;
      background:
        radial-gradient(ellipse at 50% 7%,rgba(226,239,252,.18),transparent 27%),
        linear-gradient(180deg,rgba(134,169,202,.18),rgba(62,88,119,.18) 19%,rgba(15,30,46,.3) 47%,rgba(5,12,20,.86)),
        linear-gradient(180deg,#526b85 0%,#2a4059 20%,#172a3d 45%,#0b1723 70%,#060c14 100%);
    }
    .rp-cinematic .rainbow-wrap::before{
      content:"";position:absolute;inset:0;z-index:18;pointer-events:none;opacity:.24;mix-blend-mode:soft-light;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.33'/%3E%3C/svg%3E");
    }
    .rp-cinematic .rainbow-wrap::after{content:"";position:absolute;inset:0;z-index:20;pointer-events:none;box-shadow:inset 0 0 90px rgba(3,8,14,.2),inset 0 -170px 180px rgba(3,7,12,.72)}

    .rp-sunbreak{position:absolute;left:50%;top:7%;width:min(590px,64vw);height:min(490px,54vw);transform:translateX(-50%);border-radius:50%;z-index:1;opacity:.82;filter:blur(15px);background:radial-gradient(ellipse,rgba(255,255,255,.46) 0%,rgba(226,239,252,.22) 25%,rgba(189,216,245,.08) 43%,transparent 69%);animation:rpGlow 9s ease-in-out infinite alternate}
    .rp-light-shaft{position:absolute;left:50%;top:3%;width:58%;height:72%;transform:translateX(-50%);z-index:2;opacity:.24;filter:blur(14px);clip-path:polygon(32% 0,68% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(245,250,255,.55),rgba(209,230,248,.08) 72%,transparent)}

    .rp-rainbow-field{position:absolute;left:50%;top:9%;transform:translateX(-50%);width:min(950px,98%);height:min(555px,60vw);max-height:530px;z-index:6;pointer-events:none;filter:drop-shadow(0 0 26px rgba(199,226,249,.16))}
    .rp-rainbow-main,.rp-rainbow-soft,.rp-rainbow-second{position:absolute;inset:0;border-radius:50% 50% 0 0/100% 100% 0 0;overflow:hidden}
    .rp-rainbow-main{
      opacity:.72;filter:blur(1.5px) saturate(.9);
      background:conic-gradient(from 270deg at 50% 100%,rgba(235,80,105,.9) 0deg 4deg,rgba(243,133,56,.88) 4deg 8deg,rgba(244,203,76,.82) 8deg 12deg,rgba(78,185,107,.74) 12deg 16deg,rgba(64,160,222,.68) 16deg 20deg,rgba(72,105,205,.62) 20deg 24deg,rgba(143,78,188,.55) 24deg 28deg,transparent 28deg 152deg,rgba(143,78,188,.55) 152deg 156deg,rgba(72,105,205,.62) 156deg 160deg,rgba(64,160,222,.68) 160deg 164deg,rgba(78,185,107,.74) 164deg 168deg,rgba(244,203,76,.82) 168deg 172deg,rgba(243,133,56,.88) 172deg 176deg,rgba(235,80,105,.9) 176deg 180deg,transparent 180deg);
      -webkit-mask:radial-gradient(ellipse at 50% 100%,transparent 0 52%,#000 52.5% 63%,transparent 63.5%),linear-gradient(#000 0 0);
      -webkit-mask-composite:source-in;mask:radial-gradient(ellipse at 50% 100%,transparent 0 52%,#000 52.5% 63%,transparent 63.5%);
    }
    .rp-rainbow-soft{opacity:.58;filter:blur(12px);background:radial-gradient(ellipse at 50% 100%,transparent 0 51%,rgba(238,106,119,.2) 52%,rgba(239,181,83,.18) 54%,rgba(110,203,131,.14) 57%,rgba(92,178,229,.14) 60%,rgba(138,100,207,.12) 63%,transparent 66%)}
    .rp-rainbow-second{inset:2% -4% -2%;opacity:.14;filter:blur(3px);background:radial-gradient(ellipse at 50% 100%,transparent 0 67%,rgba(159,92,215,.38) 67.5% 68.2%,rgba(76,174,232,.35) 68.2% 69%,rgba(92,198,118,.32) 69% 69.8%,rgba(244,207,78,.3) 69.8% 70.6%,rgba(242,144,58,.28) 70.6% 71.4%,rgba(239,96,114,.28) 71.4% 72.2%,transparent 73%)}
    .rp-rainbow-field::after{content:"";position:absolute;inset:0;opacity:.84;background:linear-gradient(90deg,rgba(14,28,43,.5),transparent 17% 83%,rgba(14,28,43,.56)),linear-gradient(180deg,rgba(255,255,255,.1),transparent 40%,rgba(8,17,27,.48) 100%);mix-blend-mode:multiply}

    .rp-cloud-bank{position:absolute;z-index:9;filter:url(#rp-cloud-distort) drop-shadow(0 18px 30px rgba(0,0,0,.28));will-change:transform}
    .rp-cloud-bank span{position:absolute;display:block;border-radius:50%;background:radial-gradient(circle at 42% 30%,rgba(239,246,251,.94),rgba(177,198,215,.9) 55%,rgba(104,128,151,.82) 100%)}
    .rp-cloud-bank::after{content:"";position:absolute;left:4%;right:4%;bottom:0;height:40%;border-radius:50%;background:linear-gradient(180deg,rgba(178,199,216,.82),rgba(80,105,129,.78));filter:blur(5px)}
    .rp-cloud-front-left{left:-3%;top:41%;width:410px;height:190px;animation:rpCloudLeft 21s ease-in-out infinite alternate}
    .rp-cloud-front-right{right:-4%;top:39%;width:445px;height:205px;animation:rpCloudRight 24s ease-in-out infinite alternate}
    .rp-cloud-back-left{left:10%;top:21%;width:360px;height:165px;opacity:.5;filter:url(#rp-cloud-distort) blur(2.4px);animation:rpCloudBack 29s ease-in-out infinite alternate}
    .rp-cloud-back-right{right:9%;top:19%;width:380px;height:175px;opacity:.44;filter:url(#rp-cloud-distort) blur(2.8px);animation:rpCloudBack2 32s ease-in-out infinite alternate}
    .rp-cloud-bank .l1{width:46%;height:66%;left:0;bottom:3%}.rp-cloud-bank .l2{width:54%;height:84%;left:17%;bottom:7%}.rp-cloud-bank .l3{width:45%;height:71%;left:45%;bottom:4%}.rp-cloud-bank .l4{width:34%;height:53%;left:68%;bottom:0}.rp-cloud-bank .l5{width:34%;height:55%;left:32%;bottom:30%;opacity:.95}

    .rp-vapor{position:absolute;left:-8%;right:-8%;bottom:20%;height:34%;z-index:8;opacity:.84;filter:blur(24px);background:radial-gradient(ellipse at 16% 58%,rgba(219,235,247,.27),transparent 27%),radial-gradient(ellipse at 44% 62%,rgba(204,225,241,.22),transparent 31%),radial-gradient(ellipse at 75% 56%,rgba(220,237,250,.24),transparent 28%),radial-gradient(ellipse at 95% 68%,rgba(181,211,233,.16),transparent 25%);animation:rpMist 17s ease-in-out infinite alternate}
    .rp-horizon{position:absolute;left:0;right:0;bottom:22%;height:22%;z-index:7;background:linear-gradient(180deg,transparent,rgba(154,193,221,.12) 48%,rgba(184,215,236,.18));filter:blur(13px)}

    .rp-ark{position:absolute;left:50%;bottom:25%;transform:translateX(-50%);width:190px;height:74px;z-index:11;opacity:.84;filter:blur(.15px) drop-shadow(0 8px 12px rgba(0,0,0,.36))}
    .rp-ark::before{content:"";position:absolute;left:0;right:0;bottom:0;height:44px;background:linear-gradient(180deg,rgba(49,31,20,.96),rgba(17,10,6,.96));clip-path:polygon(9% 8%,89% 8%,100% 72%,0 72%);border-radius:0 0 22px 22px}
    .rp-ark::after{content:"";position:absolute;left:34%;bottom:30px;width:62px;height:18px;border-radius:16px 16px 4px 4px;background:linear-gradient(180deg,rgba(59,38,25,.96),rgba(24,15,9,.96))}
    .rp-water{position:absolute;left:0;right:0;bottom:0;height:32%;z-index:3;background:linear-gradient(180deg,rgba(128,171,203,.11),rgba(35,67,94,.24) 25%,rgba(13,28,44,.82) 73%,rgba(6,14,23,.96))}
    .rp-water::before,.rp-water::after{content:"";position:absolute;left:-10%;right:-10%;border-radius:50%;background:repeating-linear-gradient(90deg,rgba(255,255,255,.075) 0 7px,transparent 7px 24px);opacity:.12;filter:blur(1px)}.rp-water::before{top:22%;height:30%;animation:rpRipple 7s linear infinite}.rp-water::after{top:43%;height:28%;animation:rpRipple 9s linear infinite reverse}
    .rp-reflection{position:absolute;left:50%;bottom:5%;transform:translateX(-50%) scaleY(-1);width:min(800px,86%);height:165px;z-index:4;opacity:.1;filter:blur(12px);clip-path:ellipse(42% 58% at 50% 0%);background:linear-gradient(180deg,rgba(239,96,114,.24),rgba(242,144,58,.18) 15%,rgba(244,207,78,.16) 29%,rgba(92,198,118,.13) 43%,rgba(76,174,232,.13) 57%,rgba(77,122,227,.11) 69%,rgba(159,92,215,.09) 80%,transparent)}

    .rp-caption{position:absolute;left:20px;right:20px;bottom:18px;z-index:15;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:18px 20px;border-radius:24px;border:1px solid rgba(186,223,255,.14);background:linear-gradient(180deg,rgba(8,23,40,.32),rgba(4,11,19,.6));backdrop-filter:blur(11px);text-align:left}.rp-caption strong{display:block;font-size:1.04rem}.rp-caption span{display:block;color:#cfe7fa;line-height:1.6;margin-top:4px;max-width:700px;font-size:.94rem}.rp-tag{white-space:nowrap;border:1px solid rgba(186,223,255,.16);background:rgba(255,255,255,.045);border-radius:999px;padding:10px 14px;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}

    @keyframes rpGlow{from{transform:translateX(-50%) translateY(0) scale(1)}to{transform:translateX(-50%) translateY(9px) scale(1.04)}}
    @keyframes rpCloudLeft{from{transform:translate3d(-7px,0,0) scale(1)}to{transform:translate3d(19px,5px,0) scale(1.025)}}
    @keyframes rpCloudRight{from{transform:translate3d(10px,0,0) scale(1.02)}to{transform:translate3d(-18px,4px,0) scale(1)}}
    @keyframes rpCloudBack{from{transform:translateX(-8px)}to{transform:translateX(22px)}}
    @keyframes rpCloudBack2{from{transform:translateX(12px)}to{transform:translateX(-20px)}}
    @keyframes rpMist{from{transform:translateX(-3%)}to{transform:translateX(3%)}}
    @keyframes rpRipple{from{transform:translateX(-3%)}to{transform:translateX(3%)}}
    @keyframes rpSheet{from{transform:translate3d(0,-10%,0)}to{transform:translate3d(-4%,14%,0)}}
    @keyframes rpFog{from{transform:translateX(-1.5%)}to{transform:translateX(1.5%)}}

    @media(max-width:980px){.rp-caption{flex-direction:column;align-items:flex-start}.rp-ark{width:170px}.rp-cloud-front-left{left:-12%;transform:scale(.82)}.rp-cloud-front-right{right:-14%;transform:scale(.84)}}
    @media(max-width:760px){
      .rp-cinematic .rainbow-wrap{min-height:500px;height:min(610px,126vw);border-radius:26px}
      .rp-rainbow-field{top:15%;height:54vw}.rp-sunbreak{top:14%;width:75vw;height:68vw}.rp-light-shaft{top:10%;width:78%}
      .rp-cloud-front-left{left:-29%;top:45%;transform:scale(.68)}.rp-cloud-front-right{right:-34%;top:43%;transform:scale(.7)}
      .rp-cloud-back-left{left:-8%;top:26%;transform:scale(.68)}.rp-cloud-back-right{right:-12%;top:24%;transform:scale(.68)}
      .rp-caption{left:14px;right:14px;bottom:14px;padding:16px}.rp-caption span{font-size:.9rem}.rp-ark{width:132px;height:54px;bottom:28%}.rp-ark::after{width:48px;bottom:24px}
    }
    @media(prefers-reduced-motion:reduce){.rp-rain-canvas{display:none}.rp-drizzle,.rp-fog,.rp-cloud-bank,.rp-vapor,.rp-water::before,.rp-water::after{animation:none!important}}
  `;
  document.head.appendChild(style);

  wrap.innerHTML = `
    <svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
      <filter id="rp-cloud-distort" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.02" numOctaves="3" seed="11" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="17" xChannelSelector="R" yChannelSelector="B"/>
      </filter>
    </svg>
    <div class="rp-sunbreak"></div><div class="rp-light-shaft"></div>
    <div class="rp-rainbow-field" aria-hidden="true"><div class="rp-rainbow-soft"></div><div class="rp-rainbow-main"></div><div class="rp-rainbow-second"></div></div>
    <div class="rp-cloud-bank rp-cloud-back-left"><span class="l1"></span><span class="l2"></span><span class="l3"></span><span class="l4"></span><span class="l5"></span></div>
    <div class="rp-cloud-bank rp-cloud-back-right"><span class="l1"></span><span class="l2"></span><span class="l3"></span><span class="l4"></span><span class="l5"></span></div>
    <div class="rp-vapor"></div><div class="rp-horizon"></div>
    <div class="rp-cloud-bank rp-cloud-front-left"><span class="l1"></span><span class="l2"></span><span class="l3"></span><span class="l4"></span><span class="l5"></span></div>
    <div class="rp-cloud-bank rp-cloud-front-right"><span class="l1"></span><span class="l2"></span><span class="l3"></span><span class="l4"></span><span class="l5"></span></div>
    <div class="rp-ark" aria-hidden="true"></div><div class="rp-reflection" aria-hidden="true"></div><div class="rp-water" aria-hidden="true"></div>
    <div class="rp-caption"><div><strong>Rain meets light. The promise becomes visible.</strong><span>A softer, mist-borne rainbow emerges through layered storm clouds while the ark rests beneath the breaking sky.</span></div><div class="rp-tag">After the Storm</div></div>`;

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
    wrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.13)'},{filter:'brightness(1.035)'},{filter:'brightness(1)'}],{duration:800,easing:'ease-out'});
    setTimeout(flash,4500+Math.random()*9000);
  }

  resize(); draw(); setTimeout(flash,3500+Math.random()*5000);
  addEventListener('resize',resize);
  addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
