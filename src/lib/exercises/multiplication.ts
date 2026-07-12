import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { bumpPastThreshold, clampComplexity } from '../math/number';

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const maxFactor = 10 + clamped;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const b = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (clamped >= 5 && a <= 10 && b <= 10) {
    a = bumpPastThreshold(seed, clamped, 5, 10, maxFactor);
  }
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b) };
}
