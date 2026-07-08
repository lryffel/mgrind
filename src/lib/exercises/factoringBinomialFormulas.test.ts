import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import {
  generateFactoringBinomialFormulas,
  validateFactoringBinomialFormulas,
  formatFactoredLatex,
} from './factoringBinomialFormulas';

describe('generateFactoringBinomialFormulas', () => {
  it('returns a valid exercise with prompt, answer, and data', () => {
    const ex = generateFactoringBinomialFormulas(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect(typeof ex.prompt).toBe('string');
    expect(ex.prompt.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateFactoringBinomialFormulas(12345, 3);
    const b = generateFactoringBinomialFormulas(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateFactoringBinomialFormulas(1, 5);
    const b = generateFactoringBinomialFormulas(2, 5);
    expect(a).not.toEqual(b);
  });

  it('non-trap exercises have correct answer format (formula,a/b,c/d)', () => {
    let seenNonTrap = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringBinomialFormulas(seed, 3);
      if (ex.data?.correctFormula !== 0) {
        seenNonTrap++;
        const parts = ex.answer.split(',');
        expect(parts.length).toBe(3);
        expect(['1', '2', '3']).toContain(parts[0]);
        expect(parts[1]).toMatch(/^\d+(\/\d+)?$/);
        expect(parts[2]).toMatch(/^\d+(\/\d+)?$/);
      }
    }
    expect(seenNonTrap).toBeGreaterThan(0);
  });

  it('trap exercises have answer "0" and correctFormula 0', () => {
    let seenTrap = false;
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringBinomialFormulas(seed, 5);
      if (ex.data?.correctFormula === 0) {
        seenTrap = true;
        expect(ex.answer).toBe('0');
      }
    }
    expect(seenTrap).toBe(true);
  });

  it('produces traps approximately 25% of the time', () => {
    let trapCount = 0;
    const total = 2000;
    for (let seed = 0; seed < total; seed++) {
      const ex = generateFactoringBinomialFormulas(seed, 5);
      if (ex.data?.correctFormula === 0) trapCount++;
    }
    expect(trapCount).toBeGreaterThan(total * 0.1);
    expect(trapCount).toBeLessThan(total * 0.4);
  });

  it('at complexity 0-4, all three real formula types appear', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringBinomialFormulas(seed, 3);
      const cf = ex.data?.correctFormula as number;
      if (cf !== 0) seen.add(cf);
    }
    expect(seen.has(1)).toBe(true);
    expect(seen.has(2)).toBe(true);
    expect(seen.has(3)).toBe(true);
  });

  it('low complexity (0-4) produces only integer coefficients (denominator 1)', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateFactoringBinomialFormulas(seed + c * 1000, c);
        if (ex.data?.correctFormula === 0) continue;
        const parts = ex.answer.split(',');
        expect(parts[1]).toMatch(/^\d+\/1$/);
        expect(parts[2]).toMatch(/^\d+\/1$/);
      }
    }
  });

  it('high complexity (5-9) may produce fractional coefficients', () => {
    let sawFraction = false;
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 5; c <= 9; c++) {
        const ex = generateFactoringBinomialFormulas(seed + c * 1000, c);
        if (ex.data?.correctFormula === 0) continue;
        if (ex.answer.includes('/')) sawFraction = true;
      }
    }
    expect(sawFraction).toBe(true);
  });
});

describe('validateFactoringBinomialFormulas', () => {
  it('accepts the correct answer for a non-trap exercise', () => {
    const ex = generateFactoringBinomialFormulas(42, 0);
    if (ex.data?.correctFormula === 0) return;
    expect(validateFactoringBinomialFormulas(ex.answer, ex)).toBe(true);
  });

  it('rejects wrong formula type', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '2,3/1,4/1',
      data: { correctFormula: 2 },
    };
    expect(validateFactoringBinomialFormulas('1,3/1,4/1', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('3,3/1,4/1', ex)).toBe(false);
  });

  it('rejects incorrect coefficients', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3/1,4/1',
      data: { correctFormula: 1 },
    };
    expect(validateFactoringBinomialFormulas('1,5/1,4/1', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('1,3/1,2/1', ex)).toBe(false);
  });

  it('accepts equivalent fractions', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1/2,3/4',
      data: { correctFormula: 1 },
    };
    expect(validateFactoringBinomialFormulas('1,2/4,3/4', ex)).toBe(true);
    expect(validateFactoringBinomialFormulas('1,1/2,6/8', ex)).toBe(true);
  });

  it('accepts answer "0" for a trap exercise (correctFormula 0)', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '0',
      data: { correctFormula: 0 },
    };
    expect(validateFactoringBinomialFormulas('0', ex)).toBe(true);
  });

  it('rejects wrong formula for a trap exercise', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '0',
      data: { correctFormula: 0 },
    };
    expect(validateFactoringBinomialFormulas('1,1/1,1/1', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('2,2/1,3/1', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('3,4/1,5/1', ex)).toBe(false);
  });

  it('rejects when selecting "no formula" for a real exercise', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3/1,4/1',
      data: { correctFormula: 1 },
    };
    expect(validateFactoringBinomialFormulas('0', ex)).toBe(false);
  });

  it('rejects malformed answer strings', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1/2,3/4',
      data: { correctFormula: 1 },
    };
    expect(validateFactoringBinomialFormulas('', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('abc', ex)).toBe(false);
    expect(validateFactoringBinomialFormulas('1,,', ex)).toBe(false);
  });
});

describe('formatFactoredLatex', () => {
  it('formats (a+b)² — a has no variable, b has variable', () => {
    const result = formatFactoredLatex(1, 2, 1, 3, 1, null, 'x');
    expect(result).toBe('(2 + 3x)^{2}');
  });

  it('formats (a-b)² — a has no variable, b has variable', () => {
    const result = formatFactoredLatex(2, 5, 1, 2, 1, null, 'y');
    expect(result).toBe('(5 - 2y)^{2}');
  });

  it('formats (a+b)(a-b) — a has no variable, b has variable', () => {
    const result = formatFactoredLatex(3, 3, 1, 4, 1, null, 'z');
    expect(result).toBe('(3 + 4z)(3 - 4z)');
  });

  it('formats (a+b)(a-b) with two variables', () => {
    const result = formatFactoredLatex(3, 2, 1, 3, 1, 'a', 'b');
    expect(result).toBe('(2a + 3b)(2a - 3b)');
  });

  it('formats (a+b)² with fractional coefficients', () => {
    const result = formatFactoredLatex(1, 1, 2, 3, 4, 'x', 'x');
    expect(result).toBe('(\\frac{1}{2}x + \\frac{3}{4}x)^{2}');
  });

  it('omits coefficient 1 when variable is present', () => {
    const result = formatFactoredLatex(3, 1, 1, 5, 1, 'a', 'b');
    expect(result).toBe('(a + 5b)(a - 5b)');
  });

  it('shows coefficient 1 when variable is absent', () => {
    const result = formatFactoredLatex(3, 1, 1, 5, 1, null, 'k');
    expect(result).toBe('(1 + 5k)(1 - 5k)');
  });

  it('handles LaTeX command variables like \\ell', () => {
    const result = formatFactoredLatex(1, 1, 1, 2, 1, '\\ell', 'm');
    expect(result).toBe('(\\ell{} + 2m)^{2}');
  });
});
