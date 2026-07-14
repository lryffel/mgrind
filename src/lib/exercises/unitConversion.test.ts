import { describe, it, expect } from 'vitest';
import { generateUnitConversion, validateUnitConversion } from './unitConversion';
import type { UnitConversionData } from './unitConversion';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

const CATEGORIES: Record<string, { units: string[]; baseFactors: number[] }> = {
  length: { units: ['mm', 'cm', 'dm', 'm', 'km'], baseFactors: [1e-3, 1e-2, 1e-1, 1, 1e3] },
  mass: { units: ['mg', 'g', 'kg', 't'], baseFactors: [1e-3, 1, 1e3, 1e6] },
  volume: { units: ['mL', 'cL', 'dL', 'L'], baseFactors: [1e-3, 1e-2, 1e-1, 1] },
  time: { units: ['s', 'min', 'h', 'd'], baseFactors: [1, 60, 3600, 86400] },
};

function parse(ex: { prompt: string }): { sourceVal: number; fromUnit: string; toUnit: string } {
  const m = ex.prompt.match(/^([\d.]+)\\ \\mathrm\{(\w+)\} = \?\\ \\mathrm\{(\w+)\}$/);
  expect(m).not.toBeNull();
  return { sourceVal: parseFloat(m![1]), fromUnit: m![2], toUnit: m![3] };
}

function categoryOf(fromUnit: string): string {
  for (const [cat, info] of Object.entries(CATEGORIES)) {
    if (info.units.includes(fromUnit)) return cat;
  }
  return '';
}

function computeExpected(fromUnit: string, toUnit: string, sourceVal: number): number {
  const cat = categoryOf(fromUnit);
  const info = CATEGORIES[cat];
  const fromIdx = info.units.indexOf(fromUnit);
  const toIdx = info.units.indexOf(toUnit);
  return sourceVal * (info.baseFactors[fromIdx] / info.baseFactors[toIdx]);
}

function getData(ex: { data?: unknown }): UnitConversionData {
  return ex.data as UnitConversionData;
}

function countTerminatingDecimals(n: number): number {
  if (Number.isInteger(n)) return 0;
  const s = parseFloat(n.toFixed(10)).toString();
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

describe('generateUnitConversion', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateUnitConversion, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateUnitConversion, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateUnitConversion, 5);
  });

  it('sets pattern to text-input', () => {
    const ex = generateUnitConversion(42, 0);
    expect(ex.pattern).toBe('text-input');
  });

  it('sets promptKey in data', () => {
    const ex = generateUnitConversion(42, 0);
    expect(getData(ex).promptKey).toBe('exercise.unitConversion.prompt');
  });

  it('produces correct results for all categories', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        const { sourceVal, fromUnit, toUnit } = parse(ex);
        const expected = computeExpected(fromUnit, toUnit, sourceVal);
        expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
      }
    }
  });

  it('never produces identity conversion (same unit)', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        const { fromUnit, toUnit } = parse(ex);
        expect(fromUnit).not.toBe(toUnit);
      }
    }
  });

  it('length category is active at complexity 0', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateUnitConversion(seed, 0);
      const { fromUnit } = parse(ex);
      expect(CATEGORIES.length.units).toContain(fromUnit);
    }
  });

  it('mass category appears at complexity 2', () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 2);
      const { fromUnit } = parse(ex);
      if (CATEGORIES.mass.units.includes(fromUnit)) found = true;
    }
    expect(found).toBe(true);
  });

  it('volume category appears at complexity 3', () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 3);
      const { fromUnit } = parse(ex);
      if (CATEGORIES.volume.units.includes(fromUnit)) found = true;
    }
    expect(found).toBe(true);
  });

  it('time category appears at complexity 7', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 7);
      const { fromUnit } = parse(ex);
      expect(CATEGORIES.time.units).toContain(fromUnit);
    }
  });

  it('all metric categories appear at complexity 10', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateUnitConversion(seed, 10);
      const { fromUnit } = parse(ex);
      seen.add(categoryOf(fromUnit));
    }
    expect(seen.has('length')).toBe(true);
    expect(seen.has('mass')).toBe(true);
    expect(seen.has('volume')).toBe(true);
  });

  it('time category appears at complexity 10', () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateUnitConversion(seed, 10);
      const { fromUnit } = parse(ex);
      if (CATEGORIES.time.units.includes(fromUnit)) found = true;
    }
    expect(found).toBe(true);
  });

  it('source values produce terminating decimal results', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        const { sourceVal, fromUnit, toUnit } = parse(ex);
        const expected = computeExpected(fromUnit, toUnit, sourceVal);
        const dec = countTerminatingDecimals(expected);
        expect(dec).toBeLessThanOrEqual(10);
      }
    }
  });

  it('complexity 0-4 uses adjacent units (1 step)', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateUnitConversion(seed, c);
        const { fromUnit, toUnit } = parse(ex);
        const cat = categoryOf(fromUnit);
        const info = CATEGORIES[cat];
        const fromIdx = info.units.indexOf(fromUnit);
        const toIdx = info.units.indexOf(toUnit);
        expect(Math.abs(fromIdx - toIdx)).toBe(1);
      }
    }
  });

  it('complexity 0-3 favors to-smaller (multiply)', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 3; c++) {
        const ex = generateUnitConversion(seed, c);
        const { fromUnit, toUnit } = parse(ex);
        const cat = categoryOf(fromUnit);
        const info = CATEGORIES[cat];
        const fromIdx = info.units.indexOf(fromUnit);
        const toIdx = info.units.indexOf(toUnit);
        expect(fromIdx).toBeGreaterThan(toIdx);
      }
    }
  });

  it('level 7 uses 1-digit source values', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 7);
      const { sourceVal } = parse(ex);
      expect(sourceVal).toBeGreaterThanOrEqual(1);
      expect(sourceVal).toBeLessThanOrEqual(9);
    }
  });

  it('time conversions produce round integers', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 7; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        const { sourceVal, fromUnit, toUnit } = parse(ex);
        if (!CATEGORIES.time.units.includes(fromUnit)) continue;
        expect(CATEGORIES.time.units).toContain(toUnit);
        expect(Number.isInteger(sourceVal)).toBe(true);
        expect(sourceVal).toBeGreaterThanOrEqual(1);
        const result = parseFloat(ex.answer);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('clamps complexity above 10', () => {
    const ex = generateUnitConversion(42, 20);
    expect(ex.answer).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
  });

  it('clamps complexity below 0', () => {
    const ex = generateUnitConversion(42, -5);
    expect(ex.answer).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
  });

  it('zero source value computes correctly', () => {
    const { fromUnit, toUnit } = parse(generateUnitConversion(42, 0));
    const expected = computeExpected(fromUnit, toUnit, 0);
    expect(expected).toBe(0);
  });

  it('complexity 5 uses 2-step for length/volume, 1-step for mass', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 5);
      const { fromUnit, toUnit } = parse(ex);
      const cat = categoryOf(fromUnit);
      const info = CATEGORIES[cat];
      const fromIdx = info.units.indexOf(fromUnit);
      const toIdx = info.units.indexOf(toUnit);
      const expected = cat === 'mass' ? 1 : 2;
      expect(Math.abs(fromIdx - toIdx)).toBe(expected);
    }
  });

  it('never produces more than 3 trailing zeros or 3 decimal places in source or result', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        const { sourceVal } = parse(ex);
        const srcStr = String(sourceVal);
        const resStr = ex.answer;
        for (const s of [srcStr, resStr]) {
          const dot = s.indexOf('.');
          if (dot !== -1) expect(s.length - dot - 1).toBeLessThanOrEqual(3);
          const intPart = dot === -1 ? s : s.slice(0, dot);
          const trailing = intPart.match(/0+$/);
          if (trailing) expect(trailing[0].length).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('time levels use adjacent unit pairs (1 step)', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 7; c <= 9; c++) {
        const ex = generateUnitConversion(seed, c);
        const { fromUnit, toUnit } = parse(ex);
        const fromIdx = CATEGORIES.time.units.indexOf(fromUnit);
        const toIdx = CATEGORIES.time.units.indexOf(toUnit);
        expect(Math.abs(fromIdx - toIdx)).toBe(1);
      }
    }
  });
});

describe('validateUnitConversion', () => {
  it('accepts correct answer', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generateUnitConversion(seed, c);
        expect(validateUnitConversion(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('accepts correct answer with comma decimal separator', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateUnitConversion(seed, 5);
      const withComma = ex.answer.replace('.', ',');
      if (withComma !== ex.answer) {
        expect(validateUnitConversion(withComma, ex)).toBe(true);
      }
    }
  });

  it('rejects off-by-factor-10 answer', () => {
    let foundDecimal = false;
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateUnitConversion(seed, c);
        const ans = parseFloat(ex.answer);
        if (ans !== 0) {
          expect(validateUnitConversion(String(ans * 10), ex)).toBe(false);
          expect(validateUnitConversion(String(ans / 10), ex)).toBe(false);
          foundDecimal = true;
        }
      }
    }
    expect(foundDecimal).toBe(true);
  });

  it('rejects wrong unit result', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateUnitConversion(seed, 0);
      const ans = parseFloat(ex.answer);
      expect(validateUnitConversion(String(ans + 1), ex)).toBe(false);
    }
  });

  it('rejects empty answer', () => {
    const ex = generateUnitConversion(42, 0);
    expect(validateUnitConversion('', ex)).toBe(false);
    expect(validateUnitConversion('  ', ex)).toBe(false);
  });

  it('rejects NaN and Infinity', () => {
    const ex = generateUnitConversion(42, 0);
    expect(validateUnitConversion('abc', ex)).toBe(false);
    expect(validateUnitConversion('Infinity', ex)).toBe(false);
  });

  it('rejects fraction input', () => {
    const ex = generateUnitConversion(42, 0);
    expect(validateUnitConversion('1/2', ex)).toBe(false);
    expect(validateUnitConversion('3/4', ex)).toBe(false);
  });
});
