import { describe, it, expect } from 'vitest';
import { generatePrimeFactorisation, type PrimeFactorisationData } from './primeFactorisation';

function getPrimes(ex: { data?: unknown }): number[] {
  const d = ex.data as PrimeFactorisationData | undefined;
  return d?.primes ?? [];
}

function computeProduct(ex: { prompt: string; answer: string; data?: unknown }): number {
  const exponents = ex.answer.split(',').map(Number);
  const primes = getPrimes(ex);
  return primes.reduce((prod, p, i) => prod * Math.pow(p, exponents[i]), 1);
}

describe('generatePrimeFactorisation', () => {
  it('returns a valid exercise with prompt, answer, and data.primes', () => {
    const ex = generatePrimeFactorisation(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect((ex.data as PrimeFactorisationData).primes).toHaveLength(3);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generatePrimeFactorisation(12345, 3);
    const b = generatePrimeFactorisation(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generatePrimeFactorisation(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('generates a prompt that is a valid number', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 4);
      const n = Number(ex.prompt);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    }
  });

  it('the product of primes^exponents equals the prompt number', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 4);
      const product = computeProduct(ex);
      expect(product).toBe(Number(ex.prompt));
    }
  });

  it('result is never 1', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generatePrimeFactorisation(seed, 0);
      expect(Number(ex.prompt)).toBeGreaterThan(1);
    }
  });

  it('complexity 0 uses primes 2, 3, 5 and result in [50, 100]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 0);
      const labels = getPrimes(ex);
      const n = Number(ex.prompt);
      expect(labels).toEqual([2, 3, 5]);
      expect(n).toBeGreaterThanOrEqual(50);
      expect(n).toBeLessThanOrEqual(100);
    }
  });

  it('complexity 1 result in [100, 200]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 1);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(100);
      expect(n).toBeLessThanOrEqual(200);
    }
  });

  it('complexity 2 uses primes 2,3,5,7 and result in [150, 300]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 2);
      const labels = getPrimes(ex);
      const n = Number(ex.prompt);
      expect(labels).toEqual([2, 3, 5, 7]);
      expect(n).toBeGreaterThanOrEqual(150);
      expect(n).toBeLessThanOrEqual(300);
    }
  });

  it('complexity 3 result in [200, 400]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 3);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(200);
      expect(n).toBeLessThanOrEqual(400);
    }
  });

  it('complexity 4 uses primes 2,3,5,7,11 and result in [250, 500]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 4);
      const labels = getPrimes(ex);
      const n = Number(ex.prompt);
      expect(labels).toEqual([2, 3, 5, 7, 11]);
      expect(n).toBeGreaterThanOrEqual(250);
      expect(n).toBeLessThanOrEqual(500);
    }
  });

  it('complexity 5 uses primes 2,3,5,7,11,13 and result in [300, 600]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 5);
      const labels = getPrimes(ex);
      const n = Number(ex.prompt);
      expect(labels).toEqual([2, 3, 5, 7, 11, 13]);
      expect(n).toBeGreaterThanOrEqual(300);
      expect(n).toBeLessThanOrEqual(600);
    }
  });

  it('complexity 6 result in [350, 700]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 6);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(350);
      expect(n).toBeLessThanOrEqual(700);
    }
  });

  it('complexity 7 result in [400, 800]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 7);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(400);
      expect(n).toBeLessThanOrEqual(800);
    }
  });

  it('complexity 8 result in [450, 900]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 8);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(450);
      expect(n).toBeLessThanOrEqual(900);
    }
  });

  it('complexity 9 result in [500, 1000]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 9);
      const n = Number(ex.prompt);
      expect(n).toBeGreaterThanOrEqual(500);
      expect(n).toBeLessThanOrEqual(1000);
    }
  });

  it('complexity 10 uses primes 2,3,5,7,11,13,17 and result in [500, 1000]', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generatePrimeFactorisation(seed, 10);
      const labels = getPrimes(ex);
      const n = Number(ex.prompt);
      expect(labels).toEqual([2, 3, 5, 7, 11, 13, 17]);
      expect(n).toBeGreaterThanOrEqual(500);
      expect(n).toBeLessThanOrEqual(1000);
    }
  });

  it('answer format is comma-separated exponents matching prime count', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generatePrimeFactorisation(seed, 6);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(getPrimes(ex).length);
      parts.forEach((p) => {
        const n = Number(p);
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(0);
      });
    }
  });

  it('at complexity 0, can produce composite numbers with multiple prime factors', () => {
    let foundMultiple = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generatePrimeFactorisation(seed, 0);
      const parts = ex.answer.split(',').map(Number);
      const nonZero = parts.filter((e) => e > 0).length;
      if (nonZero >= 2) {
        foundMultiple = true;
        break;
      }
    }
    expect(foundMultiple).toBe(true);
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generatePrimeFactorisation(42, 20);
    expect((ex.data as PrimeFactorisationData).primes).toHaveLength(7);
  });
});
