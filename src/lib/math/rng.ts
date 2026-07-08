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
