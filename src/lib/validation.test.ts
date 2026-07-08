import { describe, it, expect } from 'vitest';
import { trimCompare, validateFractionAnswer } from './validation';
import { exerciseTypes } from './data/exerciseTypes';
import type { Exercise } from './types';

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
    const types = ['multiplication', 'division', 'squares', 'orderOfOperations', 'primeFactorisation', 'scientificNotation'] as const;
    for (const id of types) {
      const type = exerciseTypes[id];
      const ex = type.generate(42, 0);
      expect(type.validate(`  ${ex.answer}  `, ex)).toBe(true);
    }
  });
});
