import { describe, it, expect } from 'vitest';
import { generateSimplifyFraction } from './simplifyFraction';
import { gcd } from '../math/number';

describe('generateSimplifyFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateSimplifyFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateSimplifyFraction(12345, 3);
    const b = generateSimplifyFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateSimplifyFraction(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('prompt is a LaTeX fraction', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSimplifyFraction(seed, 4);
      expect(ex.prompt).toMatch(/^\\frac\{\d+\}\{\d+\}$/);
    }
  });

  it('answer is two comma-separated integers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSimplifyFraction(seed, 4);
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
      const ex = generateSimplifyFraction(seed, 4);
      const [a, b] = ex.answer.split(',').map(Number);
      expect(gcd(a, b)).toBe(1);
    }
  });

  it('the common factor is >= 2', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifyFraction(seed, 4);
      const match = ex.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
      expect(match).not.toBeNull();
      const num = parseInt(match![1]);
      const den = parseInt(match![2]);
      const [a, b] = ex.answer.split(',').map(Number);
      const factorNum = num / a;
      const factorDen = den / b;
      expect(factorNum).toBe(factorDen);
      expect(factorNum).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(factorNum)).toBe(true);
    }
  });

  it('the unreduced fraction equals the simplified fraction', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifyFraction(seed, 6);
      const match = ex.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
      expect(match).not.toBeNull();
      const num = parseInt(match![1]);
      const den = parseInt(match![2]);
      const [a, b] = ex.answer.split(',').map(Number);
      expect(num * b).toBe(den * a);
    }
  });

  it('numerator and denominator values stay within bounds per complexity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifyFraction(seed, 0);
      const match = ex.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
      expect(match).not.toBeNull();
      const num = parseInt(match![1]);
      const den = parseInt(match![2]);
      expect(num).toBeLessThanOrEqual(50);
      expect(den).toBeLessThanOrEqual(50);
    }
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifyFraction(seed, 10);
      const match = ex.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
      expect(match).not.toBeNull();
      const num = parseInt(match![1]);
      const den = parseInt(match![2]);
      expect(num).toBeLessThanOrEqual(500);
      expect(den).toBeLessThanOrEqual(500);
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateSimplifyFraction(42, 20);
    const parts = ex.answer.split(',').map(Number);
    expect(gcd(parts[0], parts[1])).toBe(1);
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateSimplifyFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});
