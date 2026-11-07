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
