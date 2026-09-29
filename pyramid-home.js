(() => {
  const root = document.getElementById('pyrHome');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const query = $('pyrHomeQuery');
  const thought = $('pyrHomeThought');
  const status = $('pyrHomeStatus');
  const detail = $('pyrHomeDetail');
  const glyphLayers = [...root.querySelectorAll('.pyr-home-glyphs')];
  const results = $('pyrHomeResults');
  const count = $('pyrHomeCount');
  let latest = 0;
  let selectedId = null;
  let timer;

  function show(entry) {
    selectedId = entry.id;
    detail.classList.remove('empty');
    detail.textContent = entry.message;
    root.querySelectorAll('.pyr-home-glyph').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === selectedId)));
  }

  function render(data, prefix) {
    glyphLayers.forEach(layer => layer.replaceChildren());
    results.replaceChildren();
    const entries = (data.entries || []).slice(0, 16);
    count.textContent = prefix ? `${data.total} ${data.total === 1 ? 'thought begins' : 'thoughts begin'} with “${prefix}”` : `${data.total} ${data.total === 1 ? 'thought' : 'thoughts'} inside`;
    if (!entries.length) {
      detail.classList.add('empty');
      detail.textContent = prefix ? 'No thought begins that way yet.' : 'The first thought has not been placed yet. Tap the pyramid or write yours below.';
      return;
    }
    entries.forEach((entry, i) => {
      const face = Math.floor(i / 4) % 4;
      const slot = i % 4;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pyr-home-glyph';
      button.dataset.id = entry.id;
      button.style.left = `${[50,38,62,50][slot]}%`;
      button.style.top = `${[42,65,65,83][slot]}%`;
      button.textContent = Array.from(entry.message)[0] || '✦';
      button.setAttribute('aria-label', `Read thought: ${entry.message.slice(0, 60)}`);
      button.setAttribute('aria-pressed', String(entry.id === selectedId));
      button.addEventListener('click', event => { event.stopPropagation(); show(entry); });
      glyphLayers[face].append(button);
      if (prefix) {
        const result = document.createElement('button');
        result.type = 'button';
        result.textContent = entry.message;
        result.addEventListener('click', () => show(entry));
        results.append(result);
      }
    });
    const selected = entries.find(entry => entry.id === selectedId);
    if (selected) show(selected);
    else if (prefix) show(entries[0]);
    else { detail.classList.add('empty'); detail.textContent = 'Tap a glowing character on the pyramid to read its thought.'; }
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
      if (current === latest) count.textContent = error.message || 'The pyramid is unavailable.';
    }
  }

  $('pyrHomeScene').addEventListener('click', event => { if (!event.target.closest('.pyr-home-glyph')) thought.focus(); });
  $('pyrHomePrompt').addEventListener('click', event => { event.stopPropagation(); thought.focus(); });
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
      query.value = '';
      selectedId = data.entry.id;
      status.textContent = 'Your thought is inside the pyramid.';
      await load();
    } catch (error) { status.textContent = error.message || 'Please try again.'; }
    finally { button.disabled = false; }
  });
  load();
})();
