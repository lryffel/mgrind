import { describe, it, expect } from 'vitest';
import { varMapText, varMapUnicode, varMapLatex, buildFactorOptions, formatExpandedTerm } from './varmap';

describe('varMapText / varMapUnicode with LaTeX command keys', () => {
  it('converts \\ell to cursive l in varMapText', () => {
    expect(varMapText({ '\\ell': 1 })).toBe('\u2113');
  });

  it('converts \\ell with exponent in varMapText', () => {
    expect(varMapText({ '\\ell': 2 })).toBe('\u2113^2');
  });

  it('converts \\ell to cursive l in varMapUnicode', () => {
    expect(varMapUnicode({ '\\ell': 1 })).toBe('\u2113');
  });

  it('converts \\ell with exponent in varMapUnicode', () => {
    expect(varMapUnicode({ '\\ell': 2 })).toBe('\u2113\u00B2');
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
  it('preserves \\ell as a LaTeX command', () => {
    expect(varMapLatex({ '\\ell': 1 })).toBe('\\ell{}');
  });

  it('preserves \\ell with exponent in LaTeX', () => {
    expect(varMapLatex({ '\\ell': 2 })).toBe('\\ell^{2}');
  });

  it('handles plain variable names in LaTeX', () => {
    expect(varMapLatex({ x: 2 })).toBe('x^{2}');
  });
});

describe('buildFactorOptions', () => {
  it('uses display names in option text', () => {
    const options = buildFactorOptions([{ '\\ell': 2 }]);
    const opt2 = options.find((o) => o.text === '\u2113\u00B2');
    expect(opt2).toBeDefined();
    expect(opt2!.latex).toBe('\\ell^{2}');
  });
});

describe('formatExpandedTerm', () => {
  it('uses LaTeX commands in expanded output', () => {
    expect(formatExpandedTerm(1, { '\\ell': 1 }, true)).toBe('\\ell{}');
  });
});
