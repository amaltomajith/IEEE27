// Signal propagation over a node graph, shared by the brain card and the hands.
// A cascade walks the graph breadth-first from one node and writes, per edge, the
// time a pulse starts down it (and which way), and per node the time it arrives.
// The shaders turn those times into travelling pulse heads, flashes and afterglow.

/** CSR adjacency. For node u, entries start[u]..start[u+1] list neighbour, edge id and direction. */
export type Adj = {
  start: Uint32Array;
  nbr: Uint32Array;
  edge: Uint32Array;
  /** 1 when travelling u -> nbr runs from the edge's first vertex to its second. */
  fwd: Uint8Array;
};

export function buildAdj(pairs: Uint32Array, n: number, directed = false): Adj {
  const m = pairs.length / 2;
  const deg = new Uint32Array(n + 1);
  for (let e = 0; e < m; e++) {
    deg[pairs[e * 2]]++;
    if (!directed) deg[pairs[e * 2 + 1]]++;
  }
  const start = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
  const fill = start.slice(0, n);
  const total = start[n];
  const nbr = new Uint32Array(total), edge = new Uint32Array(total), fwd = new Uint8Array(total);
  const put = (u: number, v: number, e: number, f: number) => {
    const k = fill[u]++;
    nbr[k] = v;
    edge[k] = e;
    fwd[k] = f;
  };
  for (let e = 0; e < m; e++) {
    const a = pairs[e * 2], b = pairs[e * 2 + 1];
    put(a, b, e, 1);
    if (!directed) put(b, a, e, 0);
  }
  return { start, nbr, edge, fwd };
}

/** Per-vertex attribute arrays the cascade writes into (edges have 2 vertices each). */
export type PulseTarget = { fire: Float32Array; dir: Float32Array; hit: Float32Array };

type Opts = {
  /** Seconds per hop; 0 lights the whole path at once (reduced motion). */
  hop: number;
  maxDepth: number;
  /** Chance of following each extra branch past depth 1 (1 = flood). */
  branch?: number;
  /** Stop after this many nodes. */
  cap?: number;
};

const EXPIRED = 2.4;

/** Walk from `from`, schedule pulses starting at `t0`. Returns the nodes reached, in order. */
export function cascade(adj: Adj, n: number, from: number, t0: number, out: PulseTarget, o: Opts) {
  const { hop, maxDepth, branch = 1, cap = Infinity } = o;
  const depth = new Int16Array(n).fill(-1);
  const at = new Float32Array(n);
  const queue = [from];
  depth[from] = 0;
  at[from] = t0;
  const take = (arr: Float32Array, i: number, t: number) => {
    // Only overwrite a pulse that has finished, or one this cascade beats.
    if (arr[i] < t - EXPIRED || arr[i] > t) arr[i] = t;
  };
  take(out.hit, from, t0);
  for (let q = 0; q < queue.length && queue.length < cap; q++) {
    const u = queue[q], d = depth[u];
    if (d >= maxDepth) continue;
    let followed = 0;
    for (let k = adj.start[u]; k < adj.start[u + 1]; k++) {
      const v = adj.nbr[k];
      if (depth[v] >= 0) continue;
      if (d > 0 && followed > 0 && Math.random() > branch) continue;
      followed++;
      depth[v] = d + 1;
      const t = at[u] + hop * (0.75 + Math.random() * 0.5);
      at[v] = t;
      const e = adj.edge[k];
      const before = out.fire[e * 2];
      take(out.fire, e * 2, at[u]);
      if (out.fire[e * 2] !== before || before === at[u]) {
        out.fire[e * 2 + 1] = out.fire[e * 2];
        out.dir[e * 2] = out.dir[e * 2 + 1] = adj.fwd[k];
      }
      take(out.hit, v, t);
      queue.push(v);
      if (queue.length >= cap) break;
    }
  }
  return queue;
}
