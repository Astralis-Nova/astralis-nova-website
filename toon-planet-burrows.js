/* Small desert animals with articulated fur, planted feet and facial animation. */
import { RIGS, behavior, prepareRig, deformPoint, createFurRenderer } from './toon-burrow-rig.js?v=20261105roundturns';
import { createTurnRenderer } from './toon-burrow-turns.js';

const section = document.getElementById('underground');
const stage = section?.querySelector('.underground-stage');
const canvas = section?.querySelector('.burrow-wildlife');
const ctx = canvas?.getContext('2d');
if (ctx && stage) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const atlas = new Image();
  const turns = createTurnRenderer();
  let renderer, ready = false, visible = false, frame = 0, elapsed = .2, last = 0, painted = 0;
  function fit() {
    stage.style.width = `${Math.max(section.clientWidth, (section.clientHeight + 40) * 1.5)}px`;
  }
  new ResizeObserver(fit).observe(section);
  fit();
  const chambers = [
    new Path2D('M395 405 Q400 300 514 256 Q625 195 748 254 Q866 278 888 420 L817 465 Q630 492 420 461 Z'),
    new Path2D('M651 748 Q670 646 792 620 Q941 582 1035 664 Q1105 717 1101 789 Q1051 877 904 878 Q735 874 660 820 Z')
  ];
  function ellipse(x, y, rx, ry, color, target = ctx) {
    const ctx = target;
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  function face(target, rig, pose) {
    const ctx = target;
    const eye = deformPoint(...rig.eye, rig, pose);
    ctx.save(); ctx.translate(...eye); ctx.rotate(pose.headAngle);
    const [rx, ry] = rig.eyeSize;
    // Fur-coloured lids cover the source eye as the glossy eye closes and opens.
    ellipse(0, 0, rx + 2, ry + 2, rig.eyeFur, ctx);
    const open = Math.max(.035, 1 - pose.blink);
    const glance = Math.sin(pose.time * 1.4 + (pose.rat ? 2 : 0)) * 1.5;
    ellipse(glance, .5, rx * .89, ry * open, '#34271e', ctx);
    ellipse(glance, .3, rx * .73, ry * .9 * open, '#100d0b', ctx);
    if (open > .2) {
      ellipse(glance - rx * .28, -ry * .3 * open, rx * .22, ry * .19 * open, '#d9dfdb', ctx);
      ellipse(glance + rx * .26, ry * .28 * open, rx * .10, ry * .08 * open, '#7a6650', ctx);
    }
    ctx.restore();
    const nose = deformPoint(...rig.nose, rig, pose);
    const twitch = Math.sin(pose.time * 19) * (pose.action === 'sniff' ? 1.5 : .5);
    ctx.strokeStyle = '#ddcead'; ctx.lineWidth = .68; ctx.globalAlpha = .55;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(nose[0] - 5, nose[1] + i * 2);
      ctx.quadraticCurveTo(nose[0] - 14, nose[1] - 8 + i * 8 + twitch, nose[0] - 37, nose[1] - 17 + i * 12 + twitch);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function profile(target, rig, pose, facing) {
    const ctx = target, time = pose.time;
    const scale = rig.width / rig.source[2], h = rig.source[3] * scale;
    ctx.save();
    ctx.scale(facing, 1);
    ctx.translate(-rig.width / 2, -h);
    ctx.scale(scale, scale);
    renderer.draw(ctx, rig, pose);
    face(ctx, rig, pose);
    if (pose.dig > .05 || pose.speed > .2) {
      for (let i = 0; i < 9; i++) {
        const phase = (time * (pose.dig ? 3.3 : 2.2) + i / 9) % 1;
        ctx.globalAlpha = (1 - phase) * .65;
        const x = (pose.dig ? rig.source[2] * .85 : rig.source[2] * .4) - phase * (pose.dig ? 125 : 75);
        ctx.fillStyle = i % 2 ? '#9c7650' : '#c39b6d';
        ctx.fillRect(x, rig.source[3] - 12 - Math.sin(phase * Math.PI) * 34, 4, 3);
      }
    }
    ctx.restore();
  }
  function animal(time, rat) {
    const rig = RIGS[rat ? 1 : 0], pose = prepareRig(rig, behavior(time, rat));
    ctx.save(); ctx.clip(chambers[rat ? 1 : 0]);
    ctx.globalAlpha = .29;
    ellipse(pose.x + Math.cos(pose.yaw) * 20, rig.floor + 1, rig.width * .35, 3, '#130c07');
    ctx.globalAlpha = 1;
    ctx.translate(pose.x, rig.floor);
    if (pose.action !== 'turn' || !turns.draw(ctx, rig, pose, profile)) profile(ctx, rig, pose, pose.facing);
    ctx.restore();
  }
  function draw(time) {
    ctx.clearRect(0, 0, 1536, 1024);
    animal(time, false); animal(time, true);
  }
  function tick(now) {
    frame = 0;
    elapsed += Math.min((now - last) / 1000, .08); last = now;
    // Bound work to 30 fps while keeping gait time independent of frame rate.
    if (now - painted >= 1000 / 30) { draw(elapsed); painted = now - (now - painted) % (1000 / 30); }
    if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!ready) return;
    draw(reduced.matches ? 2.8 : elapsed);
    if (visible && !document.hidden && !reduced.matches) {
      last = performance.now(); painted = 0; frame = requestAnimationFrame(tick);
    }
  }
  atlas.addEventListener('load', () => {
    renderer = createFurRenderer(atlas);
    ready = true; sync();
  }, { once: true });
  atlas.src = '/assets/toon-planet/burrow-wildlife-atlas.png';
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '80px' }).observe(section);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
}
