const frames = { crouch: 0, sit: 1, nibble: 1, lie: 2, groom: 3, climb: 4, stretch: 5 };
const meta = [
  [
    { box: [16, 229, 475, 178], center: 328, foot: 400, tail: 174, eye: [436, 272] },
    { box: [40, 109, 410, 302], center: 337, foot: 410, tail: 202, eye: [371, 149] },
    { box: [0, 239, 496, 164], center: 324, foot: 400, tail: 155, eye: [418, 274] },
    { box: [34, 123, 384, 289], center: 293, foot: 411, tail: 181 },
    { box: [14, 83, 476, 330], center: 309, foot: 412, tail: 0, eye: [415, 108] },
    { box: [5, 144, 494, 249], center: 318, foot: 392, tail: 0, eye: [390, 269] }
  ],
  [
    { box: [19, 233, 480, 177], center: 333, foot: 409, tail: 196, eye: [451, 304] },
    { box: [38, 151, 400, 261], center: 338, foot: 411, tail: 213, eye: [385, 209] },
    { box: [9, 248, 477, 139], center: 339, foot: 386, tail: 190, eye: [436, 295] },
    { box: [28, 136, 412, 257], center: 315, foot: 392, tail: 219 },
    { box: [18, 109, 472, 291], center: 318, foot: 399, tail: 0, eye: [419, 138] },
    { box: [0, 174, 500, 201], center: 336, foot: 374, tail: 0, eye: [384, 264] }
  ]
];
export function postureFrame(action) { return frames[action] ?? null; }
export function createPostureRenderer() {
  const images = ['squirrel-postures.webp', 'kangaroo-rat-postures.webp'].map(name => {
    const image = new Image(); image.src = '/assets/toon-planet/' + name; return image;
  });
  const layers = Array.from({ length: 3 }, () => {
    const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 560;
    return { canvas, ctx: canvas.getContext('2d') };
  });
  function clear(layer) {
    const c = layer.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 800, 560);
    c.setTransform(2, 0, 0, 2, 400, 430); return c;
  }
  return {
    draw(ctx, rig, pose, profile) {
      const index = postureFrame(pose.action), species = pose.rat ? 1 : 0, image = images[species];
      if (index === null || !image.complete || !image.naturalWidth) return false;
      const r = meta[species][index], [x, y, w, h] = r.box;
      const scale = rig.width / rig.source[2] * 1.35;
      const a = clear(layers[0]); profile(a, rig, pose, pose.facing);
      const b = clear(layers[1]);
      b.scale(pose.facing, 1); b.translate(pose.rat ? 25 : 21, pose.rat ? -4 : -6);
      b.scale(scale, scale); b.translate(-r.center, -r.foot);
      b.translate(r.center, r.foot);
      const breathe = Math.sin(pose.time * (pose.action === 'lie' ? 2.2 : 3.8));
      b.scale(1 + breathe * .003, 1 + breathe * (pose.action === 'lie' ? .012 : .006));
      b.rotate(pose.action === 'climb' ? Math.sin(pose.time * 9) * .018 : 0);
      b.translate(-r.center, -r.foot);
      const sx = index % 3 * 512, sy = Math.floor(index / 3) * 512;
      const cut = Math.max(x, r.tail);
      b.drawImage(image, sx + cut, sy + y, x + w - cut, h, cut, y, x + w - cut, h);
      // Tail flex remains visible while the animal sits or rests.
      for (let left = x; left < cut; left += 12) {
        const width = Math.min(12, cut - left), amount = (cut - left) / Math.max(1, cut - x);
        const sway = Math.sin(pose.time * 3.1 - amount * 3) * amount * (pose.rat ? 8 : 6);
        b.drawImage(image, sx + left, sy + y, width, h, left, y + sway, width, h);
      }
      if (r.eye && pose.blink > .15) {
        const [ex, ey] = r.eye;
        b.fillStyle = pose.rat ? '#b79773' : '#9e896d'; b.beginPath();
        b.ellipse(ex, ey, 10, Math.max(.5, 7 * pose.blink), 0, 0, Math.PI * 2); b.fill();
        b.strokeStyle = '#34291e'; b.lineWidth = 1.3; b.beginPath();
        b.moveTo(ex - 7, ey + 1); b.quadraticCurveTo(ex, ey + 3, ex + 7, ey); b.stroke();
      }
      const mix = pose.postureMix ?? 1, out = layers[2].ctx;
      out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, 800, 560);
      out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1 - mix; out.drawImage(layers[0].canvas, 0, 0);
      out.globalCompositeOperation = 'lighter'; out.globalAlpha = mix; out.drawImage(layers[1].canvas, 0, 0);
      out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1;
      ctx.drawImage(layers[2].canvas, -200, -215, 400, 280);
      return true;
    }
  };
}

export function drawClimbingRoots(ctx) {
  ctx.save(); ctx.lineCap = 'round';
  for (const points of [
    [620, 460, 663, 416, 718, 374, 766, 335, 819, 287, 849, 259],
    [854, 842, 901, 807, 950, 771, 1001, 730, 1045, 693]
  ]) {
    for (let i = 2; i < points.length; i += 2) {
      const x = points[i - 2], y = points[i - 1], ex = points[i], ey = points[i + 1];
      const bend = i % 4 ? 2.6 : -2.8, width = 1.8 + i / points.length * 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ex) / 2 + bend, (y + ey) / 2 - bend, ex, ey);
      ctx.strokeStyle = '#20190f'; ctx.lineWidth = width + 2; ctx.globalAlpha = .55; ctx.stroke();
      ctx.strokeStyle = '#816543'; ctx.lineWidth = width; ctx.globalAlpha = .86; ctx.stroke();
      ctx.strokeStyle = '#b29970'; ctx.lineWidth = .55; ctx.globalAlpha = .4; ctx.stroke();
      // Irregular fine rootlets interrupt the silhouette of the main root.
      for (let branch = 0; branch < 2; branch++) {
        const f = .3 + branch * .4, bx = x + (ex - x) * f, by = y + (ey - y) * f;
        const side = (i + branch) % 3 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + side * 7, by + 8, bx + side * (11 + i), by + 18 + branch * 6);
        ctx.strokeStyle = '#92754e'; ctx.lineWidth = .8 + i / points.length; ctx.globalAlpha = .65; ctx.stroke();
      }
    }
  }
  ctx.restore();
}
