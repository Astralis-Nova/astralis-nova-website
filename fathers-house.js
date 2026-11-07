// Use the same rasterized stellar clouds and dust lanes as the main site.
let realGalaxyTexture = null;
if (window.AstralisRealisticGalaxy) {
  const galaxyCanvas = document.createElement('canvas');
  if (window.AstralisRealisticGalaxy.draw(galaxyCanvas)) realGalaxyTexture = galaxyCanvas;
}
// Reuse the main page's complete spiral texture and its fixed-inclination projection.
for (const canvas of document.querySelectorAll('.house-galaxy-canvas')) {
  if (!realGalaxyTexture) { canvas.parentElement.parentElement.hidden = true; continue; }
  canvas.width = canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (context) context.drawImage(realGalaxyTexture,0,0,1024,1024);
}
const passages={home:{ref:'John 14:2–3',quote:'“In my Father’s house are many mansions … I go to prepare a place for you.”',text:'Jesus offers his disciples reassurance as they face separation. We imagine those many dwelling places as a welcome, held in the hope of being with him.'},tears:{ref:'John 11:33–36',quote:'“Jesus wept.”',text:'Before raising Lazarus, Jesus shares in the sorrow around him. This reflection holds grief and hope together. Love gives us room to mourn.'},hope:{ref:'Revelation 21:4–5',quote:'“And God shall wipe away all tears from their eyes … Behold, I make all things new.”',text:'Revelation describes a vision of renewed creation and the end of death and sorrow. The river and light of this imagined world give shape to that hope.'}};const buttons=document.querySelectorAll('[data-passage]');function showPassage(key){const p=passages[key];document.getElementById('reference').textContent=p.ref+' · King James Version';document.getElementById('quote').textContent=p.quote;document.getElementById('reflection').textContent=p.text;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.passage===key)));}buttons.forEach(b=>b.addEventListener('click',()=>showPassage(b.dataset.passage)));showPassage('home');
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
    prepareBethanyAtmosphere();
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
  document.body.classList.toggle('page-hidden', document.hidden);
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
let gardenSimulation = null;
let galaxyTexture = null;
const landscapeTexture = new Image();
const botanicalTexture = new Image();

const gardenViewport = document.getElementById('gardenViewport');
let gardenPositioned = false;
const landscapeCanvas = document.getElementById('landscapeLife');
const landscapeContext = landscapeCanvas.getContext('2d');
// Render one enlarged panorama, with native sideways exploration on smaller screens.
const panorama = document.createElement('canvas');
panorama.width = 1672; panorama.height = 941;
const panoramaContext = panorama.getContext('2d');
const bethanyCanvas = document.getElementById('bethanyLife');
const bethanyContext = bethanyCanvas.getContext('2d');
bethanyCanvas.width = 1280; bethanyCanvas.height = 720;
let bethanySurface = null;
let bethanyVisible = false;
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
  if (!gardenPositioned && gardenViewport.clientWidth) {
    gardenViewport.scrollLeft = Math.max(0,gardenViewport.scrollWidth-gardenViewport.clientWidth)*.56;
    gardenPositioned = true;
  }
  paintLandscape();
  paintLandscapeView();
}

function lightDot(x, y, radius, color) {
  panoramaContext.fillStyle = color;
  panoramaContext.beginPath();
  panoramaContext.arc(x, y, radius, 0, Math.PI * 2);
  panoramaContext.fill();
}

function paintLandscape() {
  if (!landscapeContext || !landscapeWidth || !landscapeHeight) return;
  const ctx = panoramaContext;
  if (!ctx) return;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,1672,941);
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

  // Small, shaded wings follow curved paths through the flowers.
  for (let butterfly=0;butterfly<4;butterfly++) {
    const phase=time*.13+butterfly*2.3;
    const x=butterfly%2 ? 1370+Math.sin(phase)*100 : 480+Math.sin(phase)*145;
    const y=690+Math.sin(phase*1.7+butterfly)*65+butterfly*22;
    const wing=1.1+Math.abs(Math.sin(time*9+butterfly))*5.3;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(phase*2)*.45);
    ctx.globalAlpha=.82;
    const shade=ctx.createLinearGradient(-wing,0,wing,0);
    shade.addColorStop(0,butterfly%2?'#b98d64':'#d6b8a5');
    shade.addColorStop(.5,'#594839');shade.addColorStop(1,'#f6e3b6');
    ctx.fillStyle=shade;ctx.strokeStyle='#544330';ctx.lineWidth=.5;
    ctx.beginPath();
    ctx.ellipse(-wing*.6,-2,wing,5,-.4,0,Math.PI*2);
    ctx.ellipse(wing*.6,-2,wing,5,.4,0,Math.PI*2);
    ctx.ellipse(-wing*.5,3,wing*.7,3.5,.4,0,Math.PI*2);
    ctx.ellipse(wing*.5,3,wing*.7,3.5,-.4,0,Math.PI*2);
    ctx.fill();ctx.stroke();
    ctx.strokeStyle='#413329';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,7);ctx.stroke();
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
  if (motionPaused || document.hidden || (!landscapeVisible && !bethanyVisible) || !landscapeContext) {
    landscapeLastTime = 0;
    return;
  }
  // Bound GPU and canvas work to 30 frames per second, including on phones.
  if (!landscapeLastTime || timestamp - landscapeLastTime >= 32) {
    if (landscapeLastTime) landscapeTime += Math.min((timestamp - landscapeLastTime) / 1000,.1);
    landscapeLastTime = timestamp;
    if (landscapeVisible) {
      paintLandscape();
      paintLandscapeView();
    }
    if (bethanyVisible) paintBethanyAtmosphere();
  }
  landscapeFrame = requestAnimationFrame(animateLandscape);
}

function syncLandscape() {
  cancelAnimationFrame(landscapeFrame);
  landscapeFrame = 0;
  landscapeLastTime = 0;
  if (!motionPaused && !document.hidden && (landscapeVisible || bethanyVisible) && landscapeContext) {
    landscapeFrame = requestAnimationFrame(animateLandscape);
  }
}

motionButton.addEventListener('click', syncLandscape);
motionPreference.addEventListener('change', syncLandscape);
document.addEventListener('visibilitychange', syncLandscape);
window.addEventListener('resize', sizeLandscape);
if ('IntersectionObserver' in window) {
  const landscapeObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === bethanyCanvas) bethanyVisible = entry.isIntersecting;
      else if (entry.target === landscapeCanvas) landscapeVisible = entry.isIntersecting;
    }
    syncLandscape();
  }, {rootMargin: '120px'});
  landscapeObserver.observe(landscapeCanvas);
  landscapeObserver.observe(bethanyCanvas);
}
if (landscapeContext) sizeLandscape();
syncLandscape();


// Composite independent simulated layers above immovable scenery.
function paintLivingTextures(ctx, time) {
  if (!landscapeTexture.complete || !landscapeTexture.naturalWidth) return;
  const scene = gardenSimulation && gardenSimulation.draw(time);
  ctx.drawImage(scene || landscapeTexture,0,0,1672,941);

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

function prepareGardenSimulation() {
  if (gardenSimulation) return;
  if (!landscapeTexture.naturalWidth || !botanicalTexture.naturalWidth) return;
  gardenSimulation = window.FathersHouseSimulation ? window.FathersHouseSimulation.create(landscapeTexture,botanicalTexture) : null;
  landscapeCanvas.dataset.renderer = gardenSimulation ? gardenSimulation.backend : 'still';
  galaxyTexture = realGalaxyTexture;
  paintLandscape();
  paintLandscapeView();
}
landscapeTexture.addEventListener('load',prepareGardenSimulation);
botanicalTexture.addEventListener('load',prepareGardenSimulation);


// The complete artwork remains aligned as the viewport is resized or scrolled.
function paintLandscapeView() {
  if (!landscapeWidth || !landscapeHeight) return;
  const density = Math.min(window.devicePixelRatio || 1,1.5);
  const scale = Math.max(landscapeWidth / 1672,landscapeHeight / 941);
  landscapeContext.setTransform(density,0,0,density,0,0);
  landscapeContext.clearRect(0,0,landscapeWidth,landscapeHeight);
  landscapeContext.drawImage(panorama,(landscapeWidth-1672*scale)/2,(landscapeHeight-941*scale)/2,1672*scale,941*scale);
}
function prepareBethanyAtmosphere() {
  const image = lazarusScene.querySelector('.bethany-backdrop');
  if (!image.naturalWidth || !window.FathersHouseSimulation) return;
  bethanySurface = window.FathersHouseSimulation.createBethany();
  paintBethanyAtmosphere();
  syncLandscape();
}
function paintBethanyAtmosphere() {
  if (!bethanySurface || !bethanyContext) return;
  const frame = bethanySurface.draw(landscapeTime);
  if (frame) {
    bethanyContext.clearRect(0,0,bethanyCanvas.width,bethanyCanvas.height);
    bethanyContext.drawImage(frame,0,0,bethanyCanvas.width,bethanyCanvas.height);
  }
}
// ResizeObserver also catches layout changes without a window resize.
if ('ResizeObserver' in window) new ResizeObserver(sizeLandscape).observe(landscapeCanvas);
botanicalTexture.src = 'assets/garden-botanical-parts-v5.webp';
landscapeTexture.src = 'assets/fathers-garden-clean-v5.webp';
