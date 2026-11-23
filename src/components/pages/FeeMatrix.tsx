"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { feeDeadlines, feeFor, fees, formatFee, regions, type Region, type Tier } from "@/content/fees";
import { keep } from "@/lib/keep";

type Option<T> = { v: T; label: string; short?: string };

/** Pill switch; full width on phones so three options never overflow, inline from sm up. */
function Segmented<T extends string>({ value, options, onChange, label, id, disabled = false }: { value: T; options: Option<T>[]; onChange: (v: T) => void; label: string; id: string; disabled?: boolean }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={`grid w-full gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5 transition-opacity duration-300 sm:inline-flex sm:w-auto ${disabled ? "opacity-40" : ""}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.v)}
            className="relative rounded-full px-2 py-2.5 text-[13px] font-medium whitespace-nowrap disabled:cursor-not-allowed sm:px-5 sm:text-sm"
          >
            {on && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
            <span className={`relative ${on ? "text-paper" : "text-ink/70"}`}>
              {o.short ? (
                <>
                  <span className="sm:hidden">{o.short}</span>
                  <span className="max-sm:hidden">{o.label}</span>
                </>
              ) : (
                o.label
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FeeMatrix() {
  const [region, setRegion] = useState<Region>("national");
  const [tier, setTier] = useState<Tier>("early");
  const [currentTier, setCurrentTier] = useState<Tier | "closed" | null>(null);
  const reduce = useReducedMotion();
  const flat = region === "christ";

  useEffect(() => {
    const now = Date.now();
    const end = (iso: string) => new Date(iso + "T23:59:59+05:30").getTime();
    const t: Tier | "closed" = now <= end(feeDeadlines.early.date) ? "early" : now <= end(feeDeadlines.regular.date) ? "regular" : "closed";
    setCurrentTier(t);
    if (t === "regular") setTier("regular");
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented id="region" label="Delegate Category" value={region} onChange={setRegion} options={regions} />
        <Segmented id="tier" label="Registration Window" value={tier} onChange={setTier} disabled={flat} options={[{ v: "early", label: "Early Bird" }, { v: "regular", label: "Regular" }]} />
      </div>
      <p className="mb-6 text-muted" aria-live="polite">
        {flat ? (
          <>CHRIST-affiliated delegates pay one flat rate, in INR.</>
        ) : (
          <>
            {feeDeadlines[tier].label}: <span className="text-ink">{keep(feeDeadlines[tier].display)}</span>
            {currentTier === tier && <span className="ml-3 inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-paper">Open Now</span>}
            {currentTier === "regular" && tier === "early" && <span className="ml-3 inline-block rounded-full bg-gray-2 px-3 py-1 text-xs font-semibold text-ink">Closed</span>}
          </>
        )}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fees.map((f, i) => {
          const fee = feeFor(f, region, tier);
          return (
            <li
              key={f.category}
              className={`flex items-center justify-between gap-4 rounded-[var(--radius-m)] p-5 sm:min-h-[220px] sm:flex-col sm:items-stretch sm:p-[clamp(20px,2vw,32px)] ${i === 1 ? "bg-brand-soft ring-1 ring-brand/30" : "bg-white ring-1 ring-ink/5"}`}
            >
              <p className="font-medium text-ink/75 max-sm:text-[15px] max-sm:leading-snug">{f.category}</p>
              <div className="relative h-[40px] flex-none overflow-hidden text-right sm:h-[clamp(52px,4.6vw,76px)] sm:text-left">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={flat ? region : region + tier}
                    initial={reduce ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    className={`font-display text-[36px] leading-none font-semibold whitespace-nowrap [font-variant-numeric:lining-nums_tabular-nums] sm:text-[clamp(48px,4.4vw,72px)] ${i === 1 ? "text-brand-deep" : ""} ${fee === null ? "text-ink/35" : ""}`}
                  >
                    {fee === null ? (
                      <>
                        <span aria-hidden>—</span>
                        <span className="sr-only">Not applicable</span>
                      </>
                    ) : (
                      formatFee(fee, region)
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
