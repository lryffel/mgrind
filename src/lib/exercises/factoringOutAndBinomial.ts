import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick, pickExclude, randCoeff } from '../math/rng';
import { reduceFrac, fracEqual } from '../math/fraction';
import { cmd, coeffLatex } from '../math/latex';
import type { VarMap, FactorOption } from '../math/varmap';
import { varMapMultiply, varMapLatex, buildFactorOptions, varMapUnicode, gcd } from '../math/varmap';
import { formatFactoredLatex } from './factoringBinomialFormulas';

const INNER_VARS = ['a', 'b', 'c', 'd', 'k', '\\ell', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
const GCF_VARS = ['x', 'y', 'z'];

export interface FactoringOutAndBinomialData {
  formulaType: number;
  gcfCoeff: number;
  factorOptions: FactorOption[];
  correctGcfIdx: number;
  aNum: number;
  aDen: number;
  bNum: number;
  bDen: number;
  varA: string | null;
  varB: string;
  isTrap: boolean;
  termVarParts: string[];
  gcfVarLatex: string;
}

function innerTermVarMaps(formulaType: number, varA: string | null, varB: string): (VarMap | null)[] {
  const a2: VarMap = varA ? { [varA]: 2 } : {};
  const b2: VarMap = { [varB]: 2 };

  if (formulaType === 3) {
    return [a2, b2];
  }

  const ab: VarMap = varA ? { [varA]: 1, [varB]: 1 } : { [varB]: 1 };
  return [a2, ab, b2];
}

function buildPromptLaTeX(
  formulaType: number,
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
  gcfCoeff: number,
  gcfVarMap: VarMap | null,
  varA: string | null,
  varB: string,
): string {
  const a2 = reduceFrac(aNum * aNum, aDen * aDen);
  const b2 = reduceFrac(bNum * bNum, bDen * bDen);

  const gcfVarLatexPart = gcfVarMap ? varMapLatex(gcfVarMap) : '';
  const gcfLatexPrefix = gcfVarLatexPart;

  if (formulaType === 3) {
    const aVarPart = `${gcfLatexPrefix}${varA ? `${cmd(varA)}^{2}` : ''}`;
    const bVarPart = `${gcfLatexPrefix}${cmd(varB)}^{2}`;
    return `${coeffLatex(gcfCoeff * a2[0], a2[1], aVarPart)} - ${coeffLatex(gcfCoeff * b2[0], b2[1], bVarPart)}`;
  }

  const ab = reduceFrac(2 * aNum * bNum, aDen * bDen);

  const b2VarPart = `${gcfLatexPrefix}${cmd(varB)}^{2}`;
  const abVarPart = `${gcfLatexPrefix}${varA ? `${cmd(varA)}${cmd(varB)}` : cmd(varB)}`;
  const a2VarPart = `${gcfLatexPrefix}${varA ? `${cmd(varA)}^{2}` : ''}`;

  const term2 = coeffLatex(gcfCoeff * b2[0], b2[1], b2VarPart);
  const sign = formulaType === 1 ? '+' : '-';
  const term1 = `${sign} ${coeffLatex(gcfCoeff * ab[0], ab[1], abVarPart)}`;
  const term0 = `+ ${coeffLatex(gcfCoeff * a2[0], a2[1], a2VarPart)}`;
  return `${term2} ${term1} ${term0}`;
}

function formatFullFactoredLatex(
  formulaType: number,
  gcfCoeff: number,
  gcfVarLatex: string,
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
  varA: string | null,
  varB: string,
): string {
  const hasGcfVar = gcfVarLatex !== '';
  let gcfStr: string;
  if (gcfCoeff === 1 && hasGcfVar) {
    gcfStr = gcfVarLatex;
  } else if (gcfCoeff === 1 && !hasGcfVar) {
    gcfStr = '';
  } else {
    gcfStr = `${gcfCoeff}${hasGcfVar ? '\\,' + gcfVarLatex : ''}`;
  }

  const inner = formatFactoredLatex(formulaType, aNum, aDen, bNum, bDen, varA, varB);
  if (!gcfStr) return inner;
  return `${gcfStr}\\,${inner}`;
}

function generateNormal(rng: () => number, formulaType: number, allowGcfVar: boolean): Exercise {
  for (let attempt = 0; attempt < 30; attempt++) {
    const [_aNum, _aDen] = randCoeff(rng, false);
    const [_bNum, _bDen] = randCoeff(rng, false);
    let aNum = _aNum;
    const aDen = _aDen;
    let bNum = _bNum;
    const bDen = _bDen;
    const varB = pick(rng, INNER_VARS);
    let varA: string | null = null;
    if (allowGcfVar || (formulaType === 3 && rng() > 0.3)) {
      varA = pickExclude(rng, INNER_VARS, [varB]);
    }

    let gcfCoeff = randInt(rng, 2, formulaType === 3 ? 4 : 5);

    if (aDen === 1 && bDen === 1) {
      const d = gcd(aNum, bNum);
      if (d > 1) {
        gcfCoeff *= d * d;
        aNum /= d;
        bNum /= d;
      }
    }

    const aCoeff: [number, number] = [aNum, aDen];
    const bCoeff: [number, number] = [bNum, bDen];

    let gcfVarMap: VarMap | null = null;
    if (allowGcfVar && rng() > 0.4) {
      const gcfVarName = pickExclude(rng, GCF_VARS, [varA, varB].filter(Boolean) as string[]);
      gcfVarMap = { [gcfVarName]: 1 };
    }

    const innerMaps = innerTermVarMaps(formulaType, varA, varB);
    const termVarParts: VarMap[] = innerMaps
      .filter((m): m is VarMap => m !== null)
      .map((m) => (gcfVarMap ? varMapMultiply(gcfVarMap, m) : m));

    const factorOptions = buildFactorOptions(termVarParts);
    const gcfVarLatex = gcfVarMap ? varMapLatex(gcfVarMap) : '';
    const gcfVarUnicode = gcfVarMap ? varMapUnicode(gcfVarMap) : '';

    let correctGcfIdx = -1;
    for (let i = 0; i < factorOptions.length; i++) {
      if (factorOptions[i].text === gcfVarUnicode) {
        correctGcfIdx = i;
        break;
      }
    }

    const termVarPartsLatex = termVarParts.map(varMapLatex);

    const prompt = buildPromptLaTeX(
      formulaType,
      aCoeff[0],
      aCoeff[1],
      bCoeff[0],
      bCoeff[1],
      gcfCoeff,
      gcfVarMap,
      varA,
      varB,
    );

    const answer = `${formulaType},${gcfCoeff},${correctGcfIdx},${aCoeff[0]}/${aCoeff[1]},${bCoeff[0]}/${bCoeff[1]}`;

    const data: FactoringOutAndBinomialData = {
      formulaType,
      gcfCoeff,
      factorOptions,
      correctGcfIdx,
      aNum: aCoeff[0],
      aDen: aCoeff[1],
      bNum: bCoeff[0],
      bDen: bCoeff[1],
      varA,
      varB,
      isTrap: false,
      termVarParts: termVarPartsLatex,
      gcfVarLatex,
    };

    return { prompt, answer, data: data as unknown as Exercise['data'] };
  }

  const aCoeff = [randInt(rng, 1, 3), 1] as [number, number];
  const bCoeff = [randInt(rng, 1, 3), 1] as [number, number];
  const v = pick(rng, INNER_VARS);
  const prompt = buildPromptLaTeX(1, aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], 2, null, null, v);
  const answer = `1,2,-1,${aCoeff[0]}/1,${bCoeff[0]}/1`;
  const data: FactoringOutAndBinomialData = {
    formulaType: 1,
    gcfCoeff: 2,
    correctGcfIdx: -1,
    factorOptions: [],
    aNum: aCoeff[0],
    aDen: 1,
    bNum: bCoeff[0],
    bDen: 1,
    varA: null,
    varB: v,
    isTrap: false,
    termVarParts: [`${cmd(v)}^{2}`, cmd(v), ''],
    gcfVarLatex: '',
  };
  return { prompt, answer, data: data as unknown as Exercise['data'] };
}

function generateTrap(rng: () => number, allowGcfVar: boolean): Exercise {
  const trapType = Math.floor(rng() * 3);
  const aCoeff = randCoeff(rng, false);
  const bCoeff = randCoeff(rng, false);
  const varB = pick(rng, INNER_VARS);
  let varA: string | null = null;
  if (allowGcfVar) {
    varA = pickExclude(rng, INNER_VARS, [varB]);
  }

  const gcfCoeff = randInt(rng, 2, 5);

  let gcfVarMap: VarMap | null = null;
  if (allowGcfVar && rng() > 0.5) {
    const gcfVarName = pickExclude(rng, GCF_VARS, [varA, varB].filter(Boolean) as string[]);
    gcfVarMap = { [gcfVarName]: 1 };
  }

  const gcfVarLatexPart = gcfVarMap ? varMapLatex(gcfVarMap) : '';

  const a2 = reduceFrac(aCoeff[0] * aCoeff[0], aCoeff[1] * aCoeff[1]);
  const b2 = reduceFrac(bCoeff[0] * bCoeff[0], bCoeff[1] * bCoeff[1]);
  const aVarPart = `${gcfVarLatexPart}${varA ? `${cmd(varA)}^{2}` : ''}`;
  const bVarPart = `${gcfVarLatexPart}${cmd(varB)}^{2}`;
  const abVarPart = `${gcfVarLatexPart}${varA ? `${cmd(varA)}${cmd(varB)}` : cmd(varB)}`;
  const abWrong = reduceFrac(aCoeff[0] * bCoeff[0], aCoeff[1] * bCoeff[1]);

  let prompt: string;
  if (trapType === 0) {
    prompt = `${coeffLatex(gcfCoeff * a2[0], a2[1], aVarPart)} + ${coeffLatex(gcfCoeff * abWrong[0], abWrong[1], abVarPart)} + ${coeffLatex(gcfCoeff * b2[0], b2[1], bVarPart)}`;
  } else if (trapType === 1) {
    const abFull = reduceFrac(2 * aCoeff[0] * bCoeff[0], aCoeff[1] * bCoeff[1]);
    prompt = `${coeffLatex(gcfCoeff * a2[0], a2[1], aVarPart)} + ${coeffLatex(gcfCoeff * abFull[0], abFull[1], abVarPart)} - ${coeffLatex(gcfCoeff * b2[0], b2[1], bVarPart)}`;
  } else {
    const two = reduceFrac(2, 1);
    prompt = `${coeffLatex(gcfCoeff * two[0], two[1], aVarPart)} + ${coeffLatex(gcfCoeff * b2[0], b2[1], bVarPart)}`;
  }

  const data: FactoringOutAndBinomialData = {
    formulaType: 0,
    gcfCoeff,
    factorOptions: [],
    correctGcfIdx: -1,
    aNum: aCoeff[0],
    aDen: aCoeff[1],
    bNum: bCoeff[0],
    bDen: bCoeff[1],
    varA,
    varB,
    isTrap: true,
    termVarParts: [],
    gcfVarLatex: gcfVarLatexPart,
  };
  return { prompt, answer: '-1', data: data as unknown as Exercise['data'] };
}

export function generateFactoringOutAndBinomial(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = Math.min(Math.max(complexity, 0), 9);
  const allowGcfVar = clamped >= 7;
  const useAllFormulas = clamped >= 4;

  if (rng() < 0.25) {
    return generateTrap(rng, allowGcfVar);
  }

  const formulaType = useAllFormulas ? Math.floor(rng() * 3) + 1 : 1;
  return generateNormal(rng, formulaType, allowGcfVar);
}

export function validateFactoringOutAndBinomial(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as unknown as FactoringOutAndBinomialData;
  if (!data) return false;

  if (data.isTrap) {
    return answer === '-1';
  }

  if (answer === '-1') return false;

  const parts = answer.split(',').map((s) => s.trim());
  if (parts.length < 5) return false;

  const userFormula = parseInt(parts[0], 10);
  if (userFormula !== data.formulaType) return false;

  const userGcfCoeff = parseInt(parts[1], 10);
  if (userGcfCoeff !== data.gcfCoeff) return false;

  const userGcfIdx = parseInt(parts[2], 10);
  if (userGcfIdx !== data.correctGcfIdx) return false;

  return fracEqual(parts[3], `${data.aNum}/${data.aDen}`) && fracEqual(parts[4], `${data.bNum}/${data.bDen}`);
}

export { formatFullFactoredLatex };
