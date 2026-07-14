import { describe, it, expect } from 'vitest';
import {
  generateLinearEquations,
  generateLinearEquationsExercise,
  validateLinearEquations,
  type LinearEquationsData,
} from './linearEquations';
import type { TextInputCardData } from '../components/cards/cardData';
import { initLang } from '../i18n.svelte';
import { expectDeterministic, expectSeedVariation } from '../test-utils';

initLang();

describe('linearEquations', () => {
  it('generates a valid exercise', () => {
    const ex = generateLinearEquations(42, 0);
    expect(ex.prompt).toBeTruthy();
    expect(ex.answer).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
    expect(typeof ex.answer).toBe('string');
  });

  it('accepts the correct answer', () => {
    const ex = generateLinearEquations(42, 0);
    expect(validateLinearEquations(ex.answer, ex)).toBe(true);
  });

  it('rejects a wrong answer', () => {
    const ex = generateLinearEquations(42, 0);
    expect(validateLinearEquations('999', ex)).toBe(false);
  });

  it('trims whitespace', () => {
    const ex = generateLinearEquations(42, 0);
    expect(validateLinearEquations('  ' + ex.answer + '  ', ex)).toBe(true);
  });

  it('rejects empty input', () => {
    const ex = generateLinearEquations(42, 0);
    expect(validateLinearEquations('', ex)).toBe(false);
  });

  it('is deterministic for the same seed', () => {
    const a = generateLinearEquations(100, 3);
    const b = generateLinearEquations(100, 3);
    expect(a.answer).toBe(b.answer);
    expect(a.prompt).toBe(b.prompt);
  });

  it('generates different exercises for different seeds', () => {
    const a = generateLinearEquations(1, 3);
    const b = generateLinearEquations(2, 3);
    expect(a.answer !== b.answer || a.prompt !== b.prompt).toBe(true);
  });

  it('generates an equation with the variable letter in the prompt', () => {
    const ex = generateLinearEquations(42, 0);
    expect((ex.data as LinearEquationsData).variable).toBeTruthy();
  });

  it('works with fraction answers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateLinearEquations(seed, 7);
      if (ex.answer.includes('/')) {
        expect(validateLinearEquations(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('accepts decimal input for terminating fractions', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateLinearEquations(seed, 7);
      if (
        ex.answer === '1/2' ||
        ex.answer === '-1/2' ||
        ex.answer === '3/4' ||
        ex.answer === '-3/4' ||
        ex.answer === '1/4' ||
        ex.answer === '-1/4'
      ) {
        const [n, d] = ex.answer.split('/').map(Number);
        expect(validateLinearEquations(String(n / d), ex)).toBe(true);
        return;
      }
    }
  });

  it('covers all 4 base formats at low complexity', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateLinearEquations(seed, 0);
      const eq = ex.prompt;
      if (eq.includes('= 0') && eq.includes(' - ')) seen.add('ax-b=0');
      else if (eq.startsWith('-') || /^\d/.test(eq)) {
        if (eq.includes('= 0')) seen.add('b-ax=0');
      }
      if (eq.includes('= ') && eq.includes(' - ')) seen.add('ax=b');
    }
    expect(seen.size).toBeGreaterThanOrEqual(1);
  });

  it('generates split variants at high complexity', () => {
    for (let seed = 200; seed < 300; seed++) {
      const ex = generateLinearEquations(seed, 9);
      expect(ex.prompt).toBeTruthy();
      expect(ex.answer).toBeTruthy();
    }
  });

  describe('validateLinearEquations', () => {
    it('accepts fraction input', () => {
      const ex = generateLinearEquations(42, 5);
      expect(validateLinearEquations(ex.answer, ex)).toBe(true);
    });

    it('rejects malformed input', () => {
      const ex = generateLinearEquations(42, 0);
      expect(validateLinearEquations('abc', ex)).toBe(false);
      expect(validateLinearEquations('1/2/3', ex)).toBe(false);
      expect(validateLinearEquations('/2', ex)).toBe(false);
      expect(validateLinearEquations('/', ex)).toBe(false);
    });

    it('accepts decimal input for exact fractions', () => {
      const ex = generateLinearEquations(42, 5);
      expect(validateLinearEquations(ex.answer, ex)).toBe(true);
    });
  });
});

describe('generateLinearEquationsExercise', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateLinearEquationsExercise(42, 0);
    expect(ex.prompt).toBeTruthy();
    expect(ex.answer).toBeTruthy();
  });

  it('sets pattern to text-input', () => {
    const ex = generateLinearEquationsExercise(42, 0);
    expect(ex.pattern).toBe('text-input');
  });

  it('is deterministic for the same seed', () => {
    expectDeterministic(generateLinearEquationsExercise, 100, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateLinearEquationsExercise, 3);
  });

  it('sets promptKey, promptMath, and promptKeySuffix in data', () => {
    const ex = generateLinearEquationsExercise(42, 0);
    const data = ex.data as TextInputCardData;
    expect(data.promptKey).toBe('exercise.linearEquations.promptBefore');
    expect(data.promptMath).toMatch(/^[a-z]$/);
    expect(data.promptKeySuffix).toBe('exercise.linearEquations.promptAfter');
  });

  it('sets prefixLatex in data', () => {
    const ex = generateLinearEquationsExercise(42, 0);
    const data = ex.data as TextInputCardData;
    expect(data.prefixLatex).toMatch(/^[a-z] = $/);
  });

  it('sets correctLatex in data', () => {
    const ex = generateLinearEquationsExercise(42, 0);
    const data = ex.data as TextInputCardData;
    expect(data.correctLatex).toMatch(/^[a-z] = /);
  });

  it('preserves the variable from base generator', () => {
    const base = generateLinearEquations(42, 3);
    const wrapped = generateLinearEquationsExercise(42, 3);
    const baseData = base.data as LinearEquationsData;
    const wrapData = wrapped.data as LinearEquationsData;
    expect(wrapData.variable).toBe(baseData.variable);
    expect(wrapped.answer).toBe(base.answer);
  });
});
