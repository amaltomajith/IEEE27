// Phrases that must never break across lines: the university's name, the campus, the index, and dates.
const MONTH = "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
const KEEP = new RegExp(
  [
    String.raw`(?:CHRIST )?\(Deemed to be University\)`,
    "Bangalore Kengeri Campus",
    "Scopus-Indexed",
    String.raw`\b\d{1,2}(?:-\d{1,2})? ${MONTH}(?: \d{4})?`,
    String.raw`\b${MONTH} \d{4}`,
  ].join("|"),
  "gi",
);

/** Swaps the spaces inside each protected phrase for no-break spaces. */
export const keep = (s: string) => s.replace(KEEP, (m) => m.replace(/ /g, "\u00a0"));

/**
 * Splits text into plain runs and protected phrases (odd indices), for large headings: rendered as inline-blocks,
 * a phrase still moves to the next line whole, but wraps inside itself when even a full line is too narrow for it,
 * where no-break spaces would push it past the edge.
 */
export const keepRuns = (s: string) => s.split(new RegExp(`(${KEEP.source})`, KEEP.flags));
