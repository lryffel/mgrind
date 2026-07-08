import { describe, it, expect } from 'vitest';
import { generateSubstitution, validateSubstitution } from './substitution';

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

  it('gen1OverX always has a proper fraction substitution (den > 1)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubstitution(seed, 7);
      const variable = ex.data!.variable as string;
      if (variable === 'a' || variable === 'b' || variable === 'c' ||
          variable === 'r' || variable === 's' || variable === 't' ||
          variable === 'u' || variable === 'v' || variable === 'w' ||
          variable === 'x' || variable === 'y' || variable === 'z') {
        if (ex.prompt.startsWith('\\frac{1}{')) {
          const value = ex.data!.value as string;
          if (!value.includes('\\frac')) {
            if (ex.data!.complexity as number >= 5) {
              expect(value).toContain('\\frac');
            }
          }
        }
      }
    }
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

  it('accepts integer-style answers matching the expected', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubstitution(seed, 2);
      if (!ex.answer.includes('/')) {
        expect(validateSubstitution(ex.answer, ex)).toBe(true);
      }
    }
  });
});
