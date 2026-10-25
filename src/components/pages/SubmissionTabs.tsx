"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { abstractOption, manuscriptOption } from "@/content/submission";

// Segment fill and the ink that reads on it. Light fills (mist, gray-2) take dark ink.
const SEG = [
  { bg: "bg-navy", ink: "text-white" },
  { bg: "bg-mist", ink: "text-ink" },
  { bg: "bg-brand-deep", ink: "text-white" },
  { bg: "bg-brand", ink: "text-white" },
  { bg: "bg-navy-3", ink: "text-white" },
  { bg: "bg-gray-2", ink: "text-ink" },
];

/**
 * The 1,500-word abstract as one bar. Every part is numbered on the bar and in the index, so the
 * match never depends on telling navy shades apart; selecting a part (bar or index) dims the rest
 * and opens its explanation under a pointer aimed at that segment.
 */
function WordBudget() {
  const parts = abstractOption.sections;
  const total = parts.reduce((n, s) => n + s.words, 0);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const segs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = parts[active];
  const before = parts.slice(0, active).reduce((n, s) => n + s.words, 0);
  const centre = Math.min(97, Math.max(3, ((before + cur.words / 2) / total) * 100));
  const go = (i: number, focus = false) => {
    const n = (i + parts.length) % parts.length;
    setActive(n);
    if (focus) segs.current[n]?.focus();
  };
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.5 };

  return (
    <div>
      <div
        role="group"
        aria-label={`Word budget totalling ${total} words. Select a part to read what it covers.`}
        className="flex h-14 w-full gap-[3px] md:h-16 overflow-hidden rounded-full"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            go(active + (e.key === "ArrowRight" ? 1 : -1), true);
          }
        }}
      >
        {parts.map((s, i) => (
          <button
            key={s.name}
            ref={(el) => { segs.current[i] = el; }}
            type="button"
            aria-pressed={active === i}
            aria-controls="budget-detail"
            aria-label={`${i + 1}. ${s.name}, about ${s.words} words`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => go(i)}
            className={`${SEG[i].bg} ${SEG[i].ink} relative grid min-w-0 place-items-center text-sm font-medium transition-[opacity,filter] duration-300 focus-visible:outline-offset-[-4px] ${active === i ? "" : "opacity-40 hover:opacity-75"}`}
            style={{ flex: `${s.words} 1 0` }}
          >
            <span className="flex items-center gap-2">
              <span className={`grid place-items-center rounded-full text-xs tabular-nums md:size-6 ${SEG[i].ink === "text-white" ? "md:bg-white/15" : "md:bg-ink/10"}`}>{i + 1}</span>
              <span className="tabular-nums max-md:hidden">{s.words}</span>
            </span>
            {active === i && <motion.span layoutId="budget-mark" aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-amber" transition={spring} />}
          </button>
        ))}
      </div>

      <div className="relative mt-5">
        <motion.span aria-hidden className="absolute -top-[7px] size-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-white" initial={false} animate={{ left: `${centre}%` }} transition={spring} />
        <div id="budget-detail" aria-live="polite" className="relative grid gap-5 rounded-[var(--radius-m)] bg-white p-[clamp(20px,2.4vw,32px)] ring-1 ring-ink/5 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-7">
          <span aria-hidden className={`${SEG[active].bg} ${SEG[active].ink} grid size-12 place-items-center rounded-full text-lg font-semibold tabular-nums max-md:hidden`}>{active + 1}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <h4 className="font-display text-[clamp(22px,2vw,28px)] font-semibold leading-tight">
                <span className="mr-2 font-sans text-[0.8em] text-brand-ink tabular-nums md:hidden">{active + 1}.</span>
                {cur.name}
              </h4>
              <p className="mt-1.5 text-sm text-muted tabular-nums">
                About {cur.words} words, {Math.round((cur.words / total) * 100)}% of the {total.toLocaleString("en-GB")}
              </p>
              <p className="mt-3 max-w-[64ch] text-ink/80">{cur.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2 md:self-center">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous part" className="grid size-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-brand-soft active:scale-[0.96]">
              <CaretLeft size={18} weight="bold" />
            </button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next part" className="grid size-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-brand-soft active:scale-[0.96]">
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <ol className="mt-6 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((s, i) => (
          <li key={s.name}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-pressed={active === i}
              className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition ${active === i ? "bg-white ring-1 ring-ink/10" : "hover:bg-white/60"}`}
            >
              <span className={`${SEG[i].bg} ${SEG[i].ink} grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums ${SEG[i].ink === "text-ink" ? "ring-1 ring-ink/10" : ""}`}>{i + 1}</span>
              <span className={`font-medium ${active === i ? "text-ink" : "text-ink/75"}`}>{s.name}</span>
              <span className="text-sm text-muted tabular-nums">{s.words}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-[var(--radius-m)] bg-white p-[clamp(20px,2vw,32px)] ring-1 ring-ink/5">
      <h3 className="mb-5 font-display font-semibold text-[24px]">{title}</h3>
      <dl className="grid gap-4">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Manuscript() {
  const f = manuscriptOption.formatting;
  return (
    <div className="space-y-12">
      <p className="t-h5 max-w-[60ch] text-ink/80">{manuscriptOption.intro}</p>
      <div className="grid gap-3 lg:grid-cols-3">
        <SpecGroup title="Page" rows={[f[0], f[5], f[6], f[8]]} />
        <SpecGroup title="Type" rows={[f[1], f[2], f[3], f[4], f[7]]} />
        <SpecGroup title="Headings" rows={manuscriptOption.headings} />
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="t-h3 mb-5">Title Page Includes</h3>
          <ul className="space-y-3">
            {manuscriptOption.titlePage.map((t) => (
              <li key={t} className="flex gap-3"><span aria-hidden className="node mt-[0.55em] text-[9px]" />{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="t-h3 mb-5">Manuscript Order</h3>
          <ol className="flex flex-wrap items-center gap-2">
            {manuscriptOption.structure.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-[15px] ring-1 ring-ink/10">{s}</span>
                {i < manuscriptOption.structure.length - 1 && <span aria-hidden className="text-brand-ink">&rarr;</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5"><h3 className="mb-2 font-display font-semibold text-[21px]">References</h3><p className="text-ink/75">{manuscriptOption.references}</p></div>
        <div className="rounded-[var(--radius-m)] bg-brand-soft p-6 ring-1 ring-brand/25"><h3 className="mb-2 font-display font-semibold text-[21px] text-brand-deep">Plagiarism Policy</h3><p className="text-ink/80">{manuscriptOption.plagiarism}</p></div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "abstract", label: "Extended Abstract", opt: abstractOption },
  { id: "manuscript", label: "Full Manuscript", opt: manuscriptOption },
] as const;

export function SubmissionTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("abstract");
  const reduce = useReducedMotion();
  const cur = TABS.find((t) => t.id === tab)!;
  return (
    <div>
      <div role="tablist" aria-label="Submission options" className="mb-12 inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5">
        {TABS.map((t, i) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)} className="relative rounded-full px-5 py-3 text-sm font-medium md:px-7">
            {tab === t.id && <motion.span layoutId="sub-tab" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0, duration: 0.45 }} />}
            <span className={`relative ${tab === t.id ? "text-paper" : "text-ink/70"}`}>Option {i + 1}: {t.label}</span>
          </button>
        ))}
      </div>
      <p className="mb-10 text-muted">Deadline: <span className="font-medium text-ink">{cur.opt.deadline}</span></p>
      <AnimatePresence mode="wait">
        <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          {tab === "abstract" ? (
            <div className="space-y-12">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5"><h3 className="mb-2 font-display font-semibold text-[21px]">Word Limit</h3><p className="text-ink/75">{abstractOption.wordLimit}</p></div>
                <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5"><h3 className="mb-2 font-display font-semibold text-[21px]">Formatting</h3><p className="text-ink/75">{abstractOption.formatting}</p></div>
              </div>
              <div><h3 className="t-h3 mb-6">How the 1,500 Words Break Down</h3><WordBudget /></div>
            </div>
          ) : (
            <Manuscript />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
