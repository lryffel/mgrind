import { describe, it, expect } from 'vitest';
import { generateTermTransformationsTrivia, validateTermTransformationsTrivia } from './termTransformationsTrivia';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

const ALL_TYPES = ['laws', 'powerLaws', 'trueFalse'];
const LOW_TYPES = ['laws'];
const MID_TYPES = ['laws', 'powerLaws'];

describe('generateTermTransformationsTrivia', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateTermTransformationsTrivia, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateTermTransformationsTrivia, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateTermTransformationsTrivia, 5);
  });

  it('has a valid type in data', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      expect(ALL_TYPES).toContain(ex.data?.triviaType);
    }
  });

  it('at complexity 0-3, only generates laws', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 2);
      expect(LOW_TYPES).toContain(ex.data?.triviaType);
    }
  });

  it('at complexity 4-6, includes powerLaws', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      found.add(ex.data!.triviaType!);
    }
    expect(found.has('powerLaws')).toBe(true);
  });

  it('at complexity 7-10, includes trueFalse', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 8);
      found.add(ex.data!.triviaType!);
    }
    expect(found.has('trueFalse')).toBe(true);
  });

  it('at complexity 6, generates all mid types', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 6);
      found.add(ex.data!.triviaType!);
    }
    for (const t of MID_TYPES) {
      expect(found.has(t)).toBe(true);
    }
  });

  it('generates all three types across seeds at complexity 8', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 8);
      found.add(ex.data!.triviaType!);
    }
    for (const t of ALL_TYPES) {
      expect(found.has(t)).toBe(true);
    }
  });

  it('laws always has exactly 4 options and one correct index', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 2);
      if (ex.data?.triviaType === 'laws') {
        expect(ex.data.triviaOptionsLatex?.length).toBe(4);
        expect(ex.data.correctIndices?.length).toBe(1);
        const idx = ex.data.correctIndices![0];
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
        expect(ex.answer).toBe(String(idx));
      }
    }
  });

  it('powerLaws always has exactly 4 options and one correct index', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      if (ex.data?.triviaType === 'powerLaws') {
        expect(ex.data.triviaOptionsLatex?.length).toBe(4);
        expect(ex.data.correctIndices?.length).toBe(1);
        const idx = ex.data.correctIndices![0];
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
        expect(ex.answer).toBe(String(idx));
      }
    }
  });

  it('laws option with correct index matches correctIndices', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (ex.data?.triviaType === 'laws') {
        const idx = ex.data.correctIndices![0];
        expect(ex.data.triviaOptionsLatex![idx]).toBeDefined();
      }
    }
  });

  it('powerLaws option with correct index matches correctIndices', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 6);
      if (ex.data?.triviaType === 'powerLaws') {
        const idx = ex.data.correctIndices![0];
        expect(ex.data.triviaOptionsLatex![idx]).toBeDefined();
      }
    }
  });

  it('powerLaws at complexity 4 only generates first law', () => {
    const ordinals = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 4);
      if (ex.data?.triviaType === 'powerLaws') {
        ordinals.add(ex.data.ordinalKey ?? '');
      }
    }
    expect(ordinals.has('exercise.termTransformationsTrivia.first')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.second')).toBe(false);
    expect(ordinals.has('exercise.termTransformationsTrivia.third')).toBe(false);
  });

  it('powerLaws at complexity 5 generates first and second laws', () => {
    const ordinals = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      if (ex.data?.triviaType === 'powerLaws') {
        ordinals.add(ex.data.ordinalKey ?? '');
      }
    }
    expect(ordinals.has('exercise.termTransformationsTrivia.first')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.second')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.third')).toBe(false);
  });

  it('powerLaws at complexity 6 generates all three laws', () => {
    const ordinals = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 6);
      if (ex.data?.triviaType === 'powerLaws') {
        ordinals.add(ex.data.ordinalKey ?? '');
      }
    }
    expect(ordinals.has('exercise.termTransformationsTrivia.first')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.second')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.third')).toBe(true);
  });

  it('trueFalse generates 3 statements at complexity 7-8, 4 at 9-10', () => {
    for (let seed = 0; seed < 50; seed++) {
      const exLow = generateTermTransformationsTrivia(seed, 7);
      if (exLow.data?.triviaType === 'trueFalse') {
        expect(exLow.data.statementsLatex?.length).toBe(3);
        expect(exLow.data.correctAnswers?.length).toBe(3);
      }
      const exHigh = generateTermTransformationsTrivia(seed, 10);
      if (exHigh.data?.triviaType === 'trueFalse') {
        expect(exHigh.data.statementsLatex?.length).toBe(4);
        expect(exHigh.data.correctAnswers?.length).toBe(4);
      }
    }
  });

  it('trueFalse always has at least one correct and one incorrect', () => {
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 9);
      if (ex.data?.triviaType === 'trueFalse') {
        const answers = ex.data.correctAnswers!;
        expect(answers.some((a: boolean) => a)).toBe(true);
        expect(answers.some((a: boolean) => !a)).toBe(true);
      }
    }
  });

  it('trueFalse answer format matches correctAnswers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 7);
      if (ex.data?.triviaType === 'trueFalse') {
        const parts = ex.answer.split(',').map((s) => s.trim());
        expect(parts.length).toBe(ex.data.correctAnswers!.length);
        for (let i = 0; i < parts.length; i++) {
          expect(parts[i]).toBe(ex.data.correctAnswers![i] ? 'yes' : 'no');
        }
      }
    }
  });

  it('laws generates all 5 law variants across seeds', () => {
    const keys = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (ex.data?.triviaType === 'laws') {
        const op = ex.data.lawOperationKey ?? '';
        keys.add(`${ex.data.lawNameKey ?? ''}|${op}`);
      }
    }
    expect(keys.size).toBe(5);
  });

  it('trueFalse at complexity 7 excludes sqrt statements', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 7);
      if (ex.data?.triviaType === 'trueFalse') {
        const stmts = ex.data.statementsLatex!;
        for (const s of stmts) {
          expect(s).not.toContain('sqrt');
        }
      }
    }
  });

  it('trueFalse at complexity 10 includes sqrt statements', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 10);
      if (ex.data?.triviaType === 'trueFalse') {
        for (const s of ex.data.statementsLatex!) {
          if (s.includes('sqrt')) found.add(s);
        }
      }
    }
    expect(found.size).toBeGreaterThan(0);
  });
});

describe('validateTermTransformationsTrivia', () => {
  it('accepts correct answer for all types', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      expect(validateTermTransformationsTrivia(ex.answer, ex)).toBe(true);
    }
  });

  it('rejects wrong answer for all types', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      const wrong = ex.answer + ',999';
      expect(validateTermTransformationsTrivia(wrong, ex)).toBe(false);
    }
  });

  describe('laws and powerLaws', () => {
    it('rejects non-numeric input', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 3);
        if (ex.data?.triviaType === 'laws') {
          expect(validateTermTransformationsTrivia('abc', ex)).toBe(false);
          expect(validateTermTransformationsTrivia('', ex)).toBe(false);
          expect(validateTermTransformationsTrivia('-1', ex)).toBe(false);
        }
      }
    });

    it('rejects wrong index', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 5);
        if (ex.data?.triviaType === 'powerLaws') {
          const idx = parseInt(ex.answer, 10);
          const wrong = String((idx + 1) % 4);
          expect(validateTermTransformationsTrivia(wrong, ex)).toBe(false);
        }
      }
    });
  });

  describe('trueFalse', () => {
    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 9);
        if (ex.data?.triviaType === 'trueFalse') {
          expect(validateTermTransformationsTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects all-wrong answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 9);
        if (ex.data?.triviaType === 'trueFalse') {
          const wrong = ex.data.correctAnswers!.map(() => 'no').join(',');
          if (wrong !== ex.answer) {
            expect(validateTermTransformationsTrivia(wrong, ex)).toBe(false);
          }
        }
      }
    });

    it('rejects wrong number of parts', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 9);
        if (ex.data?.triviaType === 'trueFalse') {
          expect(validateTermTransformationsTrivia('yes', ex)).toBe(false);
          expect(validateTermTransformationsTrivia('yes,no,yes,no,yes', ex)).toBe(false);
        }
      }
    });
  });

  it('rejects invalid answers for unknown subType', () => {
    const ex = { prompt: '', answer: '0', data: { triviaType: 'unknown' } };
    expect(validateTermTransformationsTrivia('0', ex)).toBe(false);
  });
});
