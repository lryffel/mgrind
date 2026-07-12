import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';

const VARS = ['x', 'y', 'z', 't', 'u', 'v', 'w'];

type EqType = 'factoringOut' | 'diffOfSquares' | 'perfectSquare' | 'factoringOutAndBinomial' | 'cubic';

function cmd(s: string): string {
  return s.startsWith('\\') ? s + '{}' : s;
}

interface TermData {
  coeff: number;
  degree: number;
}

function buildEquationString(terms: TermData[], variable: string): string {
  const parts: string[] = [];
  for (const { coeff, degree } of terms) {
    if (coeff === 0) continue;
    const isFirst = parts.length === 0;
    const absC = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : isFirst ? '' : ' + ';

    const v = cmd(variable);
    let varPart: string;
    if (degree === 0) {
      varPart = '';
    } else if (degree === 1) {
      varPart = v;
    } else {
      varPart = `${v}^{${degree}}`;
    }

    let coeffStr: string;
    if (degree === 0) {
      coeffStr = String(absC);
    } else if (absC === 1) {
      coeffStr = '';
    } else {
      coeffStr = String(absC);
    }

    parts.push(`${sign}${coeffStr}${varPart}`);
  }
  return parts.join('') || '0';
}

function buildPrompt(coeffs: number[], variable: string, distribute: boolean, rng: () => number): string {
  const degree = coeffs.length - 1;

  const termData: TermData[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    if (coeffs[i] !== 0) {
      termData.push({ coeff: coeffs[i], degree: degree - i });
    }
  }

  if (termData.length < 2 || !distribute) {
    return buildEquationString(termData, variable) + ' = 0';
  }

  const onRhsIndices = new Set<number>();
  for (let i = 0; i < termData.length; i++) {
    if (rng() > 0.5) onRhsIndices.add(i);
  }

  if (onRhsIndices.size === termData.length) {
    const remove = Math.floor(rng() * onRhsIndices.size);
    onRhsIndices.delete([...onRhsIndices][remove]);
  }

  if (onRhsIndices.size === 0) {
    return buildEquationString(termData, variable) + ' = 0';
  }

  const lhsTerms: TermData[] = [];
  const rhsTerms: TermData[] = [];
  for (let i = 0; i < termData.length; i++) {
    if (onRhsIndices.has(i)) {
      rhsTerms.push({ coeff: -termData[i].coeff, degree: termData[i].degree });
    } else {
      lhsTerms.push(termData[i]);
    }
  }

  const lhs = buildEquationString(lhsTerms, variable);
  const rhs = buildEquationString(rhsTerms, variable);
  return `${lhs} = ${rhs}`;
}

function genFactoringOut(rng: () => number, clamped: number, variable: string): [string, number[]] {
  const maxB = Math.min(5 + clamped, 15);
  let b = randInt(rng, 2, maxB);
  if (clamped >= 1 && rng() > 0.4) b = -b;
  const prompt = buildPrompt([1, b, 0], variable, clamped >= 2, rng);
  return [prompt, [0, -b].sort((a, b) => a - b)];
}

function genDiffOfSquares(rng: () => number, clamped: number, variable: string): [string, number[]] {
  const maxC = Math.min(3 + clamped, 10);
  const c = randInt(rng, 2, maxC);
  const prompt = buildPrompt([1, 0, -c * c], variable, clamped >= 2, rng);
  return [prompt, [-c, c].sort((a, b) => a - b)];
}

function genPerfectSquare(rng: () => number, clamped: number, variable: string): [string, number[]] {
  const maxP = Math.min(2 + clamped, 8);
  let p = randInt(rng, 1, maxP);
  if (rng() > 0.5) p = -p;
  const prompt = buildPrompt([1, 2 * p, p * p], variable, clamped >= 2, rng);
  return [prompt, [-p]];
}

function genFactoringOutAndBinomial(rng: () => number, clamped: number, variable: string): [string, number[]] {
  const maxA = clamped >= 9 ? 5 : 3;
  const a = randInt(rng, 2, maxA);

  if (rng() > 0.5) {
    const maxC = Math.min(2 + clamped, 8);
    const c = randInt(rng, 2, maxC);
    const prompt = buildPrompt([a, 0, -a * c * c], variable, clamped >= 2, rng);
    return [prompt, [-c, c].sort((a, b) => a - b)];
  } else {
    const maxP = Math.min(2 + clamped, 6);
    let p = randInt(rng, 1, maxP);
    if (rng() > 0.5) p = -p;
    const prompt = buildPrompt([a, 2 * a * p, a * p * p], variable, clamped >= 2, rng);
    return [prompt, [-p]];
  }
}

function genCubic(rng: () => number, clamped: number, variable: string): [string, number[]] {
  if (rng() > 0.5) {
    const maxC = Math.min(2 + clamped, 7);
    const c = randInt(rng, 2, maxC);
    const prompt = buildPrompt([1, 0, -c * c, 0], variable, clamped >= 2, rng);
    return [prompt, [-c, 0, c].sort((a, b) => a - b)];
  } else {
    const maxP = Math.min(2 + clamped, 5);
    let p = randInt(rng, 1, maxP);
    if (rng() > 0.5) p = -p;
    const prompt = buildPrompt([1, 2 * p, p * p, 0], variable, clamped >= 2, rng);
    return [prompt, [-p, 0].sort((a, b) => a - b)];
  }
}

const TYPE_POOLS: Record<number, EqType[]> = {
  0: ['factoringOut'],
  1: ['factoringOut'],
  2: ['factoringOut', 'diffOfSquares'],
  3: ['factoringOut', 'diffOfSquares', 'perfectSquare'],
  4: ['factoringOut', 'diffOfSquares', 'perfectSquare'],
  5: ['factoringOut', 'diffOfSquares', 'perfectSquare'],
  6: ['factoringOut', 'diffOfSquares', 'perfectSquare', 'factoringOutAndBinomial'],
  7: ['factoringOut', 'diffOfSquares', 'perfectSquare', 'factoringOutAndBinomial', 'cubic'],
  8: ['factoringOut', 'diffOfSquares', 'perfectSquare', 'factoringOutAndBinomial', 'cubic'],
  9: ['factoringOut', 'diffOfSquares', 'perfectSquare', 'factoringOutAndBinomial', 'cubic'],
  10: ['factoringOut', 'diffOfSquares', 'perfectSquare', 'factoringOutAndBinomial', 'cubic'],
};

export function generateFactorEquations(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  const variable = pick(rng, VARS);
  const pool = TYPE_POOLS[clamped] ?? TYPE_POOLS[0];
  const eqType = pick(rng, pool);

  let prompt: string;
  let solutions: number[];

  switch (eqType) {
    case 'factoringOut': {
      [prompt, solutions] = genFactoringOut(rng, clamped, variable);
      break;
    }
    case 'diffOfSquares': {
      [prompt, solutions] = genDiffOfSquares(rng, clamped, variable);
      break;
    }
    case 'perfectSquare': {
      [prompt, solutions] = genPerfectSquare(rng, clamped, variable);
      break;
    }
    case 'factoringOutAndBinomial': {
      [prompt, solutions] = genFactoringOutAndBinomial(rng, clamped, variable);
      break;
    }
    case 'cubic': {
      [prompt, solutions] = genCubic(rng, clamped, variable);
      break;
    }
  }

  return {
    prompt,
    answer: solutions.join(','),
    data: { variable, numSolutions: solutions.length } as unknown as Exercise['data'],
  };
}

export function validateFactorEquations(answer: string, exercise: Exercise): boolean {
  const trimmed = answer.trim();
  if (!trimmed) return false;

  const parts = trimmed.split(',');
  const userRoots: number[] = [];
  for (const p of parts) {
    const n = parseInt(p.trim(), 10);
    if (isNaN(n)) return false;
    userRoots.push(n);
  }

  const expectedRoots = exercise.answer.split(',').map((s) => parseInt(s, 10));
  if (userRoots.length !== expectedRoots.length) return false;

  userRoots.sort((a, b) => a - b);
  return userRoots.every((r, i) => r === expectedRoots[i]);
}

export function validateFactorEquationsPerRoot(answer: string, exercise: Exercise): boolean[] {
  const trimmed = answer.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(',');
  const userRoots: number[] = [];
  for (const p of parts) {
    const n = parseInt(p.trim(), 10);
    if (isNaN(n)) return Array(userRoots.length).fill(false);
    userRoots.push(n);
  }

  const expectedRoots = exercise.answer.split(',').map((s) => parseInt(s, 10));
  if (userRoots.length !== expectedRoots.length) return Array(userRoots.length).fill(false);

  const sortedUser = [...userRoots].sort((a, b) => a - b);
  const sortedExpected = [...expectedRoots].sort((a, b) => a - b);
  return sortedUser.map((v, i) => v === sortedExpected[i]);
}
