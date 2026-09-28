// Chinese zodiac from a date of birth. The zodiac year starts at Lunar New
// Year (not January 1), so the date is first placed in its lunar year using
// the Hong Kong Observatory's published Lunar New Year dates
// (src/data/lunar-new-year.ts). Then:
//
//   animal = (lunar year − 4) mod 12   → Rat, Ox, Tiger, …
//   stem   = (lunar year − 4) mod 10   → Wood, Wood, Fire, Fire, … (yang, yin)
//
// 1984 (a Wood Rat year) is the start of the current 60-year cycle.

import { FIRST_YEAR, LAST_YEAR, LUNAR_NEW_YEAR } from '../../data/lunar-new-year.ts';
import { addDays, parseISODate, toDayNumber, type YMD } from '../lib/dates.ts';

export const ANIMALS = [
  { name: 'Rat', hanzi: '鼠', branch: '子', pinyin: 'zǐ' },
  { name: 'Ox', hanzi: '牛', branch: '丑', pinyin: 'chǒu' },
  { name: 'Tiger', hanzi: '虎', branch: '寅', pinyin: 'yín' },
  { name: 'Rabbit', hanzi: '兔', branch: '卯', pinyin: 'mǎo' },
  { name: 'Dragon', hanzi: '龙', branch: '辰', pinyin: 'chén' },
  { name: 'Snake', hanzi: '蛇', branch: '巳', pinyin: 'sì' },
  { name: 'Horse', hanzi: '马', branch: '午', pinyin: 'wǔ' },
  { name: 'Goat', hanzi: '羊', branch: '未', pinyin: 'wèi' },
  { name: 'Monkey', hanzi: '猴', branch: '申', pinyin: 'shēn' },
  { name: 'Rooster', hanzi: '鸡', branch: '酉', pinyin: 'yǒu' },
  { name: 'Dog', hanzi: '狗', branch: '戌', pinyin: 'xū' },
  { name: 'Pig', hanzi: '猪', branch: '亥', pinyin: 'hài' },
] as const;

export const STEMS = [
  { stem: '甲', pinyin: 'jiǎ', element: 'Wood', yin: false },
  { stem: '乙', pinyin: 'yǐ', element: 'Wood', yin: true },
  { stem: '丙', pinyin: 'bǐng', element: 'Fire', yin: false },
  { stem: '丁', pinyin: 'dīng', element: 'Fire', yin: true },
  { stem: '戊', pinyin: 'wù', element: 'Earth', yin: false },
  { stem: '己', pinyin: 'jǐ', element: 'Earth', yin: true },
  { stem: '庚', pinyin: 'gēng', element: 'Metal', yin: false },
  { stem: '辛', pinyin: 'xīn', element: 'Metal', yin: true },
  { stem: '壬', pinyin: 'rén', element: 'Water', yin: false },
  { stem: '癸', pinyin: 'guǐ', element: 'Water', yin: true },
] as const;

/** Dates covered by the table: from Lunar New Year 1900 to the end of 2100. */
export const MIN_DATE = `${FIRST_YEAR}-${LUNAR_NEW_YEAR[FIRST_YEAR]}`;
export const MAX_DATE = `${LAST_YEAR}-12-31`;
export { FIRST_YEAR, LAST_YEAR };

/** Lunar New Year that begins lunar year `year` (1900–2100). */
export function lunarNewYear(year: number): YMD {
  const md = LUNAR_NEW_YEAR[year];
  if (!md) throw new Error(`No Lunar New Year date for ${year}`);
  return parseISODate(`${year}-${md}`)!;
}

/** The lunar year a date belongs to: its own year from Lunar New Year onward, otherwise the year before. */
export function lunarYearOf(date: YMD): number {
  return toDayNumber(date) >= toDayNumber(lunarNewYear(date.y)) ? date.y : date.y - 1;
}

export interface ZodiacSign {
  lunarYear: number;
  animal: (typeof ANIMALS)[number];
  stem: (typeof STEMS)[number];
  element: string;
  yinYang: 'Yin' | 'Yang';
  /** First and last day of this zodiac year (`ends` is null for 2100, the end of the table). */
  starts: YMD;
  ends: YMD | null;
  animalIndex: number;
  stemIndex: number;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function signForLunarYear(lunarYear: number): ZodiacSign {
  const animalIndex = mod(lunarYear - 4, 12);
  const stemIndex = mod(lunarYear - 4, 10);
  const stem = STEMS[stemIndex];
  return {
    lunarYear,
    animal: ANIMALS[animalIndex],
    stem,
    element: stem.element,
    yinYang: stem.yin ? 'Yin' : 'Yang',
    starts: lunarNewYear(lunarYear),
    ends: lunarYear < LAST_YEAR ? addDays(lunarNewYear(lunarYear + 1), -1) : null,
    animalIndex,
    stemIndex,
  };
}

export const signForDate = (date: YMD) => signForLunarYear(lunarYearOf(date));
