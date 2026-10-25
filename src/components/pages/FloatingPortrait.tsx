"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

// Overdamped, so the card trails the cursor and settles without overshooting.
const FOLLOW = { stiffness: 320, damping: 34, mass: 0.6 };
const GAP = 28;

/**
 * Floats the portrait of whichever [data-face] element the mouse is over. The card parks just left of
 * the hovered name (the names run down the right of the page, so it never covers one), rides the
 * cursor vertically and drifts only slightly sideways, and stays inside the viewport. Mouse only:
 * touch has no hover.
 */
export function FloatingPortrait({ children }: { children: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const [face, setFace] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, FOLLOW), sy = useSpring(y, FOLLOW);

  useEffect(() => {
    setMounted(true);
    // Warm the portraits so the first hover never shows an empty card.
    host.current?.querySelectorAll<HTMLElement>("[data-face]").forEach((el) => {
      const img = new Image();
      img.src = el.dataset.face!;
    });
  }, []);

  const place = (cx: number, cy: number, anchor: Element, jump: boolean) => {
    const w = card.current?.offsetWidth ?? 200, h = card.current?.offsetHeight ?? 250;
    const a = anchor.getBoundingClientRect();
    let left = a.left - GAP - w + (cx - a.left) * 0.06;
    if (left < 12) left = a.right + GAP;
    const top = Math.min(Math.max(cy - h / 2, 12), innerHeight - h - 12);
    x.set(left);
    y.set(top);
    if (jump || reduce) {
      sx.jump(left);
      sy.jump(top);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = (e.target as Element).closest<HTMLElement>("[data-face]");
    const src = el?.dataset.face ?? null;
    // Off a name the card holds still while it fades, rather than chasing the cursor.
    if (el) place(e.clientX, e.clientY, el, face === null);
    if (src !== face) setFace(src);
  };
  const hide = () => setFace(null);

  return (
    <div ref={host} onPointerMove={onMove} onPointerLeave={hide} onWheel={hide}>
      {children}
      {mounted &&
        createPortal(
          <motion.div
            ref={card}
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-40 aspect-[4/5] w-[clamp(160px,12vw,210px)] overflow-hidden rounded-[var(--radius-m)] bg-gray shadow-[0_30px_60px_-24px_rgb(8_28_56/0.45)] ring-1 ring-ink/10"
            style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
            initial={false}
            animate={face ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduce ? 1 : 0.94 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence initial={false}>
              {face && (
                <motion.img
                  key={face}
                  src={face}
                  alt=""
                  className="absolute inset-0 size-full object-cover object-top"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
