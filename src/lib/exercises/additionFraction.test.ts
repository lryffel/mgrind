import { describe, it, expect } from 'vitest';
import { generateAdditionFraction } from './additionFraction';

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

describe('generateAdditionFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateAdditionFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateAdditionFraction(12345, 3);
    const b = generateAdditionFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateAdditionFraction(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('prompt has two fractions joined by +', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      expect(ex.prompt).toMatch(/^\\frac\{\d+\}\{\d+\} \+ \\frac\{\d+\}\{\d+\}$/);
    }
  });

  it('answer is two comma-separated integers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(2);
      parts.forEach((p) => {
        const n = Number(p);
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThan(0);
      });
    }
  });

  it('the simplified parts are coprime', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      const [a, b] = ex.answer.split(',').map(Number);
      expect(gcd(a, b)).toBe(1);
    }
  });

  function parseFracs(prompt: string): number[] {
    const match = prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} \+ \\frac\{(\d+)\}\{(\d+)\}$/);
    expect(match).not.toBeNull();
    return [parseInt(match![1]), parseInt(match![2]), parseInt(match![3]), parseInt(match![4])];
  }

  it('adding the two fractions equals the answer', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateAdditionFraction(seed, 6);
      const [n1, d1, n2, d2] = parseFracs(ex.prompt);
      const [a, b] = ex.answer.split(',').map(Number);
      const sumNum = n1 * d2 + n2 * d1;
      const sumDen = d1 * d2;
      expect(sumNum * b).toBe(sumDen * a);
    }
  });

  it('at least one addend shares a factor with the common denominator', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateAdditionFraction(seed, 6);
      const [n1, d1, n2, d2] = parseFracs(ex.prompt);
      const totalNum = n1 * d2 + n2 * d1;
      const [a] = ex.answer.split(',').map(Number);
      const factor = totalNum / a;
      expect(Number.isInteger(factor)).toBe(true);
    }
  });

  it('numerator and denominator values stay within bounds per complexity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAdditionFraction(seed, 0);
      const vals = parseFracs(ex.prompt);
      expect(Math.max(...vals)).toBeLessThanOrEqual(50);
    }
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAdditionFraction(seed, 10);
      const vals = parseFracs(ex.prompt);
      expect(Math.max(...vals)).toBeLessThanOrEqual(500);
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateAdditionFraction(42, 20);
    const parts = ex.answer.split(',').map(Number);
    expect(gcd(parts[0], parts[1])).toBe(1);
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateAdditionFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});
