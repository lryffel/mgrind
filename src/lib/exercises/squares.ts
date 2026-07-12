import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';

export function generateSquares(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const minBase = 2 + Math.floor((clamped * 8) / 9);
  const maxBase = 10 + Math.floor((clamped * 40) / 9);
  const a = Math.floor(rng() * (maxBase - minBase + 1)) + minBase;
  const variant = Math.floor(rng() * 3);
  const sq = a * a;
  switch (variant) {
    case 0:
      return { prompt: `${a}^{2} = ?`, answer: String(sq) };
    case 1:
      return { prompt: `(-${a})^{2} = ?`, answer: String(sq) };
    case 2:
      return { prompt: `-${a}^{2} = ?`, answer: String(-sq) };
    default:
      return { prompt: `${a}^{2} = ?`, answer: String(sq) };
  }
}
