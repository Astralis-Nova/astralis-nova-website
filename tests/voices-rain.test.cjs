const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../voices-rain.js'), 'utf8');

function page({ desktop = false, reduced = false, saveData = false, rejected = false } = {}) {
  const classes = new Set(), created = [], timers = new Map();
  const scene = { classList: { add: x => classes.add(x), remove: x => classes.delete(x) }, appendChild() {} };
  const toggle = { hidden: true, attributes: {}, setAttribute(k, v) { this.attributes[k] = v; }, addEventListener(k, v) { this[k] = v; } };
  const document = { hidden: false, querySelector: () => scene, getElementById: () => toggle, addEventListener(k, v) { this[k] = v; }, createElement() {
    const video = { events: {}, setAttribute() {}, removeAttribute() {}, addEventListener(k, v) { this.events[k] = v; },
      play: () => rejected ? Promise.reject(new Error('Autoplay blocked')) : Promise.resolve(),
      pause() { this.paused = true; }, load() {}, remove() { this.removed = true; },
      requestVideoFrameCallback(callback) { this.frame = callback; } };
    created.push(video); return video;
  } };
  const window = { matchMedia: q => ({ matches: q.includes('reduced-motion') ? reduced : desktop }),
    setTimeout: fn => { const id = timers.size + 1; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id), addEventListener() {} };
  vm.runInNewContext(source, { window, document, navigator: { connection: { saveData } } });
  return { created, toggle, classes, timers, document };
}

test('mobile loads the entire static page without creating a video decoder', () => {
  const p = page();
  assert.equal(p.created.length, 0);
  assert.equal(p.toggle.hidden, false);
  p.toggle.click();
  assert.equal(p.created.length, 1);
  assert.equal(p.created[0].muted, true);
  assert.equal(p.created[0].playsInline, true);
});

test('the poster stays visible until the first decoded frame and returns during buffering', () => {
  const p = page({ desktop: true }); const video = p.created[0];
  assert.equal(p.classes.has('is-playing'), false);
  video.events.playing();
  assert.equal(p.classes.has('is-playing'), false);
  video.frame();
  assert.equal(p.classes.has('is-playing'), true);
  video.events.waiting();
  assert.equal(p.classes.has('is-playing'), false);
  [...p.timers.values()][0]();
  assert.equal(video.removed, true);
  assert.equal(p.toggle.attributes['aria-pressed'], 'false');
});

test('blocked autoplay releases the video and allows a manual retry', async () => {
  const p = page({ desktop: true, rejected: true });
  await Promise.resolve();
  assert.equal(p.created[0].removed, true);
  assert.equal(p.toggle.textContent, 'Animate rain');
  p.toggle.click();
  assert.equal(p.created.length, 2);
  await Promise.resolve();
});

test('reduced motion and data saver do not start background video', () => {
  assert.equal(page({ desktop: true, reduced: true }).created.length, 0);
  assert.equal(page({ desktop: true, saveData: true }).created.length, 0);
});

test('leaving the page releases the decoder, and late video events cannot cover the poster', () => {
  const p = page({ desktop: true }); const video = p.created[0];
  video.events.playing();
  p.document.hidden = true; p.document.visibilitychange(); video.frame();
  assert.equal(video.removed, true);
  assert.equal(p.classes.has('is-playing'), false);
});

test('the title, quotes, poster and return link exist without JavaScript', () => {
  const html = fs.readFileSync(path.join(__dirname, '../voices-that-move-us-forward.html'), 'utf8');
  assert.match(html, /<h1>Voices That Move Us Forward<\/h1>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /voices-rain-life-poster\.webp/);
  assert.match(html, /href="\/#connected-worlds"/);
  assert.doesNotMatch(html, /<video|<source/);
});
