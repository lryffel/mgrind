import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import { generateSimplifySymbolicFraction, validateSimplifySymbolicFraction } from './simplifySymbolicFraction';

function getFields(ex: Exercise): { variablePart: string }[] {
  return ex.data?.fields ?? [];
}

describe('generateSimplifySymbolicFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateSimplifySymbolicFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex).toHaveProperty('data');
    expect(ex.data?.promptKey).toBe('exercise.simplifySymbolicFraction.prompt');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateSimplifySymbolicFraction(12345, 3);
    const b = generateSimplifySymbolicFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateSimplifySymbolicFraction(1, 5);
    const b = generateSimplifySymbolicFraction(2, 5);
    expect(a).not.toEqual(b);
  });

  it('prompt contains a fraction', () => {
    const ex = generateSimplifySymbolicFraction(42, 5);
    expect(ex.prompt).toContain('\\frac');
  });

  it('answer has comma-separated parts matching field count', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let c = 0; c <= 9; c++) {
        const ex = generateSimplifySymbolicFraction(seed + c * 1000, c);
        if (ex.answer === 'cannot_simplify') continue;
        const parts = ex.answer.split(',');
        const fields = getFields(ex);
        expect(parts.length).toBe(fields.length);
        parts.forEach((p) => {
          expect(p).toMatch(/^-?\d+(?:\/\d+)?(?:;\d+)?$/);
        });
      }
    }
  });

  it('at complexity 0-1, produces only constantSign', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 0);
      const fields = getFields(ex);
      expect(fields.length).toBe(1);
      expect(fields[0].variablePart).toBe('');
    }
  });

  it('at complexity 2, produces constantSign or factorConstant', () => {
    const seenEmpty = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 2);
      const fields = getFields(ex);
      expect(fields.length).toBe(1);
      expect(fields[0].variablePart).toBe('');
      if (ex.prompt.includes('frac')) seenEmpty.add(seed);
    }
    expect(seenEmpty.size).toBeGreaterThan(50);
  });

  it('at complexity 3, monomial sub-types appear', () => {
    const seenMonomial = new Set<number>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 3);
      const fields = getFields(ex);
      if (fields.length === 1 && fields[0].variablePart !== '') seenMonomial.add(seed);
    }
    expect(seenMonomial.size).toBeGreaterThan(10);
  });

  it('at complexity 4, binomialThird appears with two fields', () => {
    const seenTwoField = new Set<number>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 4);
      const fields = getFields(ex);
      if (fields.length === 2) seenTwoField.add(seed);
    }
    expect(seenTwoField.size).toBeGreaterThan(50);
  });

  it('at complexity 7-8, asymmetric binomial-square appears', () => {
    const seenAsym = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 8);
      const parts = ex.answer.split(',').map(Number);
      if (parts.length === 2 && (Math.abs(parts[0]) > 1 || Math.abs(parts[1]) > 1)) {
        seenAsym.add(seed);
      }
    }
    expect(seenAsym.size).toBeGreaterThan(20);
  });

  it('at complexity 9-10, signBinomial produces varying answers', () => {
    const answers = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 10);
      if (ex.answer === '-1,1' || ex.answer === '1,-1') answers.add(ex.answer);
    }
    expect(answers.has('-1,1')).toBe(true);
    expect(answers.has('1,-1')).toBe(true);
  });

  it('at complexity 9-10, factoredConstantSign rarely appears (fraction-based sign exercise)', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 10);
      const fields = getFields(ex);
      if (fields.length === 1 && fields[0].variablePart === '' && ex.answer.includes(';')) {
        seen.add(seed);
      }
    }
    expect(seen.size).toBeGreaterThan(5);
  });

  it('at complexity 5-6, factoredConstantSign appears (two-field constant result)', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 300; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 5);
      const fields = getFields(ex);
      if (fields.length === 1 && fields[0].variablePart === '' && ex.answer.includes(';')) {
        seen.add(seed);
      }
    }
    expect(seen.size).toBeGreaterThan(5);
  });

  it('at complexity 6-7, genFactBinom appears with variable parts a^{2} and ab', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 7);
      const fields = getFields(ex);
      if (fields.length === 2 && fields[0].variablePart.includes('^{2}') && fields[1].variablePart.length === 2) {
        seen.add(seed);
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });

  it('at complexity 8-10, genFactBinomDen appears with variable parts v1 and v2', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 9);
      const fields = getFields(ex);
      const parts = ex.answer.split(',').map(Number);
      if (
        fields.length === 2 &&
        !fields[0].variablePart.includes('^{') &&
        fields[0].variablePart.length === 1 &&
        parts[0] === parts[1] &&
        parts[0] >= 2
      ) {
        seen.add(seed);
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  it('factorMonomial at complexity 3-4 produces variable parts with powers up to 3', () => {
    const seenHigher = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 4);
      const fields = getFields(ex);
      if (fields.length === 1 && fields[0].variablePart.includes('^{')) {
        seenHigher.add(seed);
      }
    }
    expect(seenHigher.size).toBeGreaterThan(10);
  });

  it('binomialThirdFactor produces negative coefficients', () => {
    const seenNeg = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 8);
      const parts = ex.answer.split(',').map(Number);
      if (parts.length === 2 && parts[0] < 0) seenNeg.add(seed);
    }
    expect(seenNeg.size).toBeGreaterThan(10);
  });

  it('signMonomial produces negative coefficients', () => {
    const seenNeg = new Set<number>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateSimplifySymbolicFraction(seed, 6);
      const fields = getFields(ex);
      if (fields.length === 1 && fields[0].variablePart !== '') {
        const val = parseInt(ex.answer, 10);
        if (val > 0) seenNeg.add(seed);
      }
    }
    expect(seenNeg.size).toBeGreaterThan(50);
  });
});

describe('validateSimplifySymbolicFraction', () => {
  it('validates correct answer', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1',
      data: { fields: [{ variablePart: 'a' }, { variablePart: 'b' }] },
    };
    expect(validateSimplifySymbolicFraction('1,1', ex)).toBe(true);
  });

  it('rejects wrong answer', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1',
      data: { fields: [{ variablePart: 'a' }, { variablePart: 'b' }] },
    };
    expect(validateSimplifySymbolicFraction('1,-1', ex)).toBe(false);
  });

  it('accepts equivalent fractions', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1/2',
      data: { fields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('2/4', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('1/2', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('1/3', ex)).toBe(false);
  });

  it('validates negative answers', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '-1',
      data: { fields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('-1', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('-2', ex)).toBe(false);
  });

  it('validates monomial answers', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1/2',
      data: { fields: [{ variablePart: 'a' }] },
    };
    expect(validateSimplifySymbolicFraction('1/2', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('2/4', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('1', ex)).toBe(false);
  });

  it('rejects wrong field count', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1',
      data: { fields: [{ variablePart: 'a' }, { variablePart: 'b' }] },
    };
    expect(validateSimplifySymbolicFraction('1', ex)).toBe(false);
    expect(validateSimplifySymbolicFraction('1,1,1', ex)).toBe(false);
  });

  it('rejects empty answer', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1',
      data: { fields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('', ex)).toBe(false);
  });

  it('accepts equivalent negative fractions', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '-1/2',
      data: { fields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('-1/2', ex)).toBe(true);
  });

  it('validates integer equivalent of fraction', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '3',
      data: { fields: [{ variablePart: 'a' }] },
    };
    expect(validateSimplifySymbolicFraction('3', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('6/2', ex)).toBe(true);
  });

  it('validates fraction mode answer with ; separator', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '3;4',
      data: { mode: 'fraction', fields: [{ variablePart: '' }], denominatorFields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('3;4', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('6;8', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('1;2', ex)).toBe(false);
  });

  it('validates fraction mode with variable part in numerator', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '3;2',
      data: { mode: 'fraction', fields: [{ variablePart: 'a^{2}' }], denominatorFields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('3;2', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('6;4', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('1;2', ex)).toBe(false);
  });

  it('rejects fraction mode with extra semicolons', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '3;4',
      data: { mode: 'fraction', fields: [{ variablePart: '' }], denominatorFields: [{ variablePart: '' }] },
    };
    expect(validateSimplifySymbolicFraction('3;4;5', ex)).toBe(false);
  });

  it('validates fraction mode with multi-field numerator', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1,1;2',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }, { variablePart: 'b' }],
        denominatorFields: [{ variablePart: '' }],
      },
    };
    expect(validateSimplifySymbolicFraction('1;2', ex)).toBe(false);
    expect(validateSimplifySymbolicFraction('1,1;2', ex)).toBe(true);
    expect(validateSimplifySymbolicFraction('2,2;4', ex)).toBe(true);
  });
});
