// Node layouts for the thinking system. Generated once per mount.

import { buildAdj, type Adj } from "./cascade";

export type Layout = {
  n: number;
  brain: Float32Array; // xyz per node
  net: Float32Array; // xyz per node
  seed: Float32Array;
  layer: Uint8Array;
  brainEdges: Uint32Array; // pairs
  /** Per brain edge: 0 = fold stroke (gyri, folia), 1 = mesh link. */
  brainEdgeKind: Uint8Array;
  netEdges: Uint32Array; // pairs (lower layer first, so pulses flow forward)
  brainAdj: Adj;
  netAdj: Adj; // directed: forward only
  /** Network view: the neuron each node belongs to, as that neuron's core node index. */
  core: Int32Array;
  /** Core nodes of the input layer (where forward passes start). */
  inputs: number[];
};

/**
 * k nearest neighbours for every point, deduplicated into edge pairs.
 * `allow` can veto a pair (e.g. to keep two fingers from wiring together).
 */
export function knnEdges(pos: Float32Array, n: number, k: number, allow?: (i: number, j: number) => boolean) {
  const seen = new Set<number>();
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const best: [number, number][] = [];
    const ix = pos[i * 3], iy = pos[i * 3 + 1], iz = pos[i * 3 + 2];
    for (let j = 0; j < n; j++) {
      if (i === j || (allow && !allow(i, j))) continue;
      const dx = pos[j * 3] - ix, dy = pos[j * 3 + 1] - iy, dz = pos[j * 3 + 2] - iz;
      const d = dx * dx + dy * dy + dz * dz;
      if (best.length < k) { best.push([d, j]); best.sort((a, b) => a[0] - b[0]); }
      else if (d < best[k - 1][0]) { best[k - 1] = [d, j]; best.sort((a, b) => a[0] - b[0]); }
    }
    for (const [, j] of best) {
      const key = i < j ? i * n + j : j * n + i;
      if (!seen.has(key)) { seen.add(key); out.push(i, j); }
    }
  }
  return Uint32Array.from(out);
}

// Network view: neurons per layer, each layer a grid (rows in y, columns in z) so the network has
// depth. Every neuron is a small ball of nodes around its core node; adjacent layers are fully
// connected core to core.
const GRIDS: [number, number][] = [[3, 2], [3, 3], [4, 3], [4, 3], [3, 3], [2, 2]];
const LAYERS = GRIDS.length;
const NEURONS = GRIDS.map(([r, c]) => r * c);
const TOTAL = NEURONS.reduce((a, b) => a + b, 0);
const LAYER_W = NEURONS.map((m) => m / TOTAL);
const GAP_Y = 0.42, GAP_Z = 0.3;

const rnd = (() => {
  let s = 20270302;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
})();

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type V = [number, number, number];
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const grad = (f: (x: number, y: number, z: number) => number, p: V): V => {
  const e = 1e-3;
  return [
    (f(p[0] + e, p[1], p[2]) - f(p[0] - e, p[1], p[2])) / (2 * e),
    (f(p[0], p[1] + e, p[2]) - f(p[0], p[1] - e, p[2])) / (2 * e),
    (f(p[0], p[1], p[2] + e) - f(p[0], p[1], p[2] - e)) / (2 * e),
  ];
};

/**
 * Cortex of one hemisphere as an implicit volume (< 1 inside): a cerebrum that is rounder at the
 * front, tapers to the occipital pole and is flatter underneath, joined by a temporal lobe that hangs
 * low at the front-side. x = left/right, y = up, z = front.
 */
function hemi(x: number, y: number, z: number, side: number) {
  const cx = side * 0.4, rz = 1.08;
  const back = smooth(0.1, 1, -z / rz), front = smooth(0.55, 1, z / rz);
  const ry = 0.7 * (1 - 0.24 * back) * (1 - 0.1 * front);
  const rx = 0.52 * (1 - 0.18 * back);
  const dy = y - 0.1;
  const cer = ((x - cx) / rx) ** 2 + ((dy < 0 ? dy * 1.35 : dy) / ry) ** 2 + (z / rz) ** 2;
  const tem = ((x - side * 0.47) / 0.34) ** 2 + ((y + 0.34) / 0.25) ** 2 + ((z - 0.14) / 0.6) ** 2;
  return Math.min(cer, tem);
}
const hemiOf = (side: number) => (x: number, y: number, z: number) => hemi(x, y, z, side);

/** Height of the lateral (Sylvian) fissure along the temporal lobe. */
const sylvianY = (z: number) => -0.15 - 0.16 * (z - 0.1);
const inSylvian = (p: V) => p[2] > -0.38 && p[2] < 0.74 && Math.abs(p[0]) > 0.3 && Math.abs(p[1] - sylvianY(p[2])) < 0.045;

type Field = (x: number, y: number, z: number) => number;

/**
 * Main sulci, laid out by lobe the way the cortex is: grooves run front to back across the frontal
 * lobe, upright over the central and parietal region, and front to back again in the temporal lobe
 * under the lateral fissure, each meandering. Zero lines are traced as strokes.
 */
const fold: Field = (x, y, z) => {
  const frontal = smooth(0.18, 0.55, z), temporal = smooth(0.02, -0.1, y - sylvianY(z));
  const w = Math.max(frontal, temporal);
  const phi = (1 - w) * z + w * y * 1.15;
  return Math.sin(11.5 * phi + 1.9 * Math.sin(3.4 * (y + z) + 2 * x) + 0.9 * Math.sin(6.8 * y - 2.6 * z + 1.7 * x) + 0.35 * Math.sin(13 * (y - z) + 3 * x));
};

/** Short side branches between the main sulci, drawn only in scattered patches (see branchOk). */
const branch: Field = (x, y, z) => Math.sin(15 * (0.75 * y - 0.65 * z) + 1.4 * Math.sin(5.4 * x + 4.6 * z));
const branchOk = (p: V) => Math.sin(5.1 * p[0] + 4.3 * p[1] + 6.2 * p[2]) + Math.sin(4.7 * p[1] - 5.6 * p[2]) > 0.5 && Math.abs(fold(p[0], p[1], p[2])) > 0.4;

/** Pull a point onto a hemisphere's surface (Newton steps on the implicit). */
function toSurface(p: V, side: number, iters = 6): V {
  const f = hemiOf(side);
  for (let i = 0; i < iters; i++) {
    const g = grad(f, p), h = f(p[0], p[1], p[2]) - 1;
    p = add(p, g, -h / (dot(g, g) || 1));
  }
  return p;
}

/** Slide a surface point along the surface onto the nearest zero line of a field. */
function toSulcus(p: V, side: number, field: Field): V {
  for (let i = 0; i < 4; i++) {
    const n = unit(grad(hemiOf(side), p)), g = grad(field, p);
    const gt = add(g, n, -dot(g, n));
    p = toSurface(add(p, gt, -field(p[0], p[1], p[2]) / (dot(gt, gt) || 1)), side, i === 3 ? 4 : 2);
  }
  return p;
}

/** Where the cortex may be drawn: its own side of the midline, clear of the cerebellum, on the surface. */
const cortexOk = (p: V, side: number) => side * p[0] > 0.07 && !(p[1] < -0.4 && p[2] < -0.3) && Math.abs(hemi(p[0], p[1], p[2], side) - 1) < 0.02;

/** Index grid over a point list, for neighbour queries. */
class Grid {
  private cells = new Map<string, number[]>();
  constructor(private pts: V[], private size: number) {
    pts.forEach((p, i) => {
      const k = this.key(p);
      let cell = this.cells.get(k);
      if (!cell) this.cells.set(k, (cell = []));
      cell.push(i);
    });
  }
  private key(p: V) {
    return `${Math.floor(p[0] / this.size)},${Math.floor(p[1] / this.size)},${Math.floor(p[2] / this.size)}`;
  }
  /** Indices within r of p (r <= cell size). */
  around(p: V, r: number) {
    const s = this.size, cx = Math.floor(p[0] / s), cy = Math.floor(p[1] / s), cz = Math.floor(p[2] / s), out: number[] = [];
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++)
        for (let k = -1; k <= 1; k++) for (const q of this.cells.get(`${cx + i},${cy + j},${cz + k}`) ?? []) if (dist(p, this.pts[q]) < r) out.push(q);
    return out;
  }
}

/**
 * The sulci of one hemisphere as polylines: scatter points over the surface and slide each onto its
 * nearest sulcus, so the grooves are densely covered, then walk them into continuous chains (keeping
 * direction, so a chain follows its groove instead of hopping to the next one) and smooth them.
 */
function sulci(side: number, samples: number, field: Field, ok: (p: V) => boolean = () => true, minLen = 6): V[][] {
  const band: V[] = [];
  for (let k = 0; k < samples; k++) {
    const p = toSulcus(toSurface([side * (0.08 + rnd() * 0.86), -0.62 + rnd() * 1.42, (rnd() * 2 - 1) * 1.1], side), side, field);
    if (cortexOk(p, side) && !inSylvian(p) && Math.abs(field(p[0], p[1], p[2])) < 0.02 && ok(p)) band.push(p);
  }
  const R = 0.05, THIN = 0.02;
  const grid = new Grid(band, R), seen = new Uint8Array(band.length);
  const claim = (i: number) => grid.around(band[i], THIN).forEach((j) => (seen[j] = 1));
  const lines: V[][] = [];
  for (const start of band.map((_, i) => i).sort(() => rnd() - 0.5)) {
    if (seen[start]) continue;
    claim(start);
    const halves: V[][] = [];
    let first: V | null = null;
    for (const dir of [1, -1]) {
      const out: V[] = [];
      let cur = start, heading: V | null = first ? [-first[0], -first[1], -first[2]] : null;
      for (;;) {
        let best = -1, bd = Infinity;
        for (const j of grid.around(band[cur], R)) {
          if (seen[j]) continue;
          const d = dist(band[cur], band[j]), u = unit(add(band[j], band[cur], -1));
          if (heading && dot(u, heading) < 0.82) continue;
          if (d < bd) { bd = d; best = j; }
        }
        if (best < 0) break;
        heading = unit(add(band[best], band[cur], -1));
        if (dir === 1 && !first) first = heading;
        claim(best);
        out.push(band[best]);
        cur = best;
      }
      halves.push(out);
    }
    const line = [...halves[1].reverse(), band[start], ...halves[0]];
    // Split at any sharp corner (where a walk jumped grooves), so every stroke is one smooth groove.
    const pieces: V[][] = [[line[0]]];
    for (let i = 1; i < line.length; i++) {
      const cur = pieces[pieces.length - 1];
      if (i >= 2 && dot(unit(add(line[i], line[i - 1], -1)), unit(add(line[i - 1], line[i - 2], -1))) < 0.7) pieces.push([line[i - 1], line[i]]);
      else cur.push(line[i]);
    }
    for (const piece of pieces) {
      if (piece.length < minLen) continue;
      // Smooth the walk, then settle it back on the surface.
      let sm = piece;
      for (let pass = 0; pass < 8; pass++) sm = sm.map((q, i) => (i === 0 || i === sm.length - 1 ? q : add(add(q, sm[i - 1], 0.5), sm[i + 1], 0.5).map((v) => v / 2) as V));
      lines.push(sm.map((q) => toSurface(q, side)));
    }
  }
  return lines;
}

/** The surface edge of a hemisphere above or below (x, z): bisect along y from inside the cortex. */
function edge(side: number, x: number, z: number, up: boolean): V | null {
  let a = 0.1, b = up ? 1.05 : -0.95;
  if (hemi(x, a, z, side) >= 1 || hemi(x, b, z, side) < 1) return null;
  for (let i = 0; i < 22; i++) {
    const m = (a + b) / 2;
    if (hemi(x, m, z, side) < 1) a = m;
    else b = m;
  }
  return [x, (a + b) / 2, z];
}

/** Rims that give each hemisphere a clean outline: the top edge along the midline and the lower margin. */
function rims(side: number): V[][] {
  const out: V[][] = [];
  for (const [x, up] of [[side * 0.09, true], [side * 0.46, false]] as [number, boolean][]) {
    let run: V[] = [];
    for (let z = 1.0; z > -1.0; z -= 0.015) {
      const p = edge(side, x, z, up);
      if (p && !(p[1] < -0.4 && p[2] < -0.3)) run.push(p);
      else {
        if (run.length > 4) out.push(run);
        run = [];
      }
    }
    if (run.length > 4) out.push(run);
  }
  return out;
}

/** Resample a polyline at a fixed spacing. */
function resample(line: V[], ds: number): V[] {
  const out: V[] = [line[0]];
  let need = ds;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], l = dist(a, b);
    let at = need;
    while (at <= l) {
      out.push(add(a, [b[0] - a[0], b[1] - a[1], b[2] - a[2]], at / l));
      at += ds;
    }
    need = at - l;
  }
  return out;
}

const curveLength = (line: V[]) => line.reduce((acc, p, i) => (i ? acc + dist(p, line[i - 1]) : 0), 0);

/**
 * The brain drawn as line art, the way anatomy plates draw it: the cortex as traced sulci with the
 * lateral fissure picked out, the cerebellum as stacked folia, the brainstem as a few rings and ribs,
 * and a light scatter of inner neurons for depth. Returns ordered polylines (each becomes a chain of
 * synapses) and loose points.
 */
function brainArt(n: number): { curves: V[][]; loose: V[] } {
  const curves: V[][] = [];
  const cortexBudget = Math.round(n * 0.74), cerebBudget = Math.round(n * 0.13), stemBudget = Math.round(n * 0.04);

  // Cortex: lateral fissure, outline rims, main sulci and their side branches, spaced so their nodes
  // fill the cortex budget.
  const cortex: V[][] = [];
  for (const side of [-1, 1]) {
    const raw: V[] = [];
    for (let z = 0.7; z > -0.36; z -= 0.02) raw.push(toSurface([side * 0.8, sylvianY(z) + 0.01, z], side));
    cortex.push(raw, ...rims(side), ...sulci(side, 4200, fold), ...sulci(side, 2400, branch, branchOk, 4));
  }
  const cortexLen = cortex.reduce((a, c) => a + curveLength(c), 0);
  // Never crowd a stroke: if the sulci come up short, the spare budget becomes inner neurons instead.
  const ds = Math.max(0.022, cortexLen / (cortexBudget * 0.98));
  for (const line of cortex) {
    const r = resample(line, ds);
    if (r.length >= 3) curves.push(r);
  }

  // Cerebellum: horizontal folia, skipping what sits inside the cerebrum.
  const bands = 7, folia: V[][] = [];
  for (let j = 0; j < bands; j++) {
    const y = -0.21 + (j * 0.42) / (bands - 1), s = Math.sqrt(1 - (y / 0.27) ** 2);
    const ring: V[] = [];
    for (let a = 0; a <= Math.PI * 2 + 1e-6; a += 0.04) ring.push([0.62 * s * Math.cos(a), y - 0.55, 0.34 * s * Math.sin(a) - 0.74]);
    folia.push(ring);
  }
  const foliaLen = folia.reduce((a, r) => a + curveLength(r), 0);
  for (const ring of folia) {
    let run: V[] = [];
    for (const p of resample(ring, foliaLen / cerebBudget)) {
      if (hemi(p[0], p[1], p[2], -1) < 1 || hemi(p[0], p[1], p[2], 1) < 1) {
        if (run.length > 1) curves.push(run);
        run = [];
      } else run.push(p);
    }
    if (run.length > 1) curves.push(run);
  }

  // Brainstem: rings and ribs on a short tapered tube.
  const stemAt = (t: number, a: number): V => {
    const r = 0.1 - t * 0.03;
    return [Math.cos(a) * r, -0.42 - t * 0.62, -0.3 - t * 0.16 + Math.sin(a) * r * 0.8];
  };
  const stem: V[][] = [];
  for (const t of [0.15, 0.55, 0.95]) stem.push(Array.from({ length: 25 }, (_, k) => stemAt(t, (k / 24) * Math.PI * 2)));
  for (let k = 0; k < 6; k++) stem.push(Array.from({ length: 12 }, (_, i) => stemAt(i / 11, (k / 6) * Math.PI * 2)));
  const stemLen = stem.reduce((a, r) => a + curveLength(r), 0);
  stem.forEach((line) => curves.push(resample(line, stemLen / stemBudget)));

  // Whatever budget is left: neurons inside the cortex, for depth.
  const placed = curves.reduce((a, c) => a + c.length, 0);
  const loose: V[] = [];
  while (placed + loose.length < n) {
    const side = rnd() < 0.5 ? -1 : 1;
    const p: V = [side * (0.1 + rnd() * 0.8), -0.5 + rnd() * 1.2, (rnd() * 2 - 1) * 0.95];
    if (hemi(p[0], p[1], p[2], side) < 0.7 && side * p[0] > 0.08) loose.push(p);
  }
  return { curves, loose };
}

/** Points spread evenly over a unit sphere (for the network's ball neurons). */
const fib = (k: number, m: number): [number, number, number] => {
  const y = 1 - (2 * (k + 0.5)) / m, r = Math.sqrt(1 - y * y), a = k * 2.399963;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
};

export function buildLayout(n: number): Layout {
  const brain = new Float32Array(n * 3), net = new Float32Array(n * 3), seed = new Float32Array(n), layer = new Uint8Array(n);
  // Lay the brain's strokes and loose neurons into the node arrays (exactly n).
  const art = brainArt(n);
  const curveOf = new Int32Array(n).fill(-1);
  const chain: number[] = [];
  let i = 0;
  art.curves.forEach((line, c) => {
    line.forEach((p, k) => {
      if (i >= n) return;
      brain.set(p, i * 3);
      curveOf[i] = c;
      if (k > 0 && curveOf[i - 1] === c) chain.push(i - 1, i);
      i++;
    });
  });
  for (const p of art.loose) if (i < n) brain.set(p, i++ * 3);
  for (let k = 0; k < n; k++) seed[k] = rnd();

  // Layers: front-to-back rank in the brain becomes input-to-output order.
  const order = [...Array(n).keys()].sort((a, b) => brain[b * 3 + 2] - brain[a * 3 + 2]);
  const cum: number[] = [];
  LAYER_W.reduce((acc, w) => (cum.push(acc + w), acc + w), 0);
  const members: number[][] = Array.from({ length: LAYERS }, () => []);
  order.forEach((idx, r) => {
    const l = cum.findIndex((c) => r / n < c);
    layer[idx] = l < 0 ? LAYERS - 1 : l;
    members[layer[idx]].push(idx);
  });
  const core = new Int32Array(n);
  const cores: number[][] = [];
  const slice = <T,>(a: T[], j: number, m: number) => a.slice(Math.floor((j * a.length) / m), Math.floor(((j + 1) * a.length) / m));
  members.forEach((m, l) => {
    const [rows, cols] = GRIDS[l];
    const x = -1.6 + (l * 3.2) / (LAYERS - 1);
    cores[l] = [];
    // Coherent morph: top of the brain goes to the top row, front to the front column.
    const byY = [...m].sort((a, b) => brain[b * 3 + 1] - brain[a * 3 + 1]);
    for (let r = 0; r < rows; r++) {
      const row = slice(byY, r, rows).sort((a, b) => brain[b * 3 + 2] - brain[a * 3 + 2]);
      for (let c = 0; c < cols; c++) {
        const ball = slice(row, c, cols);
        if (!ball.length) continue;
        const y = ((rows - 1) / 2 - r) * GAP_Y, z = ((cols - 1) / 2 - c) * GAP_Z;
        const k0 = ball[0];
        cores[l].push(k0);
        const rad = 0.068;
        ball.forEach((idx, k) => {
          core[idx] = k0;
          if (k === 0) net.set([x, y, z], idx * 3);
          else {
            const [sx, sy, sz] = fib(k - 1, ball.length - 1);
            net.set([x + sx * rad, y + sy * rad, z + sz * rad], idx * 3);
          }
        });
      }
    }
  });

  // Brain edges: the strokes themselves (kind 0), plus light links (kind 1) from a share of nodes to the
  // nearest node on another stroke, so a thought can jump between folds and reach the whole brain.
  const pairs: number[] = [...chain];
  const kinds: number[] = new Array(chain.length / 2).fill(0);
  const sq = (a: number, b: number) => (brain[a * 3] - brain[b * 3]) ** 2 + (brain[a * 3 + 1] - brain[b * 3 + 1]) ** 2 + (brain[a * 3 + 2] - brain[b * 3 + 2]) ** 2;
  for (let a = 0; a < n; a++) {
    const loose = curveOf[a] < 0;
    if (!loose && rnd() > 0.2) continue;
    let best = -1, bd = loose ? 0.09 : 0.045;
    for (let b = 0; b < n; b++) {
      if (b === a || (!loose && curveOf[b] === curveOf[a]) || Math.sign(brain[a * 3]) !== Math.sign(brain[b * 3])) continue;
      const d = sq(a, b);
      if (d < bd) { bd = d; best = b; }
    }
    if (best >= 0) { pairs.push(a, best); kinds.push(1); }
  }
  const brainEdges = Uint32Array.from(pairs);

  // Network edges: every neuron to every neuron in the next layer (core to core).
  const ne: number[] = [];
  for (let l = 0; l < LAYERS - 1; l++) for (const i of cores[l]) for (const j of cores[l + 1]) ne.push(i, j);

  const netEdges = Uint32Array.from(ne);
  return {
    n, brain, net, seed, layer, brainEdges, brainEdgeKind: Uint8Array.from(kinds), netEdges,
    brainAdj: buildAdj(brainEdges, n), netAdj: buildAdj(netEdges, n, true), core, inputs: cores[0],
  };
}
