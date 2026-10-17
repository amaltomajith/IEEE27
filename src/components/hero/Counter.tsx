"use client";

import { useEffect, useState } from "react";

const ROWS = [
  { n: "12", label: "Sub-tracks" },
  { n: "04", label: "Thematic tracks" },
  { n: "03", label: "Organizing schools" },
];

/** Rotating counter (reference .mkh-count): number in a circle, label beside it. */
export function Counter() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % ROWS.length), 2800);
    return () => clearInterval(id);
  }, []);
  const roll = (key: "n" | "label", center = false) =>
    ROWS.map((r, j) => {
      const state = j === i ? "translate-y-0" : j === (i + ROWS.length - 1) % ROWS.length ? "-translate-y-[110%]" : "translate-y-[110%]";
      return (
        <b
          key={j}
          aria-hidden={j !== i}
          className={`absolute inset-x-0 top-0 font-[inherit] whitespace-nowrap ${state === "translate-y-[110%]" ? "" : "transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(.19,1,.22,1)]"} ${state} ${center ? "text-center" : ""}`}
        >
          {r[key]}
        </b>
      );
    });
  return (
    <div className="flex items-center gap-4 text-[clamp(16px,1.25vw,22px)]">
      <span className="mono grid h-[clamp(52px,3.8vw,68px)] w-[clamp(64px,4.8vw,86px)] shrink-0 place-items-center rounded-[14px] bg-signal-soft text-[clamp(18px,1.4vw,24px)] text-signal-deep ring-1 ring-signal/30">
        <span className="relative block h-[1.3em] w-full overflow-hidden leading-[1.3em]">{roll("n", true)}</span>
      </span>
      <span className="relative block h-[1.3em] min-w-[11em] overflow-hidden leading-[1.3em] [&>b]:font-normal">{roll("label")}</span>
      <span className="sr-only">12 sub-tracks across 4 thematic tracks, organized by 3 schools</span>
    </div>
  );
}
