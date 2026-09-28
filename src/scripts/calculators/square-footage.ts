// Square footage: total area of several shapes, each measured in its own
// unit, reported in square feet, square metres, square yards and acres.

import { FT2_PER_M2, LENGTH, M2_PER_ACRE, M2_PER_HECTARE, YD2_PER_M2, type LengthUnit } from '../lib/units.ts';

export type AreaShape = 'rectangle' | 'lshape' | 'triangle' | 'circle' | 'trapezoid' | 'semicircle';

export interface AreaPiece {
  shape: AreaShape;
  unit: LengthUnit;
  /**
   * rectangle: a = length, b = width
   * lshape:    a = overall length, b = overall width, c = cut-out length, d = cut-out width
   * triangle:  a = base, b = height
   * circle / semicircle: a = diameter
   * trapezoid: a = parallel side 1, b = parallel side 2, c = height
   */
  a: number;
  b?: number;
  c?: number;
  d?: number;
}

export type AreaError = 'cutout-too-large';

/** Area in the square of the piece's own unit (e.g. ft² for feet). */
export function pieceArea(p: AreaPiece): number | AreaError {
  const b = p.b ?? 0;
  const c = p.c ?? 0;
  const d = p.d ?? 0;
  switch (p.shape) {
    case 'rectangle':
      return p.a * b;
    case 'lshape':
      if (c >= p.a || d >= b) return 'cutout-too-large';
      return p.a * b - c * d;
    case 'triangle':
      return (p.a * b) / 2;
    case 'circle':
      return Math.PI * (p.a / 2) ** 2;
    case 'semicircle':
      return (Math.PI * (p.a / 2) ** 2) / 2;
    case 'trapezoid':
      return ((p.a + b) / 2) * c;
  }
}

/** Formula text for a shape, used in the step-by-step working. */
export const SHAPE_FORMULA: Record<AreaShape, string> = {
  rectangle: 'length × width',
  lshape: 'length × width − cut-out length × cut-out width',
  triangle: 'base × height ÷ 2',
  circle: 'π × (diameter ÷ 2)²',
  semicircle: 'π × (diameter ÷ 2)² ÷ 2',
  trapezoid: '(side 1 + side 2) ÷ 2 × height',
};

export interface AreaTotals {
  sqM: number;
  sqFt: number;
  sqYd: number;
  acres: number;
  hectares: number;
}

export function totals(sqM: number): AreaTotals {
  return {
    sqM,
    sqFt: sqM * FT2_PER_M2,
    sqYd: sqM * YD2_PER_M2,
    acres: sqM / M2_PER_ACRE,
    hectares: sqM / M2_PER_HECTARE,
  };
}

/** Converts an area in unit² to m². */
export const toSquareMetres = (area: number, unit: LengthUnit) => area * LENGTH[unit] ** 2;

/** Area plus a waste allowance (percent), e.g. 10% extra flooring for cuts. */
export const withWaste = (area: number, wastePercent: number) => area * (1 + wastePercent / 100);
