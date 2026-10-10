const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('full flight poses blend without fading the body, face travel, and preserve the unloaded fallback', () => {
  const textures = [], contexts = [], canvases = [], events = {};
  const elements = [0, 1, 2].map(() => ({ dataset: {}, children: [], classes: new Set(),
    appendChild(e) { this.children.push(e); }, classList: { add(name) { this.owner.classes.add(name); } } }));
  elements.forEach(element => element.classList.owner = element);
  const document = { querySelectorAll: () => elements, head: { appendChild() {} }, createElement(type) {
    if (type !== 'canvas') return {};
    const context = { calls: [], clearRect() { this.calls = []; }, drawImage(image, x, y) { this.calls.push({ image, x, y, alpha: this.globalAlpha, blend: this.globalCompositeOperation }); },
      beginPath() {}, ellipse() {}, fill() {} };
    contexts.push(context);
    const canvas = { style: {}, setAttribute() {}, getContext: () => context }; canvases.push(canvas); return canvas;
  } };
  class Image { constructor() { textures.push(this); this.naturalWidth = this.naturalHeight = 0; } }
  const window = { matchMedia: () => ({ matches: false }), addEventListener: (n, f) => events[n] = f };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'rainbow-promise-flight.js'), 'utf8'), { document, window, Image });
  const render = window.rainbowPromiseRenderPose;
  const state = { seconds: 1, still: false, beatPhase: .13, envelope: 1, bank: 0, dx: .03 };
  assert.equal(render(0, state), false);
  assert.equal(elements[0].children.length, 0, 'failed or pending assets must retain the photographic fallback');
  textures[0].naturalWidth = 1536; textures[0].naturalHeight = 1024; textures[0].onload();
  assert.equal(elements[0].children.length, 1);
  assert(elements[0].classes.has('rp-cycle-ready'));
  assert.equal(elements[1].children.length, 0, 'species activate independently');
  textures[1].naturalWidth = 1536; textures[1].naturalHeight = 1024; textures[1].onload();
  assert.equal(elements[1].children.length, 1); assert.equal(elements[2].children.length, 1);
  const seen = new Set();
  for (const envelope of [0, .1, .5, 1]) for (let tick = 0; tick < 100; tick++) for (let bird = 0; bird < 3; bird++) {
    const phase = tick / 100, dx = tick % 2 ? -.02 : .02;
    assert.equal(render(bird, { ...state, beatPhase: phase, envelope, dx }), true);
    const calls = contexts[bird].calls;
    assert(Math.abs(calls.reduce((sum, call) => sum + call.alpha, 0) - 1) < .0002, 'the body retains opacity throughout strokes and glide transitions');
    for (const call of calls) {
      assert.equal(call.blend, 'lighter');
      assert(call.x >= 0 && call.x <= 1024 && call.y >= 0 && call.y <= 512, 'only the six atlas cells may be sampled');
      assert.equal(call.image, textures[bird === 0 ? 0 : 1]);
      if (envelope === 1) seen.add(`${call.x}:${call.y}`);
    }
    const facing = Number(canvases[bird].style.transform.match(/scaleX\(([^)]+)\)/)[1]);
    assert(facing * dx < 0, 'all source birds face left, including the raven');
    assert(!canvases[bird].style.transform.includes('NaN'));
  }
  assert.equal(seen.size, 6, 'the full stroke must use every pose');
  render(1, { ...state, still: true });
  assert.deepEqual(contexts[1].calls.map(call => [call.x, call.y, call.alpha]), [[0, 0, 1]], 'reduced motion holds one clear glide pose');
  events.pagehide();
  assert.equal(window.rainbowPromiseRenderPose, undefined);
  assert.equal(render(0, state), false);
  assert(textures.every(texture => texture.onload === null));
});
