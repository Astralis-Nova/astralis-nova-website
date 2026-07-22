(() => {
  "use strict";

  const STYLE_ID = "astralisRealisticGalaxyStyles";
  const WIDTH = 960;
  const HEIGHT = 720;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .hero{overflow:hidden;isolation:isolate}
      .hero-inner{position:relative;z-index:3}
      .astralis-hero-galaxy.realistic-galaxy{
        position:absolute!important;
        z-index:2!important;
        left:auto!important;
        right:-5%!important;
        top:-29%!important;
        width:clamp(590px,66vw,1040px)!important;
        aspect-ratio:4/3!important;
        pointer-events:none!important;
        opacity:.88!important;
        mix-blend-mode:screen!important;
        filter:saturate(1.06) contrast(1.10) brightness(1.02) drop-shadow(0 0 24px rgba(106,168,255,.18)) drop-shadow(0 0 56px rgba(193,105,255,.12))!important;
        transform:none!important;
        animation:none!important;
        overflow:visible!important;
        isolation:isolate!important;
      }
      .astralis-hero-galaxy.realistic-galaxy > img{display:none!important}
      .astralis-hero-galaxy.realistic-galaxy canvas{
        position:absolute;
        inset:0;
        display:block;
        width:100%;
        height:100%;
        background:transparent;
        transform-origin:50% 50%;
      }
      .astralis-galaxy-main{
        z-index:2;
        animation:astralisRealGalaxySpin 42s linear infinite,astralisRealGalaxyBreathe 10s ease-in-out infinite;
        will-change:transform,filter,opacity;
      }
      .astralis-galaxy-core{
        z-index:3;
        opacity:.14;
        mix-blend-mode:screen;
        filter:brightness(1.20) saturate(1.08);
        -webkit-mask-image:radial-gradient(circle at 50% 50%,black 0 34%,rgba(0,0,0,.72) 44%,transparent 61%);
        mask-image:radial-gradient(circle at 50% 50%,black 0 34%,rgba(0,0,0,.72) 44%,transparent 61%);
        animation:astralisRealGalaxyCounterSpin 24s linear infinite;
        will-change:transform;
      }
      .astralis-galaxy-glow{
        position:absolute;
        z-index:4;
        inset:29%;
        border-radius:50%;
        background:radial-gradient(ellipse at center,rgba(255,251,224,.35) 0%,rgba(255,159,211,.16) 24%,rgba(125,116,255,.08) 49%,transparent 73%);
        filter:blur(18px);
        opacity:.54;
        transform-origin:50% 50%;
        animation:astralisRealGalaxyCorePulse 8s ease-in-out infinite;
      }
      @keyframes astralisRealGalaxySpin{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
      @keyframes astralisRealGalaxyCounterSpin{
        from{transform:rotate(0deg) scale(.985)}
        to{transform:rotate(-360deg) scale(.985)}
      }
      @keyframes astralisRealGalaxyBreathe{
        0%,100%{opacity:.94;filter:brightness(.98) saturate(1.02)}
        50%{opacity:1;filter:brightness(1.10) saturate(1.10)}
      }
      @keyframes astralisRealGalaxyCorePulse{
        0%,100%{opacity:.40;transform:scale(.94)}
        50%{opacity:.66;transform:scale(1.08)}
      }
      @media(max-width:800px){
        .astralis-hero-galaxy.realistic-galaxy{right:-34%!important;top:-12%!important;width:820px!important;opacity:.77!important}
      }
      @media(max-width:520px){
        .astralis-hero-galaxy.realistic-galaxy{right:-70%!important;top:-3%!important;width:720px!important;opacity:.65!important;filter:saturate(1.02) contrast(1.08) brightness(.98) drop-shadow(0 0 18px rgba(106,168,255,.14))!important}
      }
      @media(prefers-reduced-motion:reduce){
        .astralis-galaxy-main,.astralis-galaxy-core,.astralis-galaxy-glow{animation:none!important}
        .astralis-galaxy-main{transform:rotate(-8deg)!important}
      }
    `;
    document.head.appendChild(style);
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(random) {
    const u = Math.max(random(), 1e-7);
    const v = Math.max(random(), 1e-7);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function spiralPath(ctx, offset, turns, radiusStart, radiusEnd, yScale, inwardShift = 0) {
    ctx.beginPath();
    const steps = 155;
    for (let i = 0; i < steps; i += 1) {
      const t = i / (steps - 1);
      const theta = offset + turns * Math.PI * 2 * t;
      const radius = radiusStart + (radiusEnd - radiusStart) * Math.pow(t, .88) + inwardShift;
      const x = WIDTH * .52 + radius * Math.cos(theta);
      const y = HEIGHT * .50 + radius * Math.sin(theta) * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }

  function drawGalaxy(canvas) {
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return false;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const random = seededRandom(5202026);
    const centerX = WIDTH * .52;
    const centerY = HEIGHT * .50;
    const yScale = .70;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-8 * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
    ctx.globalCompositeOperation = "screen";

    const halo = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 420);
    halo.addColorStop(0, "rgba(255,245,220,.48)");
    halo.addColorStop(.16, "rgba(255,158,208,.28)");
    halo.addColorStop(.42, "rgba(137,108,255,.15)");
    halo.addColorStop(.72, "rgba(67,139,239,.07)");
    halo.addColorStop(1, "rgba(10,6,30,0)");
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1, yScale);
    ctx.translate(-centerX, -centerY);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 430, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const armGradientA = ctx.createLinearGradient(130, 150, 870, 610);
    armGradientA.addColorStop(0, "rgba(82,218,255,.12)");
    armGradientA.addColorStop(.35, "rgba(125,130,255,.56)");
    armGradientA.addColorStop(.68, "rgba(245,130,211,.60)");
    armGradientA.addColorStop(1, "rgba(255,239,188,.24)");
    const armGradientB = ctx.createLinearGradient(850, 130, 140, 630);
    armGradientB.addColorStop(0, "rgba(91,220,255,.14)");
    armGradientB.addColorStop(.36, "rgba(108,139,255,.54)");
    armGradientB.addColorStop(.70, "rgba(237,122,207,.58)");
    armGradientB.addColorStop(1, "rgba(255,232,183,.22)");

    [0, Math.PI].forEach((offset, index) => {
      const gradient = index ? armGradientB : armGradientA;
      ctx.save();
      ctx.filter = "blur(34px)";
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 92;
      ctx.lineCap = "round";
      ctx.globalAlpha = .30;
      spiralPath(ctx, offset, 1.08, 38, 435, yScale);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.filter = "blur(13px)";
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 46;
      ctx.lineCap = "round";
      ctx.globalAlpha = .48;
      spiralPath(ctx, offset, 1.08, 42, 435, yScale);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.filter = "blur(3px)";
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 13;
      ctx.lineCap = "round";
      ctx.globalAlpha = .42;
      spiralPath(ctx, offset, 1.08, 44, 430, yScale);
      ctx.stroke();
      ctx.restore();
    });

    [Math.PI * .53, Math.PI * 1.53].forEach(offset => {
      ctx.save();
      ctx.filter = "blur(11px)";
      ctx.strokeStyle = "rgba(116,192,255,.25)";
      ctx.lineWidth = 31;
      ctx.lineCap = "round";
      spiralPath(ctx, offset, .70, 145, 405, yScale);
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.filter = "blur(5px)";
    ctx.strokeStyle = "rgba(0,0,0,.44)";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    [0, Math.PI].forEach(offset => {
      spiralPath(ctx, offset - .12, 1.08, 55, 426, yScale, -7);
      ctx.stroke();
    });
    ctx.restore();
    ctx.globalCompositeOperation = "screen";

    const starColors = [
      [245, 252, 255], [174, 229, 255], [206, 190, 255],
      [255, 196, 232], [255, 240, 177]
    ];

    for (let armIndex = 0; armIndex < 2; armIndex += 1) {
      const offset = armIndex * Math.PI;
      for (let i = 0; i < 720; i += 1) {
        const t = Math.pow(random(), .82);
        const theta = offset + 1.08 * Math.PI * 2 * t + gaussian(random) * (.018 + .055 * t);
        const radius = 43 + 392 * Math.pow(t, .88) + gaussian(random) * (6 + 18 * t);
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta) * yScale + gaussian(random) * (3 + 10 * t);
        const color = starColors[Math.floor(random() * starColors.length)];
        const size = random() < .055 ? 2.2 + random() * 2.2 : .45 + random() * 1.25;
        const alpha = .24 + random() * .70;
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        if (size > 2.2) {
          ctx.save();
          ctx.filter = "blur(6px)";
          ctx.globalAlpha = .36;
          ctx.beginPath();
          ctx.arc(x, y, size * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    for (let i = 0; i < 320; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 405 * Math.sqrt(random());
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle) * yScale;
      const size = .35 + random() * .9;
      ctx.fillStyle = `rgba(225,234,255,${.12 + random() * .38})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const bulge = ctx.createRadialGradient(centerX - 8, centerY - 7, 1, centerX, centerY, 145);
    bulge.addColorStop(0, "rgba(255,255,242,1)");
    bulge.addColorStop(.12, "rgba(255,247,201,.98)");
    bulge.addColorStop(.34, "rgba(255,183,149,.82)");
    bulge.addColorStop(.64, "rgba(239,112,194,.48)");
    bulge.addColorStop(1, "rgba(116,89,255,0)");
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1.45, .72);
    ctx.translate(-centerX, -centerY);
    ctx.filter = "blur(8px)";
    ctx.fillStyle = bulge;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 145, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1.5, .62);
    ctx.translate(-centerX, -centerY);
    ctx.filter = "blur(2px)";
    ctx.fillStyle = "rgba(255,253,232,.98)";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 35, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
    return true;
  }

  function applyGalaxy() {
    installStyles();
    const hero = document.querySelector(".hero");
    if (!hero) return false;

    let galaxy = hero.querySelector(".astralis-hero-galaxy");
    if (!galaxy) {
      galaxy = document.createElement("div");
      galaxy.className = "astralis-hero-galaxy";
      galaxy.setAttribute("aria-hidden", "true");
      hero.appendChild(galaxy);
    }
    if (galaxy.dataset.realisticGalaxy === "true") return true;

    const main = document.createElement("canvas");
    main.className = "astralis-galaxy-main";
    main.setAttribute("aria-hidden", "true");
    if (!drawGalaxy(main)) return false;

    const core = document.createElement("canvas");
    core.className = "astralis-galaxy-core";
    core.width = WIDTH;
    core.height = HEIGHT;
    const coreContext = core.getContext("2d", {alpha:true});
    if (coreContext) coreContext.drawImage(main, 0, 0);

    const glow = document.createElement("span");
    glow.className = "astralis-galaxy-glow";
    galaxy.replaceChildren(main, core, glow);
    galaxy.classList.add("realistic-galaxy");
    galaxy.dataset.realisticGalaxy = "true";
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyGalaxy, {once:true});
  } else {
    applyGalaxy();
  }

  const observer = new MutationObserver(() => {
    if (applyGalaxy()) observer.disconnect();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  window.setTimeout(() => observer.disconnect(), 12000);
})();
