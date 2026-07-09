import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick, pickExclude, randCoeff } from '../math/rng';
import { reduceFrac, fracEqual } from '../math/fraction';
import { cmd, coeffLatex } from '../math/latex';

export function formatFactoredLatex(
  formulaType: number,
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
  varA: string | null,
  varB: string,
): string {
  const aStr = coeffLatex(aNum, aDen, varA ? cmd(varA) : '');
  const bStr = coeffLatex(bNum, bDen, cmd(varB));

  if (!varA) {
    if (formulaType === 1) return `(${bStr} + ${aStr})^{2}`;
    if (formulaType === 2) return `(${bStr} - ${aStr})^{2}`;
  }
  if (formulaType === 1) return `(${aStr} + ${bStr})^{2}`;
  if (formulaType === 2) return `(${aStr} - ${bStr})^{2}`;
  return `(${aStr} + ${bStr})(${aStr} - ${bStr})`;
}

function buildPrompt(
  formulaType: number,
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
  varA: string | null,
  varB: string,
): string {
  const a2 = reduceFrac(aNum * aNum, aDen * aDen);
  const b2 = reduceFrac(bNum * bNum, bDen * bDen);

  if (formulaType === 3) {
    const a2Part = coeffLatex(a2[0], a2[1], varA ? `${cmd(varA)}^{2}` : '');
    const b2Part = coeffLatex(b2[0], b2[1], `${cmd(varB)}^{2}`);
    return `${a2Part} - ${b2Part}`;
  }

  const ab = reduceFrac(2 * aNum * bNum, aDen * bDen);
  const aVarPart = varA ? `${cmd(varA)}^{2}` : '';
  const bVarPart = `${cmd(varB)}^{2}`;
  const abVarPart = varA ? `${cmd(varA)}${cmd(varB)}` : cmd(varB);

  if (formulaType === 1) {
    return `${coeffLatex(a2[0], a2[1], aVarPart)} + ${coeffLatex(ab[0], ab[1], abVarPart)} + ${coeffLatex(b2[0], b2[1], bVarPart)}`;
  }

  return `${coeffLatex(a2[0], a2[1], aVarPart)} - ${coeffLatex(ab[0], ab[1], abVarPart)} + ${coeffLatex(b2[0], b2[1], bVarPart)}`;
}

const VAR_NAMES = ['a', 'b', 'c', 'd', 'k', '\\ell', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];

function generateTrap(rng: () => number, allowFrac: boolean, aMayHaveVar: boolean): Exercise {
  const trapType = Math.floor(rng() * 3);
  const aCoeff = randCoeff(rng, allowFrac);
  const bCoeff = randCoeff(rng, allowFrac);
  const varB = pick(rng, VAR_NAMES);
  let varA: string | null = null;
  if (aMayHaveVar) {
    varA = pickExclude(rng, VAR_NAMES, [varB]);
  }

  const a2 = reduceFrac(aCoeff[0] * aCoeff[0], aCoeff[1] * aCoeff[1]);
  const b2 = reduceFrac(bCoeff[0] * bCoeff[0], bCoeff[1] * bCoeff[1]);
  const aVarPart = varA ? `${cmd(varA)}^{2}` : '';
  const bVarPart = `${cmd(varB)}^{2}`;

  let prompt: string;

  if (trapType === 0) {
    const abWrong = reduceFrac(aCoeff[0] * bCoeff[0], aCoeff[1] * bCoeff[1]);
    const abVarPart = varA ? `${cmd(varA)}${cmd(varB)}` : cmd(varB);
    prompt = `${coeffLatex(a2[0], a2[1], aVarPart)} + ${coeffLatex(abWrong[0], abWrong[1], abVarPart)} + ${coeffLatex(b2[0], b2[1], bVarPart)}`;
  } else if (trapType === 1) {
    const abFull = reduceFrac(2 * aCoeff[0] * bCoeff[0], aCoeff[1] * bCoeff[1]);
    const abVarPart = varA ? `${cmd(varA)}${cmd(varB)}` : cmd(varB);
    prompt = `${coeffLatex(a2[0], a2[1], aVarPart)} + ${coeffLatex(abFull[0], abFull[1], abVarPart)} - ${coeffLatex(b2[0], b2[1], bVarPart)}`;
  } else {
    prompt = `${coeffLatex(a2[0], a2[1], aVarPart)} + ${coeffLatex(b2[0], b2[1], bVarPart)}`;
  }

  return {
    prompt,
    answer: '0',
    data: { varA, varB, correctFormula: 0 },
  };
}

export function generateFactoringBinomialFormulas(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = Math.min(Math.max(complexity, 0), 9);
  const allowFrac = clamped >= 5;
  const aMayHaveVar = clamped >= 5 && rng() > 0.5;

  if (rng() < 0.25) {
    return generateTrap(rng, allowFrac, aMayHaveVar);
  }

  const formulaType = Math.floor(rng() * 3) + 1;

  for (let attempt = 0; attempt < 30; attempt++) {
    const aCoeff = randCoeff(rng, allowFrac);
    const bCoeff = randCoeff(rng, allowFrac);

    const varB = pick(rng, VAR_NAMES);
    let varA: string | null = null;

    if (aMayHaveVar || (formulaType === 3 && rng() > 0.3)) {
      varA = pickExclude(rng, VAR_NAMES, [varB]);
    }

    const prompt = buildPrompt(formulaType, aCoeff[0], aCoeff[1], bCoeff[0], bCoeff[1], varA, varB);

    const answer = `${formulaType},${aCoeff[0]}/${aCoeff[1]},${bCoeff[0]}/${bCoeff[1]}`;

    return {
      prompt,
      answer,
      data: { varA, varB, correctFormula: formulaType },
    };
  }

  const fallbackA = randInt(rng, 1, 3);
  const fallbackB = randInt(rng, 1, 3);
  const v = pick(rng, VAR_NAMES);
  const prompt = buildPrompt(1, fallbackA, 1, fallbackB, 1, null, v);
  return {
    prompt,
    answer: `1,${fallbackA}/1,${fallbackB}/1`,
    data: { varA: null, varB: v, correctFormula: 1 },
  };
}

export function validateFactoringBinomialFormulas(answer: string, exercise: Exercise): boolean {
  const userParts = answer.split(',').map((s) => s.trim());
  const correctParts = exercise.answer.split(',').map((s) => s.trim());

  const correctFormula = parseInt(correctParts[0], 10);
  const userFormula = parseInt(userParts[0], 10);

  if (userFormula !== correctFormula) return false;

  if (correctFormula === 0) return true;

  if (userParts.length < 3 || correctParts.length < 3) return false;

  return fracEqual(userParts[1], correctParts[1]) && fracEqual(userParts[2], correctParts[2]);
}
