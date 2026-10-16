// Node layouts for the thinking system. Generated once per mount.

export type Layout = {
  n: number;
  brain: Float32Array; // xyz per node
  net: Float32Array; // xyz per node
  seed: Float32Array;
  layer: Uint8Array;
  brainEdges: Uint32Array; // pairs
  netEdges: Uint32Array; // pairs (lower layer first, so pulses flow forward)
};

const LAYERS = 6;
const LAYER_W = [0.13, 0.2, 0.22, 0.2, 0.15, 0.1];

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
  const maxM = Math.max(...members.map((m) => m.length));
  const discPos: number[][][] = [];
  members.forEach((m, l) => {
    const R = 0.32 + 0.72 * Math.sqrt(m.length / maxM);
    const pts = m.map((_, k) => {
      const r = R * Math.sqrt((k + 0.5) / m.length), a = k * 2.39996323;
      return [r * Math.cos(a), r * Math.sin(a), Math.atan2(Math.sin(a), Math.cos(a))];
    });
    // Coherent morph: match nodes and disc slots by angle.
    const byNode = [...m].sort((a, b) => Math.atan2(brain[a * 3 + 1], brain[a * 3]) - Math.atan2(brain[b * 3 + 1], brain[b * 3]));
    const bySlot = [...pts.keys()].sort((a, b) => pts[a][2] - pts[b][2]);
    const x = -1.35 + (l * 2.7) / (LAYERS - 1);
    const slots: number[][] = [];
    byNode.forEach((idx, k) => {
      const [py, pz] = pts[bySlot[k]];
      net.set([x, py, pz], idx * 3);
      slots.push([idx, py, pz]);
    });
    discPos[l] = slots;
  });

  // Brain edges: 3 nearest neighbours.
  const bset = new Set<number>();
  const be: number[] = [];
  for (let i = 0; i < n; i++) {
    const best: [number, number][] = [];
    const ix = brain[i * 3], iy = brain[i * 3 + 1], iz = brain[i * 3 + 2];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = brain[j * 3] - ix, dy = brain[j * 3 + 1] - iy, dz = brain[j * 3 + 2] - iz;
      const d = dx * dx + dy * dy + dz * dz;
      if (best.length < 3) { best.push([d, j]); best.sort((a, b) => a[0] - b[0]); }
      else if (d < best[2][0]) { best[2] = [d, j]; best.sort((a, b) => a[0] - b[0]); }
    }
    for (const [, j] of best) {
      const key = i < j ? i * n + j : j * n + i;
      if (!bset.has(key)) { bset.add(key); be.push(i, j); }
    }
  }

  // Network edges: each node to its nearest slot in the next layer (30% get a second).
  const ne: number[] = [];
  for (let l = 0; l < LAYERS - 1; l++) {
    const next = discPos[l + 1];
    for (const [i, y, z] of discPos[l]) {
      const best = next
        .map(([j, ny, nz]) => [(ny - y) ** 2 + (nz - z) ** 2 + rnd() * 0.05, j] as [number, number])
        .sort((a, b) => a[0] - b[0])
        .slice(0, rnd() < 0.3 ? 2 : 1);
      for (const [, j] of best) ne.push(i, j);
    }
  }

  return { n, brain, net, seed, layer, brainEdges: Uint32Array.from(be), netEdges: Uint32Array.from(ne) };
}
