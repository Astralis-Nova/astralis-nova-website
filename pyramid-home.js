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
  let engravings = [];
  let latest = 0;
  let timer;

  function draw(angle) {
    if (!ctx) return;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const rotate = ([x, y, z]) => ({ x: x * cos + z * sin, y, z: -x * sin + z * cos });
    const project = ({ x, y, z }) => ({ x: 300 + x * 116, y: 195 - y * 105 + z * 28 });
    const base = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]].map(rotate);
    const tip = project(rotate([0, 1.46, 0]));
    ctx.clearRect(0, 0, 600, 400);
    const shadow = ctx.createRadialGradient(300, 348, 12, 300, 348, 188);
    shadow.addColorStop(0, '#6c4a2b77'); shadow.addColorStop(1, '#6c4a2b00');
    ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(300, 348, 190, 28, 0, 0, Math.PI * 2); ctx.fill();
    const faces = [0, 1, 2, 3].map(i => ({ i, depth: (base[i].z + base[(i + 1) % 4].z) / 2 })).sort((a, b) => a.depth - b.depth);
    for (const { i, depth } of faces) {
      const left = project(base[i]), right = project(base[(i + 1) % 4]);
      const path = new Path2D(); path.moveTo(tip.x, tip.y); path.lineTo(left.x, left.y); path.lineTo(right.x, right.y); path.closePath();
      const glow = Math.max(0, Math.min(1, (depth + 1.4) / 2.8));
      const gradient = ctx.createLinearGradient(tip.x, tip.y, (left.x + right.x) / 2, (left.y + right.y) / 2);
      gradient.addColorStop(0, glow > .5 ? '#f5dba6' : '#d9b980');
      gradient.addColorStop(.58, glow > .5 ? '#d6ad70' : '#b18b59');
      gradient.addColorStop(1, glow > .5 ? '#a77a49' : '#81603c');
      ctx.fillStyle = gradient; ctx.fill(path);
      ctx.strokeStyle = '#69482b'; ctx.lineWidth = 2; ctx.stroke(path);
      ctx.save(); ctx.clip(path);
      for (let row = 1; row < 10; row++) {
        const t = row / 10;
        ctx.beginPath();
        ctx.moveTo(tip.x + (left.x - tip.x) * t, tip.y + (left.y - tip.y) * t);
        ctx.lineTo(tip.x + (right.x - tip.x) * t, tip.y + (right.y - tip.y) * t);
        ctx.strokeStyle = '#66462988'; ctx.lineWidth = 1.7; ctx.stroke();
      }
      const faceEntries = engravings.slice(i * 4, i * 4 + 4);
      faceEntries.forEach((entry, n) => {
        const t = .43 + n * .12;
        const centerX = tip.x + ((left.x + right.x) / 2 - tip.x) * t;
        const centerY = tip.y + ((left.y + right.y) / 2 - tip.y) * t;
        ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#573a21';
        ctx.fillText(Array.from(entry.message)[0] || '✦', centerX, centerY);
      });
      ctx.restore();
    }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  let start = performance.now();
  function animate(now) {
    if (visible && document.visibilityState === 'visible') draw(reducedMotion ? .55 : .55 + (now - start) / 25000 * Math.PI * 2);
    if (!reducedMotion) requestAnimationFrame(animate);
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);
  requestAnimationFrame(animate);

  function render(data, prefix) {
    results.replaceChildren();
    const entries = (data.entries || []).slice(0, 16);
    engravings = entries;
    if (reducedMotion) draw(.55);
    $('pyrHomeCount').textContent = `${data.total} ${data.total === 1 ? 'thought' : 'thoughts'} within`;
    $('pyrHomeFound').textContent = prefix ? `${data.total} ${data.total === 1 ? 'match' : 'matches'} for “${prefix}”` : `${data.total} ${data.total === 1 ? 'thought' : 'thoughts'} in the pyramid`;
    if (!entries.length) {
      detail.textContent = prefix ? 'No thought begins that way yet.' : 'The pyramid is waiting for its first thought.';
      return;
    }
    entries.forEach(entry => {
      if (prefix) {
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = entry.message;
        item.addEventListener('click', () => { detail.textContent = entry.message; });
        results.append(item);
      }
    });
    detail.textContent = prefix ? entries[0].message : 'Type a beginning to find a thought, or leave one of your own.';
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

  $('pyrHomeOpen').addEventListener('click', () => { dialog.showModal(); thought.focus(); load(); });
  $('pyrHomeClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  query.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 230); });
  $('pyrHomeForm').addEventListener('submit', async event => {
    event.preventDefault();
    const message = thought.value.trim();
    if (!message) { status.textContent = 'Write at least one character.'; thought.focus(); return; }
    const button = $('pyrHomeSubmit');
    button.disabled = true;
    status.textContent = 'Placing your thought…';
    try {
      const response = await fetch('/api/pyramid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The thought could not be saved.');
      thought.value = '';
      query.value = message.slice(0, Math.min(12, message.length));
      status.textContent = 'Your thought is inside the pyramid.';
      await load();
    } catch (error) { status.textContent = error.message || 'Please try again.'; }
    finally { button.disabled = false; }
  });
  load();
})();
