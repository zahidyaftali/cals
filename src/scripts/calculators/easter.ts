// Easter dates. Western Easter uses the Anonymous Gregorian algorithm
// (Meeus/Jones/Butcher); Orthodox Easter uses Meeus's Julian algorithm and is
// converted to the Gregorian calendar. Valid for 1583 (the first full year of
// the Gregorian calendar) to 4099.

import { addDays, type YMD } from '../lib/dates.ts';

export const MIN_YEAR = 1583;
export const MAX_YEAR = 4099;

export interface WesternSteps {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
  h: number;
  i: number;
  k: number;
  l: number;
  m: number;
}

export function westernEaster(year: number): { date: YMD; steps: WesternSteps } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { date: { y: year, m: month, d: day }, steps: { a, b, c, d, e, f, g, h, i, k, l, m } };
}

export interface OrthodoxSteps {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  julian: YMD;
  offset: number;
}

export function orthodoxEaster(year: number): { date: YMD; steps: OrthodoxSteps } {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julian = { y: year, m: month, d: day };
  // Days the Julian calendar is behind the Gregorian one (13 for 1900–2099).
  // The gap grows by a day on Julian February 29 of century years not
  // divisible by 400, always before the earliest Julian Easter (March 22),
  // so this offset is right for every Easter date in the year.
  const offset = Math.floor(year / 100) - Math.floor(year / 400) - 2;
  return { date: addDays(julian, offset), steps: { a, b, c, d, e, julian, offset } };
}

/** Moveable days tied to Western Easter (days from Easter Sunday). */
export const WESTERN_RELATED = [
  { name: 'Ash Wednesday', offset: -46 },
  { name: 'Palm Sunday', offset: -7 },
  { name: 'Maundy Thursday', offset: -3 },
  { name: 'Good Friday', offset: -2 },
  { name: 'Easter Sunday', offset: 0 },
  { name: 'Easter Monday', offset: 1 },
  { name: 'Ascension Day', offset: 39 },
  { name: 'Pentecost', offset: 49 },
] as const;

/** Moveable days tied to Orthodox Easter (Pascha). */
export const ORTHODOX_RELATED = [
  { name: 'Clean Monday (Great Lent begins)', offset: -48 },
  { name: 'Palm Sunday', offset: -7 },
  { name: 'Holy Friday', offset: -2 },
  { name: 'Pascha (Easter Sunday)', offset: 0 },
  { name: 'Ascension', offset: 39 },
  { name: 'Pentecost', offset: 49 },
] as const;

export const relatedDates = (easter: YMD, list: readonly { name: string; offset: number }[]) =>
  list.map((r) => ({ name: r.name, date: addDays(easter, r.offset) }));
