const longDate = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });

const utc = (d: string) => new Date(d + "T00:00:00Z");

export const fmtLongDate = (d: string) => longDate.format(utc(d));
export const fmtShortDate = (d: string) => shortDate.format(utc(d));
export const fmtWeekday = (d: string) => weekday.format(utc(d));
export const fmtMonthYear = (d: Date) => monthYear.format(d);

export const fmtNum = (x: number | null, suffix = "") => (x === null ? "—" : `${Math.round(x)}${suffix}`);

// «22:35:27»–«23:11:13» → «36 min»
export function duration(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const sec = (t: string) => t.split(":").map(Number).reduce((a, x) => a * 60 + x, 0);
  let d = sec(end) - sec(start);
  if (d < 0) d += 24 * 3600;
  return `${Math.round(d / 60)} min`;
}

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
