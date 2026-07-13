import { describe, it, expect } from 'vitest';
import { generateGcdLcm, validateGcdLcm } from './gcdLcm';
import { expectDeterministic, expectSeedVariation } from '../test-utils';
import { gcd } from '../math/number';

function factorize(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    while (remaining % p === 0) {
      factors.set(p, (factors.get(p) ?? 0) + 1);
      remaining /= p;
    }
  }
  if (remaining > 1) {
    factors.set(remaining, (factors.get(remaining) ?? 0) + 1);
  }
  return factors;
}

describe('generateGcdLcm', () => {
  it('returns a valid exercise with prompt, answer, and data', () => {
    const ex = generateGcdLcm(42, 0);
    expect(ex).toHaveProperty('answer');
    expect(ex.data).toBeDefined();
    expect(ex.data?.promptKey).toBe('exercise.gcdLcm.prompt');
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateGcdLcm, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateGcdLcm, 5);
  });

  it('generates both modes (factorization and numbers)', () => {
    let foundFactorization = false;
    let foundNumbers = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateGcdLcm(seed, 5);
      if (ex.data?.subType === 'factorization') foundFactorization = true;
      if (ex.data?.subType === 'numbers') foundNumbers = true;
      if (foundFactorization && foundNumbers) break;
    }
    expect(foundFactorization).toBe(true);
    expect(foundNumbers).toBe(true);
  });

  describe('Mode A (factorization)', () => {
    it('exponent arrays match actual gcd/lcm of the numbers', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateGcdLcm(seed, 4);
        if (ex.data?.subType !== 'factorization') continue;
        const data = ex.data;
        const primes = data.primes ?? [];
        const a = data.a ?? 0;
        const b = data.b ?? 0;

        const actualGcd = gcd(a, b);
        const actualLcm = (a * b) / actualGcd;

        const actualGcdFactors = factorize(actualGcd);
        const actualLcmFactors = factorize(actualLcm);

        const computedGcdExp = primes.map((p) => actualGcdFactors.get(p) ?? 0);
        const computedLcmExp = primes.map((p) => actualLcmFactors.get(p) ?? 0);

        const storedGcdExp = (data.gcdExponents ?? '').split(',').map(Number);
        const storedLcmExp = (data.lcmExponents ?? '').split(',').map(Number);

        expect(computedGcdExp).toEqual(storedGcdExp);
        expect(computedLcmExp).toEqual(storedLcmExp);
      }
    });

    it('aLatex and bLatex are valid non-empty strings', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateGcdLcm(seed, 4);
        if (ex.data?.subType !== 'factorization') continue;
        expect(ex.data.aLatex).toBeTruthy();
        expect(ex.data.bLatex).toBeTruthy();
      }
    });
  });

  describe('Mode B (numbers)', () => {
    it('gcd(a, b) matches stored gcd and lcm matches', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateGcdLcm(seed, 4);
        if (ex.data?.subType !== 'numbers') continue;
        const data = ex.data;
        const a = data.a ?? 0;
        const b = data.b ?? 0;
        const expectedGcd = gcd(a, b);
        const expectedLcm = (a * b) / expectedGcd;

        expect(expectedGcd).toBe(Number(data.gcd));
        expect(expectedLcm).toBe(Number(data.lcm));
      }
    });

    it('a and b are within range for the complexity level', () => {
      const maxRanges: Record<number, number> = {
        0: 30,
        1: 30,
        2: 60,
        3: 60,
        4: 150,
        5: 150,
        6: 400,
        7: 400,
        8: 1500,
        9: 1500,
        10: 5000,
      };

      for (let complexity = 0; complexity <= 10; complexity++) {
        for (let seed = 0; seed < 30; seed++) {
          const ex = generateGcdLcm(seed, complexity);
          if (ex.data?.subType !== 'numbers') continue;
          expect(ex.data.a).toBeLessThanOrEqual(maxRanges[complexity]);
          expect(ex.data.b).toBeLessThanOrEqual(maxRanges[complexity]);
        }
      }
    });
  });

  describe('constraints', () => {
    it('gcd is never 1', () => {
      for (let seed = 0; seed < 500; seed++) {
        const ex = generateGcdLcm(seed, 3);
        if (ex.data?.subType === 'numbers') {
          expect(Number(ex.data.gcd)).toBeGreaterThan(1);
          expect(Number(ex.data.gcd)).not.toBeNaN();
        } else {
          const primes = ex.data?.primes ?? [];
          const gcdExp = (ex.data?.gcdExponents ?? '').split(',').map(Number);
          if (primes.length > 0) {
            const computedGcd = primes.reduce((prod, p, i) => prod * Math.pow(p, gcdExp[i]), 1);
            expect(computedGcd).toBeGreaterThan(1);
          }
        }
      }
    });

    it('a === b is never produced', () => {
      for (let seed = 0; seed < 500; seed++) {
        const ex = generateGcdLcm(seed, 5);
        expect(ex.data?.a).not.toBe(ex.data?.b);
      }
    });

    it('no prime inputs in Mode B', () => {
      for (let seed = 0; seed < 500; seed++) {
        const ex = generateGcdLcm(seed, 5);
        if (ex.data?.subType !== 'numbers') continue;
        const a = ex.data.a ?? 0;
        const b = ex.data.b ?? 0;
        expect(a).not.toBe(1);
        expect(b).not.toBe(1);
        expect(isPrimeCheck(a)).toBe(false);
        expect(isPrimeCheck(b)).toBe(false);
      }
    });
  });

  describe('validation', () => {
    it('correct answer passes for Mode A', () => {
      const ex = generateGcdLcm(42, 4);
      if (ex.data?.subType !== 'factorization') return;
      const correctAnswer = `${ex.data.gcdExponents};${ex.data.lcmExponents}`;
      expect(validateGcdLcm(correctAnswer, ex)).toBe(true);
    });

    it('wrong exponent fails for Mode A', () => {
      const ex = generateGcdLcm(42, 4);
      if (ex.data?.subType !== 'factorization') return;
      const wrongAnswer = `0,0,0;${ex.data.lcmExponents}`;
      expect(validateGcdLcm(wrongAnswer, ex)).toBe(false);
    });

    it('correct answer passes for Mode B', () => {
      const ex = generateGcdLcm(42, 4);
      if (ex.data?.subType !== 'numbers') return;
      const correctAnswer = `${ex.data.gcd},${ex.data.lcm}`;
      expect(validateGcdLcm(correctAnswer, ex)).toBe(true);
    });

    it('wrong gcd/lcm fails for Mode B', () => {
      const ex = generateGcdLcm(42, 4);
      if (ex.data?.subType !== 'numbers') return;
      expect(validateGcdLcm('1,999', ex)).toBe(false);
    });
  });

  describe('complexity clamping', () => {
    it('clamps complexity beyond 10', () => {
      const ex = generateGcdLcm(42, 20);
      expect(ex.data).toBeDefined();
    });

    it('clamps negative complexity', () => {
      const ex = generateGcdLcm(42, -1);
      expect(ex.data).toBeDefined();
    });
  });
});

function isPrimeCheck(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
