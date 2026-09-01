const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'ac-worlds.html'), 'utf8');
const code = fs.readFileSync(path.join(root, 'ac-jukebox.js'), 'utf8');
function setup(search = '') {
  const nodes = {};
  for (const id of ['acJukeboxAudio', 'acJukeboxTrack', 'acJukeboxStatus', 'acJukeboxNow', 'acJukeboxPrevious', 'acJukeboxNext', 'acJukeboxShare', 'acJukeboxEnhanced']) {
    nodes[id] = { hidden: true, textContent: '', handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } };
  }
  const select = nodes.acJukeboxTrack;
  select.options = [...html.matchAll(/<option value="([^"]+)" data-src="([^"]+)">([^<]+)<\/option>/g)].map(m => ({ value: m[1], dataset: { src: m[2] }, textContent: m[3] }));
  select.selectedIndex = 0;
  Object.defineProperty(select, 'value', { get: () => select.options[select.selectedIndex].value });
  const audio = nodes.acJukeboxAudio;
  audio.plays = 0; audio.pause = () => {}; audio.load = () => {};
  audio.play = () => { audio.plays++; return Promise.resolve(); };
  let copied;
  vm.runInNewContext(code, { document: { getElementById: id => nodes[id] }, location: { origin: 'https://example.com', search }, URL, URLSearchParams, navigator: { clipboard: { writeText: async value => { copied = value; } } } });
  return { nodes, audio, select, copied: () => copied };
}
test('three real MP3s, native controls and no autoplay', () => {
  const { select, audio, nodes } = setup();
  assert.deepEqual(select.options.map(o => o.textContent), ['Darktide Megamix', 'Darktide', 'Logged Back In']);
  for (const option of select.options) assert(fs.statSync(path.join(root, decodeURIComponent(option.dataset.src))).size > 100000);
  assert.equal(audio.plays, 0);
  assert.equal(nodes.acJukeboxEnhanced.hidden, false);
  assert.match(html, /id="acJukeboxAudio"[^>]*controls preload="none"/);
  assert.doesNotMatch(html.match(/<audio id="acJukeboxAudio"[^>]*>/)[0], /autoplay/);
});
test('selection, previous, next and end-of-playlist use a single player', () => {
  const { select, audio, nodes } = setup();
  nodes.acJukeboxNext.handlers.click();
  assert.equal(select.value, 'darktide');
  assert.equal(audio.src, '/Audio/mp3/Darktide.mp3');
  nodes.acJukeboxPrevious.handlers.click();
  assert.equal(select.value, 'darktide-megamix');
  select.selectedIndex = 2; select.handlers.change();
  assert.equal(nodes.acJukeboxNow.textContent, 'Logged Back In');
  const count = audio.plays;
  audio.handlers.ended();
  assert.equal(audio.plays, count);
  assert.match(nodes.acJukeboxStatus.textContent, /End of playlist/);
  select.selectedIndex = 0; audio.handlers.ended();
  assert.equal(select.value, 'darktide');
});
test('deep links select without playing; share link preserves selected track', async () => {
  const ctx = setup('?track=logged-back-in');
  assert.equal(ctx.select.selectedIndex, 2);
  assert.equal(ctx.audio.plays, 0);
  await ctx.nodes.acJukeboxShare.handlers.click();
  assert.equal(ctx.copied(), 'https://example.com/ac-worlds?track=logged-back-in#ac-jukebox');
  assert.equal(setup('?track=invalid').select.selectedIndex, 0);
});
test('playback failures produce recoverable visible messages', async () => {
  const { audio, nodes } = setup();
  audio.play = () => Promise.reject(new Error('blocked'));
  nodes.acJukeboxNext.handlers.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(nodes.acJukeboxStatus.textContent, /Press play to retry/);
  audio.handlers.error();
  assert.match(nodes.acJukeboxStatus.textContent, /could not load/);
});
test('homepage feature is removed; old Megamix share links redirect', () => {
  const source = fs.readFileSync(path.join(root, 'astralis-celestial-drift.js'), 'utf8');
  let target;
  vm.runInNewContext(source, { URLSearchParams, location: { search: '?darktide=1', replace: value => { target = value; } } });
  assert.equal(target, '/ac-worlds?track=darktide-megamix#ac-jukebox');
  assert.doesNotMatch(source, /addDarktideLaunch|banner\.innerHTML/);
  const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(main.includes('Audio/mp3/Darktide.mp3'));
  assert(main.includes('Audio/mp3/Logged Back In.mp3'));
  // Homepage middleware removes this exact tag; the deferred loader owns it.
  assert(main.includes('<script src="astralis-celestial-drift.js"></script>'));
  assert(fs.readFileSync(path.join(root, 'astralis-performance-loader.js'), 'utf8').includes('/astralis-celestial-drift.js?v=20260901jukebox'));
  assert(fs.readFileSync(path.join(root, 'functions/_middleware.js'), 'utf8').includes('/astralis-performance-loader.js?v=20260901jukebox'));
});
