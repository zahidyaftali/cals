// Concrete volume for slabs/footings/walls, columns, circular slabs and tubes,
// stairs and fence-post holes, with waste, weight, premix bags and cost.
// All inputs are in metres; the page converts from the visitor's units.

import { FT3_PER_M3, YD3_PER_M3 } from '../lib/units.ts';

export type ConcreteShape = 'slab' | 'column' | 'tube' | 'stairs' | 'posthole';

export interface ConcreteInput {
  shape: ConcreteShape;
  /** slab: length × width × thickness */
  length?: number;
  width?: number;
  thickness?: number;
  /** column: diameter × height. tube: outer/inner diameter × height. */
  diameter?: number;
  innerDiameter?: number;
  height?: number;
  /** stairs */
  steps?: number;
  rise?: number;
  run?: number;
  stairWidth?: number;
  platformDepth?: number;
  /** posthole: hole diameter × depth, minus the post */
  holeDiameter?: number;
  holeDepth?: number;
  postShape?: 'square' | 'round' | 'none';
  postWidth?: number;
  quantity: number;
  wastePercent: number;
}

export interface ConcreteResult {
  /** One piece, m³. */
  pieceVolume: number;
  /** All pieces before waste, m³. */
  netVolume: number;
  /** Including waste, m³. */
  cubicMetres: number;
  cubicYards: number;
  cubicFeet: number;
  /** Approximate weight of the placed concrete. */
  weightKg: number;
  weightLb: number;
}

/**
 * Normal-weight concrete weighs about 2,400 kg/m³ (150 lb/ft³) once placed.
 * Used only for the weight estimate.
 */
export const DENSITY_KG_M3 = 2400;
const LB_PER_KG = 2.20462262;

export function pieceVolume(input: ConcreteInput): number {
  const n = (v: number | undefined) => v ?? 0;
  switch (input.shape) {
    case 'slab':
      return n(input.length) * n(input.width) * n(input.thickness);
    case 'column':
      return Math.PI * (n(input.diameter) / 2) ** 2 * n(input.height);
    case 'tube':
      return (Math.PI / 4) * (n(input.diameter) ** 2 - n(input.innerDiameter) ** 2) * n(input.height);
    case 'stairs': {
      // Seen from the side, step i (1…n−1) is a block `run` deep and i × rise
      // tall; the top step is `platformDepth` deep and n × rise tall.
      const steps = n(input.steps);
      const rise = n(input.rise);
      return n(input.stairWidth) * rise * (n(input.run) * ((steps - 1) * steps) / 2 + n(input.platformDepth) * steps);
    }
    case 'posthole': {
      const depth = n(input.holeDepth);
      const hole = Math.PI * (n(input.holeDiameter) / 2) ** 2 * depth;
      const w = n(input.postWidth);
      const post = input.postShape === 'square' ? w * w * depth : input.postShape === 'round' ? Math.PI * (w / 2) ** 2 * depth : 0;
      return hole - post;
    }
  }
}

export function concrete(input: ConcreteInput): ConcreteResult {
  const piece = pieceVolume(input);
  const netVolume = piece * input.quantity;
  const cubicMetres = netVolume * (1 + input.wastePercent / 100);
  const weightKg = cubicMetres * DENSITY_KG_M3;
  return {
    pieceVolume: piece,
    netVolume,
    cubicMetres,
    cubicYards: cubicMetres * YD3_PER_M3,
    cubicFeet: cubicMetres * FT3_PER_M3,
    weightKg,
    weightLb: weightKg * LB_PER_KG,
  };
}

/**
 * Premix bag yields. US figures are those printed on standard bags of
 * concrete mix (e.g. Quikrete: 80 lb ≈ 0.60 ft³, 60 lb ≈ 0.45 ft³,
 * 50 lb ≈ 0.375 ft³, 40 lb ≈ 0.30 ft³), about 133 lb of dry mix per cubic
 * foot placed. Metric bags use the same ratio (≈ 2,136 kg/m³): 30 kg ≈
 * 0.014 m³, which matches the yield printed on 30 kg bags sold in Canada.
 */
export const US_BAGS = [
  { label: '40 lb', cubicFeet: 0.3 },
  { label: '50 lb', cubicFeet: 0.375 },
  { label: '60 lb', cubicFeet: 0.45 },
  { label: '80 lb', cubicFeet: 0.6 },
] as const;

const DRY_KG_PER_M3 = (80 / 0.6) / LB_PER_KG * FT3_PER_M3; // ≈ 2135.7
export const METRIC_BAGS = [
  { label: '20 kg', cubicMetres: 20 / DRY_KG_PER_M3 },
  { label: '25 kg', cubicMetres: 25 / DRY_KG_PER_M3 },
  { label: '30 kg', cubicMetres: 30 / DRY_KG_PER_M3 },
] as const;

/** Stops 55.00000000001 bags rounding up to 56 because of floating-point noise. */
const clean = (n: number) => Math.round(n * 1e9) / 1e9;

export function bagsNeeded(cubicMetres: number): { label: string; yieldText: string; count: number; system: 'us' | 'metric' }[] {
  const cubicFeet = cubicMetres * FT3_PER_M3;
  return [
    ...US_BAGS.map((b) => ({
      label: b.label,
      yieldText: `${b.cubicFeet} ft³`,
      count: Math.ceil(clean(cubicFeet / b.cubicFeet)),
      system: 'us' as const,
    })),
    ...METRIC_BAGS.map((b) => ({
      label: b.label,
      yieldText: `${b.cubicMetres.toFixed(4)} m³`,
      count: Math.ceil(clean(cubicMetres / b.cubicMetres)),
      system: 'metric' as const,
    })),
  ];
}
