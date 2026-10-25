import { keep } from "@/lib/keep";

// Joining words stay on the line with both neighbours, so a part that must wrap on a phone breaks as
// "Department of / Business and Management", never "Business and / Management".
const glue = (s: string) => s.replace(/ (and|of|&|for|in|the) /g, "\u00a0$1\u00a0");

/**
 * Comma-separated text (a role, an affiliation, a place) that wraps only between its parts, so
 * "School of Business and Management" or "University of South Africa" never splits across lines.
 * A part wider than the line still wraps inside itself rather than overflowing.
 */
export function Phrases({ parts }: { parts: (string | undefined | null)[] }) {
  const list = parts.flatMap((p) => (p ? p.split(", ") : []));
  return list.map((p, i) => (
    <span key={i}>
      <span className="inline-block">
        {glue(keep(p))}
        {i < list.length - 1 ? "," : ""}
      </span>
      {i < list.length - 1 ? " " : ""}
    </span>
  ));
}
