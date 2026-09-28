// Zakat on wealth: 2.5% of net zakatable wealth, due when it is at or above
// the nisab (the value of 87.48 g of gold or 612.36 g of silver).

import { METAL_WEIGHT, type MetalWeightUnit } from '../lib/units.ts';

export const ZAKAT_RATE = 0.025;
export const NISAB_GOLD_GRAMS = 87.48;
export const NISAB_SILVER_GRAMS = 612.36;

/** Share of pure gold by karat (24k = pure). */
export const purityOfKarat = (karat: number) => karat / 24;

/** Share of pure silver by fineness (e.g. sterling 925 = 0.925). */
export const SILVER_FINENESS = [
  { value: '999', label: 'Fine silver (999)' },
  { value: '958', label: 'Britannia (958)' },
  { value: '925', label: 'Sterling (925)' },
  { value: '900', label: 'Coin silver (900)' },
  { value: '800', label: '800 silver' },
] as const;

export type NisabStandard = 'gold' | 'silver';

export interface ZakatInput {
  standard: NisabStandard;
  /** Price of one gram of pure gold and of pure silver, in the chosen currency. */
  goldPricePerGram: number;
  silverPricePerGram: number;
  cash: number;
  /** Weight of gold held, in grams of the item (not pure gold). */
  goldGrams: number;
  goldKarat: number;
  silverGrams: number;
  /** Silver fineness in parts per thousand (999, 925 …). */
  silverFineness: number;
  investments: number;
  businessAssets: number;
  owedToYou: number;
  otherAssets: number;
  /** Debts and bills due now, deducted from wealth. */
  liabilities: number;
}

export interface ZakatResult {
  pureGoldGrams: number;
  pureSilverGrams: number;
  goldValue: number;
  silverValue: number;
  totalAssets: number;
  netWealth: number;
  nisab: number;
  nisabGold: number;
  nisabSilver: number;
  aboveNisab: boolean;
  zakat: number;
}

export function zakat(input: ZakatInput): ZakatResult {
  const pureGoldGrams = input.goldGrams * purityOfKarat(input.goldKarat);
  const pureSilverGrams = input.silverGrams * (input.silverFineness / 1000);
  const goldValue = pureGoldGrams * input.goldPricePerGram;
  const silverValue = pureSilverGrams * input.silverPricePerGram;
  const totalAssets =
    input.cash + goldValue + silverValue + input.investments + input.businessAssets + input.owedToYou + input.otherAssets;
  const netWealth = totalAssets - input.liabilities;
  const nisabGold = NISAB_GOLD_GRAMS * input.goldPricePerGram;
  const nisabSilver = NISAB_SILVER_GRAMS * input.silverPricePerGram;
  const nisab = input.standard === 'gold' ? nisabGold : nisabSilver;
  const aboveNisab = netWealth > 0 && netWealth >= nisab;
  return {
    pureGoldGrams,
    pureSilverGrams,
    goldValue,
    silverValue,
    totalAssets,
    netWealth,
    nisab,
    nisabGold,
    nisabSilver,
    aboveNisab,
    zakat: aboveNisab ? netWealth * ZAKAT_RATE : 0,
  };
}

/** Converts a weight in grams, tola or troy ounces to grams. */
export const toGrams = (value: number, unit: MetalWeightUnit) => value * METAL_WEIGHT[unit];

/** Converts a price per gram / tola / troy ounce to a price per gram. */
export const pricePerGram = (price: number, unit: MetalWeightUnit) => price / METAL_WEIGHT[unit];
