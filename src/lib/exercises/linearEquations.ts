import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';
import { reduceFrac, parseFrac } from '../math/fraction';
import { coeffLatex } from '../math/latex';

type Term = { type: 'coeff' | 'const'; num: number; den: number };

const ALL_VARS = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const EASY_FRACTIONS: [number, number][] = [
  [1, 2],
  [-1, 2],
  [1, 3],
  [-1, 3],
  [2, 3],
  [-2, 3],
  [3, 4],
  [-3, 4],
  [1, 4],
  [-1, 4],
];

function mulFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return reduceFrac(n1 * n2, d1 * d2);
}

function addFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return reduceFrac(n1 * d2 + n2 * d1, d1 * d2);
}

function subFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return reduceFrac(n1 * d2 - n2 * d1, d1 * d2);
}

function zero(n: number): boolean {
  return n === 0;
}

function formatSum(terms: Term[], variable: string): string {
  let result = '';
  for (let i = 0; i < terms.length; i++) {
    const { type, num, den } = terms[i];
    if (zero(num)) continue;
    const [absNum, absDen] = reduceFrac(Math.abs(num), Math.abs(den));

    let termStr: string;
    if (type === 'coeff') {
      if (absDen === 1) {
        termStr = absNum === 1 ? variable : `${absNum}${variable}`;
      } else {
        termStr = absNum === 1 ? `\\frac{1}{${absDen}}${variable}` : `\\frac{${absNum}}{${absDen}}${variable}`;
      }
    } else {
      termStr = absDen === 1 ? String(absNum) : `\\frac{${absNum}}{${absDen}}`;
    }

    if (result === '') {
      result = num < 0 !== den < 0 ? `-${termStr}` : termStr;
    } else {
      result += num > 0 === den > 0 ? ` + ${termStr}` : ` - ${termStr}`;
    }
  }
  return result || '0';
}

function buildPrompt(equationLatex: string): string {
  return equationLatex;
}

function pickNonZero(rng: () => number, min: number, max: number): number {
  let v: number;
  do {
    v = randInt(rng, min, max);
  } while (v === 0);
  return v;
}

function pickNonZeroExclude(rng: () => number, min: number, max: number, exclude: number): number {
  let v: number;
  do {
    v = randInt(rng, min, max);
  } while (v === 0 || v === exclude);
  return v;
}

function pickFracOrInt(rng: () => number, fracChance: number): [number, number] {
  if (rng() < fracChance) {
    return pick(rng, EASY_FRACTIONS);
  }
  return [pickNonZero(rng, -10, 10), 1];
}

function randCoeff(rng: () => number): [number, number] {
  if (rng() < 0.3) {
    return pick(rng, EASY_FRACTIONS);
  }
  return [pickNonZero(rng, -5, 5), 1];
}

function parseAnswer(s: string): [number, number] | null {
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) return null;
    const n = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    if (isNaN(n) || isNaN(d) || d === 0) return null;
    return reduceFrac(n, d);
  }
  if (s.includes('.')) {
    const f = parseFloat(s);
    if (isNaN(f)) return null;
    const parts = s.split('.');
    const den = Math.pow(10, parts[1].length);
    return reduceFrac(Math.round(f * den), den);
  }
  const n = parseInt(s, 10);
  if (isNaN(n)) return null;
  return reduceFrac(n, 1);
}

export function generateLinearEquations(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const variable = pick(rng, ALL_VARS);
  const clamped = clampComplexity(complexity, 10);

  const isLow = clamped < 5;

  let sNum: number, sDen: number, aNum: number, aDen: number;

  if (isLow) {
    [sNum, sDen] = [pickNonZero(rng, -10, 10), 1];
    [aNum, aDen] = [pickNonZero(rng, -5, 5), 1];
  } else {
    [sNum, sDen] = pickFracOrInt(rng, 0.3);
    [aNum, aDen] = randCoeff(rng);
  }

  const [bNum, bDen] = mulFrac(aNum, aDen, sNum, sDen);

  const totalVariants = isLow ? 5 : 18;
  const variant = randInt(rng, 0, totalVariants - 1);

  let leftTerms: Term[] = [];
  let rightTerms: Term[] = [];

  let isBracketVariant = false;

  function assignBaseVariant(v: number) {
    switch (v) {
      case 0:
        leftTerms = [
          { type: 'coeff', num: aNum, den: aDen },
          { type: 'const', num: -bNum, den: bDen },
        ];
        rightTerms = [{ type: 'const', num: 0, den: 1 }];
        break;
      case 1:
        leftTerms = [
          { type: 'const', num: bNum, den: bDen },
          { type: 'coeff', num: -aNum, den: aDen },
        ];
        rightTerms = [{ type: 'const', num: 0, den: 1 }];
        break;
      case 2:
        leftTerms = [{ type: 'coeff', num: aNum, den: aDen }];
        rightTerms = [{ type: 'const', num: bNum, den: bDen }];
        break;
      default:
        leftTerms = [{ type: 'const', num: bNum, den: bDen }];
        rightTerms = [{ type: 'coeff', num: aNum, den: aDen }];
        break;
    }
  }

  if (variant < 4) {
    assignBaseVariant(variant);
  } else if (isLow || variant >= 16) {
    isBracketVariant = true;
  } else {
    let a1Num: number, a1Den: number, a2Num: number, a2Den: number;
    let b1Num: number, b1Den: number, b2Num: number, b2Den: number;

    const splitType = variant < 7 ? 'a' : variant < 10 ? 'b' : ('both' as const);

    if (splitType === 'a' || splitType === 'both') {
      a1Num = pickNonZero(rng, -5, 5);
      a1Den = 1;
      const t = subFrac(aNum, aDen, a1Num, a1Den);
      a2Num = t[0];
      a2Den = t[1];
      if (zero(a2Num)) {
        a1Num = pickNonZeroExclude(rng, -5, 5, a1Num);
        a1Den = 1;
        const t2 = subFrac(aNum, aDen, a1Num, a1Den);
        a2Num = t2[0];
        a2Den = t2[1];
      }
    } else {
      a1Num = aNum;
      a1Den = aDen;
      a2Num = 0;
      a2Den = 1;
    }

    if (splitType === 'b' || splitType === 'both') {
      b1Num = pickNonZero(rng, -10, 10);
      b1Den = 1;
      const t = subFrac(bNum, bDen, b1Num, b1Den);
      b2Num = t[0];
      b2Den = t[1];
      if (zero(b2Num)) {
        b1Num = pickNonZeroExclude(rng, -10, 10, b1Num);
        b1Den = 1;
        const t2 = subFrac(bNum, bDen, b1Num, b1Den);
        b2Num = t2[0];
        b2Den = t2[1];
      }
    } else {
      b1Num = bNum;
      b1Den = bDen;
      b2Num = 0;
      b2Den = 1;
    }

    const sv = variant - 4;
    switch (sv) {
      case 0:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -bNum, den: bDen },
        ];
        rightTerms = [{ type: 'coeff', num: -a2Num, den: a2Den }];
        break;
      case 1:
        leftTerms = [
          { type: 'const', num: bNum, den: bDen },
          { type: 'coeff', num: -a1Num, den: a1Den },
        ];
        rightTerms = [{ type: 'coeff', num: a2Num, den: a2Den }];
        break;
      case 2:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -bNum, den: bDen },
          { type: 'coeff', num: a2Num, den: a2Den },
        ];
        rightTerms = [{ type: 'const', num: 0, den: 1 }];
        break;
      case 3:
        leftTerms = [
          { type: 'const', num: b1Num, den: b1Den },
          { type: 'coeff', num: -aNum, den: aDen },
          { type: 'const', num: b2Num, den: b2Den },
        ];
        rightTerms = [{ type: 'const', num: 0, den: 1 }];
        break;
      case 4:
        leftTerms = [
          { type: 'coeff', num: aNum, den: aDen },
          { type: 'const', num: -b1Num, den: b1Den },
        ];
        rightTerms = [{ type: 'const', num: b2Num, den: b2Den }];
        break;
      case 5:
        leftTerms = [
          { type: 'const', num: b1Num, den: b1Den },
          { type: 'coeff', num: -aNum, den: aDen },
        ];
        rightTerms = [{ type: 'const', num: -b2Num, den: b2Den }];
        break;
      case 6:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -b1Num, den: b1Den },
          { type: 'coeff', num: a2Num, den: a2Den },
          { type: 'const', num: -b2Num, den: b2Den },
        ];
        rightTerms = [{ type: 'const', num: 0, den: 1 }];
        break;
      case 7:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -b1Num, den: b1Den },
          { type: 'coeff', num: a2Num, den: a2Den },
        ];
        rightTerms = [{ type: 'const', num: b2Num, den: b2Den }];
        break;
      case 8:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -b1Num, den: b1Den },
        ];
        rightTerms = [
          { type: 'const', num: b2Num, den: b2Den },
          { type: 'coeff', num: -a2Num, den: a2Den },
        ];
        break;
      case 9:
        leftTerms = [
          { type: 'coeff', num: a1Num, den: a1Den },
          { type: 'const', num: -b1Num, den: b1Den },
        ];
        rightTerms = [
          { type: 'coeff', num: -a2Num, den: a2Den },
          { type: 'const', num: b2Num, den: b2Den },
        ];
        break;
      case 10:
        leftTerms = [
          { type: 'const', num: b1Num, den: b1Den },
          { type: 'coeff', num: -a1Num, den: a1Den },
        ];
        rightTerms = [
          { type: 'coeff', num: a2Num, den: a2Den },
          { type: 'const', num: -b2Num, den: b2Den },
        ];
        break;
      case 11:
        leftTerms = [
          { type: 'const', num: b1Num, den: b1Den },
          { type: 'coeff', num: -a1Num, den: a1Den },
        ];
        rightTerms = [
          { type: 'const', num: -b2Num, den: b2Den },
          { type: 'coeff', num: a2Num, den: a2Den },
        ];
        break;
    }
  }

  let equationLatex: string;
  if (isBracketVariant) {
    const pNum = pickNonZero(rng, -5, 5);
    const pDen = 1;
    const [apNum, apDen] = mulFrac(aNum, aDen, pNum, pDen);
    const [rhsNum, rhsDen] = addFrac(bNum, bDen, apNum, apDen);
    const coeffLatexStr = coeffLatex(aNum, aDen, '');
    const pLatex =
      pDen === 1
        ? pNum >= 0
          ? ` + ${pNum}`
          : ` - ${Math.abs(pNum)}`
        : pNum >= 0
          ? ` + \\frac{${pNum}}{${pDen}}`
          : ` - \\frac{${Math.abs(pNum)}}{${pDen}}`;
    const rhsLatex = coeffLatex(rhsNum, rhsDen, '');
    equationLatex = `${coeffLatexStr}(${variable}${pLatex}) = ${rhsLatex}`;
  } else {
    equationLatex = `${formatSum(leftTerms, variable)} = ${formatSum(rightTerms, variable)}`;
  }

  const [answerNum, answerDen] = reduceFrac(sNum, sDen);
  const answer = answerDen === 1 ? String(answerNum) : `${answerNum}/${answerDen}`;

  const prompt = buildPrompt(equationLatex);

  return { prompt, answer, data: { variable } };
}

export function validateLinearEquations(answer: string, exercise: Exercise): boolean {
  const trimmed = answer.trim();
  if (!trimmed) return false;
  const user = parseAnswer(trimmed);
  const expected = parseFrac(exercise.answer);
  if (user === null || expected === null) return false;
  return user[0] * expected[1] === expected[0] * user[1];
}
