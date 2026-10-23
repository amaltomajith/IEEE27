// Node layouts for the thinking system. Generated once per mount.

import { buildAdj, type Adj } from "./cascade";

export type Layout = {
  n: number;
  brain: Float32Array; // xyz per node
  net: Float32Array; // xyz per node
  seed: Float32Array;
  layer: Uint8Array;
  brainEdges: Uint32Array; // pairs
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

// Network view: neurons per layer. Every neuron is drawn as a small ring of nodes
// (its core node in the middle), and adjacent layers are fully connected, so it
// reads like a textbook neural-network diagram.
const NEURONS = [6, 9, 11, 11, 8, 4];
const LAYERS = NEURONS.length;
const TOTAL = NEURONS.reduce((a, b) => a + b, 0);
const LAYER_W = NEURONS.map((m) => m / TOTAL);

const rnd = (() => {
  let s = 20270302;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
})();

/** Brain: two hemispheres (cortex-biased shell with folds), cerebellum, stem. z = front/back. */
function brainPoint(): [number, number, number] {
  for (;;) {
    const u = rnd();
    if (u < 0.08) {
      // cerebellum, back-bottom
      const x = (rnd() * 2 - 1) * 0.55, y = (rnd() * 2 - 1) * 0.26, z = (rnd() * 2 - 1) * 0.3;
      if ((x / 0.55) ** 2 + (y / 0.26) ** 2 + (z / 0.3) ** 2 > 1) continue;
      return [x, y - 0.58, z - 0.7];
    }
    if (u < 0.1) {
      const t = rnd();
      return [(rnd() - 0.5) * 0.14, -0.45 - t * 0.55, -0.32 - t * 0.12 + (rnd() - 0.5) * 0.1];
    }
    const side = rnd() < 0.5 ? -1 : 1;
    const rx = 0.62, ry = 0.74, rz = 1.05, cx = side * 0.42;
    const x = cx + (rnd() * 2 - 1) * rx, y = (rnd() * 2 - 1) * ry, z = (rnd() * 2 - 1) * rz;
    const e = ((x - cx) / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2;
    if (e > 1) continue;
    if (Math.abs(x) < 0.06) continue; // longitudinal fissure
    if (y < -0.45 && z < -0.3) continue; // leave room for the cerebellum
    if (e < 0.55 && rnd() > 0.16) continue; // bias toward the cortex shell
    // gyri: radial ripples
    const fold = 1 + 0.045 * Math.sin(z * 11 + y * 4) * Math.sin(y * 9 - x * 3);
    return [cx + (x - cx) * fold, y * fold + 0.05, z * fold];
  }
}

export function buildLayout(n: number): Layout {
  const brain = new Float32Array(n * 3), net = new Float32Array(n * 3), seed = new Float32Array(n), layer = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const [x, y, z] = brainPoint();
    brain.set([x, y, z], i * 3);
    seed[i] = rnd();
  }

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
  const maxN = Math.max(...NEURONS);
  const gap = Math.min(0.24, 1.95 / (maxN - 1));
  members.forEach((m, l) => {
    const x = -1.6 + (l * 3.2) / (LAYERS - 1);
    const count = NEURONS[l];
    // Coherent morph: top of the brain goes to the top neuron, and so on down.
    const byY = [...m].sort((a, b) => brain[b * 3 + 1] - brain[a * 3 + 1]);
    cores[l] = [];
    for (let j = 0; j < count; j++) {
      const chunk = byY.slice(Math.floor((j * byY.length) / count), Math.floor(((j + 1) * byY.length) / count));
      if (!chunk.length) continue;
      const y = ((count - 1) / 2 - j) * gap;
      // Ring order follows the nodes' angle in the brain so they slide, not cross.
      chunk.sort((a, b) => Math.atan2(brain[a * 3 + 2], brain[a * 3]) - Math.atan2(brain[b * 3 + 2], brain[b * 3]));
      const c = chunk[0];
      cores[l].push(c);
      const r = 0.062;
      chunk.forEach((idx, k) => {
        core[idx] = c;
        if (k === 0) net.set([x, y, 0], idx * 3);
        else {
          const ang = ((k - 1) / (chunk.length - 1)) * Math.PI * 2;
          net.set([x + Math.cos(ang) * r, y + Math.sin(ang) * r, 0], idx * 3);
        }
      });
    }
  });

  // Brain edges: 3 nearest neighbours.
  const brainEdges = knnEdges(brain, n, 3);

  // Network edges: every neuron to every neuron in the next layer (core to core).
  const ne: number[] = [];
  for (let l = 0; l < LAYERS - 1; l++) for (const i of cores[l]) for (const j of cores[l + 1]) ne.push(i, j);

  const netEdges = Uint32Array.from(ne);
  return { n, brain, net, seed, layer, brainEdges, netEdges, brainAdj: buildAdj(brainEdges, n), netAdj: buildAdj(netEdges, n, true), core, inputs: cores[0] };
}
