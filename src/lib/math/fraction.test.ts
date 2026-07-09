import { describe, it, expect } from 'vitest';
import { parseFrac, fracEqual } from './fraction';

describe('parseFrac', () => {
  it('parses a positive integer', () => {
    expect(parseFrac('5')).toEqual([5, 1]);
  });

  it('parses a negative integer', () => {
    expect(parseFrac('-3')).toEqual([-3, 1]);
  });

  it('parses a fraction', () => {
    expect(parseFrac('3/4')).toEqual([3, 4]);
  });

  it('parses a negative fraction', () => {
    expect(parseFrac('-2/5')).toEqual([-2, 5]);
  });

  it('returns [-1, 1] for bare dash', () => {
    expect(parseFrac('-')).toEqual([-1, 1]);
  });

  it('returns [-1, 1] for dash with whitespace', () => {
    expect(parseFrac('  -  ')).toEqual([-1, 1]);
  });

  it('returns null for empty string', () => {
    expect(parseFrac('')).toBeNull();
  });

  it('returns null for whitespace only', () => {
    expect(parseFrac('   ')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseFrac('abc')).toBeNull();
  });

  it('returns null for denominator zero', () => {
    expect(parseFrac('1/0')).toBeNull();
  });
});

describe('fracEqual', () => {
  it('considers numerically equal fractions as equal', () => {
    expect(fracEqual('1/2', '2/4')).toBe(true);
  });

  it('considers -1 and bare dash as equal', () => {
    expect(fracEqual('-', '-1')).toBe(true);
  });

  it('considers -1 and -1/1 as equal', () => {
    expect(fracEqual('-1', '-1/1')).toBe(true);
  });

  it('rejects different values', () => {
    expect(fracEqual('1', '2')).toBe(false);
  });
});
