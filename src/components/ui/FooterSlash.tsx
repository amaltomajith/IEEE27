"use client";

import { useEffect, useRef } from "react";

/** Big skewed slash that springs toward the cursor and drifts and straightens with scroll. */
export function FooterSlash() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, visible = false;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 600));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 400));
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      vx = (vx + (tx - x) * 0.06) * 0.84;
      vy = (vy + (ty - y) * 0.06) * 0.84;
      x += vx;
      y += vy;
      // Scroll term: -1 when the bar's centre is a viewport below centre, +1 above.
      const r = el.getBoundingClientRect();
      const s = Math.max(-1.5, Math.min(1.5, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      el.style.transform = `translate3d(${x * 40}px, ${y * 18 + s * 80}px, 0) skewX(${-22 + x * 6 + s * 5}deg) rotate(${x * 2}deg)`;
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -top-[18%] right-[12%] h-[136%] w-[clamp(60px,7vw,120px)] -skew-x-[22deg] rounded-[clamp(10px,1.2vw,22px)] bg-[linear-gradient(180deg,var(--color-brand),var(--color-royal))]"
    />
  );
}
