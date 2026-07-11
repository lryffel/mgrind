import { describe, it, expect } from 'vitest';
import { generateAdditionFraction } from './additionFraction';
import { gcd } from '../math/number';

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

  function termRegex(): string {
    return `(?:(?:\\\\frac|\\\\dfrac)\{(\\d+)\}\{(\\d+)\}|(\\d+))`;
  }

  function parseFracs(prompt: string): number[] {
    const re = new RegExp(`^${termRegex()} \\+ ${termRegex()}$`);
    const match = prompt.match(re);
    expect(match).not.toBeNull();
    // each term: either [frac num, frac den, null] or [null, null, plain num]
    const t1Num = match![1] !== undefined ? parseInt(match![1]) : parseInt(match![3]);
    const t1Den = match![2] !== undefined ? parseInt(match![2]) : 1;
    const t2Num = match![4] !== undefined ? parseInt(match![4]) : parseInt(match![6]);
    const t2Den = match![5] !== undefined ? parseInt(match![5]) : 1;
    return [t1Num, t1Den, t2Num, t2Den];
  }

  it('prompt has two terms joined by +', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      expect(ex.prompt).toMatch(/./);
      const vals = parseFracs(ex.prompt);
      expect(vals).toHaveLength(4);
      vals.forEach((v) => expect(Number.isInteger(v)).toBe(true));
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
      expect(Math.max(...vals)).toBeLessThanOrEqual(100);
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
