// Tip and bill split, and the reverse (what percent a tip amount is).
// All money is handled in whole cents.

export type Rounding = 'none' | 'tip' | 'total' | 'person';

export interface TipInput {
  /** Bill total as printed (including any tax). */
  bill: number;
  /** Tax included in the bill; the tip is worked out on bill − tax. */
  tax: number;
  tipPercent: number;
  people: number;
  /**
   * none:   exact cents
   * tip:    round the tip up to the next whole dollar
   * total:  round the whole bill up to the next whole dollar
   * person: round each person's share up to the next whole dollar
   */
  rounding: Rounding;
}

export interface TipResult {
  /** Amount the tip percentage is applied to. */
  tipBase: number;
  tip: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
  billPerPerson: number;
  /** Tip as a percent of the tip base, after any rounding. */
  effectivePercent: number;
  /** When the total doesn't split into equal cents, how many people pay 1 cent more. */
  extraCentPayers: number;
}

export const toCents = (n: number) => Math.round(Number((n * 100).toPrecision(15)));

export function tip(input: TipInput): TipResult {
  const billCents = toCents(input.bill);
  const baseCents = billCents - toCents(input.tax);
  let tipCents = Math.round((baseCents * input.tipPercent) / 100);
  let totalCents = billCents + tipCents;

  if (input.rounding === 'tip') {
    tipCents = Math.ceil(tipCents / 100) * 100;
    totalCents = billCents + tipCents;
  } else if (input.rounding === 'total') {
    totalCents = Math.ceil(totalCents / 100) * 100;
    tipCents = totalCents - billCents;
  } else if (input.rounding === 'person') {
    totalCents = Math.ceil(totalCents / input.people / 100) * 100 * input.people;
    tipCents = totalCents - billCents;
  }

  const perPersonCents = Math.floor(totalCents / input.people);
  return {
    tipBase: baseCents / 100,
    tip: tipCents / 100,
    total: totalCents / 100,
    perPerson: perPersonCents / 100,
    tipPerPerson: tipCents / input.people / 100,
    billPerPerson: billCents / input.people / 100,
    effectivePercent: baseCents > 0 ? (tipCents / baseCents) * 100 : 0,
    extraCentPayers: totalCents - perPersonCents * input.people,
  };
}

/** Reverse: the tip percentage a tip amount represents. */
export function tipPercentOf(bill: number, tax: number, tipAmount: number) {
  const base = bill - tax;
  return { base, percent: base > 0 ? (tipAmount / base) * 100 : 0, total: bill + tipAmount };
}
