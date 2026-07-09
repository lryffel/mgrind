import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick } from '../math/rng';
import { formatExpandedTerm, varMapLatex, varMapIsEmpty, type VarMap } from '../math/varmap';
import { coeffLatex } from '../math/latex';
import { gcd } from '../math/number';
import { formatCollectingAnswer } from './collectingTerms';
import { fracEqual } from '../math/fraction';

export interface SimplifySymbolicFractionData {
  numFields: { variablePart: string }[];
  denFields: { variablePart: string }[];
  showFraction: boolean;
  promptKey: string;
}

const VARS = ['x', 'y', 'z', 'a', 'b'];

function monomialLatex(coeff: number, vars: VarMap): string {
  const varPart = varMapLatex(vars);
  if (!varPart) return String(coeff);
  return coeffLatex(coeff, 1, varPart);
}

function polyLatex(terms: { coeff: number; vars: VarMap }[]): string {
  return terms.map((t, i) => formatExpandedTerm(t.coeff, t.vars, i === 0)).join('');
}

function genMonomial(rng: () => number, clamped: number): Exercise {
  const numVars = clamped <= 4 ? 1 : rng() > 0.4 ? 1 : 2;
  const selectedVars: string[] = [];
  for (let i = 0; i < numVars; i++) {
    const v = pick(rng, VARS.filter((x) => !selectedVars.includes(x)));
    selectedVars.push(v);
  }

  const numVarsMap: VarMap = {};
  const denVarsMap: VarMap = {};
  let hasAnyVar = false;
  let hasVarDiff = false;

  for (const v of selectedVars) {
    const maxExp = clamped <= 3 ? 2 : clamped <= 6 ? 3 : 4;
    const numExp = randInt(rng, 0, maxExp);
    const denExp = randInt(rng, 0, maxExp);
    if (numExp > 0 || denExp > 0) {
      hasAnyVar = true;
      if (numExp !== denExp) hasVarDiff = true;
      if (numExp > 0) numVarsMap[v] = numExp;
      if (denExp > 0) denVarsMap[v] = denExp;
    }
  }

  const maxCoeff = clamped <= 3 ? 6 : clamped <= 6 ? 9 : 12;
  const numCoeff = randInt(rng, 2, maxCoeff);
  const denCoeff = randInt(rng, 2, maxCoeff);

  let g = gcd(numCoeff, denCoeff);
  const adjustedDen = !hasVarDiff && !hasAnyVar && g === 1 ? numCoeff * randInt(rng, 2, 4) : denCoeff;
  if (!hasVarDiff && !hasAnyVar && g === 1) g = numCoeff;

  const reducedNum = numCoeff / g;
  const reducedDen = adjustedDen / g;

  const remainingNumVars: VarMap = {};
  const remainingDenVars: VarMap = {};
  for (const v of selectedVars) {
    const nExp = numVarsMap[v] || 0;
    const dExp = denVarsMap[v] || 0;
    if (nExp > dExp) remainingNumVars[v] = nExp - dExp;
    if (dExp > nExp) remainingDenVars[v] = dExp - nExp;
  }

  const denVarEmpty = varMapIsEmpty(remainingDenVars);
  const showFraction = !(denVarEmpty && reducedDen === 1);

  const numLatex = monomialLatex(numCoeff, numVarsMap);
  const denLatex = monomialLatex(adjustedDen, denVarsMap);
  const prompt = `\\frac{${numLatex}}{${denLatex}}`;

  const numVarPart = varMapLatex(remainingNumVars);
  const denVarPart = varMapLatex(remainingDenVars);

  if (!showFraction) {
    const numFields = [{ variablePart: numVarPart }];
    const answer = String(reducedNum);
    const data: SimplifySymbolicFractionData = {
      numFields,
      denFields: [],
      showFraction: false,
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    };
    return { prompt, answer, data: data as unknown as Exercise['data'] };
  }

  const numFields = [{ variablePart: numVarPart }];
  const denFields = [{ variablePart: denVarPart }];
  const answer = `${reducedNum};${reducedDen}`;
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields,
    showFraction: true,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genAXoverBX(rng: () => number, clamped: number): Exercise {
  const numVars = rng() > 0.5 ? 1 : 2;
  const selectedVars: string[] = [];
  for (let i = 0; i < numVars; i++) {
    const v = pick(rng, VARS.filter((x) => !selectedVars.includes(x)));
    selectedVars.push(v);
  }

  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 2, 9);

  const maxExp = clamped <= 3 ? 2 : clamped <= 6 ? 3 : 4;
  const numVarsMap: VarMap = {};
  const denVarsMap: VarMap = {};
  for (const v of selectedVars) {
    const exp = randInt(rng, 1, maxExp);
    numVarsMap[v] = exp;
    denVarsMap[v] = exp;
  }

  const prompt = `\\frac{${monomialLatex(a, numVarsMap)}}{${monomialLatex(b, denVarsMap)}}`;

  const g = gcd(a, b);
  const reducedA = a / g;
  const reducedB = b / g;

  if (reducedB === 1) {
    const numFields = [{ variablePart: '' }];
    const answer = String(reducedA);
    const data: SimplifySymbolicFractionData = {
      numFields,
      denFields: [],
      showFraction: false,
      promptKey: 'exercise.simplifySymbolicFraction.axbxPrompt',
    };
    return { prompt, answer, data: data as unknown as Exercise['data'] };
  }

  const numFields = [{ variablePart: '' }];
  const denFields = [{ variablePart: '' }];
  const answer = `${reducedA};${reducedB}`;
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields,
    showFraction: true,
    promptKey: 'exercise.simplifySymbolicFraction.axbxPrompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genConstantFactoringOut(rng: () => number): Exercise {
  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 2, 7) * (rng() > 0.4 ? 1 : -1);

  const numTerms = [
    { coeff: a, vars: { x: 1 } as VarMap },
    { coeff: a * b, vars: {} as VarMap },
  ];
  const denTerms = [
    { coeff: 1, vars: { x: 1 } as VarMap },
    { coeff: b, vars: {} as VarMap },
  ];

  const prompt = `\\frac{${polyLatex(numTerms)}}{${polyLatex(denTerms)}}`;

  const numFields = [{ variablePart: '' }];
  const answer = String(a);
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields: [],
    showFraction: false,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genDiffOfSquares(rng: () => number): Exercise {
  const a = randInt(rng, 2, 7);
  const usePlus = rng() > 0.5;

  const numTerms = [
    { coeff: 1, vars: { x: 2 } as VarMap },
    { coeff: -(a * a), vars: {} as VarMap },
  ];
  const denTerms = [
    { coeff: 1, vars: { x: 1 } as VarMap },
    { coeff: usePlus ? a : -a, vars: {} as VarMap },
  ];

  const prompt = `\\frac{${polyLatex(numTerms)}}{${polyLatex(denTerms)}}`;

  const resultB = usePlus ? -a : a;

  const numFields: { variablePart: string }[] = [
    { variablePart: 'x' },
    { variablePart: '' },
  ];
  const answer = `1,${resultB}`;
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields: [],
    showFraction: false,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genQuadraticFactoring(rng: () => number): Exercise {
  let a = randInt(rng, -5, 5);
  let b = randInt(rng, -5, 5);
  while (a === 0 || b === 0 || a === b || Math.abs(a) <= 1 || Math.abs(b) <= 1) {
    a = randInt(rng, -5, 5);
    b = randInt(rng, -5, 5);
  }

  const sum = a + b;
  const prod = a * b;

  const numTerms = [
    { coeff: 1, vars: { x: 2 } as VarMap },
    { coeff: sum, vars: { x: 1 } as VarMap },
    { coeff: prod, vars: {} as VarMap },
  ];

  const useAasDen = rng() > 0.5;
  const denRoot = useAasDen ? a : b;
  const resultRoot = useAasDen ? b : a;

  const denTerms = [
    { coeff: 1, vars: { x: 1 } as VarMap },
    { coeff: denRoot, vars: {} as VarMap },
  ];

  const prompt = `\\frac{${polyLatex(numTerms)}}{${polyLatex(denTerms)}}`;

  const numFields: { variablePart: string }[] = [
    { variablePart: 'x' },
    { variablePart: '' },
  ];
  const answer = `1,${resultRoot}`;
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields: [],
    showFraction: false,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genVarGCF(rng: () => number): Exercise {
  const var1 = pick(rng, VARS);
  const var2 = pick(rng, VARS.filter((v) => v !== var1));

  const gcfVar: VarMap = { [var1]: 1, [var2]: 1 };
  const gcfCoeff = rng() > 0.4 ? randInt(rng, 2, 4) : 1;

  const inner1Coeff = randInt(rng, 1, 4);
  const inner2Coeff = randInt(rng, 1, 4) * (rng() > 0.5 ? 1 : -1);
  const inner1Var: VarMap = { [var1]: 1 };
  const inner2Var: VarMap = { [var2]: 1 };

  const term1Var = { ...gcfVar };
  for (const [k, v] of Object.entries(inner1Var)) {
    term1Var[k] = (term1Var[k] || 0) + v;
  }
  const term2Var = { ...gcfVar };
  for (const [k, v] of Object.entries(inner2Var)) {
    term2Var[k] = (term2Var[k] || 0) + v;
  }

  const numTerms = [
    { coeff: gcfCoeff * inner1Coeff, vars: term1Var },
    { coeff: gcfCoeff * inner2Coeff, vars: term2Var },
  ];

  const denTerms = [
    { coeff: inner1Coeff, vars: inner1Var },
    { coeff: inner2Coeff, vars: inner2Var },
  ];

  const prompt = `\\frac{${polyLatex(numTerms)}}{${polyLatex(denTerms)}}`;

  const resultVarPart = varMapLatex(gcfVar);
  const numFields = [{ variablePart: resultVarPart }];
  const answer = String(gcfCoeff);
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields: [],
    showFraction: false,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function genConstantFracFactoringOut(rng: () => number): Exercise {
  const a = randInt(rng, 2, 5);
  let c = randInt(rng, 2, 4);
  while (gcd(a, c) > 1) c = randInt(rng, 2, 4);
  const b = randInt(rng, 2, 5) * (rng() > 0.4 ? 1 : -1);

  const numTerms = [
    { coeff: a, vars: { x: 1 } as VarMap },
    { coeff: a * b, vars: {} as VarMap },
  ];
  const denTerms = [
    { coeff: c, vars: { x: 1 } as VarMap },
    { coeff: c * b, vars: {} as VarMap },
  ];

  const prompt = `\\frac{${polyLatex(numTerms)}}{${polyLatex(denTerms)}}`;

  const numFields = [{ variablePart: '' }];
  const denFields = [{ variablePart: '' }];
  const answer = `${a};${c}`;
  const data: SimplifySymbolicFractionData = {
    numFields,
    denFields,
    showFraction: true,
    promptKey: 'exercise.simplifySymbolicFraction.prompt',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

export function generateSimplifySymbolicFraction(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = Math.min(Math.max(complexity, 0), 10);

  const roll = rng();

  if (clamped <= 3) {
    if (roll < 0.35) return genConstantFactoringOut(rng);
    if (roll < 0.65) return genMonomial(rng, clamped);
    return genAXoverBX(rng, clamped);
  }

  if (clamped <= 6) {
    if (roll < 0.2) return genConstantFactoringOut(rng);
    if (roll < 0.4) return genDiffOfSquares(rng);
    if (roll < 0.6) return genMonomial(rng, clamped);
    if (roll < 0.8) return genQuadraticFactoring(rng);
    return genAXoverBX(rng, clamped);
  }

  if (roll < 0.15) return genDiffOfSquares(rng);
  if (roll < 0.3) return genQuadraticFactoring(rng);
  if (roll < 0.45) return genMonomial(rng, clamped);
  if (roll < 0.55) return genVarGCF(rng);
  if (roll < 0.75) return genConstantFracFactoringOut(rng);
  return genAXoverBX(rng, clamped);
}

export function validateSimplifySymbolicFraction(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as unknown as SimplifySymbolicFractionData | undefined;
  if (!data) return false;

  if (data.showFraction) {
    const parts = answer.split(';');
    if (parts.length !== 2) return false;
    const [userNum, userDen] = parts;
    const correctParts = exercise.answer.split(';');
    if (correctParts.length !== 2) return false;
    return fracEqual(userNum, correctParts[0]) && fracEqual(userDen, correctParts[1]);
  }

  const userParts = answer.split(',').map((s) => s.trim());
  const correctParts = exercise.answer.split(',').map((s) => s.trim());
  if (userParts.length !== correctParts.length) return false;
  for (let i = 0; i < userParts.length; i++) {
    if (!fracEqual(userParts[i], correctParts[i])) return false;
  }
  return true;
}

export function formatSymbolicResult(
  numCoeffs: string[],
  numVarParts: string[],
  denCoeffs: string[],
  denVarParts: string[],
  showFraction: boolean,
): string {
  const numLatex = formatCollectingAnswer(numCoeffs, numVarParts);
  if (!showFraction) return numLatex || '0';
  const denLatex = formatCollectingAnswer(denCoeffs, denVarParts);
  return `\\frac{${numLatex || '1'}}{${denLatex || '1'}}`;
}
