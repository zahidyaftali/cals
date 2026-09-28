// Date calculator: add or subtract years, months, weeks and days from a date.
// Years and months are applied first (a month that lacks the day moves to its
// last day: Jan 31 + 1 month = Feb 28 or 29), then weeks, then days.

import { addBusinessDays, addDays, addMonths, daysBetween, type YMD } from '../lib/dates.ts';

export interface DateCalcInput {
  start: YMD;
  /** +1 to add, −1 to subtract. */
  direction: 1 | -1;
  years: number;
  months: number;
  weeks: number;
  days: number;
  /** Count the days as business days (Monday–Friday). Weeks stay calendar weeks. */
  businessDays?: boolean;
}

export interface DateCalcResult {
  date: YMD;
  /** Date after the years and months step (before weeks and days). */
  afterMonths: YMD;
  /** True if the month step had to move to the end of a shorter month. */
  clamped: boolean;
  /** Calendar days from start to result (negative when subtracting). */
  calendarDays: number;
}

export function calculateDate(input: DateCalcInput): DateCalcResult {
  const sign = input.direction;
  const { date: afterMonths, clamped } = addMonths(input.start, sign * (input.years * 12 + input.months));
  const afterWeeks = addDays(afterMonths, sign * input.weeks * 7);
  const date = input.businessDays
    ? addBusinessDays(afterWeeks, sign * input.days)
    : addDays(afterWeeks, sign * input.days);
  return { date, afterMonths, clamped, calendarDays: daysBetween(input.start, date) };
}
