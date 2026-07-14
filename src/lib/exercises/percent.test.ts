import { describe, it, expect } from 'vitest';
import { generatePercent, generatePercentExercise, validatePercent } from './percent';
import type { TextInputCardData } from '../components/cards/cardData';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';
import type { PercentData } from './percent';

function getData(ex: { data?: unknown }): PercentData {
  return ex.data as PercentData;
}

function countVariant(seeds: number, complexity: number, target: string): number {
  let count = 0;
  for (let seed = 0; seed < seeds; seed++) {
    const ex = generatePercent(seed, complexity);
    if (getData(ex).variant === target) count++;
  }
  return count;
}

describe('generatePercent', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generatePercent, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generatePercent, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generatePercent, 5);
  });

  it('has a data object with variant field', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generatePercent(seed, 5);
      const data = getData(ex);
      expect(['A', 'B', 'C', 'D', 'E']).toContain(data.variant);
    }
  });

  it('band 0-2 only produces variants A and D', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 2; c++) {
        const ex = generatePercent(seed, c);
        const v = getData(ex).variant;
        expect(['A', 'D']).toContain(v);
      }
    }
  });

  it('band 3-4 produces variants A, B, C, D', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 3; c <= 4; c++) {
        const ex = generatePercent(seed, c);
        seen.add(getData(ex).variant);
      }
    }
    expect(seen.has('A')).toBe(true);
    expect(seen.has('B')).toBe(true);
    expect(seen.has('C')).toBe(true);
    expect(seen.has('D')).toBe(true);
    expect(seen.has('E')).toBe(false);
  });

  it('band 5-7 includes variant E', () => {
    expect(countVariant(200, 6, 'E')).toBeGreaterThan(0);
  });

  it('band 8-10 produces all five variants', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 8; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        seen.add(getData(ex).variant);
      }
    }
    expect(seen.has('A')).toBe(true);
    expect(seen.has('B')).toBe(true);
    expect(seen.has('C')).toBe(true);
    expect(seen.has('D')).toBe(true);
    expect(seen.has('E')).toBe(true);
  });

  it('variant A computes correctly: W = p * G / 100', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'A') continue;
        const expected = (data.p * data.G) / 100;
        expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
      }
    }
  });

  it('variant B computes correctly: G = W * 100 / p', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'B') continue;
        const expected = (data.W * 100) / data.p;
        expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
      }
    }
  });

  it('variant C computes correctly: p = W * 100 / G', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'C') continue;
        const expected = (data.W * 100) / data.G;
        expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
      }
    }
  });

  it('variant D computes correctly: result = c1 * n2 / n1', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 5);
      const data = getData(ex);
      if (data.variant !== 'D') continue;
      const expected = (data.c1 * data.n2) / data.n1;
      expect(Number.isInteger(expected)).toBe(true);
      expect(parseFloat(ex.answer)).toBe(expected);
    }
  });

  it('variant E computes correctly: result = t1 * n1 / n2', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 7);
      const data = getData(ex);
      if (data.variant !== 'E') continue;
      const expected = (data.t1 * data.n1) / data.n2;
      expect(Number.isInteger(expected)).toBe(true);
      expect(parseFloat(ex.answer)).toBe(expected);
    }
  });

  it('validatePercent accepts correct answer', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        expect(validatePercent(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('validatePercent accepts correct answer with % suffix for all variants', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePercent(seed, 5);
      expect(validatePercent(ex.answer + '%', ex)).toBe(true);
    }
  });

  it('validatePercent accepts fraction input for decimal answers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePercent(seed, 7);
      const ans = parseFloat(ex.answer);
      if (Number.isInteger(ans)) continue;
      for (let den = 2; den <= 100; den++) {
        const num = Math.round(ans * den);
        if (Math.abs(num / den - ans) < 1e-6) {
          expect(validatePercent(`${num}/${den}`, ex)).toBe(true);
          break;
        }
      }
    }
  });

  it('validatePercent rejects wrong answers', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = generatePercent(seed, 5);
      const ans = parseFloat(ex.answer);
      expect(validatePercent(String(ans + 1), ex)).toBe(false);
      expect(validatePercent('0', ex)).toBe(false);
    }
  });

  it('no p=0 generated', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant === 'D' || data.variant === 'E') continue;
        expect(data.p).not.toBe(0);
      }
    }
  });

  it('p=100 appears rarely (< 7% of A/B/C generations)', () => {
    let total = 0;
    let p100 = 0;
    for (let seed = 0; seed < 1000; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant === 'D' || data.variant === 'E') continue;
        total++;
        if (data.p === 100) p100++;
      }
    }
    expect(p100 / total).toBeLessThan(0.07);
  });

  it('G and W never zero for percentage variants', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant === 'D' || data.variant === 'E') continue;
        expect(data.G).toBeGreaterThan(0);
        expect(data.W).toBeGreaterThan(0);
      }
    }
  });

  it('n1 and n2 are positive and distinct for proportions', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 5; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'D' && data.variant !== 'E') continue;
        expect(data.n1).toBeGreaterThan(0);
        expect(data.n2).toBeGreaterThan(0);
        expect(data.n1).not.toBe(data.n2);
      }
    }
  });

  it('answers are integers for D and E, terminating decimals for A-C', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        const val = parseFloat(ex.answer);
        if (data.variant === 'D' || data.variant === 'E') {
          expect(Number.isInteger(val)).toBe(true);
        } else {
          expect(Math.abs(val - Math.round(val * 100) / 100)).toBeLessThan(1e-9);
        }
      }
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generatePercent(42, 20);
    expect(ex.answer).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generatePercent(42, -5);
    expect(ex.answer).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
  });

  it('variant C has variablePart set to thin-space percent', () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 5);
      const data = getData(ex);
      if (data.variant === 'C') {
        expect(data.variablePart).toBe('\\,\\%');
        found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('variant D has variablePart for currency with thin space', () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 5);
      const data = getData(ex);
      if (data.variant === 'D') {
        expect(data.variablePart).toBe('\\,\\text{CHF}');
        found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('variant E has variablePart for hours with thin space', () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 8);
      const data = getData(ex);
      if (data.variant === 'E') {
        expect(data.variablePart).toBe('\\,\\text{h}');
        found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('variant D at low complexity: n2 is always a multiple of n1 (d=1)', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 1; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'D') continue;
        expect(data.n2 % data.n1).toBe(0);
      }
    }
  });

  it('variant E at low complexity: n2 always divides n1 (integer result)', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 1; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'E') continue;
        expect(data.n1 % data.n2).toBe(0);
      }
    }
  });

  it('G is a multiple of 20 at all bands', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant === 'D' || data.variant === 'E') continue;
        expect(data.G % 20).toBe(0);
      }
    }
  });

  it('variant D always has n2 as a multiple of n1 (integer result)', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'D') continue;
        expect(data.n2 % data.n1).toBe(0);
      }
    }
  });

  it('variant E always has n1 as a multiple of n2 (integer result)', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'E') continue;
        expect(data.n1 % data.n2).toBe(0);
      }
    }
  });

  it('G never exceeds 400', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant === 'D' || data.variant === 'E') continue;
        expect(data.G).toBeLessThanOrEqual(400);
      }
    }
  });
});

describe('generatePercentExercise', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generatePercentExercise, 42, 5);
  });

  it('sets pattern to text-input', () => {
    const ex = generatePercentExercise(42, 5);
    expect(ex.pattern).toBe('text-input');
  });

  it('is deterministic for the same seed', () => {
    expectDeterministic(generatePercentExercise, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generatePercentExercise, 5);
  });

  it('sets promptKey and promptArgs based on variant', () => {
    const ex = generatePercentExercise(42, 5);
    const data = ex.data as TextInputCardData;
    expect(data.promptKey).toBeTruthy();
    expect(data.promptKey).toMatch(/^exercise\.percent\.promptLabel/);
    expect(Array.isArray(data.promptArgs)).toBe(true);
  });

  it('preserves the answer from base generator', () => {
    const base = generatePercent(42, 5);
    const wrapped = generatePercentExercise(42, 5);
    expect(wrapped.answer).toBe(base.answer);
  });

  it('variant C sets correctLatex with percent sign', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercentExercise(seed, 5);
      const data = ex.data as TextInputCardData;
      if (getData(ex).variant === 'C') {
        expect(data.correctLatex).toContain('\\%');
        return;
      }
    }
  });

  it('variant D sets correctLatex with CHF', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercentExercise(seed, 5);
      const data = ex.data as TextInputCardData;
      if (getData(ex).variant === 'D') {
        expect(data.correctLatex).toContain('CHF');
        return;
      }
    }
  });

  it('variant E sets correctLatex with h', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercentExercise(seed, 8);
      const data = ex.data as TextInputCardData;
      if (getData(ex).variant === 'E') {
        expect(data.correctLatex).toContain('\\text{h}');
        return;
      }
    }
  });
});
