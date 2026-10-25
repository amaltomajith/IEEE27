"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fees, feeDeadlines, formatFee, type Tier } from "@/content/fees";
import { daysUntil } from "@/lib/dates";
import { PillButton } from "@/components/ui/PillButton";
import { ScrollSlash } from "@/components/ui/ScrollSlash";
import { keep } from "@/lib/keep";

const TIERS: { key: Tier; label: string }[] = [
  { key: "early", label: "Early Bird" },
  { key: "regular", label: "Regular" },
];

const lowest = (tier: Tier, region: "national" | "international") => Math.min(...fees.map((f) => f[region][tier]));

/** A price that slides up into place whenever the tier changes. */
function Swap({ k, children, delay = 0, still }: { k: string; children: React.ReactNode; delay?: number; still: boolean }) {
  return (
    <span className="relative inline-grid overflow-hidden pb-[0.08em] align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={k}
          className="col-start-1 row-start-1 block"
          initial={still ? false : { y: "0.5em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={still ? { opacity: 0, transition: { duration: 0 } } : { y: "-0.5em", opacity: 0 }}
          transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Home registration card: the fee ladder for one tier at a time, read straight from content/fees. */
export function RegistrationCard() {
  const still = !!useReducedMotion();
  const [tier, setTier] = useState<Tier>("early");
  // The static export cannot know "today": days and the open tier resolve after mount.
  const [days, setDays] = useState<{ early: number; regular: number } | null>(null);
  const group = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = Date.now();
    const d = { early: daysUntil(feeDeadlines.early.date, now), regular: daysUntil(feeDeadlines.regular.date, now) };
    setDays(d);
    if (now > new Date(feeDeadlines.early.date + "T23:59:59+05:30").getTime()) setTier("regular");
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next = tier === "early" ? "regular" : "early";
    setTier(next);
    group.current?.querySelector<HTMLButtonElement>(`[data-tier="${next}"]`)?.focus();
  };

  const deadline = feeDeadlines[tier];
  const deadlineDay = keep(deadline.display.replace(/^(Before|By) /, ""));
  const left = days?.[tier];

  return (
    <div className="relative isolate flex h-full min-h-[420px] flex-col overflow-hidden rounded-[var(--radius-l)] navy-grad p-[clamp(24px,3vw,56px)] text-paper">
      {/* The site's slash, leaning out of the bottom corner and moving with scroll like the page heroes'. */}
      <ScrollSlash className="absolute right-[12%] bottom-[-12%] -z-10 h-[52%] w-[clamp(48px,5vw,88px)] opacity-60 max-sm:right-[-6%] max-sm:h-[34%]" />

      <div className="fade-up flex flex-wrap items-center justify-between gap-4">
        <p className="text-base font-medium text-paper/75">Registration</p>
        <div
          ref={group}
          role="radiogroup"
          aria-label="Fee tier"
          onKeyDown={onKey}
          className="relative grid grid-cols-2 rounded-[var(--radius-s)] bg-white/[0.07] p-1 ring-1 ring-white/12"
        >
          {TIERS.map((t) => {
            const on = tier === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                data-tier={t.key}
                onClick={() => setTier(t.key)}
                className={`relative rounded-[10px] px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${on ? "text-ink" : "text-paper/70 hover:text-paper"}`}
              >
                {on && (
                  <motion.span
                    layoutId="tier-thumb"
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-[10px] bg-paper shadow-[0_6px_18px_-8px_rgb(4_16_32/0.6)]"
                    transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead prices: the lowest fee in each region for the chosen tier. */}
      <div className="fade-up mt-[clamp(24px,3.4vw,48px)] flex flex-wrap items-end gap-x-[clamp(24px,3vw,48px)] gap-y-4">
        <div>
          <p className="text-sm text-paper/65">From</p>
          <p className="mt-1 font-display text-[clamp(60px,6vw,104px)] leading-[0.95] font-semibold text-amber [font-variant-numeric:lining-nums]">
            <Swap k={tier} still={still}>{formatFee(lowest(tier, "national"), "national")}</Swap>
          </p>
        </div>
        <div className="border-l border-white/15 pb-[0.4em] pl-[clamp(16px,2vw,28px)]">
          <p className="text-sm text-paper/65">International</p>
          <p className="mt-1 font-display text-[clamp(34px,3vw,52px)] leading-none font-semibold [font-variant-numeric:lining-nums]">
            <Swap k={tier} still={still} delay={0.05}>{formatFee(lowest(tier, "international"), "international")}</Swap>
          </p>
        </div>
      </div>

      {/* Every category for the chosen tier. */}
      <ul className="fade-up mt-[clamp(24px,3vw,40px)] grid grid-cols-2 gap-2.5">
        {fees.map((f, i) => (
          <li key={f.category} className="flex flex-col justify-between gap-5 rounded-[var(--radius-m)] bg-white/[0.06] p-[clamp(16px,1.6vw,22px)] ring-1 ring-white/10 backdrop-blur-[2px]">
            <span className="text-sm leading-snug text-paper/75">{f.category}</span>
            <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
              <span className="font-display text-[clamp(26px,2.3vw,38px)] leading-none font-semibold [font-variant-numeric:lining-nums]">
                <Swap k={tier} still={still} delay={0.04 * i}>{formatFee(f.national[tier], "national")}</Swap>
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[13px] font-medium text-paper/80 [font-variant-numeric:lining-nums]">
                <Swap k={tier} still={still} delay={0.04 * i + 0.03}>{formatFee(f.international[tier], "international")}</Swap>
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="fade-up mt-auto flex flex-col gap-6 pt-[clamp(28px,3vw,44px)]">
        <p className="max-w-[46ch] text-[15px] leading-relaxed text-paper/75" aria-live="polite">
          {days === null ? (
            <span className="inline-block h-[1.2em] w-64 animate-pulse rounded bg-white/10 align-middle" />
          ) : left && left > 0 ? (
            <>
              {tier === "early" ? "Early bird rates close" : "Regular registration closes"} in{" "}
              <span className="font-semibold text-paper">{left} day{left === 1 ? "" : "s"}</span>, {deadlineDay}.
            </>
          ) : (
            <>{tier === "early" ? "Early bird rates" : "Regular registration"} closed on {deadlineDay}.</>
          )}{" "}
          Every fee covers the conference kit, all sessions, lunch and refreshments.
        </p>
        <div>
          <PillButton href="/registration/" variant="light">See All Fees</PillButton>
        </div>
      </div>
    </div>
  );
}
