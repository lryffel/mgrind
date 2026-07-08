import { describe, it, expect } from 'vitest';
import { generateSubtractionFraction } from './subtractionFraction';
import { gcd } from '../math/number';

function parseFracs(prompt: string): number[] {
  const match = prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} - \\frac\{(\d+)\}\{(\d+)\}$/);
  expect(match).not.toBeNull();
  return [parseInt(match![1]), parseInt(match![2]), parseInt(match![3]), parseInt(match![4])];
}

describe('generateSubtractionFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateSubtractionFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateSubtractionFraction(12345, 3);
    const b = generateSubtractionFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateSubtractionFraction(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('prompt has two fractions joined by -', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubtractionFraction(seed, 4);
      expect(ex.prompt).toMatch(/^\\frac\{\d+\}\{\d+\} - \\frac\{\d+\}\{\d+\}$/);
    }
  });

  it('answer is two comma-separated integers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSubtractionFraction(seed, 4);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(2);
      parts.forEach((p) => {
        const n = Number(p);
        expect(Number.isInteger(n)).toBe(true);
      });
    }
  });

  it('the simplified numerator and denominator are coprime', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubtractionFraction(seed, 4);
      const [a, b] = ex.answer.split(',').map(Number);
      expect(gcd(Math.abs(a), b)).toBe(1);
    }
  });

  it('the denominator is always positive in the answer', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubtractionFraction(seed, 4);
      const [, b] = ex.answer.split(',').map(Number);
      expect(b).toBeGreaterThan(0);
    }
  });

  it('subtracting the two fractions equals the answer', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSubtractionFraction(seed, 6);
      const [n1, d1, n2, d2] = parseFracs(ex.prompt);
      const [a, b] = ex.answer.split(',').map(Number);
      const diffNum = n1 * d2 - n2 * d1;
      const diffDen = d1 * d2;
      expect(diffNum * b).toBe(diffDen * a);
    }
  });

  it('produces negative results for some seeds', () => {
    let hasNegative = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSubtractionFraction(seed, 5);
      const [a] = ex.answer.split(',').map(Number);
      if (a < 0) {
        hasNegative = true;
        break;
      }
    }
    expect(hasNegative).toBe(true);
  });

  it('produces prompt values reasonably bounded per complexity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSubtractionFraction(seed, 0);
      const vals = parseFracs(ex.prompt);
      expect(Math.max(...vals)).toBeLessThanOrEqual(100);
    }
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSubtractionFraction(seed, 10);
      const vals = parseFracs(ex.prompt);
      expect(Math.max(...vals)).toBeLessThanOrEqual(1000);
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateSubtractionFraction(42, 20);
    const [a, b] = ex.answer.split(',').map(Number);
    expect(gcd(Math.abs(a), b)).toBe(1);
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateSubtractionFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});
