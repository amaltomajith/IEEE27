// Phrases that must never break across lines: the university's name, the campus, and dates.
const MONTH = "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
const KEEP = new RegExp(
  [
    String.raw`(?:CHRIST )?\(Deemed to be University\)`,
    "Bangalore Kengeri Campus",
    String.raw`\b\d{1,2}(?:-\d{1,2})? ${MONTH}(?: \d{4})?`,
    String.raw`\b${MONTH} \d{4}`,
  ].join("|"),
  "gi",
);

/** Swaps the spaces inside each protected phrase for no-break spaces. */
export const keep = (s: string) => s.replace(KEEP, (m) => m.replace(/ /g, "\u00a0"));
