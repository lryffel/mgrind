import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { bumpPastThreshold } from '../math/number';

export function generateDivision(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const c = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (complexity >= 5 && a <= 10 && c <= 10) {
    a = bumpPastThreshold(seed, complexity, 5, 10, maxFactor);
  }
  const b = a * c;
  const prompt = rng() < 0.5 ? `${a} \\cdot ? = ${b}` : `\\frac{${b}}{${a}} = ?`;
  return { prompt, answer: String(c) };
}
