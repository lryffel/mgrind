import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick } from '../math/rng';
import { clampComplexity } from '../math/number';

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
  [15, 36, 39],
  [16, 30, 34],
  [20, 21, 29],
  [21, 28, 35],
  [24, 32, 40],
  [27, 36, 45],
  [30, 40, 50],
];

const SUB_TRIPLES: [number, number, number][] = [
  [5, 3, 4],
  [5, 4, 3],
  [10, 6, 8],
  [10, 8, 6],
  [13, 5, 12],
  [13, 12, 5],
  [15, 9, 12],
  [15, 12, 9],
  [17, 8, 15],
  [17, 15, 8],
  [20, 12, 16],
  [20, 16, 12],
  [25, 7, 24],
  [25, 15, 20],
  [25, 20, 15],
  [25, 24, 7],
];

type SubGen = (rng: () => number) => Exercise;

function genADiffBPlusC(rng: () => number): Exercise {
  const b = randInt(rng, 1, 5);
  const c = randInt(rng, 1, 5);
  const sum = b + c;
  const a = randInt(rng, sum + 1, Math.min(sum + 5, 19));
  return { prompt: `${a} - (${b} + ${c}) = ?`, answer: String(a - sum) };
}

function genADiffBMinusC(rng: () => number): Exercise {
  const b = randInt(rng, 2, 6);
  const c = randInt(rng, 1, b - 1);
  const diff = b - c;
  const a = randInt(rng, diff + 1, Math.min(diff + 5, 19));
  return { prompt: `${a} - (${b} - ${c}) = ?`, answer: String(a - diff) };
}

function genATimesBPlusC(rng: () => number): Exercise {
  const a = randInt(rng, 2, 3);
  const b = randInt(rng, 1, 3);
  const c = randInt(rng, 1, 3);
  return { prompt: `${a} \\cdot (${b} + ${c}) = ?`, answer: String(a * (b + c)) };
}

function genATimesBMinusC(rng: () => number): Exercise {
  const a = randInt(rng, 2, 3);
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 1, b - 1);
  return { prompt: `${a} \\cdot (${b} - ${c}) = ?`, answer: String(a * (b - c)) };
}

function genAPlusBCTimes(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 2, 4);
  const prod = b * c;
  const a = randInt(rng, 1, 19 - prod);
  return { prompt: `${a} + ${b} \\cdot ${c} = ?`, answer: String(a + prod) };
}

function genAMinusBCTimes(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 2, 4);
  const prod = b * c;
  const a = randInt(rng, prod + 1, Math.min(prod + 5, 19));
  return { prompt: `${a} - ${b} \\cdot ${c} = ?`, answer: String(a - prod) };
}

const band0: SubGen[] = [
  genADiffBPlusC,
  genADiffBMinusC,
  genATimesBPlusC,
  genATimesBMinusC,
  genAPlusBCTimes,
  genAMinusBCTimes,
];

function genAPlusBC2(rng: () => number): Exercise {
  const c = pick(rng, [2, 3]);
  const c2 = c * c;
  const bMax = c === 3 ? 2 : 3;
  const b = randInt(rng, 2, bMax);
  const prod = b * c2;
  const a = randInt(rng, 1, 19 - prod);
  return { prompt: `${a} + ${b} \\cdot ${c}^{2} = ?`, answer: String(a + prod) };
}

function genAMinusBC2(rng: () => number): Exercise {
  const c = pick(rng, [2, 3]);
  const c2 = c * c;
  const bMax = c === 3 ? 2 : 3;
  const b = randInt(rng, 2, bMax);
  const prod = b * c2;
  const a = randInt(rng, prod + 1, Math.min(prod + 5, 19));
  return { prompt: `${a} - ${b} \\cdot ${c}^{2} = ?`, answer: String(a - prod) };
}

function genAPlusBCSq(rng: () => number): Exercise {
  const a = randInt(rng, 1, 3);
  return { prompt: `${a} + (2 \\cdot 2)^{2} = ?`, answer: String(a + 16) };
}

function genAMinusBCSq(rng: () => number): Exercise {
  const a = randInt(rng, 17, 19);
  return { prompt: `${a} - (2 \\cdot 2)^{2} = ?`, answer: String(a - 16) };
}

function genAPlusBPlusCSq(rng: () => number): Exercise {
  const b = randInt(rng, 1, 2);
  const c = randInt(rng, 1, 3 - b);
  const sumSq = (b + c) * (b + c);
  const a = randInt(rng, 1, 19 - sumSq);
  return { prompt: `${a} + (${b} + ${c})^{2} = ?`, answer: String(a + sumSq) };
}

function genAPlusBMinusCSq(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 1, b - 1);
  const diffSq = (b - c) * (b - c);
  const a = randInt(rng, 1, 19 - diffSq);
  return { prompt: `${a} + (${b} - ${c})^{2} = ?`, answer: String(a + diffSq) };
}

function gen2PowNPlusM(rng: () => number): Exercise {
  const total = randInt(rng, 2, 10);
  const n = randInt(rng, 1, total - 1);
  const m = total - n;
  return { prompt: `2^{${n} + ${m}} = ?`, answer: String(Math.pow(2, total)) };
}

function gen2PowNMinusM(rng: () => number): Exercise {
  const n = randInt(rng, 2, 10);
  const m = randInt(rng, 1, n - 1);
  return { prompt: `2^{${n} - ${m}} = ?`, answer: String(Math.pow(2, n - m)) };
}

const band4: SubGen[] = [
  genAPlusBC2,
  genAMinusBC2,
  genAPlusBCSq,
  genAMinusBCSq,
  genAPlusBPlusCSq,
  genAPlusBMinusCSq,
  gen2PowNPlusM,
  gen2PowNMinusM,
];

function genCPlusSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 1, 15);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} + \\sqrt{${inner}} = ?`, answer: String(c + d) };
}

function genCMinusSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, d + 1, d + 10);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} - \\sqrt{${inner}} = ?`, answer: String(c - d) };
}

function genSqrtA2PmB2PlusC(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 1, 15);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `\\sqrt{${inner}} + ${c} = ?`, answer: String(d + c) };
}

function genSqrtA2PmB2MinusC(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = d <= 1 ? 0 : randInt(rng, 1, d - 1);
  if (c === 0) {
    return genSqrtA2PmB2PlusC(rng);
  }
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `\\sqrt{${inner}} - ${c} = ?`, answer: String(d - c) };
}

function genCTimesSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 2, 5);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} \\cdot \\sqrt{${inner}} = ?`, answer: String(c * d) };
}

const band7: SubGen[] = [
  genCPlusSqrtA2PmB2,
  genCMinusSqrtA2PmB2,
  genSqrtA2PmB2PlusC,
  genSqrtA2PmB2MinusC,
  genCTimesSqrtA2PmB2,
];

export function generateOrderOfOperations(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamp = clampComplexity(complexity, 10);
  let pool: SubGen[];
  if (clamp <= 3) {
    pool = band0;
  } else if (clamp <= 6) {
    pool = [...band0, ...band4];
  } else {
    pool = [...band0, ...band4, ...band7];
  }
  const gen = pick(rng, pool);
  return gen(rng);
}
