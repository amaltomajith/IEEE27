"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { abstractOption, manuscriptOption } from "@/content/submission";

const SEG_COLORS = ["bg-cocoa", "bg-sand", "bg-wine-deep", "bg-wine", "bg-cocoa-3", "bg-gray-2"];

function WordBudget() {
  const total = abstractOption.sections.reduce((n, s) => n + s.words, 0);
  return (
    <div>
      <div className="flex h-14 w-full overflow-hidden rounded-full" role="img" aria-label={`Word budget totalling ${total} words`}>
        {abstractOption.sections.map((s, i) => (
          <div key={s.name} className={`${SEG_COLORS[i]} grid place-items-center text-sm font-medium ${i === 1 || i === 5 ? "text-cocoa" : "text-white"}`} style={{ width: `${(s.words / total) * 100}%` }}>
            <span className="max-sm:hidden">{s.words}</span>
          </div>
        ))}
      </div>
      <ol className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2">
        {abstractOption.sections.map((s, i) => (
          <li key={s.name} className="grid grid-cols-[14px_1fr] gap-4">
            <span aria-hidden className={`mt-1.5 size-3.5 rounded-full ${SEG_COLORS[i]} ${i === 5 ? "ring-1 ring-cocoa/20" : ""}`} />
            <div>
              <p className="flex items-baseline justify-between gap-3 font-medium">
                <span>{s.name}</span>
                <span className="text-muted tabular-nums">about {s.words} words</span>
              </p>
              <p className="mt-1 text-[15px] text-cocoa/70">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-[var(--radius-m)] bg-white p-[clamp(20px,2vw,32px)] ring-1 ring-cocoa/5">
      <h3 className="mb-5 text-lg font-medium">{title}</h3>
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
      <p className="t-h5 max-w-[60ch] text-cocoa/80">{manuscriptOption.intro}</p>
      <div className="grid gap-3 lg:grid-cols-3">
        <SpecGroup title="Page" rows={[f[0], f[5], f[6], f[8]]} />
        <SpecGroup title="Type" rows={[f[1], f[2], f[3], f[4], f[7]]} />
        <SpecGroup title="Headings" rows={manuscriptOption.headings} />
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="t-h3 mb-5">Title page includes</h3>
          <ul className="space-y-3">
            {manuscriptOption.titlePage.map((t) => (
              <li key={t} className="flex gap-3"><span aria-hidden className="node mt-[0.55em] text-[9px]" />{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="t-h3 mb-5">Manuscript order</h3>
          <ol className="flex flex-wrap items-center gap-2">
            {manuscriptOption.structure.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-[15px] ring-1 ring-cocoa/10">{s}</span>
                {i < manuscriptOption.structure.length - 1 && <span aria-hidden className="text-wine-ink">&rarr;</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-cocoa/5"><h3 className="mb-2 font-medium">References</h3><p className="text-cocoa/75">{manuscriptOption.references}</p></div>
        <div className="rounded-[var(--radius-m)] bg-wine-soft p-6 ring-1 ring-wine/25"><h3 className="mb-2 font-medium text-wine-deep">Plagiarism policy</h3><p className="text-cocoa/80">{manuscriptOption.plagiarism}</p></div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "abstract", label: "Extended abstract", opt: abstractOption },
  { id: "manuscript", label: "Full manuscript", opt: manuscriptOption },
] as const;

export function SubmissionTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("abstract");
  const reduce = useReducedMotion();
  const cur = TABS.find((t) => t.id === tab)!;
  return (
    <div>
      <div role="tablist" aria-label="Submission options" className="mb-12 inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-cocoa/5">
        {TABS.map((t, i) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)} className="relative rounded-full px-5 py-3 text-sm font-medium md:px-7">
            {tab === t.id && <motion.span layoutId="sub-tab" className="absolute inset-0 rounded-full bg-wine" transition={{ type: "spring", bounce: 0, duration: 0.45 }} />}
            <span className={`relative ${tab === t.id ? "text-paper" : "text-cocoa/70"}`}>Option {i + 1}: {t.label}</span>
          </button>
        ))}
      </div>
      <p className="mb-10 text-muted">Deadline: <span className="font-medium text-cocoa">{cur.opt.deadline}</span></p>
      <AnimatePresence mode="wait">
        <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          {tab === "abstract" ? (
            <div className="space-y-12">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-cocoa/5"><h3 className="mb-2 font-medium">Word limit</h3><p className="text-cocoa/75">{abstractOption.wordLimit}</p></div>
                <div className="rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-cocoa/5"><h3 className="mb-2 font-medium">Formatting</h3><p className="text-cocoa/75">{abstractOption.formatting}</p></div>
              </div>
              <div><h3 className="t-h3 mb-6">How the 1,500 words break down</h3><WordBudget /></div>
            </div>
          ) : (
            <Manuscript />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
