import { gcd } from './number';

export type Fraction = [number, number];

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

export function fracToString(num: number, den: number): string {
  const [n, d] = reduceFrac(num, den);
  if (d === 1) return String(n);
  return `${n}/${d}`;
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
