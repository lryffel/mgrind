import { gcd } from './number';

export type Fraction = [number, number];

/** Generate a nice number (prime factors only 2, 5, optionally 3) not exceeding maxVal. */
export function niceNum(rng: () => number, maxVal: number): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const a = Math.floor(rng() * 4);
    const b = Math.floor(rng() * 3);
    const c = rng() < 0.3 ? 1 : 0;
    const n = 2 ** a * 5 ** b * 3 ** c;
    if (n <= maxVal && n >= 2) return n;
  }
  return 2;
}

export function niceMax(clamped: number): number {
  return 7 + Math.floor(clamped * 1.5);
}

export function normalizeFraction(num: number, den: number): Fraction {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return [num, den];
}

export function reduceFrac(num: number, den: number): Fraction {
  [num, den] = normalizeFraction(num, den);
  if (num === 0) return [0, 1];
  const g = gcd(Math.abs(num), den);
  return [num / g, den / g];
}

export function parseFrac(s: string): Fraction | null {
  s = s.trim();
  if (!s) return null;
  if (s === '-') return [-1, 1];
  const parts = s.split('/');
  if (parts.length === 2) {
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    if (isNaN(num) || isNaN(den) || den === 0) return null;
    return [num, den];
  }
  const num = parseInt(s, 10);
  if (isNaN(num)) return null;
  return [num, 1];
}

export function fracEqual(a: string, b: string): boolean {
  const aParsed = parseFrac(a);
  const bParsed = parseFrac(b);
  if (aParsed === null || bParsed === null) return false;
  return aParsed[0] * bParsed[1] === bParsed[0] * aParsed[1];
}
