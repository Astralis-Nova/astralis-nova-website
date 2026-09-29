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
  const layers = [...root.querySelectorAll('.pyr-home-glyphs')];
  let latest = 0;
  let timer;

  function render(data, prefix) {
    layers.forEach(layer => layer.replaceChildren());
    results.replaceChildren();
    const entries = (data.entries || []).slice(0, 16);
    $('pyrHomeCount').textContent = `${data.total} ${data.total === 1 ? 'thought' : 'thoughts'} within`;
    $('pyrHomeFound').textContent = prefix ? `${data.total} ${data.total === 1 ? 'match' : 'matches'} for “${prefix}”` : `${data.total} ${data.total === 1 ? 'thought' : 'thoughts'} in the pyramid`;
    if (!entries.length) {
      detail.textContent = prefix ? 'No thought begins that way yet.' : 'The pyramid is waiting for its first thought.';
      return;
    }
    entries.forEach((entry, i) => {
      const glyph = document.createElement('span');
      glyph.className = 'pyr-home-glyph';
      glyph.style.left = `${[50,39,61,50][i % 4]}%`;
      glyph.style.top = `${[43,65,65,82][i % 4]}%`;
      glyph.textContent = Array.from(entry.message)[0] || '✦';
      layers[Math.floor(i / 4) % 4].append(glyph);
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
