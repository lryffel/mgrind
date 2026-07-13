import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import { generateExpand, validateExpand, type ExpandData } from './expand';

function getFields(ex: Exercise): { variablePart: string }[] {
  const d = ex.data as ExpandData | undefined;
  return d?.fields ?? [];
}

describe('generateExpand', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateExpand(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect((ex.data as ExpandData).fields).toBeDefined();
    expect(Array.isArray(getFields(ex))).toBe(true);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateExpand(12345, 3);
    const b = generateExpand(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateExpand(1, 5);
    const b = generateExpand(2, 5);
    expect(a).not.toEqual(b);
  });

  it('answer has comma-separated parts matching field count', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        expect(parts.length).toBe(fields.length);
        parts.forEach((p) => {
          expect(p).toMatch(/^-?\d+(\/\d+)?$/);
        });
      }
    }
  });

  it('low complexity (0-4) uses mono * binomial only', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        expect(ex.prompt).not.toContain(')(');
        expect(getFields(ex).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('each generated exercise has at least 2 answer fields', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        expect(getFields(ex).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('prompt is non-empty and looks like a product', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        expect(ex.prompt.length).toBeGreaterThan(3);
      }
    }
  });

  it('high complexity (5-10) can produce binomial * binomial prompts', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 5; c <= 10; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        if (ex.prompt.includes(')(')) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    expect(found).toBe(true);
  });

  it('binomial * trinomial at high complexity produces at least one collision', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 8; c <= 10; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        const fields = getFields(ex);
        if (fields.length < 5) continue;
        const factors = ex.prompt.split(')(');
        if (factors.length === 2) {
          const binomTerms = (factors[0].replace('(', '').match(/[+-]/g) || []).length + 1;
          const trinomTerms = (factors[1].replace(')', '').match(/[+-]/g) || []).length + 1;
          const totalBeforeCombine = binomTerms * trinomTerms;
          expect(fields.length).toBeLessThan(totalBeforeCombine);
        }
      }
    }
  });

  it('expand prompt contains parentheses for non-monomial factors', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 4; c++) {
        const ex = generateExpand(seed + c * 1000, c);
        expect(ex.prompt).toContain('(');
        expect(ex.prompt).toContain(')');
      }
    }
  });

  it('validateExpand accepts correct answer', () => {
    const ex = generateExpand(42, 3);
    expect(validateExpand(ex.answer, ex)).toBe(true);
  });

  it('validateExpand rejects wrong answer', () => {
    const ex = generateExpand(42, 3);
    const parts = ex.answer.split(',').map((s) => s.trim());
    if (parts.length >= 1) {
      const wrong = parts.map((p, i) => (i === 0 ? String(parseInt(p, 10) + 100) : p)).join(',');
      expect(validateExpand(wrong, ex)).toBe(false);
    }
  });

  it('validateExpand rejects wrong number of fields', () => {
    const ex = generateExpand(42, 3);
    expect(validateExpand('1,2,3', ex)).toBe(false);
  });

  it('validateExpand handles equivalent integer answers', () => {
    const ex: Exercise = {
      prompt: '(x)(x + y)',
      answer: '1,1',
      data: { fields: [{ variablePart: 'x^{2}' }, { variablePart: 'xy' }] } as ExpandData,
    };
    expect(validateExpand('1,1', ex)).toBe(true);
    expect(validateExpand('1,2', ex)).toBe(false);
  });
});
