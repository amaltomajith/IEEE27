// Procedural hands for the "Reach" scene, in the brain's node-and-synapse language.
// Both are built from one right-hand skeleton in a pointing pose: index extended,
// the other fingers relaxed into the palm, thumb along the side.
//
// Local frame: wrist at the origin, fingers along +x, thumb side +y, back of the
// hand +z. Units: about 1.9 from wrist to index fingertip.

import { buildAdj, type Adj } from "./cascade";
import { knnEdges } from "./layout";

export type HandLayout = {
  n: number;
  pos: Float32Array;
  seed: Float32Array;
  edges: Uint32Array;
  adj: Adj;
  /** Node index at the index fingertip (where the spark lands). */
  tip: number;
  tipPos: [number, number, number];
};

type V = [number, number, number];
type Seg = { a: V; b: V; ra: number; rb: number; finger: number; seg: number; cap: boolean };

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const rnd = (() => {
  let s = 20270303;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
})();

const PALM = { len: 0.92, half: 0.4, thick: 0.115 };

// finger: knuckle (x, y), phalanx lengths, base/tip radius, flex per joint, splay.
const FINGERS = [
  { k: [0.95, 0.285], L: [0.46, 0.27, 0.21], r: [0.085, 0.062], flex: [0.04, 0.07, 0.05], splay: 0.05 },
  { k: [0.97, 0.09], L: [0.5, 0.3, 0.21], r: [0.088, 0.064], flex: [0.95, 1.12, 0.62], splay: 0 },
  { k: [0.94, -0.11], L: [0.47, 0.29, 0.2], r: [0.083, 0.06], flex: [1.05, 1.18, 0.62], splay: -0.05 },
  { k: [0.87, -0.29], L: [0.37, 0.22, 0.18], r: [0.072, 0.054], flex: [1.12, 1.2, 0.6], splay: -0.12 },
] as const;

const THUMB = {
  base: [0.17, 0.33, -0.04] as V,
  dirs: [norm([0.75, 0.55, -0.32]), norm([0.86, 0.26, -0.44]), norm([0.82, 0.06, -0.57])],
  L: [0.36, 0.3, 0.24],
  r: [0.105, 0.074],
};

function skeleton(): Seg[] {
  const segs: Seg[] = [];
  FINGERS.forEach((f, fi) => {
    let p: V = [f.k[0], f.k[1], 0];
    let phi = 0;
    for (let s = 0; s < 3; s++) {
      phi += f.flex[s];
      const d: V = [Math.cos(phi) * Math.cos(f.splay), Math.sin(f.splay) * Math.cos(phi), -Math.sin(phi)];
      const q = add(p, mul(d, f.L[s]));
      const t0 = s / 3, t1 = (s + 1) / 3;
      segs.push({ a: p, b: q, ra: f.r[0] + (f.r[1] - f.r[0]) * t0, rb: f.r[0] + (f.r[1] - f.r[0]) * t1, finger: fi + 1, seg: s, cap: s === 2 });
      p = q;
    }
  });
  let p = THUMB.base;
  for (let s = 0; s < 3; s++) {
    const q = add(p, mul(THUMB.dirs[s], THUMB.L[s]));
    const t0 = s / 3, t1 = (s + 1) / 3;
    segs.push({ a: p, b: q, ra: THUMB.r[0] + (THUMB.r[1] - THUMB.r[0]) * t0, rb: THUMB.r[0] + (THUMB.r[1] - THUMB.r[0]) * t1, finger: 5, seg: s, cap: s === 2 });
    p = q;
  }
  return segs;
}

/** Two unit vectors perpendicular to `axis`. */
function frame(axis: V): [V, V] {
  const up: V = Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  const u = norm(cross(axis, up));
  return [u, norm(cross(axis, u))];
}

const palmHalfWidth = (x: number) => 0.3 + 0.1 * Math.min(1, Math.max(0, x / 0.5));

function finish(pos: number[], seed: number[], edges: Uint32Array, tip: number): HandLayout {
  const n = seed.length;
  return {
    n,
    pos: Float32Array.from(pos),
    seed: Float32Array.from(seed),
    edges,
    adj: buildAdj(edges, n),
    tip,
    tipPos: [pos[tip * 3], pos[tip * 3 + 1], pos[tip * 3 + 2]],
  };
}

/** Organic hand: a surface point cloud on tapered capsules, wired by short synapses. */
export function humanHand(n: number): HandLayout {
  const segs = skeleton();
  const pos: number[] = [], seed: number[] = [], finger: number[] = [], segOf: number[] = [];
  const push = (p: V, f: number, s: number) => {
    pos.push(...p);
    seed.push(rnd());
    finger.push(f);
    segOf.push(s);
  };
  const area = segs.map((s) => len(sub(s.b, s.a)) * (s.ra + s.rb));
  const segArea = area.reduce((a, b) => a + b, 0);
  const palmArea = PALM.len * PALM.half * 2.6;
  const nPalm = Math.round(n * (palmArea / (palmArea + segArea)));

  // Palm and wrist stub: a rounded slab that narrows into the wrist.
  for (let i = 0; i < nPalm; i++) {
    const x = -0.5 + rnd() * (PALM.len + 0.5);
    const w = x < 0 ? 0.3 : palmHalfWidth(x);
    const a = rnd() * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    // Superellipse cross-section: flat top and bottom, rounded sides.
    const k = 2 / 6;
    const y = Math.sign(c) * Math.abs(c) ** k * w;
    const z = Math.sign(s) * Math.abs(s) ** k * PALM.thick * (x < 0 ? 1.05 : 1);
    push([x, y, z], 0, 0);
  }
  // Fingers and thumb.
  let tip = 0, best = -Infinity;
  const nSeg = n - nPalm;
  segs.forEach((sg, si) => {
    const m = Math.max(8, Math.round(nSeg * (area[si] / segArea)));
    const ax = sub(sg.b, sg.a), d = norm(ax);
    const [u, v] = frame(d);
    for (let i = 0; i < m; i++) {
      const t = rnd();
      const a = rnd() * Math.PI * 2;
      const r = sg.ra + (sg.rb - sg.ra) * t;
      let p = add(add(sg.a, mul(ax, t)), add(mul(u, Math.cos(a) * r), mul(v, Math.sin(a) * r)));
      if (sg.cap && i % 5 === 0) {
        // Rounded fingertip: a hemisphere at the end of the distal phalanx.
        const h = rnd();
        const rr = sg.rb * Math.sqrt(1 - h * h);
        p = add(add(sg.b, mul(d, h * sg.rb)), add(mul(u, Math.cos(a) * rr), mul(v, Math.sin(a) * rr)));
      }
      push(p, sg.finger, sg.seg);
      if (sg.finger === 1 && sg.cap) {
        const proj = (p[0] - sg.a[0]) * d[0] + (p[1] - sg.a[1]) * d[1] + (p[2] - sg.a[2]) * d[2];
        if (proj > best) { best = proj; tip = seed.length - 1; }
      }
    }
  });
  const P = Float32Array.from(pos);
  // Wire within a finger, or between the palm and a finger's first phalanx only,
  // so curled fingers never web onto the palm.
  const edges = knnEdges(P, seed.length, 3, (i, j) => finger[i] === finger[j] || (finger[i] === 0 && segOf[j] === 0) || (finger[j] === 0 && segOf[i] === 0));
  return finish(pos, seed, edges, tip);
}

/** Mechanical hand: hexagonal wire prisms per phalanx, joint hubs, a palm plate, tendons. */
export function robotHand(): HandLayout {
  const segs = skeleton();
  const pos: number[] = [], seed: number[] = [], e: number[] = [];
  const node = (p: V, size: number) => {
    pos.push(...p);
    seed.push(size);
    return seed.length - 1;
  };
  const link = (a: number, b: number) => e.push(a, b);

  // Palm plate: a grid on the back face, corners on the palm face.
  const cols = 5, rows = 4, top: number[][] = [];
  for (let c = 0; c < cols; c++) {
    top[c] = [];
    const x = (c / (cols - 1)) * PALM.len;
    const w = palmHalfWidth(x);
    for (let r = 0; r < rows; r++) top[c][r] = node([x, -w + (2 * w * r) / (rows - 1), PALM.thick], c === cols - 1 ? 0.75 : 0.3);
  }
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if (c < cols - 1) link(top[c][r], top[c + 1][r]);
    if (r < rows - 1) link(top[c][r], top[c][r + 1]);
  }
  const bottom = [[0, -1], [0, 1], [1, -1], [1, 1]].map(([c, s]) => {
    const x = c * PALM.len, w = palmHalfWidth(x);
    return node([x, s * w, -PALM.thick], 0.3);
  });
  link(bottom[0], bottom[1]); link(bottom[2], bottom[3]); link(bottom[0], bottom[2]); link(bottom[1], bottom[3]);
  link(bottom[0], top[0][0]); link(bottom[1], top[0][rows - 1]); link(bottom[2], top[cols - 1][0]); link(bottom[3], top[cols - 1][rows - 1]);

  // Wrist collar (fades out in the shader) and tendons from it to each knuckle.
  const collar: number[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    collar.push(node([-0.38, Math.cos(a) * 0.28, Math.sin(a) * 0.12], 0.3));
  }
  collar.forEach((c, k) => link(c, collar[(k + 1) % 8]));
  for (let r = 0; r < rows; r++) link(collar[[0, 1, 7, 6][r]], top[0][r]);

  let tip = 0;
  const hubs = new Map<string, number>();
  const hub = (p: V) => {
    const key = p.map((v) => v.toFixed(3)).join();
    let h = hubs.get(key);
    if (h === undefined) { h = node(p, 0.95); hubs.set(key, h); }
    return h;
  };
  segs.forEach((sg) => {
    const ax = sub(sg.b, sg.a), d = norm(ax);
    const [u, v] = frame(d);
    const ring = (c: V, r: number) => Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      return node(add(c, add(mul(u, Math.cos(a) * r), mul(v, Math.sin(a) * r))), 0.35);
    });
    const ra = ring(add(sg.a, mul(d, 0.035)), sg.ra * 0.95), rb = ring(add(sg.b, mul(d, -0.035)), sg.rb * 0.95);
    for (let k = 0; k < 6; k++) {
      link(ra[k], ra[(k + 1) % 6]);
      link(rb[k], rb[(k + 1) % 6]);
      link(ra[k], rb[k]);
    }
    link(ra[0], rb[3]);
    const ha = hub(sg.a), hb = hub(sg.b);
    link(ha, ra[0]); link(ha, ra[3]);
    link(hb, rb[0]); link(hb, rb[3]);
    if (sg.cap) {
      const t = node(add(sg.b, mul(d, sg.rb * 0.9)), 0.7);
      for (let k = 0; k < 6; k += 2) link(t, rb[k]);
      link(hb, t);
      if (sg.finger === 1) tip = t;
    }
    if (sg.seg === 0) {
      // Knuckle hubs bolt onto the plate's front edge; the thumb onto its side.
      if (sg.finger === 5) link(ha, top[1][rows - 1]);
      else {
        const r = Math.round(((sg.a[1] + palmHalfWidth(PALM.len)) / (2 * palmHalfWidth(PALM.len))) * (rows - 1));
        link(ha, top[cols - 1][Math.min(rows - 1, Math.max(0, r))]);
        link(collar[(sg.finger * 2) % 8], ha);
      }
    }
  });
  return finish(pos, seed, Uint32Array.from(e), tip);
}
