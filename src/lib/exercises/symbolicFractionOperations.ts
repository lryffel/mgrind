import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity, gcd } from '../math/number';
import { randInt, pickDistinct } from '../math/rng';
import { VAR_POOL } from '../math/varpool';
import { validateSymbolicFraction as validateSimplifySymbolicFraction } from '../validation';

const DENOMINATOR_POOL = [2, 3, 4, 6, 12, 18, 24];

function pickDenominator(rng: () => number, maxDen: number): number {
  const filtered = DENOMINATOR_POOL.filter((d) => d <= maxDen);
  return filtered[Math.floor(rng() * filtered.length)];
}

export interface SymbolicFractionOperationsData {
  subtype: string;
  mode: 'fraction';
  variableNames: string[];
  fields: { variablePart: string }[];
  denominatorFields: { variablePart: string }[];
  promptKey: string;
  expectedAnswer: string;
  isZero?: boolean;
  isConstant?: boolean;
}

type Subtype =
  | 'mul-sym'
  | 'add-sym'
  | 'div-sym'
  | 'sub-sym'
  | 'mixed-numeric-symbolic'
  | 'cross-mul'
  | 'mixed-add-sub'
  | 'cross-add'
  | 'cross-sub'
  | 'multi-term-num'
  | 'multi-term-num-mixed';

const SUBTYPE_PROMPT_KEYS: Record<Subtype, string> = {
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

interface TermPart {
  coeff: number;
  varName: string;
}

interface FractionOp {
  numTerms: TermPart[];
  den: number;
}

interface ResultTerm {
  coeff: number;
  varPart: string;
}

interface AxisParams {
  maxDen: number;
  maxCoeff: number;
}

function getAxisParams(level: number): AxisParams {
  if (level <= 2) return { maxDen: 6, maxCoeff: 5 };
  if (level <= 5) return { maxDen: 12, maxCoeff: 8 };
  if (level <= 8) return { maxDen: 18, maxCoeff: 10 };
  return { maxDen: 24, maxCoeff: 12 };
}

function pickVars(rng: () => number, count: number): string[] {
  return pickDistinct(rng, [...VAR_POOL], count);
}

function sortVars(s: string): string {
  return s.split('').sort().join('');
}

function formatMonomial(coeff: number, varLatex: string): string {
  if (coeff === 0) return '0';
  if (varLatex === '') return String(coeff);
  if (coeff === 1) return varLatex;
  if (coeff === -1) return `-${varLatex}`;
  return `${coeff}${varLatex}`;
}

function formatPoly(terms: TermPart[]): string {
  return terms
    .map((t, i) => {
      const absC = Math.abs(t.coeff);
      const sign = t.coeff < 0 ? '-' : i === 0 ? '' : '+';
      if (t.varName === '') return `${sign}${absC}`;
      if (absC === 1) return `${sign}${t.varName}`;
      return `${sign}${absC}${t.varName}`;
    })
    .join('');
}

function opLatex(op: FractionOp): string {
  if (op.numTerms.length === 1) {
    return `\\dfrac{${formatMonomial(op.numTerms[0].coeff, op.numTerms[0].varName)}}{${op.den}}`;
  }
  return `\\dfrac{${formatPoly(op.numTerms)}}{${op.den}}`;
}

function lcmProduct(dens: number[]): number {
  return dens.reduce((a, b) => a * b, 1);
}

function reduceResult(terms: ResultTerm[], den: number): { terms: ResultTerm[]; den: number } | null {
  const filtered = terms.filter((t) => t.coeff !== 0);
  if (filtered.length === 0) {
    return { terms: [{ coeff: 0, varPart: '' }], den: 1 };
  }

  let g = den;
  for (const t of filtered) {
    g = gcd(g, Math.abs(t.coeff));
  }

  const reducedDen = den / g;
  if (reducedDen === 1) return null;

  return {
    terms: filtered.map((t) => ({ ...t, coeff: t.coeff / g })),
    den: reducedDen,
  };
}

function buildExercise(
  result: ResultTerm[],
  den: number,
  subtype: Subtype,
  variables: string[],
  answerDenFields: { variablePart: string }[],
  denCoeff?: number,
): Exercise | null {
  const fields: { variablePart: string }[] = [];
  for (const t of result) {
    fields.push({ variablePart: t.varPart });
  }

  let answer: string;
  if (result.length === 1 && result[0].coeff === 0) {
    answer = '0;1';
  } else if (answerDenFields.length > 0 && answerDenFields[0].variablePart !== '') {
    const dc = denCoeff ?? 1;
    const denCoeffs = answerDenFields.map(() => String(dc)).join(',');
    answer = `${result.map((t) => t.coeff).join(',')};${denCoeffs}`;
  } else {
    answer = `${result.map((t) => t.coeff).join(',')};${den}`;
  }

  const data: SymbolicFractionOperationsData = {
    subtype,
    mode: 'fraction',
    variableNames: variables,
    fields,
    denominatorFields: answerDenFields,
    promptKey: SUBTYPE_PROMPT_KEYS[subtype],
    expectedAnswer: answer,
  };

  return {
    prompt: '',
    answer,
    pattern: 'custom',
    data,
  } as Exercise;
}

function genMulSym(rng: () => number, params: AxisParams): Exercise | null {
  const [v1, v2] = pickVars(rng, 2);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const prodDen = d1 * d2;
  const reduced = reduceResult([{ coeff: 1, varPart: sortVars(v1 + v2) }], prodDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v1 }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v2 }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'mul-sym', [v1, v2], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} \\cdot ${opLatex(op2)}`;
  return ex;
}

function genAddSym(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  let d2 = pickDenominator(rng, params.maxDen);
  for (let i = 0; i < 10 && d2 === d1; i++) {
    d2 = pickDenominator(rng, params.maxDen);
  }

  const commonDen = lcmProduct([d1, d2]);
  const numCoeff = commonDen / d1 + commonDen / d2;

  const reduced = reduceResult([{ coeff: numCoeff, varPart: v }], commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'add-sym', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} + ${opLatex(op2)}`;
  return ex;
}

function genDivSym(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  let d2 = pickDenominator(rng, params.maxDen);
  for (let i = 0; i < 10 && d2 === d1; i++) {
    d2 = pickDenominator(rng, params.maxDen);
  }

  const reduced = reduceResult([{ coeff: d2, varPart: '' }], d1);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'div-sym', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `\\dfrac{\\;${opLatex(op1)}\\;}{\\;${opLatex(op2)}\\;}`;
  return ex;
}

function genSubSym(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  let d2 = pickDenominator(rng, params.maxDen);
  for (let i = 0; i < 10 && d2 === d1; i++) {
    d2 = pickDenominator(rng, params.maxDen);
  }

  const commonDen = lcmProduct([d1, d2]);
  let numCoeff = commonDen / d1 - commonDen / d2;

  if (rng() < 0.3) {
    numCoeff = -(commonDen / d1 - commonDen / d2);
  }

  const reduced = reduceResult([{ coeff: numCoeff, varPart: v }], commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'sub-sym', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} - ${opLatex(op2)}`;
  return ex;
}

function genMixedNumericSymbolic(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const commonDen = lcmProduct([d1, d2]);
  const constCoeff = commonDen / d1;
  const varCoeff = commonDen / d2;

  const terms: ResultTerm[] = [
    { coeff: varCoeff, varPart: v },
    { coeff: constCoeff, varPart: '' },
  ];

  const reduced = reduceResult(terms, commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: '' }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'mixed-numeric-symbolic', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} + ${opLatex(op2)}`;
  return ex;
}

function genCrossMul(rng: () => number, params: AxisParams): Exercise | null {
  const vars = pickVars(rng, 4);
  const [v1, v2, v3, v4] = vars;

  const cNum1 = randInt(rng, 1, Math.min(params.maxCoeff, 5));
  const cDen1 = pickDenominator(rng, params.maxDen);
  const cNum2 = randInt(rng, 1, Math.min(params.maxCoeff, 5));
  const cDen2 = pickDenominator(rng, params.maxDen);

  const numCoeff = cNum1 * cNum2;
  const denCoeff = cDen1 * cDen2;

  const g = gcd(Math.abs(numCoeff), denCoeff);
  const rNumCoeff = numCoeff / g;
  const rDenCoeff = denCoeff / g;

  if (rDenCoeff === 1) return null;

  const op1Latex = `\\dfrac{${formatMonomial(cNum1, v1)}}{${cDen1}${v2}}`;
  const op2Latex = `\\dfrac{${formatMonomial(cNum2, v3)}}{${cDen2}${v4}}`;

  const ex = buildExercise(
    [{ coeff: rNumCoeff, varPart: sortVars(v1 + v3) }],
    rDenCoeff,
    'cross-mul',
    vars,
    [{ variablePart: sortVars(v2 + v4) }],
    rDenCoeff,
  );
  if (!ex) return null;
  ex.prompt = `${op1Latex} \\cdot ${op2Latex}`;
  return ex;
}

function genMixedAddSub(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);
  const d3 = pickDenominator(rng, params.maxDen);

  const commonDen = lcmProduct([d1, d2, d3]);
  const c1 = commonDen / d1;
  const c2 = commonDen / d2;
  let c3 = commonDen / d3;

  if (rng() < 0.5) {
    c3 = -c3;
  }

  const numCoeff = c1 + c2 + c3;
  const reduced = reduceResult([{ coeff: numCoeff, varPart: v }], commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d2 };
  const op3: FractionOp = { numTerms: [{ coeff: 1, varName: v }], den: d3 };
  const sign = c3 < 0 ? '-' : '+';

  const ex = buildExercise(reduced.terms, reduced.den, 'mixed-add-sub', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} + ${opLatex(op2)} ${sign} ${opLatex(op3)}`;
  return ex;
}

function genCrossAdd(rng: () => number, params: AxisParams): Exercise | null {
  const [v1, v2] = pickVars(rng, 2);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const commonDen = lcmProduct([d1, d2]);
  const c1 = commonDen / d1;
  const c2 = commonDen / d2;

  const terms: ResultTerm[] = [
    { coeff: c1, varPart: v1 },
    { coeff: c2, varPart: v2 },
  ];

  const reduced = reduceResult(terms, commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v1 }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v2 }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'cross-add', [v1, v2], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} + ${opLatex(op2)}`;
  return ex;
}

function genCrossSub(rng: () => number, params: AxisParams): Exercise | null {
  const [v1, v2] = pickVars(rng, 2);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const commonDen = lcmProduct([d1, d2]);
  const c1 = commonDen / d1;
  const c2 = -(commonDen / d2);

  const terms: ResultTerm[] = [
    { coeff: c1, varPart: v1 },
    { coeff: c2, varPart: v2 },
  ];

  const reduced = reduceResult(terms, commonDen);
  if (!reduced) return null;

  const op1: FractionOp = { numTerms: [{ coeff: 1, varName: v1 }], den: d1 };
  const op2: FractionOp = { numTerms: [{ coeff: 1, varName: v2 }], den: d2 };
  const ex = buildExercise(reduced.terms, reduced.den, 'cross-sub', [v1, v2], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} - ${opLatex(op2)}`;
  return ex;
}

function genMultiTermNum(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const cVar1 = randInt(rng, 1, params.maxCoeff);
  const cConst1 = randInt(rng, 1, Math.min(params.maxCoeff, 5));
  const cVar2 = randInt(rng, 1, params.maxCoeff);
  const cConst2 = randInt(rng, 1, Math.min(params.maxCoeff, 5));

  const commonDen = lcmProduct([d1, d2]);
  const varCoeff = cVar1 * (commonDen / d1) + cVar2 * (commonDen / d2);
  const constCoeff = cConst1 * (commonDen / d1) - cConst2 * (commonDen / d2);

  const terms: ResultTerm[] = [];
  if (varCoeff !== 0) terms.push({ coeff: varCoeff, varPart: v });
  if (constCoeff !== 0) terms.push({ coeff: constCoeff, varPart: '' });
  if (terms.length === 0) return null;

  const reduced = reduceResult(terms, commonDen);
  if (!reduced) return null;

  const op1: FractionOp = {
    numTerms: [
      { coeff: cVar1, varName: v },
      { coeff: cConst1, varName: '' },
    ],
    den: d1,
  };
  const op2: FractionOp = {
    numTerms: [
      { coeff: cVar2, varName: v },
      { coeff: -cConst2, varName: '' },
    ],
    den: d2,
  };

  const ex = buildExercise(reduced.terms, reduced.den, 'multi-term-num', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} + ${opLatex(op2)}`;
  return ex;
}

function genMultiTermNumMixed(rng: () => number, params: AxisParams): Exercise | null {
  const [v] = pickVars(rng, 1);
  const d1 = pickDenominator(rng, params.maxDen);
  const d2 = pickDenominator(rng, params.maxDen);

  const cVar1 = randInt(rng, 1, params.maxCoeff);
  const cConst1 = randInt(rng, 1, Math.min(params.maxCoeff, 5));
  const cVar2 = randInt(rng, 1, params.maxCoeff);
  const cConst2 = randInt(rng, 1, Math.min(params.maxCoeff, 5));

  const commonDen = lcmProduct([d1, d2]);
  const varCoeff = cVar1 * (commonDen / d1) - cVar2 * (commonDen / d2);
  const constCoeff = cConst1 * (commonDen / d1) + cConst2 * (commonDen / d2);

  const terms: ResultTerm[] = [];
  if (varCoeff !== 0) terms.push({ coeff: varCoeff, varPart: v });
  if (constCoeff !== 0) terms.push({ coeff: constCoeff, varPart: '' });
  if (terms.length === 0) return null;

  const reduced = reduceResult(terms, commonDen);
  if (!reduced) return null;

  const op1: FractionOp = {
    numTerms: [
      { coeff: cVar1, varName: v },
      { coeff: cConst1, varName: '' },
    ],
    den: d1,
  };
  const op2: FractionOp = {
    numTerms: [
      { coeff: cVar2, varName: v },
      { coeff: cConst2, varName: '' },
    ],
    den: d2,
  };

  const ex = buildExercise(reduced.terms, reduced.den, 'multi-term-num-mixed', [v], [{ variablePart: '' }]);
  if (!ex) return null;
  ex.prompt = `${opLatex(op1)} - ${opLatex(op2)}`;
  return ex;
}

const SUBTYPE_GENERATORS: Record<Subtype, (rng: () => number, params: AxisParams) => Exercise | null> = {
  'mul-sym': genMulSym,
  'add-sym': genAddSym,
  'div-sym': genDivSym,
  'sub-sym': genSubSym,
  'mixed-numeric-symbolic': genMixedNumericSymbolic,
  'cross-mul': genCrossMul,
  'mixed-add-sub': genMixedAddSub,
  'cross-add': genCrossAdd,
  'cross-sub': genCrossSub,
  'multi-term-num': genMultiTermNum,
  'multi-term-num-mixed': genMultiTermNumMixed,
};

function pickSubtype(level: number, rng: () => number): Subtype {
  if (level === 0) return 'mul-sym';
  if (level === 1) return rng() < 0.5 ? 'add-sym' : 'div-sym';
  if (level === 2) return rng() < 0.5 ? 'sub-sym' : 'mixed-numeric-symbolic';
  if (level <= 4) return 'cross-mul';
  if (level === 5) return 'mixed-add-sub';
  if (level === 6) return 'cross-add';
  if (level === 7) return 'cross-sub';
  if (level === 8) return 'multi-term-num';
  return 'multi-term-num-mixed';
}

export function generateSymbolicFractionOperations(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const params = getAxisParams(clamped);
  const subtype = pickSubtype(clamped, rng);
  const generator = SUBTYPE_GENERATORS[subtype];

  for (let attempt = 0; attempt < 20; attempt++) {
    const subRng = mulberry32(seed + attempt * 137 + 1);
    const result = generator(subRng, params);
    if (result !== null) return result;
  }

  const [v] = pickVars(mulberry32(seed + 9999), 1);
  return {
    prompt: `\\dfrac{${v}}{2} \\cdot \\dfrac{${v}}{3}`,
    answer: '1;6',
    pattern: 'custom',
    data: {
      subtype: 'mul-sym',
      mode: 'fraction',
      variableNames: [v],
      fields: [{ variablePart: v }],
      denominatorFields: [{ variablePart: '' }],
      promptKey: SUBTYPE_PROMPT_KEYS['mul-sym'],
      expectedAnswer: '1;6',
    } as SymbolicFractionOperationsData,
  };
}

export function validateSymbolicFractionOperations(answer: string, exercise: Exercise): boolean {
  return validateSimplifySymbolicFraction(answer, exercise);
}
