"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetic hover: the element leans up to ±5/4px toward the cursor.
 * Writes only --tx/--ty; the CSS composes them with --press so the
 * :active scale (press feedback) is never overridden by an inline transform.
 */
export function useMagnetic<T extends HTMLElement>(strength = 1) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty("--tx", `${(dx * 5 * strength).toFixed(2)}px`);
      el.style.setProperty("--ty", `${(dy * 4 * strength).toFixed(2)}px`);
    };
    const leave = () => {
      el.style.removeProperty("--tx");
      el.style.removeProperty("--ty");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return ref;
}
