const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const rigContext = { window: {} };
vm.runInNewContext(read('marvin-perch-rig.js'), rigContext);
const { pose } = rigContext.window.NovaMarvinRig;

test('Marvin aims and charges before firing, then recoils and recovers', () => {
  assert.equal(pose(0).aim, 0);
  assert.equal(pose(3900).beam, 0);
  assert.equal(pose(4700).aim, 1);
  assert.ok(pose(4700).charge > .9);
  assert.equal(pose(4700).recoil, 0);
  let shots = 0;
  for (let ms = 0; ms < 12000; ms += 5) {
    const p = pose(ms);
    if (p.beam > 0) {
      shots++;
      assert.equal(p.aim, 1);
      assert.ok(ms >= 4800 && ms < 5080);
      assert.ok(p.travel >= 0 && p.travel <= 60);
    }
  }
  assert.ok(shots > 30);
  assert.ok(pose(4900).recoil > .9);
  assert.equal(pose(5500).recoil, 0);
  assert.equal(pose(6800).aim, 0);
  assert.equal(pose(6800).charge, 0);
});

test('poses are continuous at the loop seam and the arm never snaps during recovery', () => {
  for (const key of ['arm', 'balance', 'shift', 'bob', 'gesture', 'head', 'headWidth', 'faceShift', 'gaze', 'eyeScale', 'plume']) {
    assert.ok(Math.abs(pose(11999)[key] - pose(0)[key]) < .03, key);
  }
  for (let ms = 1; ms < 12000; ms++) {
    assert.ok(Math.abs(pose(ms).arm - pose(ms - 1).arm) < .12);
  }
});

test('weight shifts flex both knees without sliding either shoe or stretching a limb', () => {
  let sway = 0;
  for (let ms = 0; ms < 12000; ms += 10) {
    const p = pose(ms);
    sway = Math.max(sway, Math.abs(p.shift));
    for (const [side, x] of [['left', 104], ['right', 150]]) {
      assert.equal(p.ankles[side].x, x);
      assert.equal(p.ankles[side].y, 276);
      assert.ok(Math.abs(Math.hypot(p.hips[side].x - p.knees[side].x, p.hips[side].y - p.knees[side].y) - 21) < 1e-8);
      assert.ok(Math.abs(Math.hypot(p.ankles[side].x - p.knees[side].x, p.ankles[side].y - p.knees[side].y) - 21) < 1e-8);
    }
    assert.ok(Math.abs(Math.hypot(p.shoulder.x - p.elbow.x, p.shoulder.y - p.elbow.y) - 29) < 1e-8);
    assert.ok(Math.abs(Math.hypot(p.wrist.x - p.elbow.x, p.wrist.y - p.elbow.y) - 29) < 1e-8);
  }
  assert.ok(sway > 4);
});

test('the open-hand gesture travels continuously from the hip and settles before aiming', () => {
  assert.equal(pose(0).gesture, 0);
  assert.equal(pose(1500).gesture, 1);
  assert.ok(pose(1500).wrist.x < pose(0).wrist.x - 25);
  assert.equal(pose(3000).gesture, 0);
  assert.equal(pose(4900).gesture, 0);
  for (let ms = 0; ms < 12000; ms += 10) {
    const a = pose(ms - 10), b = pose(ms);
    assert.ok(Math.hypot(a.wrist.x - b.wrist.x, a.wrist.y - b.wrist.y) < 1);
    for (const side of ['left', 'right']) assert.ok(Math.hypot(a.knees[side].x - b.knees[side].x, a.knees[side].y - b.knees[side].y) < 1);
  }
});

function element() {
  const attrs = {}, classes = new Set(), handlers = {};
  return {
    attrs, handlers, dataset: {}, style: {}, hidden: true,
    classList: { contains: key => classes.has(key), toggle(key, value) { if (value) classes.add(key); else classes.delete(key); } },
    setAttribute(key, value) { attrs[key] = String(value); },
    addEventListener(key, fn) { handlers[key] = fn; }
  };
}
async function setup({ reducedMotion = false, fetchFails = false } = {}) {
  const button = element(), message = element(), root = element();
  const nodes = new Map();
  button.querySelector = selector => { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); };
  const doc = { ...element(), hidden: false, documentElement: root, getElementById: id => id === 'novaMarvin' ? button : message };
  const media = { matches: reducedMotion, addEventListener(type, fn) { this.change = fn; } };
  const frames = new Map(), timers = new Map();
  let id = 0, onMutation, onIntersection;
  class Observer { constructor(fn) { onIntersection = fn; } observe() {} }
  const context = {
    window: { IntersectionObserver: Observer }, document: doc, matchMedia: () => media,
    IntersectionObserver: Observer,
    MutationObserver: class { constructor(fn) { onMutation = fn; } observe() {} },
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; },
    cancelAnimationFrame(key) { frames.delete(key); },
    setTimeout(fn) { timers.set(++id, fn); return id; }, clearTimeout(key) { timers.delete(key); },
    fetch: () => fetchFails ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: true, text: () => Promise.resolve(read('marvin-perch.svg')) })
  };
  vm.runInNewContext(read('marvin-perch-rig.js'), context);
  vm.runInNewContext(read('marvin-perch.js'), context);
  await new Promise(resolve => setImmediate(resolve));
  const frame = now => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); };
  return { context, button, message, doc, root, nodes, media, frames, timers, frame, mutate: () => onMutation(), intersect: state => onIntersection([{ isIntersecting: state }]) };
}

test('click starts one coordinated shot and repeated clicks replace the message timer', async () => {
  const s = await setup();
  assert.equal(s.frames.size, 1);
  s.button.handlers.click();
  assert.equal(s.message.hidden, false);
  for (let ms = 0; ms <= 1960; ms += 20) s.frame(ms);
  assert.ok(Number(s.nodes.get('.marvin-laser').attrs.opacity) > .5);
  assert.ok(Number(s.nodes.get('.marvin-gun-light').attrs.opacity) > 0);
  s.button.handlers.click();
  assert.equal(s.frames.size, 1);
  assert.equal(s.timers.size, 1);
  assert.equal(s.nodes.get('.marvin-laser').attrs.opacity, '0');
  s.doc.handlers.keydown({ key: 'Escape' });
  assert.equal(s.message.hidden, true);
  assert.equal(s.timers.size, 0);
  // Installing the script twice must not start a second animation clock.
  vm.runInNewContext(read('marvin-perch.js'), s.context);
  assert.equal(s.frames.size, 1);
});

test('page pause, background, reduced motion and offscreen states stop the animation clock', async () => {
  const s = await setup();
  s.frame(0); s.frame(40);
  const before = s.nodes.get('.marvin-gun-arm').attrs.transform;
  s.root.classList.toggle('space-motion-paused', true); s.mutate();
  assert.equal(s.frames.size, 0);
  s.button.handlers.click();
  assert.equal(s.nodes.get('.marvin-gun-arm').attrs.transform, before);
  assert.equal(s.message.hidden, false);
  s.root.classList.toggle('space-motion-paused', false); s.mutate();
  s.frame(100000);
  assert.equal(s.nodes.get('.marvin-gun-arm').attrs.transform, before);
  s.doc.hidden = true; s.doc.handlers.visibilitychange();
  assert.equal(s.frames.size, 0);
  s.doc.hidden = false; s.doc.handlers.visibilitychange();
  s.intersect(false); assert.equal(s.frames.size, 0);
  s.intersect(true); assert.equal(s.frames.size, 1);
  s.media.matches = true; s.media.change(); assert.equal(s.frames.size, 0);
  s.media.matches = false; s.media.change(); assert.equal(s.frames.size, 1);
});

test('reduced motion and an unavailable SVG retain a usable still and mission report', async () => {
  for (const options of [{ reducedMotion: true }, { fetchFails: true }]) {
    const s = await setup(options);
    assert.equal(s.frames.size, 0);
    s.button.handlers.click();
    assert.equal(s.button.disabled, false);
    assert.equal(s.message.hidden, false);
    assert.equal(s.frames.size, 0);
  }
});
