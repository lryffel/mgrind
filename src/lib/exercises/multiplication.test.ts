import { describe, it, expect } from 'vitest';
import { generateMultiplication } from './multiplication';

describe('generateMultiplication', () => {
  it('returns a valid exercise with a prompt and answer', () => {
    const ex = generateMultiplication(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex.prompt).toMatch(/^\d+ \u22C5 \d+ = \?$/);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateMultiplication(12345, 3);
    const b = generateMultiplication(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateMultiplication(1, 5);
    const b = generateMultiplication(2, 5);
    expect(a).not.toEqual(b);
  });

  it('produces correct multiplication results', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplication(seed, 5);
      const match = ex.prompt.match(/^(\d+) \u22C5 (\d+) = \?$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      expect(ex.answer).toBe(String(a * b));
    }
  });

  it('uses factors >= 2', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplication(seed, 0);
      const match = ex.prompt.match(/^(\d+) \u22C5 (\d+) = \?$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(b).toBeGreaterThanOrEqual(2);
    }
  });

  it('at complexity 0, max factor is 10', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplication(seed, 0);
      const match = ex.prompt.match(/^(\d+) \u22C5 (\d+) = \?$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      expect(a).toBeLessThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(10);
    }
  });

  it('at complexity 9, can produce factors up to 19', () => {
    let foundHigh = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplication(seed, 9);
      const match = ex.prompt.match(/^(\d+) \u22C5 (\d+) = \?$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      if (a > 10 || b > 10) {
        foundHigh = true;
        break;
      }
    }
    expect(foundHigh).toBe(true);
  });

  it('PRNG produces deterministic but varied output', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const exA = generateMultiplication(seed, 5);
      const exB = generateMultiplication(seed, 5);
      expect(exA).toEqual(exB);
      seen.add(exA.prompt + exA.answer);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
