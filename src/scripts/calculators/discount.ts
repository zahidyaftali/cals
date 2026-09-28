// Discounts: percent off, a fixed amount off, two percentages one after the
// other, and the reverse questions (what percent off? what was the original
// price?), with optional sales tax on the sale price.

export type DiscountMode = 'percent' | 'amount' | 'double' | 'find-percent' | 'find-original';

export interface DiscountInput {
  mode: DiscountMode;
  /** Original price (all modes except find-original). */
  price?: number;
  /** Percent off (percent, double, find-original). */
  percent?: number;
  /** Second percent, applied to the already reduced price (double). */
  percent2?: number;
  /** Amount off (amount). */
  amount?: number;
  /** Price paid (find-percent, find-original). */
  salePrice?: number;
  /** Optional sales tax on the sale price, in percent. */
  taxPercent?: number;
}

export interface DiscountResult {
  original: number;
  salePrice: number;
  /** Price after the first discount (double mode). */
  afterFirst: number;
  saved: number;
  /** Total discount as a percent of the original price. */
  percentOff: number;
  tax: number;
  finalPrice: number;
}

export type DiscountError = 'discount-too-large' | 'sale-above-original' | 'full-discount';

const round2 = (n: number) => Math.round(Number((n * 100).toPrecision(15))) / 100;

export function discount(input: DiscountInput): DiscountResult | DiscountError {
  let original = input.price ?? 0;
  let sale: number;
  let afterFirst: number;

  switch (input.mode) {
    case 'amount':
      if ((input.amount ?? 0) > original) return 'discount-too-large';
      sale = original - (input.amount ?? 0);
      afterFirst = sale;
      break;
    case 'percent':
    case 'double':
      afterFirst = original * (1 - (input.percent ?? 0) / 100);
      sale = input.mode === 'double' ? afterFirst * (1 - (input.percent2 ?? 0) / 100) : afterFirst;
      break;
    case 'find-percent':
      sale = input.salePrice ?? 0;
      if (sale > original) return 'sale-above-original';
      afterFirst = sale;
      break;
    case 'find-original': {
      const p = input.percent ?? 0;
      if (p >= 100) return 'full-discount';
      sale = input.salePrice ?? 0;
      original = sale / (1 - p / 100);
      afterFirst = sale;
      break;
    }
  }

  const salePrice = round2(sale);
  const originalRounded = round2(original);
  const saved = round2(originalRounded - salePrice);
  const tax = round2((salePrice * (input.taxPercent ?? 0)) / 100);
  return {
    original: originalRounded,
    salePrice,
    afterFirst: round2(afterFirst),
    saved,
    percentOff: original > 0 ? ((original - sale) / original) * 100 : 0,
    tax,
    finalPrice: round2(salePrice + tax),
  };
}
