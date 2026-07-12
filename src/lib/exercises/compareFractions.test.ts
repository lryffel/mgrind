import { describe, it, expect } from 'vitest';
import { generateCompareFractions, validateCompareFractions } from './compareFractions';
import type { CompareFractionsData } from './compareFractions';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('generateCompareFractions', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateCompareFractions, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateCompareFractions, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateCompareFractions, 5);
  });

  it('generates 2 comparisons at low complexity (0-4)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateCompareFractions(seed, 0);
      const data = ex.data as CompareFractionsData;
      expect(data.comparisons).toHaveLength(2);
    }
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateCompareFractions(seed, 4);
      const data = ex.data as CompareFractionsData;
      expect(data.comparisons).toHaveLength(2);
    }
  });

  it('generates 3 comparisons at high complexity (5-10)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateCompareFractions(seed, 5);
      const data = ex.data as CompareFractionsData;
      expect(data.comparisons).toHaveLength(3);
    }
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateCompareFractions(seed, 10);
      const data = ex.data as CompareFractionsData;
      expect(data.comparisons).toHaveLength(3);
    }
  });

  it('answer is comma-separated operators matching comparison count', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateCompareFractions(seed, seed % 11);
      const data = ex.data as CompareFractionsData;
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(data.comparisons.length);
      for (const p of parts) {
        expect(['<', '>', '=']).toContain(p);
      }
    }
  });

  it('each comparison has a valid operator', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateCompareFractions(seed, seed % 11);
      const data = ex.data as CompareFractionsData;
      for (const comp of data.comparisons) {
        expect(['<', '>', '=']).toContain(comp.correctOperator);
      }
    }
  });

  it('operator matches the actual fraction comparison', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateCompareFractions(seed, seed % 11);
      const data = ex.data as CompareFractionsData;
      for (const comp of data.comparisons) {
        const left = comp.num1 * comp.den2;
        const right = comp.num2 * comp.den1;
        const expected = left < right ? '<' : left > right ? '>' : '=';
        expect(comp.correctOperator).toBe(expected);
      }
    }
  });

  it('all denominators are positive', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateCompareFractions(seed, seed % 11);
      const data = ex.data as CompareFractionsData;
      for (const comp of data.comparisons) {
        expect(comp.den1).toBeGreaterThan(0);
        expect(comp.den2).toBeGreaterThan(0);
      }
    }
  });

  it('all numerators and denominators are integers', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateCompareFractions(seed, seed % 11);
      const data = ex.data as CompareFractionsData;
      for (const comp of data.comparisons) {
        expect(Number.isInteger(comp.num1)).toBe(true);
        expect(Number.isInteger(comp.den1)).toBe(true);
        expect(Number.isInteger(comp.num2)).toBe(true);
        expect(Number.isInteger(comp.den2)).toBe(true);
      }
    }
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateCompareFractions(42, -5);
    const data = ex.data as CompareFractionsData;
    expect(data.comparisons.length).toBeGreaterThanOrEqual(2);
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateCompareFractions(42, 20);
    const data = ex.data as CompareFractionsData;
    expect(data.comparisons.length).toBeGreaterThanOrEqual(2);
  });
});

describe('validateCompareFractions', () => {
  it('accepts correct answer', () => {
    const ex = generateCompareFractions(42, 3);
    expect(validateCompareFractions(ex.answer, ex)).toBe(true);
  });

  it('rejects incorrect answer', () => {
    const ex = generateCompareFractions(42, 3);
    const parts = ex.answer.split(',');
    const wrong = parts.map((p) => (p === '<' ? '>' : p === '>' ? '<' : '>')).join(',');
    expect(validateCompareFractions(wrong, ex)).toBe(false);
  });

  it('rejects answer with wrong number of parts', () => {
    const ex = generateCompareFractions(42, 0);
    expect(validateCompareFractions('<', ex)).toBe(false);
    expect(validateCompareFractions('<,>,=', ex)).toBe(false);
  });

  it('rejects empty answer', () => {
    const ex = generateCompareFractions(42, 0);
    expect(validateCompareFractions('', ex)).toBe(false);
  });

  it('accepts answer with extra whitespace', () => {
    const ex = generateCompareFractions(42, 3);
    const parts = ex.answer.split(',').map((p) => ` ${p} `).join(',');
    expect(validateCompareFractions(parts, ex)).toBe(true);
  });
});
