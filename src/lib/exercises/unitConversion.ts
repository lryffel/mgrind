import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { pick, randInt } from '../math/rng';

type UnitCategory = 'length' | 'mass' | 'volume' | 'time';

const CATEGORIES: Record<string, { units: string[]; baseFactors: number[] }> = {
  length: { units: ['mm', 'cm', 'dm', 'm', 'km'], baseFactors: [1e-3, 1e-2, 1e-1, 1, 1e3] },
  mass: { units: ['mg', 'g', 'kg', 't'], baseFactors: [1e-3, 1, 1e3, 1e6] },
  volume: { units: ['mL', 'cL', 'dL', 'L'], baseFactors: [1e-3, 1e-2, 1e-1, 1] },
  time: { units: ['s', 'min', 'h', 'd'], baseFactors: [1, 60, 3600, 86400] },
};

const METRIC_CATEGORIES: UnitCategory[] = ['length', 'mass', 'volume'];

export interface UnitConversionData {
  promptKey: 'exercise.unitConversion.prompt';
  unitFrom: string;
  unitTo: string;
}

function pickUnitPair(
  rng: () => number,
  units: string[],
  steps: number,
  allowToSmaller: boolean,
  allowToLarger: boolean,
  category?: string,
): [number, number] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < units.length; i++) {
    for (let j = 0; j < units.length; j++) {
      if (i === j) continue;
      if (Math.abs(i - j) !== steps) continue;
      const toSmaller = i > j;
      if (toSmaller && !allowToSmaller) continue;
      if (!toSmaller && !allowToLarger) continue;
      if (category && category !== 'time') {
        const f = computeFactor(category, i, j);
        if (!hasValidDigits(f) || !hasValidDigits(1 * f)) continue;
      }
      pairs.push([i, j]);
    }
  }
  return pick(rng, pairs);
}

function computeFactor(category: string, fromIdx: number, toIdx: number): number {
  const cat = CATEGORIES[category];
  return cat.baseFactors[fromIdx] / cat.baseFactors[toIdx];
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(10)).toString();
}

function trailingZeros(s: string): number {
  const m = s.match(/0+$/);
  return m ? m[0].length : 0;
}

function hasValidDigits(n: number): boolean {
  const s = formatNum(n);
  if (s === '0') return true;
  const dot = s.indexOf('.');
  if (dot !== -1 && s.length - dot - 1 > 3) return false;
  const intPart = dot === -1 ? s : s.slice(0, dot);
  return trailingZeros(intPart) <= 3;
}

function pickMetricSource(rng: () => number, min: number, max: number, factor: number): number {
  for (let attempt = 0; attempt < 20; attempt++) {
    const s = randInt(rng, min, max);
    if (hasValidDigits(s) && hasValidDigits(s * factor)) return s;
  }
  return 1;
}

function generateNiceTimeSources(): number[] {
  const vals: number[] = [];
  for (let i = 1; i <= 10; i++) vals.push(i);
  vals.push(15);
  for (let b = 100; b <= 900; b += 100) vals.push(b);
  for (let b = 1000; b <= 9000; b += 1000) vals.push(b);
  for (let b = 10000; b <= 90000; b += 10000) vals.push(b);
  return vals;
}

const NICE_TIME_SOURCES = generateNiceTimeSources();

function generateEasyTimeConversion(
  rng: () => number,
  clamped: number,
  info: { units: string[] },
): [number, number, number] {
  let fromIdx: number, toIdx: number;
  if (clamped >= 0 && clamped <= 6) {
    [fromIdx, toIdx] = pickUnitPair(rng, info.units, 1, true, false, 'time');
  } else if (clamped === 7) {
    [fromIdx, toIdx] = pickUnitPair(rng, info.units, 1, true, false, 'time');
  } else if (clamped === 8) {
    [fromIdx, toIdx] = pickUnitPair(rng, info.units, 1, false, true, 'time');
  } else {
    [fromIdx, toIdx] = pickUnitPair(rng, info.units, 1, true, true, 'time');
  }
  const factor = computeFactor('time', fromIdx, toIdx);
  const F = Math.round(Math.max(factor, 1 / factor));
  const lowComplexity = clamped <= 7;
  const candidates = NICE_TIME_SOURCES.filter((n) => {
    if (lowComplexity && n > 9) return false;
    const large = n * F;
    return hasValidDigits(n) && hasValidDigits(large);
  });
  const niceSource = pick(rng, candidates);
  const sourceValue = factor >= 1 ? niceSource : niceSource * F;
  return [fromIdx, toIdx, sourceValue];
}

export function generateUnitConversion(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  let category: UnitCategory;
  let fromIdx: number;
  let toIdx: number;
  let sourceValue: number;

  if (clamped <= 1) {
    category = 'length';
  } else if (clamped === 2) {
    category = pick(rng, ['length', 'mass']);
  } else if (clamped >= 3 && clamped <= 6) {
    category = pick(rng, METRIC_CATEGORIES);
  } else if (clamped >= 7 && clamped <= 9) {
    category = 'time';
  } else {
    category = pick(rng, [...METRIC_CATEGORIES, 'time']);
  }

  const info = CATEGORIES[category];

  if (category === 'time') {
    [fromIdx, toIdx, sourceValue] = generateEasyTimeConversion(rng, clamped, info);
  } else {
    let pickedSteps: number;
    if (clamped === 0) {
      pickedSteps = 1;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, false, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 999, computeFactor(category, s, t));
    } else if (clamped === 1) {
      pickedSteps = 1;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, false, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 999, computeFactor(category, s, t));
      if (rng() > 0.5) {
        const dec = Math.round(rng() * 10) / 10;
        const f = computeFactor(category, fromIdx, toIdx);
        if (hasValidDigits(sourceValue + dec) && hasValidDigits((sourceValue + dec) * f)) sourceValue += dec;
      }
    } else if (clamped === 2) {
      pickedSteps = 1;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, false, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 999, computeFactor(category, s, t));
    } else if (clamped === 3) {
      pickedSteps = 1;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, false, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 999, computeFactor(category, s, t));
      if (rng() > 0.5) {
        const dec = Math.round(rng() * 10) / 10;
        const f = computeFactor(category, fromIdx, toIdx);
        if (hasValidDigits(sourceValue + dec) && hasValidDigits((sourceValue + dec) * f)) sourceValue += dec;
      }
    } else if (clamped === 4) {
      pickedSteps = 1;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, true, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 999, computeFactor(category, s, t));
      if (rng() > 0.5) {
        const dec = Math.round(rng() * 10) / 10;
        const f = computeFactor(category, fromIdx, toIdx);
        if (hasValidDigits(sourceValue + dec) && hasValidDigits((sourceValue + dec) * f)) sourceValue += dec;
      }
    } else if (clamped === 5) {
      pickedSteps = category === 'mass' ? 1 : 2;
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, false, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 99, computeFactor(category, s, t));
    } else if (clamped === 6) {
      pickedSteps = category === 'mass' ? 1 : randInt(rng, 2, 3);
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, true, category);
      fromIdx = s;
      toIdx = t;
      sourceValue = pickMetricSource(rng, 1, 99, computeFactor(category, s, t));
      if (rng() > 0.5) {
        const dec = Math.round(rng() * 10) / 10;
        const f = computeFactor(category, fromIdx, toIdx);
        if (hasValidDigits(sourceValue + dec) && hasValidDigits((sourceValue + dec) * f)) sourceValue += dec;
      }
    } else {
      const maxSteps = category === 'mass' ? 1 : 3;
      pickedSteps = randInt(rng, 1, maxSteps);
      const [s, t] = pickUnitPair(rng, info.units, pickedSteps, true, true, category);
      fromIdx = s;
      toIdx = t;
      const factor = computeFactor(category, s, t);
      sourceValue = pickMetricSource(rng, 1, 999, factor);
      if (rng() > 0.5) {
        const dec = Math.round(rng() * 1000) / 1000;
        if (hasValidDigits(sourceValue + dec) && hasValidDigits((sourceValue + dec) * factor)) sourceValue += dec;
      }
    }
  }

  const factor = computeFactor(category, fromIdx, toIdx);
  const result = sourceValue * factor;
  const sourceLatex = formatNum(sourceValue);
  const fromUnit = info.units[fromIdx];
  const toUnit = info.units[toIdx];
  const prompt = `${sourceLatex}\\ \\mathrm{${fromUnit}} = ?\\ \\mathrm{${toUnit}}`;

  return {
    prompt,
    answer: formatNum(result),
    pattern: 'text-input',
    data: {
      promptKey: 'exercise.unitConversion.prompt',
      unitFrom: fromUnit,
      unitTo: toUnit,
    },
  };
}

export function validateUnitConversion(answer: string, exercise: Exercise): boolean {
  const trimmed = answer.trim().replace(',', '.');
  if (trimmed === '') return false;
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed) || !isFinite(parsed)) return false;
  const correct = parseFloat(exercise.answer);
  return Math.abs(parsed - correct) < 1e-9;
}
