/**
 * The resting hero slash on landscape screens, as fractions of the viewport: centre x of the width,
 * half-width and half-height of the height, slanted 22deg. The WebGL engine, the campus film beside
 * it and the static fallback all place themselves from these.
 */
export const SLASH = { x: 0.5, hx: 0.07, hy: 0.33, skewDeg: 22 } as const;

const SKEW = Math.tan((SLASH.skewDeg * Math.PI) / 180);

/**
 * Centre x of the resting slash: SLASH.x of the width, pushed right only as far as the hero's
 * [data-slash-clear] lines need to keep a gap from its leaning left edge. `cy` is the slash's
 * centre in page coordinates.
 */
export function slashX(W: number, H: number, cy: number) {
  const hy = SLASH.hy * H, gap = Math.max(32, W * 0.025), sy = scrollY;
  let x = SLASH.x * W;
  document.querySelectorAll<HTMLElement>("[data-slash-clear]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + sy, bottom = r.bottom + sy;
    if (bottom < cy - hy || top > cy + hy) return;
    // Line masks are full width blocks: the text's extent is their inner span's layout width.
    const right = r.left + ((el.firstElementChild as HTMLElement | null)?.offsetWidth ?? r.width);
    // The edge leans left going down, so the line's lower edge is the one that has to clear it.
    x = Math.max(x, right + gap + SLASH.hx * H + SKEW * (Math.min(bottom, cy + hy) - cy));
  });
  return Math.min(x, W * 0.62);
}
