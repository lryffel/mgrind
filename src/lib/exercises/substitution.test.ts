import { describe, it, expect } from 'vitest';
import { generateSubstitution, validateSubstitution } from './substitution';
import type { Exercise } from '../types';

function allVariablesPresent(): Set<string> {
  return new Set(['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);
}

const INTEGER_ONLY = new Set(['k', 'm', 'n', 'p', 'q']);

describe('generateSubstitution', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateSubstitution(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect(ex.data).toHaveProperty('variable');
    expect(ex.data).toHaveProperty('value');
    expect(ex.data).toHaveProperty('term');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateSubstitution(12345, 3);
    const b = generateSubstitution(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateSubstitution(1, 5);
    const b = generateSubstitution(2, 5);
    expect(a).not.toEqual(b);
  });

  it('uses only valid variable names', () => {
    const valid = allVariablesPresent();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSubstitution(seed, seed % 10);
      expect(valid.has(ex.data!.variable as string)).toBe(true);
    }
  });

  it('produces parseable answers at all complexities', () => {
    for (let complexity = 0; complexity <= 9; complexity++) {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateSubstitution(seed + complexity * 1000, complexity);
        const answer = ex.answer;
        if (answer.includes('/')) {
          const parts = answer.split('/');
          expect(parts).toHaveLength(2);
          const num = parseInt(parts[0], 10);
          const den = parseInt(parts[1], 10);
          expect(isNaN(num)).toBe(false);
          expect(isNaN(den)).toBe(false);
          expect(den).toBeGreaterThan(0);
          expect(den).toBeLessThanOrEqual(20);
        } else {
          const num = parseInt(answer, 10);
          expect(isNaN(num)).toBe(false);
        }
      }
    }
  });

  it('always produces integer answers for integer-only variables', () => {
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateSubstitution(seed, seed % 10);
      const variable = ex.data!.variable as string;
      if (INTEGER_ONLY.has(variable)) {
        expect(ex.answer).not.toContain('/');
      }
    }
  });

  it('handles edge complexity values without crashing', () => {
    const ex1 = generateSubstitution(42, -1);
    expect(ex1).toHaveProperty('prompt');
    expect(ex1).toHaveProperty('answer');

    const ex2 = generateSubstitution(42, 20);
    expect(ex2).toHaveProperty('prompt');
    expect(ex2).toHaveProperty('answer');
  });

  it('generates across all variable letters', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubstitution(seed, seed % 10);
      seen.add(ex.data!.variable as string);
    }
    expect(seen.size).toBeGreaterThanOrEqual(15);
  });

  it('gen1OverX produces fraction answers with positive denominator', () => {
    let found = 0;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubstitution(seed, 9);
      if (ex.prompt.startsWith('\\frac{1}{')) {
        found++;
        if (ex.answer.includes('/')) {
          const parts = ex.answer.split('/');
          expect(parts).toHaveLength(2);
          const den = parseInt(parts[1], 10);
          expect(den).toBeGreaterThan(1);
          expect(den).toBeLessThanOrEqual(20);
        }
      }
    }
    expect(found).toBeGreaterThan(0);
  });
});

describe('validateSubstitution', () => {
  it('accepts the correct answer', () => {
    const ex = generateSubstitution(42, 3);
    expect(validateSubstitution(ex.answer, ex)).toBe(true);
  });

  it('rejects an incorrect answer', () => {
    const ex = generateSubstitution(42, 3);
    if (ex.answer === '0') {
      expect(validateSubstitution('1', ex)).toBe(false);
    } else {
      expect(validateSubstitution('999', ex)).toBe(false);
    }
  });

  it('accepts equivalent fractions', () => {
    const ex1 = generateSubstitution(42, 7);
    if (ex1.answer.includes('/')) {
      const parts = ex1.answer.split('/');
      const num = parseInt(parts[0], 10);
      const den = parseInt(parts[1], 10);
      if (den > 1) {
        const equiv = `${num * 2}/${den * 2}`;
        expect(validateSubstitution(equiv, ex1)).toBe(true);
      }
    }
  });

  it('handles whitespace', () => {
    const ex = generateSubstitution(42, 3);
    expect(validateSubstitution(`  ${ex.answer}  `, ex)).toBe(true);
  });

  it('rejects non-numeric input', () => {
    const ex = generateSubstitution(42, 3);
    expect(validateSubstitution('abc', ex)).toBe(false);
    expect(validateSubstitution('', ex)).toBe(false);
    expect(validateSubstitution('1/0', ex)).toBe(false);
  });

  it('accepts "0/1" when answer is 0/1', () => {
    const ex: Exercise = {
      prompt: 'x = 0',
      answer: '0/1',
      data: { term: 'x', value: '0', variable: 'x', complexity: 0 },
    };
    expect(validateSubstitution('0/1', ex)).toBe(true);
  });

  it('accepts integer-style answers matching the expected', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubstitution(seed, 2);
      if (!ex.answer.includes('/')) {
        expect(validateSubstitution(ex.answer, ex)).toBe(true);
      }
    }
  });
});

describe('two-variable substitution', () => {
  it('generates two-variable exercises at complexity 4+', () => {
    let found = 0;
    for (let complexity = 4; complexity <= 10; complexity++) {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateSubstitution(seed + complexity * 1000, complexity);
        if (ex.data?.varB && ex.data?.valueB) {
          found++;
          expect(ex.data.variable).toBeDefined();
          expect(ex.data.value).toBeDefined();
        }
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it('two-variable answers are valid', () => {
    for (let complexity = 4; complexity <= 10; complexity++) {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateSubstitution(seed + complexity * 1000, complexity);
        if (!ex.data?.varB) continue;
        const answer = ex.answer;
        if (answer.includes('/')) {
          const parts = answer.split('/');
          expect(parts).toHaveLength(2);
          const num = parseInt(parts[0], 10);
          const den = parseInt(parts[1], 10);
          expect(isNaN(num)).toBe(false);
          expect(isNaN(den)).toBe(false);
          expect(den).toBeGreaterThan(0);
          expect(den).toBeLessThanOrEqual(20);
        } else {
          const num = parseInt(answer, 10);
          expect(isNaN(num)).toBe(false);
        }
      }
    }
  });

  it('two-variable problems use distinct variables', () => {
    for (let complexity = 4; complexity <= 10; complexity++) {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateSubstitution(seed + complexity * 1000, complexity);
        if (ex.data?.varB) {
          expect(ex.data.variable).not.toEqual(ex.data.varB);
        }
      }
    }
  });

  it('varB/valueB are undefined for complexity 0-3', () => {
    for (let complexity = 0; complexity <= 3; complexity++) {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateSubstitution(seed + complexity * 1000, complexity);
        expect(ex.data?.varB).toBeUndefined();
        expect(ex.data?.valueB).toBeUndefined();
      }
    }
  });

  it('deterministic for same seed/complexity in mixed pools', () => {
    for (let complexity = 4; complexity <= 10; complexity++) {
      const a = generateSubstitution(42, complexity);
      const b = generateSubstitution(42, complexity);
      expect(a).toEqual(b);
    }
  });

  it('INTEGER_ONLY variables never produce fraction answers in two-var mode', () => {
    const INTEGER_ONLY = new Set(['k', 'm', 'n', 'p', 'q']);
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubstitution(seed, (seed % 7) + 4);
      if (ex.data?.varB) {
        const varA = ex.data.variable as string;
        const varB = ex.data.varB as string;
        if (INTEGER_ONLY.has(varA) || INTEGER_ONLY.has(varB)) {
          expect(ex.answer).not.toContain('/');
        }
      }
    }
  });

  it('validateSubstitution works for two-variable exercises', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubstitution(seed, 7);
      if (!ex.data?.varB) continue;
      expect(validateSubstitution(ex.answer, ex)).toBe(true);
      if (ex.answer === '0') {
        expect(validateSubstitution('1', ex)).toBe(false);
      } else {
        expect(validateSubstitution('999', ex)).toBe(false);
      }
    }
  });
});
