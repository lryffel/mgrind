import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick, pickExclude } from '../math/rng';
import { reduceFrac, parseFrac } from '../math/fraction';
import { gcd, clampComplexity } from '../math/number';
import { coeffLatex } from '../math/latex';

export interface SubstitutionData {
  variable: string;
  value: string;
  varB?: string;
  valueB?: string;
  term: string;
  complexity: number;
}

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

function pickSubValue(rng: () => number, allowFrac: boolean): [number, number] {
  let subNum: number;
  let subDen: number;
  if (allowFrac && rng() > 0.5) {
    subDen = randInt(rng, 2, 5);
    subNum = randInt(rng, 1, Math.min(6, subDen * 2));
  } else {
    subNum = randInt(rng, 0, 5);
    subDen = 1;
  }
  const g = gcd(subNum, subDen);
  return [subNum / g, subDen / g];
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

interface Gen2Input {
  rng: () => number;
  varA: string;
  varB: string;
  complexity: number;
  integerOnly: boolean;
}

interface Gen2Output {
  term: string;
  answer: string;
  valueA: string;
  valueB: string;
  hasFractionAnswer: boolean;
}

type Gen2Func = (input: Gen2Input) => Gen2Output;

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
        term: coeffLatex(coeffNum, coeffDen, `${v}^{2}`),
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        subValue: fracDisplay(subNum, subDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const s = randInt(rng, 0, 5);
  const c = randInt(rng, 1, 9);
  return {
    term: c === 1 ? `${v}^{2}` : `${c} \\cdot ${v}^{2}`,
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
        term: `${fracDisplay(aNum, aDen)} - ${coeffLatex(bNum, bDen, v)}`,
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
    term: b === 1 ? `${a} - ${v}` : `${a} - ${b}\\cdot ${v}`,
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

function gen2LinearSum(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac);
    const [bNum, bDen] = randomCoeff(rng, allowFrac);

    const [subANum, subADen] = pickSubValue(rng, allowFrac);
    const [subBNum, subBDen] = pickSubValue(rng, allowFrac);

    const axNum = aNum * subANum;
    const axDen = aDen * subADen;
    const byNum = bNum * subBNum;
    const byDen = bDen * subBDen;

    const ansNum = axNum * byDen + byNum * axDen;
    const ansDen = axDen * byDen;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${coeffLatex(aNum, aDen, a)} + ${coeffLatex(bNum, bDen, b)}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        valueA: fracDisplay(subANum, subADen),
        valueB: fracDisplay(subBNum, subBDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const x = randInt(rng, 0, 5);
  const y = randInt(rng, 0, 5);
  const ac = randInt(rng, 1, 9);
  const bc = randInt(rng, 1, 9);
  return {
    term: `${coeffLatex(ac, 1, a)} + ${coeffLatex(bc, 1, b)}`,
    answer: String(ac * x + bc * y),
    valueA: String(x),
    valueB: String(y),
    hasFractionAnswer: false,
  };
}

function gen2LinearSquare(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac);
    const [bNum, bDen] = randomCoeff(rng, allowFrac);
    const [subANum, subADen] = pickSubValue(rng, allowFrac);
    const [subBNum, subBDen] = pickSubValue(rng, allowFrac);

    const axNum = aNum * subANum;
    const axDen = aDen * subADen;
    const by2Num = bNum * subBNum * subBNum;
    const by2Den = bDen * subBDen * subBDen;

    const ansNum = axNum * by2Den + by2Num * axDen;
    const ansDen = axDen * by2Den;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${coeffLatex(aNum, aDen, a)} + ${coeffLatex(bNum, bDen, `${b}^{2}`)}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        valueA: fracDisplay(subANum, subADen),
        valueB: fracDisplay(subBNum, subBDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const x = randInt(rng, 0, 5);
  const y = randInt(rng, 0, 5);
  const ac = randInt(rng, 1, 9);
  const bc = randInt(rng, 1, 9);
  return {
    term: `${coeffLatex(ac, 1, a)} + ${coeffLatex(bc, 1, `${b}^{2}`)}`,
    answer: String(ac * x + bc * y * y),
    valueA: String(x),
    valueB: String(y),
    hasFractionAnswer: false,
  };
}

function gen2BothSquared(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac);
    const [bNum, bDen] = randomCoeff(rng, allowFrac);
    const [subANum, subADen] = pickSubValue(rng, allowFrac);
    const [subBNum, subBDen] = pickSubValue(rng, allowFrac);

    const ax2Num = aNum * subANum * subANum;
    const ax2Den = aDen * subADen * subADen;
    const by2Num = bNum * subBNum * subBNum;
    const by2Den = bDen * subBDen * subBDen;

    const ansNum = ax2Num * by2Den + by2Num * ax2Den;
    const ansDen = ax2Den * by2Den;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `${coeffLatex(aNum, aDen, `${a}^{2}`)} + ${coeffLatex(bNum, bDen, `${b}^{2}`)}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        valueA: fracDisplay(subANum, subADen),
        valueB: fracDisplay(subBNum, subBDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const x = randInt(rng, 0, 5);
  const y = randInt(rng, 0, 5);
  const ac = randInt(rng, 1, 9);
  const bc = randInt(rng, 1, 9);
  return {
    term: `${coeffLatex(ac, 1, `${a}^{2}`)} + ${coeffLatex(bc, 1, `${b}^{2}`)}`,
    answer: String(ac * x * x + bc * y * y),
    valueA: String(x),
    valueB: String(y),
    hasFractionAnswer: false,
  };
}

function gen2Product(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b } = input;
  const scaled = rng() > 0.5;

  for (let attempt = 0; attempt < 20; attempt++) {
    const subA = randInt(rng, 1, 6);
    const subB = randInt(rng, 1, 6);

    if (scaled) {
      const coeff = randInt(rng, 1, 5);
      const ans = coeff * subA * subB;
      return {
        term: `${coeff} \\cdot ${a} \\cdot ${b}`,
        answer: String(ans),
        valueA: String(subA),
        valueB: String(subB),
        hasFractionAnswer: false,
      };
    }

    const ans = subA * subB;
    return {
      term: `${a} \\cdot ${b}`,
      answer: String(ans),
      valueA: String(subA),
      valueB: String(subB),
      hasFractionAnswer: false,
    };
  }

  return {
    term: `${a} \\cdot ${b}`,
    answer: '1',
    valueA: '1',
    valueB: '1',
    hasFractionAnswer: false,
  };
}

function gen2Quotient(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b, complexity, integerOnly } = input;
  const allowFrac = !integerOnly && complexity >= 5;

  for (let attempt = 0; attempt < 30; attempt++) {
    const [aNum, aDen] = randomCoeff(rng, allowFrac);
    const [bNum, bDen] = randomCoeff(rng, allowFrac);
    const [subANum, subADen] = pickSubValue(rng, allowFrac);
    const [subBNum, subBDen] = pickSubValue(rng, allowFrac);

    const ansNum = aNum * subANum * bDen * subBDen;
    const ansDen = aDen * subADen * bNum * subBNum;

    if (ansDen === 0) continue;
    const g = gcd(Math.abs(ansNum), ansDen);
    const resultDen = ansDen / g;

    if (resultDen <= 20) {
      const answer = reduceFrac(ansNum, ansDen);
      return {
        term: `\\frac{${coeffLatex(aNum, aDen, a)}}{${coeffLatex(bNum, bDen, b)}}`,
        answer: [answer[0], answer[1]].join('/').replace(/\/1$/, ''),
        valueA: fracDisplay(subANum, subADen),
        valueB: fracDisplay(subBNum, subBDen),
        hasFractionAnswer: answer[1] > 1,
      };
    }
  }

  const x = randInt(rng, 1, 5);
  const y = randInt(rng, 1, 5);
  const ac = randInt(rng, 1, 5);
  const bc = randInt(rng, 1, 5);
  const ansNum = ac * x;
  const ansDen = bc * y;
  const fracGcd = gcd(ansNum, ansDen);
  return {
    term: `\\frac{${ac}${a}}{${bc}${b}}`,
    answer: `${ansNum / fracGcd}/${ansDen / fracGcd}`,
    valueA: String(x),
    valueB: String(y),
    hasFractionAnswer: ansDen / fracGcd > 1,
  };
}

function gen2BinomialSquare(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b } = input;
  const x = randInt(rng, 1, 7);
  const y = randInt(rng, 1, 7);
  const sum = x + y;
  return {
    term: `(${a} + ${b})^{2}`,
    answer: String(sum * sum),
    valueA: String(x),
    valueB: String(y),
    hasFractionAnswer: false,
  };
}

function gen2ReciprocalSum(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b } = input;

  for (let attempt = 0; attempt < 20; attempt++) {
    const aNum = randInt(rng, 2, 12);
    const divisorsA: number[] = [];
    for (let d = 1; d <= aNum; d++) {
      if (aNum % d === 0) divisorsA.push(d);
    }
    if (divisorsA.length < 2) continue;

    const bNum = randInt(rng, 2, 12);
    const divisorsB: number[] = [];
    for (let d = 1; d <= bNum; d++) {
      if (bNum % d === 0) divisorsB.push(d);
    }
    if (divisorsB.length < 2) continue;

    const x = pick(
      rng,
      divisorsA.filter((d) => d > 1),
    );
    const y = pick(
      rng,
      divisorsB.filter((d) => d > 1),
    );

    const ans = aNum / x + bNum / y;
    return {
      term: `\\frac{${aNum}}{${a}} + \\frac{${bNum}}{${b}}`,
      answer: String(ans),
      valueA: String(x),
      valueB: String(y),
      hasFractionAnswer: false,
    };
  }

  return {
    term: `\\frac{6}{${a}} + \\frac{6}{${b}}`,
    answer: '5',
    valueA: '2',
    valueB: '3',
    hasFractionAnswer: false,
  };
}

function gen2Pythagorean(input: Gen2Input): Gen2Output {
  const { rng, varA: a, varB: b } = input;
  const [p, q, r] = pick(rng, ADD_TRIPLES);
  if (rng() > 0.5) {
    return {
      term: `\\sqrt{${a}^{2} + ${b}^{2}}`,
      answer: String(r),
      valueA: String(p),
      valueB: String(q),
      hasFractionAnswer: false,
    };
  }
  return {
    term: `\\sqrt{${a}^{2} + ${b}^{2}}`,
    answer: String(r),
    valueA: String(q),
    valueB: String(p),
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

function twoVarPoolFor(clamped: number, integerOnly: boolean): Gen2Func[] {
  const band4: Gen2Func[] = [gen2LinearSum, gen2LinearSquare, gen2Product];
  if (clamped <= 5) return band4;

  const band6: Gen2Func[] = [...band4, gen2BothSquared, gen2BinomialSquare];
  if (!integerOnly) {
    band6.push(gen2Quotient);
  }
  if (clamped <= 7) return band6;

  const band8: Gen2Func[] = [...band6, gen2ReciprocalSum, gen2Pythagorean];
  return band8;
}

export function generateSubstitution(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  if (clamped >= 4 && rng() > 0.5) {
    const varA = pick(rng, ALL_VARS);
    const varB = pickExclude(rng, ALL_VARS, [varA]);
    const integerOnly = INTEGER_ONLY.has(varA) || INTEGER_ONLY.has(varB);
    const twoVarPool = twoVarPoolFor(clamped, integerOnly);
    if (twoVarPool.length > 0) {
      for (let attempt = 0; attempt < 15; attempt++) {
        const gen = pick(rng, twoVarPool);
        const result = gen({ rng, varA, varB, complexity: clamped, integerOnly });
        const ex: Exercise = {
          prompt: result.term,
          answer: result.answer,
          data: {
            variable: varA,
            value: result.valueA,
            varB,
            valueB: result.valueB,
            term: result.term,
            complexity: clamped,
          },
        };
        if (isValidExercise(ex)) return ex;
      }
    }
  }

  const variable = pick(rng, ALL_VARS);
  const integerOnly = INTEGER_ONLY.has(variable);
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

export function generateSubstitutionExercise(seed: number, complexity: number): Exercise {
  const ex = generateSubstitution(seed, complexity);
  const data = ex.data as SubstitutionData;

  const isFraction = ex.answer.includes('/');
  const promptKey = data.varB && data.valueB ? 'exercise.substitution.promptTwo' : 'exercise.substitution.prompt';
  const promptArgs =
    data.varB && data.valueB ? [data.variable, data.value, data.varB, data.valueB] : [data.variable, data.value];

  if (isFraction) {
    // FractionInputCard expects comma-separated num,den for correctLatex and getSubmitValue
    const answer = ex.answer.replace('/', ',');
    return { ...ex, pattern: 'fraction-input', prompt: data.term, answer, data: { ...data, promptKey, promptArgs } };
  }
  return { ...ex, pattern: 'text-input', prompt: `${data.term} = ?`, data: { ...data, promptKey, promptArgs } };
}

function normalizeFrac(s: string): string {
  return s.replace(/,/g, '/');
}

export function validateSubstitution(answer: string, exercise: Exercise): boolean {
  const a = answer.trim();
  const expected = exercise.answer;

  if (a === expected || normalizeFrac(a) === normalizeFrac(expected)) return true;

  const aParsed = parseFrac(normalizeFrac(a));
  const eParsed = parseFrac(normalizeFrac(expected));

  if (aParsed === null || eParsed === null) return false;

  return aParsed[0] * eParsed[1] === eParsed[0] * aParsed[1];
}
