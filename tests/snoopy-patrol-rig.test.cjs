const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../snoopy-patrol-rig.js'), 'utf8');
function setup() {
  const queue = new Map(); let id = 0;
  const context = { window: {}, requestAnimationFrame: fn => { queue.set(++id, fn); return id; }, cancelAnimationFrame: key => queue.delete(key) };
  vm.runInNewContext(source, context);
  return { rig: context.window.NovaFlyingAceRig, queue };
}
test('both paws remain on the rims whenever the goggles move', () => {
  const { rig } = setup(); let movementSamples = 0;
  for (let ms = 10; ms < 18000; ms += 10) {
    const p = rig.pose(ms), previous = rig.pose(ms - 10);
    if (Math.abs(p.down - previous.down) < 1e-7) continue;
    movementSamples++;
    assert.equal(p.contact, true);
    for (const side of ['far', 'near']) assert.ok(Math.hypot(p.paws[side].x - p.grips[side].x, p.paws[side].y - p.grips[side].y) < 1e-8);
  }
  assert.ok(movementSamples > 200);
});
test('hands reach the goggles within arm length and the lenses retain their size', () => {
  const { rig } = setup();
  for (let ms = 0; ms < 18000; ms += 20) {
    const p = rig.pose(ms);
    assert.equal(p.scale, .8);
    for (const [side, x, y] of [['far', 200, 150], ['near', 215, 151]]) {
      assert.ok(Math.hypot(p.paws[side].x - x, p.paws[side].y - y) <= 105);
      assert.ok(!rig.armPath(side, p.paws[side]).includes('NaN'));
    }
  }
});
test('the reach, release, and loop seam have continuous hand positions', () => {
  const { rig } = setup();
  for (let ms = 0; ms < 18000; ms += 10) {
    const a = rig.pose(ms - 10), b = rig.pose(ms);
    for (const side of ['far', 'near']) assert.ok(Math.hypot(a.paws[side].x - b.paws[side].x, a.paws[side].y - b.paws[side].y) < 3);
  }
});
test('pausing stops the whole rig and resuming does not jump ahead', () => {
  const { rig, queue } = setup(); let paused = false;
  const nodes = new Map();
  const visitor = { dataset: {}, querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { attrs: {}, style: {}, setAttribute(k, v) { this.attrs[k] = v; } });
    return nodes.get(selector);
  } };
  const controller = rig.create(visitor, () => paused);
  for (let now = 0; now < 4400; now += 40) {
    const [key, fn] = queue.entries().next().value; queue.delete(key); fn(now);
  }
  const before = nodes.get('.ace-goggles').attrs.transform;
  paused = true; controller.sync(); assert.equal(queue.size, 0);
  paused = false; controller.sync();
  const [key, fn] = queue.entries().next().value; queue.delete(key); fn(60000);
  assert.equal(nodes.get('.ace-goggles').attrs.transform, before);
});
