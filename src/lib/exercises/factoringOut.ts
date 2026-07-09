import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt } from '../math/rng';
import type { VarMap, FactorOption } from '../math/varmap';
import { varMapMultiply, varMapUnicode, gcdArray, buildFactorOptions, formatExpandedTerm } from '../math/varmap';

const ALL_VARS = ['x', 'y', 'z', 'a', 'b', 'c'];

interface FactoringOutData {
  isTrap: boolean;
  factorOptions: FactorOption[];
  correctIdx: number;
  gcfCoeff: number;
  expectedInnerCoeffs: number[];
}

function generateTrap(rng: () => number, numTerms: number, maxDegree: number): Exercise {
  const varPool = [...ALL_VARS].sort(() => rng() - 0.5);

  const terms: { coeff: number; vars: VarMap }[] = [];
  let varIdx = 0;

  for (let i = 0; i < numTerms; i++) {
    const remaining = numTerms - i;
    const varsForTerm = Math.min(
      remaining === 1
        ? varPool.length - varIdx
        : randInt(rng, 1, Math.min(2, varPool.length - varIdx - (remaining - 1))),
      varPool.length - varIdx,
    );

    const selectedVars = varPool.slice(varIdx, varIdx + varsForTerm);
    varIdx += varsForTerm;

    const vars: VarMap = {};
    let degree = 0;
    for (let j = 0; j < selectedVars.length; j++) {
      const maxExp =
        j === selectedVars.length - 1
          ? Math.max(1, maxDegree - degree)
          : randInt(rng, 1, Math.max(1, maxDegree - degree - (selectedVars.length - j - 1)));
      const exp = Math.min(maxExp, maxDegree - degree);
      vars[selectedVars[j]] = exp;
      degree += exp;
    }

    const coeff = randInt(rng, 1, 9);
    terms.push({ coeff, vars });
  }

  let innerGcd = gcdArray(terms.map((t) => t.coeff));
  while (innerGcd > 1) {
    for (const t of terms) {
      t.coeff = Math.floor(t.coeff / innerGcd);
    }
    innerGcd = gcdArray(terms.map((t) => t.coeff));
  }

  const allVarParts = terms.map((t) => t.vars);

  const promptParts: string[] = [];
  for (let i = 0; i < terms.length; i++) {
    promptParts.push(formatExpandedTerm(terms[i].coeff, terms[i].vars, i === 0));
  }

  const options = buildFactorOptions(allVarParts);
  const data: FactoringOutData = {
    isTrap: true,
    factorOptions: options,
    correctIdx: -1,
    gcfCoeff: 0,
    expectedInnerCoeffs: [],
  };

  return {
    prompt: promptParts.join(''),
    answer: '-1',
    data: data as unknown as Exercise['data'],
  };
}

function generateNormal(rng: () => number, numTerms: number, maxDegree: number, hasCoeff: boolean): Exercise {
  const gcfCoeff = hasCoeff && rng() > 0.3 ? randInt(rng, 2, 5) : 1;

  const numGcfVars = rng() > 0.5 ? 1 : 2;
  let gcfDegree = randInt(rng, Math.max(1, maxDegree - 1), maxDegree);
  if (gcfDegree < 1) gcfDegree = 1;

  const varPool = [...ALL_VARS].sort(() => rng() - 0.5);
  const gcfVars = varPool.slice(0, numGcfVars);
  const gcf: VarMap = {};
  let assignedDegree = 0;
  for (let i = 0; i < gcfVars.length; i++) {
    const remainingVars = gcfVars.length - i - 1;
    const maxExp = gcfDegree - assignedDegree - remainingVars;
    const exp = i === gcfVars.length - 1 ? gcfDegree - assignedDegree : randInt(rng, 1, Math.max(1, maxExp));
    gcf[gcfVars[i]] = exp;
    assignedDegree += exp;
  }

  const innerVarPool = varPool.slice(numGcfVars);
  if (innerVarPool.length < numTerms) {
    innerVarPool.push(...varPool.slice(0, numTerms - innerVarPool.length));
  }

  const innerVars: string[] = [];
  const available = [...innerVarPool];
  for (let i = 0; i < numTerms; i++) {
    const idx = Math.floor(rng() * available.length);
    innerVars.push(available[idx]);
    available.splice(idx, 1);
  }

  const innerCoeffs: number[] = [];
  let innerGcd = 0;
  for (let attempt = 0; attempt < 50; attempt++) {
    const trial: number[] = [];
    for (let i = 0; i < numTerms; i++) {
      trial.push(randInt(rng, 1, 9));
    }
    const g = gcdArray(trial);
    if (g === 1) {
      innerCoeffs.push(...trial);
      innerGcd = 1;
      break;
    }
  }
  if (innerGcd !== 1) {
    for (let i = 0; i < numTerms; i++) {
      innerCoeffs.push(randInt(rng, 1, 5));
    }
    let g = gcdArray(innerCoeffs);
    while (g > 1) {
      for (let i = 0; i < innerCoeffs.length; i++) {
        innerCoeffs[i] = Math.floor(innerCoeffs[i] / g);
      }
      g = gcdArray(innerCoeffs);
    }
  }

  const innerVarMaps: VarMap[] = innerVars.map((v) => ({ [v]: 1 }));

  const termVarParts: VarMap[] = innerVarMaps.map((iv) => varMapMultiply(gcf, iv));
  const termCoeffs: number[] = innerCoeffs.map((c) => gcfCoeff * c);

  const promptParts: string[] = [];
  for (let i = 0; i < termCoeffs.length; i++) {
    promptParts.push(formatExpandedTerm(termCoeffs[i], termVarParts[i], i === 0));
  }

  const options = buildFactorOptions(termVarParts);
  const gcfVarText = varMapUnicode(gcf);

  let correctIdx = -1;
  for (let i = 0; i < options.length; i++) {
    if (options[i].text === gcfVarText) {
      correctIdx = i;
      break;
    }
  }

  const data: FactoringOutData = {
    isTrap: false,
    factorOptions: options,
    correctIdx,
    gcfCoeff,
    expectedInnerCoeffs: innerCoeffs,
  };

  return {
    prompt: promptParts.join(''),
    answer: `${correctIdx},${gcfCoeff},${innerCoeffs.join(',')}`,
    data: data as unknown as Exercise['data'],
  };
}

export function generateFactoringOut(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = Math.min(Math.max(complexity, 0), 10);

  const maxDegree = clamped <= 2 ? 1 : clamped <= 5 ? 2 : clamped <= 8 ? 3 : 4;
  const hasCoefficient = clamped >= 7 && rng() > 0.5;
  const numTerms = clamped >= 7 && rng() > 0.5 ? 3 : 2;
  const isTrap = rng() < 0.08;

  if (isTrap) {
    return generateTrap(rng, numTerms, maxDegree);
  }

  return generateNormal(rng, numTerms, maxDegree, hasCoefficient);
}

export function formatFactoredLatex(
  gcfCoeff: number,
  gcfLatex: string,
  innerCoeffs: number[],
  innerVarParts: string[],
): string {
  const hasGcfVars = !!gcfLatex;
  let gcfStr: string;
  if (gcfCoeff === 1 && hasGcfVars) {
    gcfStr = gcfLatex;
  } else if (gcfCoeff === 1 && !hasGcfVars) {
    gcfStr = '1';
  } else {
    gcfStr = `${gcfCoeff}${hasGcfVars ? '\\,' + gcfLatex : ''}`;
  }

  const innerParts: string[] = [];
  for (let i = 0; i < innerCoeffs.length; i++) {
    const c = innerCoeffs[i];
    const v = innerVarParts[i];
    let termStr: string;
    if (c === 1 && v) {
      termStr = v;
    } else if (c === -1 && v) {
      termStr = '-' + v;
    } else if (v) {
      termStr = `${c}\\,${v}`;
    } else {
      termStr = String(c);
    }
    innerParts.push(termStr);
  }

  return `${gcfStr}(${innerParts.join(' + ')})`;
}

export function validateFactoringOut(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as unknown as FactoringOutData;
  if (!data) return false;

  const isNoFactor = answer === '-1';

  if (data.isTrap) {
    return isNoFactor;
  }

  if (isNoFactor) return false;

  const parts = answer.split(',');
  if (parts.length < 2) return false;

  const monoIdx = parseInt(parts[0], 10);
  if (monoIdx !== data.correctIdx) return false;

  const coeffA = parseInt(parts[1], 10);
  if (coeffA !== data.gcfCoeff) return false;

  const userInner = parts.slice(2).map((s) => parseInt(s.trim(), 10));
  const expected = data.expectedInnerCoeffs;
  if (userInner.length !== expected.length) return false;

  return userInner.every((c, i) => c === expected[i]);
}
