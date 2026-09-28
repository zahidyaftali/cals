import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMeters } from '../lib/units.ts';
import { bagsNeeded, concrete, pieceVolume } from './concrete.ts';
import { pieceArea, toSquareMetres, totals } from './square-footage.ts';
import { metricTins, paintNeeded, usCans } from './paint.ts';
import { tip, tipPercentOf } from './tip.ts';
import { discount } from './discount.ts';
import { findRate, salesTax } from './sales-tax.ts';
import { stateRates } from '../../data/sales-tax-rates.ts';

const ft = (v: number) => toMeters(v, 'ft');
const inch = (v: number) => toMeters(v, 'in');
const close = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`);
const bag = (m3: number, label: string) => bagsNeeded(m3).find((b) => b.label === label)!.count;

test('concrete: 10 × 10 ft slab, 4 in thick', () => {
  const r = concrete({ shape: 'slab', length: ft(10), width: ft(10), thickness: inch(4), quantity: 1, wastePercent: 0 });
  close(r.cubicFeet, 33.3333);
  close(r.cubicYards, 1.2346);
  assert.equal(bag(r.cubicMetres, '80 lb'), 56); // 33.33 ÷ 0.60 = 55.6
  const waste = concrete({ shape: 'slab', length: ft(10), width: ft(10), thickness: inch(4), quantity: 1, wastePercent: 10 });
  assert.equal(bag(waste.cubicMetres, '80 lb'), 62); // 36.67 ÷ 0.60 = 61.1
  close(waste.weightLb, 36.6667 * 149.83, 5); // ≈ 150 lb/ft³
});

test('concrete: column, tube, stairs, post holes', () => {
  const m3toft3 = (m3: number) => m3 * 35.3146667;
  close(m3toft3(pieceVolume({ shape: 'column', diameter: inch(12), height: ft(4), quantity: 1, wastePercent: 0 })), Math.PI);
  close(m3toft3(pieceVolume({ shape: 'tube', diameter: inch(24), innerDiameter: inch(18), height: ft(4), quantity: 1, wastePercent: 0 })), 5.4978);
  // 3 steps, 7 in rise, 10 in run, 36 in wide, 10 in platform = 15,120 in³ = 8.75 ft³
  close(
    m3toft3(pieceVolume({ shape: 'stairs', steps: 3, rise: inch(7), run: inch(10), stairWidth: inch(36), platformDepth: inch(10), quantity: 1, wastePercent: 0 })),
    8.75,
  );
  // 10 in hole, 24 in deep, minus a 3.5 in square post: 1,884.96 − 294 = 1,590.96 in³
  close(
    m3toft3(pieceVolume({ shape: 'posthole', holeDiameter: inch(10), holeDepth: inch(24), postShape: 'square', postWidth: inch(3.5), quantity: 1, wastePercent: 0 })),
    1590.96 / 1728,
  );
});

test('concrete: metric slab and bags', () => {
  const r = concrete({ shape: 'slab', length: 3, width: 3, thickness: 0.1, quantity: 1, wastePercent: 0 });
  close(r.cubicMetres, 0.9);
  assert.equal(bag(r.cubicMetres, '25 kg'), 77); // 0.9 ÷ 0.0117 = 76.9
  assert.equal(bag(r.cubicMetres, '30 kg'), 65); // 0.9 ÷ 0.01405 = 64.1
});

test('square footage: shapes and conversions', () => {
  const rect = pieceArea({ shape: 'rectangle', unit: 'ft', a: 12, b: 15 }) as number;
  assert.equal(rect, 180);
  const t = totals(toSquareMetres(rect, 'ft'));
  close(t.sqM, 16.7225);
  close(t.sqYd, 20);
  assert.equal(pieceArea({ shape: 'lshape', unit: 'ft', a: 20, b: 15, c: 8, d: 5 }), 260);
  assert.equal(pieceArea({ shape: 'lshape', unit: 'ft', a: 20, b: 15, c: 20, d: 5 }), 'cutout-too-large');
  close(pieceArea({ shape: 'circle', unit: 'ft', a: 10 }) as number, 78.5398);
  assert.equal(pieceArea({ shape: 'triangle', unit: 'ft', a: 6, b: 4 }), 12);
  assert.equal(pieceArea({ shape: 'trapezoid', unit: 'ft', a: 10, b: 6, c: 4 }), 32);
  close(totals(toSquareMetres(43560, 'ft')).acres, 1);
  close(totals(toSquareMetres(20, 'm')).sqFt, 215.278);
});

test('paint: room with doors, windows and ceiling', () => {
  const r = paintNeeded({ mode: 'room', length: 12, width: 10, height: 8, doors: 1, windows: 2, doorArea: 20, windowArea: 15, coats: 2, coverage: 350, includeCeiling: false });
  assert.ok(typeof r === 'object');
  assert.equal(r.wallArea, 352);
  assert.equal(r.paintableArea, 302);
  close(r.paint, 604 / 350);
  assert.deepEqual(usCans(r.paint), { gallons: 2, quarts: 0 });
  const withCeiling = paintNeeded({ mode: 'room', length: 12, width: 10, height: 8, doors: 1, windows: 2, doorArea: 20, windowArea: 15, coats: 2, coverage: 350, includeCeiling: true, primer: true });
  assert.ok(typeof withCeiling === 'object');
  close(withCeiling.ceilingPaint, 240 / 350);
  close(withCeiling.primer, 422 / 350);
  assert.deepEqual(usCans(1.3), { gallons: 1, quarts: 2 });
  assert.deepEqual(usCans(0.1), { gallons: 0, quarts: 1 });
  assert.deepEqual(metricTins(7.3), { five: 1, twoHalf: 1, one: 0, total: 7.5 });
  assert.deepEqual(metricTins(9), { five: 2, twoHalf: 0, one: 0, total: 10 });
  assert.deepEqual(metricTins(3.2), { five: 0, twoHalf: 1, one: 1, total: 3.5 });
  assert.equal(paintNeeded({ mode: 'room', length: 2, width: 2, height: 2, doors: 1, windows: 0, doorArea: 20, windowArea: 0, coats: 1, coverage: 350 }), 'openings-too-large');
});

test('tip: percent, tax, rounding and split', () => {
  const r = tip({ bill: 84, tax: 0, tipPercent: 20, people: 2, rounding: 'none' });
  assert.deepEqual([r.tip, r.total, r.perPerson], [16.8, 100.8, 50.4]);
  const taxed = tip({ bill: 86.5, tax: 6.5, tipPercent: 20, people: 1, rounding: 'none' });
  assert.deepEqual([taxed.tipBase, taxed.tip, taxed.total], [80, 16, 102.5]);
  const person = tip({ bill: 84, tax: 0, tipPercent: 20, people: 3, rounding: 'person' });
  assert.deepEqual([person.perPerson, person.total, person.tip], [34, 102, 18]);
  close(person.effectivePercent, 21.4286);
  assert.equal(tip({ bill: 84, tax: 0, tipPercent: 18, people: 1, rounding: 'tip' }).tip, 16);
  assert.equal(tip({ bill: 84, tax: 0, tipPercent: 18, people: 1, rounding: 'total' }).total, 100);
  const uneven = tip({ bill: 100, tax: 0, tipPercent: 0, people: 3, rounding: 'none' });
  assert.deepEqual([uneven.perPerson, uneven.extraCentPayers], [33.33, 1]);
  assert.equal(tipPercentOf(80, 0, 12).percent, 15);
});

test('discount: every mode', () => {
  const pct = discount({ mode: 'percent', price: 80, percent: 25, taxPercent: 8 });
  assert.ok(typeof pct === 'object');
  assert.deepEqual([pct.salePrice, pct.saved, pct.tax, pct.finalPrice], [60, 20, 4.8, 64.8]);
  const amt = discount({ mode: 'amount', price: 80, amount: 15 });
  assert.ok(typeof amt === 'object');
  assert.deepEqual([amt.salePrice, amt.percentOff], [65, 18.75]);
  const dbl = discount({ mode: 'double', price: 100, percent: 20, percent2: 10 });
  assert.ok(typeof dbl === 'object');
  assert.deepEqual([dbl.afterFirst, dbl.salePrice], [80, 72]);
  close(dbl.percentOff, 28);
  const find = discount({ mode: 'find-percent', price: 80, salePrice: 60 });
  assert.ok(typeof find === 'object');
  assert.equal(find.percentOff, 25);
  const orig = discount({ mode: 'find-original', salePrice: 60, percent: 25 });
  assert.ok(typeof orig === 'object');
  assert.equal(orig.original, 80);
  assert.equal(discount({ mode: 'amount', price: 10, amount: 11 }), 'discount-too-large');
  assert.equal(discount({ mode: 'find-original', salePrice: 10, percent: 100 }), 'full-discount');
});

test('sales tax: add, remove, find rate', () => {
  assert.deepEqual(salesTax(100, 8.25, 'add'), { net: 100, tax: 8.25, gross: 108.25, rate: 8.25 });
  assert.deepEqual(salesTax(108.25, 8.25, 'remove'), { net: 100, tax: 8.25, gross: 108.25, rate: 8.25 });
  close(findRate(100, 108.25).rate, 8.25);
  assert.equal(salesTax(19.99, 6.625, 'add').tax, 1.32); // New Jersey
});

test('sales tax rate table is complete and sane', () => {
  assert.equal(stateRates.length, 51); // 50 states + DC
  assert.equal(new Set(stateRates.map((s) => s.code)).size, 51);
  for (const s of stateRates) assert.ok(s.rate >= 0 && s.rate <= 10 && s.avgLocal >= 0 && s.avgLocal <= 6, s.code);
  assert.equal(stateRates.find((s) => s.code === 'CA')!.rate, 7.25);
  assert.equal(stateRates.find((s) => s.code === 'MN')!.rate, 6.875);
});
