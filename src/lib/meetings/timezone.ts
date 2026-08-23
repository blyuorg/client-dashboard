/**
 * Converts a wall-clock date+time in a given IANA timezone to a correct
 * UTC ISO instant — DST-aware, without a date library. No project
 * dependency (date-fns-tz, luxon, ...) exists yet and this one function is
 * all the timezone math this feature needs, so this avoids adding one.
 *
 * Standard technique: format a "naive" UTC guess back through the target
 * timezone with Intl.DateTimeFormat, measure how far off that round-trip
 * landed, and correct by exactly that amount. Using the actual target date
 * (not a fixed offset table) is what makes this DST-correct.
 */
export function zonedWallTimeToUtcIso(dateStr: string, timeStr: string, timeZone: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(naiveUtcMs));

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const roundTrippedUtcMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));

  const offsetMs = roundTrippedUtcMs - naiveUtcMs;
  return new Date(naiveUtcMs - offsetMs).toISOString();
}

/** Renders a UTC ISO instant as a wall-clock date+time string in the given IANA timezone. */
export function formatInTimezone(isoUtc: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoUtc));
}
