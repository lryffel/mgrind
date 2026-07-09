import { describe, it, expect } from 'vitest';
import {
  generateSimplifySymbolicFraction,
  validateSimplifySymbolicFraction,
} from './simplifySymbolicFraction';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('generateSimplifySymbolicFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateSimplifySymbolicFraction, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateSimplifySymbolicFraction, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateSimplifySymbolicFraction, 5);
  });

  it('prompt is a LaTeX fraction', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 4);
      expect(ex.prompt).toMatch(/^\\frac\{.+\}\{.+\}$/);
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateSimplifySymbolicFraction(42, 20);
    expect(ex.answer).toBeTruthy();
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateSimplifySymbolicFraction(42, -5);
    expect(ex.answer).toBeTruthy();
  });
});

describe('validateSimplifySymbolicFraction', () => {
  it('validates a correct answer (poly mode)', () => {
    const ex = generateSimplifySymbolicFraction(42, 4);
    expect(validateSimplifySymbolicFraction(ex.answer, ex)).toBe(true);
  });

  it('validates a correct answer (fraction mode)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 7);
      expect(validateSimplifySymbolicFraction(ex.answer, ex)).toBe(true);
    }
  });

  it('rejects an incorrect answer', () => {
    const ex = generateSimplifySymbolicFraction(42, 3);
    if (ex.data && (ex.data as { showFraction: boolean }).showFraction) {
      expect(validateSimplifySymbolicFraction('99;1', ex)).toBe(false);
    } else {
      expect(validateSimplifySymbolicFraction('99', ex)).toBe(false);
    }
  });

  it('rejects malformed answers', () => {
    const ex = generateSimplifySymbolicFraction(42, 3);
    expect(validateSimplifySymbolicFraction('', ex)).toBe(false);
  });

  it('rejects answer with wrong number of coefficients (poly mode)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 5);
      const data = ex.data as { showFraction: boolean };
      if (!data.showFraction && ex.answer.includes(',')) {
        expect(validateSimplifySymbolicFraction('1', ex)).toBe(false);
        break;
      }
    }
  });
});

describe('subtype: constant factoring out', () => {
  it('returns a constant answer', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 0);
      const data = ex.data as { showFraction: boolean; numFields: { variablePart: string }[] };
      if (!data.showFraction && data.numFields.length === 1 && data.numFields[0].variablePart === '') {
        const answer = parseInt(ex.answer, 10);
        expect(Number.isInteger(answer)).toBe(true);
      }
    }
  });
});

describe('subtype: difference of squares', () => {
  it('returns a two-term polynomial answer', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 5);
      const data = ex.data as { showFraction: boolean; numFields: { variablePart: string }[] };
      if (!data.showFraction && data.numFields.length === 2 && data.numFields[0].variablePart === 'x') {
        const parts = ex.answer.split(',').map(Number);
        expect(parts).toHaveLength(2);
        expect(parts[0]).toBe(1);
      }
    }
  });
});

describe('subtype: ax over bx', () => {
  it('generates prompts with same variable in num and den', () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 2);
      const match = ex.prompt.match(/^\\frac\{(\d+)([a-z])\}\{(\d+)([a-z])\}$/);
      if (match) {
        found = true;
        expect(match[2]).toBe(match[4]);
        break;
      }
    }
    expect(found).toBe(true);
  });
});

describe('validate against generation', () => {
  it('validates its own output for many seeds and complexities', () => {
    for (let seed = 0; seed < 30; seed++) {
      for (let cpl = 0; cpl <= 10; cpl++) {
        const ex = generateSimplifySymbolicFraction(seed, cpl);
        expect(validateSimplifySymbolicFraction(ex.answer, ex)).toBe(true);
      }
    }
  });
});
