export type Milestone = {
  label: string;
  /** ISO date (local, Asia/Kolkata). */
  date: string;
  /** Inclusive end date for multi-day events. */
  end?: string;
  display: string;
};

// The source table lists the last five rows as 2026. That contradicts the hero
// ("March 2-3, 2027") and the Registration page ("January 2027"), so they are
// rendered as 2027 here.
export const milestones: Milestone[] = [
  { label: "Extended Abstract", date: "2026-10-20", display: "20 October 2026" },
  { label: "Abstract Notification", date: "2026-11-20", display: "20 November 2026" },
  { label: "Full Manuscript", date: "2026-12-01", display: "01 December 2026" },
  { label: "Manuscript Notification", date: "2027-01-05", display: "05 January 2027" },
  { label: "Early Bird Registration", date: "2027-01-15", display: "15 January 2027" },
  { label: "Regular Registration", date: "2027-01-30", display: "30 January 2027" },
  { label: "Camera Ready Paper", date: "2027-02-15", display: "15 February 2027" },
  { label: "Conference Dates", date: "2027-03-02", end: "2027-03-03", display: "2-3 March 2027" },
];
