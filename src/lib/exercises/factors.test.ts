import { describe, it, expect } from 'vitest';
import { generateFactorsExercise, validateFactors, type FactorsData } from './factors';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: { data?: unknown }): FactorsData {
  return ex.data as FactorsData;
}

function getDivisors(n: number): number[] {
  const divisors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) divisors.push(i);
  }
  return divisors;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

const N_RANGE: [number, number][] = [
  [6, 12],
  [8, 18],
  [12, 24],
  [18, 36],
  [24, 48],
  [30, 60],
  [36, 60],
  [48, 60],
  [60, 60],
  [60, 60],
  [60, 60],
];

const COMPLEXITIES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('generateFactorsExercise', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateFactorsExercise, 42, 3);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateFactorsExercise, 12345, 4);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateFactorsExercise, 5);
  });

  it('n is within the complexity range', () => {
    for (const c of COMPLEXITIES) {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFactorsExercise(seed, c);
        const [min, max] = N_RANGE[c];
        expect(d(ex).n).toBeGreaterThanOrEqual(min);
        expect(d(ex).n).toBeLessThanOrEqual(max);
      }
    }
  });

  it('n never exceeds 60', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        expect(d(ex).n).toBeLessThanOrEqual(60);
      }
    }
  });

  it('factors equals sorted list of all divisors of n', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const expected = getDivisors(d(ex).n).join(',');
        expect(d(ex).factors).toBe(expected);
      }
    }
  });

  it('1 and n are always factors', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const factors = d(ex).factors.split(',').map(Number);
        expect(factors[0]).toBe(1);
        expect(factors[factors.length - 1]).toBe(d(ex).n);
      }
    }
  });

  it('every factor appears in candidates', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const factors = d(ex).factors.split(',').map(Number);
        const candidates = d(ex).options.map((o) => parseInt(o.latex));
        for (const f of factors) {
          expect(candidates).toContain(f);
        }
      }
    }
  });

  it('no duplicates in candidates', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const candidates = d(ex).options.map((o) => parseInt(o.latex));
        expect(new Set(candidates).size).toBe(candidates.length);
      }
    }
  });

  it('every distractor is a non-divisor in [1, n]', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const n = d(ex).n;
        const factors = d(ex).factors.split(',').map(Number);
        const candidates = d(ex).options.map((o) => parseInt(o.latex));
        for (const v of candidates) {
          if (!factors.includes(v)) {
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(n);
            expect(n % v).not.toBe(0);
          }
        }
      }
    }
  });

  it('has correct answer format (comma-separated sorted indices)', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const indices = ex.answer.split(',').map(Number);
        expect(indices.length).toBeGreaterThan(0);
        for (const i of indices) {
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThan(d(ex).options.length);
        }
        expect(indices).toEqual([...indices].sort((a, b) => a - b));
      }
    }
  });

  it('correct answer indices point to actual factors', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const c of COMPLEXITIES) {
        const ex = generateFactorsExercise(seed, c);
        const factors = d(ex).factors.split(',').map(Number);
        const candidates = d(ex).options.map((o) => parseInt(o.latex));
        const indices = ex.answer.split(',').map(Number);
        const selected = indices.map((i) => candidates[i]);
        expect(selected.sort((a, b) => a - b).join(',')).toBe(d(ex).factors);
      }
    }
  });

  it('prime n has factors "1,n" and no distractor divides n', () => {
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateFactorsExercise(seed, 5);
      const n = d(ex).n;
      if (!isPrime(n)) continue;
      expect(d(ex).factors).toBe(`1,${n}`);
      const candidates = d(ex).options.map((o) => parseInt(o.latex));
      for (const v of candidates) {
        if (v !== 1 && v !== n) {
          expect(n % v).not.toBe(0);
        }
      }
    }
  });

  it('perfect square n: sqrt(n) appears exactly once in factors', () => {
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateFactorsExercise(seed, 3);
      const n = d(ex).n;
      const root = Math.round(Math.sqrt(n));
      if (root * root !== n) continue;
      const factors = d(ex).factors.split(',').map(Number);
      const sqrtFactors = factors.filter((f) => f === root);
      expect(sqrtFactors.length).toBe(1);
    }
  });

  it('generates prompt with n = {n} format', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactorsExercise(seed, 3);
      expect(ex.prompt).toBe(`n = ${d(ex).n}`);
    }
  });

  it('has promptKey set to instruction key', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactorsExercise(seed, 3);
      expect(d(ex).promptKey).toBe('exercise.factors.instruction');
    }
  });

  it('uses custom pattern', () => {
    const ex = generateFactorsExercise(42, 5);
    expect(ex.pattern).toBe('custom');
  });

  it('clamps complexity: -1 behaves like 0', () => {
    const a = generateFactorsExercise(42, -1);
    const b = generateFactorsExercise(42, 0);
    expect(a).toEqual(b);
  });

  it('clamps complexity: 99 behaves like 10', () => {
    const a = generateFactorsExercise(42, 99);
    const b = generateFactorsExercise(42, 10);
    expect(a).toEqual(b);
  });
});

describe('validateFactors', () => {
  it('exact set match returns true', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactorsExercise(seed, 5);
      expect(validateFactors(ex.answer, ex)).toBe(true);
    }
  });

  it('missing factor returns false', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactorsExercise(seed, 5);
      const indices = ex.answer.split(',').map(Number);
      if (indices.length > 1) {
        const missing = indices.slice(1).join(',');
        expect(validateFactors(missing, ex)).toBe(false);
      }
    }
  });

  it('extra selection returns false', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactorsExercise(seed, 5);
      const indices = ex.answer.split(',').map(Number);
      const allIndices = d(ex).options.map((_, i) => i);
      const extra = allIndices.filter((i) => !indices.includes(i));
      if (extra.length > 0) {
        const withExtra = [...indices, extra[0]].sort((a, b) => a - b).join(',');
        expect(validateFactors(withExtra, ex)).toBe(false);
      }
    }
  });

  it('empty selection returns false', () => {
    const ex = generateFactorsExercise(42, 5);
    expect(validateFactors('', ex)).toBe(false);
  });

  it('different order of same indices returns true', () => {
    const ex = generateFactorsExercise(42, 5);
    const indices = ex.answer.split(',').map(Number);
    if (indices.length > 1) {
      const reversed = [...indices].reverse().join(',');
      expect(validateFactors(reversed, ex)).toBe(true);
    }
  });

  it('out-of-bounds index returns false', () => {
    const ex = generateFactorsExercise(42, 5);
    const data = d(ex);
    const badAnswer = `${data.options.length}`;
    expect(validateFactors(badAnswer, ex)).toBe(false);
  });

  it('handles leading/trailing whitespace in answer', () => {
    const ex = generateFactorsExercise(42, 5);
    expect(validateFactors(`  ${ex.answer}  `, ex)).toBe(true);
  });
});
