(() => {
  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;

  const STORM = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Stormcloud.jpg';
  const RAINBOW = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_rainbow.jpg/768px-The_rainbow.jpg';
  const ARK = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg/1280px-Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg';

  document.body.classList.add('rp-photo-real');

  const style = document.createElement('style');
  style.textContent = `
    .rp-photo-real{
      background:radial-gradient(circle at 50% -4%,rgba(112,154,197,.2),transparent 32%),linear-gradient(180deg,#1c334b,#0c1927 52%,#050c14)!important;
    }
    .rp-photo-real main{position:relative;z-index:6;padding-top:44px}
    .rp-photo-real .hero{padding:20px 0 28px}
    .rp-photo-real h1{text-shadow:0 0 48px rgba(222,240,255,.23)}
    .rp-rain-canvas,.rp-lightning,.rp-drizzle,.rp-fog{position:fixed;inset:0;pointer-events:none}
    .rp-rain-canvas{z-index:2;opacity:.97}
    .rp-lightning{z-index:50;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 52% 15%,rgba(255,255,255,.85),transparent 21%),linear-gradient(180deg,rgba(255,255,255,.32),transparent)}
    .rp-drizzle{z-index:3;opacity:.1;background:repeating-linear-gradient(110deg,transparent 0 16px,rgba(224,242,255,.055) 16px 19px,transparent 19px 34px);animation:rpSheet 12s linear infinite}
    .rp-fog{z-index:4;opacity:.46;filter:blur(16px);background:radial-gradient(circle at 14% 100%,rgba(220,239,255,.14),transparent 24%),radial-gradient(circle at 52% 100%,rgba(208,230,248,.17),transparent 30%),radial-gradient(circle at 88% 100%,rgba(220,239,255,.13),transparent 24%);animation:rpFog 20s ease-in-out infinite alternate}
    .rp-photo-real header,.rp-photo-real main,.rp-photo-real footer{position:relative;z-index:6}

    .rp-photo-real .rainbow-wrap{
      position:relative;height:min(720px,72vw);min-height:520px;max-width:1120px;margin:34px auto 8px;border-radius:34px;overflow:hidden;
      border:1px solid rgba(190,225,255,.18);box-shadow:0 30px 110px rgba(0,0,0,.52);isolation:isolate;
      background:#132437 url('${STORM}') center 35%/cover no-repeat;
    }
    .rp-photo-real .rainbow-wrap::before{
      content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
      background:linear-gradient(180deg,rgba(6,18,31,.12),rgba(6,17,29,.2) 35%,rgba(5,12,20,.68) 72%,rgba(3,8,14,.92)),radial-gradient(ellipse at 54% 18%,rgba(229,242,255,.22),transparent 36%);
    }
    .rp-photo-real .rainbow-wrap::after{
      content:"";position:absolute;inset:0;z-index:19;pointer-events:none;box-shadow:inset 0 0 100px rgba(2,7,12,.34),inset 0 -180px 190px rgba(2,7,12,.78);
    }
    .rp-photo-real .rainbow-wrap.rp-image-fallback{background:linear-gradient(180deg,#526b85,#172a3d 47%,#060c14)}

    .rp-rainbow-photo{position:absolute;inset:-3% 0 18%;z-index:5;background:url('${RAINBOW}') center 18%/min(760px,78%) auto no-repeat;opacity:.78;filter:saturate(1.18) contrast(1.08) brightness(1.03);mix-blend-mode:screen;transform:scale(1.03);animation:rpRainbowBreathe 12s ease-in-out infinite alternate;mask-image:linear-gradient(180deg,transparent 0,#000 5%,#000 70%,transparent 94%),radial-gradient(ellipse at 50% 44%,#000 0 50%,transparent 82%);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5%,#000 70%,transparent 94%)}
    .rp-rainbow-haze{position:absolute;left:14%;right:14%;top:8%;height:58%;z-index:6;opacity:.42;filter:blur(24px);mix-blend-mode:screen;background:radial-gradient(ellipse at 50% 74%,transparent 0 41%,rgba(244,185,96,.18) 48%,rgba(92,188,224,.16) 56%,rgba(151,101,201,.12) 64%,transparent 72%)}
    .rp-sunbreak{position:absolute;left:55%;top:4%;width:58%;height:70%;transform:translateX(-50%);z-index:4;opacity:.28;filter:blur(16px);clip-path:polygon(34% 0,66% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(250,253,255,.65),rgba(210,232,249,.08) 70%,transparent)}

    .rp-ark-photo{position:absolute;left:50%;bottom:14%;width:min(820px,82%);height:39%;transform:translateX(-50%);z-index:10;background:url('${ARK}') center 48%/cover no-repeat;filter:saturate(.62) sepia(.16) contrast(1.18) brightness(.68) drop-shadow(0 18px 24px rgba(0,0,0,.52));mix-blend-mode:normal;opacity:.92;mask-image:linear-gradient(180deg,transparent 0,#000 12%,#000 72%,transparent 100%),linear-gradient(90deg,transparent 0,#000 12%,#000 88%,transparent 100%);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 12%,#000 72%,transparent 100%);animation:rpArkFloat 9s ease-in-out infinite alternate}
    .rp-ark-shadow{position:absolute;left:50%;bottom:18%;width:66%;height:10%;transform:translateX(-50%);z-index:9;border-radius:50%;background:rgba(2,7,12,.58);filter:blur(20px)}
    .rp-water{position:absolute;left:0;right:0;bottom:0;height:31%;z-index:8;background:linear-gradient(180deg,rgba(109,151,183,.08),rgba(25,52,75,.45) 28%,rgba(9,22,35,.9) 75%,rgba(4,11,18,.98));backdrop-filter:blur(1px)}
    .rp-water::before,.rp-water::after{content:"";position:absolute;left:-10%;right:-10%;border-radius:50%;background:repeating-linear-gradient(90deg,rgba(255,255,255,.075) 0 8px,transparent 8px 25px);opacity:.12;filter:blur(1px)}
    .rp-water::before{top:20%;height:30%;animation:rpRipple 7s linear infinite}.rp-water::after{top:44%;height:28%;animation:rpRipple 9s linear infinite reverse}
    .rp-vapor{position:absolute;left:-8%;right:-8%;bottom:18%;height:31%;z-index:11;opacity:.7;filter:blur(27px);background:radial-gradient(ellipse at 17% 60%,rgba(222,238,249,.25),transparent 28%),radial-gradient(ellipse at 50% 66%,rgba(205,228,244,.2),transparent 34%),radial-gradient(ellipse at 82% 57%,rgba(224,239,250,.22),transparent 29%);animation:rpMist 17s ease-in-out infinite alternate}

    .rp-caption{position:absolute;left:20px;right:20px;bottom:18px;z-index:16;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:18px 20px;border-radius:24px;border:1px solid rgba(186,223,255,.14);background:linear-gradient(180deg,rgba(8,23,40,.34),rgba(4,11,19,.66));backdrop-filter:blur(12px);text-align:left}
    .rp-caption strong{display:block;font-size:1.04rem}.rp-caption span{display:block;color:#cfe7fa;line-height:1.55;margin-top:4px;max-width:710px;font-size:.92rem}.rp-tag{white-space:nowrap;border:1px solid rgba(186,223,255,.16);background:rgba(255,255,255,.045);border-radius:999px;padding:10px 14px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
    .rp-credit{position:absolute;right:18px;top:16px;z-index:17;padding:7px 10px;border-radius:999px;background:rgba(2,8,16,.58);border:1px solid rgba(210,234,252,.13);font-size:.64rem;color:rgba(229,242,252,.78);backdrop-filter:blur(8px)}
    .rp-credit a{color:inherit;text-decoration:underline;text-underline-offset:2px}

    @keyframes rpRainbowBreathe{from{opacity:.7;transform:scale(1.015)}to{opacity:.84;transform:scale(1.045)}}
    @keyframes rpArkFloat{from{transform:translateX(-50%) translateY(0)}to{transform:translateX(-50%) translateY(5px)}}
    @keyframes rpMist{from{transform:translateX(-2%)}to{transform:translateX(2%)}}
    @keyframes rpRipple{from{transform:translateX(-3%)}to{transform:translateX(3%)}}
    @keyframes rpSheet{from{transform:translate3d(0,-10%,0)}to{transform:translate3d(-4%,14%,0)}}
    @keyframes rpFog{from{transform:translateX(-1.5%)}to{transform:translateX(1.5%)}}

    @media(max-width:760px){
      .rp-photo-real .rainbow-wrap{min-height:520px;height:min(650px,136vw);border-radius:26px;background-position:center 30%}
      .rp-rainbow-photo{inset:0 -18% 24%;background-size:88% auto;background-position:center 11%;opacity:.8}
      .rp-ark-photo{width:104%;height:36%;bottom:17%;background-position:center 50%}
      .rp-caption{left:14px;right:14px;bottom:14px;display:block;padding:15px 16px}.rp-caption span{font-size:.86rem}.rp-tag{display:inline-block;margin-top:10px;padding:8px 11px}
      .rp-credit{top:10px;right:10px;font-size:.56rem;max-width:78%;text-align:right}
    }
    @media(prefers-reduced-motion:reduce){.rp-rain-canvas{display:none}.rp-drizzle,.rp-fog,.rp-rainbow-photo,.rp-ark-photo,.rp-vapor,.rp-water::before,.rp-water::after{animation:none!important}}
  `;
  document.head.appendChild(style);

  wrap.innerHTML = `
    <div class="rp-sunbreak"></div>
    <div class="rp-rainbow-photo" role="img" aria-label="A real rainbow photograph blended into storm clouds"></div>
    <div class="rp-rainbow-haze"></div>
    <div class="rp-ark-shadow"></div>
    <div class="rp-ark-photo" role="img" aria-label="A photograph of a full-size Noah's Ark replica"></div>
    <div class="rp-water"></div><div class="rp-vapor"></div>
    <div class="rp-credit">Photos: storm & ark CC0 • rainbow © BIliyasK, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>, cropped/blended</div>
    <div class="rp-caption"><div><strong>Real storm. Real rainbow. A real full-size ark replica.</strong><span>The photographic layers are blended with the living rain, fog, water, and lightning so the promise feels part of an actual sky rather than a graphic pasted over it.</span></div><div class="rp-tag">Photo Real Pass</div></div>`;

  const preload = [STORM, RAINBOW, ARK].map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  }));
  Promise.all(preload).then((loaded) => {
    if (!loaded[0]) wrap.classList.add('rp-image-fallback');
  });

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
    return {x:Math.random()*w,y:Math.random()*h-h,len:13+d*31,speed:9+d*19,drift:2.2+d*3.8,alpha:.08+d*.25,line:.55+d*1.35};
  };
  function resize(){
    w = innerWidth; h = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w*ratio; canvas.height = h*ratio; canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(ratio,0,0,ratio,0,0);
    drops = Array.from({length:Math.max(130,Math.floor(w/6.5))},makeDrop);
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const d of drops){
      ctx.beginPath(); ctx.lineWidth=d.line; ctx.strokeStyle='rgba(218,238,255,'+d.alpha+')';
      ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-d.drift,d.y+d.len); ctx.stroke();
      d.x-=d.drift*.22; d.y+=d.speed;
      if(d.y>h+45||d.x<-45) Object.assign(d,makeDrop(),{y:-35-Math.random()*h*.38,x:Math.random()*w+45});
    }
    frame=requestAnimationFrame(draw);
  }
  function flash(){
    lightning.animate([{opacity:0},{opacity:.18,offset:.08},{opacity:.58,offset:.18},{opacity:.08,offset:.48},{opacity:.34,offset:.68},{opacity:0}],{duration:720+Math.random()*460,easing:'ease-out'});
    wrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.16)'},{filter:'brightness(1.04)'},{filter:'brightness(1)'}],{duration:820,easing:'ease-out'});
    setTimeout(flash,4800+Math.random()*9200);
  }
  resize(); draw(); setTimeout(flash,3200+Math.random()*5200);
  addEventListener('resize',resize);
  addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
