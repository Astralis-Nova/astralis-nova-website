const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'rainbow-promise-sky.js'), 'utf8');
const core = { window: {} }; vm.runInNewContext(source, core);
const sky = core.window.RainbowPromiseSky;

function context() {
  const pixels = new Uint8ClampedArray(1536 * 430 * 4);
  for (let y = 0; y < 430; y++) for (let x = 0; x < 1536; x++) {
    const i = (y * 1536 + x) * 4;
    pixels[i] = 120 + 80 * Math.sin(x * .03 + y * .02);
    pixels[i + 1] = 100 + 60 * Math.cos(x * .02); pixels[i + 2] = 90; pixels[i + 3] = 255;
  }
  return new Proxy({
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    getImageData: () => ({ data: pixels }), putImageData(p) { this.output = new Uint8ClampedArray(p.data); },
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} })
  }, { get: (target, key) => target[key] ?? (() => {}) });
}

test('cloud flow resets invisibly and daylight changes slowly within a natural range', () => {
  for (let t = 0; t < 400; t += .5) {
    const phases = sky.advection(t);
    assert(Math.abs(phases.reduce((sum, p) => sum + p.weight, 0) - 1) < 1e-12);
    const light = sky.lightAt(t), next = sky.lightAt(t + .1);
    assert(light.strength > .1 && light.strength < .9);
    assert(Math.abs(light.strength - next.strength) < .004);
  }
  for (const t of [0, 48, 96, 144]) assert(sky.advection(t).some(p => p.age === -48 && p.weight === 0));
  assert.deepEqual(sky.lightAt(0, true), sky.lightAt(500, true));
});

test('cloud pixels change while mountain pixels stay transparent, including narrow crops', () => {
  for (const [w, h] of [[480, 320], [240, 360]]) {
    const ctx = context(), sun = context();
    const cloud = { getContext: () => ctx }, canvas = { getContext: () => sun };
    const paint = sky.renderer(cloud, canvas, {}, () => ({ getContext: () => ctx }));
    paint.resize(w, h); paint.draw(0); const before = ctx.output;
    paint.draw(17); const after = ctx.output;
    const scale = Math.max(cloud.width / 1536, cloud.height / 1024);
    const left = (cloud.width - 1536 * scale) / 2, top = (cloud.height - 1024 * scale) / 2;
    let changed = 0, terrain = 0;
    for (let i = 0; i < after.length; i += 4) {
      const x = (i / 4) % cloud.width, y = Math.floor(i / 4 / cloud.width);
      if ((y - top) / scale >= sky.ridgeAt((x - left) / scale)) {
        assert.equal(after[i + 3], 0); terrain++;
      } else if (after[i + 3] > 200 && before[i] !== after[i]) changed++;
    }
    assert(changed > 200); assert(terrain > 200);
    paint.draw(10, true); const still = ctx.output; paint.draw(60, true);
    assert.deepEqual(ctx.output, still);
    paint.resize(w, h); paint.draw(60, true); assert.deepEqual(ctx.output, still);
  }
});

function mount(noCanvas = false) {
  const frames = new Map(), events = {}, mediaEvents = {}, observers = [], children = [], images = [];
  let id = 0;
  const ctx = context(), classes = new Set();
  const canvas = () => ({ dataset: {}, setAttribute() {}, getContext: () => noCanvas ? null : ctx });
  const wrap = { clientWidth: 160, clientHeight: 140, classList: { add: n => classes.add(n) }, appendChild: c => children.push(c) };
  const document = { hidden: false, querySelector: () => wrap, head: { appendChild() {} }, createElement: canvas,
    addEventListener: (n, f) => events[n] = f, removeEventListener: n => delete events[n] };
  const media = { matches: false, addEventListener: (n, f) => mediaEvents[n] = f, removeEventListener() {} };
  class Observer { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } }
  class Image { constructor() { images.push(this); } }
  vm.runInNewContext(source, { document, Image, matchMedia: () => media, ResizeObserver: Observer, IntersectionObserver: Observer,
    window: { devicePixelRatio: 1, addEventListener: (n, f) => events[n] = f, removeEventListener() {} },
    requestAnimationFrame: f => { frames.set(++id, f); return id; }, cancelAnimationFrame: n => frames.delete(n) });
  const advance = now => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(f => f(now)); };
  return { frames, events, mediaEvents, observers, children, images, classes, document, media, advance };
}

test('sky waits for its asset, pauses without jumps and holds a reduced-motion scene', () => {
  const s = mount(); assert.equal(s.children.length, 0);
  s.images[0].onload(); assert.equal(s.children.length, 2); assert(s.classes.has('rp-sky-ready'));
  for (let t = 0; t <= 2400; t += 40) s.advance(t);
  const before = s.children[0].dataset.skyTime; assert(Number(before) > 2);
  s.document.hidden = true; s.events.visibilitychange(); assert.equal(s.frames.size, 0);
  s.document.hidden = false; s.events.visibilitychange(); s.advance(500000); assert.equal(s.children[0].dataset.skyTime, before);
  s.observers[1].fn([{ isIntersecting: false }]); assert.equal(s.frames.size, 0);
  s.observers[1].fn([{ isIntersecting: true }]); s.advance(700000); assert.equal(s.children[0].dataset.skyTime, before);
  s.media.matches = true; s.mediaEvents.change(); assert.equal(s.frames.size, 0);
  const still = { ...s.children[1].dataset }; s.observers[0].fn(); assert.deepEqual(s.children[1].dataset, still);
  assert.equal(s.children[0].dataset.skyTime, '0.000');
  s.events.pagehide(); assert.equal(s.frames.size, 0); assert(s.observers.every(o => o.disconnected));
  assert.equal(s.events.visibilitychange, undefined);
});

test('unavailable canvas preserves the static landscape and its original sunlight', () => {
  const s = mount(true); s.images[0].onload();
  assert.equal(s.children.length, 0); assert.equal(s.classes.size, 0); assert.equal(s.frames.size, 0);
});
