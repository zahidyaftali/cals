// Paint needed for the walls (and optionally the ceiling) of a room, or for
// a known area, with coats, coverage and an optional primer coat.
// Works in either feet/ft²/US gallons or metres/m²/litres.

export interface PaintInput {
  mode: 'room' | 'area';
  /** room mode: room length and width, and wall height (ft or m) */
  length?: number;
  width?: number;
  height?: number;
  doors?: number;
  windows?: number;
  /** Area of one door / window (ft² or m²). */
  doorArea?: number;
  windowArea?: number;
  includeCeiling?: boolean;
  /** area mode: the area to paint (ft² or m²) */
  area?: number;
  coats: number;
  /** Area one gallon (imperial) or one litre (metric) covers in one coat. */
  coverage: number;
  /** One coat of primer over the same area, at the same coverage. */
  primer?: boolean;
}

export interface PaintResult {
  wallArea: number;
  openings: number;
  ceilingArea: number;
  /** Area to paint once (walls after openings, plus ceiling). */
  paintableArea: number;
  /** Area × coats. */
  coveredArea: number;
  /** Paint in gallons or litres, before rounding up to cans. */
  paint: number;
  wallPaint: number;
  ceilingPaint: number;
  primer: number;
}

export type PaintError = 'openings-too-large';

export function paintNeeded(input: PaintInput): PaintResult | PaintError {
  let wallArea = 0;
  let openings = 0;
  let ceilingArea = 0;
  if (input.mode === 'room') {
    const L = input.length ?? 0;
    const W = input.width ?? 0;
    wallArea = 2 * (L + W) * (input.height ?? 0);
    openings = (input.doors ?? 0) * (input.doorArea ?? 0) + (input.windows ?? 0) * (input.windowArea ?? 0);
    if (openings >= wallArea) return 'openings-too-large';
    ceilingArea = input.includeCeiling ? L * W : 0;
  } else {
    wallArea = input.area ?? 0;
  }
  const walls = wallArea - openings;
  const paintableArea = walls + ceilingArea;
  const wallPaint = (walls * input.coats) / input.coverage;
  const ceilingPaint = (ceilingArea * input.coats) / input.coverage;
  return {
    wallArea,
    openings,
    ceilingArea,
    paintableArea,
    coveredArea: paintableArea * input.coats,
    paint: wallPaint + ceilingPaint,
    wallPaint,
    ceilingPaint,
    primer: input.primer ? paintableArea / input.coverage : 0,
  };
}

/**
 * US cans to buy: whole gallons plus quarts for the rest. Three or more
 * quarts become one more gallon, which costs about the same and leaves spare
 * paint for touch-ups.
 */
export function usCans(gallons: number): { gallons: number; quarts: number } {
  const g = Math.round(gallons * 1e9) / 1e9;
  let whole = Math.floor(g);
  let quarts = Math.ceil((g - whole) * 4);
  if (quarts >= 3) {
    whole += 1;
    quarts = 0;
  }
  if (whole === 0 && quarts === 0 && g > 0) quarts = 1;
  return { gallons: whole, quarts };
}

/**
 * Metric tins to buy, using the common 5 L, 2.5 L and 1 L sizes: as many 5 L
 * tins as fit, then the smallest mix of 2.5 L and 1 L tins that covers the rest.
 */
export function metricTins(litres: number): { five: number; twoHalf: number; one: number; total: number } {
  const l = Math.round(litres * 1e9) / 1e9;
  let five = Math.floor(l / 5);
  let rest = l - five * 5;
  let twoHalf = 0;
  let one = 0;
  if (rest > 3.5) {
    // Two 2.5 L tins or a mix would cost more than another 5 L tin.
    five += 1;
    rest = 0;
  } else if (rest > 2.5) {
    twoHalf = 1;
    one = Math.ceil(rest - 2.5);
  } else if (rest > 2) {
    twoHalf = 1;
  } else if (rest > 0) {
    one = Math.ceil(rest);
  }
  return { five, twoHalf, one, total: five * 5 + twoHalf * 2.5 + one };
}
