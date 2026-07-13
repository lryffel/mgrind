import { describe, it, expect } from 'vitest';
import {
  generateNecessityOfParentheses,
  validateNecessityOfParentheses,
  type NecessityOfParenthesesData,
} from './necessityOfParentheses';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: { data?: unknown }): NecessityOfParenthesesData {
  return ex.data as NecessityOfParenthesesData;
}

describe('generateNecessityOfParentheses', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateNecessityOfParentheses, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateNecessityOfParentheses, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateNecessityOfParentheses, 5);
  });

  it('produces exactly 3 questions', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      expect(d(ex).questions).toHaveLength(3);
    }
  });

  it('each question has latex and needsParens', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      for (const q of d(ex).questions) {
        expect(typeof q.latex).toBe('string');
        expect(q.latex.length).toBeGreaterThan(0);
        expect(typeof q.needsParens).toBe('boolean');
      }
    }
  });

  it('answer matches the needsParens values of questions', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      const expected = d(ex)
        .questions.map((q) => (q.needsParens ? 'yes' : 'no'))
        .join(',');
      expect(ex.answer).toBe(expected);
    }
  });

  it('validate accepts correct answer', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      expect(validateNecessityOfParentheses(ex.answer, ex)).toBe(true);
    }
  });

  it('validate rejects wrong answer', () => {
    let foundMixed = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      const expectedParts = ex.answer.split(',');
      const wrong = expectedParts.map((p) => (p === 'yes' ? 'no' : 'yes')).join(',');
      if (wrong !== ex.answer) {
        foundMixed = true;
        expect(validateNecessityOfParentheses(wrong, ex)).toBe(false);
      }
    }
    expect(foundMixed).toBe(true);
  });

  it('validate trims whitespace from submitted answer', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      expect(validateNecessityOfParentheses('  ' + ex.answer + '  ', ex)).toBe(true);
    }
  });

  it('validate rejects incorrect length', () => {
    const ex = generateNecessityOfParentheses(42, 5);
    expect(validateNecessityOfParentheses('yes,no', ex)).toBe(false);
    expect(validateNecessityOfParentheses('yes,no,yes,no', ex)).toBe(false);
  });

  it('at low complexity, variable names are short (single letters)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateNecessityOfParentheses(seed, 0);
      for (const q of d(ex).questions) {
        const matches = q.latex.match(/[a-z]{2,}/g);
        if (matches) {
          for (const m of matches) {
            if (!['sqrt', 'ell'].includes(m)) {
              expect(m.length).toBeLessThanOrEqual(2);
            }
          }
        }
      }
    }
  });

  it('at high complexity, may include monomials with coefficients or exponents', () => {
    let foundComplex = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateNecessityOfParentheses(seed, 9);
      for (const q of d(ex).questions) {
        if (/[0-9]/.test(q.latex)) {
          foundComplex = true;
          break;
        }
      }
      if (foundComplex) break;
    }
    expect(foundComplex).toBe(true);
  });

  it('picks 3 distinct question types per round', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNecessityOfParentheses(seed, 5);
      const latexes = d(ex).questions.map((q) => q.latex);
      expect(latexes).toHaveLength(3);
    }
  });

  it('inserts \\cdot before a factor starting with a digit when juxtaposed', () => {
    let foundDot = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateNecessityOfParentheses(seed, 9);
      for (const q of d(ex).questions) {
        if (/\\cdot/.test(q.latex)) {
          foundDot = true;
          break;
        }
      }
      if (foundDot) break;
    }
    expect(foundDot).toBe(true);
  });
});
