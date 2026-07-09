import { describe, it, expect } from 'vitest';
import { generateScientificNotation } from './scientificNotation';

describe('generateScientificNotation', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateScientificNotation(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateScientificNotation(12345, 3);
    const b = generateScientificNotation(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateScientificNotation(seed, 5);
      seen.add(ex.prompt + ex.answer);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('sciToDec (complexity 0-3) returns a decimal number', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateScientificNotation(seed, 0);
      expect(ex.prompt).toMatch(/^[\d.]+ \\cdot 10\^\{-?\d+\} = \?$/);
      expect(ex.answer).not.toContain(',');
    }
  });

  it('decToSci (complexity 4-5) returns a mantissa and exponent', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateScientificNotation(seed, 4);
      expect(ex.answer).toContain(',');
      const [mantissa, exponent] = ex.answer.split(',').map(Number);
      expect(Number.isFinite(mantissa)).toBe(true);
      expect(Number.isFinite(exponent)).toBe(true);
    }
  });

  it('multiply (complexity 6-7) returns a coefficient and exponent', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateScientificNotation(seed, 6);
      expect(ex.prompt).toContain('\\cdot');
      expect(ex.prompt).toContain('10');
      expect(ex.answer).toContain(',');
    }
  });

  it('add (complexity 8-9) returns a coefficient and exponent', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateScientificNotation(seed, 8);
      expect(ex.prompt).toContain('+');
      expect(ex.answer).toContain(',');
    }
  });

  it('handles complexity beyond 9 by clamping', () => {
    const ex = generateScientificNotation(42, 20);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateScientificNotation(42, -5);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });
});
