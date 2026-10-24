"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Check } from "@phosphor-icons/react/dist/ssr";
import { milestones } from "@/content/dates";
import { statusOf, daysUntil, type Status } from "@/lib/dates";
import { googleCalendarUrl } from "@/lib/calendar";

const label: Record<Status, string> = { past: "Closed", next: "Next up", upcoming: "Upcoming", live: "Happening now" };
const conference = milestones.find((m) => m.end)!;

export function DatesTimeline({ dark = false }: { dark?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const status = now ? statusOf(now) : milestones.map(() => "upcoming" as Status);
  const ink = dark ? "text-white" : "text-ink";
  const sub = dark ? "text-muted-dark" : "text-muted";
  const nextIdx = status.indexOf("next");
  const progress = now ? Math.max(0, status.filter((s) => s === "past").length - 0.5) / (milestones.length - 1) : 0;

  return (
    <div>
      <ol className="relative">
        <span aria-hidden className={`absolute top-3 bottom-3 left-[11px] w-px ${dark ? "bg-white/15" : "bg-ink/12"}`} />
        <span
          aria-hidden
          className="absolute top-3 left-[10px] w-[3px] rounded-full bg-brand transition-[height] duration-[1.4s] [transition-timing-function:var(--ease-out)]"
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
                  s === "past" ? "bg-brand text-paper" : strong ? "bg-brand ring-8 ring-brand/20" : dark ? "bg-ink-3 ring-1 ring-white/20" : "bg-paper ring-1 ring-ink/20"
                }`}
              >
                {s === "past" && <Check size={12} weight="bold" />}
              </span>
              <div className={`flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6 ${s === "past" ? "opacity-55" : ""}`}>
                <div>
                  <p className={`font-display font-semibold text-[clamp(24px,2vw,36px)] leading-[1.1] ${ink}`}>{m.label}</p>
                  {now && (
                    <p className={`mt-1 text-sm ${strong ? "text-brand" : sub}`}>
                      {label[s]}
                      {i === nextIdx && s === "next" && `, ${daysUntil(m.date, now)} days left`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <time dateTime={m.date} className={`font-display text-[clamp(19px,1.45vw,24px)] font-semibold [font-variant-numeric:lining-nums] ${strong ? ink : sub}`}>
                    {m.display}
                  </time>
                  {s !== "past" && (
                    <a
                      href={googleCalendarUrl(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Add ${m.label} to Google Calendar`}
                      title="Add to Google Calendar"
                      className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
                        dark ? "bg-white/10 text-white hover:bg-brand" : "bg-white text-brand-ink ring-1 ring-ink/10 hover:bg-brand hover:text-paper hover:ring-brand"
                      }`}
                    >
                      <CalendarPlus size={17} />
                    </a>
                  )}
                  {s === "past" && <span aria-hidden className="size-9 shrink-0 max-md:hidden" />}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={googleCalendarUrl(conference)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-sm font-medium transition-colors ${
            dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-brand"
          }`}
        >
          <span className="grid size-9 place-items-center rounded-full bg-brand text-paper"><CalendarPlus size={18} /></span>
          Add conference to Google Calendar
        </a>
        <p className={`text-sm ${sub}`}>Or use the calendar icon beside any date to save that deadline.</p>
      </div>
    </div>
  );
}
