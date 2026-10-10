(() => {
  'use strict';
  const elements = [...document.querySelectorAll('.rainbow-wrap .rp-bird')];
  if (!elements.length) return;
  const textures = [new Image(), new Image()];
  const birds = elements.map((element, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    canvas.className = 'rp-flight-cycle';
    canvas.setAttribute('aria-hidden', 'true');
    return { element, canvas, context: canvas.getContext('2d'), species: index === 0 ? 0 : 1, state: null, ready: false };
  });
  if (birds.some(bird => !bird.context)) return;
  const style = document.createElement('style');
  style.textContent = `
    .rp-flight-cycle{position:absolute;left:0;top:50%;width:100%;height:auto;pointer-events:none;display:none;
      transform-origin:50% 50%;filter:drop-shadow(0 2px 2px rgba(4,12,20,.12));will-change:transform}
    .rp-cycle-ready .rp-flight-cycle{display:block}
    .rp-cycle-ready .rp-bird-shape{visibility:hidden}
  `;
  document.head.appendChild(style);
  let disposed = false;

  // Poses cover the full body: power stroke, bottom reversal, folded recovery,
  // top reversal and opening wings. Their head anchors and photographic scale
  // are aligned in the atlas, so changing pose cannot make the bird jump in size.
  function render(index, state) {
    const bird = birds[index];
    if (!bird || disposed) return false;
    bird.state = state;
    if (!bird.ready) return false;
    const { context: ctx, canvas, species } = bird;
    const seconds = state.seconds || 0;
    const phase = state.still ? 0 : ((state.beatPhase % 1) + 1) % 1;
    const frame = phase * 6;
    const first = Math.floor(frame), second = (first + 1) % 6;
    const mix = frame - first;
    const flight = state.still ? 0 : Math.max(0, Math.min(1, state.envelope));
    const weights = [[first, (1 - mix) * flight], [second, mix * flight], [0, 1 - flight]];
    ctx.clearRect(0, 0, 512, 512);
    // Add premultiplied pose colors on a transparent surface. Overlapping breast
    // pixels retain their opacity; moving feather edges get a short soft blend.
    // Source-over crossfades would turn the torso translucent on every wingbeat.
    ctx.globalCompositeOperation = 'lighter';
    for (const [pose, weight] of weights) {
      if (weight < .0001) continue;
      ctx.globalAlpha = weight;
      ctx.drawImage(textures[species], (pose % 3) * 512, Math.floor(pose / 3) * 512, 512, 512, 0, 0, 512, 512);
    }
    ctx.globalCompositeOperation = 'source-over';
    const blinkPhase = (seconds + index * 2.37) % (species === 0 ? 6.7 : 5.3);
    const blink = state.still ? 0 : Math.max(0, 1 - Math.abs(blinkPhase - .14) / .085);
    if (blink > .01) {
      ctx.globalAlpha = blink;
      ctx.fillStyle = species === 0 ? '#29333c' : '#dce0e4';
      ctx.beginPath(); ctx.ellipse(204, 192, 4, 3.7 * blink, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const dx = state.dx ?? (bird.element.dataset.flightDirection === 'left' ? -.01 : .01);
    // Both new birds face left in their base pose; their facing must follow the
    // path, including the raven, whose original fallback photograph faces right.
    const profile = (dx < 0 ? 1 : -1) * (.82 + .18 * Math.abs(Math.tanh(dx * 300)));
    const bank = state.still ? 0 : state.bank || 0;
    const settle = state.still ? 0 : Math.sin(phase * Math.PI * 2 - .7) * 2.2 * flight;
    canvas.style.transform = `translateY(calc(-50% + ${settle.toFixed(2)}px)) rotate(${bank.toFixed(2)}deg) scaleX(${profile.toFixed(4)})`;
    bird.element.dataset.flightPose = `${first}:${second}:${mix.toFixed(3)}`;
    return true;
  }
  window.rainbowPromiseRenderPose = render;

  textures.forEach((texture, species) => {
    texture.onload = () => {
      if (disposed || texture.naturalWidth !== 1536 || texture.naturalHeight !== 1024) return;
      birds.forEach((bird, index) => {
        if (bird.species !== species) return;
        bird.ready = true;
        const state = bird.state || { seconds: 0, still: window.matchMedia('(prefers-reduced-motion: reduce)').matches, beatPhase: 0, envelope: 1, bank: 0 };
        render(index, state);
        bird.element.appendChild(bird.canvas);
        bird.element.classList.add('rp-cycle-ready');
      });
    };
    // If a texture fails, the existing photographic animation stays visible.
    texture.src = `/assets/rainbow-promise/${species === 0 ? 'raven' : 'dove'}-flight-cycle.webp`;
    if (texture.complete && texture.naturalWidth) texture.onload();
  });
  window.addEventListener('pagehide', () => {
    disposed = true;
    textures.forEach(texture => { texture.onload = null; });
    if (window.rainbowPromiseRenderPose === render) delete window.rainbowPromiseRenderPose;
  }, { once: true });
})();
