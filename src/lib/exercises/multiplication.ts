import type { Exercise } from '../types';

function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  let a = Math.floor(rng() * (maxFactor - 1)) + 2;
  let b = Math.floor(rng() * (maxFactor - 1)) + 2;
  if (maxFactor > 10 && a <= 10 && b <= 10) {
    const rng2 = mulberry32(seed + 1);
    a = Math.floor(rng2() * (maxFactor - 10)) + 11;
  }
  return { prompt: `${a} \u00D7 ${b} = ?`, answer: String(a * b) };
}
