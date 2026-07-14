import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import {
  generateFactoringOutAndBinomial,
  validateFactoringOutAndBinomial,
  formatFullFactoredLatex,
} from './factoringOutAndBinomial';
import type { FactoringOutAndBinomialData } from './factoringOutAndBinomial';
import { cmd } from '../math/latex';
import { VAR_POOL } from '../math/varpool';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: Exercise): FactoringOutAndBinomialData {
  return ex.data as unknown as FactoringOutAndBinomialData;
}

describe('generateFactoringOutAndBinomial', () => {
  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateFactoringOutAndBinomial, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateFactoringOutAndBinomial, 5);
  });

  it('returns a valid exercise with prompt, answer, and data', () => {
    expectHasPromptAndAnswer(generateFactoringOutAndBinomial, 42, 0);
  });

  it('non-trap exercises have answer with format formula,gcfCoeff,gcfIdx,a/b,c/d', () => {
    let seenNonTrap = 0;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 3);
      if (!d(ex).isTrap) {
        seenNonTrap++;
        const parts = ex.answer.split(',');
        expect(parts.length).toBe(5);
        expect(['1', '2', '3']).toContain(parts[0]);
        expect(parseInt(parts[1], 10)).toBeGreaterThanOrEqual(2);
        expect(parts[3]).toMatch(/^\d+(\/\d+)?$/);
        expect(parts[4]).toMatch(/^\d+(\/\d+)?$/);
      }
    }
    expect(seenNonTrap).toBeGreaterThan(0);
  });

  it('trap exercises have answer "-1" and isTrap true', () => {
    let seenTrap = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) {
        seenTrap = true;
        expect(ex.answer).toBe('-1');
      }
    }
    expect(seenTrap).toBe(true);
  });

  it('produces traps approximately 20% of the time', () => {
    let trapCount = 0;
    const total = 2000;
    for (let seed = 0; seed < total; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) trapCount++;
    }
    expect(trapCount).toBeGreaterThan(total * 0.1);
    expect(trapCount).toBeLessThan(total * 0.3);
  });

  it('low complexity (0-3) produces only formula type 1', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 2);
      if (!d(ex).isTrap) {
        expect(d(ex).formulaType).toBe(1);
      }
    }
  });

  it('higher complexity (4+) produces all three formula types', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 6);
      const ft = d(ex).formulaType;
      if (ft !== 0) seen.add(ft);
    }
    expect(seen.has(1)).toBe(true);
    expect(seen.has(2)).toBe(true);
    expect(seen.has(3)).toBe(true);
  });

  it('low complexity (0-8) produces only integer a/b coefficients', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (let c = 0; c <= 8; c++) {
        const ex = generateFactoringOutAndBinomial(seed + c * 1000, c);
        if (d(ex).isTrap) continue;
        expect(d(ex).aDen).toBe(1);
        expect(d(ex).bDen).toBe(1);
      }
    }
  });

  it('never produces fractional coefficients', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateFactoringOutAndBinomial(seed + c * 1000, c);
        if (d(ex).isTrap) continue;
        expect(d(ex).aDen).toBe(1);
        expect(d(ex).bDen).toBe(1);
      }
    }
  });

  it('complexity 7+ may include GCF variable part', () => {
    let sawGcfVar = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 8);
      if (!d(ex).isTrap && d(ex).correctGcfIdx >= 0) {
        sawGcfVar = true;
        break;
      }
    }
    expect(sawGcfVar).toBe(true);
  });

  it('GCF variable exponents can be greater than 1 at high complexity', () => {
    let sawExpGt1 = false;
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 10);
      if (d(ex).isTrap) continue;
      if (d(ex).gcfVarLatex.includes('^{')) {
        sawExpGt1 = true;
        break;
      }
    }
    expect(sawExpGt1).toBe(true);
  });

  it('variables are drawn from the shared pool (no separate GCF_VARS/INNER_VARS)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 10);
      const data = d(ex);
      if (data.isTrap) continue;
      if (data.varA) expect(VAR_POOL).toContain(data.varA);
      expect(VAR_POOL).toContain(data.varB);
    }
  });
});

describe('validateFactoringOutAndBinomial', () => {
  it('accepts the correct answer for a non-trap exercise', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (!d(ex).isTrap) {
        expect(validateFactoringOutAndBinomial(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('rejects wrong formula type', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('2,3,-1,2/1,4/1', ex)).toBe(false);
    expect(validateFactoringOutAndBinomial('3,3,-1,2/1,4/1', ex)).toBe(false);
  });

  it('rejects wrong GCF coefficient', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('1,5,-1,2/1,4/1', ex)).toBe(false);
  });

  it('rejects wrong GCF variable index', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,0,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: 0,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('1,3,1,2/1,4/1', ex)).toBe(false);
  });

  it('rejects wrong a coefficient', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('1,3,-1,5/1,4/1', ex)).toBe(false);
  });

  it('rejects wrong b coefficient', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('1,3,-1,2/1,7/1', ex)).toBe(false);
  });

  it('accepts answer "-1" for trap exercises', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '-1',
      data: { isTrap: true } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('-1', ex)).toBe(true);
  });

  it('rejects non-trap answer for trap exercises', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '-1',
      data: { isTrap: true } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('1,3,-1,2/1,4/1', ex)).toBe(false);
  });

  it('rejects "-1" for non-trap exercises', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('-1', ex)).toBe(false);
  });

  it('rejects malformed answer strings', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,3,-1,2/1,4/1',
      data: {
        formulaType: 1,
        gcfCoeff: 3,
        correctGcfIdx: -1,
        aNum: 2,
        aDen: 1,
        bNum: 4,
        bDen: 1,
        isTrap: false,
      } as unknown as Exercise['data'],
    };
    expect(validateFactoringOutAndBinomial('', ex)).toBe(false);
    expect(validateFactoringOutAndBinomial('1,3', ex)).toBe(false);
    expect(validateFactoringOutAndBinomial('abc', ex)).toBe(false);
  });
});

describe('formatFullFactoredLatex', () => {
  it('formats gcf * (a + b*varB)² with coefficient GCF', () => {
    const result = formatFullFactoredLatex(1, 3, '', 2, 1, 3, 1, null, 'x');
    expect(result).toBe('3\\,(3x + 2)^{2}');
  });

  it('formats gcf * (a - b*varB)² with coefficient GCF', () => {
    const result = formatFullFactoredLatex(2, 4, '', 1, 1, 2, 1, null, 'y');
    expect(result).toBe('4\\,(2y - 1)^{2}');
  });

  it('formats gcf * (a+b*varB)(a-b*varB) with coefficient GCF', () => {
    const result = formatFullFactoredLatex(3, 2, '', 1, 1, 3, 1, null, 'z');
    expect(result).toBe('2\\,(1 + 3z)(1 - 3z)');
  });

  it('formats with GCF variable part', () => {
    const result = formatFullFactoredLatex(1, 2, 'x', 3, 1, 4, 1, null, 'y');
    expect(result).toBe('2\\,x\\,(4y + 3)^{2}');
  });

  it('formats with two variables', () => {
    const result = formatFullFactoredLatex(1, 3, 'x', 2, 1, 5, 1, 'a', 'b');
    expect(result).toBe('3\\,x\\,(2a + 5b)^{2}');
  });

  it('omits coefficient 1 when GCF variable is present', () => {
    const result = formatFullFactoredLatex(1, 1, 'x', 2, 1, 3, 1, null, 'y');
    expect(result).toBe('x\\,(3y + 2)^{2}');
  });

  it('handles formula 3 with two variables', () => {
    const result = formatFullFactoredLatex(3, 2, 'x', 1, 1, 3, 1, 'a', 'b');
    expect(result).toBe('2\\,x\\,(a + 3b)(a - 3b)');
  });

  it('handles two-variable formulas', () => {
    const result = formatFullFactoredLatex(1, 3, '', 1, 1, 2, 1, 'a', 'b');
    expect(result).toBe('3\\,(a + 2b)^{2}');
  });
});

describe('prompt term order', () => {
  it('formula type 1 with varA: a² term precedes b² term', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 7);
      const data = d(ex);
      if (data.isTrap || data.formulaType !== 1 || !data.varA) continue;

      expect(ex.prompt.indexOf(`${cmd(data.varA)}^{2}`)).toBeLessThan(ex.prompt.indexOf(`${cmd(data.varB)}^{2}`));
    }
  });

  it('formula type 2 with varA: a² term precedes b² term', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 7);
      const data = d(ex);
      if (data.isTrap || data.formulaType !== 2 || !data.varA) continue;

      expect(ex.prompt.indexOf(`${cmd(data.varA)}^{2}`)).toBeLessThan(ex.prompt.indexOf(`${cmd(data.varB)}^{2}`));
    }
  });

  it('formula type 3 with varA: a² term precedes b² term', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 7);
      const data = d(ex);
      if (data.isTrap || data.formulaType !== 3 || !data.varA) continue;

      expect(ex.prompt.indexOf(`${cmd(data.varA)}^{2}`)).toBeLessThan(ex.prompt.indexOf(`${cmd(data.varB)}^{2}`));
    }
  });

  it('formula types 1 and 2 without varA: prompt starts with a number (a² term)', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      const data = d(ex);
      if (data.isTrap || (data.formulaType !== 1 && data.formulaType !== 2) || data.varA) continue;

      expect(ex.prompt.charAt(0)).toMatch(/\d/);
    }
  });

  it('formula type 3 without varA: b² term appears after the minus sign', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 7);
      const data = d(ex);
      if (data.isTrap || data.formulaType !== 3 || data.varA) continue;

      const minusIdx = ex.prompt.indexOf(' - ');
      expect(minusIdx).toBeGreaterThan(0);
      expect(ex.prompt.indexOf(`${cmd(data.varB)}^{2}`)).toBeGreaterThan(minusIdx);
    }
  });
});

describe('regression', () => {
  it('correctFactoredLatex always starts with the gcfCoeff', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) continue;
      const data = d(ex);
      const correctOption = data.correctGcfIdx >= 0 ? data.factorOptions[data.correctGcfIdx] : null;
      const latex = formatFullFactoredLatex(
        data.formulaType,
        data.gcfCoeff,
        correctOption?.latex ?? '',
        data.aNum,
        data.aDen,
        data.bNum,
        data.bDen,
        data.varA,
        data.varB,
      );
      expect(latex.charAt(0)).toBe(String(data.gcfCoeff).charAt(0));
    }
  });

  it('factorOptions are non-empty when varB is set', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) continue;
      const data = d(ex);
      expect(data.factorOptions.length).toBeGreaterThan(0);
    }
  });

  it('gcfCoeff absorbs gcd of aNum,bNum so gcd(aNum,bNum)=1 for integer coeffs', () => {
    function gcd(a: number, b: number): number {
      while (b) {
        [a, b] = [b, a % b];
      }
      return Math.abs(a);
    }
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) continue;
      const data = d(ex);
      if (data.aDen === 1 && data.bDen === 1) {
        expect(gcd(data.aNum, data.bNum)).toBe(1);
      }
    }
  });

  it('generated polynomial coefficients match the stored data', () => {
    function gcd(a: number, b: number): number {
      while (b) {
        [a, b] = [b, a % b];
      }
      return Math.abs(a);
    }
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateFactoringOutAndBinomial(seed, 5);
      if (d(ex).isTrap) continue;
      const data = d(ex);
      if (data.aDen === 1 && data.bDen === 1) {
        const a2Coeff = data.gcfCoeff * data.aNum * data.aNum;
        const abCoeff = data.gcfCoeff * 2 * data.aNum * data.bNum;
        const b2Coeff = data.gcfCoeff * data.bNum * data.bNum;
        const actualGcd = gcd(gcd(a2Coeff, abCoeff), b2Coeff);
        expect(actualGcd).toBe(data.gcfCoeff);
      }
    }
  });
});
