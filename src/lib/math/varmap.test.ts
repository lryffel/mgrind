import { describe, it, expect } from 'vitest';
import { varMapText, varMapUnicode, varMapLatex, buildFactorOptions, formatExpandedTerm } from './varmap';

describe('varMapText / varMapUnicode', () => {
  it('converts single variable in varMapText', () => {
    expect(varMapText({ x: 1 })).toBe('x');
  });

  it('converts variable with exponent in varMapText', () => {
    expect(varMapText({ a: 2 })).toBe('a^2');
  });

  it('converts single variable in varMapUnicode', () => {
    expect(varMapUnicode({ x: 1 })).toBe('x');
  });

  it('converts variable with exponent in varMapUnicode', () => {
    expect(varMapUnicode({ a: 2 })).toBe('a\u00B2');
  });

  it('passes through plain variable names in varMapText', () => {
    expect(varMapText({ x: 1 })).toBe('x');
    expect(varMapText({ a: 2 })).toBe('a^2');
  });

  it('passes through plain variable names in varMapUnicode', () => {
    expect(varMapUnicode({ x: 1 })).toBe('x');
    expect(varMapUnicode({ a: 2 })).toBe('a\u00B2');
  });
});

describe('varMapLatex', () => {
  it('handles variable without exponent', () => {
    expect(varMapLatex({ x: 1 })).toBe('x');
  });

  it('handles variable with exponent in LaTeX', () => {
    expect(varMapLatex({ x: 2 })).toBe('x^{2}');
  });

  it('handles plain variable names in LaTeX', () => {
    expect(varMapLatex({ x: 2 })).toBe('x^{2}');
  });
});

describe('buildFactorOptions', () => {
  it('uses variable names in option text', () => {
    const options = buildFactorOptions([{ x: 2 }]);
    const opt2 = options.find((o) => o.text === 'x\u00B2');
    expect(opt2).toBeDefined();
    expect(opt2!.latex).toBe('x^{2}');
  });
});

describe('formatExpandedTerm', () => {
  it('includes variable in expanded output', () => {
    expect(formatExpandedTerm(1, { x: 1 }, true)).toBe('x');
  });
});
