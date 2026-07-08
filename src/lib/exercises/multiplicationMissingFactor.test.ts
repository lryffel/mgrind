import { describe, it, expect } from 'vitest';
import { generateMultiplicationMissingFactor } from './multiplicationMissingFactor';

describe('generateMultiplicationMissingFactor', () => {
  it('returns a valid exercise with a prompt and answer', () => {
    const ex = generateMultiplicationMissingFactor(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex.prompt).toMatch(/^\d+ \u22C5 \? = \d+$/);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateMultiplicationMissingFactor(12345, 3);
    const b = generateMultiplicationMissingFactor(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateMultiplicationMissingFactor(1, 5);
    const b = generateMultiplicationMissingFactor(2, 5);
    expect(a).not.toEqual(b);
  });

  it('produces correct missing-factor results', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationMissingFactor(seed, 5);
      const match = ex.prompt.match(/^(\d+) \u22C5 \? = (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const b = parseInt(match![2]);
      const c = parseInt(ex.answer);
      expect(a * c).toBe(b);
    }
  });

  it('uses factors >= 2', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationMissingFactor(seed, 0);
      const match = ex.prompt.match(/^(\d+) \u22C5 \? = (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      expect(a).toBeGreaterThanOrEqual(2);
      const c = parseInt(ex.answer);
      expect(c).toBeGreaterThanOrEqual(2);
    }
  });

  it('at complexity 0, max factor is 10', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationMissingFactor(seed, 0);
      const match = ex.prompt.match(/^(\d+) \u22C5 \? = (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      expect(a).toBeLessThanOrEqual(10);
      const c = parseInt(ex.answer);
      expect(c).toBeLessThanOrEqual(10);
    }
  });

  it('at complexity 9, can produce factors up to 19', () => {
    let foundHigh = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationMissingFactor(seed, 9);
      const match = ex.prompt.match(/^(\d+) \u22C5 \? = (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1]);
      const c = parseInt(ex.answer);
      if (a > 10 || c > 10) {
        foundHigh = true;
        break;
      }
    }
    expect(foundHigh).toBe(true);
  });

  it('PRNG produces deterministic but varied output', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const exA = generateMultiplicationMissingFactor(seed, 5);
      const exB = generateMultiplicationMissingFactor(seed, 5);
      expect(exA).toEqual(exB);
      seen.add(exA.prompt + exA.answer);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
