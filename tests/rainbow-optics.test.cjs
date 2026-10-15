const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'rainbow-promise-optics.js'), 'utf8');
const context = { window: {} }; vm.runInNewContext(source, context);
const optics = context.window.RainbowPromiseOptics;

test('water dispersion places red outside violet in the primary and inside violet in the secondary', () => {
  const red = optics.caustic(700), violet = optics.caustic(400);
  assert.ok(red > 41 && red < 43);
  assert.ok(violet > 39 && violet < 42);
  assert.ok(red > violet);
  assert.ok(optics.caustic(700, 2) < optics.caustic(400, 2));
  assert.ok(optics.caustic(700, 2) > red + 6);
});

test('light gathers and disappears, while rain changes sections independently of the fixed arc', () => {
  assert.equal(optics.state(0).primary, 0);
  assert.equal(optics.state(16).primary, 1);
  assert.equal(optics.state(16).secondary, 1);
  assert.equal(optics.state(38).primary, 0);
  assert.equal(optics.state(38).secondary, 0);
  assert.deepEqual(optics.state(0), optics.state(42));
  assert.deepEqual(optics.state(7, true), optics.state(300, true));
  const leftBefore = optics.rainDensity(.1, 12), leftAfter = optics.rainDensity(.1, 25);
  const rightBefore = optics.rainDensity(.9, 12), rightAfter = optics.rainDensity(.9, 25);
  assert.ok(Math.abs(leftAfter - leftBefore) > .1);
  assert.ok(Math.abs((leftAfter - leftBefore) - (rightAfter - rightBefore)) > .1);
});

test('the rendered light has transparent water, separated bows and a weak atmospheric gap', () => {
  const p = optics.plates(480, 320);
  const at = (data, x, y) => [...data.slice((y * 480 + x) * 4, (y * 480 + x) * 4 + 4)];
  assert.ok(at(p.primary, 240, 42)[3] > 30);
  assert.equal(at(p.primary, 240, 4)[3], 0);
  for (let y = 200; y < 320; y += 7) for (let x = 0; x < 480; x += 7) {
    assert.equal(at(p.primary, x, y)[3], 0);
    assert.equal(at(p.secondary, x, y)[3], 0);
    assert.equal(at(p.atmosphere, x, y)[3], 0);
  }
  const maxAlpha = data => { let max = 0; for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i]); return max; };
  assert.ok(maxAlpha(p.secondary) < maxAlpha(p.primary));
  assert.ok(maxAlpha(p.atmosphere) < 20);
});

function mount({ noCanvas = false, reduced = false } = {}) {
  const frames = new Map(), events = {}, mediaEvents = {}, observers = [], children = [];
  let id = 0;
  const ctx = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {}, clearRect() {}, drawImage() {}, fillRect() {},
    createLinearGradient: () => ({ addColorStop() {} }) };
  const canvas = () => ({ dataset: {}, setAttribute() {}, getContext: () => noCanvas ? null : ctx });
  const fallback = { hidden: false };
  const wrap = { clientWidth: 160, clientHeight: 140, querySelector: () => fallback, appendChild: child => children.push(child) };
  const document = { hidden: false, querySelector: () => wrap, createElement: canvas,
    addEventListener: (n, f) => events[n] = f, removeEventListener: n => delete events[n] };
  const media = { matches: reduced, addEventListener: (n, f) => mediaEvents[n] = f, removeEventListener() {} };
  class Observer { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } }
  const env = { document, window: { devicePixelRatio: 1, addEventListener: (n, f) => events[n] = f, removeEventListener() {} },
    matchMedia: () => media, ResizeObserver: Observer, IntersectionObserver: Observer,
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; }, cancelAnimationFrame(key) { frames.delete(key); } };
  vm.runInNewContext(source, env);
  const advance = now => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); };
  return { frames, events, mediaEvents, observers, children, fallback, document, media, advance };
}

test('background and offscreen pauses preserve phase; reduced motion is still and page exit cleans up', () => {
  const s = mount();
  assert.equal(s.children.length, 2);
  assert.equal(s.fallback.hidden, true);
  for (let time = 0; time <= 12000; time += 40) s.advance(time);
  const light = s.children[1], before = light.dataset.rainbowTime;
  s.document.hidden = true; s.events.visibilitychange(); assert.equal(s.frames.size, 0);
  s.document.hidden = false; s.events.visibilitychange(); s.advance(500000);
  assert.equal(light.dataset.rainbowTime, before);
  s.observers[1].fn([{ isIntersecting: false }]); assert.equal(s.frames.size, 0);
  s.observers[1].fn([{ isIntersecting: true }]); s.advance(700000);
  assert.equal(light.dataset.rainbowTime, before);
  s.media.matches = true; s.mediaEvents.change(); assert.equal(s.frames.size, 0);
  assert.equal(light.dataset.rainbowStrength, '1.000');
  const still = { ...light.dataset }; s.observers[0].fn(); assert.deepEqual(light.dataset, still);
  s.events.pagehide(); assert.equal(s.frames.size, 0);
  assert.ok(s.observers.every(observer => observer.disconnected));
  assert.equal(s.events.visibilitychange, undefined);
});

test('unavailable canvas preserves the existing person-free light fallback', () => {
  const s = mount({ noCanvas: true });
  assert.equal(s.fallback.hidden, false);
  assert.equal(s.children.length, 0);
  assert.equal(s.frames.size, 0);
});
