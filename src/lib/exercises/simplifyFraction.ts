import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randomCoprimePair } from '../math/number';
import { promptFraction } from '../math/latex';

export function generateSimplifyFraction(seed: number, complexity: number): Exercise {
  const clamped = Math.min(Math.max(complexity, 0), 10);
  const rng = mulberry32(seed);

  const minFactor = 2 + Math.floor((clamped * 3) / 10);
  const maxFactor = 5 + Math.floor((clamped * 45) / 10);
  const factor = minFactor + Math.floor(rng() * (maxFactor - minFactor + 1));

  const maxProduct = 50 + Math.floor((clamped * 450) / 10);
  const maxBase = Math.max(3, Math.floor(maxProduct / factor));

  const [a, b] = randomCoprimePair(rng, 2, maxBase);

  const numerator = a * factor;
  const denominator = b * factor;

  return {
    prompt: promptFraction(numerator, denominator),
    answer: `${a},${b}`,
    data: { promptKey: 'exercise.simplifyFraction.prompt' },
  };
}
