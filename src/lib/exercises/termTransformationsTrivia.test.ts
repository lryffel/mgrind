import { describe, it, expect } from 'vitest';
import {
  generateTermTransformationsTrivia,
  validateTermTransformationsTrivia,
  type TermTransformationsTriviaData,
} from './termTransformationsTrivia';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: { data?: unknown }): TermTransformationsTriviaData {
  return ex.data as TermTransformationsTriviaData;
}

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
      expect(ALL_TYPES).toContain(d(ex).triviaType);
    }
  });

  it('at complexity 0-3, only generates laws', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 2);
      expect(LOW_TYPES).toContain(d(ex).triviaType);
    }
  });

  it('at complexity 4-6, includes powerLaws', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('powerLaws')).toBe(true);
  });

  it('at complexity 7-10, includes trueFalse', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 8);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('trueFalse')).toBe(true);
  });

  it('at complexity 6, generates all mid types', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 6);
      found.add(d(ex).triviaType!);
    }
    for (const t of MID_TYPES) {
      expect(found.has(t)).toBe(true);
    }
  });

  it('generates all three types across seeds at complexity 8', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 8);
      found.add(d(ex).triviaType!);
    }
    for (const t of ALL_TYPES) {
      expect(found.has(t)).toBe(true);
    }
  });

  it('laws always has exactly 4 options and one correct index', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 2);
      if (d(ex).triviaType === 'laws') {
        expect(d(ex).triviaOptionsLatex?.length).toBe(4);
        expect(d(ex).correctIndices?.length).toBe(1);
        const idx = d(ex).correctIndices![0];
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
        expect(ex.answer).toBe(String(idx));
      }
    }
  });

  it('powerLaws always has exactly 4 options and one correct index', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      if (d(ex).triviaType === 'powerLaws') {
        expect(d(ex).triviaOptionsLatex?.length).toBe(4);
        expect(d(ex).correctIndices?.length).toBe(1);
        const idx = d(ex).correctIndices![0];
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
        expect(ex.answer).toBe(String(idx));
      }
    }
  });

  it('laws option with correct index matches correctIndices', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (d(ex).triviaType === 'laws') {
        const idx = d(ex).correctIndices![0];
        expect(d(ex).triviaOptionsLatex![idx]).toBeDefined();
      }
    }
  });

  it('powerLaws option with correct index matches correctIndices', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 6);
      if (d(ex).triviaType === 'powerLaws') {
        const idx = d(ex).correctIndices![0];
        expect(d(ex).triviaOptionsLatex![idx]).toBeDefined();
      }
    }
  });

  it('powerLaws at complexity 4 only generates first law', () => {
    const ordinals = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 4);
      if (d(ex).triviaType === 'powerLaws') {
        ordinals.add(d(ex).ordinalKey ?? '');
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
      if (d(ex).triviaType === 'powerLaws') {
        ordinals.add(d(ex).ordinalKey ?? '');
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
      if (d(ex).triviaType === 'powerLaws') {
        ordinals.add(d(ex).ordinalKey ?? '');
      }
    }
    expect(ordinals.has('exercise.termTransformationsTrivia.first')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.second')).toBe(true);
    expect(ordinals.has('exercise.termTransformationsTrivia.third')).toBe(true);
  });

  it('trueFalse generates 3 statements at complexity 7-8, 4 at 9-10', () => {
    for (let seed = 0; seed < 50; seed++) {
      const exLow = generateTermTransformationsTrivia(seed, 7);
      if (d(exLow).triviaType === 'trueFalse') {
        expect(d(exLow).statementsLatex?.length).toBe(3);
        expect(d(exLow).correctAnswers?.length).toBe(3);
      }
      const exHigh = generateTermTransformationsTrivia(seed, 10);
      if (d(exHigh).triviaType === 'trueFalse') {
        expect(d(exHigh).statementsLatex?.length).toBe(4);
        expect(d(exHigh).correctAnswers?.length).toBe(4);
      }
    }
  });

  it('trueFalse always has at least one correct and one incorrect', () => {
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 9);
      if (d(ex).triviaType === 'trueFalse') {
        const answers = d(ex).correctAnswers!;
        expect(answers.some((a: boolean) => a)).toBe(true);
        expect(answers.some((a: boolean) => !a)).toBe(true);
      }
    }
  });

  it('trueFalse answer format matches correctAnswers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 7);
      if (d(ex).triviaType === 'trueFalse') {
        const parts = ex.answer.split(',').map((s) => s.trim());
        expect(parts.length).toBe(d(ex).correctAnswers!.length);
        for (let i = 0; i < parts.length; i++) {
          expect(parts[i]).toBe(d(ex).correctAnswers![i] ? 'yes' : 'no');
        }
      }
    }
  });

  it('laws generates all 5 law variants across seeds', () => {
    const keys = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (d(ex).triviaType === 'laws') {
        const op = d(ex).lawOperationKey ?? '';
        keys.add(`${d(ex).lawNameKey ?? ''}|${op}`);
      }
    }
    expect(keys.size).toBe(5);
  });

  it('trueFalse at complexity 7 excludes sqrt statements', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 7);
      if (d(ex).triviaType === 'trueFalse') {
        const stmts = d(ex).statementsLatex!;
        for (const s of stmts) {
          expect(s).not.toContain('sqrt');
        }
      }
    }
  });

  it('laws sets pattern to single-choice', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (d(ex).triviaType === 'laws') {
        expect(ex.pattern).toBe('single-choice');
      }
    }
  });

  it('powerLaws sets pattern to single-choice', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 5);
      if (d(ex).triviaType === 'powerLaws') {
        expect(ex.pattern).toBe('single-choice');
      }
    }
  });

  it('trueFalse sets pattern to batch-choice', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 9);
      if (d(ex).triviaType === 'trueFalse') {
        expect(ex.pattern).toBe('batch-choice');
      }
    }
  });

  it('laws sets data.options matching triviaOptionsLatex', () => {
    for (let seed = 0; seed < 20; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 1);
      if (d(ex).triviaType === 'laws') {
        const data = ex.data as any;
        expect(data.options).toHaveLength(data.triviaOptionsLatex.length);
        expect(data.options.map((o: any) => o.latex)).toEqual(data.triviaOptionsLatex);
      }
    }
  });

  it('trueFalse sets data.rows from statementsLatex', () => {
    for (let seed = 0; seed < 20; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 9);
      if (d(ex).triviaType === 'trueFalse') {
        const data = ex.data as any;
        expect(data.rows).toHaveLength(data.statementsLatex.length);
        expect(data.rows.map((r: any) => r.latex)).toEqual(data.statementsLatex);
        expect(data.buttons).toEqual(['yes', 'no']);
      }
    }
  });

  it('trueFalse at complexity 10 includes sqrt statements', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateTermTransformationsTrivia(seed, 10);
      if (d(ex).triviaType === 'trueFalse') {
        for (const s of d(ex).statementsLatex!) {
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
        if (d(ex).triviaType === 'laws') {
          expect(validateTermTransformationsTrivia('abc', ex)).toBe(false);
          expect(validateTermTransformationsTrivia('', ex)).toBe(false);
          expect(validateTermTransformationsTrivia('-1', ex)).toBe(false);
        }
      }
    });

    it('rejects wrong index', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 5);
        if (d(ex).triviaType === 'powerLaws') {
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
        if (d(ex).triviaType === 'trueFalse') {
          expect(validateTermTransformationsTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects all-wrong answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 9);
        if (d(ex).triviaType === 'trueFalse') {
          const wrong = d(ex)
            .correctAnswers!.map(() => 'no')
            .join(',');
          if (wrong !== ex.answer) {
            expect(validateTermTransformationsTrivia(wrong, ex)).toBe(false);
          }
        }
      }
    });

    it('rejects wrong number of parts', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateTermTransformationsTrivia(seed, 9);
        if (d(ex).triviaType === 'trueFalse') {
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
