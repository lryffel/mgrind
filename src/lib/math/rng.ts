import { reduceFrac } from './fraction';

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickExclude<T>(rng: () => number, arr: T[], exclude: T[]): T {
  const filtered = arr.filter((x) => !exclude.includes(x));
  return filtered[Math.floor(rng() * filtered.length)];
}

export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickDistinct<T>(rng: () => number, arr: T[], count: number): T[] {
  const shuffled = shuffle(rng, arr);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function randCoeff(rng: () => number, allowFrac: boolean): [number, number] {
  if (allowFrac && rng() > 0.35) {
    const den = randInt(rng, 2, 5);
    const num = randInt(rng, 1, 8);
    return reduceFrac(num, den);
  }
  return [randInt(rng, 1, 5), 1];
}

export function sampleExponent(rng: () => number, maxExp: number, bias: number = 2): number {
  const weights = Array.from({ length: maxExp + 1 }, (_, k) => 1 / (k + 1) ** bias);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let k = 0; k <= maxExp; k++) {
    if (r < weights[k]) return k;
    r -= weights[k];
  }
  return maxExp;
}
