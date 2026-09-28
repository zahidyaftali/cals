// Hijri ↔ Gregorian conversion with the Umm al-Qura calendar, using the
// browser's built-in Intl support (calendar "islamic-umalqura"). ICU carries
// Umm al-Qura data for 1300–1600 AH (Nov 12, 1882 – Nov 25, 2174); outside
// that range it switches to an arithmetic calendar, so input is limited to it.

import { addDays, parseISODate, toDayNumber, toISO, toUTCDate, type YMD } from '../lib/dates.ts';

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

export const HIJRI_MIN_YEAR = 1300;
export const HIJRI_MAX_YEAR = 1600;
export const GREGORIAN_MIN = '1882-11-12'; // 1 Muharram 1300
export const GREGORIAN_MAX = '2174-11-25'; // 30 Dhu al-Hijjah 1600

export const HIJRI_MONTHS = [
  { name: 'Muharram', arabic: 'محرم' },
  { name: 'Safar', arabic: 'صفر' },
  { name: 'Rabi al-Awwal', arabic: 'ربيع الأول' },
  { name: 'Rabi al-Thani', arabic: 'ربيع الآخر' },
  { name: 'Jumada al-Ula', arabic: 'جمادى الأولى' },
  { name: 'Jumada al-Akhirah', arabic: 'جمادى الآخرة' },
  { name: 'Rajab', arabic: 'رجب' },
  { name: 'Shaban', arabic: 'شعبان' },
  { name: 'Ramadan', arabic: 'رمضان' },
  { name: 'Shawwal', arabic: 'شوال' },
  { name: 'Dhu al-Qadah', arabic: 'ذو القعدة' },
  { name: 'Dhu al-Hijjah', arabic: 'ذو الحجة' },
] as const;

let formatter: Intl.DateTimeFormat | undefined;
function umalqura() {
  formatter ??= new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  return formatter;
}

/** True if this browser's Intl really supports the Umm al-Qura calendar. */
export function isSupported(): boolean {
  try {
    return umalqura().resolvedOptions().calendar === 'islamic-umalqura';
  } catch {
    return false;
  }
}

export function toHijri(date: YMD): HijriDate {
  const parts = umalqura().formatToParts(toUTCDate(date));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

const compare = (a: HijriDate, b: HijriDate) => a.year - b.year || a.month - b.month || a.day - b.day;

/** Rough Gregorian date for a Hijri date (tabular calendar), used as a search start. */
function estimate(h: HijriDate): number {
  const julianDay =
    Math.floor((11 * h.year + 3) / 30) + 354 * h.year + 30 * h.month - Math.floor((h.month - 1) / 2) + h.day + 1948440 - 385;
  return julianDay - 2440588; // Julian day → days since 1970-01-01
}

/**
 * Gregorian date for a Hijri date, or null if that day doesn't exist in the
 * Umm al-Qura calendar (e.g. the 30th of a 29-day month).
 */
export function toGregorian(h: HijriDate): YMD | null {
  let day = estimate(h);
  // The estimate is within a couple of days; step toward the exact date.
  for (let i = 0; i < 10; i++) {
    const diff = compare(h, toHijri(fromDay(day)));
    if (diff === 0) return fromDay(day);
    const step = Math.sign(diff);
    const next = toHijri(fromDay(day + step));
    // If we step past the target without hitting it, the date doesn't exist.
    if (compare(h, next) * step < 0) return null;
    day += step;
  }
  return null;
}

const fromDay = (n: number) => addDays({ y: 1970, m: 1, d: 1 }, n);

/** Number of days (29 or 30) in a Hijri month. */
export function monthLength(year: number, month: number): number {
  const first = toGregorian({ year, month, day: 1 });
  if (!first) return 30;
  return toHijri(addDays(first, 29)).month === month ? 30 : 29;
}

export function inGregorianRange(iso: string): boolean {
  return iso >= GREGORIAN_MIN && iso <= GREGORIAN_MAX;
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${HIJRI_MONTHS[h.month - 1].name} ${h.year} AH`;
}

/** Hijri date written in Arabic, e.g. "١ رمضان ١٤٤٦ هـ". */
export function formatHijriArabic(date: YMD): string {
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toUTCDate(date));
}

/**
 * Widely observed dates in a Hijri year. Other days (such as Mawlid or
 * Laylat al-Baraat) are observed by some communities and not others, so they
 * are not listed.
 */
export const KEY_DATES = [
  { month: 1, day: 1, name: 'Islamic New Year (1 Muharram)' },
  { month: 1, day: 10, name: 'Day of Ashura (10 Muharram)' },
  { month: 9, day: 1, name: 'First day of Ramadan' },
  { month: 10, day: 1, name: 'Eid al-Fitr (1 Shawwal)' },
  { month: 12, day: 8, name: 'Start of Hajj (8 Dhu al-Hijjah)' },
  { month: 12, day: 9, name: 'Day of Arafah (9 Dhu al-Hijjah)' },
  { month: 12, day: 10, name: 'Eid al-Adha (10 Dhu al-Hijjah)' },
] as const;

export function keyDates(year: number): { name: string; hijri: HijriDate; gregorian: YMD | null }[] {
  return KEY_DATES.map((k) => {
    const hijri = { year, month: k.month, day: k.day };
    return { name: k.name, hijri, gregorian: toGregorian(hijri) };
  });
}

export { parseISODate, toDayNumber, toISO };
