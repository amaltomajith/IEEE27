"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "@/lib/frame";

const GAP = 26;

/**
 * Magnetic dot field: a grid of dots that bends away from the cursor like iron
 * filings around a magnet, brightening to signal near the pointer. 2D canvas,
 * runs on the shared frame loop, sleeps when settled or off screen.
 */
export function Field({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current!, canvas = cv.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover)").matches;
    let W = 0, H = 0, dpr = 1, cols = 0, rows = 0;
    let ox: Float32Array, oy: Float32Array, vx: Float32Array, vy: Float32Array;
    let mx = -9999, my = -9999, active = false, visible = true, dirty = true, energy = 0;

    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cols = Math.ceil(W / GAP) + 1;
      rows = Math.ceil(H / GAP) + 1;
      const n = cols * rows;
      ox = new Float32Array(n); oy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      active = true;
      dirty = true;
    };
    const leave = () => { active = false; dirty = true; };
    if (fine && !reduce) {
      addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = 150, R2 = R * R;
      energy = 0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const bx = i * GAP + ((j & 1) ? GAP / 2 : 0), by = j * GAP;
          let fx = 0, fy = 0, near = 0;
          if (active) {
            const dx = bx + ox[k] - mx, dy = by + oy[k] - my, d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1, f = (1 - d / R);
              near = f;
              fx = (dx / d) * f * f * 22;
              fy = (dy / d) * f * f * 22;
            }
          }
          if (!reduce) {
            vx[k] = (vx[k] + (fx - ox[k]) * 0.12) * 0.78;
            vy[k] = (vy[k] + (fy - oy[k]) * 0.12) * 0.78;
            ox[k] += vx[k];
            oy[k] += vy[k];
            energy += Math.abs(vx[k]) + Math.abs(vy[k]);
          }
          const x = bx + ox[k], y = by + oy[k];
          const fade = Math.min(1, Math.max(0, 1.15 - y / H));
          const a = (0.16 + near * 0.6) * fade;
          if (a < 0.02) continue;
          ctx.fillStyle = near > 0.05 ? `rgba(14,156,144,${a})` : `rgba(10,33,41,${a * 0.7})`;
          const s = 1.3 + near * 1.6;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
    };

    const off = onFrame(() => {
      if (!visible) return;
      if (!dirty && energy < 0.05) return;
      dirty = false;
      draw();
    });
    return () => {
      off();
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="field-glow" />
      <canvas ref={cv} className="absolute inset-0 size-full [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
    </div>
  );
}
