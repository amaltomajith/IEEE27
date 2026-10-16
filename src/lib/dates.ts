import { milestones, type Milestone } from "@/content/dates";

export type Status = "past" | "next" | "upcoming" | "live";

const dayStart = (iso: string) => new Date(iso + "T00:00:00+05:30").getTime();
const dayEnd = (iso: string) => new Date(iso + "T23:59:59+05:30").getTime();

export const statusOf = (now: number): Status[] => {
  let nextFound = false;
  return milestones.map((m) => {
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

export const nextMilestone = (now: number): Milestone | undefined =>
  milestones.find((m) => now <= dayEnd(m.end ?? m.date));

export const daysUntil = (iso: string, now: number) => Math.max(0, Math.ceil((dayEnd(iso) - now) / 86_400_000));
