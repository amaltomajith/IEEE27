import { milestones, isDated, type DatedMilestone } from "@/content/dates";

export type Status = "past" | "next" | "upcoming" | "live";

const dayStart = (iso: string) => new Date(iso + "T00:00:00+05:30").getTime();
const dayEnd = (iso: string) => new Date(iso + "T23:59:59+05:30").getTime();

export const statusOf = (now: number): Status[] => {
  let nextFound = false;
  return milestones.map((m) => {
    // A date still to be announced never closes and is never the next deadline.
    if (!isDated(m)) return "upcoming";
    const end = dayEnd(m.end ?? m.date);
    if (now > end) return "past";
    if (m.end && now >= dayStart(m.date)) return "live";
    if (!nextFound) {
      nextFound = true;
      return "next";
    }
    return "upcoming";
  });
};

export const nextMilestone = (now: number): DatedMilestone | undefined =>
  milestones.filter(isDated).find((m) => now <= dayEnd(m.end ?? m.date));

export const daysUntil = (iso: string, now: number) => Math.max(0, Math.ceil((dayEnd(iso) - now) / 86_400_000));

/** Conference start (00:00 IST, day 1) and end (23:59:59 IST, last day). The source gives no start time. */
export const conferenceWindow = () => {
  const m = milestones.filter(isDated).find((x) => x.end)!;
  return { start: dayStart(m.date), end: dayEnd(m.end!), display: m.display };
};
