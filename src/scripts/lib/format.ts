// Number, money and duration formatting shared by the calculators (US English).

const numberFormats = new Map<string, Intl.NumberFormat>();

/** 1234.5 → "1,234.5". Rounds to `max` decimals and pads to `min`. */
export function formatNumber(n: number, max = 2, min = 0): string {
  const key = `${min}-${max}`;
  let f = numberFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });
    numberFormats.set(key, f);
  }
  // Avoid "-0" after rounding tiny negative values.
  const out = f.format(n);
  return out === '-0' ? '0' : out;
}

/** 1234.5 → "$1,234.50". Unknown currency codes fall back to "1,234.50 XYZ". */
export function formatMoney(n: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  } catch {
    return `${formatNumber(n, 2, 2)} ${currency}`;
  }
}

/** 8.25 → "8.25%" */
export const formatPercent = (n: number, max = 2) => `${formatNumber(n, max)}%`;

/** 510 → "8 h 30 min" */
export function hoursMinutes(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '−' : '';
  const m = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${sign}${rest} min`;
  return rest === 0 ? `${sign}${h} h` : `${sign}${h} h ${rest} min`;
}

/** 510 → "8:30" */
export function clockDuration(totalMinutes: number): string {
  const m = Math.abs(Math.round(totalMinutes));
  return `${totalMinutes < 0 ? '−' : ''}${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/** plural(1, 'day') → "1 day"; plural(3, 'day') → "3 days" */
export const plural = (n: number, one: string, many = `${one}s`) =>
  `${formatNumber(n, 2)} ${Math.abs(n) === 1 ? one : many}`;

/**
 * Rounds to cents without floating-point drift: 1.005 × 100 is 100.49999999999999
 * in binary, so trim to 15 significant digits before rounding (1.005 → 1.01).
 */
export const roundMoney = (n: number) => Math.round(Number((n * 100).toPrecision(15))) / 100;
