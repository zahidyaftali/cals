// Final grade: the score needed on a final exam to reach a target course
// grade, and the course grade a given final score would produce.
//
//   course grade = current × (1 − w) + final × w      (w = final weight as a fraction)
//   ⇒ final needed = (target − current × (1 − w)) ÷ w

export interface FinalGradeResult {
  /** Score needed on the final, in percent. Can be below 0 or above 100. */
  needed: number;
  /** Points the current grade already contributes to the course grade. */
  fromCurrent: number;
  /** Course grade with 0% and 100% on the final. */
  withZero: number;
  withPerfect: number;
  status: 'possible' | 'already-secured' | 'out-of-reach';
}

/** Removes floating-point noise (61.99999999999999 → 62) so boundaries like 100% compare correctly. */
const clean = (n: number) => Math.round(n * 1e9) / 1e9;

export function finalGradeNeeded(current: number, target: number, weightPercent: number): FinalGradeResult {
  const w = weightPercent / 100;
  const fromCurrent = clean(current * (1 - w));
  const needed = clean((target - fromCurrent) / w);
  const status = needed <= 0 ? 'already-secured' : needed > 100 ? 'out-of-reach' : 'possible';
  return { needed, fromCurrent, withZero: fromCurrent, withPerfect: clean(fromCurrent + 100 * w), status };
}

/** Course grade for a given final exam score. */
export const courseGrade = (current: number, final: number, weightPercent: number) =>
  clean(current * (1 - weightPercent / 100) + final * (weightPercent / 100));

/** Common US letter-grade cut-offs (percent). Schools vary; the page says so. */
export const LETTER_CUTOFFS = [
  { letter: 'A', min: 90 },
  { letter: 'B', min: 80 },
  { letter: 'C', min: 70 },
  { letter: 'D', min: 60 },
] as const;

export function letterFor(percent: number): string {
  return LETTER_CUTOFFS.find((c) => percent >= c.min)?.letter ?? 'F';
}
