import type { Exercise } from '../types';
import { mulberry32 } from '../prng';

const PRIMES = [2, 3, 5, 7, 11, 13, 17];
const PRIME_COUNT: Record<number, number> = {
  0: 3,
  1: 3,
  2: 4,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
  7: 6,
  8: 6,
  9: 6,
  10: 7,
};
const MAX_VALUES: Record<number, number> = {
  0: 100,
  1: 200,
  2: 300,
  3: 400,
  4: 500,
  5: 600,
  6: 700,
  7: 800,
  8: 900,
  9: 1000,
  10: 1000,
};

function factorise(n: number): Map<number, number> {
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

export function generatePrimeFactorisation(seed: number, complexity: number): Exercise {
  const clamped = Math.min(complexity, 10);
  const count = PRIME_COUNT[clamped];
  const primes = PRIMES.slice(0, count);
  const allowed = new Set(primes);
  const maxValue = MAX_VALUES[clamped];
  const minValue = Math.ceil(maxValue / 2);

  for (let attempt = 0; attempt < 1000; attempt++) {
    const rng = mulberry32(seed + attempt);
    const n = minValue + Math.floor(rng() * (maxValue - minValue + 1));
    const factors = factorise(n);

    if ([...factors.keys()].every((p) => allowed.has(p))) {
      const exponents = primes.map((p) => factors.get(p) ?? 0);
      return {
        prompt: String(n),
        answer: exponents.join(','),
        data: { primes },
      };
    }
  }

  const exponents = primes.map(() => 0);
  return { prompt: '0', answer: exponents.join(','), data: { primes } };
}
