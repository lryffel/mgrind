import { describe, it, expect } from 'vitest';
import { generateFractionTrivia, validateFractionTrivia, type FractionTriviaData } from './fractionTrivia';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: { data?: unknown }): FractionTriviaData {
  return ex.data as FractionTriviaData;
}

const ALL_TYPES = [
  'fractionTerms',
  'integerFractions',
  'denominatorRestriction',
  'doubleFraction',
  'fractionBar',
  'fractionDivision',
  'multiplySame',
  'mediant',
  'equalFractions',
  'reducibleFractions',
  'zeroNumerator',
  'reciprocalProduct',
  'negativeSignPlacement',
];

const BASIC_TYPES = [
  'fractionTerms',
  'integerFractions',
  'denominatorRestriction',
  'doubleFraction',
  'fractionBar',
  'zeroNumerator',
];

describe('generateFractionTrivia', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateFractionTrivia, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateFractionTrivia, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateFractionTrivia, 5);
  });

  it('has a valid type in data', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 5);
      expect(ALL_TYPES).toContain(d(ex).triviaType);
    }
  });

  it('at low complexity (0-2), only generates basic types', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      expect(BASIC_TYPES).toContain(d(ex).triviaType);
    }
  });

  it('at complexity 3-5, includes fractionDivision and multiplySame', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 4);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('fractionDivision')).toBe(true);
    expect(found.has('multiplySame')).toBe(true);
  });

  it('at complexity 6-7, includes mediant', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 6);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('mediant')).toBe(true);
  });

  it('at complexity 8-9, includes equalFractions', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 9);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('equalFractions')).toBe(true);
  });

  it('mediant generates all 4 variants across seeds', () => {
    const allIndices = new Set<number>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateFractionTrivia(seed, 7);
      if (d(ex).triviaType === 'mediant') {
        ex.answer
          .split(',')
          .map(Number)
          .forEach((i) => allIndices.add(i));
      }
    }
    expect(allIndices.has(0)).toBe(true);
    expect(allIndices.has(1)).toBe(true);
    expect(allIndices.has(2)).toBe(true);
    expect(allIndices.has(3)).toBe(true);
  });

  it('fractionDivision generates coprime a and b', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFractionTrivia(seed, 4);
      if (d(ex).triviaType === 'fractionDivision') {
        const a = d(ex).triviaA!;
        const b = d(ex).triviaB!;
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(9);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
        const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
        expect(gcd(a, b)).toBe(1);
      }
    }
  });

  it('fractionDivision answer equals b,a', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFractionTrivia(seed, 4);
      if (d(ex).triviaType === 'fractionDivision') {
        expect(ex.answer).toBe(`${d(ex).triviaB},${d(ex).triviaA}`);
      }
    }
  });

  it('doubleFraction generates halveMC and doubleMC subtypes across seeds', () => {
    const subtypes = new Set<string>();
    for (let seed = 0; seed < 400; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      if (d(ex).triviaType === 'doubleFraction') {
        subtypes.add(d(ex).triviaSubType ?? '');
      }
    }
    expect(subtypes.has('halveMC')).toBe(true);
    expect(subtypes.has('doubleMC')).toBe(true);
  });

  it('both doubleMC and halveMC have multiple correct indices with 3-4 options', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      if (d(ex).triviaType === 'doubleFraction') {
        const sub = d(ex).triviaSubType ?? '';
        if (sub === 'halveMC' || sub === 'doubleMC') {
          const indices = ex.answer.split(',').map(Number);
          expect(indices.length).toBeGreaterThanOrEqual(1);
          for (const idx of indices) {
            expect(idx).toBeGreaterThanOrEqual(0);
          }
          expect(d(ex).triviaOptionsText).toBeDefined();
          const optCount = d(ex).triviaOptionsText!.length;
          expect(optCount).toBeGreaterThanOrEqual(3);
          expect(optCount).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  it('halveMC and doubleMC validate their own generated answers', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      if (
        d(ex).triviaType === 'doubleFraction' &&
        (d(ex).triviaSubType === 'halveMC' || d(ex).triviaSubType === 'doubleMC')
      ) {
        expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('halveMC and doubleMC reject single partial selection', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      if (
        d(ex).triviaType === 'doubleFraction' &&
        (d(ex).triviaSubType === 'halveMC' || d(ex).triviaSubType === 'doubleMC')
      ) {
        const indices = ex.answer.split(',').map(Number);
        if (indices.length > 1) {
          const partial = String(indices[0]);
          expect(validateFractionTrivia(partial, ex)).toBe(false);
        }
      }
    }
  });

  it('equalFractions shows 3 options at low complexity, 4 at high', () => {
    for (let seed = 0; seed < 50; seed++) {
      const exLow = generateFractionTrivia(seed, 4);
      if (d(exLow).triviaType === 'equalFractions') {
        expect(d(exLow).triviaOptionsLatex!.length).toBe(3);
      }
      const exHigh = generateFractionTrivia(seed, 9);
      if (d(exHigh).triviaType === 'equalFractions') {
        expect(d(exHigh).triviaOptionsLatex!.length).toBe(4);
      }
    }
  });

  it('equalFractions generates both variable and number variants', () => {
    const hasVars = new Set<boolean>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 9);
      if (d(ex).triviaType === 'equalFractions') {
        hasVars.add(d(ex).triviaA === undefined);
      }
    }
    expect(hasVars.has(true)).toBe(true);
    expect(hasVars.has(false)).toBe(true);
  });

  it('zeroNumerator always answers 0', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateFractionTrivia(seed, 1);
      if (d(ex).triviaType === 'zeroNumerator') {
        expect(ex.answer).toBe('0');
      }
    }
  });

  it('reciprocalProduct generates both numeric and variable subtypes', () => {
    const subtypes = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 5);
      if (d(ex).triviaType === 'reciprocalProduct') {
        subtypes.add(d(ex).triviaSubType ?? '');
      }
    }
    expect(subtypes.has('num')).toBe(true);
    expect(subtypes.has('var')).toBe(true);
  });

  it('reciprocalProduct numeric has coprime triviaA and triviaB', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateFractionTrivia(seed, 4);
      if (d(ex).triviaType === 'reciprocalProduct' && d(ex).triviaSubType === 'num') {
        const a = d(ex).triviaA!;
        const b = d(ex).triviaB!;
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(9);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
        const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
        expect(gcd(a, b)).toBe(1);
      }
    }
  });

  it('reciprocalProduct answer is always 1', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 5);
      if (d(ex).triviaType === 'reciprocalProduct') {
        expect(ex.answer).toBe('1');
      }
    }
  });

  it('at complexity 3-5, includes reciprocalProduct', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 4);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('reciprocalProduct')).toBe(true);
  });

  it('at complexity 6-7, includes negativeSignPlacement', () => {
    const found = new Set<string>();
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateFractionTrivia(seed, 6);
      found.add(d(ex).triviaType!);
    }
    expect(found.has('negativeSignPlacement')).toBe(true);
  });

  it('negativeSignPlacement shows 3 options at low complexity, 4 at high', () => {
    for (let seed = 0; seed < 50; seed++) {
      const exLow = generateFractionTrivia(seed, 4);
      if (d(exLow).triviaType === 'negativeSignPlacement') {
        expect(d(exLow).triviaOptionsLatex!.length).toBe(3);
      }
      const exHigh = generateFractionTrivia(seed, 9);
      if (d(exHigh).triviaType === 'negativeSignPlacement') {
        expect(d(exHigh).triviaOptionsLatex!.length).toBe(4);
      }
    }
  });

  it('negativeSignPlacement generates both variable and number variants', () => {
    const hasVars = new Set<boolean>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 7);
      if (d(ex).triviaType === 'negativeSignPlacement') {
        hasVars.add(d(ex).triviaA === undefined);
      }
    }
    expect(hasVars.has(true)).toBe(true);
    expect(hasVars.has(false)).toBe(true);
  });

  it('negativeSignPlacement has at least one correct option in shown set', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 7);
      if (d(ex).triviaType === 'negativeSignPlacement') {
        const indices = ex.answer.split(',').map(Number);
        expect(indices.length).toBeGreaterThanOrEqual(1);
        const optCount = d(ex).triviaOptionsLatex!.length;
        for (const idx of indices) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(optCount);
        }
      }
    }
  });
});

describe('validateFractionTrivia', () => {
  it('accepts correct answer for all types', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 5);
      expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
    }
  });

  it('rejects wrong answer for all types', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateFractionTrivia(seed, 5);
      const wrong = ex.answer + ',999';
      expect(validateFractionTrivia(wrong, ex)).toBe(false);
    }
  });

  describe('fractionTerms', () => {
    it('accepts English answer', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('numerator,denominator', ex)).toBe(true);
    });

    it('accepts German answer', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('zähler,nenner', ex)).toBe(true);
    });

    it('accepts German answer without umlaut', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('zahler,nenner', ex)).toBe(true);
    });

    it('rejects swapped answer', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('denominator,numerator', ex)).toBe(false);
    });

    it('accepts with extra whitespace', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('  Numerator ,  Denominator  ', ex)).toBe(true);
    });

    it('rejects single word', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('numerator', ex)).toBe(false);
    });

    it('rejects empty string', () => {
      const ex = generateFractionTrivia(42, 0);
      ex.data = { triviaType: 'fractionTerms' };
      ex.answer = 'numerator,denominator';
      expect(validateFractionTrivia('', ex)).toBe(false);
    });
  });

  describe('integerFractions', () => {
    it('correct answer is 0,3', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 1);
        if (d(ex).triviaType === 'integerFractions') {
          expect(ex.answer).toBe('0,3');
        }
      }
    });

    it('rejects partial selection', () => {
      const ex = generateFractionTrivia(42, 1);
      ex.data = { triviaType: 'integerFractions' };
      ex.answer = '0,3';
      expect(validateFractionTrivia('0', ex)).toBe(false);
      expect(validateFractionTrivia('3', ex)).toBe(false);
    });

    it('rejects wrong selection', () => {
      const ex = generateFractionTrivia(42, 1);
      ex.data = { triviaType: 'integerFractions' };
      ex.answer = '0,3';
      expect(validateFractionTrivia('1,2', ex)).toBe(false);
    });
  });

  describe('equalFractions', () => {
    it('correct indices are valid', () => {
      for (let seed = 0; seed < 200; seed++) {
        const ex = generateFractionTrivia(seed, 9);
        if (d(ex).triviaType === 'equalFractions') {
          const indices = ex.answer.split(',').map(Number);
          const optCount = d(ex).triviaOptionsLatex!.length;
          expect(indices.length).toBeGreaterThanOrEqual(1);
          expect(indices.length).toBeLessThanOrEqual(3);
          for (const idx of indices) {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(optCount);
          }
        }
      }
    });

    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 9);
        if (d(ex).triviaType === 'equalFractions') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects all selected', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 9);
        if (d(ex).triviaType === 'equalFractions') {
          const count = d(ex).triviaOptionsLatex!.length;
          const allSelected = Array.from({ length: count }, (_, i) => i).join(',');
          if (allSelected !== ex.answer) {
            expect(validateFractionTrivia(allSelected, ex)).toBe(false);
          }
        }
      }
    });
  });

  describe('reducibleFractions', () => {
    it('generates with triviaOptionsLatex', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'reducibleFractions') {
          expect(d(ex).triviaOptionsLatex).toBeDefined();
          expect(d(ex).triviaOptionsLatex!.length).toBeGreaterThanOrEqual(3);
          expect(d(ex).triviaOptionsLatex!.length).toBeLessThanOrEqual(4);
        }
      }
    });

    it('shows 3 options at low complexity, 4 at high', () => {
      for (let seed = 0; seed < 50; seed++) {
        const exLow = generateFractionTrivia(seed, 4);
        if (d(exLow).triviaType === 'reducibleFractions') {
          expect(d(exLow).triviaOptionsLatex!.length).toBe(3);
        }
        const exHigh = generateFractionTrivia(seed, 7);
        if (d(exHigh).triviaType === 'reducibleFractions') {
          expect(d(exHigh).triviaOptionsLatex!.length).toBe(4);
        }
      }
    });

    it('correct answer contains valid indices for shown options', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'reducibleFractions') {
          const indices = ex.answer.split(',').map(Number);
          const optCount = d(ex).triviaOptionsLatex!.length;
          for (const idx of indices) {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(optCount);
          }
        }
      }
    });

    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'reducibleFractions') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });
  });

  describe('mediant', () => {
    it('correct answer contains valid indices (0-3)', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'mediant') {
          const indices = ex.answer.split(',').map(Number);
          for (const idx of indices) {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThanOrEqual(3);
          }
        }
      }
    });

    it('average variant has both 2 and 3 as correct', () => {
      let found = false;
      for (let seed = 0; seed < 1000; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'mediant' && ex.answer === '2,3') {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('rejects partially correct selection', () => {
      const ex = generateFractionTrivia(42, 7);
      if (d(ex).triviaType === 'mediant') {
        const indices = ex.answer.split(',').map(Number);
        if (indices.length > 1) {
          const partial = String(indices[0]);
          expect(validateFractionTrivia(partial, ex)).toBe(false);
        }
      }
    });

    it('rejects wrong index', () => {
      const ex = generateFractionTrivia(42, 7);
      if (d(ex).triviaType === 'mediant' && ex.answer !== '2,3') {
        const indices = ex.answer.split(',').map(Number);
        const wrong = String((indices[0] + 1) % 4);
        expect(validateFractionTrivia(wrong, ex)).toBe(false);
      }
    });
  });

  describe('fractionDivision', () => {
    it('accepts correct fraction', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 4);
        if (d(ex).triviaType === 'fractionDivision') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects swapped fraction', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 4);
        if (d(ex).triviaType === 'fractionDivision' && d(ex).triviaA !== d(ex).triviaB) {
          const swapped = `${d(ex).triviaA},${d(ex).triviaB}`;
          expect(validateFractionTrivia(swapped, ex)).toBe(false);
        }
      }
    });

    it('rejects denominator 0', () => {
      const ex = generateFractionTrivia(42, 4);
      ex.data = { triviaType: 'fractionDivision', triviaA: 2, triviaB: 3 };
      ex.answer = '3,2';
      expect(validateFractionTrivia('3,0', ex)).toBe(false);
    });

    it('rejects non-numeric input', () => {
      const ex = generateFractionTrivia(42, 4);
      ex.data = { triviaType: 'fractionDivision', triviaA: 2, triviaB: 3 };
      ex.answer = '3,2';
      expect(validateFractionTrivia('abc,def', ex)).toBe(false);
    });
  });

  describe('denominatorRestriction', () => {
    it('correct answer is 0', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 1);
        if (d(ex).triviaType === 'denominatorRestriction') {
          expect(ex.answer).toBe('0');
        }
      }
    });

    it('rejects non-zero answer', () => {
      const ex = generateFractionTrivia(42, 1);
      ex.data = { triviaType: 'denominatorRestriction' };
      ex.answer = '0';
      expect(validateFractionTrivia('1', ex)).toBe(false);
    });
  });

  describe('doubleFraction', () => {
    it('doubleNum answer is 0', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 0);
        if (d(ex).triviaType === 'doubleFraction' && d(ex).triviaSubType === 'doubleNum') {
          expect(ex.answer).toBe('0');
        }
      }
    });

    it('halveDen answer is 1', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 0);
        if (d(ex).triviaType === 'doubleFraction' && d(ex).triviaSubType === 'halveDen') {
          expect(ex.answer).toBe('1');
        }
      }
    });

    it('rejects wrong answer for all doubleFraction variants', () => {
      for (let seed = 0; seed < 200; seed++) {
        const ex = generateFractionTrivia(seed, 0);
        if (d(ex).triviaType === 'doubleFraction') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
          expect(validateFractionTrivia(ex.answer + ',999', ex)).toBe(false);
        }
      }
    });
  });

  describe('multiplySame', () => {
    it('correct answer is 0 for default, 3 for reciprocal', () => {
      for (let seed = 0; seed < 200; seed++) {
        const ex = generateFractionTrivia(seed, 6);
        if (d(ex).triviaType === 'multiplySame') {
          if (d(ex).triviaSubType === 'reciprocal') {
            expect(ex.answer).toBe('3');
          } else {
            expect(ex.answer).toBe('0');
          }
        }
      }
    });

    it('validates own answer for both variants', () => {
      for (let seed = 0; seed < 200; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'multiplySame') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('reciprocal subtype generates at complexity 5+', () => {
      const subtypes = new Set<string>();
      for (let seed = 0; seed < 500; seed++) {
        const ex = generateFractionTrivia(seed, 6);
        if (d(ex).triviaType === 'multiplySame') {
          subtypes.add(d(ex).triviaSubType ?? 'default');
        }
      }
      expect(subtypes.has('reciprocal')).toBe(true);
      expect(subtypes.has('default')).toBe(true);
    });
  });

  describe('fractionBar', () => {
    it('correct answer is 3', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 1);
        if (d(ex).triviaType === 'fractionBar') {
          expect(ex.answer).toBe('3');
        }
      }
    });

    it('rejects other operations', () => {
      const ex = generateFractionTrivia(42, 1);
      ex.data = { triviaType: 'fractionBar' };
      ex.answer = '3';
      expect(validateFractionTrivia('0', ex)).toBe(false);
      expect(validateFractionTrivia('1', ex)).toBe(false);
      expect(validateFractionTrivia('2', ex)).toBe(false);
    });
  });

  describe('zeroNumerator', () => {
    it('correct answer is 0', () => {
      for (let seed = 0; seed < 50; seed++) {
        const ex = generateFractionTrivia(seed, 1);
        if (d(ex).triviaType === 'zeroNumerator') {
          expect(ex.answer).toBe('0');
        }
      }
    });

    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 1);
        if (d(ex).triviaType === 'zeroNumerator') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects non-zero answer', () => {
      const ex = generateFractionTrivia(42, 1);
      ex.data = { triviaType: 'zeroNumerator' };
      ex.answer = '0';
      expect(validateFractionTrivia('1', ex)).toBe(false);
    });
  });

  describe('reciprocalProduct', () => {
    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 4);
        if (d(ex).triviaType === 'reciprocalProduct') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects wrong answer', () => {
      const ex = generateFractionTrivia(42, 4);
      ex.data = { triviaType: 'reciprocalProduct' };
      ex.answer = '1';
      expect(validateFractionTrivia('0', ex)).toBe(false);
      expect(validateFractionTrivia('2', ex)).toBe(false);
    });
  });

  describe('negativeSignPlacement', () => {
    it('correct indices are valid', () => {
      for (let seed = 0; seed < 200; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'negativeSignPlacement') {
          const indices = ex.answer.split(',').map(Number);
          const optCount = d(ex).triviaOptionsLatex!.length;
          expect(indices.length).toBeGreaterThanOrEqual(1);
          expect(indices.length).toBeLessThanOrEqual(3);
          for (const idx of indices) {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(optCount);
          }
        }
      }
    });

    it('validates its own generated answer', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'negativeSignPlacement') {
          expect(validateFractionTrivia(ex.answer, ex)).toBe(true);
        }
      }
    });

    it('rejects all selected when some are wrong', () => {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateFractionTrivia(seed, 7);
        if (d(ex).triviaType === 'negativeSignPlacement') {
          const count = d(ex).triviaOptionsLatex!.length;
          const allSelected = Array.from({ length: count }, (_, i) => i).join(',');
          if (allSelected !== ex.answer) {
            expect(validateFractionTrivia(allSelected, ex)).toBe(false);
          }
        }
      }
    });

    it('rejects wrong selection', () => {
      const ex = generateFractionTrivia(42, 7);
      if (d(ex).triviaType === 'negativeSignPlacement') {
        const indices = ex.answer.split(',').map(Number);
        const wrong = String((indices[0] + 1) % 6);
        if (wrong !== ex.answer) {
          expect(validateFractionTrivia(wrong, ex)).toBe(false);
        }
      }
    });
  });
});
