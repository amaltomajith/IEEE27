// Frame-rate independent damping, ported from the reference (`mkDamp` / `mkFk`).
// `fk` is the frame factor relative to 60fps, updated once per frame by `tickFrame`.
let fk = 1;
let last = 0;

export const tickFrame = (now: number) => {
  fk = last ? Math.min(4, Math.max(0.25, (now - last) / 16.667)) : 1;
  last = now;
  return fk;
};

export const frameFactor = () => fk;

export const damp = (a: number, b: number, t: number) => a + (b - a) * (1 - Math.pow(1 - t, fk));

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
