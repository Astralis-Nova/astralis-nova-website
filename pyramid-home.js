(() => {
  const root = document.getElementById('pyrHome');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const dialog = $('pyrHomeDialog');
  const query = $('pyrHomeQuery');
  const thought = $('pyrHomeThought');
  const results = $('pyrHomeResults');
  const detail = $('pyrHomeDetail');
  const status = $('pyrHomeStatus');
  const canvas = $('pyrHomeCanvas');
  const ctx = canvas.getContext('2d');
  let latest = 0;
  let timer;

  const MORSE_MESSAGE = 'ASTRALIS NOVA';
  const MORSE_UNIT_MS = 240;
  const MORSE_ALPHABET = { A: '.-', S: '...', T: '-', R: '.-.', L: '.-..', I: '..', N: '-.', O: '---', V: '...-' };
  const morseSequence = [];
  const morseWords = MORSE_MESSAGE.split(' ');
  morseWords.forEach((word, wordIndex) => {
    [...word].forEach((letter, letterIndex) => {
      const code = MORSE_ALPHABET[letter];
      [...code].forEach((mark, markIndex) => {
        morseSequence.push({ on: true, units: mark === '.' ? 1 : 3 });
        if (markIndex < code.length - 1) morseSequence.push({ on: false, units: 1 });
      });
      if (letterIndex < word.length - 1) morseSequence.push({ on: false, units: 3 });
    });
    // Seven units separate words; a longer pause separates full messages.
    morseSequence.push({ on: false, units: wordIndex < morseWords.length - 1 ? 7 : 14 });
  });
  const morseCycleMs = morseSequence.reduce((total, item) => total + item.units * MORSE_UNIT_MS, 0);
  function morseLampOn(elapsed) {
    let phase = ((elapsed % morseCycleMs) + morseCycleMs) % morseCycleMs;
    for (const item of morseSequence) {
      const duration = item.units * MORSE_UNIT_MS;
      if (phase < duration) return item.on;
      phase -= duration;
    }
    return false;
  }
  root.dataset.morseMessage = MORSE_MESSAGE;
  root.dataset.morseUnitMs = String(MORSE_UNIT_MS);

  function draw(angle, now = 0) {
    if (!ctx) return;
    const pulse = .5 + .5 * Math.sin(now / 520);
    const beaconLit = reducedMotion || morseLampOn(now - start);
    root.dataset.morseLight = beaconLit ? 'on' : 'off';
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const rotate = ([x, y, z]) => ({ x: x * cos + z * sin, y, z: -x * sin + z * cos });
    const project = ({ x, y, z }) => ({ x: 300 + x * 116, y: 195 - y * 105 + z * 28 });
    const base = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]].map(rotate);
    const tip = project(rotate([0, 1.46, 0]));
    ctx.clearRect(0, 0, 600, 400);

    // A quiet star chart frames the stone without turning it into a panel.
    const aura = ctx.createRadialGradient(300, 180, 18, 300, 180, 225);
    aura.addColorStop(0, 'rgba(37,132,230,' + (.32 + pulse * .16) + ')');
    aura.addColorStop(.5, 'rgba(24,91,176,.25)');
    aura.addColorStop(1, 'rgba(12,35,92,0)');
    ctx.fillStyle = aura; ctx.fillRect(70, 0, 460, 390);
    ctx.save();
    ctx.translate(300, 183);
    ctx.strokeStyle = 'rgba(110,190,255,.3)'; ctx.lineWidth = 1;
    ctx.setLineDash([44, 17, 5, 17]);
    ctx.beginPath(); ctx.ellipse(0, 0, 178, 146, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    for (let n = 0; n < 12; n++) {
      const a = n * Math.PI / 6;
      const x = Math.cos(a), y = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(x * 185, y * 153); ctx.lineTo(x * 197, y * 163);
      ctx.strokeStyle = n % 3 ? 'rgba(112,199,255,.3)' : 'rgba(186,225,255,.48)';
      ctx.stroke();
    }
    ctx.restore();

    const floor = ctx.createRadialGradient(300, 344, 10, 300, 344, 205);
    floor.addColorStop(0, 'rgba(60,171,255,.42)');
    floor.addColorStop(.55, 'rgba(38,117,204,.19)');
    floor.addColorStop(1, 'rgba(20,54,114,0)');
    ctx.fillStyle = floor; ctx.beginPath(); ctx.ellipse(300, 344, 200, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(118,203,255,.42)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(300, 349, 153, 17, 0, 0, Math.PI * 2); ctx.stroke();

    const faces = [0, 1, 2, 3]
      .map(i => ({ i, depth: (base[i].z + base[(i + 1) % 4].z) / 2 }))
      .sort((a, b) => a.depth - b.depth);
    for (const { i, depth } of faces) {
      const left = project(base[i]), right = project(base[(i + 1) % 4]);
      const middle = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
      const path = new Path2D();
      path.moveTo(tip.x, tip.y); path.lineTo(left.x, left.y); path.lineTo(right.x, right.y); path.closePath();
      const light = Math.max(0, Math.min(1, (depth + 1.4) / 2.8));
      const gradient = ctx.createLinearGradient(tip.x, tip.y, middle.x, middle.y);
      gradient.addColorStop(0, light > .5 ? '#a9dfff' : '#7ab7ed');
      gradient.addColorStop(.48, light > .5 ? '#397fbe' : '#2a5b9a');
      gradient.addColorStop(1, light > .5 ? '#163f7b' : '#132b61');
      ctx.fillStyle = gradient; ctx.fill(path);
      ctx.fillStyle = 'rgba(75,169,255,' + (.07 + pulse * .13) + ')'; ctx.fill(path);
      ctx.strokeStyle = 'rgba(140,219,255,.84)'; ctx.lineWidth = 2; ctx.stroke(path);
      ctx.save(); ctx.clip(path);

      // Courses and staggered joins keep the object visibly made of stone.
      for (let row = 1; row < 12; row++) {
        const t = row / 12;
        const lx = tip.x + (left.x - tip.x) * t, ly = tip.y + (left.y - tip.y) * t;
        const rx = tip.x + (right.x - tip.x) * t, ry = tip.y + (right.y - tip.y) * t;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry);
        ctx.strokeStyle = 'rgba(7,27,73,.58)'; ctx.lineWidth = 1.5; ctx.stroke();
        const flow = Math.max(0, 1 - Math.abs(row - ((now / 260) % 13)) / 1.7);
        if (flow > .02) {
          ctx.strokeStyle = 'rgba(150,241,255,' + (flow * .85) + ')';
          ctx.lineWidth = 2.1; ctx.shadowColor = '#66dfff'; ctx.shadowBlur = 9 + flow * 13;
          ctx.stroke(); ctx.shadowBlur = 0;
        }
        if (row > 2) {
          const joints = row % 2 ? [1 / 3, 2 / 3] : [.5];
          joints.forEach(f => {
            const next = (row + 1) / 12;
            const x1 = lx + (rx - lx) * f, y1 = ly + (ry - ly) * f;
            const x2 = tip.x + ((left.x + (right.x - left.x) * f) - tip.x) * next;
            const y2 = tip.y + ((left.y + (right.y - left.y) * f) - tip.y) * next;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = 'rgba(12,40,90,.38)'; ctx.lineWidth = 1; ctx.stroke();
          });
        }
      }

      const sweepY = tip.y - 40 + ((now / 3400) % 1) * (middle.y - tip.y + 85);
      const sweep = ctx.createLinearGradient(0, sweepY - 42, 0, sweepY + 42);
      sweep.addColorStop(0, 'rgba(130,233,255,0)');
      sweep.addColorStop(.5, 'rgba(165,243,255,' + (.18 + pulse * .19) + ')');
      sweep.addColorStop(1, 'rgba(130,233,255,0)');
      ctx.fillStyle = sweep; ctx.fillRect(0, sweepY - 42, 600, 84);

      // A luminous axis and geometric marks suggest an ancient machine.
      const axis = ctx.createLinearGradient(tip.x, tip.y, middle.x, middle.y);
      axis.addColorStop(0, 'rgba(225,249,255,.96)');
      axis.addColorStop(.3, 'rgba(127,211,255,.76)');
      axis.addColorStop(1, 'rgba(67,150,230,.2)');
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y + 19); ctx.lineTo(middle.x, middle.y - 5);
      ctx.strokeStyle = axis; ctx.lineWidth = 2; ctx.shadowColor = '#69caff'; ctx.shadowBlur = 12; ctx.stroke();
      ctx.shadowBlur = 0;
      if (depth > -.2) {
        for (let n = 0; n < 4; n++) {
          const t = .36 + n * .14;
          const x = tip.x + (middle.x - tip.x) * t;
          const y = tip.y + (middle.y - tip.y) * t;
          const size = 3 + t * 3;
          ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size); ctx.lineTo(x - size, y); ctx.closePath();
          ctx.strokeStyle = 'rgba(142,215,255,.82)'; ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
      ctx.restore();
    }

    // The blue capstone signals ASTRALIS NOVA in International Morse timing.
    const cap = .18;
    const tipEdges = base.map(v => {
      const p = project(v);
      return { x: tip.x + (p.x - tip.x) * cap, y: tip.y + (p.y - tip.y) * cap };
    });
    for (const { i } of faces) {
      const path = new Path2D();
      path.moveTo(tip.x, tip.y);
      path.lineTo(tipEdges[i].x, tipEdges[i].y);
      path.lineTo(tipEdges[(i + 1) % 4].x, tipEdges[(i + 1) % 4].y);
      path.closePath();
      ctx.fillStyle = beaconLit ? '#dcf8ff' : '#173a60'; ctx.fill(path);
      ctx.strokeStyle = beaconLit ? '#f0fdff' : '#4986b2'; ctx.lineWidth = 1.4; ctx.stroke(path);
    }
    // The LED outline breathes like the signals running through the brain.
    ctx.save();
    ctx.lineCap = 'round';
    for (const { i, depth } of faces) {
      if (depth <= .02) continue;
      const left = project(base[i]), right = project(base[(i + 1) % 4]);
      const edge = (a, b, phase) => {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.globalAlpha = .42 + .28 * pulse;
        ctx.strokeStyle = '#3d9dff'; ctx.lineWidth = 5 + pulse * 2;
        ctx.shadowColor = '#3faaff'; ctx.shadowBlur = 16 + pulse * 19; ctx.stroke();
        ctx.globalAlpha = .76 + .2 * pulse;
        ctx.strokeStyle = '#c4f1ff'; ctx.lineWidth = 1.45;
        ctx.shadowBlur = 7 + pulse * 6; ctx.stroke();
        for (let n = 1; n <= 5; n++) {
          const t = n / 6;
          const shimmer = .45 + .55 * Math.sin(now / 400 - n * .85 - phase);
          const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
          ctx.beginPath(); ctx.arc(x, y, 1.5 + Math.max(0, shimmer) * 1.7, 0, Math.PI * 2);
          ctx.globalAlpha = .44 + .5 * Math.max(0, shimmer);
          ctx.fillStyle = '#e7faff'; ctx.shadowBlur = 9 + pulse * 12; ctx.fill();
        }
      };
      edge(tip, left, i);
      edge(tip, right, i + 1);
      edge(left, right, i + 2);
    }
    ctx.restore();
    if (beaconLit) {
      const crown = ctx.createRadialGradient(tip.x, tip.y, 1, tip.x, tip.y, 46);
      crown.addColorStop(0, 'rgba(245,254,255,1)');
      crown.addColorStop(.25, 'rgba(144,231,255,.85)');
      crown.addColorStop(.6, 'rgba(63,170,255,.35)');
      crown.addColorStop(1, 'rgba(61,138,239,0)');
      ctx.fillStyle = crown; ctx.beginPath(); ctx.arc(tip.x, tip.y, 46, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.fillStyle = beaconLit ? '#f4fdff' : '#1b4166';
    ctx.shadowColor = '#79e4ff'; ctx.shadowBlur = beaconLit ? 28 : 0;
    ctx.beginPath(); ctx.arc(tip.x, tip.y, beaconLit ? 6 : 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  const roaming = root.classList.contains('pyr-roaming');
  const brain = document.querySelector('.thought-art');
  let lastCollisionCheck = 0;
  function sizeRoamingRoute() {
    if (!roaming) return;
    const width = root.offsetWidth, height = root.offsetHeight;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 78;
    const top = Math.min(Math.max(96, headerBottom + 12), Math.max(12, innerHeight - height - 140));
    root.style.setProperty('--pyr-top', top + 'px');
    root.style.setProperty('--pyr-travel-x', Math.max(0, innerWidth - width - 24) + 'px');
    root.style.setProperty('--pyr-travel-y', Math.max(0, innerHeight - top - height - 130) + 'px');
  }
  function keepBrainClear(now) {
    if (!roaming || !brain || now - lastCollisionCheck < 120) return;
    lastCollisionCheck = now;
    const a = root.getBoundingClientRect(), b = brain.getBoundingClientRect();
    const overlap = a.right > b.left - 20 && a.left < b.right + 20 &&
      a.bottom > b.top - 20 && a.top < b.bottom + 20;
    root.classList.toggle('pyr-behind-brain', overlap && !dialog.open && !root.contains(document.activeElement));
  }
  sizeRoamingRoute();
  window.addEventListener('resize', sizeRoamingRoute, { passive: true });
  window.addEventListener('scroll', () => keepBrainClear(performance.now() + 121), { passive: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  let start = performance.now();
  function animate(now) {
    keepBrainClear(now);
    if (visible && document.visibilityState === 'visible') draw(reducedMotion ? .55 : .55 + (now - start) / 25000 * Math.PI * 2, now);
    if (!reducedMotion) requestAnimationFrame(animate);
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);
  requestAnimationFrame(animate);

  function showDetail(message) {
    detail.textContent = message;
    detail.classList.toggle('character-art', /\n|  /.test(message));
  }

  function render(data, prefix) {
    results.replaceChildren();
    const entries = (data.entries || []).slice(0, 16);
    if (reducedMotion) draw(.55, performance.now());
    $('pyrHomeFound').textContent = prefix ? `Thoughts beginning with “${prefix}”` : 'Search by the first characters.';
    if (!entries.length) {
      showDetail(prefix ? 'No thought begins that way yet.' : 'Search by the first characters, or leave a thought of your own.');
      return;
    }
    entries.forEach(entry => {
      if (prefix) {
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = entry.message;
        item.classList.toggle('character-art', /\n|  /.test(entry.message));
        item.addEventListener('click', () => { showDetail(entry.message); });
        results.append(item);
      }
    });
    showDetail(prefix ? entries[0].message : 'Type a beginning to find a thought, or leave one of your own.');
  }

  async function load() {
    const current = ++latest;
    const prefix = query.value.trim();
    try {
      const response = await fetch(`/api/pyramid?q=${encodeURIComponent(prefix)}`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The pyramid is unavailable.');
      if (current === latest) render(data, prefix);
    } catch (error) {
      if (current === latest) $('pyrHomeFound').textContent = error.message || 'The pyramid is unavailable.';
    }
  }

  const artTemplates = {"starfield":"  ✦          ·\n       ⋆\n ·          ✧\n    .    ✦","pyramid":"       ✦\n      /\\\n     /  \\\n    /____\\","ship":"             ✦\n      .-============-.\n  ___/  NXS ASTRALIS  \\___\n <___ ✧  EXPLORER  ✧ ___>\n     \\________________/\n         \\   ||   /\n     =====\\__||__/=====\n          /__||__\\\n          ✦  ||  ✦","symbols":"✦  ✧  ⋆  ·  ◇  △  ☾  ∞  ⟡"};
  const preview = $('pyrHomePreview');
  const length = $('pyrHomeLength');
  function updatePreview() {
    preview.textContent = thought.value || 'Your character art appears here.';
    length.textContent = `${thought.value.length} / 2000`;
  }
  thought.addEventListener('input', updatePreview);
  root.querySelectorAll('[data-pyr-art]').forEach(button => button.addEventListener('click', () => {
    const art = artTemplates[button.dataset.pyrArt];
    if (!art) return;
    const start = thought.selectionStart, end = thought.selectionEnd;
    const lead = thought.value && start === thought.value.length ? '\n' : '';
    const addition = lead + art;
    if (thought.value.length - (end - start) + addition.length > thought.maxLength) {
      status.textContent = 'The character canvas is full.';
      return;
    }
    thought.setRangeText(addition, start, end, 'end');
    thought.focus();
    updatePreview();
  }));

  function openPyramid() {
    if (dialog.open) return;
    root.classList.add('pyr-dialog-open');
    root.classList.remove('pyr-behind-brain');
    dialog.showModal();
    thought.focus();
    load();
  }
  $('pyrHomeOpen').addEventListener('click', openPyramid);
  document.querySelectorAll('a[href="#pyrHome"]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'pyrHomeDialog');
    link.addEventListener('click', event => { event.preventDefault(); openPyramid(); });
  });
  dialog.addEventListener('close', () => root.classList.remove('pyr-dialog-open'));
  $('pyrHomeClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  query.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 230); });
  $('pyrHomeForm').addEventListener('submit', async event => {
    event.preventDefault();
    const message = thought.value;
    if (!message.trim()) { status.textContent = 'Write at least one character.'; thought.focus(); return; }
    const button = $('pyrHomeSubmit');
    button.disabled = true;
    status.textContent = 'Placing your thought…';
    try {
      const response = await fetch('/api/pyramid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The thought could not be saved.');
      thought.value = '';
      updatePreview();
      query.value = message.trimStart().split('\n')[0].slice(0, 12);
      status.textContent = 'Your thought is inside the pyramid.';
      await load();
    } catch (error) { status.textContent = error.message || 'Please try again.'; }
    finally { button.disabled = false; }
  });
  load();
})();
