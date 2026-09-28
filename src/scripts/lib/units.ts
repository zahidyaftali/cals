// Unit conversion factors used by the measurement calculators.

/** Metres per unit of length. */
export const LENGTH = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
} as const;
export type LengthUnit = keyof typeof LENGTH;

export const LENGTH_NAMES: Record<LengthUnit, string> = {
  mm: 'millimeters',
  cm: 'centimeters',
  m: 'meters',
  in: 'inches',
  ft: 'feet',
  yd: 'yards',
};

export const toMeters = (value: number, unit: string) => value * (LENGTH[unit as LengthUnit] ?? NaN);

// Exact definitions: 1 ft = 0.3048 m, 1 yd = 3 ft, 1 US gallon = 3.785411784 L.
export const FT3_PER_M3 = 1 / 0.3048 ** 3; // 35.3147
export const YD3_PER_M3 = 1 / 0.9144 ** 3; // 1.30795
export const FT2_PER_M2 = 1 / 0.3048 ** 2; // 10.7639
export const YD2_PER_M2 = 1 / 0.9144 ** 2; // 1.19599
export const M2_PER_ACRE = 4046.8564224;
export const M2_PER_HECTARE = 10_000;
export const LITERS_PER_US_GALLON = 3.785411784;

/** Grams per unit of weight for precious metals. */
export const METAL_WEIGHT = {
  g: 1,
  tola: 11.6638038, // 180 grains
  ozt: 31.1034768, // troy ounce
} as const;
export type MetalWeightUnit = keyof typeof METAL_WEIGHT;
