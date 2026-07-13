import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pickDistinct, sampleExponent } from '../math/rng';
import type { VarMap, FactorOption } from '../math/varmap';
import {
  varMapGCF,
  varMapUnicode,
  varMapDivide,
  varMapIsEmpty,
  gcdArray,
  buildFactorOptions,
  formatExpandedTerm,
} from '../math/varmap';
import { VAR_POOL } from '../math/varpool';

export interface FactoringOutData {
  isTrap: boolean;
  factorOptions: FactorOption[];
  correctIdx: number;
  gcfCoeff: number;
  expectedInnerCoeffs: number[];
}

function generateTrap(rng: () => number, clamped: number): Exercise {
  const nVars = clamped <= 2 ? 2 : clamped <= 5 ? 3 : 4;
  const eMax = clamped <= 2 ? 2 : clamped <= 5 ? 3 : 4;
  const bias = clamped <= 2 ? 3.0 : clamped <= 5 ? 2.0 : 1.5;
  const nTerms = clamped <= 5 ? 2 : 3;

  for (let attempt = 0; attempt < 50; attempt++) {
    const vars = pickDistinct(rng, [...VAR_POOL], nVars);

    const terms: { coeff: number; vars: VarMap }[] = [];
    for (let t = 0; t < nTerms; t++) {
      const vm: VarMap = {};
      for (const v of vars) {
        const exp = sampleExponent(rng, eMax, bias);
        if (exp > 0) vm[v] = exp;
      }
      terms.push({ coeff: randInt(rng, 1, 9), vars: vm });
    }

    const gcfVarMap = varMapGCF(terms.map((t) => t.vars));
    if (!varMapIsEmpty(gcfVarMap)) continue;

    let coeffGcd = gcdArray(terms.map((t) => t.coeff));
    while (coeffGcd > 1) {
      for (const t of terms) t.coeff = Math.floor(t.coeff / coeffGcd);
      coeffGcd = gcdArray(terms.map((t) => t.coeff));
    }

    const allVarParts = terms.map((t) => t.vars);
    const options = buildFactorOptions(allVarParts);

    const promptParts = terms.map((t, i) => formatExpandedTerm(t.coeff, t.vars, i === 0));

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

  const vars = pickDistinct(rng, [...VAR_POOL], 2);
  const vms = vars.map((v) => ({ [v]: 1 }));
  const promptParts = vms.map((vm, i) => formatExpandedTerm(randInt(rng, 1, 5), vm, i === 0));
  return {
    prompt: promptParts.join(''),
    answer: '-1',
    data: {
      isTrap: true,
      factorOptions: [],
      correctIdx: -1,
      gcfCoeff: 0,
      expectedInnerCoeffs: [],
    } as unknown as Exercise['data'],
  };
}

function generateNormal(rng: () => number, clamped: number): Exercise {
  const eMax = clamped === 0 ? 2 : clamped <= 2 ? 3 : clamped <= 4 ? 4 : clamped <= 7 ? 4 : 5;
  const bias = clamped === 0 ? 3.0 : clamped <= 2 ? 2.5 : clamped <= 4 ? 2.0 : clamped <= 7 ? 1.5 : 1.0;
  const nTerms = clamped <= 5 ? 2 : 3;
  const nVars =
    clamped === 0
      ? 1
      : clamped === 1
        ? 1
        : clamped === 2
          ? rng() > 0.5
            ? 1
            : 2
          : clamped <= 4
            ? 2
            : clamped === 5
              ? rng() > 0.5
                ? 2
                : 3
              : clamped <= 9
                ? 3
                : rng() > 0.5
                  ? 3
                  : 4;
  const gcfMin = clamped === 0 ? 2 : 2;
  const gcfMax = clamped === 0 ? 3 : clamped <= 2 ? 4 : clamped <= 4 ? 5 : clamped <= 7 ? 7 : 9;
  const innerMin = 1;
  const innerMax = clamped <= 2 ? 7 : clamped <= 4 ? 9 : clamped <= 7 ? 10 : 12;

  for (let attempt = 0; attempt < 40; attempt++) {
    const vars = pickDistinct(rng, [...VAR_POOL], nVars);

    const termVarMaps: VarMap[] = [];
    for (let t = 0; t < nTerms; t++) {
      const vm: VarMap = {};
      for (const v of vars) {
        const exp = sampleExponent(rng, eMax, bias);
        if (exp > 0) vm[v] = exp;
      }
      termVarMaps.push(vm);
    }

    const gcfVarMap = varMapGCF(termVarMaps);
    if (varMapIsEmpty(gcfVarMap)) continue;

    const innerMaps = termVarMaps.map((tvm) => varMapDivide(tvm, gcfVarMap));
    if (innerMaps.some((im) => im === null || varMapIsEmpty(im))) continue;

    const gcfCoeff = randInt(rng, gcfMin, gcfMax);

    let innerCoeffs: number[] = [];
    let foundGcdOne = false;
    for (let ci = 0; ci < 30; ci++) {
      const trial = Array.from({ length: nTerms }, () => randInt(rng, innerMin, innerMax));
      if (gcdArray(trial) === 1) {
        innerCoeffs = trial;
        foundGcdOne = true;
        break;
      }
    }
    if (!foundGcdOne) {
      innerCoeffs = Array.from({ length: nTerms }, () => randInt(rng, innerMin, innerMax));
      let g = gcdArray(innerCoeffs);
      while (g > 1) {
        innerCoeffs = innerCoeffs.map((c) => Math.floor(c / g));
        g = gcdArray(innerCoeffs);
      }
    }

    const termCoeffs = innerCoeffs.map((c) => gcfCoeff * c);
    const allVarParts = termVarMaps;

    const promptParts = termCoeffs.map((c, i) => formatExpandedTerm(c, allVarParts[i], i === 0));

    const options = buildFactorOptions(allVarParts);
    const gcfVarText = varMapUnicode(gcfVarMap);

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

  const v = pickDistinct(rng, [...VAR_POOL], 1)[0];
  const termVms: VarMap[] = [{ [v]: 2 }, { [v]: 1 }];
  const prompt = formatExpandedTerm(8, { [v]: 2 }, true) + formatExpandedTerm(12, { [v]: 1 }, false);
  const options = buildFactorOptions(termVms);
  const gcfText = varMapUnicode({ [v]: 1 });
  let correctIdx = -1;
  for (let i = 0; i < options.length; i++) {
    if (options[i].text === gcfText) {
      correctIdx = i;
      break;
    }
  }
  const data: FactoringOutData = {
    isTrap: false,
    factorOptions: options,
    correctIdx,
    gcfCoeff: 4,
    expectedInnerCoeffs: [2, 3],
  };
  return { prompt, answer: `${correctIdx},4,2,3`, data: data as unknown as Exercise['data'] };
}

export function generateFactoringOut(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);
  const isTrap = rng() < 0.08;

  if (isTrap) return generateTrap(rng, clamped);
  return generateNormal(rng, clamped);
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

  if (data.isTrap) return isNoFactor;
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
