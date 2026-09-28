// Days between two dates: calendar days, weeks, years/months/days and weekdays.

import { addDays, countWeekdays, daysBetween, toDayNumber, yearsMonthsDays, type YMD } from '../lib/dates.ts';

export interface DaysBetweenResult {
  /** Days counted (includes the end date when `includeEnd` is set). */
  days: number;
  weeks: number;
  remainderDays: number;
  years: number;
  months: number;
  monthDays: number;
  /** Monday–Friday days in the same span. */
  weekdays: number;
  weekendDays: number;
  /** True if the end date was before the start date (the dates were swapped). */
  swapped: boolean;
}

export function daysBetweenDates(a: YMD, b: YMD, includeEnd = false): DaysBetweenResult {
  const swapped = toDayNumber(b) < toDayNumber(a);
  const [start, end] = swapped ? [b, a] : [a, b];
  // Counting the end date is the same as counting up to the day after it.
  const stop = includeEnd ? addDays(end, 1) : end;
  const days = daysBetween(start, stop);
  const ymd = yearsMonthsDays(start, stop);
  const weekdays = countWeekdays(start, stop);
  return {
    days,
    weeks: Math.floor(days / 7),
    remainderDays: days % 7,
    years: ymd.years,
    months: ymd.months,
    monthDays: ymd.days,
    weekdays,
    weekendDays: days - weekdays,
    swapped,
  };
}
