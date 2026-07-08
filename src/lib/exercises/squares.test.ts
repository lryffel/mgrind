import { describe, it, expect } from 'vitest';
import { generateSquares } from './squares';

function parsePrompt(prompt: string): { a: number; variant: number } {
  const m1 = prompt.match(/^\((-?\d+)\)\^\{2\} = \?$/);
  if (m1) return { a: Math.abs(parseInt(m1[1])), variant: 1 };
  const m2 = prompt.match(/^-(\d+)\^\{2\} = \?$/);
  if (m2) return { a: parseInt(m2[1]), variant: 2 };
  const m3 = prompt.match(/^(\d+)\^\{2\} = \?$/);
  if (m3) return { a: parseInt(m3[1]), variant: 0 };
  throw new Error(`Cannot parse prompt: ${prompt}`);
}

describe('generateSquares', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateSquares(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex.prompt).toMatch(/\^\{2\} = \?$/);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateSquares(12345, 3);
    const b = generateSquares(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateSquares(1, 5);
    const b = generateSquares(2, 5);
    expect(a).not.toEqual(b);
  });

  it('produces correct square answers', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSquares(seed, 5);
      const { a, variant } = parsePrompt(ex.prompt);
      const expected = variant === 2 ? -(a * a) : a * a;
      expect(Number(ex.answer)).toBe(expected);
    }
  });

  it('at complexity 0, base is between 2 and 10', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSquares(seed, 0);
      const { a } = parsePrompt(ex.prompt);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(10);
    }
  });

  it('at complexity 9, base can be up to 50', () => {
    let foundHigh = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSquares(seed, 9);
      const { a } = parsePrompt(ex.prompt);
      if (a > 20) {
        foundHigh = true;
        break;
      }
    }
    expect(foundHigh).toBe(true);
  });

  it('at complexity 9, base is at least 10', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSquares(seed, 9);
      const { a } = parsePrompt(ex.prompt);
      expect(a).toBeGreaterThanOrEqual(10);
    }
  });

  it('at complexity 9, base is at most 50', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSquares(seed, 9);
      const { a } = parsePrompt(ex.prompt);
      expect(a).toBeLessThanOrEqual(50);
    }
  });

  it('all three variants appear across seeds', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSquares(seed, 4);
      const { variant } = parsePrompt(ex.prompt);
      seen.add(variant);
    }
    expect(seen.has(0)).toBe(true);
    expect(seen.has(1)).toBe(true);
    expect(seen.has(2)).toBe(true);
  });

  it('variant 2 (negative) produces negative answer', () => {
    let foundNegative = false;
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSquares(seed, 4);
      const { variant } = parsePrompt(ex.prompt);
      if (variant === 2) {
        expect(Number(ex.answer)).toBeLessThan(0);
        foundNegative = true;
      }
    }
    expect(foundNegative).toBe(true);
  });
});
