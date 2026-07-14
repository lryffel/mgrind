import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import {
  generateSymbolicFractionOperations,
  validateSymbolicFractionOperations,
  type SymbolicFractionOperationsData,
} from './symbolicFractionOperations';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function getData(ex: Exercise): SymbolicFractionOperationsData {
  return ex.data as SymbolicFractionOperationsData;
}

function getPromptKey(ex: Exercise): string {
  return getData(ex).promptKey;
}

const ALL_SUBTYPES = [
  'mul-sym',
  'add-sym',
  'div-sym',
  'sub-sym',
  'mixed-numeric-symbolic',
  'cross-mul',
  'mixed-add-sub',
  'cross-add',
  'cross-sub',
  'multi-term-num',
  'multi-term-num-mixed',
] as const;

const LEVEL_FOR_SUBTYPE: Record<string, number> = {
  'mul-sym': 0,
  'add-sym': 1,
  'div-sym': 1,
  'sub-sym': 2,
  'mixed-numeric-symbolic': 2,
  'cross-mul': 3,
  'mixed-add-sub': 5,
  'cross-add': 6,
  'cross-sub': 7,
  'multi-term-num': 8,
  'multi-term-num-mixed': 9,
};

describe('generateSymbolicFractionOperations', () => {
  for (const subtype of ALL_SUBTYPES) {
    const level = LEVEL_FOR_SUBTYPE[subtype];

    it(`${subtype}: deterministic for same seed and complexity`, () => {
      expectDeterministic(generateSymbolicFractionOperations, 42, level);
    });

    it(`${subtype}: seed variation produces different results`, () => {
      expectSeedVariation(generateSymbolicFractionOperations, level);
    });

    it(`${subtype}: has prompt and answer`, () => {
      expectHasPromptAndAnswer(generateSymbolicFractionOperations, 42, level);
    });

    it(`${subtype}: prompt contains LaTeX`, () => {
      const ex = generateSymbolicFractionOperations(42, level);
      expect(ex.prompt).toContain('\\dfrac');
    });

    it(`${subtype}: answer is a non-empty string`, () => {
      const ex = generateSymbolicFractionOperations(42, level);
      expect(ex.answer).toBeTruthy();
      expect(typeof ex.answer).toBe('string');
    });

    it(`${subtype}: data has correct fields`, () => {
      const ex = generateSymbolicFractionOperations(42, level);
      const data = getData(ex);
      expect(data.mode).toBe('fraction');
      expect(data.promptKey).toMatch(/^exercise\.symbolicFractionOperations/);
      expect(data.expectedAnswer).toBe(ex.answer);
      expect(data.variableNames.length).toBeGreaterThanOrEqual(1);
    });
  }

  it('all subtypes answer format matches field count', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let level = 0; level <= 10; level++) {
        const ex = generateSymbolicFractionOperations(seed + level * 1000, level);
        const data = getData(ex);
        const [numStr, denStr] = ex.answer.split(';');
        expect(numStr).toBeDefined();
        expect(denStr).toBeDefined();
        const numParts = numStr.split(',').filter((s) => s !== '');
        const unused = data.denominatorFields[0]?.variablePart !== '' ? denStr.split(',').filter((s) => s !== '') : [];
        expect(numParts.length).toBe(data.fields.length);
        if (data.denominatorFields[0]?.variablePart !== '') {
          expect(unused.length).toBe(data.denominatorFields.length);
        }
        numParts.forEach((p) => {
          expect(p).toMatch(/^-?\d+$/);
        });
      }
    }
  });

  it('mul-sym appears at level 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 0);
      const data = getData(ex);
      expect(data.subtype).toBe('mul-sym');
    }
  });

  it('level 1 produces add-sym or div-sym', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 1);
      const data = getData(ex);
      expect(['add-sym', 'div-sym']).toContain(data.subtype);
      seen.add(data.subtype);
    }
    expect(seen.size).toBe(2);
  });

  it('level 2 produces sub-sym or mixed-numeric-symbolic', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 2);
      const data = getData(ex);
      expect(['sub-sym', 'mixed-numeric-symbolic']).toContain(data.subtype);
      seen.add(data.subtype);
    }
    expect(seen.size).toBe(2);
  });

  it('level 3-4 produces cross-mul', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 3);
      expect(getData(ex).subtype).toBe('cross-mul');
      const ex4 = generateSymbolicFractionOperations(seed, 4);
      expect(getData(ex4).subtype).toBe('cross-mul');
    }
  });

  it('level 5 produces mixed-add-sub', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 5);
      expect(getData(ex).subtype).toBe('mixed-add-sub');
    }
  });

  it('level 6 produces cross-add', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 6);
      expect(getData(ex).subtype).toBe('cross-add');
    }
  });

  it('level 7 produces cross-sub', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 7);
      expect(getData(ex).subtype).toBe('cross-sub');
    }
  });

  it('level 8 produces multi-term-num', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 8);
      expect(getData(ex).subtype).toBe('multi-term-num');
    }
  });

  it('level 9-10 produces multi-term-num-mixed', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 9);
      expect(getData(ex).subtype).toBe('multi-term-num-mixed');
      const ex10 = generateSymbolicFractionOperations(seed, 10);
      expect(getData(ex10).subtype).toBe('multi-term-num-mixed');
    }
  });

  it('no result has denominator 1 across 1000 random seeds', () => {
    for (let seed = 0; seed < 1000; seed++) {
      for (let level = 0; level <= 10; level++) {
        const ex = generateSymbolicFractionOperations(seed + level * 10000, level);
        const data = getData(ex);
        if (data.denominatorFields[0]?.variablePart !== '') continue;
        const [, denStr] = ex.answer.split(';');
        if (denStr) {
          const den = parseInt(denStr, 10);
          if (den === 1) {
            const num = parseInt(ex.answer.split(';')[0], 10);
            if (num !== 0 && num !== 1) {
              expect.fail(`Found denominator 1 at seed=${seed}, level=${level}: ${ex.answer}`);
            }
          }
        }
      }
    }
  });

  it('div-sym produces pure constant result (variable cancels)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 1);
      const data = getData(ex);
      if (data.subtype === 'div-sym') {
        const fields = data.fields;
        expect(fields.length).toBe(1);
        expect(fields[0].variablePart).toBe('');
      }
    }
  });

  it('sub-sym sometimes produces negative coefficient', () => {
    const seenNeg = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 2);
      const data = getData(ex);
      if (data.subtype === 'sub-sym') {
        const numCoeff = parseInt(ex.answer.split(';')[0], 10);
        if (numCoeff < 0) seenNeg.add(seed);
      }
    }
    expect(seenNeg.size).toBeGreaterThan(10);
  });

  it('cross-mul produces two-field answer with variable denominator', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 3);
      const data = getData(ex);
      expect(data.denominatorFields.length).toBe(1);
      expect(data.denominatorFields[0].variablePart).not.toBe('');
    }
  });

  it('multi-term-num has two fields (var + constant)', () => {
    const seenTwoField = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 8);
      const data = getData(ex);
      if (data.fields.length === 2) seenTwoField.add(seed);
    }
    expect(seenTwoField.size).toBeGreaterThan(50);
  });

  it('multi-term-num-mixed has two fields (var + constant)', () => {
    const seenTwoField = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 9);
      const data = getData(ex);
      if (data.fields.length === 2) seenTwoField.add(seed);
    }
    expect(seenTwoField.size).toBeGreaterThan(50);
  });

  it('complexity clamping: level below 0 is treated as 0', () => {
    const ex = generateSymbolicFractionOperations(42, -1);
    expect(getData(ex).subtype).toBe('mul-sym');
  });

  it('complexity clamping: level above 10 is treated as 10', () => {
    const ex = generateSymbolicFractionOperations(42, 15);
    const data = getData(ex);
    expect(['multi-term-num-mixed']).toContain(data.subtype);
  });

  it('prompt keys are correct per subtype', () => {
    const expectedKeys: Record<string, string> = {
      'mul-sym': 'exercise.symbolicFractionOperations.promptMul',
      'add-sym': 'exercise.symbolicFractionOperations.promptAdd',
      'div-sym': 'exercise.symbolicFractionOperations.promptDiv',
      'sub-sym': 'exercise.symbolicFractionOperations.promptSub',
      'mixed-numeric-symbolic': 'exercise.symbolicFractionOperations.promptCombine',
      'cross-mul': 'exercise.symbolicFractionOperations.promptMul',
      'mixed-add-sub': 'exercise.symbolicFractionOperations.promptCombine',
      'cross-add': 'exercise.symbolicFractionOperations.promptAdd',
      'cross-sub': 'exercise.symbolicFractionOperations.promptSub',
      'multi-term-num': 'exercise.symbolicFractionOperations.prompt',
      'multi-term-num-mixed': 'exercise.symbolicFractionOperations.prompt',
    };
    for (let seed = 0; seed < 200; seed++) {
      for (let level = 0; level <= 10; level++) {
        const ex = generateSymbolicFractionOperations(seed + level * 10000, level);
        const data = getData(ex);
        expect(getPromptKey(ex)).toBe(expectedKeys[data.subtype]);
      }
    }
  });
});

describe('validateSymbolicFractionOperations', () => {
  it('validates correct answer for fraction mode', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '5;6',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('5;6', ex)).toBe(true);
  });

  it('rejects wrong answer', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '5;6',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('3;6', ex)).toBe(false);
  });

  it('accepts equivalent fractions', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '5;6',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('10;12', ex)).toBe(true);
    expect(validateSymbolicFractionOperations('5;6', ex)).toBe(true);
  });

  it('validates multi-field numerator', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '4,3;12',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }, { variablePart: 'b' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('4,3;12', ex)).toBe(true);
    expect(validateSymbolicFractionOperations('8,6;24', ex)).toBe(true);
    expect(validateSymbolicFractionOperations('4,3;24', ex)).toBe(false);
  });

  it('validates cross-mul with variable denominator', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '1;1',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'ac' }],
        denominatorFields: [{ variablePart: 'bd' }],
        promptKey: 'exercise.symbolicFractionOperations.promptMul',
      },
    };
    expect(validateSymbolicFractionOperations('1;1', ex)).toBe(true);
    expect(validateSymbolicFractionOperations('2;2', ex)).toBe(true);
  });

  it('rejects wrong field count', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '4,3;12',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }, { variablePart: 'b' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('4;12', ex)).toBe(false);
    expect(validateSymbolicFractionOperations('4,3,1;12', ex)).toBe(false);
  });

  it('rejects empty answer', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '5;6',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('', ex)).toBe(false);
  });

  it('rejects extra semicolons', () => {
    const ex: Exercise = {
      prompt: '',
      answer: '5;6',
      data: {
        mode: 'fraction',
        fields: [{ variablePart: 'a' }],
        denominatorFields: [{ variablePart: '' }],
        promptKey: 'exercise.symbolicFractionOperations.promptAdd',
      },
    };
    expect(validateSymbolicFractionOperations('5;6;7', ex)).toBe(false);
  });

  it('validates cross-mul round trip', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateSymbolicFractionOperations(seed, 3);
      expect(validateSymbolicFractionOperations(ex.answer, ex)).toBe(true);
      const wrongAnswer = ex.answer === '1;1' ? '2;1' : '1;1';
      expect(validateSymbolicFractionOperations(wrongAnswer, ex)).toBe(false);
    }
  });

  it('validates all subtype round trips', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let level = 0; level <= 10; level++) {
        const ex = generateSymbolicFractionOperations(seed + level * 10000, level);
        expect(validateSymbolicFractionOperations(ex.answer, ex)).toBe(true);
        const num = parseInt(ex.answer.split(';')[0], 10);
        const wrong = `${num + 1};${ex.answer.split(';')[1]}`;
        expect(validateSymbolicFractionOperations(wrong, ex)).toBe(false);
      }
    }
  });
});
