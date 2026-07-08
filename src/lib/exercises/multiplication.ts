import type { Exercise } from '../types';
import { mulberry32 } from '../prng';

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const b = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (complexity >= 5 && a <= 10 && b <= 10) {
    const rng2 = mulberry32(seed + 1);
    a = Math.floor(rng2() * (maxFactor - 10)) + 11;
  }
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b) };
}
