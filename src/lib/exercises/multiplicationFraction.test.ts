import { describe, it, expect } from 'vitest';
import { generateMultiplicationFraction } from './multiplicationFraction';

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

describe('generateMultiplicationFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateMultiplicationFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateMultiplicationFraction(12345, 3);
    const b = generateMultiplicationFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('prompt has two fractions joined by *', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      expect(ex.prompt).toMatch(/^\d+\/\d+\*\d+\/\d+$/);
    }
  });

  it('answer is two comma-separated positive integers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(2);
      parts.forEach((p) => {
        const n = Number(p);
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThan(0);
      });
    }
  });

  it('the answer numerator and denominator are coprime', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      const [num, den] = ex.answer.split(',').map(Number);
      expect(gcd(num, den)).toBe(1);
    }
  });

  it('the two fractions in the prompt are reduced', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      const [n1, d1, n2, d2] = ex.prompt.split(/[*/]/).map(Number);
      expect(gcd(n1, d1)).toBe(1);
      expect(gcd(n2, d2)).toBe(1);
    }
  });

  it('multiplying the two fractions equals the answer', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 6);
      const [n1, d1, n2, d2] = ex.prompt.split(/[*/]/).map(Number);
      const [num, den] = ex.answer.split(',').map(Number);
      const prodNum = n1 * n2;
      const prodDen = d1 * d2;
      expect(prodNum * den).toBe(prodDen * num);
    }
  });

  it('either gcd(n1, d2) > 1 or gcd(n2, d1) > 1 (or both)', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 6);
      const [n1, d1, n2, d2] = ex.prompt.split(/[*/]/).map(Number);
      const g1 = gcd(n1, d2);
      const g2 = gcd(n2, d1);
      expect(g1 > 1 || g2 > 1).toBe(true);
    }
  });

  it('values stay within bounds per complexity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 0);
      const vals = ex.prompt.split(/[*/]/).map(Number);
      expect(Math.max(...vals)).toBeLessThanOrEqual(10);
    }
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 10);
      const vals = ex.prompt.split(/[*/]/).map(Number);
      expect(Math.max(...vals)).toBeLessThanOrEqual(20);
    }
  });

  it('handles complexity beyond 10', () => {
    const ex = generateMultiplicationFraction(42, 20);
    const parts = ex.answer.split(',').map(Number);
    expect(gcd(parts[0], parts[1])).toBe(1);
  });

  it('handles complexity below 0', () => {
    const ex = generateMultiplicationFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});
