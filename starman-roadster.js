(() => {
  const car = document.getElementById('astralis-starman-roadster');
  if (!car) return;
  const brain = document.querySelector('.thought-art');
  const greeting = document.getElementById('starman-greeting');
  let greetingTimer;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0, lastFrame;
  let travelWidth = 0, travelHeight = 0, floatPadding = 0;
  // Independent waves give the weightless drift and tumble different rhythms.
  function floatPose(milliseconds, width, height) {
    const seconds = milliseconds / 1000;
    const wave = period => seconds * Math.PI * 2 / period;
    return {
      x: width * (.5 + .42 * Math.cos(wave(170)) + .06 * Math.sin(wave(61))),
      y: height * (.5 + .4 * Math.sin(wave(137) - 1.1) + .08 * Math.sin(wave(47))),
      rotation: -8 + seconds * 360 / 220 + 9 * Math.sin(wave(37)),
      scale: .97 + .03 * Math.sin(wave(73))
    };
  }
  function positionCar() {
    const pose = floatPose(elapsed, travelWidth, travelHeight);
    car.style.setProperty('--roadster-pos-x', (floatPadding + pose.x) + 'px');
    car.style.setProperty('--roadster-pos-y', pose.y + 'px');
    car.style.setProperty('--roadster-rotation', pose.rotation + 'deg');
    car.style.setProperty('--roadster-scale', String(pose.scale));
    car.dataset.motion = 'free-floating';
    car.dataset.floatRotation = String(pose.rotation);
  }
  function floatFrame(now) {
    const paused = document.hidden || motionPreference.matches ||
      car.matches(':hover, :focus-visible') || car.classList.contains('starman-greeting-open');
    if (!paused) {
      if (lastFrame !== undefined) elapsed += Math.min(now - lastFrame, 100);
      positionCar();
    }
    lastFrame = now;
    requestAnimationFrame(floatFrame);
  }
  function positionGreeting() {
    if (!greeting || !greeting.classList.contains('show')) return;
    const rect = car.getBoundingClientRect();
    const width = greeting.offsetWidth, height = greeting.offsetHeight;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 78;
    const left = Math.max(12, Math.min(innerWidth - width - 12, rect.left + (rect.width - width) / 2));
    const above = rect.top - height - 10;
    const top = above >= headerBottom + 8 ? above : Math.min(innerHeight - height - 12, rect.bottom + 10);
    greeting.style.left = left + 'px';
    greeting.style.top = Math.max(12, top) + 'px';
  }
  car.addEventListener('click', () => {
    if (!greeting) return;
    clearTimeout(greetingTimer);
    car.classList.add('starman-greeting-open');
    greeting.textContent = 'Hello world!';
    greeting.classList.add('show');
    positionGreeting();
    // Voice is initiated only by a click; the bubble works without speech support.
    try {
      if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window && !speechSynthesis.speaking) {
        const message = new SpeechSynthesisUtterance('Hello world!');
        message.lang = 'en-US';
        message.rate = .95;
        speechSynthesis.speak(message);
      }
    } catch {}
    greetingTimer = setTimeout(() => {
      greeting.classList.remove('show');
      greeting.textContent = '';
      car.classList.remove('starman-greeting-open');
    }, 4000);
  });
  function sizeRoute() {
    const width = car.offsetWidth, height = car.offsetHeight;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 78;
    // Reserve room around the car so its rotating corners stay inside the view.
    floatPadding = Math.ceil((Math.hypot(width, height) - Math.min(width, height)) / 2) + 12;
    const top = Math.min(Math.max(100, headerBottom + floatPadding), Math.max(12, innerHeight - height - 140));
    travelWidth = Math.max(0, innerWidth - width - 24 - floatPadding * 2);
    travelHeight = Math.max(0, innerHeight - top - height - 140 - floatPadding);
    car.style.setProperty('--roadster-top', top + 'px');
    car.style.setProperty('--roadster-x', Math.max(0, innerWidth - width - 24) + 'px');
    car.style.setProperty('--roadster-y', Math.max(0, innerHeight - top - height - 140) + 'px');
    positionCar();
    keepBrainClear();
    positionGreeting();
  }
  function keepBrainClear() {
    if (!brain || document.hidden) return;
    const a = car.getBoundingClientRect(), b = brain.getBoundingClientRect();
    car.classList.toggle('starman-behind-brain',
      a.right > b.left - 20 && a.left < b.right + 20 &&
      a.bottom > b.top - 20 && a.top < b.bottom + 20);
  }
  sizeRoute();
  requestAnimationFrame(floatFrame);
  window.addEventListener('resize', sizeRoute, { passive: true });
  motionPreference.addEventListener('change', sizeRoute);
  window.addEventListener('scroll', keepBrainClear, { passive: true });
  document.addEventListener('visibilitychange', () => {
    lastFrame = undefined;
    keepBrainClear();
  });
  setInterval(keepBrainClear, 200);
})();
