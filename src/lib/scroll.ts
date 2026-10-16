import type Lenis from "lenis";

// Module-level handle so RAF loops can read the smoothed scroll without React state.
let instance: Lenis | null = null;
let locks = 0;

const apply = () => {
  const on = locks > 0;
  document.documentElement.classList.toggle("is-locked", on);
  if (instance) (on ? instance.stop() : instance.start());
};

export const setLenis = (l: Lenis | null) => {
  instance = l;
  if (l && locks > 0) l.stop();
};
export const getLenis = () => instance;

/**
 * Ref-counted scroll lock. Each owner (loader, menu, takeover) holds its own
 * token, so one releasing never unlocks the page under another.
 */
export const acquireScrollLock = () => {
  locks++;
  apply();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    apply();
  };
};

export const scrollToTarget = (target: string | number | HTMLElement, immediate = false) => {
  if (instance) instance.scrollTo(target as never, { immediate, duration: 1.4 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
};
