(() => {
  const car = document.getElementById('astralis-starman-roadster');
  if (!car) return;
  const brain = document.querySelector('.thought-art');
  const greeting = document.getElementById('starman-greeting');
  let greetingTimer;
  let previousPosition;
  let heading = 0;
  // The photograph's nose points left. Rotate it to the actual drift tangent.
  function forwardHeading(dx, dy, previousHeading) {
    const target = Math.atan2(dy, dx) * 180 / Math.PI + 180;
    const turn = ((target - previousHeading + 180) % 360 + 360) % 360 - 180;
    return previousHeading + turn;
  }
  function faceTravelDirection() {
    if (document.hidden) {
      previousPosition = undefined;
    } else {
      const rect = car.getBoundingClientRect();
      const position = { x: rect.left, y: rect.top };
      if (!previousPosition) previousPosition = position;
      const dx = position.x - previousPosition.x, dy = position.y - previousPosition.y;
      // Accumulate very small movements rather than reacting to rounding noise.
      if (Math.hypot(dx, dy) > .04) {
        heading = forwardHeading(dx, dy, heading);
        car.style.setProperty('--roadster-heading', heading + 'deg');
        car.dataset.travelHeading = String(heading);
        previousPosition = position;
      }
    }
    requestAnimationFrame(faceTravelDirection);
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
    previousPosition = undefined;
    const width = car.offsetWidth, height = car.offsetHeight;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 78;
    const top = Math.min(Math.max(100, headerBottom + 16), Math.max(12, innerHeight - height - 140));
    car.style.setProperty('--roadster-top', top + 'px');
    car.style.setProperty('--roadster-x', Math.max(0, innerWidth - width - 24) + 'px');
    car.style.setProperty('--roadster-y', Math.max(0, innerHeight - top - height - 140) + 'px');
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
  requestAnimationFrame(faceTravelDirection);
  window.addEventListener('resize', sizeRoute, { passive: true });
  window.addEventListener('scroll', keepBrainClear, { passive: true });
  document.addEventListener('visibilitychange', () => {
    car.classList.toggle('starman-page-hidden', document.hidden);
    keepBrainClear();
  });
  setInterval(keepBrainClear, 200);
})();
