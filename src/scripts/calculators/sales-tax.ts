// Sales tax: add tax to a pre-tax price, take it back out of a total, or find
// the rate from a price and a total.

export type SalesTaxMode = 'add' | 'remove' | 'rate';

export interface SalesTaxResult {
  /** Price before tax. */
  net: number;
  tax: number;
  /** Price including tax. */
  gross: number;
  /** Combined rate in percent. */
  rate: number;
}

const round2 = (n: number) => Math.round(Number((n * 100).toPrecision(15))) / 100;

/**
 * add:    tax = price × rate,             total = price + tax
 * remove: price = total ÷ (1 + rate),     tax = total − price
 * `ratePercent` is the combined rate, e.g. 8.25 for 8.25%.
 */
export function salesTax(amount: number, ratePercent: number, mode: 'add' | 'remove'): SalesTaxResult {
  const r = ratePercent / 100;
  if (mode === 'add') {
    const tax = round2(amount * r);
    return { net: round2(amount), tax, gross: round2(amount + tax), rate: ratePercent };
  }
  const net = round2(amount / (1 + r));
  return { net, tax: round2(amount - net), gross: round2(amount), rate: ratePercent };
}

/** rate = (total − price) ÷ price */
export function findRate(price: number, total: number): SalesTaxResult {
  return { net: round2(price), tax: round2(total - price), gross: round2(total), rate: ((total - price) / price) * 100 };
}
