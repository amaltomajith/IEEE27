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

type Tabbed = Exclude<Region, "christ">;
const tabs = regions.filter((r): r is (typeof regions)[number] & { v: Tabbed } => r.v !== "christ");

/** One category's fee; the figure slides in whenever `k` changes. */
function FeeCard({ category, fee, region, k, featured, reduce }: { category: string; fee: number | null; region: Region; k: string; featured: boolean; reduce: boolean }) {
  return (
    <li
      className={`flex items-center justify-between gap-4 rounded-[var(--radius-m)] p-5 sm:min-h-[220px] sm:flex-col sm:items-stretch sm:p-[clamp(20px,2vw,32px)] ${featured ? "bg-brand-soft ring-1 ring-brand/30" : "bg-white ring-1 ring-ink/5"}`}
    >
      <p className="font-medium text-ink/75 max-sm:text-[15px] max-sm:leading-snug">{category}</p>
      <div className="relative h-[40px] flex-none overflow-hidden text-right sm:h-[clamp(52px,4.6vw,76px)] sm:text-left">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={k}
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className={`font-display text-[36px] leading-none font-semibold whitespace-nowrap [font-variant-numeric:lining-nums_tabular-nums] sm:text-[clamp(48px,4.4vw,72px)] ${featured ? "text-brand-deep" : ""} ${fee === null ? "text-ink/35" : ""}`}
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
}

export function FeeMatrix() {
  const [region, setRegion] = useState<Tabbed>("national");
  const [tier, setTier] = useState<Tier>("early");
  const [currentTier, setCurrentTier] = useState<Tier | "closed" | null>(null);
  const reduce = !!useReducedMotion();

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
        <Segmented id="region" label="Delegate Category" value={region} onChange={setRegion} options={tabs} />
        <Segmented id="tier" label="Registration Window" value={tier} onChange={setTier} options={[{ v: "early", label: "Early Bird" }, { v: "regular", label: "Regular" }]} />
      </div>
      <p className="mb-6 text-muted" aria-live="polite">
        {feeDeadlines[tier].label}: <span className="text-ink">{keep(feeDeadlines[tier].display)}</span>
        {currentTier === tier && <span className="ml-3 inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-paper">Open Now</span>}
        {currentTier === "regular" && tier === "early" && <span className="ml-3 inline-block rounded-full bg-gray-2 px-3 py-1 text-xs font-semibold text-ink">Closed</span>}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fees.map((f, i) => (
          <FeeCard key={f.category} category={f.category} fee={feeFor(f, region, tier)} region={region} k={region + tier} featured={i === 1} reduce={reduce} />
        ))}
      </ul>

      {/* CHRIST-affiliated delegates pay one flat rate, so they sit outside the tabs and tiers. */}
      <div className="mt-[clamp(48px,6vw,88px)]">
        <h2 className="t-h3">CHRIST-Affiliated</h2>
        <p className="mt-3 mb-6 text-muted">One flat rate in INR, with no early bird or regular tier.</p>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {fees.map((f, i) => (
            <FeeCard key={f.category} category={f.category} fee={f.christ} region="christ" k="christ" featured={i === 1} reduce={reduce} />
          ))}
        </ul>
      </div>
    </div>
  );
}
