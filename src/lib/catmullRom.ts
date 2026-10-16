export type Pt = [number, number];

const td = (a: Pt, b: Pt) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-3, 0.5);
const L = (a: Pt, b: Pt, ta: number, tb: number, tt: number): Pt => [
  (a[0] * (tb - tt)) / (tb - ta) + (b[0] * (tt - ta)) / (tb - ta),
  (a[1] * (tb - tt)) / (tb - ta) + (b[1] * (tt - ta)) / (tb - ta),
];

/** Centripetal Catmull-Rom point between p1 and p2 at t in [0, 1]. */
export const centripetal = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t1 = td(p0, p1);
  const t2 = t1 + td(p1, p2);
  const t3 = t2 + td(p2, p3);
  const tt = t1 + (t2 - t1) * t;
  const A1 = L(p0, p1, 0, t1, tt);
  const A2 = L(p1, p2, t1, t2, tt);
  const A3 = L(p2, p3, t2, t3, tt);
  return L(L(A1, A2, 0, t2, tt), L(A2, A3, t1, t3, tt), t1, t2, tt);
};

/**
 * Resamples keypoints into `n` points. The first keypoint is a direction hint
 * only, so the output starts at P[1] (matching the reference `build()`).
 */
export const samplePath = (P: Pt[], n: number): Pt[] => {
  const segs = P.length - 2;
  const per = (n - 1) / segs;
  const out: Pt[] = [P[1]];
  for (let k = 1; k < n; k++) {
    const g = k / per;
    const si = Math.min(segs - 1, Math.floor(g));
    const t = Math.min(1, g - si);
    const p0 = P[si];
    const p1 = P[si + 1];
    const p2 = P[Math.min(P.length - 1, si + 2)];
    let p3 = P[Math.min(P.length - 1, si + 3)];
    if (p3 === p2) p3 = [p2[0] + (p2[0] - p1[0]) * 0.01, p2[1] + (p2[1] - p1[1]) * 0.01];
    out.push(centripetal(p0, p1, p2, p3, t));
  }
  return out;
};

/** Densely samples a spline through all keypoints (endpoints act as hints). */
export const denseSpline = (K: Pt[], step = 12): Pt[] => {
  const P: Pt[] = [];
  for (let i = 1; i < K.length - 2; i++) {
    const p0 = K[i - 1], p1 = K[i], p2 = K[i + 1], p3 = K[i + 2];
    const n = Math.max(6, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < n; j++) P.push(centripetal(p0, p1, p2, p3, j / n));
  }
  P.push(K[K.length - 2]);
  return P;
};
