"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The site's skewed slash bar, tied to scroll: as it passes through the viewport it
 * rises, straightens a little and stretches from its base, like the hero slash.
 */
export function ScrollSlash({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const skewX = useTransform(scrollYProgress, [0, 0.5, 1], [-27, -22, -17]);
  const scaleY = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 1.06]);
  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={reduce ? { skewX: -22 } : { y, skewX, scaleY, transformOrigin: "50% 100%" }}
      className={`pointer-events-none rounded-[clamp(10px,1vw,18px)] bg-[linear-gradient(180deg,var(--color-brand),var(--color-royal))] ${className}`}
    />
  );
}
