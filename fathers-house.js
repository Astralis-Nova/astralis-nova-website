const passages={home:{ref:'John 14:2–3',quote:'“In my Father’s house are many mansions … I go to prepare a place for you.”',text:'Jesus offers his disciples reassurance as they face separation. We imagine those many dwelling places as a welcome, held in the hope of being with him.'},tears:{ref:'John 11:33–36',quote:'“Jesus wept.”',text:'Before raising Lazarus, Jesus shares in the sorrow around him. This reflection holds grief and hope together. Love gives us room to mourn.'},hope:{ref:'Revelation 21:4–5',quote:'“And God shall wipe away all tears from their eyes … Behold, I make all things new.”',text:'Revelation describes a vision of renewed creation and the end of death and sorrow. The river and light of this imagined world give shape to that hope.'}};const buttons=document.querySelectorAll('[data-passage]');function showPassage(key){const p=passages[key];document.getElementById('reference').textContent=p.ref+' · King James Version';document.getElementById('quote').textContent=p.quote;document.getElementById('reflection').textContent=p.text;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.passage===key)));}buttons.forEach(b=>b.addEventListener('click',()=>showPassage(b.dataset.passage)));showPassage('home');const sky=document.querySelector('.particles');for(let i=0;i<28;i++){const star=document.createElement('i');star.style.left=(i*37%100)+'%';star.style.top=(i*53%100)+'%';star.style.animationDelay=-(i%8)+'s';sky.append(star);}
const lazarusScene = document.getElementById('lazarusScene');
const replayLazarus = document.getElementById('replayLazarus');
const lazarusCaption = document.getElementById('lazarusCaption');
let sceneFrame;
function awakenLazarus() {
  lazarusScene.classList.add('is-awake');
}
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      awakenLazarus();
      sceneObserver.disconnect();
    }
  }, {threshold: 0.3});
  sceneObserver.observe(lazarusScene);
} else {
  awakenLazarus();
}
replayLazarus.addEventListener('click', () => {
  cancelAnimationFrame(sceneFrame);
  lazarusScene.classList.remove('is-awake');
  lazarusCaption.textContent = '“Lazarus, come forth.” — John 11:43 (KJV)';
  void lazarusScene.getBoundingClientRect();
  sceneFrame = requestAnimationFrame(() => requestAnimationFrame(awakenLazarus));
});


// A bounded sky animation, paused when the page is hidden or motion is disabled.
const livingCanvas = document.getElementById('livingSky');
const livingContext = livingCanvas.getContext('2d');
const motionButton = document.getElementById('motionToggle');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let skyFrame = 0;
let skyWidth = 0;
let skyHeight = 0;
let skyTime = 0;
let lastSkyTime = 0;
const skyStars = Array.from({length: 85}, (_, index) => ({
  x: ((index * 137.51) % 997) / 997,
  y: ((index * 79.13) % 991) / 991,
  radius: .5 + index % 3 * .45,
  phase: index * 1.7
}));

function resizeLivingSky() {
  const density = Math.min(window.devicePixelRatio || 1, 1.5);
  skyWidth = window.innerWidth;
  skyHeight = window.innerHeight;
  livingCanvas.width = Math.round(skyWidth * density);
  livingCanvas.height = Math.round(skyHeight * density);
  livingContext.setTransform(density, 0, 0, density, 0, 0);
  drawLivingSky();
}

function drawLivingSky() {
  livingContext.clearRect(0, 0, skyWidth, skyHeight);
  for (const star of skyStars) {
    const x = (star.x * skyWidth + skyTime * (1 + star.radius)) % skyWidth;
    const y = (star.y * skyHeight + Math.sin(skyTime * .12 + star.phase) * 8 + skyHeight) % skyHeight;
    livingContext.globalAlpha = .35 + .45 * (.5 + .5 * Math.sin(skyTime * .7 + star.phase));
    livingContext.fillStyle = '#fff3ce';
    livingContext.beginPath();
    livingContext.arc(x, y, star.radius, 0, Math.PI * 2);
    livingContext.fill();
  }
  livingContext.globalAlpha = 1;
  for (let galaxy = 0; galaxy < 2; galaxy++) {
    livingContext.save();
    livingContext.translate(skyWidth * (galaxy ? .84 : .13), skyHeight * (galaxy ? .27 : .6));
    livingContext.scale(1, .48);
    livingContext.rotate(skyTime * .035 * (galaxy ? -1 : 1));
    for (let point = 0; point < 180; point++) {
      const angle = point * .16;
      const radius = 2 + point * .37;
      livingContext.globalAlpha = .12 + (1 - point / 180) * .4;
      livingContext.fillStyle = point % 2 ? '#c2afff' : '#f9dca8';
      livingContext.beginPath();
      livingContext.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 1.1, 0, Math.PI * 2);
      livingContext.fill();
    }
    livingContext.restore();
  }
  livingContext.globalAlpha = 1;
}

function animateLivingSky(timestamp) {
  skyFrame = 0;
  if (motionPaused || document.hidden) {
    lastSkyTime = 0;
    return;
  }
  if (lastSkyTime) skyTime += Math.min((timestamp - lastSkyTime) / 1000, .05);
  lastSkyTime = timestamp;
  drawLivingSky();
  skyFrame = requestAnimationFrame(animateLivingSky);
}

function syncLivingMotion() {
  document.body.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? 'Enable movement' : 'Pause movement';
  cancelAnimationFrame(skyFrame);
  lastSkyTime = 0;
  skyFrame = 0;
  if (!motionPaused && !document.hidden && livingContext) {
    skyFrame = requestAnimationFrame(animateLivingSky);
  }
}

motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  syncLivingMotion();
});
motionPreference.addEventListener('change', event => {
  motionPaused = event.matches;
  syncLivingMotion();
});
document.addEventListener('visibilitychange', syncLivingMotion);
window.addEventListener('resize', resizeLivingSky);
if (livingContext) resizeLivingSky();
syncLivingMotion();


// Local, perspective-scaled movement follows the river and waterfalls in the artwork.
const gardenTextures = [];
const landscapeTexture = new Image();
landscapeTexture.src = 'fathers-house-radiance.jpg';
const orbCanvas = document.getElementById('orbLife');
const orbContext = orbCanvas.getContext('2d');
const visibleWorlds = new Map();
const landscapeCanvas = document.getElementById('landscapeLife');
const landscapeContext = landscapeCanvas.getContext('2d');
let landscapeFrame = 0;
let landscapeTime = 0;
let landscapeLastTime = 0;
let landscapeVisible = true;
let landscapeWidth = 0;
let landscapeHeight = 0;

function sizeLandscape() {
  const bounds = landscapeCanvas.getBoundingClientRect();
  const density = Math.min(window.devicePixelRatio || 1, 1.5);
  landscapeWidth = bounds.width;
  landscapeHeight = bounds.height;
  landscapeCanvas.width = Math.round(bounds.width * density);
  landscapeCanvas.height = Math.round(bounds.height * density);
  const orbBounds = orbCanvas.getBoundingClientRect();
  orbCanvas.width = Math.round(orbBounds.width * density);
  orbCanvas.height = Math.round(orbBounds.height * density);
  paintLandscape();
  paintLivingOrb();
}

function lightDot(x, y, radius, color) {
  landscapeContext.fillStyle = color;
  landscapeContext.beginPath();
  landscapeContext.arc(x, y, radius, 0, Math.PI * 2);
  landscapeContext.fill();
}

function paintLandscape() {
  if (!landscapeContext || !landscapeWidth || !landscapeHeight) return;
  const ctx = landscapeContext;
  const density = Math.min(window.devicePixelRatio || 1, 1.5);
  ctx.setTransform(density, 0, 0, density, 0, 0);
  ctx.clearRect(0, 0, landscapeWidth, landscapeHeight);
  // Match the artwork's cover crop, including narrower phone viewports.
  const scale = Math.max(landscapeWidth / 1672, landscapeHeight / 941);
  ctx.translate((landscapeWidth - 1672 * scale) / 2, (landscapeHeight - 941 * scale) / 2);
  ctx.scale(scale, scale);
  const time = landscapeTime;
  paintLivingTextures(ctx, time);

  // Currents widen and accelerate toward the viewer.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let index = 0; index < 105; index++) {
    const progress = ((index / 105) + time * .055) % 1;
    const y = 490 + progress * 450;
    const center = 1000 - Math.sin(progress * 4.1) * 105;
    const spread = 18 + progress * 285;
    const x = center + Math.sin(index * 9.73) * spread;
    const length = 3 + progress * 20;
    ctx.globalAlpha = .12 + progress * .38;
    ctx.strokeStyle = index % 3 ? '#b9f4ff' : '#fff4c0';
    ctx.lineWidth = .7 + progress * 1.3;
    ctx.beginPath();
    ctx.ellipse(x, y, length, 1 + progress * 2, Math.sin(time + index) * .12, 0, Math.PI);
    ctx.stroke();
  }

  // Narrow ribbons of water stream down each painted cascade.
  const falls = [
    {x: 495, y: 455, width: 78, height: 130},
    {x: 405, y: 475, width: 38, height: 98},
    {x: 1082, y: 390, width: 105, height: 92},
    {x: 1235, y: 392, width: 83, height: 72},
    {x: 1395, y: 610, width: 42, height: 60}
  ];
  for (const fall of falls) {
    for (let index = 0; index < 22; index++) {
      const progress = (index * .143 + time * .9) % 1;
      const x = fall.x + ((index * 37) % 101) / 101 * fall.width;
      const y = fall.y + progress * fall.height;
      ctx.globalAlpha = Math.sin(progress * Math.PI) * .52;
      ctx.strokeStyle = '#ecfaff';
      ctx.lineWidth = 1 + index % 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 2, y + 10, x + 4, y + 23);
      ctx.stroke();
    }
    for (let index = 0; index < 9; index++) {
      const phase = time * .8 + index;
      const x = fall.x + fall.width * .5 + Math.sin(phase) * fall.width;
      const y = fall.y + fall.height + Math.cos(phase * .7) * 8;
      ctx.globalAlpha = .07;
      lightDot(x, y, 6 + index % 4 * 3, '#e5f8ff');
    }
  }
  ctx.restore();

  // The horizon radiates slowly, with light traveling toward the water.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(1005, 330, 3, 1005, 330, 245);
  glow.addColorStop(0, '#fff8cb66');
  glow.addColorStop(.4, '#ffe1ac22');
  glow.addColorStop(1, '#fff4bd00');
  ctx.globalAlpha = .5 + Math.sin(time * .7) * .25;
  ctx.fillStyle = glow;
  ctx.fillRect(750, 65, 510, 540);
  for (let index = 0; index < 14; index++) {
    const angle = -.95 + index * .14 + Math.sin(time * .2) * .08;
    ctx.globalAlpha = .025 + .02 * Math.sin(time * .9 + index);
    ctx.fillStyle = '#fff4c8';
    ctx.beginPath();
    ctx.moveTo(1005, 330);
    ctx.lineTo(1005 + Math.sin(angle) * 760, 330 - Math.cos(angle) * 760);
    ctx.lineTo(1005 + Math.sin(angle + .025) * 760, 330 - Math.cos(angle + .025) * 760);
    ctx.fill();
  }
  ctx.restore();

  // Stars drift across the upper sky, and a galaxy visibly turns.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let index = 0; index < 65; index++) {
    const x = (index * 197.3 + time * 3) % 1672;
    const y = 14 + (index * 61.7) % 205;
    ctx.globalAlpha = .25 + .6 * (.5 + .5 * Math.sin(time * 1.3 + index));
    lightDot(x, y, index % 7 ? 1 : 2, '#fff5dd');
  }
  ctx.translate(1500, 77);
  ctx.scale(1, .45);
  ctx.rotate(time * .12);
  for (let index = 0; index < 180; index++) {
    const radius = index * .36;
    const angle = index * .19;
    ctx.globalAlpha = .28 * (1 - index / 200);
    lightDot(Math.cos(angle) * radius, Math.sin(angle) * radius, 1.4, '#e9ceff');
  }
  ctx.restore();

  // A small flock crosses the valley, with articulated wings.
  ctx.save();
  ctx.strokeStyle = '#f8edcf';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let bird = 0; bird < 5; bird++) {
    const progress = (time * .026 + bird * .025) % 1;
    const x = 240 + progress * 1270;
    const y = 305 + Math.sin(progress * 6 + bird * .2) * 42 + bird * 12;
    const flap = Math.sin(time * 5 + bird) * 8;
    ctx.globalAlpha = .8;
    ctx.beginPath();
    ctx.moveTo(x - 11, y - flap);
    ctx.quadraticCurveTo(x - 5, y - 5, x, y);
    ctx.quadraticCurveTo(x + 5, y - 5, x + 11, y - flap);
    ctx.stroke();
  }
  ctx.restore();

  // Butterflies weave through the garden, changing wing width every beat.
  for (let butterfly = 0; butterfly < 6; butterfly++) {
    const x = 180 + (butterfly * 213 + time * (9 + butterfly)) % 1280;
    const y = 730 + Math.sin(time * .9 + butterfly * 2) * 65 + Math.sin(time * 2) * 12;
    const wing = 2 + Math.abs(Math.sin(time * 7 + butterfly)) * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time + butterfly) * .3);
    ctx.globalAlpha = .8;
    ctx.fillStyle = butterfly % 2 ? '#f2b6eb' : '#ffe5a9';
    ctx.beginPath();
    ctx.ellipse(-wing * .55, -3, wing, 7, -.4, 0, Math.PI * 2);
    ctx.ellipse(wing * .55, -3, wing, 7, .4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#80607c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.restore();
  }

  // Warm fireflies and drifting pollen lift from the flowering banks.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let index = 0; index < 40; index++) {
    const x = 80 + (index * 107.1 + Math.sin(time + index) * 18) % 1500;
    const y = 900 - (index * 37 + time * (9 + index % 6)) % 350;
    ctx.globalAlpha = .15 + .65 * (.5 + .5 * Math.sin(time * 2 + index));
    lightDot(x, y, index % 3 ? 1.5 : 3, '#ffefab');
  }
  ctx.restore();
}

function animateLandscape(timestamp) {
  landscapeFrame = 0;
  if (motionPaused || document.hidden || !landscapeVisible || !landscapeContext) {
    landscapeLastTime = 0;
    return;
  }
  if (landscapeLastTime) landscapeTime += Math.min((timestamp - landscapeLastTime) / 1000, .05);
  landscapeLastTime = timestamp;
  paintLandscape();
  paintLivingOrb();
  landscapeFrame = requestAnimationFrame(animateLandscape);
}

function syncLandscape() {
  cancelAnimationFrame(landscapeFrame);
  landscapeFrame = 0;
  landscapeLastTime = 0;
  if (!motionPaused && !document.hidden && landscapeVisible && landscapeContext) {
    landscapeFrame = requestAnimationFrame(animateLandscape);
  }
}

motionButton.addEventListener('click', syncLandscape);
motionPreference.addEventListener('change', syncLandscape);
document.addEventListener('visibilitychange', syncLandscape);
window.addEventListener('resize', sizeLandscape);
if ('IntersectionObserver' in window) {
  const landscapeObserver = new IntersectionObserver(entries => {
    for (const entry of entries) visibleWorlds.set(entry.target, entry.isIntersecting);
    landscapeVisible = Array.from(visibleWorlds.values()).some(Boolean);
    syncLandscape();
  }, {rootMargin: '120px'});
  landscapeObserver.observe(landscapeCanvas);
  landscapeObserver.observe(orbCanvas);
}
if (landscapeContext) sizeLandscape();
syncLandscape();


// Move the photograph's actual textures instead of only drawing highlights.
function paintLivingTextures(ctx, time) {
  if (!landscapeTexture.complete || !landscapeTexture.naturalWidth) return;
  const falls = [
    {x:440,y:444,w:105,h:165},
    {x:369,y:466,w:49,h:108},
    {x:1017,y:387,w:155,h:100},
    {x:1205,y:391,w:93,h:86},
    {x:1380,y:607,w:77,h:76},
    {x:838,y:571,w:95,h:48}
  ];
  for (const fall of falls) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fall.x + 4,fall.y);
    ctx.lineTo(fall.x + fall.w - 8,fall.y + 4);
    ctx.lineTo(fall.x + fall.w,fall.y + fall.h);
    ctx.lineTo(fall.x,fall.y + fall.h);
    ctx.closePath();
    ctx.clip();
    // Displace local water detail without wrapping a cliff edge into the cascade.
    for (let row = 0; row < fall.h; row += 3) {
      const sourceRow = Math.max(0, Math.min(fall.h - 4, row - Math.sin(time * 4.5 - row * .085) * 7));
      const wobble = Math.sin(row * .09 + time * 3.1) * 2.5;
      ctx.globalAlpha = Math.max(0, Math.min(1,row / 20,(fall.h - row) / 22)) * .62;
      ctx.drawImage(landscapeTexture, fall.x, fall.y + sourceRow, fall.w, 3,
        fall.x + wobble, fall.y + row, fall.w, 3);
    }
    ctx.restore();
  }

  // Water reflections undulate in widening bands down the river.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(1000,480);
  ctx.bezierCurveTo(1130,510,860,565,1120,640);
  ctx.bezierCurveTo(1200,720,1530,740,1475,941);
  ctx.lineTo(660,941);
  ctx.bezierCurveTo(805,820,640,780,746,710);
  ctx.bezierCurveTo(825,650,690,620,930,552);
  ctx.closePath();
  ctx.clip();
  for (let row = 480; row < 941; row += 3) {
    const depth = (row - 480) / 461;
    const offset = Math.sin(row * .075 - time * 3.3) * (2 + depth * 9);
    const sourceY = Math.max(480,Math.min(937,row + Math.sin(time * 2.4 + row * .04) * 3));
    ctx.globalAlpha = .85;
    ctx.drawImage(landscapeTexture,500,sourceY,1100,3,500 + offset,row,1100,3);
  }
  ctx.restore();

  // Rotate the visible galaxy inside a soft-edged patch of its own sky.
  ctx.save();
  ctx.translate(1510,78);
  ctx.rotate(time * .16);
  ctx.globalAlpha = .92;
  ctx.beginPath();
  ctx.ellipse(0,0,79,47,0,0,Math.PI * 2);
  ctx.clip();
  ctx.drawImage(landscapeTexture,1431,31,158,94,-79,-47,158,94);
  ctx.restore();

  // Feathered image patches keep the flowering shrubs attached to their surroundings.
  for (let index = 0; index < gardenTextures.length; index++) {
    const garden = gardenTextures[index];
    ctx.save();
    ctx.translate(garden.x + garden.width / 2, garden.y + garden.height);
    ctx.rotate(Math.sin(time * 1.3 + index * 2) * .022);
    ctx.drawImage(garden.canvas,-garden.width / 2,-garden.height);
    ctx.restore();
  }
}

function paintLivingOrb() {
  if (!orbContext || !orbCanvas.width || !landscapeCanvas.width) return;
  const width = orbCanvas.width;
  const height = orbCanvas.height;
  const sourceWidth = landscapeCanvas.width;
  const sourceHeight = landscapeCanvas.height;
  const scale = Math.max(width / sourceWidth,height / sourceHeight);
  orbContext.setTransform(1,0,0,1,0,0);
  orbContext.clearRect(0,0,width,height);
  orbContext.drawImage(landscapeCanvas,(width - sourceWidth * scale) / 2,
    (height - sourceHeight * scale) / 2,sourceWidth * scale,sourceHeight * scale);
}

landscapeTexture.addEventListener('load', () => {
  const gardens = [
    {x:200,y:371,width:202,height:202},
    {x:40,y:463,width:165,height:220},
    {x:1405,y:530,width:235,height:220}
  ];
  for (const garden of gardens) {
    const canvas = document.createElement('canvas');
    canvas.width = garden.width;
    canvas.height = garden.height;
    const context = canvas.getContext('2d');
    if (!context) continue;
    context.drawImage(landscapeTexture,garden.x,garden.y,garden.width,garden.height,0,0,garden.width,garden.height);
    context.globalCompositeOperation = 'destination-in';
    const mask = context.createRadialGradient(garden.width / 2,garden.height / 2,0,
      garden.width / 2,garden.height / 2,Math.max(garden.width,garden.height) * .5);
    mask.addColorStop(0,'#000');
    mask.addColorStop(.55,'#000');
    mask.addColorStop(1,'transparent');
    context.fillStyle = mask;
    context.fillRect(0,0,garden.width,garden.height);
    gardenTextures.push({...garden,canvas});
  }
  paintLandscape();
  paintLivingOrb();
});
