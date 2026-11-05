/* Wildlife coordinates share the background plate's 1536 × 1024 space. */
(() => {
  'use strict';
  const section = document.getElementById('underground');
  const stage = section?.querySelector('.underground-stage');
  const canvas = section?.querySelector('.burrow-wildlife');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !stage) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const atlas = new Image();
  atlas.src = '/assets/toon-planet/burrow-wildlife-atlas.png';
  const chambers = [
    new Path2D('M395 405 Q400 300 514 256 Q625 195 748 254 Q866 278 888 420 L817 465 Q630 492 420 461 Z'),
    new Path2D('M651 748 Q670 646 792 620 Q941 582 1035 664 Q1105 717 1101 789 Q1051 877 904 878 Q735 874 660 820 Z')
  ];
  let frame = 0, visible = false, ready = false, elapsed = 0, last = 0;
  const ease = t => t * t * (3 - 2 * t);
  function fit() {
    const width = Math.max(section.clientWidth, (section.clientHeight + 40) * 1.5);
    stage.style.width = `${width}px`;
  }
  new ResizeObserver(fit).observe(section);
  fit();

  // Short energetic runs alternate with sniffing, seed nibbling and digging.
  // Facing changes happen while still, so the animals never slide backwards.
  function pose(time, rat) {
    const period = rat ? 13.7 : 17.3;
    const t = (time + (rat ? 4.8 : 0)) % period;
    const a = rat ? 820 : 551, b = rat ? 932 : 683;
    let x = a, facing = 1, run = false, dig = false, sniff = false;
    if (t < 1.9) { x = a + (b - a) * ease(t / 1.9); run = true; }
    else if (t < 4.1) { x = b; sniff = true; }
    else if (t < 6.5) { x = b; dig = true; }
    else if (t < 7.1) { x = b; facing = -1; sniff = true; }
    else if (t < 9) { x = b - (b - a) * ease((t - 7.1) / 1.9); facing = -1; run = true; }
    else if (t < period - .6) { facing = -1; sniff = true; }
    return { x, facing, run, dig, sniff };
  }
  function animal(time, rat) {
    const p = pose(time, rat);
    const width = rat ? 184 : 246, height = rat ? 77 : 106;
    const floor = rat ? 833 : 449;
    const cadence = time * (rat ? 23 : 19);
    const hop = p.run ? Math.abs(Math.sin(cadence)) * (rat ? 11 : 5) : 0;
    const nod = p.dig ? Math.sin(time * 27) : p.sniff ? Math.sin(time * 7) : 0;
    ctx.save();
    ctx.clip(chambers[rat ? 1 : 0]);
    ctx.fillStyle = '#110b07';
    ctx.globalAlpha = .33;
    ctx.beginPath();
    ctx.ellipse(p.x + p.facing * 19, floor + 1, width * .36, 4 - hop * .08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(p.x, floor - hop);
    ctx.scale(p.facing, 1);
    ctx.rotate(p.dig ? nod * .032 : p.run ? Math.sin(cadence) * .018 : nod * .008);
    ctx.scale(1 + (p.run ? Math.sin(cadence) * .025 : 0), 1 + Math.sin(time * 3.7) * .012);
    // Atlas crops keep the original fine fur and real alpha edges.
    const sx = rat ? 780 : 0, sy = rat ? 401 : 370;
    const sw = rat ? 756 : 768, sh = rat ? 277 : 301;
    ctx.drawImage(atlas, sx, sy, sw, sh, -width / 2, -height, width, height);
    // Small foot strokes add a rapid alternating stride at this viewing scale.
    if (p.run || p.dig) {
      ctx.strokeStyle = rat ? '#b78d69' : '#8b7053';
      ctx.lineWidth = rat ? 1.7 : 2.2;
      for (let leg = 0; leg < 2; leg++) {
        const foot = Math.sin(cadence + leg * Math.PI) * (p.dig ? 3 : 5);
        const x = (p.dig ? .33 : leg ? .34 : -.06) * width;
        ctx.beginPath(); ctx.moveTo(x, -7); ctx.lineTo(x + foot, -1); ctx.stroke();
      }
    }
    // Loose grains follow the front paws during a digging burst.
    if (p.dig || p.run) {
      ctx.fillStyle = '#bd9365';
      for (let i = 0; i < 7; i++) {
        const phase = (time * (p.dig ? 2.4 : 1.5) + i / 7) % 1;
        ctx.globalAlpha = (1 - phase) * .65;
        const x = (p.dig ? width * .35 : -width * .2) - phase * (p.dig ? 24 : 14);
        ctx.fillRect(x, -Math.sin(phase * Math.PI) * 10, 1.6, 1.6);
      }
    }
    ctx.restore();
  }
  function draw(time) {
    ctx.clearRect(0, 0, 1536, 1024);
    animal(time, false);
    animal(time, true);
  }
  function tick(now) {
    frame = 0;
    elapsed += Math.min((now - last) / 1000, .05);
    last = now;
    draw(elapsed);
    if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!ready) return;
    draw(reduced.matches ? 3.2 : elapsed);
    if (visible && !document.hidden && !reduced.matches) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  atlas.addEventListener('load', () => { ready = true; sync(); }, { once: true });
  if (atlas.complete && atlas.naturalWidth) { ready = true; sync(); }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { rootMargin: '80px' }).observe(section);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
})();
