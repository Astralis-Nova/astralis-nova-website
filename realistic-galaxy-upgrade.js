(() => {
  "use strict";

  const STYLE_ID = "astralisRealisticGalaxyStyles";
  const VERSION = "20261007wide";
  const SIZE = 1280;
  const CENTER = SIZE / 2;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .hero{overflow:hidden;isolation:isolate}
      .hero-inner{position:relative;z-index:3}
      .astralis-hero-galaxy.realistic-galaxy{
        position:absolute!important;z-index:2!important;left:auto!important;
        right:-12%!important;top:-9%!important;
        width:clamp(740px,83vw,1320px)!important;aspect-ratio:1.65!important;
        pointer-events:none!important;opacity:.86!important;mix-blend-mode:screen!important;
        filter:none!important;transform:none!important;animation:none!important;
        overflow:visible!important;isolation:isolate!important;
      }
      .astralis-hero-galaxy.realistic-galaxy::before,
      .astralis-hero-galaxy.realistic-galaxy::after{content:none!important;display:none!important}
      .astralis-hero-galaxy.realistic-galaxy > img{display:none!important}
      /* Rotate the circular disk BEFORE projecting it: its inclination stays fixed. */
      .astralis-galaxy-disk{
        position:absolute;left:0;top:50%;width:100%;aspect-ratio:1;
        transform:translateY(-50%) rotate(-14deg) scaleY(.56);
        transform-origin:50% 50%;
      }
      .astralis-galaxy-main{
        position:absolute;inset:0;display:block;width:100%;height:100%;
        background:transparent;transform-origin:50% 50%;
        animation:astralisRealGalaxySpin 68s linear infinite;
        will-change:transform;
      }
      .astralis-galaxy-glow{
        position:absolute;inset:34%;border-radius:50%;
        background:radial-gradient(ellipse,rgba(255,241,210,.19),rgba(255,202,159,.06) 38%,transparent 72%);
        animation:astralisRealGalaxyCorePulse 13s ease-in-out infinite;
      }
      @keyframes astralisRealGalaxySpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes astralisRealGalaxyCorePulse{0%,100%{opacity:.5}50%{opacity:.8}}
      html.astralis-page-hidden .realistic-galaxy *,
      .astralis-hero-galaxy.realistic-galaxy.astralis-perf-paused *{animation-play-state:paused!important}
      @media(max-width:1050px){
        .astralis-hero-galaxy.realistic-galaxy{right:-24%!important;top:1%!important;width:1060px!important;opacity:.70!important}
      }
      @media(max-width:800px){
        .astralis-hero-galaxy.realistic-galaxy{right:-29%!important;top:1%!important;width:920px!important;opacity:.65!important}
      }
      @media(max-width:520px){
        .astralis-hero-galaxy.realistic-galaxy{right:-43%!important;top:0!important;width:730px!important;opacity:.53!important}
        .astralis-galaxy-disk{transform:translateY(-50%) rotate(-18deg) scaleY(.56)}
      }
      @media(prefers-reduced-motion:reduce){
        .astralis-galaxy-main,.astralis-galaxy-glow{animation:none!important}
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
    return Math.sqrt(-2 * Math.log(Math.max(random(), 1e-7))) * Math.cos(2 * Math.PI * random());
  }

  function cloudSprite(color) {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const ctx = sprite.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${color},.65)`);
    gradient.addColorStop(.25, `rgba(${color},.32)`);
    gradient.addColorStop(.6, `rgba(${color},.08)`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return sprite;
  }

  function armPoint(t, arm, random, spread = 1, angleOffset = 0) {
    const radius = 62 + 464 * Math.pow(t, .86);
    const angle = arm * Math.PI + 4.8 * t + .10 * Math.sin(t * 16 + arm) + angleOffset;
    const scatter = (8 + 19 * t) * spread;
    const r = radius + gaussian(random) * scatter;
    const a = angle + gaussian(random) * .025 * spread;
    return {x:CENTER + r * Math.cos(a), y:CENTER + r * Math.sin(a), t};
  }

  function drawGalaxy(canvas) {
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return false;
    canvas.width = canvas.height = SIZE;
    const random = seededRandom(20261007);
    const clouds = [cloudSprite("194,214,241"), cloudSprite("147,185,235"), cloudSprite("229,221,201"), cloudSprite("230,158,186")];
    const dust = cloudSprite("0,0,0");
    if (clouds.some(sprite => !sprite) || !dust) return false;
    ctx.globalCompositeOperation = "screen";

    const halo = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 550);
    halo.addColorStop(0, "rgba(255,229,181,.34)");
    halo.addColorStop(.20, "rgba(218,214,208,.19)");
    halo.addColorStop(.49, "rgba(132,161,205,.08)");
    halo.addColorStop(.83, "rgba(90,134,197,.025)");
    halo.addColorStop(1, "rgba(90,134,197,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Irregular luminous clouds, rather than smooth outlined spiral ribbons.
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 1550; i += 1) {
        const t = random();
        const p = armPoint(t, arm, random, 1.2);
        const size = 18 + random() * 40 + 20 * t;
        const density = .6 + .4 * Math.sin(t * 43 + arm * 2);
        ctx.globalAlpha = (.06 + random() * .13) * density * (1 - .55 * t);
        const sprite = t < .25 ? clouds[2] : clouds[random() < .55 ? 0 : 1];
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      // Fainter branching arms keep the outer disk asymmetric and feathered.
      for (let i = 0; i < 360; i += 1) {
        const t = .35 + random() * .62;
        const p = armPoint(t, arm, random, 1.5, .46);
        const size = 24 + random() * 35;
        ctx.globalAlpha = .035 * (1 - t);
        ctx.drawImage(clouds[1], p.x - size / 2, p.y - size / 2, size, size);
      }
    }

    // Dust absorbs light along the inner edge of each arm. Ragged clouds avoid
    // evenly spaced rings and allow the underlying space to show through.
    ctx.globalCompositeOperation = "destination-out";
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 1600; i += 1) {
        const t = .08 + random() * .86;
        const p = armPoint(t, arm, random, .40, -.085);
        const size = 8 + random() * 23;
        ctx.globalAlpha = (.16 + random() * .28) * (1 - .45 * t);
        ctx.drawImage(dust, p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    ctx.globalCompositeOperation = "screen";

    // Fine individual stars blend into dense stellar populations at display size.
    const starColors = ["235,242,253", "190,215,249", "161,198,239", "255,231,191"];
    ctx.globalAlpha = 1;
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 6400; i += 1) {
        const t = random();
        const p = armPoint(t, arm, random, random() < .2 ? 2.6 : .85);
        const size = .25 + random() * .75;
        const alpha = (.13 + random() * .55) * (1 - .60 * Math.pow(t, 3));
        const color = t < .24 ? starColors[3] : starColors[Math.floor(random() * 3)];
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Small blue clusters and occasional rose emission nebulae.
      for (let i = 0; i < 105; i += 1) {
        const t = .22 + random() * .70;
        const p = armPoint(t, arm, random, .8, .045);
        const size = 8 + random() * 16;
        ctx.globalAlpha = .18 + random() * .28;
        ctx.drawImage(clouds[random() < .23 ? 3 : 1], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // Diffuse disk stars and the warm, densely packed older stellar bulge.
    for (let i = 0; i < 2600; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.min(555, Math.abs(gaussian(random)) * 170);
      const x = CENTER + radius * Math.cos(angle);
      const y = CENTER + radius * Math.sin(angle);
      const warm = radius < 150;
      ctx.fillStyle = `rgba(${warm ? "255,231,194" : "211,223,243"},${.08 + random() * (warm ? .36 : .20)})`;
      ctx.fillRect(x, y, .5 + random() * .7, .5 + random() * .7);
    }

    const bulge = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 175);
    bulge.addColorStop(0, "rgba(255,252,236,.99)");
    bulge.addColorStop(.10, "rgba(255,243,214,.84)");
    bulge.addColorStop(.28, "rgba(255,224,184,.46)");
    bulge.addColorStop(.56, "rgba(230,192,157,.15)");
    bulge.addColorStop(1, "rgba(210,183,162,0)");
    ctx.fillStyle = bulge;
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Fade every edge to transparency so no rotating rectangle can appear.
    ctx.globalCompositeOperation = "destination-in";
    const edge = ctx.createRadialGradient(CENTER, CENTER, 480, CENTER, CENTER, 603);
    edge.addColorStop(0, "rgba(0,0,0,1)");
    edge.addColorStop(.55, "rgba(0,0,0,.65)");
    edge.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = "source-over";
    return true;
  }

  function applyGalaxy() {
    const hero = document.querySelector(".hero");
    if (!hero) return false;
    let galaxy = hero.querySelector(".astralis-hero-galaxy");
    if (galaxy?.dataset.galaxyVersion === VERSION) return true;
    const main = document.createElement("canvas");
    main.className = "astralis-galaxy-main";
    main.setAttribute("aria-hidden", "true");
    // Keep the existing SVG fallback if this browser cannot draw a canvas.
    if (!drawGalaxy(main)) return false;
    installStyles();
    if (!galaxy) {
      galaxy = document.createElement("div");
      galaxy.className = "astralis-hero-galaxy";
      hero.appendChild(galaxy);
    }
    galaxy.setAttribute("aria-hidden", "true");
    const disk = document.createElement("div");
    disk.className = "astralis-galaxy-disk";
    const glow = document.createElement("span");
    glow.className = "astralis-galaxy-glow";
    disk.append(main, glow);
    galaxy.replaceChildren(disk);
    galaxy.classList.add("realistic-galaxy");
    galaxy.dataset.realisticGalaxy = "true";
    galaxy.dataset.galaxyVersion = VERSION;
    // Rasterize only once; the browser composites rotation without a draw loop.
    if ("IntersectionObserver" in window) {
      const visibility = new IntersectionObserver(entries => {
        galaxy.classList.toggle("astralis-perf-paused", !entries[0].isIntersecting);
      }, {rootMargin:"120px"});
      visibility.observe(hero);
    }
    return true;
  }

  function boot() {
    if (applyGalaxy()) return;
    const observer = new MutationObserver(() => {
      if (applyGalaxy()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    window.setTimeout(() => observer.disconnect(), 12000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
