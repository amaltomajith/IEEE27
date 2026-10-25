"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { fees, feeDeadlines, formatFee, type Region, type Tier } from "@/content/fees";

function Segmented<T extends string>({ value, options, onChange, label, id }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string; id: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)} className="relative rounded-full px-5 py-2.5 text-sm font-medium">
          {value === o.v && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
          <span className={`relative ${value === o.v ? "text-paper" : "text-ink/70"}`}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function FeeMatrix() {
  const [region, setRegion] = useState<Region>("national");
  const [tier, setTier] = useState<Tier>("early");
  const [currentTier, setCurrentTier] = useState<Tier | "closed" | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const now = Date.now();
    const end = (iso: string) => new Date(iso + "T23:59:59+05:30").getTime();
    const t: Tier | "closed" = now <= end(feeDeadlines.early.date) ? "early" : now <= end(feeDeadlines.regular.date) ? "regular" : "closed";
    setCurrentTier(t);
    if (t === "regular") setTier("regular");
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Segmented id="region" label="Participant Region" value={region} onChange={setRegion} options={[{ v: "national", label: "National (INR)" }, { v: "international", label: "International (USD)" }]} />
        <Segmented id="tier" label="Registration Window" value={tier} onChange={setTier} options={[{ v: "early", label: "Early Bird" }, { v: "regular", label: "Regular" }]} />
      </div>
      <p className="mb-6 text-muted">
        {feeDeadlines[tier].label}: <span className="text-ink">{feeDeadlines[tier].display}</span>
        {currentTier === tier && <span className="ml-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-paper">Open Now</span>}
        {currentTier === "regular" && tier === "early" && <span className="ml-3 rounded-full bg-gray-2 px-3 py-1 text-xs font-semibold text-ink">Closed</span>}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fees.map((f, i) => (
          <li key={f.category} className={`flex min-h-[220px] flex-col justify-between rounded-[var(--radius-m)] p-[clamp(20px,2vw,32px)] ${i === 1 ? "bg-brand-soft ring-1 ring-brand/30" : "bg-white ring-1 ring-ink/5"}`}>
            <p className={`font-medium text-ink/75`}>{f.category}</p>
            <div className="relative h-[clamp(52px,4.6vw,76px)] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={region + tier}
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  className={`font-display text-[clamp(48px,4.4vw,72px)] leading-none font-semibold [font-variant-numeric:lining-nums_tabular-nums] ${i === 1 ? "text-brand-deep" : ""}`}
                >
                  {formatFee(f[region][tier], region)}
                </motion.p>
              </AnimatePresence>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
