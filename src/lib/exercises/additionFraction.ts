import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { gcd, randomCoprimePair } from '../math/number';

export function generateAdditionFraction(seed: number, complexity: number): Exercise {
  const clamped = Math.min(Math.max(complexity, 0), 10);
  const rng = mulberry32(seed);

  const minFactor = 2 + Math.floor((clamped * 3) / 10);
  const maxFactor = 5 + Math.floor((clamped * 45) / 10);
  const factor = minFactor + Math.floor(rng() * (maxFactor - minFactor + 1));

  const maxProduct = 50 + Math.floor((clamped * 450) / 10);
  const maxBase = Math.max(3, Math.floor(maxProduct / factor));

  const [a, b] = randomCoprimePair(rng, 2, maxBase);

  const totalNum = a * factor;
  const commonDen = b * factor;

  let n1 = 0,
    n2 = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    n1 = 1 + Math.floor(rng() * (totalNum - 2));
    n2 = totalNum - n1;
    const g1 = gcd(n1, commonDen);
    const g2 = gcd(n2, commonDen);
    if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
  }

  const g1 = gcd(n1, commonDen);
  const f1Num = n1 / g1;
  const f1Den = commonDen / g1;

  const g2 = gcd(n2, commonDen);
  const f2Num = n2 / g2;
  const f2Den = commonDen / g2;

  return {
    prompt: `\\frac{${f1Num}}{${f1Den}} + \\frac{${f2Num}}{${f2Den}}`,
    answer: `${a},${b}`,
    data: { op: '+' },
  };
}
