/* Camera-angle artwork supplies chest/rump depth during a full body pivot. */
const TAU = Math.PI * 2;
const smooth = t => t * t * (3 - 2 * t);
export function rotationViews(yaw) {
  const slot = ((yaw % TAU + TAU) % TAU) / (Math.PI / 4);
  const index = Math.floor(slot), fraction = slot - index;
  // Crossfades are short; exact front and rear views stay crisp during the pause.
  const t = Math.max(0, Math.min(1, (fraction - .22) / .56));
  const views = [{ side: 1 }, { frame: 0 }, { frame: 1 }, { frame: 2 }, { side: -1 }, { frame: 3 }, { frame: 4 }, { frame: 5 }, { side: 1 }];
  return { from: views[index], to: views[index + 1], mix: smooth(t) };
}

// Bounds and paw registrations keep the animal grounded as its silhouette changes.
const registrations = [
  [
    { box: [23, 136, 482, 282], center: 322, foot: 417 },
    { box: [105, 123, 311, 294], center: 281, foot: 416 },
    { box: [33, 137, 456, 280], center: 202, foot: 416 },
    { box: [93, 91, 419, 326], center: 268, foot: 381 },
    { box: [112, 94, 294, 341], center: 264, foot: 379 },
    { box: [12, 87, 418, 337], center: 253, foot: 378 }
  ],
  [
    { box: [25, 149, 477, 257], center: 301, foot: 405 },
    { box: [87, 144, 296, 264], center: 267, foot: 407 },
    { box: [2, 146, 480, 260], center: 216, foot: 405 },
    { box: [33, 72, 464, 307], center: 225, foot: 343 },
    { box: [127, 76, 257, 355], center: 257, foot: 345 },
    { box: [17, 71, 428, 315], center: 284, foot: 344 }
  ]
];

export function createTurnRenderer() {
  const images = ['squirrel-turns.webp', 'kangaroo-rat-turns.webp'].map(name => {
    const image = new Image(); image.src = '/assets/toon-planet/' + name; return image;
  });
  const layers = Array.from({ length: 3 }, () => {
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 440;
    return { canvas, ctx: canvas.getContext('2d') };
  });
  function view(layer, spec, rig, pose, profile) {
    const ctx = layer.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 720, 440);
    ctx.setTransform(2, 0, 0, 2, 360, 320);
    if (spec.side) { profile(ctx, rig, pose, spec.side); return; }
    const r = registrations[pose.rat ? 1 : 0][spec.frame], [x, y, w, h] = r.box;
    const image = images[pose.rat ? 1 : 0];
    const bodyHeight = rig.width / rig.source[2] * (pose.rat ? 244 : 266);
    const scale = bodyHeight / (r.foot - y);
    const offset = Math.cos(pose.yaw) * (pose.rat ? 25 : 21);
    const breath = Math.sin(pose.time * 3.8) * .45;
    ctx.save();
    ctx.translate(offset, pose.rat ? -4 : -6);
    ctx.scale(1, 1 + breath / 80);
    // A tiny weight shift accompanies the in-place paw pivot.
    ctx.rotate(Math.sin(pose.time * 8.5) * .009);
    ctx.drawImage(image, (spec.frame % 3) * 512 + x, Math.floor(spec.frame / 3) * 512 + y, w, h,
      (x - r.center) * scale, (y - r.foot) * scale, w * scale, h * scale);
    ctx.restore();
  }
  return {
    draw(ctx, rig, pose, profile) {
      if (!images.every(image => image.complete && image.naturalWidth)) return false;
      const blend = rotationViews(pose.yaw);
      view(layers[0], blend.from, rig, pose, profile);
      view(layers[1], blend.to, rig, pose, profile);
      const out = layers[2].ctx;
      out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, 720, 440);
      // Blend in an isolated layer so overlapping fur keeps its full opacity.
      out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1 - blend.mix;
      out.drawImage(layers[0].canvas, 0, 0);
      out.globalCompositeOperation = 'lighter'; out.globalAlpha = blend.mix;
      out.drawImage(layers[1].canvas, 0, 0);
      out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1;
      ctx.drawImage(layers[2].canvas, -180, -160, 360, 220);
      return true;
    }
  };
}
