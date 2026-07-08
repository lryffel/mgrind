import type { Exercise } from '../types';
import { mulberry32 } from '../prng';

export function generateDivision(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const c = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (complexity >= 5 && a <= 10 && c <= 10) {
    const rng2 = mulberry32(seed + 1);
    a = Math.floor(rng2() * (maxFactor - 10)) + 11;
  }
  const b = a * c;
  const prompt = rng() < 0.5
    ? `${a} \u22C5 ? = ${b}`
    : `${b} / ${a} = ?`;
  return { prompt, answer: String(c) };
}
