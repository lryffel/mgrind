import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import { generateExpandAndCollect, validateExpandAndCollect } from './expandAndCollect';

function getFields(ex: Exercise): { variablePart: string }[] {
  return ex.data?.fields ?? [];
}

describe('generateExpandAndCollect', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateExpandAndCollect(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect(ex.data?.fields).toBeDefined();
    expect(Array.isArray(getFields(ex))).toBe(true);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateExpandAndCollect(12345, 3);
    const b = generateExpandAndCollect(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateExpandAndCollect(1, 5);
    const b = generateExpandAndCollect(2, 5);
    expect(a).not.toEqual(b);
  });

  it('answer has comma-separated parts matching field count', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        expect(parts.length).toBe(fields.length);
        parts.forEach((p) => {
          expect(p).toMatch(/^-?\d+$/);
        });
      }
    }
  });

  it('each generated exercise has at least 2 answer fields', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        expect(getFields(ex).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('prompt is non-empty and looks like a combination of products', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        expect(ex.prompt.length).toBeGreaterThan(3);
      }
    }
  });

  it('low complexity (0-2) produces no exponent > 2 in variable parts', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let c = 0; c <= 2; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        for (const f of getFields(ex)) {
          const deg = parseInt((f.variablePart.match(/\{(\d+)\}/) || [])[1] || '0');
          expect(deg).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it('all answers contain only integer coefficients (no fractions)', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        ex.answer.split(',').forEach((p) => {
          expect(p).toMatch(/^-?\d+$/);
        });
      }
    }
  });

  it('high complexity (8-10) sometimes produces degree-3 variable parts', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 8; c <= 10; c++) {
        const ex = generateExpandAndCollect(seed + c * 1000, c);
        for (const f of getFields(ex)) {
          const m = f.variablePart.match(/\{(\d+)\}/);
          if (m && parseInt(m[1], 10) >= 3) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    expect(found).toBe(true);
  });

  it('validateExpandAndCollect accepts correct answer', () => {
    const ex = generateExpandAndCollect(42, 3);
    expect(validateExpandAndCollect(ex.answer, ex)).toBe(true);
  });

  it('validateExpandAndCollect rejects wrong answer', () => {
    const ex = generateExpandAndCollect(42, 3);
    const parts = ex.answer.split(',').map((s) => s.trim());
    if (parts.length >= 1) {
      const wrong = parts.map((p, i) => (i === 0 ? String(parseInt(p, 10) + 100) : p)).join(',');
      expect(validateExpandAndCollect(wrong, ex)).toBe(false);
    }
  });

  it('validateExpandAndCollect rejects wrong number of fields', () => {
    const ex = generateExpandAndCollect(42, 3);
    expect(validateExpandAndCollect('1,2,3', ex)).toBe(false);
  });

  it('validateExpandAndCollect handles equivalent integer answers', () => {
    const ex: Exercise = {
      prompt: 'x(x+1) + 2x(x-1)',
      answer: '3,-1',
      data: { fields: [{ variablePart: 'x^{2}' }, { variablePart: 'x' }] },
    };
    expect(validateExpandAndCollect('3,-1', ex)).toBe(true);
    expect(validateExpandAndCollect('3,1', ex)).toBe(false);
  });
});
