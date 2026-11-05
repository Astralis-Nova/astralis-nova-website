/* Independent, seeded decisions: no repeating patrol timeline. */
const smooth = t => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };
const lerp = (a, b, t) => a + (b - a) * t;
export function pivotYaw(progress, from, to) {
  const u = progress < .38 ? smooth(progress / .38) * .5 : progress < .62 ? .5 : .5 + smooth((progress - .62) / .38) * .5;
  return lerp(from, to, u);
}
export function createAnimalMind({ rat = false, seed = 1 } = {}) {
  let value = seed >>> 0;
  function random() {
    value += 0x6d2b79f5; let n = value;
    n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  }
  const range = (a, b) => lerp(a, b, random());
  const floor = rat ? 833 : 449, bounds = rat ? [796, 936] : [529, 698];
  const ledge = rat ? { base: 905, x: 945, y: 803 } : { base: 703, x: 736, y: 413 };
  let x = range(bounds[0] + 25, bounds[1] - 20), y = floor, facing = random() < .5 ? 1 : -1;
  let energy = range(.55, .95), hunger = range(.2, .7), previous = [], queue = [], serial = 0;
  let blinkAt = range(1, 3.5), blinkStart = -1;
  const phase = range(0, 70), tempo = range(.88, 1.13);
  const record = (action, duration, extra = {}) => ({ action, duration, ...extra });
  function turnTo(direction) {
    if (facing === direction) return;
    const from = facing === 1 ? 0 : Math.PI;
    queue.push(record('turn', range(1.15, 1.9), { fromYaw: from, toYaw: from + (random() < .5 ? 1 : -1) * Math.PI, facing: direction }));
    facing = direction;
  }
  function moveTo(target, action = 'walk') {
    const direction = target >= x ? 1 : -1;
    turnTo(direction);
    const duration = Math.abs(target - x) / range(action === 'run' ? 64 : 29, action === 'run' ? 95 : 47);
    queue.push(record(action, Math.max(.8, duration), { x: target, y: floor, facing: direction }));
  }
  function decide() {
    const choices = [
      ['walk', 2.7], ['run', energy * (rat ? 1.4 : .75)], ['sniff', 1.8], ['crouch', 1.4],
      ['sit', 1.5 + (1 - energy)], ['lie', .65 + (1 - energy) * 2], ['groom', 1.15],
      ['nibble', (rat ? 1.5 : .55) + hunger], ['dig', .9], ['climb', energy * (rat ? .8 : 1.8)],
      ['stretch', .85], ['turn', .5]
    ].filter(([name]) => !previous.includes(name));
    const sum = choices.reduce((n, c) => n + c[1], 0);
    let roll = random() * sum, action = choices.at(-1)[0];
    for (const [name, weight] of choices) { roll -= weight; if (roll <= 0) { action = name; break; } }
    previous = [...previous.slice(-1), action];
    if (action === 'walk' || action === 'run') {
      let target = range(...bounds);
      if (Math.abs(target - x) < 24) target = Math.min(bounds[1], Math.max(bounds[0], x + (random() < .5 ? -1 : 1) * range(28, 56)));
      if (Math.abs(target - x) < 18) target = Math.min(bounds[1], Math.max(bounds[0], x + (x > (bounds[0] + bounds[1]) / 2 ? -1 : 1) * range(30, 60)));
      moveTo(target, action);
    } else if (action === 'climb') {
      moveTo(ledge.base);
      turnTo(1);
      queue.push(record('climb', range(2.8, 4), { x: ledge.x, y: ledge.y, facing: 1 }));
      queue.push(record(random() < .55 ? 'crouch' : 'sit', range(1.2, 2.8), { x: ledge.x, y: ledge.y, facing: 1 }));
      // Back down the same root, searching with the hind paws first.
      queue.push(record('climb', range(2.6, 3.8), { x: ledge.base, y: floor, facing: 1, descending: true }));
    } else if (action === 'turn') {
      turnTo(-facing);
    } else {
      const durations = { sniff: [1.1, 3], crouch: [1.4, 3.3], sit: [2.1, 4.9], lie: [3, 6.8], groom: [1.5, 3.5], nibble: [1.6, 3.9], dig: [1.2, 2.7], stretch: [1.3, 2.4] };
      queue.push(record(action, range(...durations[action]), { facing }));
    }
  }
  function begin(start) {
    if (!queue.length) decide();
    const next = queue.shift();
    return { ...next, start, end: start + next.duration, fromX: x, fromY: y,
      x: next.x ?? x, y: next.y ?? y, facing: next.facing ?? facing, id: serial++ };
  }
  queue.push(record(rat ? 'nibble' : 'sniff', range(.8, 1.8), { facing }));
  let state = begin(0);
  return {
    sample(time) {
      while (time >= state.end) {
        x = state.x; y = state.y; facing = state.facing;
        const resting = ['lie', 'sit', 'crouch'].includes(state.action);
        energy = Math.max(.15, Math.min(1, energy + state.duration * (resting ? .035 : -.009)));
        hunger = Math.max(0, Math.min(1, hunger + state.duration * (state.action === 'nibble' ? -.08 : .007)));
        state = begin(state.end);
      }
      const u = Math.max(0, (time - state.start) / state.duration), movement = ['walk', 'run', 'climb'].includes(state.action);
      const speed = movement ? Math.sin(Math.PI * u) * (state.action === 'walk' ? .55 : .9) : 0;
      const edge = smooth(Math.min((time - state.start) / .38, (state.end - time) / .38));
      if (time >= blinkAt) { blinkStart = time; blinkAt = time + range(2.3, 6.4); }
      const sinceBlink = time - blinkStart;
      const blink = sinceBlink >= 0 && sinceBlink < .19 ? Math.sin(sinceBlink / .19 * Math.PI) ** 2 : 0;
      const yaw = state.action === 'turn' ? pivotYaw(u, state.fromYaw, state.toYaw) : state.facing === 1 ? 0 : Math.PI;
      return {
        action: state.action, x: lerp(state.fromX, state.x, smooth(u)), floor: lerp(state.fromY, state.y, smooth(u)),
        facing: state.action === 'turn' ? (Math.cos(yaw) >= 0 ? 1 : -1) : state.facing, yaw, speed,
        progress: u, postureMix: edge, dig: state.action === 'dig' ? edge : 0,
        blink, phase, tempo, descending: !!state.descending, decision: state.id
      };
    }
  };
}
