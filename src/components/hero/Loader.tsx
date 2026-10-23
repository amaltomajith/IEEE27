"use client";

import { useEffect, useRef, useState } from "react";
import { onFrame } from "@/lib/frame";
import { frameFactor } from "@/lib/damp";
import { Field } from "@/components/ui/Field";

export const LOADER_SKEW = 37;
const LETTERS = ["I", "I", "C", ".", "2", "0", "2", "7"];

type Props = {
  /** Extra readiness signal (e.g. scene compiled). */
  ready: Promise<unknown>;
  /** Called once progress reaches 100%; receives the slash element for the handoff. */
  onComplete: (slash: HTMLElement) => void;
  phase: "load" | "out";
};

/** Loader: "/IIC.2027" rises in while a liquid wave fills the slash; a ring counts to 100. */
export function Loader({ ready, onComplete, phase }: Props) {
  const slash = useRef<HTMLSpanElement>(null);
  const wave = useRef<SVGPathElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const num = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => setShown(true));
    let total = 0, ok = 0, loaded = 0;
    const track = (p: Promise<unknown>) => {
      total++;
      p.finally(() => {
        ok++;
        loaded = ok / total;
      });
    };
    track(document.fonts ? document.fonts.ready : Promise.resolve());
    track(document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true })));
    track(ready);
    const cap = setTimeout(() => (loaded = 1), 4500);
    const t0 = performance.now(), MIN = 1300;
    let s = 0, t100 = 0;
    const off = onFrame((now) => {
      const target = Math.min(Math.min(1, (now - t0) / MIN), loaded);
      s += (target - s) * (1 - Math.pow(0.86, frameFactor()));
      if (target >= 1 && s > 0.985) s = 1;
      const lvl = 100 - s * 104, amp = (1 - s) * 6 + 1.2, ph = now / 260;
      let d = "M0 100 L0 " + (lvl + Math.sin(ph) * amp).toFixed(2);
      for (let x = 10; x <= 100; x += 10)
        d += " L" + x + " " + (lvl + Math.sin(ph + x * 0.09) * amp + Math.sin(ph * 1.7 + x * 0.05) * amp * 0.4).toFixed(2);
      wave.current?.setAttribute("d", d + " L100 100 Z");
      const pct = Math.round(s * 100);
      if (ring.current) ring.current.style.strokeDashoffset = String(100 - pct);
      if (num.current) num.current.textContent = String(pct);
      if (s >= 1 && !done.current) {
        if (!t100) t100 = now;
        if (now - t100 > 120) {
          done.current = true;
          off();
          if (slash.current) onComplete(slash.current);
        }
      }
    });
    const failsafe = setTimeout(() => {
      if (!done.current && slash.current) {
        done.current = true;
        off();
        onComplete(slash.current);
      }
    }, 7000);
    return () => {
      off();
      clearTimeout(cap);
      clearTimeout(failsafe);
    };
  }, [ready, onComplete]);

  const out = phase === "out";
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[90] grid place-items-center transition-colors duration-[240ms] ${out ? "bg-transparent" : "bg-paper"}`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 ${out ? "opacity-0" : ""}`}>
        <Field />
      </div>
      <div className="relative flex items-baseline text-[clamp(72px,15vw,250px)] leading-none tracking-[-0.05em] text-cocoa">
        <span
          ref={slash}
          className={`relative mr-[0.12em] inline-block h-[0.74em] w-[0.17em] overflow-hidden rounded-[0.025em] bg-wine/20 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"} ${out ? "invisible delay-[250ms]" : ""}`}
          style={{ transform: `skewX(-${LOADER_SKEW}deg)` }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path ref={wave} className="fill-wine" d="M0 100 L100 100 Z" />
          </svg>
        </span>
        <span
          className="flex items-baseline font-display"
          style={{
            clipPath: out ? "inset(0 0 0 100%)" : "inset(-20% -5% -20% 0)",
            transform: out ? "translateX(28px)" : "none",
            filter: out ? "blur(4px)" : "none",
            opacity: out ? 0.6 : 1,
            transition: "clip-path .8s cubic-bezier(.76,0,.24,1) .25s, transform .8s cubic-bezier(.76,0,.24,1) .25s, filter .8s ease .25s, opacity .8s ease .25s",
          }}
        >
          {LETTERS.map((l, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
              <span
                className={`inline-block ${i < 3 ? "font-semibold" : "font-medium"} ${l === "." ? "text-wine" : ""}`}
                style={{
                  transform: shown ? "none" : "translateY(112%) rotate(6deg)",
                  transition: `transform .9s cubic-bezier(.16,1,.3,1) ${i * 55}ms`,
                }}
              >
                {l}
              </span>
            </span>
          ))}
        </span>
      </div>
      <div
        className={`absolute right-[4vw] bottom-[5vh] grid aspect-square w-[clamp(110px,12vw,190px)] place-items-center transition-[opacity,transform] duration-500 ${out ? "scale-90 opacity-0" : ""}`}
      >
        <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgb(119 61 67 / 0.12)" strokeWidth="5" />
          <circle ref={ring} cx="60" cy="60" r="54" fill="none" stroke="#773d43" strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
        </svg>
        <span className="mono flex items-start text-[clamp(28px,2.7vw,44px)] text-cocoa">
          <b ref={num} className="font-normal">0</b>
          <small className="mt-[0.15em] text-[0.42em] opacity-55">%</small>
        </span>
      </div>
      <p className={`mono absolute bottom-[6vh] left-[4vw] text-[16px] tracking-[0.1em] text-cocoa/70 uppercase transition-opacity duration-300 ${out ? "opacity-0" : ""}`}>
        March 2-3, 2027 &middot; Hybrid
      </p>
    </div>
  );
}
