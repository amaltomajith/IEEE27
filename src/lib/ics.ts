import { milestones } from "@/content/dates";
import { site } from "@/content/site";

const d = (iso: string) => iso.replaceAll("-", "");
const nextDay = (iso: string) => {
  const t = new Date(iso + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
};

export const buildIcs = () => {
  const stamp = "20261016T000000Z";
  const events = milestones.map((m, i) =>
    [
      "BEGIN:VEVENT",
      `UID:iic2027-${i}@christuniversity.in`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d(m.date)}`,
      `DTEND;VALUE=DATE:${d(nextDay(m.end ?? m.date))}`,
      `SUMMARY:${site.short}: ${m.label}`,
      `URL:${site.url}/important-dates/`,
      "END:VEVENT",
    ].join("\r\n"),
  );
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IIC 2027//Important Dates//EN", ...events, "END:VCALENDAR"].join("\r\n");
};

export const downloadIcs = () => {
  const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "iic2027-dates.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
