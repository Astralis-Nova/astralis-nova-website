/* Fur stays on a continuous textured mesh while joints and features move. */
const TAU = Math.PI * 2;
const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const RIGS = [
  {
    source: [0, 370, 768, 301], width: 246, floor: 449,
    neck: [597, 135], eye: [685, 76], eyeSize: [14, 9], eyeFur: '#9d8667',
    ear: [628, 59], nose: [741, 109], tailRoot: [303, 168],
    legs: [
      { hip: [287, 180], knee: [250, 235], ankle: [265, 260], toe: [302, 267], band: [211, 320], phase: 0 },
      { hip: [373, 169], knee: [367, 232], ankle: [391, 271], toe: [449, 279], band: [320, 468], phase: .5 },
      { hip: [491, 181], knee: [504, 235], ankle: [517, 263], toe: [552, 269], band: [468, 561], phase: .5 },
      { hip: [556, 164], knee: [587, 229], ankle: [637, 273], toe: [693, 281], band: [561, 725], phase: 0 }
    ]
  },
  {
    source: [780, 401, 756, 277], width: 184, floor: 833,
    neck: [594, 170], eye: [649, 116], eyeSize: [15, 12], eyeFur: '#a58d70',
    ear: [589, 100], nose: [700, 148], tailRoot: [358, 137],
    legs: [
      { hip: [441, 151], knee: [380, 186], ankle: [469, 225], toe: [524, 236], band: [360, 540], phase: .08 },
      { hip: [419, 151], knee: [357, 186], ankle: [427, 237], toe: [483, 250], band: [320, 495], phase: 0 },
      { hip: [602, 168], knee: [618, 200], ankle: [650, 222], toe: [689, 233], band: [650, 711], phase: .48 },
      { hip: [570, 164], knee: [586, 207], ankle: [610, 237], toe: [659, 249], band: [535, 650], phase: .44 }
    ]
  }
];

export function motionPose(time, rat = false, motion = {}) {
  const clock = time + (motion.phase ?? 0), speed = motion.speed ?? 0;
  const dig = motion.dig ?? 0, gait = clock * (rat ? 2.65 : 2.35) * (motion.tempo ?? 1);
  const bounce = speed * (rat ? (1 - Math.cos(gait * TAU)) * 14 : (1 - Math.cos(gait * TAU * 2)) * 4.3);
  return {
    ...motion, time: clock, rat, speed, dig, gait, bounce,
    action: motion.action ?? 'sniff', x: motion.x ?? (rat ? 860 : 610),
    floor: motion.floor ?? (rat ? 833 : 449), facing: motion.facing ?? 1, yaw: motion.yaw ?? 0,
    blink: motion.blink ?? 0, breathe: Math.sin(clock * (rat ? 4.7 : 3.8)) * 1.6,
    headAngle: -.07 + Math.sin(clock * 1.65 + (rat ? 2 : 0)) * .085 + dig * Math.sin(clock * 17) * .11,
    earAngle: smooth((Math.sin(clock * 2.1) - .7) / .3) * Math.sin(clock * 28) * .22
  };
}

// Two-bone inverse kinematics keeps knees bent and feet attached to the floor.
export function solveLimb(hip, foot, upper, lower, bend) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(upper - lower) + .01, upper + lower - .01);
  const angle = Math.atan2(dy, dx);
  const a = Math.acos(clamp((upper * upper + d * d - lower * lower) / (2 * upper * d), -1, 1));
  const knee = [hip[0] + Math.cos(angle + bend * a) * upper, hip[1] + Math.sin(angle + bend * a) * upper];
  return [hip, knee, [hip[0] + Math.cos(angle) * d, hip[1] + Math.sin(angle) * d]];
}

function bodyPoint(x, y, pose) {
  return [x + Math.sin(pose.time * 2) * .8, y - pose.bounce + pose.breathe * clamp((210 - y) / 140)];
}

export function prepareRig(rig, pose) {
  pose.chains = rig.legs.map((leg, index) => {
    const phase = ((pose.gait + leg.phase) % 1 + 1) % 1;
    const stance = .62;
    const step = phase < stance ? .5 - phase / stance : -.5 + smooth((phase - stance) / (1 - stance));
    const lift = phase < stance ? 0 : Math.sin((phase - stance) / (1 - stance) * Math.PI);
    let footX = step * (pose.rat ? 88 : 94) * pose.speed;
    let footY = -lift * (pose.rat ? 39 : 27) * pose.speed;
    if (pose.dig && index >= 2) {
      const scrape = pose.time * 5.8 + index * Math.PI;
      footX += Math.cos(scrape) * 38 * pose.dig;
      footY -= (Math.sin(scrape) + 1) * 13 * pose.dig;
    }
    if ((pose.action === 'groom' || pose.action === 'nibble') && index >= 2) {
      footX -= 11 + Math.sin(pose.time * 9 + index) * 8;
      footY -= 28 + Math.cos(pose.time * 9 + index) * 7;
    }
    const hip = bodyPoint(...leg.hip, pose);
    const foot = [leg.ankle[0] + footX, leg.ankle[1] + footY];
    const upper = distance(leg.hip, leg.knee), lower = distance(leg.knee, leg.ankle);
    const reach = upper + lower - .1;
    // Keep a stance paw planted rather than letting an unreachable stride float.
    if (foot[1] - hip[1] > reach - .1) hip[1] = foot[1] - reach + .1;
    const horizontalReach = Math.sqrt(Math.max(.01, reach * reach - (foot[1] - hip[1]) ** 2));
    foot[0] = clamp(foot[0], hip[0] - horizontalReach, hip[0] + horizontalReach);
    const cross = (leg.knee[0] - leg.hip[0]) * (leg.ankle[1] - leg.hip[1]) - (leg.knee[1] - leg.hip[1]) * (leg.ankle[0] - leg.hip[0]);
    const chain = solveLimb(hip, foot, upper, lower, cross > 0 ? -1 : 1);
    chain.push([chain[2][0] + leg.toe[0] - leg.ankle[0], chain[2][1] + leg.toe[1] - leg.ankle[1] - lift * 6 * pose.speed]);
    return chain;
  });
  return pose;
}

function rotatePoint(x, y, origin, angle) {
  const c = Math.cos(angle), s = Math.sin(angle), dx = x - origin[0], dy = y - origin[1];
  return [origin[0] + dx * c - dy * s, origin[1] + dx * s + dy * c];
}

function segmentPoint(x, y, a, b, c, d) {
  const angle = Math.atan2(d[1] - c[1], d[0] - c[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
  const p = rotatePoint(x, y, a, angle);
  return [p[0] + c[0] - a[0], p[1] + c[1] - a[1]];
}

export function deformPoint(x, y, rig, pose) {
  let p = bodyPoint(x, y, pose);
  // A travelling bend down the tail preserves its fur and tapered silhouette.
  const tail = clamp((rig.tailRoot[0] - x) / (pose.rat ? 348 : 296));
  if (tail > 0 && y > (pose.rat ? 116 : 215 - x * .28)) {
    const w = smooth(tail * 5);
    const sway = Math.sin(pose.time * (pose.rat ? 4.6 : 3.4) - tail * 4.2);
    p[0] += Math.sin(pose.time * 3.1 - tail * 2) * tail * (pose.rat ? 12 : 17) * w;
    p[1] += (sway * (pose.rat ? 27 : 38) + Math.sin(pose.time * 7 - tail * 6) * 7) * tail * w;
    return p;
  }
  // Bind visible limb pixels to the nearest bone, blending across the knee.
  let selected = null, selectedScore = Infinity;
  rig.legs.forEach((leg, index) => {
    if (x < leg.band[0] || x > leg.band[1] || y < leg.hip[1] + 15) return;
    const points = [leg.hip, leg.knee, leg.ankle, leg.toe];
    let best = Infinity, result = null, total = 0, rx = 0, ry = 0;
    for (let b = 0; b < 3; b++) {
      const a = points[b], e = points[b + 1];
      const dx = e[0] - a[0], dy = e[1] - a[1];
      const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy));
      const dist = Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
      const weight = 1 / (1 + dist ** 4 / 100);
      result = segmentPoint(x, y, a, e, pose.chains[index][b], pose.chains[index][b + 1]);
      rx += result[0] * weight; ry += result[1] * weight; total += weight;
      best = Math.min(best, dist);
    }
    if (best < selectedScore) {
      selectedScore = best;
      selected = { x: rx / total, y: ry / total, weight: smooth((y - leg.hip[1] - 15) / 45) * (1 - smooth((best - 25) / 25)) };
    }
  });
  if (selected) {
    p[0] = mix(p[0], selected.x, selected.weight);
    p[1] = mix(p[1], selected.y, selected.weight);
  }
  const headWeight = smooth((x - (pose.rat ? 558 : 554)) / 70) * (1 - smooth((y - (pose.rat ? 185 : 161)) / 40));
  if (headWeight > 0) {
    const origin = bodyPoint(...rig.neck, pose);
    const h = rotatePoint(...p, origin, pose.headAngle);
    p = [mix(p[0], h[0], headWeight), mix(p[1], h[1], headWeight)];
    const earWeight = clamp(1 - Math.hypot((x - rig.ear[0]) / 33, (y - rig.ear[1]) / 55));
    const e = rotatePoint(...p, bodyPoint(...rig.ear, pose), pose.earAngle * earWeight);
    p = e;
  }
  return p;
}

export function createFurRenderer(atlas) {
  const surface = document.createElement('canvas');
  surface.width = 900; surface.height = 460;
  const gl = surface.getContext('webgl', { alpha: true, antialias: true, depth: false, stencil: false });
  if (!gl) return createCanvasFurRenderer(atlas);
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 point;attribute vec2 uv;varying vec2 textureUV;void main(){gl_Position=vec4(point.x/450.0-1.0,1.0-point.y/230.0,0.,1.);textureUV=uv;}'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D fur;varying vec2 textureUV;void main(){gl_FragColor=texture2D(fur,textureUV);}'));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  const buffer = gl.createBuffer(), indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const point = gl.getAttribLocation(program, 'point'), uv = gl.getAttribLocation(program, 'uv');
  gl.enableVertexAttribArray(point); gl.enableVertexAttribArray(uv);
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);
  gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const meshes = RIGS.map(rig => {
    const [sx, sy, w, h] = rig.source, columns = Math.ceil(w / 11), rows = Math.ceil(h / 10);
    const vertices = [], indices = [];
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) vertices.push([x * w / columns, y * h / rows]);
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const a = y * (columns + 1) + x, b = a + 1, c = a + columns + 1, d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
    const data = new Float32Array(vertices.length * 4);
    vertices.forEach(([x, y], i) => { data[i * 4 + 2] = (x + sx) / atlas.width; data[i * 4 + 3] = (y + sy) / atlas.height; });
    return { vertices, indices: new Uint16Array(indices), data };
  });
  let lost = false, fallback;
  surface.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; });
  return {
    draw(ctx, rig, pose) {
      if (lost) {
        fallback ??= createCanvasFurRenderer(atlas);
        return fallback.draw(ctx, rig, pose);
      }
      const mesh = meshes[pose.rat ? 1 : 0];
      mesh.vertices.forEach(([x, y], index) => {
        const p = deformPoint(x, y, rig, pose);
        mesh.data[index * 4] = p[0] + 65; mesh.data[index * 4 + 1] = p[1] + 75;
      });
      gl.viewport(0, 0, 900, 460); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      ctx.drawImage(surface, -65, -75);
      return true;
    }
  };
}

// The same joint geometry still works when a browser cannot create a GPU context.
function createCanvasFurRenderer(atlas) {
  const meshes = RIGS.map(rig => {
    const w = rig.source[2], h = rig.source[3], cols = Math.ceil(w / 28), rows = Math.ceil(h / 25), triangles = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const a = [x * w / cols, y * h / rows], b = [(x + 1) * w / cols, y * h / rows];
      const c = [x * w / cols, (y + 1) * h / rows], d = [(x + 1) * w / cols, (y + 1) * h / rows];
      triangles.push([a, b, c], [b, d, c]);
    }
    return triangles;
  });
  return {
    draw(ctx, rig, pose) {
      const [sx, sy, w, h] = rig.source;
      for (const [a, b, c] of meshes[pose.rat ? 1 : 0]) {
        const p = deformPoint(...a, rig, pose), q = deformPoint(...b, rig, pose), r = deformPoint(...c, rig, pose);
        const bx = b[0] - a[0], by = b[1] - a[1], cx = c[0] - a[0], cy = c[1] - a[1], den = bx * cy - by * cx;
        const A = ((q[0] - p[0]) * cy - (r[0] - p[0]) * by) / den;
        const B = ((q[1] - p[1]) * cy - (r[1] - p[1]) * by) / den;
        const C = ((r[0] - p[0]) * bx - (q[0] - p[0]) * cx) / den;
        const D = ((r[1] - p[1]) * bx - (q[1] - p[1]) * cx) / den;
        ctx.save(); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.lineTo(...r); ctx.closePath(); ctx.clip();
        ctx.transform(A, B, C, D, p[0] - A * a[0] - C * a[1], p[1] - B * a[0] - D * a[1]);
        ctx.drawImage(atlas, sx, sy, w, h, 0, 0, w, h); ctx.restore();
      }
      return true;
    }
  };
}
