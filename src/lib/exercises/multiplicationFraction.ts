import type { Exercise } from '../types';
import { mulberry32 } from '../prng';

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function generateMultiplicationFraction(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const maxVal = Math.max(10 + complexity, 10);

  let a: number, b: number, c: number, d: number;

  const maxF = Math.min(5, Math.max(1, Math.floor(maxVal / 2) - 1));

  if (rng() < 0.5) {
    const f = 2 + Math.floor(rng() * maxF);
    let a2: number, d2: number;
    const limit = 1000;
    let iter = 0;
    do {
      a2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      d2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      iter++;
    } while ((gcd(a2, d2) > 1 || a2 === d2) && iter < limit);
    if (iter >= limit) {
      a2 = 1; d2 = 2;
    }

    a = a2 * f;
    d = d2 * f;

    iter = 0;
    do {
      b = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(a, b) !== 1 && iter < limit);
    if (iter >= limit) b = a + 1;

    iter = 0;
    do {
      c = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(c, d) !== 1 && iter < limit);
    if (iter >= limit) c = d + 1;
  } else {
    const f = 2 + Math.floor(rng() * maxF);
    let c2: number, b2: number;
    const limit = 1000;
    let iter = 0;
    do {
      c2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      b2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      iter++;
    } while ((gcd(c2, b2) > 1 || c2 === b2) && iter < limit);
    if (iter >= limit) {
      c2 = 1; b2 = 2;
    }

    c = c2 * f;
    b = b2 * f;

    iter = 0;
    do {
      a = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(a, b) !== 1 && iter < limit);
    if (iter >= limit) a = b + 1;

    iter = 0;
    do {
      d = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(c, d) !== 1 && iter < limit);
    if (iter >= limit) d = c + 1;
  }

  const prodNum = a * c;
  const prodDen = b * d;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `${a}/${b}*${c}/${d}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { op: '*', promptKey: 'exercise.multiplicationFraction.prompt' },
  };
}
