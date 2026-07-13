import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick } from '../math/rng';
import { reduceFrac, parseFrac } from '../math/fraction';
import { gcd, clampComplexity } from '../math/number';
import { coeffLatex } from '../math/latex';

function fracDisplay(num: number, den: number): string {
  if (den === 1) return String(num);
  if (num % den === 0) return String(num / den);
  return coeffLatex(num, den, '');
}

function randomFrac(rng: () => number): [number, number] {
  const den = randInt(rng, 2, 5);
  const num = randInt(rng, 1, 8);
  const g = gcd(num, den);
  return [num / g, den / g];
}

function randomCoeff(rng: () => number, allowFrac: boolean): [number, number] {
  if (allowFrac && rng() > 0.4) {
    return randomFrac(rng);
  }
  return [randInt(rng, 1, 9), 1];
}

const ALL_VARS = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const INTEGER_ONLY = new Set(['k', 'm', 'n', 'p', 'q']);

const ADD_TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [7, 24, 25],
  [8, 15, 17],
  [9, 12, 15],
  [9, 40, 41],
  [12, 16, 20],
  [15, 20, 25],
];

interface GenInput {
  rng: () => number;
  variable: string;
  complexity: number;
  integerOnly: boolean;
}

interface GenOutput {
  term: string;
  answer: string;
  subValue: string;
  hasFractionAnswer: boolean;
}

type GenFunc = (input: GenInput) => GenOutput;

function genAX2(input: GenInput): GenOutput {
  const { rng, variable: v, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [coeffNum, coeffDen] = randomCoeff(rng, allowFrac);

    let subNum: number;
    let subDen: number;
    if (allowFrac && rng() > 0.5) {
      subDen = randInt(rng, 2, 5);
      subNum = randInt(rng, 1, Math.min(8, subDen * 2));
    } else {
      subNum = randInt(rng, 0, 5);
      subDen = 1;
    }
    const subG = gcd(subNum, subDen);
    subNum /= subG;
    subDen /= subG;

    const ansNum = coeffNum * subNum * subNum;
    const ansDen = coeffDen * subDen * subDen;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20 && ansDen !== 0) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${fracDisplay(coeffNum, coeffDen)}\\cdot ${v}^{2}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const s = randInt(rng, 0, 5);
  const c = randInt(rng, 1, 9);
  return {
    term: `${c} \\cdot ${v}^{2}`,
    answer: String(c * s * s),
    subValue: String(s),
    hasFractionAnswer: false,
  };
}

function genAMinusBX(input: GenInput): GenOutput {
  const { rng, variable: v, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac && rng() > 0.3);
    const [bNum, bDen] = randomCoeff(rng, allowFrac && rng() > 0.3);

    let subNum: number;
    let subDen: number;
    if (allowFrac && rng() > 0.5) {
      subDen = randInt(rng, 2, 5);
      subNum = randInt(rng, 1, Math.min(6, subDen * 2));
    } else {
      subNum = randInt(rng, 0, 5);
      subDen = 1;
    }
    const subG = gcd(subNum, subDen);
    subNum /= subG;
    subDen /= subG;

    const bSubNum = bNum * subNum;
    const bSubDen = bDen * subDen;
    const ansNum = aNum * bSubDen - bSubNum * aDen;
    const ansDen = aDen * bSubDen;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${fracDisplay(aNum, aDen)} - ${fracDisplay(bNum, bDen)}\\cdot ${v}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const s = randInt(rng, 0, 5);
  const a = randInt(rng, s + 1, Math.min(s + 10, 20));
  const b = randInt(rng, 1, 5);
  return {
    term: `${a} - ${b}\\cdot ${v}`,
    answer: String(a - b * s),
    subValue: String(s),
    hasFractionAnswer: false,
  };
}

function genX1MinusX(input: GenInput): GenOutput {
  const { rng, variable: v, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    let subNum: number;
    let subDen: number;
    if (allowFrac && rng() > 0.4) {
      subDen = randInt(rng, 2, 5);
      subNum = randInt(rng, 1, subDen - 1);
    } else {
      subNum = randInt(rng, 0, 5);
      subDen = 1;
    }
    const subG = gcd(subNum, subDen);
    subNum /= subG;
    subDen /= subG;

    const oneMinusSubNum = subDen - subNum;
    const oneMinusSubDen = subDen;
    const omG = gcd(oneMinusSubNum, oneMinusSubDen);
    const ansNum = subNum * (oneMinusSubNum / omG);
    const ansDen = subDen * (oneMinusSubDen / omG);

    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${v}\\cdot (1-${v})`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const s = randInt(rng, 0, 5);
  return {
    term: `${v}\\cdot (1-${v})`,
    answer: String(s * (1 - s)),
    subValue: String(s),
    hasFractionAnswer: false,
  };
}

function gen2PowXPlusA(input: GenInput): GenOutput {
  const { rng, variable: v } = input;
  const total = randInt(rng, 0, 10);
  const a = randInt(rng, 0, total);
  const sub = total - a;
  return {
    term: `2^{${v}+${a}}`,
    answer: String(Math.pow(2, total)),
    subValue: String(sub),
    hasFractionAnswer: false,
  };
}

function genAMinusBMinusX(input: GenInput): GenOutput {
  const { rng, variable: v, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac && rng() > 0.3);
    let bNum: number;
    let bDen: number;
    if (allowFrac && rng() > 0.3) {
      [bNum, bDen] = randomFrac(rng);
    } else {
      bNum = randInt(rng, 1, 7);
      bDen = 1;
    }

    let subNum: number;
    let subDen: number;
    if (allowFrac && rng() > 0.5) {
      subDen = randInt(rng, 2, 5);
      subNum = randInt(rng, 1, Math.min(6, subDen * 2));
    } else {
      subNum = randInt(rng, 0, 5);
      subDen = 1;
    }
    const subG = gcd(subNum, subDen);
    subNum /= subG;
    subDen /= subG;

    const innerNum = bNum * subDen - subNum * bDen;
    const innerDen = bDen * subDen;
    const ansNum = aNum * innerDen - innerNum * aDen;
    const ansDen = aDen * innerDen;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${fracDisplay(aNum, aDen)} - (${fracDisplay(bNum, bDen)} - ${v})`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const s = randInt(rng, 0, 5);
  const a = randInt(rng, s + 2, s + 10);
  const b = randInt(rng, s + 1, s + 6);
  return {
    term: `${a} - (${b} - ${v})`,
    answer: String(a - (b - s)),
    subValue: String(s),
    hasFractionAnswer: false,
  };
}

function gen1OverX(input: GenInput): GenOutput {
  const { rng, variable: v } = input;
  for (let attempt = 0; attempt < 20; attempt++) {
    const den = randInt(rng, 2, 5);
    const num = randInt(rng, 1, 8);
    const g = gcd(num, den);
    const subNum = num / g;
    const subDen = den / g;
    if (subDen === 1) continue;

    const ansNum = subDen;
    const ansDen = subNum;
    const ag = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / ag;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `\\frac{1}{${v}}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const subNum = randInt(rng, 2, 5);
  const subDen = subNum + randInt(rng, 1, 3);
  return {
    term: `\\frac{1}{${v}}`,
    answer: `${subDen}/${subNum}`,
    subValue: `${subNum}/${subDen}`,
    hasFractionAnswer: true,
  };
}

function genNPlus1Over2(input: GenInput): GenOutput {
  const { rng, variable: v } = input;
  const n = randInt(rng, 1, 20);
  const result = (n * (n + 1)) / 2;
  return {
    term: `\\frac{${v}(${v}+1)}{2}`,
    answer: String(result),
    subValue: String(n),
    hasFractionAnswer: false,
  };
}

function genSqrtA2PlusX2(input: GenInput): GenOutput {
  const { rng, variable: v } = input;
  const [p, q, r] = pick(rng, ADD_TRIPLES);
  if (rng() > 0.5) {
    return {
      term: `\\sqrt{${p}^{2} + ${v}^{2}}`,
      answer: String(r),
      subValue: String(q),
      hasFractionAnswer: false,
    };
  }
  return {
    term: `\\sqrt{${v}^{2} + ${q}^{2}}`,
    answer: String(r),
    subValue: String(p),
    hasFractionAnswer: false,
  };
}

function isValidExercise(ex: Exercise): boolean {
  const answer = ex.answer;
  if (answer.includes('/')) {
    const parts = answer.split('/');
    if (parts.length !== 2) return false;
    const den = parseInt(parts[1], 10);
    if (isNaN(den) || den > 20) return false;
  }
  return true;
}

function poolFor(clamped: number, integerOnly: boolean): GenFunc[] {
  const low: GenFunc[] = [genAX2, genAMinusBX, genX1MinusX, gen2PowXPlusA];
  if (clamped <= 4) return low;

  const high: GenFunc[] = [
    genAX2,
    genAMinusBX,
    genX1MinusX,
    gen2PowXPlusA,
    genAMinusBMinusX,
    genNPlus1Over2,
    genSqrtA2PlusX2,
  ];

  if (!integerOnly) {
    return [...high, gen1OverX];
  }
  return high;
}

export function generateSubstitution(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const variable = pick(rng, ALL_VARS);
  const integerOnly = INTEGER_ONLY.has(variable);
  const clamped = clampComplexity(complexity, 10);

  const pool = poolFor(clamped, integerOnly);

  if (clamped >= 5 && !integerOnly) {
    for (let attempt = 0; attempt < 15; attempt++) {
      const gen = pick(rng, pool);
      const result = gen({ rng, variable, complexity: clamped, integerOnly });
      const ex: Exercise = {
        prompt: result.term,
        answer: result.answer,
        data: {
          variable,
          value: result.subValue,
          term: result.term,
          complexity: clamped,
        },
      };
      if (isValidExercise(ex)) return ex;
    }
  }

  const gen = pick(rng, pool);
  const result = gen({ rng, variable, complexity: clamped, integerOnly });
  return {
    prompt: result.term,
    answer: result.answer,
    data: {
      variable,
      value: result.subValue,
      term: result.term,
      complexity: clamped,
    },
  };
}

export function validateSubstitution(answer: string, exercise: Exercise): boolean {
  const a = answer.trim();
  const expected = exercise.answer;

  if (a === expected) return true;

  const aParsed = parseFrac(a);
  const eParsed = parseFrac(expected);

  if (aParsed === null || eParsed === null) return false;

  return aParsed[0] * eParsed[1] === eParsed[0] * aParsed[1];
}
