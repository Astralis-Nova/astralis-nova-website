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

    // A quiet star chart frames the stone without turning it into a panel.
    const aura = ctx.createRadialGradient(300, 180, 18, 300, 180, 225);
    aura.addColorStop(0, 'rgba(22,73,100,.35)');
    aura.addColorStop(.56, 'rgba(12,42,65,.22)');
    aura.addColorStop(1, 'rgba(7,24,40,0)');
    ctx.fillStyle = aura; ctx.fillRect(70, 0, 460, 390);
    ctx.save();
    ctx.translate(300, 183);
    ctx.strokeStyle = 'rgba(118,207,228,.23)'; ctx.lineWidth = 1;
    ctx.setLineDash([44, 17, 5, 17]);
    ctx.beginPath(); ctx.ellipse(0, 0, 178, 146, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    for (let n = 0; n < 12; n++) {
      const a = n * Math.PI / 6;
      const x = Math.cos(a), y = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(x * 185, y * 153); ctx.lineTo(x * 197, y * 163);
      ctx.strokeStyle = n % 3 ? 'rgba(136,213,226,.24)' : 'rgba(255,216,137,.38)';
      ctx.stroke();
    }
    ctx.restore();

    const floor = ctx.createRadialGradient(300, 344, 10, 300, 344, 205);
    floor.addColorStop(0, 'rgba(83,185,208,.3)');
    floor.addColorStop(.55, 'rgba(205,146,72,.14)');
    floor.addColorStop(1, 'rgba(24,60,84,0)');
    ctx.fillStyle = floor; ctx.beginPath(); ctx.ellipse(300, 344, 200, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(110,220,236,.3)'; ctx.lineWidth = 1;
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
      gradient.addColorStop(0, light > .5 ? '#ffe8af' : '#d2ab72');
      gradient.addColorStop(.48, light > .5 ? '#c99455' : '#8e6949');
      gradient.addColorStop(1, light > .5 ? '#74523b' : '#4a3b37');
      ctx.fillStyle = gradient; ctx.fill(path);
      ctx.strokeStyle = 'rgba(255,207,123,.74)'; ctx.lineWidth = 2; ctx.stroke(path);
      ctx.save(); ctx.clip(path);

      // Courses and staggered joins keep the object visibly made of stone.
      for (let row = 1; row < 12; row++) {
        const t = row / 12;
        const lx = tip.x + (left.x - tip.x) * t, ly = tip.y + (left.y - tip.y) * t;
        const rx = tip.x + (right.x - tip.x) * t, ry = tip.y + (right.y - tip.y) * t;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry);
        ctx.strokeStyle = 'rgba(43,31,35,.45)'; ctx.lineWidth = 1.5; ctx.stroke();
        if (row > 2) {
          const joints = row % 2 ? [1 / 3, 2 / 3] : [.5];
          joints.forEach(f => {
            const next = (row + 1) / 12;
            const x1 = lx + (rx - lx) * f, y1 = ly + (ry - ly) * f;
            const x2 = tip.x + ((left.x + (right.x - left.x) * f) - tip.x) * next;
            const y2 = tip.y + ((left.y + (right.y - left.y) * f) - tip.y) * next;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = 'rgba(47,34,35,.25)'; ctx.lineWidth = 1; ctx.stroke();
          });
        }
      }

      // A luminous axis and geometric marks suggest an ancient machine.
      const axis = ctx.createLinearGradient(tip.x, tip.y, middle.x, middle.y);
      axis.addColorStop(0, 'rgba(255,240,176,.9)');
      axis.addColorStop(.3, 'rgba(127,237,233,.7)');
      axis.addColorStop(1, 'rgba(70,171,195,.2)');
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y + 19); ctx.lineTo(middle.x, middle.y - 5);
      ctx.strokeStyle = axis; ctx.lineWidth = 2; ctx.shadowColor = '#8ce8ef'; ctx.shadowBlur = 12; ctx.stroke();
      ctx.shadowBlur = 0;
      if (depth > -.2) {
        for (let n = 0; n < 4; n++) {
          const t = .36 + n * .14;
          const x = tip.x + (middle.x - tip.x) * t;
          const y = tip.y + (middle.y - tip.y) * t;
          const size = 3 + t * 3;
          ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size); ctx.lineTo(x - size, y); ctx.closePath();
          ctx.strokeStyle = 'rgba(125,234,230,.76)'; ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
      const faceEntries = engravings.slice(i * 4, i * 4 + 4);
      faceEntries.forEach((entry, n) => {
        const t = .44 + n * .12;
        const x = tip.x + (middle.x - tip.x) * t;
        const y = tip.y + (middle.y - tip.y) * t;
        ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#293e42'; ctx.shadowColor = '#a9f3ec'; ctx.shadowBlur = 8;
        ctx.fillText(Array.from(entry.message)[0] || '✦', x, y);
        ctx.shadowBlur = 0;
      });
      ctx.restore();
    }

    // A gilded capstone stays bright at every angle.
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
      ctx.fillStyle = '#f9d98f'; ctx.fill(path);
      ctx.strokeStyle = '#fff3c3'; ctx.lineWidth = 1.4; ctx.stroke(path);
    }
    const crown = ctx.createRadialGradient(tip.x, tip.y, 1, tip.x, tip.y, 42);
    crown.addColorStop(0, 'rgba(255,253,215,.82)');
    crown.addColorStop(.3, 'rgba(255,222,136,.3)');
    crown.addColorStop(1, 'rgba(255,211,127,0)');
    ctx.fillStyle = crown; ctx.beginPath(); ctx.arc(tip.x, tip.y, 42, 0, Math.PI * 2); ctx.fill();
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
