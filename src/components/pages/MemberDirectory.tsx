"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Group, Member } from "@/content/committee";
import { Phrases } from "@/components/ui/Phrases";

const initials = (name: string) =>
  name
    .replace(/^(Prof\.?|Dr\.?|Mr\.?|Ms\.?|DR\.?)\s*/gi, "")
    .replace(/^(Prof\.?|Dr\.?)\s*/gi, "")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function MemberCard({ m }: { m: Member }) {
  const Tag = m.url ? "a" : "div";
  return (
    <Tag
      {...(m.url ? { href: m.url, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex h-full gap-4 rounded-[var(--radius-m)] bg-white p-5 shadow-[0_1px_0_rgb(10_26_64/0.04)] ring-1 ring-ink/5 transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgb(10_26_64/0.35)]"
    >
      <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold tracking-wide text-brand-deep">
        {initials(m.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display font-semibold text-[19px] leading-snug">{m.name}</span>
          {m.url && <ArrowUpRight size={18} className="mt-0.5 shrink-0 text-muted transition group-hover:text-brand-ink" />}
        </span>
        {m.role && <span className="mt-1 block text-[15px] leading-snug text-ink/75"><Phrases parts={[m.role]} /></span>}
        {(m.org || m.place) && (
          <span className="mt-1 block text-sm leading-snug text-muted"><Phrases parts={[m.org, m.place]} /></span>
        )}
      </span>
    </Tag>
  );
}

export function MemberDirectory({ groups }: { groups: Group[] }) {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<string>("All");
  const reduce = useReducedMotion();
  const scopes = ["All", ...groups.map((g) => g.scope ?? g.title)];
  const total = groups.reduce((n, g) => n + g.members.length, 0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return groups
      .filter((g) => scope === "All" || (g.scope ?? g.title) === scope)
      .map((g) => ({
        ...g,
        members: g.members.filter((m) => !s || [m.name, m.role, m.org, m.place].join(" ").toLowerCase().includes(s)),
      }))
      .filter((g) => g.members.length);
  }, [groups, q, scope]);

  const shown = filtered.reduce((n, g) => n + g.members.length, 0);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="member-search" className="text-sm font-medium text-ink">Search {total} Members</label>
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="member-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, institution or city"
              className="h-12 w-full rounded-full bg-white pr-5 pl-11 text-ink ring-1 ring-ink/15 outline-none placeholder:text-muted focus:ring-2 focus:ring-brand-ink md:w-[360px]"
            />
          </div>
        </div>
        <div role="group" aria-label="Filter by board" className="flex flex-wrap gap-2">
          {scopes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={scope === s}
              onClick={() => setScope(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                scope === s ? "bg-brand text-paper" : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{shown} members shown</p>

      {filtered.length === 0 && (
        <div className="rounded-[var(--radius-m)] bg-white p-10 text-center ring-1 ring-ink/5">
          <p className="font-display font-semibold text-[22px]">No members match &ldquo;{q}&rdquo;</p>
          <p className="mt-1 text-muted">Try a surname, an institution, or clear the filter.</p>
          <button type="button" onClick={() => { setQ(""); setScope("All"); }} className="mt-5 rounded-full bg-navy px-5 py-2.5 text-sm text-white">
            Reset Search
          </button>
        </div>
      )}

      <div className="space-y-16">
        {filtered.map((g) => (
          <section key={g.title} aria-labelledby={`g-${g.title}`}>
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink/10 pb-4">
              <h2 id={`g-${g.title}`} className="t-h3">{g.title}</h2>
              <span className="text-muted">{g.members.length}</span>
            </div>
            <motion.ul layout={!reduce} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {g.members.map((m) => (
                  <motion.li
                    key={m.name + (m.org ?? "")}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  >
                    <MemberCard m={m} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </section>
        ))}
      </div>
    </div>
  );
}
