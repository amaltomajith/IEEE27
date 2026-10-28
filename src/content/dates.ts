export type Milestone = {
  label: string;
  /** ISO date (local, Asia/Kolkata). Leave out while the date is to be announced. */
  date?: string;
  /** Inclusive end date for multi-day events. */
  end?: string;
  display: string;
};

/** A milestone whose date is known; only these count down or go to a calendar. */
export type DatedMilestone = Milestone & { date: string };
export const isDated = (m: Milestone): m is DatedMilestone => !!m.date;

const TBA = "To be announced";

// The source table lists the last five rows as 2026. That contradicts the hero
// ("March 2-3, 2027") and the Registration page ("January 2027"), so they are
// rendered as 2027 here.
export const milestones: Milestone[] = [
  { label: "Extended Abstract", date: "2026-11-25", display: "25 November 2026" },
  { label: "Abstract Notification", display: TBA },
  { label: "Full Manuscript", date: "2027-01-05", display: "05 January 2027" },
  { label: "Manuscript Notification", display: TBA },
  { label: "Early Bird Registration", date: "2027-01-15", display: "15 January 2027" },
  { label: "Regular Registration", date: "2027-01-30", display: "30 January 2027" },
  { label: "Camera-Ready Paper", date: "2027-02-15", display: "15 February 2027" },
  { label: "Conference Dates", date: "2027-03-02", end: "2027-03-03", display: "2-3 March 2027" },
];
