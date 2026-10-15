(() => {
  'use strict';
  if (window.__novaFlyingAce) return;
  window.__novaFlyingAce = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const jokes = [
    'Mission control, I asked for the Red Baron. This is clearly the wrong galaxy.',
    'Warp drive? I was told this thing runs on imagination and dog biscuits.',
    'Captain’s log: still no fire hydrants on this planet.',
    'Houston, we have a beagle. Please send snacks.',
    'One small step for a dog. One giant leap for property values.',
    'The navigation system said “turn left at the Moon.” I may have missed it.'
  ];
  let flight, timer, bubbleTimer, pass = 0, joke = 0, paused = false, dismissed = false;
  let visitor, controls, pauseButton, message, greetingTimer;
  function tellJoke() {
    clearTimeout(bubbleTimer);
    clearTimeout(greetingTimer);
    visitor.classList.remove('ace-greeting');
    // Reflow restarts the short paw salute and happy head nod on each click.
    void visitor.offsetWidth;
    visitor.classList.add('ace-greeting');
    greetingTimer = setTimeout(() => visitor.classList.remove('ace-greeting'), 2500);
    message.textContent = jokes[joke++ % jokes.length];
    message.hidden = false;
    bubbleTimer = setTimeout(() => { message.hidden = true; }, 6500);
  }
  function park() {
    flight?.cancel();
    const x = Math.max(8, innerWidth - visitor.offsetWidth - 20);
    const y = Math.max(90, Math.min(innerHeight * .3, innerHeight - visitor.offsetHeight - 80));
    visitor.style.transform = `translate(${x}px,${y}px)`;
    visitor.style.visibility = 'visible';
  }
  function fly() {
    clearTimeout(timer);
    if (dismissed || paused || document.hidden) return;
    if (reduced.matches || typeof visitor.animate !== 'function') { park(); return; }
    flight?.cancel();
    const w = visitor.offsetWidth, h = visitor.offsetHeight;
    const right = pass++ % 2 === 0;
    const dir = right ? 1 : -1;
    visitor.dataset.heading = right ? 'right' : 'left';
    const start = right ? -w - 25 : innerWidth + 25;
    const end = right ? innerWidth + 25 : -w - 25;
    const top = Math.min(110, Math.max(12, innerHeight - h - 80));
    const span = Math.max(0, innerHeight - h - top - 100);
    const frames = Array.from({ length: 49 }, (_, i) => {
      const t = i / 48;
      const y = top + span * (.46 + .3 * Math.sin(t * Math.PI * 2 + pass));
      const size = .65 + .47 * Math.sin(t * Math.PI);
      const bank = 11 * Math.cos(t * Math.PI * 2 + pass) + 3 * Math.sin(t * Math.PI * 6);
      return { transform: `translate(${start + (end-start)*t}px,${y}px) scale(${dir*size},${size}) rotate(${bank}deg)` };
    });
    visitor.style.visibility = 'visible';
    flight = visitor.animate(frames, { duration: 29000 + (pass % 3) * 3000, easing: 'linear', fill: 'forwards' });
    flight.onfinish = () => {
      visitor.style.visibility = 'hidden';
      timer = setTimeout(fly, 11000);
    };
  }
  function sync() {
    const still = paused || document.hidden || reduced.matches || document.activeElement === visitor;
    visitor.classList.toggle('ace-still', still);
    pauseButton.textContent = paused ? 'Resume patrol' : 'Pause patrol';
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (dismissed) return;
    if (still) { clearTimeout(timer); flight?.pause(); if (reduced.matches) park(); }
    else if (flight && flight.playState === 'paused') flight.play();
    else if (!flight || flight.playState !== 'running') fly();
  }
  async function boot() {
    // Keep the small animation local; no third-party embeds or autoplay audio.
    const response = await fetch('/snoopy-patrol.svg?v=20261014eyes3', { credentials: 'same-origin' });
    if (!response.ok) return;
    const svg = await response.text();
    if (!svg.startsWith('<svg')) return;
    if (document.getElementById('novaFlyingAce')) return;
    visitor = document.createElement('button');
    visitor.id = 'novaFlyingAce';
    visitor.type = 'button';
    visitor.setAttribute('aria-label', 'Snoopy flying his doghouse. Click for a cosmic joke.');
    visitor.title = 'Flying Ace: click for a cosmic joke';
    visitor.innerHTML = svg;
    visitor.querySelector('svg').setAttribute('aria-hidden', 'true');
    message = document.createElement('div');
    message.id = 'novaAceMessage';
    message.hidden = true;
    message.setAttribute('role', 'status');
    controls = document.createElement('details');
    controls.id = 'novaAceControl';
    controls.innerHTML = `<summary>✈ Flying Ace</summary><div class="ace-panel"><p>A doghouse has wandered into Astralis Nova airspace. Click Snoopy for a little cosmic nonsense.</p><button type="button" data-ace="pause" aria-pressed="false">Pause patrol</button><button type="button" data-ace="recall">Call Snoopy</button><button type="button" data-ace="hide">Hide visitor</button><small>Unofficial fan tribute. Snoopy / Peanuts © Peanuts Worldwide LLC.<br><a href="https://schulzmuseum.org/snoopy-red-baron/" target="_blank" rel="noopener noreferrer">The Flying Ace story ↗</a></small></div>`;
    document.body.append(visitor, message, controls);
    pauseButton = controls.querySelector('[data-ace="pause"]');
    visitor.addEventListener('click', tellJoke);
    visitor.addEventListener('pointermove', event => {
      if (paused || reduced.matches || document.hidden || dismissed) return;
      const rect = visitor.getBoundingClientRect();
      // Use normalized coordinates so the gaze works at every sprite size.
      if (!rect.width || !rect.height) return;
      const facingLeft = visitor.dataset.heading === 'left';
      const x = ((event.clientX - rect.left) / rect.width - (facingLeft ? .45 : .55)) * (facingLeft ? -1 : 1);
      const y = (event.clientY - rect.top) / rect.height - .24;
      visitor.style.setProperty('--ace-gaze-x', `${Math.max(-2.5, Math.min(2.5, x * 8))}px`);
      visitor.style.setProperty('--ace-gaze-y', `${Math.max(-2, Math.min(2, y * 6))}px`);
      visitor.classList.add('ace-tracking');
    }, { passive: true });
    visitor.addEventListener('pointerleave', () => visitor.classList.remove('ace-tracking'));
    // Hold position while a keyboard user is interacting with the character.
    visitor.addEventListener('focus', () => flight?.pause());
    visitor.addEventListener('blur', sync);
    pauseButton.addEventListener('click', () => { paused = !paused; sync(); });
    controls.querySelector('[data-ace="recall"]').addEventListener('click', () => {
      dismissed = false; paused = false; visitor.hidden = false;
      controls.querySelector('[data-ace="hide"]').disabled = false;
      clearTimeout(timer); flight?.cancel(); flight = undefined; sync(); tellJoke();
    });
    controls.querySelector('[data-ace="hide"]').addEventListener('click', event => {
      dismissed = true; clearTimeout(timer); clearTimeout(bubbleTimer); clearTimeout(greetingTimer); flight?.cancel();
      visitor.hidden = true; message.hidden = true; event.currentTarget.disabled = true;
      controls.open = false;
    });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (!dismissed) { flight?.cancel(); flight = undefined; park(); sync(); } }, 160);
    }, { passive: true });
    if (reduced.matches) { park(); sync(); }
    else timer = setTimeout(fly, 1800);
  }
  const start = () => boot().catch(error => console.warn('Flying Ace could not land:', error));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
