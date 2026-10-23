"use client";

import { useEffect, useState } from "react";
import { nextMilestone, daysUntil } from "@/lib/dates";
import type { Milestone } from "@/content/dates";

/** Client-only: the static export cannot know "today". */
export function useNextDeadline() {
  const [state, setState] = useState<{ m?: Milestone; days: number } | null>(null);
  useEffect(() => {
    const now = Date.now();
    const m = nextMilestone(now);
    setState({ m, days: m ? daysUntil(m.date, now) : 0 });
  }, []);
  return state;
}

export function NextDeadline({ dark = false }: { dark?: boolean }) {
  const s = useNextDeadline();
  if (!s) return <span className="inline-block h-[1.3em] w-40 animate-pulse rounded bg-current/10" />;
  if (!s.m) return <span>See you next edition.</span>;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={dark ? "text-white" : "text-cocoa"}>{s.m.label}</span>
      <span className={dark ? "text-muted-dark" : "text-muted"}>
        {s.days === 0 ? "today" : `in ${s.days} day${s.days === 1 ? "" : "s"}`}, {s.m.display}
      </span>
    </span>
  );
}
