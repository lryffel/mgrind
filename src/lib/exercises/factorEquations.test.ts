import { describe, it, expect } from 'vitest';
import { generateFactorEquations, validateFactorEquations } from './factorEquations';

describe('factorEquations', () => {
  it('generates a valid exercise', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 5);
      expect(ex.prompt).toBeTruthy();
      expect(ex.answer).toBeTruthy();
      expect(typeof ex.prompt).toBe('string');
      expect(typeof ex.answer).toBe('string');
    }
  });

  it('accepts the correct answer', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFactorEquations(seed, 7);
      expect(validateFactorEquations(ex.answer, ex)).toBe(true);
    }
  });

  it('accepts correct answer in different order', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 5);
      const roots = ex.answer.split(',').map(Number);
      const reversed = [...roots].reverse().join(',');
      expect(validateFactorEquations(reversed, ex)).toBe(true);
    }
  });

  it('rejects a wrong answer', () => {
    const ex = generateFactorEquations(42, 3);
    expect(validateFactorEquations('999', ex)).toBe(false);
  });

  it('rejects empty input', () => {
    const ex = generateFactorEquations(42, 0);
    expect(validateFactorEquations('', ex)).toBe(false);
    expect(validateFactorEquations('  ', ex)).toBe(false);
  });

  it('rejects malformed input', () => {
    const ex = generateFactorEquations(42, 0);
    expect(validateFactorEquations('abc', ex)).toBe(false);
    expect(validateFactorEquations('1,abc', ex)).toBe(false);
  });

  it('rejects answer with wrong number of solutions', () => {
    const ex = generateFactorEquations(42, 0);
    const parts = ex.answer.split(',');
    expect(validateFactorEquations(parts.slice(0, 1).join(','), ex)).toBe(false);
  });

  it('is deterministic for the same seed', () => {
    const a = generateFactorEquations(100, 3);
    const b = generateFactorEquations(100, 3);
    expect(a.answer).toBe(b.answer);
    expect(a.prompt).toBe(b.prompt);
  });

  it('generates different exercises for different seeds', () => {
    const a = generateFactorEquations(1, 3);
    const b = generateFactorEquations(2, 3);
    expect(a.answer !== b.answer || a.prompt !== b.prompt).toBe(true);
  });

  it('has the variable in the data', () => {
    const ex = generateFactorEquations(42, 5);
    expect(ex.data?.variable).toBeTruthy();
  });

  it('has the number of solutions in the data', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 7);
      const numSolutions = ex.data?.numSolutions;
      expect(numSolutions).toBeGreaterThanOrEqual(1);
      expect(numSolutions).toBeLessThanOrEqual(3);
      expect(ex.answer.split(',')).toHaveLength(numSolutions ?? -1);
    }
  });

  it('generates factoring-out equations at low complexity', () => {
    for (let seed = 0; seed < 20; seed++) {
      const ex = generateFactorEquations(seed, 0);
      expect(ex.prompt).toMatch(/= 0$/);
      const roots = ex.answer.split(',').map(Number);
      expect(roots).toContain(0);
      expect(roots.length).toBe(2);
    }
  });

  it('generates diff-of-squares equations', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 2);
      const roots = ex.answer.split(',').map(Number);
      if (roots.length === 2 && !roots.includes(0)) {
        expect(roots[0] + roots[1]).toBe(0);
      }
    }
  });

  it('generates perfect-square equations (single root)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 3);
      if (ex.answer.split(',').length === 1) {
        const v = ex.data?.variable ?? 'x';
        expect(ex.prompt).toContain(`${v}^{2}`);
      }
    }
  });

  it('keeps = 0 form at complexity 0-1', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const comp of [0, 1]) {
        const ex = generateFactorEquations(seed, comp);
        expect(ex.prompt).toMatch(/= 0$/);
      }
    }
  });

  it('may distribute terms from complexity 2+', () => {
    const seenDistributed = new Set<boolean>();
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactorEquations(seed, 5);
      seenDistributed.add(ex.prompt.endsWith('= 0'));
    }
    expect(seenDistributed.size).toBe(2);
  });

  it('generates cubic equations (3 roots)', () => {
    for (let seed = 100; seed < 200; seed++) {
      const ex = generateFactorEquations(seed, 7);
      if (ex.answer.split(',').length === 3) {
        const roots = ex.answer.split(',').map(Number);
        expect(roots).toContain(0);
        expect(roots.length).toBe(3);
      }
    }
  });

  it('generates factoring-out-and-binomial equations', () => {
    for (let seed = 50; seed < 150; seed++) {
      const ex = generateFactorEquations(seed, 6);
      const roots = ex.answer.split(',').map(Number);
      if (roots.length === 2) {
        const areOpposites = roots[0] + roots[1] === 0;
        const hasZero = roots.includes(0);
        expect(areOpposites || hasZero).toBe(true);
      }
    }
  });

  it('trims whitespace in answer', () => {
    const ex = generateFactorEquations(42, 3);
    expect(validateFactorEquations('  ' + ex.answer + '  ', ex)).toBe(true);
  });

  it('generates at all complexity levels', () => {
    for (let complexity = 0; complexity <= 10; complexity++) {
      for (let seed = 0; seed < 10; seed++) {
        const ex = generateFactorEquations(seed, complexity);
        expect(ex.prompt).toBeTruthy();
        expect(ex.answer).toBeTruthy();
        expect(validateFactorEquations(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('generates with consistent numSolutions matching answer length', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFactorEquations(seed, 8);
      expect(ex.answer.split(',')).toHaveLength(ex.data?.numSolutions ?? -1);
    }
  });
});
