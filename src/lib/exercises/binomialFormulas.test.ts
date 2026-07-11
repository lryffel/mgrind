import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import { generateBinomialFormulas, validateBinomialFormulas } from './binomialFormulas';
import { formatCollectingAnswer } from './collectingTerms';

function getFields(ex: Exercise): { variablePart: string }[] {
  return ex.data?.fields ?? [];
}

describe('generateBinomialFormulas', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateBinomialFormulas(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect(ex.data?.fields).toBeDefined();
    expect(Array.isArray(getFields(ex))).toBe(true);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateBinomialFormulas(12345, 3);
    const b = generateBinomialFormulas(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateBinomialFormulas(1, 5);
    const b = generateBinomialFormulas(2, 5);
    expect(a).not.toEqual(b);
  });

  it('answer has comma-separated parts matching field count', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateBinomialFormulas(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        expect(parts.length).toBe(fields.length);
        parts.forEach((p) => {
          expect(p).toMatch(/^-?\d+(\/\d+)?$/);
        });
      }
    }
  });

  it('low complexity (0-4) produces only integer coefficients', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateBinomialFormulas(seed + c * 1000, c);
        ex.answer.split(',').forEach((p) => {
          expect(p).toMatch(/^-?\d+$/);
        });
      }
    }
  });

  it('at complexity 0-4, all three basic variants appear', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateBinomialFormulas(seed, 3);
      const fieldCount = getFields(ex).length;
      if (fieldCount === 2) seen.add('conjugate');
      else if (ex.prompt.includes(' - ')) seen.add('squareDiff');
      else seen.add('squareSum');
    }
    expect(seen.has('squareSum')).toBe(true);
    expect(seen.has('squareDiff')).toBe(true);
    expect(seen.has('conjugate')).toBe(true);
  });

  it('at complexity 5-9, all four variants appear', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateBinomialFormulas(seed, 7);
      const fields = getFields(ex);
      const varCount = fields.length;
      const hasXyVar = fields.some((f) => f.variablePart.includes('xy'));

      if (varCount === 3 && hasXyVar) {
        if (ex.prompt.includes(' - ')) seen.add('squareDiff2');
        else seen.add('squareSum2');
      } else if (varCount === 2 && fields[0].variablePart.endsWith('^{2}') && fields[1].variablePart.endsWith('^{2}')) {
        const v1 = fields[0].variablePart.replace('^{2}', '');
        const v2 = fields[1].variablePart.replace('^{2}', '');
        const parenIdx = ex.prompt.indexOf(')(');
        if (parenIdx !== -1) {
          const afterParens = ex.prompt.slice(parenIdx + 2);
          const idx1 = afterParens.indexOf(v1);
          const idx2 = afterParens.indexOf(v2);
          if (idx1 !== -1 && idx2 !== -1) {
            if (idx2 < idx1) seen.add('mixed');
            else seen.add('conjugate2');
          }
        }
      }
    }
    expect(seen.has('squareSum2')).toBe(true);
    expect(seen.has('squareDiff2')).toBe(true);
    expect(seen.has('conjugate2')).toBe(true);
    expect(seen.has('mixed')).toBe(true);
  });

  it('each variant produces a non-empty expansion', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateBinomialFormulas(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        const latex = formatCollectingAnswer(
          parts,
          fields.map((f) => f.variablePart),
        );
        expect(latex).not.toBe('');
        expect(latex).not.toBe('0');
      }
    }
  });
});

describe('prompt term order', () => {
  it('single-variable exercises: variable appears before constant in first factor', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateBinomialFormulas(seed, 3);
      const fields = getFields(ex);
      if (fields.length < 2) continue;
      const v0 = fields[0].variablePart.replace(/\^\{2\}/g, '');
      const vn = fields[fields.length - 1].variablePart.replace(/\^\{2\}/g, '');
      if (v0 !== vn) continue; // skip two-variable exercises

      // Extract content of first parentheses
      const firstParen = ex.prompt.indexOf('(');
      const closeParen = ex.prompt.indexOf(')');
      const inside = ex.prompt.slice(firstParen + 1, closeParen);
      const opIdx = inside.search(/ \+ | - /);
      expect(opIdx).toBeGreaterThan(0);
      expect(inside.indexOf(v0)).toBeLessThan(opIdx);
    }
  });

  it('two-variable exercises: first field variable precedes last field variable in prompt', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateBinomialFormulas(seed, 7);
      const fields = getFields(ex);
      if (fields.length < 2) continue;

      const v0 = fields[0].variablePart.replace(/\^\{2\}/g, '').replace('{}', '');
      const vn = fields[fields.length - 1].variablePart.replace(/\^\{2\}/g, '').replace('{}', '');

      if (!v0 || !vn || v0 === vn) continue; // single-variable

      expect(ex.prompt.indexOf(v0)).toBeLessThan(ex.prompt.indexOf(vn));
    }
  });
});

describe('validateBinomialFormulas', () => {
  it('matches equivalent fractions', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1/2,3/4',
      data: { fields: [{ variablePart: 'x' }, { variablePart: '' }] },
    };
    expect(validateBinomialFormulas('2/4,3/4', ex)).toBe(true);
    expect(validateBinomialFormulas('1/2,6/8', ex)).toBe(true);
    expect(validateBinomialFormulas('1/3,3/4', ex)).toBe(false);
  });
});
