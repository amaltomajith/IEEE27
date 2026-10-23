"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { PillButton } from "@/components/ui/PillButton";
import { about, site } from "@/content/site";
import { acquireScrollLock } from "@/lib/scroll";

export type Rect = { top: number; left: number; width: number; height: number; radius: number };

const inset = (r: Rect) =>
  `inset(${r.top}px ${innerWidth - r.left - r.width}px ${innerHeight - r.top - r.height}px ${r.left}px round ${r.radius}px)`;

type Props = {
  from: Rect;
  /** Imperative host for the scene canvas while the takeover is open. */
  hostRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPointer: (e: React.PointerEvent<HTMLDivElement>) => void;
  onHold: (on: boolean) => void;
  onPoke: () => void;
};

/** Full-screen expansion of the scene card. Grows from, and returns to, the card's own rect. */
export function Takeover({ from, hostRef, onClose, onPointer, onHold, onPoke }: Props) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const release = acquireScrollLock();
    const outside = ["main", "body > header", "footer"].map((s) => document.querySelector(s)).filter(Boolean) as HTMLElement[];
    outside.forEach((el) => el.setAttribute("inert", ""));
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", key);
    return () => {
      removeEventListener("keydown", key);
      outside.forEach((el) => el.removeAttribute("inert"));
      release();
      prev?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const spring = { type: "spring" as const, bounce: 0, duration: reduce ? 0.01 : 0.9 };
  const stagger = (i: number) => ({ delay: reduce ? 0 : 0.35 + i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const });

  return createPortal(
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="takeover-title"
      className="fixed inset-0 z-[70] overflow-hidden bg-paper text-ink"
      initial={{ clipPath: inset(from) }}
      animate={{ clipPath: inset({ top: 0, left: 0, width: innerWidth, height: innerHeight, radius: 0 }) }}
      exit={{ clipPath: inset(from), transition: spring }}
      transition={spring}
      onPointerMove={onPointer}
      onPointerDown={(e) => {
        onPointer(e);
        onPoke();
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
    >
      <div ref={hostRef} className="absolute inset-0 [&>canvas]:size-full" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(243_245_249/0.92),rgb(243_245_249/0.55)_45%,transparent_70%)]" />
      <div className="wrap relative flex h-full flex-col justify-center gap-8 py-24">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(0)} className="text-muted">
          The theme of {site.short}
        </motion.p>
        <h2 id="takeover-title" className="t-h1 max-w-[12ch]">
          <span className="line-mask is-in"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={stagger(1)}>Mind <span className="em">and</span></motion.span></span>
          <span className="line-mask is-in"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={stagger(2)}>Machine</motion.span></span>
        </h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(3)} className="t-h5 max-w-[34ch] text-ink/80">
          Reimagining human-AI collaboration across sectors.
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(4)} className="max-w-[54ch] text-muted max-md:hidden">
          {about.vision[0]}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(5)} className="flex flex-wrap gap-3" onPointerDown={(e) => e.stopPropagation()}>
          <PillButton href="/thematic-tracks/" variant="brand" onClick={onClose}>Explore tracks</PillButton>
          <PillButton href="/about/" variant="ghost" onClick={onClose}>Read the vision</PillButton>
        </motion.div>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={stagger(7)} className="absolute bottom-6 left-[var(--gutter)] text-sm text-muted max-md:hidden">
        Click a neuron to send a thought. Press and hold to watch the machine think.
      </motion.p>
      <button
        type="button"
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
        className="btn absolute top-[calc((var(--header-h)-48px)/2)] right-[var(--gutter)]"
      >
        <span>Close</span>
        <span className="btn-tile" aria-hidden>
          <span className="grid place-items-center"><X size={17} weight="bold" /></span>
          <span className="grid place-items-center"><X size={17} weight="bold" /></span>
        </span>
      </button>
    </motion.div>,
    document.body,
  );
}
