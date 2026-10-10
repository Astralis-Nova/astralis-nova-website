const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('water and hull move independently, pause their clock, and retain a still reduced-motion pose', () => {
  for (const [width, height] of [[1120, 720], [370, 560]]) {
    const frames = new Map(), events = {}, motionEvents = {}, observers = [], images = [];
    let id = 0;
    const motion = { matches: false, addEventListener: (n, f) => motionEvents[n] = f, removeEventListener() {} };
    const ctx = new Proxy({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      createRadialGradient: () => ({ addColorStop() {} })
    }, { get: (target, key) => target[key] ?? (() => {}) });
    const children = [];
    const wrap = { clientWidth: width, clientHeight: height, dataset: {},
      classList: { add() {} }, setAttribute() {}, querySelector: () => null,
      prepend: child => children.unshift(child), appendChild: child => children.push(child) };
    const document = { hidden: false, querySelector: () => wrap, head: { appendChild() {} },
      createElement: () => ({ getContext: () => ctx, setAttribute() {} }),
      addEventListener: (n, f) => events[n] = f, removeEventListener: n => delete events[n] };
    class Image {
      constructor() { images.push(this); this.naturalWidth = 0; this.naturalHeight = 0; }
    }
    class Observer {
      constructor(f) { this.f = f; observers.push(this); }
      observe() {} disconnect() { this.disconnected = true; }
    }
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'rainbow-promise-ark.js'), 'utf8'), {
      document, Image, ResizeObserver: Observer, IntersectionObserver: Observer,
      window: { devicePixelRatio: 1, matchMedia: () => motion, addEventListener: (n, f) => events[n] = f, removeEventListener() {} },
      requestAnimationFrame: f => { frames.set(++id, f); return id; }, cancelAnimationFrame: n => frames.delete(n)
    });
    assert.equal(children.length, 0, 'asset failures retain the existing fallback');
    images[0].naturalWidth = 1536; images[0].naturalHeight = 1024; images[0].onload();
    assert.equal(children.length, 0, 'landscape alone must not activate an empty hull');
    images[1].naturalWidth = 2163; images[1].naturalHeight = 725; images[1].onload();
    assert.equal(children.length, 2);
    const advance = time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(f => f(time)); };
    const surfaces = new Set(), heaves = new Set(), pitches = new Set();
    for (let time = 0; time < 15000; time += 40) {
      advance(time);
      for (const key of ['arkSurface', 'arkHeave', 'arkPitch']) assert(Number.isFinite(Number(wrap.dataset[key])));
      assert(Math.abs(Number(wrap.dataset.arkPitch)) < .04, 'a substantial hull should not pitch like a small toy');
      assert(Math.abs(Number(wrap.dataset.arkHeave)) < 12);
      assert(Math.abs(Number(wrap.dataset.arkSurface) - height * .715) < 15);
      surfaces.add(wrap.dataset.arkSurface); heaves.add(wrap.dataset.arkHeave); pitches.add(wrap.dataset.arkPitch);
    }
    assert(surfaces.size > 200 && heaves.size > 200 && pitches.size > 100);
    assert.notEqual((Number(wrap.dataset.arkSurface) - height * .715).toFixed(3), wrap.dataset.arkHeave);
    const pauseTime = Number(wrap.dataset.arkWaterTime);
    document.hidden = true; events.visibilitychange(); assert.equal(frames.size, 0);
    document.hidden = false; events.visibilitychange(); advance(500000);
    assert.equal(Number(wrap.dataset.arkWaterTime), pauseTime, 'resuming must not jump to a new wave phase');
    observers[1].f([{ isIntersecting: false }]); assert.equal(frames.size, 0);
    observers[1].f([{ isIntersecting: true }]); advance(700000);
    assert.equal(Number(wrap.dataset.arkWaterTime), pauseTime);
    motion.matches = true; motionEvents.change(); assert.equal(frames.size, 0);
    const still = { ...wrap.dataset };
    observers[0].f(); assert.deepEqual(wrap.dataset, still, 'resize must preserve the same still pose');
    motion.matches = false; motionEvents.change(); assert.equal(frames.size, 1);
    events.pagehide(); assert.equal(frames.size, 0);
    assert(observers.every(o => o.disconnected));
    assert.equal(events.visibilitychange, undefined);
  }
});
