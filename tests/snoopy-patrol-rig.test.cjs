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
  const before = JSON.stringify([...nodes.values()].map(node => node.attrs));
  paused = true; controller.sync(); assert.equal(queue.size, 0);
  paused = false; controller.sync();
  const [key, fn] = queue.entries().next().value; queue.delete(key); fn(60000);
  assert.equal(JSON.stringify([...nodes.values()].map(node => node.attrs)), before);
});

test('turning or greeting keeps the gripping paws on the head-mounted lenses', () => {
  const { rig } = setup();
  let turningSamples = 0;
  for (const greeting of [false, true]) for (let ms = 0; ms < 18000; ms += 20) {
    const p = rig.pose(ms, greeting, ms % 2500);
    if (!p.contact) continue;
    if (Math.abs(p.headAngle) > 1) turningSamples++;
    for (const [side, rim] of [['far', { x: 166, y: 59 }], ['near', { x: 227, y: 55 }]]) {
      const a = p.angle * Math.PI / 180, h = p.headAngle * Math.PI / 180;
      const x = (rim.x - 180) * p.scale, y = (rim.y - 50) * p.scale;
      const gx = 180 + p.down * 39 + x * Math.cos(a) - y * Math.sin(a);
      const gy = 50 + p.down * 33 + x * Math.sin(a) + y * Math.cos(a);
      const target = { x: 213 + (gx - 213) * Math.cos(h) - (gy - 134) * Math.sin(h),
        y: 134 + p.headY + (gx - 213) * Math.sin(h) + (gy - 134) * Math.cos(h) };
      assert.ok(Math.hypot(p.paws[side].x - target.x, p.paws[side].y - target.y) < 1e-8);
    }
  }
  assert.ok(turningSamples > 100);
});

test('scarf edges and head pose move continuously across the loop seam', () => {
  const { rig } = setup();
  for (const key of ['headAngle', 'headY']) assert.ok(Math.abs(rig.pose(17999)[key] - rig.pose(0)[key]) < .01);
  for (const short of [false, true]) {
    assert.equal(rig.scarfPath(0, short), rig.scarfPath(18000, short));
    for (let ms = 20; ms <= 18000; ms += 20) {
      const a = rig.scarfPath(ms - 20, short).match(/-?\d+(?:\.\d+)?/g).map(Number);
      const b = rig.scarfPath(ms, short).match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.equal(a.length, b.length);
      assert.ok(a.every((value, index) => Math.abs(value - b[index]) < 3));
    }
  }
});

test('shoulders stay with the torso and hind paws stay in the roof frame', () => {
  const svg = fs.readFileSync(require('node:path').join(__dirname, '../snoopy-patrol.svg'), 'utf8');
  const stack = [];
  let arms = 0, feet = 0;
  for (const match of svg.matchAll(/<\/?[a-zA-Z][^>]*>/g)) {
    const tag = match[0];
    if (/^<\//.test(tag)) { stack.pop(); continue; }
    if (tag.includes('data-ace-arm=')) {
      arms++;
      assert.ok(stack.includes('ace-pilot'));
      assert.ok(!stack.includes('ace-head'));
    }
    if (tag.includes('class="ace-feet"')) {
      feet++;
      assert.ok(stack.includes('ace-flight-rig'));
      assert.ok(!stack.includes('ace-pilot'));
    }
    if (!/\/>$/.test(tag)) stack.push(tag.match(/class="([^"]*)"/)?.[1] || '');
  }
  assert.equal(arms, 2);
  assert.equal(feet, 1);
});

test('a greeting nod begins and ends without popping the head or gripped goggles', () => {
  const { rig } = setup();
  for (const ms of [3900, 4500, 11700, 12500]) {
    const rest = rig.pose(ms);
    for (const elapsed of [0, 2500]) {
      const greeting = rig.pose(ms, true, elapsed);
      assert.equal(greeting.headAngle, rest.headAngle);
      for (const side of ['far', 'near']) assert.deepEqual(greeting.paws[side], rest.paws[side]);
    }
    assert.ok(Math.abs(rig.pose(ms, true, 300).headAngle - rest.headAngle) > 3);
  }
});
