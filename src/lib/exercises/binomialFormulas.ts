import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { randInt, pick, randCoeff } from '../math/rng';
import { clampComplexity } from '../math/number';
import { reduceFrac, fracEqual } from '../math/fraction';

export interface BinomialFormulasData {
  fields: { variablePart: string }[];
  promptKey: DictKey;
}

function mulCoeff(a: [number, number], b: [number, number]): [number, number] {
  return reduceFrac(a[0] * b[0], a[1] * b[1]);
}

function squareCoeff(a: [number, number]): [number, number] {
  return mulCoeff(a, a);
}

function formatCoeff(num: number, den: number): string {
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

function promptTerm(num: number, den: number, varName: string): string {
  if (varName === '') return formatCoeff(num, den);
  if (den === 1) {
    if (num === 1) return varName;
    if (num === -1) return `-${varName}`;
    return `${num}${varName}`;
  }
  if (num % den === 0) {
    const n = num / den;
    if (n === 1) return varName;
    if (n === -1) return `-${varName}`;
    return `${n}${varName}`;
  }
  return `\\frac{${num}}{${den}}${varName}`;
}

const SINGLE_VARS = ['x', 'n', 't', 'a', 'b', 'm', 'p', 'q', 'r', 's', 'u', 'v'];
const VAR_PAIRS: [string, string][] = [
  ['x', 'y'],
  ['n', 'm'],
  ['a', 'b'],
  ['p', 'q'],
  ['s', 't'],
  ['u', 'v'],
];

interface FormulaResult {
  prompt: string;
  answer: string;
  fields: { variablePart: string }[];
}

function genSquareSum(anum: number, aden: number, bnum: number, bden: number, v: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const ab2 = mulCoeff([2, 1], mulCoeff([anum, aden], [bnum, bden]));
  const b2 = squareCoeff([bnum, bden]);
  return {
    prompt: `(${promptTerm(anum, aden, v)} + ${promptTerm(bnum, bden, '')})^{2}`,
    answer: [formatCoeff(...a2), formatCoeff(...ab2), formatCoeff(...b2)].join(','),
    fields: [{ variablePart: `${v}^{2}` }, { variablePart: v }, { variablePart: '' }],
  };
}

function genSquareDiff(anum: number, aden: number, bnum: number, bden: number, v: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const ab2 = mulCoeff([2, 1], mulCoeff([anum, aden], [bnum, bden]));
  const b2 = squareCoeff([bnum, bden]);
  const negAb2: [number, number] = [-ab2[0], ab2[1]];
  return {
    prompt: `(${promptTerm(anum, aden, v)} - ${promptTerm(bnum, bden, '')})^{2}`,
    answer: [formatCoeff(...a2), formatCoeff(...negAb2), formatCoeff(...b2)].join(','),
    fields: [{ variablePart: `${v}^{2}` }, { variablePart: v }, { variablePart: '' }],
  };
}

function genConjugate(anum: number, aden: number, bnum: number, bden: number, v: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const b2 = squareCoeff([bnum, bden]);
  const negB2: [number, number] = [-b2[0], b2[1]];
  return {
    prompt: `(${promptTerm(anum, aden, v)} + ${promptTerm(bnum, bden, '')})(${promptTerm(anum, aden, v)} - ${promptTerm(bnum, bden, '')})`,
    answer: [formatCoeff(...a2), formatCoeff(...negB2)].join(','),
    fields: [{ variablePart: `${v}^{2}` }, { variablePart: '' }],
  };
}

function genSquareSum2(anum: number, aden: number, bnum: number, bden: number, v1: string, v2: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const ab2 = mulCoeff([2, 1], mulCoeff([anum, aden], [bnum, bden]));
  const b2 = squareCoeff([bnum, bden]);
  return {
    prompt: `(${promptTerm(anum, aden, v1)} + ${promptTerm(bnum, bden, v2)})^{2}`,
    answer: [formatCoeff(...a2), formatCoeff(...ab2), formatCoeff(...b2)].join(','),
    fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v1}${v2}` }, { variablePart: `${v2}^{2}` }],
  };
}

function genSquareDiff2(anum: number, aden: number, bnum: number, bden: number, v1: string, v2: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const ab2 = mulCoeff([2, 1], mulCoeff([anum, aden], [bnum, bden]));
  const b2 = squareCoeff([bnum, bden]);
  const negAb2: [number, number] = [-ab2[0], ab2[1]];
  return {
    prompt: `(${promptTerm(anum, aden, v1)} - ${promptTerm(bnum, bden, v2)})^{2}`,
    answer: [formatCoeff(...a2), formatCoeff(...negAb2), formatCoeff(...b2)].join(','),
    fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v1}${v2}` }, { variablePart: `${v2}^{2}` }],
  };
}

function genConjugate2(anum: number, aden: number, bnum: number, bden: number, v1: string, v2: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const b2 = squareCoeff([bnum, bden]);
  const negB2: [number, number] = [-b2[0], b2[1]];
  return {
    prompt: `(${promptTerm(anum, aden, v1)} + ${promptTerm(bnum, bden, v2)})(${promptTerm(anum, aden, v1)} - ${promptTerm(bnum, bden, v2)})`,
    answer: [formatCoeff(...a2), formatCoeff(...negB2)].join(','),
    fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v2}^{2}` }],
  };
}

function genMixed(anum: number, aden: number, bnum: number, bden: number, v1: string, v2: string): FormulaResult {
  const a2 = squareCoeff([anum, aden]);
  const b2 = squareCoeff([bnum, bden]);
  const negA2: [number, number] = [-a2[0], a2[1]];
  return {
    prompt: `(${promptTerm(anum, aden, v1)} + ${promptTerm(bnum, bden, v2)})(${promptTerm(bnum, bden, v2)} - ${promptTerm(anum, aden, v1)})`,
    answer: [formatCoeff(...negA2), formatCoeff(...b2)].join(','),
    fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v2}^{2}` }],
  };
}

export function generateBinomialFormulas(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  const genTwoVar = (): Exercise => {
    const [v1, v2] = pick(rng, VAR_PAIRS);
    const variant = Math.floor(rng() * 4);

    for (let attempt = 0; attempt < 30; attempt++) {
      const aCoeff = randCoeff(rng, true);
      const bCoeff = randCoeff(rng, true);

      const result: FormulaResult = (() => {
        switch (variant) {
          case 0:
            return genSquareSum2(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v1, v2);
          case 1:
            return genSquareDiff2(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v1, v2);
          case 2:
            return genConjugate2(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v1, v2);
          default:
            return genMixed(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v1, v2);
        }
      })();

      const denomsOk = result.answer.split(',').every((s) => {
        const parts = s.split('/');
        if (parts.length === 2) return parseInt(parts[1], 10) <= 50;
        return true;
      });

      if (denomsOk) {
        return {
          prompt: result.prompt,
          answer: result.answer,
          pattern: 'multi-field',
          data: { fields: result.fields, promptKey: 'exercise.binomialFormulas.prompt' },
        };
      }
    }

    const fallbackA = randInt(rng, 1, 3);
    const fallbackB = randInt(rng, 1, 3);
    const fallback = genSquareSum2(fallbackA, 1, fallbackB, 1, v1, v2);
    return {
      prompt: fallback.prompt,
      answer: fallback.answer,
      pattern: 'multi-field',
      data: { fields: fallback.fields, promptKey: 'exercise.binomialFormulas.prompt' },
    };
  };

  const genSingleVar = (allowFrac: boolean): Exercise => {
    const v = pick(rng, SINGLE_VARS);
    const variant = Math.floor(rng() * 3);

    for (let attempt = 0; attempt < 30; attempt++) {
      const aCoeff = randCoeff(rng, allowFrac);
      const bCoeff = randCoeff(rng, allowFrac);

      const result: FormulaResult = (() => {
        switch (variant) {
          case 0:
            return genSquareSum(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v);
          case 1:
            return genSquareDiff(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v);
          default:
            return genConjugate(aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], v);
        }
      })();

      const denomsOk = result.answer.split(',').every((s) => {
        const parts = s.split('/');
        if (parts.length === 2) return parseInt(parts[1], 10) <= 50;
        return true;
      });

      if (denomsOk) {
        return {
          prompt: result.prompt,
          answer: result.answer,
          pattern: 'multi-field',
          data: { fields: result.fields, promptKey: 'exercise.binomialFormulas.prompt' },
        };
      }
    }

    const fallbackA = randInt(rng, 1, 3);
    const fallbackB = randInt(rng, 1, 3);
    const fallback = genSquareSum(fallbackA, 1, fallbackB, 1, v);
    return {
      prompt: fallback.prompt,
      answer: fallback.answer,
      pattern: 'multi-field',
      data: { fields: fallback.fields, promptKey: 'exercise.binomialFormulas.prompt' },
    };
  };

  if (clamped <= 4) {
    return genSingleVar(false);
  }

  return rng() > 0.5 ? genSingleVar(true) : genTwoVar();
}

export function validateBinomialFormulas(answer: string, exercise: Exercise): boolean {
  const userParts = answer.split(',').map((s) => s.trim());
  const correctParts = exercise.answer.split(',').map((s) => s.trim());

  if (userParts.length !== correctParts.length) return false;

  for (let i = 0; i < userParts.length; i++) {
    if (!fracEqual(userParts[i], correctParts[i])) return false;
  }
  return true;
}
