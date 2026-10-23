"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Check } from "@phosphor-icons/react/dist/ssr";
import { milestones } from "@/content/dates";
import { statusOf, daysUntil, type Status } from "@/lib/dates";
import { downloadIcs } from "@/lib/ics";

const label: Record<Status, string> = { past: "Closed", next: "Next up", upcoming: "Upcoming", live: "Happening now" };

export function DatesTimeline({ dark = false }: { dark?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const status = now ? statusOf(now) : milestones.map(() => "upcoming" as Status);
  const ink = dark ? "text-white" : "text-cocoa";
  const sub = dark ? "text-muted-dark" : "text-muted";
  const nextIdx = status.indexOf("next");
  const progress = now ? Math.max(0, status.filter((s) => s === "past").length - 0.5) / (milestones.length - 1) : 0;

  return (
    <div>
      <ol className="relative">
        <span aria-hidden className={`absolute top-3 bottom-3 left-[11px] w-px ${dark ? "bg-white/15" : "bg-cocoa/12"}`} />
        <span
          aria-hidden
          className="absolute top-3 left-[10px] w-[3px] rounded-full bg-wine transition-[height] duration-[1.4s] [transition-timing-function:var(--ease-out)]"
          style={{ height: `calc(${progress * 100}% - 12px)` }}
        />
        {milestones.map((m, i) => {
          const s = status[i];
          const strong = s === "next" || s === "live";
          return (
            <li key={m.label} className="relative grid grid-cols-[24px_1fr] gap-5 py-4 md:gap-8">
              <span
                aria-hidden
                className={`relative z-10 mt-1.5 grid size-6 place-items-center rounded-full transition-colors ${
                  s === "past" ? "bg-wine text-paper" : strong ? "bg-wine ring-8 ring-wine/20" : dark ? "bg-cocoa-3 ring-1 ring-white/20" : "bg-paper ring-1 ring-cocoa/20"
                }`}
              >
                {s === "past" && <Check size={12} weight="bold" />}
              </span>
              <div className={`flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6 ${s === "past" ? "opacity-55" : ""}`}>
                <div>
                  <p className={`text-[clamp(20px,1.7vw,30px)] font-medium tracking-[-0.02em] ${ink}`}>{m.label}</p>
                  {now && (
                    <p className={`mt-1 text-sm ${strong ? "text-wine" : sub}`}>
                      {label[s]}
                      {i === nextIdx && s === "next" && `, ${daysUntil(m.date, now)} days left`}
                    </p>
                  )}
                </div>
                <time dateTime={m.date} className={`text-[clamp(16px,1.2vw,20px)] tabular-nums ${strong ? ink : sub}`}>
                  {m.display}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={downloadIcs}
        className={`mt-8 inline-flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-sm font-medium transition-colors ${
          dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-cocoa ring-1 ring-cocoa/10 hover:ring-wine"
        }`}
      >
        <span className="grid size-9 place-items-center rounded-full bg-wine text-paper"><CalendarPlus size={18} /></span>
        Add all dates to calendar
      </button>
    </div>
  );
}
