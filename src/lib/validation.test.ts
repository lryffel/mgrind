import { describe, it, expect } from 'vitest';
import { normalizeCoeff, trimCompare, validateFractionAnswer } from './validation';
import { validateCollectingTerms } from './exercises/collectingTerms';
import { validateBinomialFormulas } from './exercises/binomialFormulas';
import { validateExpandAndCollect } from './exercises/expandAndCollect';
import { validateExpand } from './exercises/expand';
import { exerciseTypes } from './data/exerciseTypes';
import type { Exercise } from './types';

describe('normalizeCoeff', () => {
  it('returns "-1" for bare dash', () => {
    expect(normalizeCoeff('-')).toBe('-1');
  });

  it('returns "-1" for dash with whitespace', () => {
    expect(normalizeCoeff('  -  ')).toBe('-1');
  });

  it('returns "1" for empty string', () => {
    expect(normalizeCoeff('')).toBe('1');
  });

  it('returns "1" for whitespace only', () => {
    expect(normalizeCoeff('   ')).toBe('1');
  });

  it('returns the number itself for a positive integer', () => {
    expect(normalizeCoeff('5')).toBe('5');
  });

  it('returns the number itself for a negative integer', () => {
    expect(normalizeCoeff('-3')).toBe('-3');
  });

  it('passes through a fraction', () => {
    expect(normalizeCoeff('3/4')).toBe('3/4');
  });

  it('passes through "-1/2"', () => {
    expect(normalizeCoeff('-1/2')).toBe('-1/2');
  });
});

describe('trimCompare', () => {
  it('accepts exact match', () => {
    expect(trimCompare('hello', { prompt: '', answer: 'hello' })).toBe(true);
  });

  it('trims whitespace from answer', () => {
    expect(trimCompare('  hello  ', { prompt: '', answer: 'hello' })).toBe(true);
  });

  it('rejects wrong answer', () => {
    expect(trimCompare('world', { prompt: '', answer: 'hello' })).toBe(false);
  });
});

describe('validateFractionAnswer', () => {
  it('accepts identical fraction (num,den)', () => {
    const ex: Exercise = { prompt: '', answer: '1,2' };
    expect(validateFractionAnswer('1,2', ex)).toBe(true);
  });

  it('accepts equivalent unreduced fraction', () => {
    const ex: Exercise = { prompt: '', answer: '1,2' };
    expect(validateFractionAnswer('2,4', ex)).toBe(true);
  });

  it('accepts equivalent reduced fraction (for an unreduced correct answer)', () => {
    const ex: Exercise = { prompt: '', answer: '4,6' };
    expect(validateFractionAnswer('2,3', ex)).toBe(true);
  });

  it('rejects different fraction', () => {
    const ex: Exercise = { prompt: '', answer: '1,2' };
    expect(validateFractionAnswer('3,4', ex)).toBe(false);
  });

  it('normalizes negative denominator', () => {
    const ex: Exercise = { prompt: '', answer: '-1,2' };
    expect(validateFractionAnswer('1,-2', ex)).toBe(true);
  });

  it('normalizes negative denominator in correct answer', () => {
    const ex: Exercise = { prompt: '', answer: '1,-2' };
    expect(validateFractionAnswer('-1,2', ex)).toBe(true);
  });

  it('handles zero numerator', () => {
    const ex: Exercise = { prompt: '', answer: '0,1' };
    expect(validateFractionAnswer('0,5', ex)).toBe(true);
  });

  it('rejects invalid input', () => {
    const ex: Exercise = { prompt: '', answer: '1,2' };
    expect(validateFractionAnswer('abc', ex)).toBe(false);
  });

  it('rejects denominator zero', () => {
    const ex: Exercise = { prompt: '', answer: '1,0' };
    expect(validateFractionAnswer('1,2', ex)).toBe(false);
  });

  it('rejects empty answer', () => {
    const ex: Exercise = { prompt: '', answer: '1,2' };
    expect(validateFractionAnswer('', ex)).toBe(false);
  });
});

describe('exercise type validation integration', () => {
  it('multiplicationFraction accepts unreduced equivalent answer', () => {
    const type = exerciseTypes['multiplicationFraction'];
    for (let seed = 0; seed < 50; seed++) {
      const ex = type.generate(seed, 5);
      const [num, den] = ex.answer.split(',').map(Number);
      const unreduced = `${num * 3},${den * 3}`;
      expect(type.validate(unreduced, ex)).toBe(true);
    }
  });

  it('additionFraction accepts unreduced equivalent answer', () => {
    const type = exerciseTypes['additionFraction'];
    for (let seed = 0; seed < 50; seed++) {
      const ex = type.generate(seed, 5);
      const [num, den] = ex.answer.split(',').map(Number);
      const unreduced = `${num * 2},${den * 2}`;
      expect(type.validate(unreduced, ex)).toBe(true);
    }
  });

  it('simplifyFraction accepts unreduced equivalent answer', () => {
    const type = exerciseTypes['simplifyFraction'];
    for (let seed = 0; seed < 50; seed++) {
      const ex = type.generate(seed, 5);
      const [num, den] = ex.answer.split(',').map(Number);
      const unreduced = `${num * 3},${den * 3}`;
      expect(type.validate(unreduced, ex)).toBe(true);
    }
  });

  it('subtractionFraction accepts unreduced equivalent answer', () => {
    const type = exerciseTypes['subtractionFraction'];
    for (let seed = 0; seed < 50; seed++) {
      const ex = type.generate(seed, 5);
      const [num, den] = ex.answer.split(',').map(Number);
      const unreduced = `${num * 2},${den * 2}`;
      expect(type.validate(unreduced, ex)).toBe(true);
    }
  });

  it('trimCompare-based types still trim whitespace', () => {
    const types = [
      'multiplication',
      'division',
      'squares',
      'orderOfOperations',
      'primeFactorisation',
      'scientificNotation',
    ] as const;
    for (const id of types) {
      const type = exerciseTypes[id];
      const ex = type.generate(42, 0);
      expect(type.validate(`  ${ex.answer}  `, ex)).toBe(true);
    }
  });
});

describe('multi-input validators handle negative coefficients', () => {
  it('collectingTerms accepts "-1" as a part', () => {
    const ex: Exercise = {
      prompt: 'a - b',
      answer: '-1,1',
      data: { fields: [{ variablePart: 'a' }, { variablePart: 'b' }] },
    };
    expect(validateCollectingTerms('-1,1', ex)).toBe(true);
  });

  it('binomialFormulas validates with "-1" parts', () => {
    const ex: Exercise = {
      prompt: '(a - b)^2 = ?',
      answer: '1,1',
      data: { fields: [{ variablePart: 'a^2' }, { variablePart: 'b^2' }] },
    };
    expect(validateBinomialFormulas('1,1', ex)).toBe(true);
  });

  it('expandAndCollect validates with "-1" parts', () => {
    const ex: Exercise = {
      prompt: '(x - 2)(x + 3)',
      answer: '1,1,-6',
      data: { fields: [{ variablePart: 'x^2' }, { variablePart: 'x' }, { variablePart: '' }] },
    };
    expect(validateExpandAndCollect('1,1,-6', ex)).toBe(true);
  });

  it('expand validates with "-1" parts', () => {
    const ex: Exercise = {
      prompt: '(x - 1)^2',
      answer: '1,-2,1',
      data: { fields: [{ variablePart: 'x^2' }, { variablePart: 'x' }, { variablePart: '' }] },
    };
    expect(validateExpand('1,-2,1', ex)).toBe(true);
  });
});
