"use client";

import { useId, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

// The hero ribbon's vocabulary, drawn in a 400 x 600 box. Paths start and end past
// the box so the ribbon always enters and leaves from an edge.
const SHAPES = {
  // An S-bend, like the ribbon that bends down the home hero.
  s: "M300,-60 C300,60 80,40 90,150 C100,250 320,230 330,340 C340,450 160,430 150,660",
  // Comes in from the side, loops once, leaves downward.
  hook: "M-60,120 C120,100 260,150 260,260 C260,360 150,400 110,330 C70,260 180,200 280,260 C380,320 380,480 300,660",
  // One long, shallow arc.
  sweep: "M-60,580 C80,430 170,270 300,200 C380,160 430,120 470,40",
} as const;

/**
 * A thick amber-to-tan ribbon that draws itself as its section scrolls into view.
 * Decorative only: it sits behind content and never takes pointer events.
 */
export function Ribbon({ shape, className = "", flip = false }: { shape: keyof typeof SHAPES; className?: string; flip?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  // useScroll is typed for HTML elements; it only needs getBoundingClientRect, which SVG has.
  const { scrollYProgress } = useScroll({ target: ref as unknown as React.RefObject<HTMLElement>, offset: ["start 0.95", "center 0.45"] });
  const drawn = useSpring(useTransform(scrollYProgress, [0, 1], [0.02, 1]), { stiffness: 120, damping: 30 });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  return (
    <motion.svg
      ref={ref}
      aria-hidden
      viewBox="0 0 400 600"
      fill="none"
      style={reduce ? undefined : { y }}
      className={`pointer-events-none absolute overflow-visible ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={`rb-${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="var(--color-amber)" />
          <stop offset="1" stopColor="#dcac68" />
        </linearGradient>
      </defs>
      <motion.path
        d={SHAPES[shape]}
        stroke={`url(#rb-${id})`}
        strokeWidth={38}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={reduce ? undefined : { pathLength: drawn }}
      />
    </motion.svg>
  );
}
