// Hours calculator (time card): hours worked per day from start/end times and
// unpaid breaks, with a weekly total, optional clock rounding, and optional
// pay with overtime.

export interface ShiftInput {
  /** Minutes after midnight. */
  start: number;
  end: number;
  /** Unpaid break in minutes. */
  breakMinutes: number;
}

export interface ShiftResult {
  /** Minutes from start to end, before the break. */
  span: number;
  /** Minutes worked (span − break). */
  worked: number;
  /** True when the end time is on the next day (e.g. 22:00 → 06:00). */
  overnight: boolean;
}

export const MINUTES_PER_DAY = 24 * 60;

/**
 * A shift that ends before its start time is taken to finish the next day.
 * Equal start and end times count as a zero-length shift, not 24 hours.
 * Returns null if the break is longer than the shift.
 */
export function shift({ start, end, breakMinutes }: ShiftInput): ShiftResult | null {
  const overnight = end < start;
  const span = overnight ? end + MINUTES_PER_DAY - start : end - start;
  if (breakMinutes > span) return null;
  return { span, worked: span - breakMinutes, overnight };
}

/**
 * Rounds a clock time to the nearest `step` minutes (the way many time clocks
 * do): with 15-minute rounding, 8:07 → 8:00 and 8:08 → 8:15. Halves round up.
 */
export function roundClock(minutes: number, step: number): number {
  if (step <= 1) return minutes;
  return (Math.round(minutes / step) * step) % MINUTES_PER_DAY;
}

export interface PayOptions {
  /** Hourly rate; omit for no pay calculation. */
  rate?: number;
  /** Pay overtime for hours over `thresholdHours` in the week. */
  overtime?: boolean;
  thresholdHours?: number;
  multiplier?: number;
}

export interface WeekResult {
  totalMinutes: number;
  decimalHours: number;
  regularMinutes: number;
  overtimeMinutes: number;
  regularPay?: number;
  overtimePay?: number;
  totalPay?: number;
}

export function week(workedMinutes: number[], pay: PayOptions = {}): WeekResult {
  const totalMinutes = workedMinutes.reduce((sum, m) => sum + m, 0);
  const threshold = (pay.thresholdHours ?? 40) * 60;
  const overtimeMinutes = pay.overtime ? Math.max(0, totalMinutes - threshold) : 0;
  const regularMinutes = totalMinutes - overtimeMinutes;
  const result: WeekResult = {
    totalMinutes,
    decimalHours: totalMinutes / 60,
    regularMinutes,
    overtimeMinutes,
  };
  if (pay.rate !== undefined) {
    // Work in cents to avoid floating-point drift.
    const regularCents = Math.round((regularMinutes / 60) * pay.rate * 100);
    const overtimeCents = Math.round((overtimeMinutes / 60) * pay.rate * (pay.multiplier ?? 1.5) * 100);
    result.regularPay = regularCents / 100;
    result.overtimePay = overtimeCents / 100;
    result.totalPay = (regularCents + overtimeCents) / 100;
  }
  return result;
}

/** 570 → "9:30 AM" */
export function formatClock12(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}
