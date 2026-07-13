import { describe, it, expect } from 'vitest';
import { generateNumbersTrivia, validateNumbersTrivia, NUMBERS_TRIVIA_TRUE_FALSE } from './numbersTrivia';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

const ALL_SUB_TYPES = ['trueFalse', 'isNatural', 'isInteger', 'isRational', 'divisibilityRules', 'primeDivisors'];
const LOW_SUB_TYPES = ['trueFalse', 'isNatural', 'isInteger', 'isRational'];

describe('generateNumbersTrivia', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateNumbersTrivia, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateNumbersTrivia, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateNumbersTrivia, 5);
  });

  it('has a valid subType in data', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      expect(ALL_SUB_TYPES).toContain(ex.data?.subType);
    }
  });

  it('at complexity 0, only generates low complexity sub-types', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateNumbersTrivia(seed, 0);
      expect(LOW_SUB_TYPES).toContain(ex.data?.subType);
    }
  });

  it('at complexity 1, includes divisibilityRules', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateNumbersTrivia(seed, 1);
      found.add(ex.data!.subType!);
    }
    expect(found.has('divisibilityRules')).toBe(true);
  });

  it('at complexity 2, includes primeDivisors', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateNumbersTrivia(seed, 2);
      found.add(ex.data!.subType!);
    }
    expect(found.has('primeDivisors')).toBe(true);
  });

  it('generates all sub-types across seeds at complexity 6', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateNumbersTrivia(seed, 6);
      found.add(ex.data!.subType!);
    }
    for (const st of ALL_SUB_TYPES) {
      expect(found.has(st)).toBe(true);
    }
  });

  it('primeDivisors always has answer 2', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      if (ex.data?.subType === 'primeDivisors') {
        expect(ex.answer).toBe('2');
      }
    }
  });

  it('isNatural/isInteger/isRational generates 3 questions at low complexity', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNumbersTrivia(seed, 2);
      if (ex.data?.subType === 'isNatural' || ex.data?.subType === 'isInteger' || ex.data?.subType === 'isRational') {
        expect(ex.data.numberQuestions?.length).toBe(3);
      }
    }
  });

  it('isNatural/isInteger/isRational generates 4 questions at high complexity', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNumbersTrivia(seed, 8);
      if (ex.data?.subType === 'isNatural' || ex.data?.subType === 'isInteger' || ex.data?.subType === 'isRational') {
        expect(ex.data.numberQuestions?.length).toBe(4);
      }
    }
  });

  it('set questions have at least one yes and one no', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      if (ex.data?.subType === 'isNatural' || ex.data?.subType === 'isInteger' || ex.data?.subType === 'isRational') {
        const qs = ex.data.numberQuestions;
        expect(qs).toBeDefined();
        const set = ex.data.numberSet;
        if (set === 'natural') {
          expect(qs!.some((q) => q.isNatural)).toBe(true);
          expect(qs!.some((q) => !q.isNatural)).toBe(true);
        } else if (set === 'integer') {
          expect(qs!.some((q) => q.isInteger)).toBe(true);
          expect(qs!.some((q) => !q.isInteger)).toBe(true);
        } else {
          expect(qs!.some((q) => q.isRational)).toBe(true);
          expect(qs!.some((q) => !q.isRational)).toBe(true);
        }
      }
    }
  });

  it('set questions have correct numberSet', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      if (ex.data?.subType === 'isNatural') expect(ex.data.numberSet).toBe('natural');
      if (ex.data?.subType === 'isInteger') expect(ex.data.numberSet).toBe('integer');
      if (ex.data?.subType === 'isRational') expect(ex.data.numberSet).toBe('rational');
    }
  });

  it('trueFalse generates all statements across seeds', () => {
    const seenIndices = new Set<number>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateNumbersTrivia(seed, 10);
      if (ex.data?.subType === 'trueFalse' && ex.data.statementIndex !== undefined) {
        seenIndices.add(ex.data.statementIndex);
      }
    }
    expect(seenIndices.size).toBe(NUMBERS_TRIVIA_TRUE_FALSE.length);
  });

  it('divisibilityRules always has exactly one correct answer', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      if (ex.data?.subType === 'divisibilityRules') {
        const indices = ex.answer.split(',').map(Number);
        expect(indices.length).toBe(1);
        expect(indices[0]).toBeGreaterThanOrEqual(0);
        expect(indices[0]).toBeLessThan(4);
        expect(ex.data.correctIndices?.length).toBe(1);
      }
    }
  });
});

describe('validateNumbersTrivia', () => {
  it('validates primeDivisors correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNumbersTrivia(seed, 4);
      if (ex.data?.subType === 'primeDivisors') {
        expect(validateNumbersTrivia('2', ex)).toBe(true);
        expect(validateNumbersTrivia(' 2 ', ex)).toBe(true);
        expect(validateNumbersTrivia('0', ex)).toBe(false);
        expect(validateNumbersTrivia('1', ex)).toBe(false);
      }
    }
  });

  it('validates trueFalse correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNumbersTrivia(seed, 3);
      if (ex.data?.subType === 'trueFalse') {
        expect(validateNumbersTrivia(ex.answer, ex)).toBe(true);
        expect(validateNumbersTrivia(ex.answer === '0' ? '1' : '0', ex)).toBe(false);
      }
    }
  });

  it('validates divisibilityRules correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateNumbersTrivia(seed, 5);
      if (ex.data?.subType === 'divisibilityRules') {
        expect(validateNumbersTrivia(ex.answer, ex)).toBe(true);
        const wrong = ex.answer === '0' ? '1' : '0';
        expect(validateNumbersTrivia(wrong, ex)).toBe(false);
      }
    }
  });

  it('validates set sub-types correctly', () => {
    const setTypes = ['isNatural', 'isInteger', 'isRational'];
    for (const st of setTypes) {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateNumbersTrivia(seed, 4);
        if (ex.data?.subType === st) {
          expect(validateNumbersTrivia(ex.answer, ex)).toBe(true);
          const parts = ex.answer.split(',');
          const wrong = parts.map((p: string) => (p === 'yes' ? 'no' : 'yes')).join(',');
          expect(validateNumbersTrivia(wrong, ex)).toBe(false);
        }
      }
    }
  });

  it('rejects non-numeric input for radio-based sub-types', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateNumbersTrivia(seed, 3);
      if (ex.data?.subType === 'trueFalse') {
        expect(validateNumbersTrivia('abc', ex)).toBe(false);
        expect(validateNumbersTrivia('', ex)).toBe(false);
        expect(validateNumbersTrivia('-1', ex)).toBe(false);
      }
    }
  });

  it('set sub-types reject wrong part count', () => {
    const setTypes = ['isNatural', 'isInteger', 'isRational'];
    for (const st of setTypes) {
      for (let seed = 0; seed < 30; seed++) {
        const ex = generateNumbersTrivia(seed, 4);
        if (ex.data?.subType === st) {
          expect(validateNumbersTrivia('yes', ex)).toBe(false);
          expect(validateNumbersTrivia('yes,no,yes,no,yes', ex)).toBe(false);
        }
      }
    }
  });

  it('rejects invalid answers for unknown subType', () => {
    const ex = { prompt: '', answer: '2', data: { subType: 'unknown' } };
    expect(validateNumbersTrivia('2', ex)).toBe(false);
  });
});
