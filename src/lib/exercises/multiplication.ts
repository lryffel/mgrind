import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { bumpPastThreshold } from '../math/number';

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const b = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (complexity >= 5 && a <= 10 && b <= 10) {
    a = bumpPastThreshold(seed, complexity, 5, 10, maxFactor);
  }
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b) };
}
