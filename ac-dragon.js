(() => {
  const dragon = document.querySelector('.ac-dragon-emblem');
  const canvas = document.getElementById('acDragonCanvas');
  const still = document.getElementById('acDragonStill');
  const toggle = document.getElementById('acDragonToggle');
  if (!dragon || !canvas || !still || !toggle) return;
  const home = dragon.parentElement;
  const context = canvas.getContext('2d');
  if (!context) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sheet = new Image();
  let ready = false;
  let wantsToFly = !preference.matches;
  let request = 0;
  let previousTime = 0;
  let elapsed = 0;
  let lastFrame = -1;
  let route = [];
  let distance = 0;
  let facing = -1;
  let bank = 0;
  const duration = 34000;

  const updateButton = () => {
    const label = wantsToFly ? 'Pause dragon flight' : 'Play dragon flight';
    toggle.dataset.playing = String(wantsToFly);
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };
  const measureRoute = () => {
    const size = Math.min(250, Math.max(110, innerWidth * .2));
    const bar = document.querySelector('.topbar').getBoundingClientRect().bottom;
    const margin = Math.max(8, size * .15);
    const left = margin;
    const right = Math.max(left, innerWidth - size - margin);
    const top = Math.max(76, bar + size * .15);
    const bottom = Math.max(top, innerHeight - size - margin);
    const middle = top + (bottom - top) * .5;
    // The circuit keeps most of its flight in the page margins.
    route = [
      [right, top], [right, middle], [right, bottom],
      [left, bottom], [left, middle], [left, top], [right, top]
    ];
    distance = 0;
    for (let i = 1; i < route.length; i++) {
      distance += Math.hypot(route[i][0] - route[i-1][0], route[i][1] - route[i-1][1]);
    }
  };
  const flightPosition = progress => {
    let travelled = progress * distance;
    for (let i = 1; i < route.length; i++) {
      const a = route[i-1], b = route[i];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (travelled <= length || i === route.length - 1) {
        const amount = length ? travelled / length : 0;
        return {x:a[0]+(b[0]-a[0])*amount,y:a[1]+(b[1]-a[1])*amount,dx:b[0]-a[0],dy:b[1]-a[1]};
      }
      travelled -= length;
    }
  };
  const draw = time => {
    request = 0;
    if (!wantsToFly || document.hidden || !ready) {
      previousTime = 0;
      return;
    }
    if (previousTime) elapsed += Math.min(time - previousTime, 100);
    previousTime = time;
    const frame = Math.floor(elapsed / 140) % 6;
    if (frame !== lastFrame) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(sheet, (frame % 3) * canvas.width, Math.floor(frame / 3) * canvas.height, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      lastFrame = frame;
    }
    const p = flightPosition((elapsed % duration) / duration);
    if (Math.abs(p.dx) > 1) facing = p.dx > 0 ? 1 : -1;
    const targetBank = Math.abs(p.dy) > 1 ? (p.dy > 0 ? 12 : -12) * facing : 0;
    bank += (targetBank - bank) * .06;
    dragon.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0) rotate(' + bank + 'deg) scaleX(' + facing + ')';
    request = requestAnimationFrame(draw);
  };
  const applyFlight = () => {
    if (request) cancelAnimationFrame(request);
    request = 0;
    previousTime = 0;
    updateButton();
    if (wantsToFly && ready && !document.hidden) {
      document.body.append(dragon);
      dragon.dataset.flying = 'true';
      canvas.hidden = false;
      still.hidden = true;
      measureRoute();
      request = requestAnimationFrame(draw);
    }
  };
  const park = () => {
    wantsToFly = false;
    home.append(dragon);
    dragon.dataset.flying = 'false';
    dragon.style.removeProperty('transform');
    still.hidden = false;
    canvas.hidden = true;
    elapsed = 0;
    lastFrame = -1;
    applyFlight();
  };
  document.body.append(toggle);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    wantsToFly = !wantsToFly;
    applyFlight();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) park();
    else {
      wantsToFly = true;
      applyFlight();
    }
  });
  document.addEventListener('visibilitychange', applyFlight);
  window.addEventListener('resize', measureRoute, {passive:true});
  sheet.onload = () => {
    canvas.width = sheet.naturalWidth / 3;
    canvas.height = sheet.naturalHeight / 2;
    ready = true;
    applyFlight();
  };
  sheet.onerror = () => {
    park();
    toggle.hidden = true;
  };
  sheet.src = '/assets/ac-portals/ac-dragon-flight-sheet.webp';
  updateButton();
})();
