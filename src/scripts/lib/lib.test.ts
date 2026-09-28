import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addBusinessDays,
  addDays,
  addMonths,
  countWeekdays,
  dayOfYear,
  daysBetween,
  formatLong,
  isoWeek,
  parseISODate,
  toISO,
  weekday,
  yearsMonthsDays,
} from './dates.ts';
import { clockDuration, formatMoney, formatNumber, hoursMinutes, roundMoney } from './format.ts';

const d = (s: string) => parseISODate(s)!;

test('parseISODate rejects impossible dates', () => {
  assert.equal(parseISODate('2023-02-29'), null);
  assert.deepEqual(parseISODate('2024-02-29'), { y: 2024, m: 2, d: 29 });
  assert.equal(parseISODate('2024-13-01'), null);
  assert.equal(parseISODate('hello'), null);
});

test('weekday and long format', () => {
  assert.equal(weekday(d('1970-01-01')), 4); // Thursday
  assert.equal(weekday(d('2026-09-28')), 1); // Monday
  assert.equal(formatLong(d('2026-04-01')), 'Wednesday, April 1, 2026');
});

test('day arithmetic across leap years', () => {
  assert.equal(daysBetween(d('2024-01-01'), d('2024-12-31')), 365);
  assert.equal(daysBetween(d('2023-01-01'), d('2024-01-01')), 365);
  assert.equal(daysBetween(d('2024-01-01'), d('2025-01-01')), 366);
  assert.equal(toISO(addDays(d('2026-01-01'), 90)), '2026-04-01');
  assert.equal(toISO(addDays(d('2026-03-01'), -1)), '2026-02-28');
});

test('addMonths clamps to the end of shorter months', () => {
  assert.deepEqual(addMonths(d('2024-01-31'), 1), { date: d('2024-02-29'), clamped: true });
  assert.deepEqual(addMonths(d('2023-01-31'), 1), { date: d('2023-02-28'), clamped: true });
  assert.deepEqual(addMonths(d('2024-02-29'), 12), { date: d('2025-02-28'), clamped: true });
  assert.deepEqual(addMonths(d('2026-03-15'), -3), { date: d('2025-12-15'), clamped: false });
});

test('years, months and days between dates', () => {
  assert.deepEqual(yearsMonthsDays(d('2025-01-31'), d('2025-03-01')), { years: 0, months: 1, days: 1 });
  assert.deepEqual(yearsMonthsDays(d('2026-09-28'), d('2026-12-25')), { years: 0, months: 2, days: 27 });
  assert.deepEqual(yearsMonthsDays(d('1990-05-15'), d('2026-09-28')), { years: 36, months: 4, days: 13 });
});

test('weekday counting and business days', () => {
  assert.equal(countWeekdays(d('2024-01-01'), d('2024-01-08')), 5); // Mon → next Mon
  assert.equal(countWeekdays(d('2026-09-26'), d('2026-09-28')), 0); // Sat, Sun
  assert.equal(countWeekdays(d('2024-01-01'), d('2025-01-01')), 262);
  assert.equal(toISO(addBusinessDays(d('2026-09-25'), 1)), '2026-09-28'); // Fri → Mon
  assert.equal(toISO(addBusinessDays(d('2026-09-28'), -1)), '2026-09-25');
  assert.equal(toISO(addBusinessDays(d('2026-09-28'), 10)), '2026-10-12');
});

test('ISO week and day of year', () => {
  assert.deepEqual(isoWeek(d('2026-01-01')), { year: 2026, week: 1 });
  assert.deepEqual(isoWeek(d('2021-01-03')), { year: 2020, week: 53 });
  assert.deepEqual(isoWeek(d('2026-09-28')), { year: 2026, week: 40 });
  assert.equal(dayOfYear(d('2024-12-31')), 366);
});

test('number and money formatting', () => {
  assert.equal(formatNumber(1234.567), '1,234.57');
  assert.equal(formatNumber(-0.001), '0');
  assert.equal(formatMoney(1234.5), '$1,234.50');
  assert.equal(formatMoney(10, 'GBP'), '£10.00');
  assert.equal(formatMoney(10, 'XYZ1'), '10.00 XYZ1');
  assert.equal(roundMoney(1.005), 1.01);
  assert.equal(roundMoney(1234.005), 1234.01);
  assert.equal(hoursMinutes(510), '8 h 30 min');
  assert.equal(hoursMinutes(480), '8 h');
  assert.equal(clockDuration(2310), '38:30');
});
