// Use the same rasterized stellar clouds and dust lanes as the main site.
let realGalaxyTexture = null;
if (window.AstralisRealisticGalaxy) {
  const galaxyCanvas = document.createElement('canvas');
  if (window.AstralisRealisticGalaxy.draw(galaxyCanvas)) realGalaxyTexture = galaxyCanvas;
}
const passages={home:{ref:'John 14:2–3',quote:'“In my Father’s house are many mansions … I go to prepare a place for you.”',text:'Jesus offers his disciples reassurance as they face separation. We imagine those many dwelling places as a welcome, held in the hope of being with him.'},tears:{ref:'John 11:33–36',quote:'“Jesus wept.”',text:'Before raising Lazarus, Jesus shares in the sorrow around him. This reflection holds grief and hope together. Love gives us room to mourn.'},hope:{ref:'Revelation 21:4–5',quote:'“And God shall wipe away all tears from their eyes … Behold, I make all things new.”',text:'Revelation describes a vision of renewed creation and the end of death and sorrow. The river and light of this imagined world give shape to that hope.'}};const buttons=document.querySelectorAll('[data-passage]');function showPassage(key){const p=passages[key];document.getElementById('reference').textContent=p.ref+' · King James Version';document.getElementById('quote').textContent=p.quote;document.getElementById('reflection').textContent=p.text;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.passage===key)));}buttons.forEach(b=>b.addEventListener('click',()=>showPassage(b.dataset.passage)));showPassage('home');const sky=document.querySelector('.particles');for(let i=0;i<28;i++){const star=document.createElement('i');star.style.left=(i*37%100)+'%';star.style.top=(i*53%100)+'%';star.style.animationDelay=-(i%8)+'s';sky.append(star);}
const lazarusScene = document.getElementById('lazarusScene');
const replayLazarus = document.getElementById('replayLazarus');
const lazarusCaption = document.getElementById('lazarusCaption');
let sceneFrame = 0;
let sceneSeen = false;
let sceneReady = false;
function awakenLazarus() {
  sceneFrame = 0;
  if (!sceneReady) return;
  lazarusScene.classList.add('is-awake');
  lazarusCaption.textContent = '“Lazarus, come forth.” — John 11:43 (KJV)';
}
function scheduleLazarus() {
  cancelAnimationFrame(sceneFrame);
  sceneFrame = requestAnimationFrame(() => {
    sceneFrame = requestAnimationFrame(awakenLazarus);
  });
}
// Wait for both photographic layers so the figure never appears before the tomb.
const sceneImages = Array.from(lazarusScene.querySelectorAll('img'));
function prepareLazarus() {
  if (sceneReady) return;
  // Lazy images load when this lower-page scene approaches the viewport.
  sceneImages.forEach(image => { image.loading = 'eager'; });
  Promise.all(sceneImages.map(image => image.decode().catch(() => {}))).then(() => {
    sceneReady = true;
    replayLazarus.disabled = false;
    if (sceneSeen) scheduleLazarus();
  });
}
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      sceneSeen = true;
      prepareLazarus();
      sceneObserver.disconnect();
    }
  }, {threshold: 0.3});
  sceneObserver.observe(lazarusScene);
} else {
  sceneSeen = true;
  prepareLazarus();
}
replayLazarus.addEventListener('click', () => {
  lazarusScene.classList.remove('is-awake');
  lazarusCaption.textContent = 'The tomb stands open. Jesus calls Lazarus by name.';
  scheduleLazarus();
});
lazarusScene.querySelector('.lazarus-emergence').addEventListener('animationend', event => {
  if (event.animationName === 'lazarus-into-daylight') {
    lazarusCaption.textContent = 'Lazarus comes out, still wrapped in burial cloth. “Loose him, and let him go.” — John 11:44 (KJV)';
  }
});
for (let index = 0; index < 18; index++) {
  const mote = document.createElement('i');
  mote.style.setProperty('--dust-x', (15 + index * 41 % 70) + '%');
  mote.style.setProperty('--dust-y', (20 + index * 29 % 65) + '%');
  mote.style.setProperty('--dust-delay', (-index * 1.3) + 's');
  mote.style.setProperty('--dust-time', (9 + index % 5) + 's');
  lazarusScene.querySelector('.bethany-dust').append(mote);
}
function syncBethanyVisibility() {
  lazarusScene.classList.toggle('scene-hidden', document.hidden);
}
document.addEventListener('visibilitychange', syncBethanyVisibility);
syncBethanyVisibility();

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
  if (realGalaxyTexture) {
    for (let galaxy = 0; galaxy < 2; galaxy++) {
      livingContext.save();
      livingContext.translate(skyWidth * (galaxy ? .87 : .10),skyHeight * (galaxy ? .23 : .66));
      livingContext.scale(1,.56);
      livingContext.rotate(skyTime * .07 * (galaxy ? -1 : 1));
      livingContext.globalAlpha = .78;
      const diameter = Math.min(skyWidth * .24,260);
      livingContext.drawImage(realGalaxyTexture,-diameter / 2,-diameter / 2,diameter,diameter);
      livingContext.restore();
    }
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
let waterSurface = null;
let galaxyTexture = null;
const landscapeTexture = new Image();
landscapeTexture.src = 'fathers-house-realistic.jpg';
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
  const water = waterSurface && waterSurface.draw(time);
  if (water) ctx.drawImage(water,0,0,1672,941);

  if (galaxyTexture) {
    ctx.save();
    ctx.translate(1510,78);
    ctx.scale(1,.59);
    ctx.rotate(time * .08);
    ctx.globalAlpha = .8;
    ctx.drawImage(galaxyTexture,-105,-105,210,210);
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
  waterSurface = window.FathersHouseWater ? window.FathersHouseWater.create(landscapeTexture) : null;
  galaxyTexture = realGalaxyTexture;
  paintLandscape();
  paintLivingOrb();
});

