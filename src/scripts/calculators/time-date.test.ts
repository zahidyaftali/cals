import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseISODate, toISO } from '../lib/dates.ts';
import { roundClock, shift, week } from './hours.ts';
import { clock12, duration, hms, shiftTime, sumDurations } from './time-duration.ts';
import { daysBetweenDates } from './days-between.ts';
import { calculateDate } from './date-calc.ts';

const d = (s: string) => parseISODate(s)!;
const t = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

test('hours: day and overnight shifts', () => {
  assert.deepEqual(shift({ start: t('09:00'), end: t('17:30'), breakMinutes: 30 }), { span: 510, worked: 480, overnight: false });
  assert.deepEqual(shift({ start: t('22:00'), end: t('06:00'), breakMinutes: 0 }), { span: 480, worked: 480, overnight: true });
  assert.equal(shift({ start: t('09:00'), end: t('10:00'), breakMinutes: 90 }), null);
});

test('hours: clock rounding to the nearest step', () => {
  assert.equal(roundClock(t('08:07'), 15), t('08:00'));
  assert.equal(roundClock(t('08:08'), 15), t('08:15'));
  assert.equal(roundClock(t('08:03'), 6), t('08:06'));
  assert.equal(roundClock(t('08:02'), 5), t('08:00'));
});

test('hours: weekly total with overtime pay', () => {
  const five = week([480, 480, 480, 480, 480], { rate: 20 });
  assert.equal(five.decimalHours, 40);
  assert.equal(five.totalPay, 800);
  const ot = week([540, 540, 540, 540, 540], { rate: 20, overtime: true });
  assert.equal(ot.overtimeMinutes, 300);
  assert.equal(ot.totalPay, 40 * 20 + 5 * 30); // $950
  const daily = week([2700], { rate: 18.5, overtime: true, thresholdHours: 40, multiplier: 2 });
  assert.equal(daily.totalPay, 40 * 18.5 + 5 * 37); // $925
});

test('duration: same day, overnight and multi-day', () => {
  assert.equal(hms((duration({ startTime: 33300, endTime: 63900 }) as any).totalSeconds), '8:30:00');
  const night = duration({ startTime: 22.5 * 3600, endTime: 1.25 * 3600 }) as any;
  assert.equal(night.totalSeconds, 2.75 * 3600);
  assert.equal(night.crossesMidnight, true);
  const multi = duration({ startDate: '2026-01-01', startTime: 8 * 3600, endDate: '2026-01-03', endTime: 10.5 * 3600 }) as any;
  assert.equal(hms(multi.totalSeconds), '50:30:00');
  assert.equal(multi.days, 2);
  assert.equal(duration({ startDate: '2026-01-02', startTime: 0, endDate: '2026-01-01', endTime: 0 }), 'end-before-start');
});

test('duration: add and subtract time, sum durations', () => {
  const later = shiftTime(22 * 3600, 5 * 3600, d('2026-12-31'));
  assert.equal(clock12(later.time), '3:00 AM');
  assert.equal(later.dayOffset, 1);
  assert.equal(toISO(later.date!), '2027-01-01');
  const earlier = shiftTime(1 * 3600, -3 * 3600);
  assert.equal(clock12(earlier.time), '10:00 PM');
  assert.equal(earlier.dayOffset, -1);
  assert.equal(hms(sumDurations([5400, 9900, 2700])), '5:00:00'); // 1:30 + 2:45 + 0:45
});

test('days between dates', () => {
  const year = daysBetweenDates(d('2024-01-01'), d('2024-12-31'));
  assert.equal(year.days, 365);
  assert.equal(daysBetweenDates(d('2024-01-01'), d('2024-12-31'), true).days, 366);
  const r = daysBetweenDates(d('2026-09-28'), d('2026-12-25'));
  assert.equal(r.days, 88);
  assert.deepEqual([r.weeks, r.remainderDays], [12, 4]);
  assert.deepEqual([r.years, r.months, r.monthDays], [0, 2, 27]);
  assert.equal(r.weekdays, 64);
  const swapped = daysBetweenDates(d('2026-12-25'), d('2026-09-28'));
  assert.equal(swapped.days, 88);
  assert.equal(swapped.swapped, true);
});

test('date calculator', () => {
  const base = { direction: 1 as const, years: 0, months: 0, weeks: 0, days: 0 };
  assert.equal(toISO(calculateDate({ ...base, start: d('2026-01-01'), days: 90 }).date), '2026-04-01');
  const feb = calculateDate({ ...base, start: d('2024-01-31'), months: 1 });
  assert.equal(toISO(feb.date), '2024-02-29');
  assert.equal(feb.clamped, true);
  assert.equal(toISO(calculateDate({ ...base, start: d('2024-02-29'), years: 1 }).date), '2025-02-28');
  assert.equal(toISO(calculateDate({ ...base, start: d('2026-03-01'), direction: -1, days: 1 }).date), '2026-02-28');
  assert.equal(toISO(calculateDate({ ...base, start: d('2026-09-25'), days: 1, businessDays: true }).date), '2026-09-28');
  const combo = calculateDate({ ...base, start: d('2026-09-28'), years: 1, months: 2, weeks: 1, days: 3 });
  assert.equal(toISO(combo.date), '2027-12-08');
});
