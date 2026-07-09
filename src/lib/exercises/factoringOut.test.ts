import { describe, it, expect } from 'vitest';
import { generateFactoringOut, validateFactoringOut, formatFactoredLatex } from './factoringOut';
import type { Exercise } from '../types';

interface FactoringOutData {
  isTrap: boolean;
  factorOptions: { text: string; latex: string; innerVarParts: string[] }[];
  correctIdx: number;
  gcfCoeff: number;
  expectedInnerCoeffs: number[];
}

function d(ex: Exercise): FactoringOutData {
  return ex.data as unknown as FactoringOutData;
}

describe('factoringOut', () => {
  it('generates valid exercises for various seeds and complexities', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (let complexity = 0; complexity <= 10; complexity++) {
        const ex = generateFactoringOut(seed, complexity);
        expect(ex.prompt).toBeTruthy();
        expect(ex.answer).toBeTruthy();
        expect(ex.data).toBeTruthy();

        const isValid = validateFactoringOut(ex.answer, ex);
        expect(isValid).toBe(true);
      }
    }
  });

  it('trap exercises have correctIdx -1 and validate "-1" as correct', () => {
    let foundTrap = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactoringOut(seed, 5);
      const data = d(ex);
      if (data.isTrap) {
        foundTrap = true;
        expect(data.correctIdx).toBe(-1);
        expect(validateFactoringOut('-1', ex)).toBe(true);
        expect(validateFactoringOut('0,1,2', ex)).toBe(false);
      }
    }
    expect(foundTrap).toBe(true);
  });

  it('non-trap exercises reject "-1"', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactoringOut(seed, 5);
      if (!d(ex).isTrap) {
        expect(validateFactoringOut('-1', ex)).toBe(false);
      }
    }
  });

  it('rejects wrong factor index', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactoringOut(seed, 5);
      const data = d(ex);
      if (data.isTrap) continue;
      const wrongIdx = data.correctIdx === 0 ? 1 : 0;
      if (wrongIdx < data.factorOptions.length) {
        const valid = validateFactoringOut(`${wrongIdx},${data.gcfCoeff},${data.expectedInnerCoeffs.join(',')}`, ex);
        expect(valid).toBe(false);
      }
    }
  });

  it('rejects wrong coefficient', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactoringOut(seed, 5);
      const data = d(ex);
      if (data.isTrap) continue;
      const valid = validateFactoringOut(`${data.correctIdx},999,${data.expectedInnerCoeffs.join(',')}`, ex);
      expect(valid).toBe(false);
    }
  });

  it('rejects wrong inner coefficients', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFactoringOut(seed, 5);
      const data = d(ex);
      if (data.isTrap) continue;
      const wrongInner = data.expectedInnerCoeffs.map(() => 999);
      const valid = validateFactoringOut(`${data.correctIdx},${data.gcfCoeff},${wrongInner.join(',')}`, ex);
      expect(valid).toBe(false);
    }
  });

  it('rarely generates trap exercises (~8%)', () => {
    let trapCount = 0;
    const total = 500;
    for (let seed = 0; seed < total; seed++) {
      const ex = generateFactoringOut(seed, 5);
      if (d(ex).isTrap) trapCount++;
    }
    expect(trapCount).toBeGreaterThan(0);
    expect(trapCount).toBeLessThan(total * 0.2);
  });

  it('formatFactoredLatex produces valid LaTeX', () => {
    const result = formatFactoredLatex(3, 'x^{2}y', [1, 2], ['a', 'b']);
    expect(result).toContain('x^{2}y');
    expect(result).toContain('(');
    expect(result).toContain(')');
  });

  it('generates factor options that include the correct monomial', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateFactoringOut(seed, 5);
      const data = d(ex);
      if (data.isTrap) continue;
      expect(data.correctIdx).toBeGreaterThanOrEqual(0);
      expect(data.correctIdx).toBeLessThan(data.factorOptions.length);
      const correctOpt = data.factorOptions[data.correctIdx];
      expect(correctOpt.text).toBeTruthy();
    }
  });
});
