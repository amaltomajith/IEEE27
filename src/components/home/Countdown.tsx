"use client";

import { useEffect, useState } from "react";
import { conferenceWindow } from "@/lib/dates";

const UNITS = [
  { key: "d", label: "Days" },
  { key: "h", label: "Hours" },
  { key: "m", label: "Minutes" },
  { key: "s", label: "Seconds" },
] as const;

type Parts = Record<(typeof UNITS)[number]["key"], string>;
export type State = { phase: "soon"; parts: Parts; days: number } | { phase: "live"; day: number } | { phase: "over" };

const pad = (n: number) => String(n).padStart(2, "0");

function compute(now: number): State {
  const { start, end } = conferenceWindow();
  if (now >= end) return { phase: "over" };
  if (now >= start) return { phase: "live", day: Math.floor((now - start) / 86_400_000) + 1 };
  const t = Math.floor((start - now) / 1000);
  const d = Math.floor(t / 86_400);
  return {
    phase: "soon",
    days: d,
    parts: { d: d > 99 ? String(d) : pad(d), h: pad(Math.floor(t / 3600) % 24), m: pad(Math.floor(t / 60) % 60), s: pad(t % 60) },
  };
}

/** One digit column that rolls up when its value changes (same easing as the old counter). */
function Roll({ value, still }: { value: string; still: boolean }) {
  const [shown, setShown] = useState({ cur: value, prev: value, n: 0 });
  useEffect(() => {
    setShown((s) => (s.cur === value ? s : { cur: value, prev: s.cur, n: s.n + 1 }));
  }, [value]);
  if (still || shown.n === 0) return <span className="block">{shown.cur}</span>;
  return (
    <span className="relative block overflow-hidden">
      <span key={`p${shown.n}`} className="absolute inset-0 animate-[cd-out_0.6s_var(--ease-out)_forwards]">{shown.prev}</span>
      <span key={`c${shown.n}`} className="block animate-[cd-in_0.6s_var(--ease-out)]">{shown.cur}</span>
    </span>
  );
}

/**
 * Live countdown state, ticking on the second. The static export cannot know "now",
 * so this is null until mount; callers render same-size placeholders meanwhile.
 */
export function useCountdown() {
  const [state, setState] = useState<State | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(matchMedia("(prefers-reduced-motion: reduce)").matches);
    let id = 0;
    const tick = () => {
      const now = Date.now();
      setState(compute(now));
      id = window.setTimeout(tick, 1000 - (now % 1000) + 5);
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  return { state, still };
}

/** Countdown to the conference in date-chip tiles. `dark` is for use on navy surfaces. */
export function Countdown({ label, dark = false }: { label?: string; dark?: boolean }) {
  const { state, still } = useCountdown();

  const { display } = conferenceWindow();

  if (state && state.phase !== "soon") {
    return (
      <div className="flex items-center gap-4">
        <span className={`mono grid h-[clamp(56px,4.4vw,76px)] place-items-center rounded-[14px] px-5 text-[clamp(28px,2.4vw,40px)] leading-none text-paper ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-navy"}`}>
          {state.phase === "live" ? `Day ${state.day}` : "2027"}
        </span>
        <p className={`font-display font-semibold text-[clamp(20px,1.5vw,24px)] ${dark ? "text-white" : ""}`} role="status">
          {state.phase === "live" ? "Happening now" : "IIC 2027 has concluded"}
          <span className={`block text-sm font-normal ${dark ? "text-white/60" : "text-muted"}`}>{display}, Bangalore Kengeri Campus</span>
        </p>
      </div>
    );
  }

  return (
    <div>
      {label && <p className={`mb-4 text-sm ${dark ? "text-white/70" : "text-muted"}`}>{label}</p>}
      <div aria-hidden className="flex items-start gap-[clamp(6px,0.7vw,12px)]">
        {UNITS.map((u, i) => (
          <div key={u.key} className="flex items-start gap-[clamp(6px,0.7vw,12px)]">
            {i > 0 && <span className="mono pt-[0.2em] text-[clamp(26px,2.4vw,40px)] leading-none text-amber">:</span>}
            <div className="flex flex-col items-center gap-2">
              <span className={`mono grid h-[clamp(56px,4.4vw,76px)] min-w-[clamp(58px,4.6vw,80px)] place-items-center rounded-[14px] px-2 pt-[0.12em] text-[clamp(34px,3vw,52px)] leading-none text-paper ${dark ? "bg-white/[0.08] ring-1 ring-white/15" : "bg-navy shadow-[0_14px_30px_-18px_rgb(8_28_56/0.7)]"}`}>
                {state ? <Roll value={state.parts[u.key]} still={still} /> : <span className="block opacity-40">--</span>}
              </span>
              <span className={`text-[11px] font-medium tracking-[0.08em] uppercase sm:text-xs ${dark ? "text-white/55" : "text-muted"}`}>{u.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">
        {state ? `${state.days} days until IIC 2027, ${display}.` : `IIC 2027, ${display}.`}
      </p>
    </div>
  );
}
