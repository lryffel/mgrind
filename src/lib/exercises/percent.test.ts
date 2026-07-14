import { describe, it, expect } from 'vitest';
import { generatePercent, validatePercent } from './percent';
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
      const raw = (data.c1 * data.n2) / data.n1;
      const expected = Math.round(raw * 100) / 100;
      expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
    }
  });

  it('variant E computes correctly: result = t1 * n1 / n2', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePercent(seed, 7);
      const data = getData(ex);
      if (data.variant !== 'E') continue;
      const raw = (data.t1 * data.n1) / data.n2;
      const expected = Math.round(raw * 100) / 100;
      expect(Math.abs(parseFloat(ex.answer) - expected)).toBeLessThan(1e-9);
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

  it('answers are terminating decimals (max 2 dp)', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const val = parseFloat(ex.answer);
        expect(Math.abs(val - Math.round(val * 100) / 100)).toBeLessThan(1e-9);
      }
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generatePercent(42, 20);
    expect(ex.answer).toBeTruthy();
    expect(ex.prompt).toBeTruthy();
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generatePercent(42, -5);
    expect(ex.answer).toBeTruthy();
    expect(ex.prompt).toBeTruthy();
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

  it('variant D at higher complexity: n2 is not a multiple of n1', () => {
    let nonMultipleFound = false;
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 2; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'D') continue;
        if (data.n2 % data.n1 !== 0) nonMultipleFound = true;
      }
    }
    expect(nonMultipleFound).toBe(true);
  });

  it('variant E at higher complexity: neither n1 nor n2 divides the other', () => {
    let nonDivisorFound = false;
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 2; c <= 10; c++) {
        const ex = generatePercent(seed, c);
        const data = getData(ex);
        if (data.variant !== 'E') continue;
        if (data.n1 % data.n2 !== 0 && data.n2 % data.n1 !== 0) nonDivisorFound = true;
      }
    }
    expect(nonDivisorFound).toBe(true);
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
