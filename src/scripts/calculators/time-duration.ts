// Time duration: the time between two clock times or date-times, adding or
// subtracting a duration, and adding up several durations. Dates are plain
// calendar dates (no time zones or daylight saving).

import { addDays, daysBetween, parseISODate, type YMD } from '../lib/dates.ts';

const DAY = 86_400;

export interface DurationInput {
  /** Seconds after midnight. */
  startTime: number;
  endTime: number;
  /** "YYYY-MM-DD" or empty. With no dates, the end is on the same day or the next day. */
  startDate?: string;
  endDate?: string;
}

export interface DurationResult {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True when no dates were given and the end time was earlier than the start (next day). */
  crossesMidnight: boolean;
}

export type DurationError = 'end-before-start' | 'bad-date';

export function duration(input: DurationInput): DurationResult | DurationError {
  let totalSeconds: number;
  let crossesMidnight = false;

  if (input.startDate || input.endDate) {
    // If only one date is given, the other is taken to be the same day.
    const start = parseISODate(input.startDate || input.endDate!);
    const end = parseISODate(input.endDate || input.startDate!);
    if (!start || !end) return 'bad-date';
    totalSeconds = daysBetween(start, end) * DAY + input.endTime - input.startTime;
    if (totalSeconds < 0) return 'end-before-start';
  } else {
    totalSeconds = input.endTime - input.startTime;
    if (totalSeconds < 0) {
      totalSeconds += DAY;
      crossesMidnight = true;
    }
  }

  return { totalSeconds, ...split(totalSeconds), crossesMidnight };
}

export function split(totalSeconds: number) {
  const t = Math.abs(totalSeconds);
  return {
    days: Math.floor(t / DAY),
    hours: Math.floor((t % DAY) / 3600),
    minutes: Math.floor((t % 3600) / 60),
    seconds: t % 60,
  };
}

export interface ShiftedTime {
  /** Resulting clock time, seconds after midnight. */
  time: number;
  /** Whole days moved forward (positive) or back (negative). */
  dayOffset: number;
  /** Resulting date, when a start date was given. */
  date?: YMD;
}

/** Adds (or, with a negative delta, subtracts) seconds to a clock time and optional date. */
export function shiftTime(startTime: number, deltaSeconds: number, startDate?: YMD): ShiftedTime {
  const total = startTime + deltaSeconds;
  const dayOffset = Math.floor(total / DAY);
  const time = total - dayOffset * DAY;
  return { time, dayOffset, date: startDate ? addDays(startDate, dayOffset) : undefined };
}

/** Sums durations given in seconds (negative entries subtract). */
export const sumDurations = (items: number[]) => items.reduce((a, b) => a + b, 0);

/** 30600 → "8:30:00" (hours can exceed 24; negative gets a minus sign). */
export function hms(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '−' : '';
  const t = Math.abs(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 34200 → "9:30 AM", 34215 → "9:30:15 AM" */
export function clock12(seconds: number): string {
  const s = ((seconds % DAY) + DAY) % DAY;
  const h24 = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const secPart = sec ? `:${String(sec).padStart(2, '0')}` : '';
  return `${h12}:${String(m).padStart(2, '0')}${secPart} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** "2 days, 3 hours, 5 minutes" — skips zero parts, always shows something. */
export function describe(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = split(totalSeconds);
  const parts: string[] = [];
  const add = (n: number, word: string) => n && parts.push(`${n} ${word}${n === 1 ? '' : 's'}`);
  add(days, 'day');
  add(hours, 'hour');
  add(minutes, 'minute');
  add(seconds, 'second');
  return parts.length ? parts.join(', ') : '0 minutes';
}
