import { mulberry32 } from '../prng';

export function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function areCoprime(a: number, b: number): boolean {
  return gcd(a, b) === 1;
}

export function randomCoprimePair(rng: () => number, min: number, max: number): [number, number] {
  for (let attempt = 0; attempt < 100; attempt++) {
    const a = min + Math.floor(rng() * (max - min + 1));
    const b = min + Math.floor(rng() * (max - min + 1));
    if (areCoprime(a, b) && a !== b) return [a, b];
  }
  return [min, min + 1];
}

export function bumpPastThreshold(
  seed: number,
  complexity: number,
  complexityThreshold: number,
  valueThreshold: number,
  maxFactor: number,
): number {
  if (complexity < complexityThreshold) {
    return 0;
  }
  const rng = mulberry32(seed + 1);
  return Math.floor(rng() * (maxFactor - valueThreshold)) + valueThreshold + 1;
}
