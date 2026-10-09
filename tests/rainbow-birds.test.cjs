const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('photo wings flap independently; distance loops and reduced motion remain stable', () => {
  const source = fs.readFileSync(path.join(root, 'rainbow-promise-cinematic.js'), 'utf8');
  const flight = source.slice(source.indexOf('  // A closed orbit'), source.indexOf('  const rainbow = wrap.querySelector'));
  for (const [width, height] of [[1120, 720], [370, 560]]) {
    const birds = Array.from({ length: 3 }, () => {
      const parts = {};
      return { style: {}, dataset: {}, querySelector: s => parts[s] ||= { style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } } };
    });
    const events = {}, motionEvents = {}, frames = new Map(), observers = [];
    let id = 0;
    const motion = { matches: false, addEventListener: (n, f) => motionEvents[n] = f, removeEventListener() {} };
    const document = { hidden: false, addEventListener: (n, f) => events[n] = f, removeEventListener() {} };
    class Observer { constructor(f) { this.f = f; observers.push(this); } observe() {} disconnect() {} }
    const env = {
      wrap: { clientWidth: width, clientHeight: height, querySelectorAll: () => birds }, document,
      window: { matchMedia: () => motion, addEventListener: (n, f) => events[n] = f },
      ResizeObserver: Observer, IntersectionObserver: Observer,
      requestAnimationFrame: f => { frames.set(++id, f); return id; }, cancelAnimationFrame: i => frames.delete(i)
    };
    vm.runInNewContext(flight, env);
    const wings = birds.map(() => new Set()), sizes = birds.map(() => []);
    for (let time = 0; time <= 90000; time += 16) {
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(f => f(time));
      birds.forEach((bird, i) => {
        const wing = bird.querySelector('.rp-wing-left').attrs.transform;
        assert(!wing.includes('NaN'));
        assert(!bird.style.transform.includes('NaN'));
        wings[i].add(wing);
        sizes[i].push(Number(bird.dataset.flightSize));
        assert(Math.abs(Number(bird.dataset.flightPan)) <= .85);
      });
    }
    wings.forEach(poses => assert(poses.size > 100, 'wing poses must actually change'));
    sizes.forEach(values => assert(Math.max(...values) / Math.min(...values) > 8));
    motion.matches = true; motionEvents.change(); assert.equal(frames.size, 0);
    const still = birds.map(b => b.querySelector('.rp-wing-left').attrs.transform);
    still.forEach(pose => assert(pose.includes('rotate(0.00) scale(1 1.000)')));
    observers[0].f();
    assert.deepEqual(birds.map(b => b.querySelector('.rp-wing-left').attrs.transform), still);
    motion.matches = false; motionEvents.change(); assert.equal(frames.size, 1);
    document.hidden = true; events.visibilitychange(); assert.equal(frames.size, 0);
    document.hidden = false; events.visibilitychange(); assert.equal(frames.size, 1);
    observers[1].f([{ isIntersecting: false }]); assert.equal(frames.size, 0);
    events.pagehide(); assert.equal(frames.size, 0);
  }
});

test('bird calls require Sound On, stop on mute/hide and clean up on exit', async () => {
  const timers = new Map(), events = {}, nodes = [];
  let timerId = 0, context;
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  const node = () => {
    const n = { gain: param(), frequency: param(), Q: param(), pan: param(), playbackRate: param(),
      threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(),
      connect(other) { return other; }, disconnect() { this.disconnected = true; }, start() {},
      stop(at) { if (at === undefined && !this.stopped) { this.stopped = true; this.onended?.(); } } };
    nodes.push(n); return n;
  };
  class Audio {
    constructor() { context = this; this.sampleRate = 1000; this.currentTime = 1; this.state = 'suspended'; this.destination = node(); }
    createGain() { return node(); } createOscillator() { return node(); }
    createBiquadFilter() { return node(); } createBufferSource() { return node(); }
    createStereoPanner() { return node(); } createDynamicsCompressor() { return node(); }
    createBuffer(_, size) { return { getChannelData: () => new Float32Array(size) }; }
    async resume() { this.state = 'running'; } async suspend() { this.state = 'suspended'; }
    async close() { this.state = 'closed'; }
  }
  const button = { dataset: {}, attrs: {}, listeners: {}, cloneNode() { return this; }, replaceWith() {},
    setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, f) { this.listeners[k] = f; } };
  const document = { hidden: false,
    querySelector: s => s === '.rp-sound-toggle' ? button : { getBoundingClientRect: () => ({ top: 10, bottom: 600 }) },
    querySelectorAll: () => [0, 1, 2].map(i => ({ dataset: { flight: String(i), flightSize: '1.5', flightPan: '.2' } })),
    addEventListener: (n, f) => events[n] = f, removeEventListener: n => delete events[n] };
  const window = { AudioContext: Audio, innerHeight: 900,
    setTimeout: (f, ms) => { timers.set(++timerId, { f, ms }); return timerId; }, clearTimeout: id => timers.delete(id),
    addEventListener: (n, f) => events[n] = f };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'rainbow-promise-audio-fix.js'), 'utf8'), { window, document, Math, Float32Array });
  assert.equal(context, undefined); assert.equal(timers.size, 0);
  button.listeners.click(); await new Promise(setImmediate);
  assert.equal(button.attrs['aria-pressed'], 'true');
  const first = [...timers.entries()].find(([, t]) => t.ms === 1200); assert(first);
  timers.delete(first[0]); first[1].f();
  assert.equal(button.dataset.birdCalls, '1');
  const voices = nodes.filter(n => n.onended); assert(voices.length >= 3);
  button.listeners.click(); await Promise.resolve();
  assert.equal(button.attrs['aria-pressed'], 'false');
  assert(voices.every(n => n.stopped && n.disconnected));
  assert(![...timers.values()].some(t => t.ms === 1200 || t.ms >= 2800));
  button.listeners.click(); await new Promise(setImmediate);
  document.hidden = true; events.visibilitychange(); await Promise.resolve();
  assert.equal(context.state, 'suspended');
  assert(![...timers.values()].some(t => t.ms >= 1200));
  document.hidden = false; events.visibilitychange(); await new Promise(setImmediate);
  assert([...timers.values()].some(t => t.ms === 1200));
  events.pagehide(); await Promise.resolve();
  assert.equal(context.state, 'closed'); assert.equal(events.visibilitychange, undefined);
});
