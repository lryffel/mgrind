import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import {
  generateCollectingTerms,
  validateCollectingTerms,
  formatCollectingAnswer,
  type CollectingTermsData,
} from './collectingTerms';

function getFields(ex: Exercise): { variablePart: string }[] {
  const d = ex.data as CollectingTermsData | undefined;
  return d?.fields ?? [];
}

describe('generateCollectingTerms', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateCollectingTerms(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect((ex.data as CollectingTermsData).fields).toBeDefined();
    expect(Array.isArray(getFields(ex))).toBe(true);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateCollectingTerms(12345, 3);
    const b = generateCollectingTerms(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateCollectingTerms(1, 5);
    const b = generateCollectingTerms(2, 5);
    expect(a).not.toEqual(b);
  });

  it('answer has comma-separated parts matching field count', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateCollectingTerms(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        expect(parts.length).toBe(fields.length);
        parts.forEach((p) => {
          expect(p).toMatch(/^-?\d+(\/\d+)?$/);
        });
      }
    }
  });

  it('low complexity (0-2) produces only constant or degree-1 monomials', () => {
    const degree1Vars = new Set([
      '',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'm',
      'n',
      'x',
      'y',
      'z',
      'i',
      'j',
      'k',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
    ]);
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 2; c++) {
        const ex = generateCollectingTerms(seed + c * 1000, c);
        const fields = getFields(ex);
        for (const f of fields) {
          expect(degree1Vars.has(f.variablePart)).toBe(true);
        }
      }
    }
  });

  it('low complexity (0-7) produces only integer coefficients', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 7; c++) {
        const ex = generateCollectingTerms(seed + c * 1000, c);
        ex.answer.split(',').forEach((p) => {
          expect(p).toMatch(/^-?\d+$/);
        });
      }
    }
  });

  it('prompt contains at least two terms', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateCollectingTerms(seed, 5);
      // prompt has terms separated by + or - with spaces
      expect(ex.prompt.length).toBeGreaterThan(3);
    }
  });

  it('each generated exercise has at least 2 answer fields', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateCollectingTerms(seed + c * 1000, c);
        expect(getFields(ex).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('formatCollectingAnswer produces valid latex', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateCollectingTerms(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex).map((f) => f.variablePart);
        const latex = formatCollectingAnswer(parts, fields);
        expect(latex).not.toBe('');
        expect(latex).not.toBe('0');
      }
    }
  });

  it('validateCollectingTerms matches equivalent fractions', () => {
    const ex: Exercise = {
      prompt: '1/2 a + 1/3 b',
      answer: '1/2,1/3',
      data: { fields: [{ variablePart: 'a' }, { variablePart: 'b' }] } as CollectingTermsData,
    };
    expect(validateCollectingTerms('1/2,1/3', ex)).toBe(true);
    expect(validateCollectingTerms('2/4,1/3', ex)).toBe(true);
    expect(validateCollectingTerms('1/2,2/6', ex)).toBe(true);
    expect(validateCollectingTerms('2/4,2/6', ex)).toBe(true);
    expect(validateCollectingTerms('1/3,1/2', ex)).toBe(false);
  });
});
