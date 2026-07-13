import { describe, it, expect } from 'vitest';
import { generateSigns, validateSigns, type SignsData } from './signs';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('generateSigns', () => {
  it('is deterministic', () => {
    expectDeterministic(generateSigns, 42, 5);
  });

  it('varies with seed', () => {
    expectSeedVariation(generateSigns, 5);
  });

  it('has prompt and answer for various complexities', () => {
    for (let c = 1; c <= 10; c++) {
      expectHasPromptAndAnswer(generateSigns, 42, c);
    }
  });

  it('generates 3 questions for complexity <= 5', () => {
    for (let c = 1; c <= 5; c++) {
      for (let seed = 0; seed < 10; seed++) {
        const ex = generateSigns(seed, c);
        expect((ex.data as SignsData).signs).toHaveLength(3);
      }
    }
  });

  it('generates 4 questions for complexity > 5', () => {
    for (let c = 6; c <= 10; c++) {
      for (let seed = 0; seed < 10; seed++) {
        const ex = generateSigns(seed, c);
        expect((ex.data as SignsData).signs).toHaveLength(4);
      }
    }
  });

  it('each question has a non-empty latex and a valid sign', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let c = 1; c <= 10; c++) {
        const ex = generateSigns(seed, c);
        const signs = (ex.data as SignsData).signs;
        expect(signs).toBeDefined();
        for (const q of signs) {
          expect(q.latex).toBeTruthy();
          expect(['+', '-']).toContain(q.sign);
        }
      }
    }
  });

  it('answer matches signs', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let c = 1; c <= 10; c++) {
        const ex = generateSigns(seed, c);
        const signs = (ex.data as SignsData).signs;
        expect(signs).toBeDefined();
        const expected = signs.map((q) => q.sign).join(',');
        expect(ex.answer).toBe(expected);
      }
    }
  });

  it('prompt matches answer', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let c = 1; c <= 10; c++) {
        const ex = generateSigns(seed, c);
        expect(ex.prompt).toBe(ex.answer);
      }
    }
  });
});

describe('validateSigns', () => {
  it('accepts correct answer', () => {
    const ex = generateSigns(42, 5);
    expect(validateSigns(ex.answer, ex)).toBe(true);
  });

  it('rejects incorrect answer', () => {
    const ex = generateSigns(42, 5);
    const wrong = ex.answer
      .split(',')
      .map((s) => (s === '+' ? '-' : '+'))
      .join(',');
    expect(validateSigns(wrong, ex)).toBe(false);
  });

  it('handles whitespace', () => {
    const ex = generateSigns(42, 5);
    const spaced = ex.answer
      .split(',')
      .map((s) => ` ${s} `)
      .join(',');
    expect(validateSigns(spaced, ex)).toBe(true);
  });

  it('rejects wrong length', () => {
    const ex = generateSigns(42, 5);
    expect(validateSigns('+,+', ex)).toBe(false);
    expect(validateSigns('+,+,-,+', ex)).toBe(false);
  });

  it('rejects invalid characters', () => {
    const ex = generateSigns(42, 5);
    expect(validateSigns('x,y,z', ex)).toBe(false);
  });
});
