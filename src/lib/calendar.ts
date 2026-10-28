import type { DatedMilestone } from "@/content/dates";
import { site } from "@/content/site";

const d = (iso: string) => iso.replaceAll("-", "");
const nextDay = (iso: string) => {
  const t = new Date(iso + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
};

/**
 * Google Calendar "create event" link, prefilled as an all-day event; the visitor only has to press Save.
 * Reminders cannot be set through this URL, so Google applies the visitor's default all-day notifications.
 */
export const googleCalendarUrl = (m: DatedMilestone) => {
  const conference = !!m.end;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: conference ? site.name : `${site.short}: ${m.label}`,
    // All-day events take an exclusive end date.
    dates: `${d(m.date)}/${d(nextDay(m.end ?? m.date))}`,
    details: conference
      ? `${site.theme}\n${site.mode}, ${site.host}, ${site.campus}.\n\n${site.url}/`
      : `${m.label} for ${site.name} (${m.display}).\n\nImportant dates: ${site.url}/important-dates/`,
    ctz: "Asia/Kolkata",
  });
  if (conference) params.set("location", `${site.host}, ${site.campus}`);
  return `https://calendar.google.com/calendar/render?${params}`;
};
