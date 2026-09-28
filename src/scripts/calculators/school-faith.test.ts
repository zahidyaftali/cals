import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseISODate, toISO } from '../lib/dates.ts';
import { courseGrade, finalGradeNeeded, letterFor } from './final-grade.ts';
import { pricePerGram, toGrams, zakat, type ZakatInput } from './zakat.ts';
import { keyDates, monthLength, toGregorian, toHijri } from './hijri.ts';
import { orthodoxEaster, relatedDates, westernEaster, WESTERN_RELATED } from './easter.ts';
import { lunarNewYear, signForDate, signForLunarYear } from './chinese-zodiac.ts';

const d = (s: string) => parseISODate(s)!;
const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`);

test('final grade needed', () => {
  const hard = finalGradeNeeded(85, 90, 30);
  close(hard.needed, 101.67);
  assert.equal(hard.status, 'out-of-reach');
  assert.equal(finalGradeNeeded(72, 70, 20).needed, 62);
  assert.equal(finalGradeNeeded(95, 70, 20).status, 'already-secured');
  assert.equal(finalGradeNeeded(80, 85, 100).needed, 85);
  assert.equal(courseGrade(85, 80, 30), 83.5);
  assert.equal(letterFor(83.5), 'B');
  assert.equal(letterFor(59.9), 'F');
});

const zakatBase: ZakatInput = {
  standard: 'silver',
  goldPricePerGram: 100,
  silverPricePerGram: 1,
  cash: 0,
  goldGrams: 0,
  goldKarat: 24,
  silverGrams: 0,
  silverFineness: 999,
  investments: 0,
  businessAssets: 0,
  owedToYou: 0,
  otherAssets: 0,
  liabilities: 0,
};

test('zakat: nisab and 2.5% of net wealth', () => {
  const r = zakat({ ...zakatBase, cash: 10000, goldGrams: 20, goldKarat: 22, liabilities: 1000 });
  close(r.goldValue, 1833.33);
  close(r.netWealth, 10833.33);
  close(r.zakat, 270.83);
  close(r.nisabSilver, 612.36);
  close(r.nisabGold, 8748);
  assert.equal(zakat({ ...zakatBase, cash: 500 }).zakat, 0); // below the silver nisab
  assert.equal(zakat({ ...zakatBase, standard: 'gold', cash: 8000 }).aboveNisab, false); // below the gold nisab
  close(zakat({ ...zakatBase, standard: 'gold', cash: 8748 }).zakat, 218.7); // exactly at nisab
  close(zakat({ ...zakatBase, silverGrams: 100, silverFineness: 925 }).pureSilverGrams, 92.5);
  close(toGrams(1, 'tola'), 11.6638);
  close(pricePerGram(1166.38038, 'tola'), 100);
});

test('hijri: Umm al-Qura conversions both ways', () => {
  assert.deepEqual(toHijri(d('2025-03-01')), { year: 1446, month: 9, day: 1 });
  assert.equal(toISO(toGregorian({ year: 1446, month: 9, day: 1 })!), '2025-03-01');
  assert.equal(toISO(toGregorian({ year: 1446, month: 10, day: 1 })!), '2025-03-30');
  assert.equal(toISO(toGregorian({ year: 1447, month: 1, day: 1 })!), '2025-06-26');
  assert.equal(toISO(toGregorian({ year: 1300, month: 1, day: 1 })!), '1882-11-12');
  assert.equal(toISO(toGregorian({ year: 1600, month: 12, day: 30 })!), '2174-11-25');
  assert.equal(monthLength(1446, 9), 29);
  assert.equal(toGregorian({ year: 1446, month: 9, day: 30 }), null);
  // Round trip a range of dates.
  for (let day = 0; day < 800; day += 7) {
    const g = parseISODate('2024-01-01')!;
    const date = { y: g.y, m: g.m, d: g.d };
    const shifted = new Date(Date.UTC(date.y, date.m - 1, date.d + day));
    const ymd = { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
    assert.equal(toISO(toGregorian(toHijri(ymd))!), toISO(ymd));
  }
  const dates = keyDates(1446);
  assert.equal(toISO(dates.find((k) => k.name.startsWith('Eid al-Fitr'))!.gregorian!), '2025-03-30');
  assert.equal(toISO(dates.find((k) => k.name.startsWith('Eid al-Adha'))!.gregorian!), '2025-06-06');
});

test('easter: Western dates', () => {
  const cases: [number, string][] = [
    [1818, '1818-03-22'],
    [1943, '1943-04-25'],
    [2000, '2000-04-23'],
    [2008, '2008-03-23'],
    [2019, '2019-04-21'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2038, '2038-04-25'],
    [2285, '2285-03-22'],
  ];
  for (const [year, iso] of cases) assert.equal(toISO(westernEaster(year).date), iso, String(year));
});

test('easter: Orthodox dates', () => {
  const cases: [number, string][] = [
    [2019, '2019-04-28'],
    [2021, '2021-05-02'],
    [2023, '2023-04-16'],
    [2024, '2024-05-05'],
    [2025, '2025-04-20'],
    [2026, '2026-04-12'],
    [2027, '2027-05-02'],
  ];
  for (const [year, iso] of cases) assert.equal(toISO(orthodoxEaster(year).date), iso, String(year));
  assert.equal(orthodoxEaster(2024).steps.offset, 13);
  assert.equal(orthodoxEaster(2100).steps.offset, 14);
});

test('easter: related days for 2026', () => {
  const related = relatedDates(westernEaster(2026).date, WESTERN_RELATED);
  const get = (name: string) => toISO(related.find((r) => r.name === name)!.date);
  assert.equal(get('Ash Wednesday'), '2026-02-18');
  assert.equal(get('Good Friday'), '2026-04-03');
  assert.equal(get('Pentecost'), '2026-05-24');
});

test('chinese zodiac: Lunar New Year boundary', () => {
  // Hong Kong Observatory dates, including the three years where the Intl
  // "chinese" calendar disagrees (1954, 2027, 2030).
  assert.equal(toISO(lunarNewYear(1954)), '1954-02-03');
  assert.equal(toISO(lunarNewYear(2027)), '2027-02-06');
  assert.equal(toISO(lunarNewYear(2030)), '2030-02-03');
  assert.equal(signForDate(d('2027-02-06')).animal.name, 'Goat');
  assert.equal(signForDate(d('2027-02-05')).animal.name, 'Horse');
  assert.equal(toISO(signForDate(d('2026-06-01')).ends!), '2027-02-05');
  assert.equal(toISO(lunarNewYear(1900)), '1900-01-31');
  assert.equal(signForLunarYear(2100).ends, null);
  assert.equal(toISO(lunarNewYear(2024)), '2024-02-10');
  assert.equal(toISO(lunarNewYear(2025)), '2025-01-29');
  assert.equal(toISO(lunarNewYear(2026)), '2026-02-17');
  assert.equal(toISO(lunarNewYear(1985)), '1985-02-20');
  assert.equal(toISO(lunarNewYear(2020)), '2020-01-25');

  const dragon = signForDate(d('2024-02-10'));
  assert.deepEqual([dragon.animal.name, dragon.element, dragon.yinYang], ['Dragon', 'Wood', 'Yang']);
  assert.equal(toISO(dragon.ends), '2025-01-28');
  const rabbit = signForDate(d('2024-02-09'));
  assert.deepEqual([rabbit.animal.name, rabbit.element, rabbit.yinYang, rabbit.lunarYear], ['Rabbit', 'Water', 'Yin', 2023]);
  const snake = signForDate(d('1990-01-20'));
  assert.deepEqual([snake.animal.name, snake.element, snake.lunarYear], ['Snake', 'Earth', 1989]);
  assert.deepEqual([signForDate(d('2000-02-05')).animal.name, signForDate(d('2000-02-05')).element], ['Dragon', 'Metal']);
  assert.deepEqual([signForDate(d('2000-02-04')).animal.name, signForDate(d('2000-02-04')).element], ['Rabbit', 'Earth']);
  // A date inside a leap month (2025 has a leap 6th month) stays in the same year.
  assert.equal(signForDate(d('2025-08-01')).animal.name, 'Snake');
  assert.equal(signForLunarYear(1984).animal.name, 'Rat');
  assert.equal(signForLunarYear(1984).stem.stem, '甲');
});
