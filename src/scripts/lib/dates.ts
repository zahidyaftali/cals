// Calendar dates as plain { y, m, d } values (m is 1–12). All arithmetic is
// done on whole UTC days, so time zones and daylight saving never move a date.

export interface YMD {
  y: number;
  m: number;
  d: number;
}

const DAY_MS = 86_400_000;
const pad = (n: number, width = 2) => String(n).padStart(width, '0');

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** Parses "YYYY-MM-DD" (the value of <input type="date">). Returns null if it isn't a real date. */
export function parseISODate(s: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!match) return null;
  const v = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  if (v.y < 1 || v.m < 1 || v.m > 12 || v.d < 1 || v.d > daysInMonth(v.y, v.m)) return null;
  return v;
}

export const toISO = (v: YMD) => `${pad(v.y, 4)}-${pad(v.m)}-${pad(v.d)}`;

/** Days since 1970-01-01. setUTCFullYear avoids Date.UTC's 1900 offset for years 0–99. */
export function toDayNumber(v: YMD): number {
  const t = new Date(0);
  t.setUTCFullYear(v.y, v.m - 1, v.d);
  return Math.round(t.getTime() / DAY_MS);
}

export function fromDayNumber(n: number): YMD {
  const t = new Date(n * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export const toUTCDate = (v: YMD) => new Date(toDayNumber(v) * DAY_MS);

/** 0 = Sunday … 6 = Saturday. 1970-01-01 was a Thursday. */
export const weekday = (v: YMD) => (((toDayNumber(v) % 7) + 7 + 4) % 7);

export const isWeekend = (v: YMD) => weekday(v) === 0 || weekday(v) === 6;

export const addDays = (v: YMD, n: number) => fromDayNumber(toDayNumber(v) + n);

export const daysBetween = (a: YMD, b: YMD) => toDayNumber(b) - toDayNumber(a);

/**
 * Adds calendar months. If the day doesn't exist in the target month (Jan 31 + 1 month),
 * it moves back to that month's last day and `clamped` is true.
 */
export function addMonths(v: YMD, n: number): { date: YMD; clamped: boolean } {
  const total = v.y * 12 + (v.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = total - y * 12 + 1;
  const last = daysInMonth(y, m);
  return { date: { y, m, d: Math.min(v.d, last) }, clamped: v.d > last };
}

export const dayOfYear = (v: YMD) => daysBetween({ y: v.y, m: 1, d: 1 }, v) + 1;

/** ISO 8601 week number: weeks start on Monday, week 1 contains the year's first Thursday. */
export function isoWeek(v: YMD): { year: number; week: number } {
  const mondayBased = (weekday(v) + 6) % 7; // Monday = 0
  const thursday = addDays(v, 3 - mondayBased);
  return { year: thursday.y, week: Math.floor((dayOfYear(thursday) - 1) / 7) + 1 };
}

/** Counts Monday–Friday days from `from` (inclusive) to `to` (exclusive). `to` must not be before `from`. */
export function countWeekdays(from: YMD, to: YMD): number {
  const start = toDayNumber(from);
  const days = toDayNumber(to) - start;
  const fullWeeks = Math.floor(days / 7);
  let count = fullWeeks * 5;
  const startWeekday = weekday(from);
  for (let i = 0; i < days % 7; i++) {
    const wd = (startWeekday + i) % 7;
    if (wd !== 0 && wd !== 6) count++;
  }
  return count;
}

/** Moves forward (or back, for negative n) by n Monday–Friday days. */
export function addBusinessDays(v: YMD, n: number): YMD {
  const step = n < 0 ? -1 : 1;
  let date = v;
  for (let left = Math.abs(n); left > 0; ) {
    date = addDays(date, step);
    if (!isWeekend(date)) left--;
  }
  return date;
}

/**
 * Whole years, months and days from a to b (a ≤ b), counting months the way a
 * calendar does: Jan 31 → Mar 1 is 1 month and 1 day (Jan 31 → Feb 28/29 → Mar 1).
 */
export function yearsMonthsDays(a: YMD, b: YMD): { years: number; months: number; days: number } {
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  let anchor = addMonths(a, months).date;
  if (toDayNumber(anchor) > toDayNumber(b)) {
    months -= 1;
    anchor = addMonths(a, months).date;
  }
  return { years: Math.floor(months / 12), months: months % 12, days: daysBetween(anchor, b) };
}

const longFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
const mediumFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });

/** "Wednesday, April 1, 2026" */
export const formatLong = (v: YMD) => longFormat.format(toUTCDate(v));
/** "April 1, 2026" */
export const formatMedium = (v: YMD) => mediumFormat.format(toUTCDate(v));
/** "Wednesday" */
export const weekdayName = (v: YMD) => weekdayFormat.format(toUTCDate(v));

/** Today's date in the visitor's own time zone. */
export function today(): YMD {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}
