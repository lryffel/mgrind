import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt, pick } from '../math/rng';
import { clampComplexity } from '../math/number';

const ADD_TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [9, 12, 15],
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
];

type SubGen = (rng: () => number) => Exercise;

function genADiffBPlusC(rng: () => number): Exercise {
  const b = randInt(rng, 1, 5);
  const c = randInt(rng, 1, 5);
  const sum = b + c;
  const a = randInt(rng, sum + 1, Math.min(sum + 5, 19));
  return { prompt: `${a} - (${b} + ${c}) = ?`, answer: String(a - sum), pattern: 'text-input' };
}

function genADiffBMinusC(rng: () => number): Exercise {
  const b = randInt(rng, 2, 6);
  const c = randInt(rng, 1, b - 1);
  const diff = b - c;
  const a = randInt(rng, diff + 1, Math.min(diff + 5, 19));
  return { prompt: `${a} - (${b} - ${c}) = ?`, answer: String(a - diff), pattern: 'text-input' };
}

function genATimesBPlusC(rng: () => number): Exercise {
  const a = randInt(rng, 2, 3);
  const b = randInt(rng, 1, 3);
  const c = randInt(rng, 1, 3);
  return { prompt: `${a} \\cdot (${b} + ${c}) = ?`, answer: String(a * (b + c)), pattern: 'text-input' };
}

function genATimesBMinusC(rng: () => number): Exercise {
  const a = randInt(rng, 2, 3);
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 1, b - 1);
  return { prompt: `${a} \\cdot (${b} - ${c}) = ?`, answer: String(a * (b - c)), pattern: 'text-input' };
}

function genAPlusBCTimes(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 2, 4);
  const prod = b * c;
  const a = randInt(rng, 1, 19 - prod);
  return { prompt: `${a} + ${b} \\cdot ${c} = ?`, answer: String(a + prod), pattern: 'text-input' };
}

function genAMinusBCTimes(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 2, 4);
  const prod = b * c;
  const a = randInt(rng, prod + 1, Math.min(prod + 5, 19));
  return { prompt: `${a} - ${b} \\cdot ${c} = ?`, answer: String(a - prod), pattern: 'text-input' };
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
  return { prompt: `${a} + ${b} \\cdot ${c}^{2} = ?`, answer: String(a + prod), pattern: 'text-input' };
}

function genAMinusBC2(rng: () => number): Exercise {
  const c = pick(rng, [2, 3]);
  const c2 = c * c;
  const bMax = c === 3 ? 2 : 3;
  const b = randInt(rng, 2, bMax);
  const prod = b * c2;
  const a = randInt(rng, prod + 1, Math.min(prod + 5, 19));
  return { prompt: `${a} - ${b} \\cdot ${c}^{2} = ?`, answer: String(a - prod), pattern: 'text-input' };
}

function genAPlusBCSq(rng: () => number): Exercise {
  const a = randInt(rng, 1, 3);
  return { prompt: `${a} + (2 \\cdot 2)^{2} = ?`, answer: String(a + 16), pattern: 'text-input' };
}

function genAMinusBCSq(rng: () => number): Exercise {
  const a = randInt(rng, 17, 19);
  return { prompt: `${a} - (2 \\cdot 2)^{2} = ?`, answer: String(a - 16), pattern: 'text-input' };
}

function genNegPowerTrap(rng: () => number): Exercise {
  const a = randInt(rng, 2, 5);
  const n = pick(rng, [2, 3]);
  return { prompt: `-${a}^{${n}} = ?`, answer: String(-Math.pow(a, n)), pattern: 'text-input' };
}

function genPowerThenAddNegBase(rng: () => number): Exercise {
  const a = randInt(rng, 2, 4);
  const n = pick(rng, [2, 3]);
  const absPower = Math.pow(a, n);
  const powerValue = n % 2 === 0 ? absPower : -absPower;
  const minK = Math.max(1, -20 - powerValue);
  const maxK = Math.min(30, 80 - powerValue);
  const k = randInt(rng, minK, maxK);
  const result = powerValue + k;
  return { prompt: `(-${a})^{${n}} + ${k} = ?`, answer: String(result), pattern: 'text-input' };
}

const band4: SubGen[] = [
  genAPlusBC2,
  genAMinusBC2,
  genAPlusBCSq,
  genAMinusBCSq,
  genNegPowerTrap,
  genPowerThenAddNegBase,
];

function genAPlusBPlusCSq(rng: () => number): Exercise {
  const b = randInt(rng, 1, 2);
  const c = randInt(rng, 1, 3 - b);
  const sumSq = (b + c) * (b + c);
  const a = randInt(rng, 1, 19 - sumSq);
  return { prompt: `${a} + (${b} + ${c})^{2} = ?`, answer: String(a + sumSq), pattern: 'text-input' };
}

function genAPlusBMinusCSq(rng: () => number): Exercise {
  const b = randInt(rng, 2, 4);
  const c = randInt(rng, 1, b - 1);
  const diffSq = (b - c) * (b - c);
  const a = randInt(rng, 1, 19 - diffSq);
  return { prompt: `${a} + (${b} - ${c})^{2} = ?`, answer: String(a + diffSq), pattern: 'text-input' };
}

function gen2PowNPlusM(rng: () => number): Exercise {
  const total = randInt(rng, 2, 10);
  const n = randInt(rng, 1, total - 1);
  const m = total - n;
  return { prompt: `2^{${n} + ${m}} = ?`, answer: String(Math.pow(2, total)), pattern: 'text-input' };
}

function gen2PowNMinusM(rng: () => number): Exercise {
  const n = randInt(rng, 2, 10);
  const m = randInt(rng, 1, n - 1);
  return { prompt: `2^{${n} - ${m}} = ?`, answer: String(Math.pow(2, n - m)), pattern: 'text-input' };
}

function genFreshmanTrap(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 2, 6);
    const b = randInt(rng, 2, 6);
    const sum = a + b;
    if (sum > 10) continue;
    const sumSq = sum * sum;
    const c = randInt(rng, 1, Math.min(sumSq - 2, 25));
    return { prompt: `(${a} + ${b})^{2} - ${c} = ?`, answer: String(sumSq - c), pattern: 'text-input' };
  }
  return { prompt: `(2 + 2)^{2} - 1 = ?`, answer: '15', pattern: 'text-input' };
}

function genNestedParens(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 2, 5);
    const b = randInt(rng, 1, 9);
    const c = randInt(rng, 2, 6);
    const d = randInt(rng, 1, 6);
    const result = a * (b + c * d);
    if (result > 100) continue;
    return { prompt: `${a} \\cdot (${b} + ${c} \\cdot ${d}) = ?`, answer: String(result), pattern: 'text-input' };
  }
  return { prompt: `2 \\cdot (1 + 2 \\cdot 3) = ?`, answer: '14', pattern: 'text-input' };
}

function genDoubleWrapped(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 1, 5);
    const b = randInt(rng, 1, 5);
    const sum = a + b;
    if (sum < 2 || sum > 8) continue;
    const c = randInt(rng, 2, 5);
    const inner = sum * c;
    if (inner < 3 || inner > 10) continue;
    return { prompt: `((${a} + ${b}) \\cdot ${c})^{2} = ?`, answer: String(inner * inner), pattern: 'text-input' };
  }
  return { prompt: `((1 + 2) \\cdot 3)^{2} = ?`, answer: '81', pattern: 'text-input' };
}

function genRadicalPlusParens(rng: () => number): Exercise {
  const sq = pick(rng, [4, 9, 16, 25]);
  const root = Math.sqrt(sq);
  const b = randInt(rng, 1, 9);
  const c = randInt(rng, 2, 6);
  const result = (root + b) * c;
  return { prompt: `(\\sqrt{${sq}} + ${b}) \\cdot ${c} = ?`, answer: String(result), pattern: 'text-input' };
}

function genBridgePythagoras(rng: () => number): Exercise {
  const [a, b, d] = pick(rng, [
    [3, 4, 5],
    [4, 3, 5],
    [6, 8, 10],
    [8, 6, 10],
  ]);
  const c = randInt(rng, 2, 6);
  const e = randInt(rng, 1, 6);
  return {
    prompt: `\\sqrt{${a}^{2} + ${b}^{2}} + ${c} \\cdot ${e} = ?`,
    answer: String(d + c * e),
    pattern: 'text-input',
  };
}

function genThreeOpSqrt(rng: () => number): Exercise {
  const sq = pick(rng, [4, 9, 16, 25]);
  const root = Math.sqrt(sq);
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 10, 19);
    const b = randInt(rng, 2, 6);
    const d = randInt(rng, 1, Math.min(a + b * root - 1, 19));
    const result = a + b * root - d;
    if (result < 1) continue;
    return { prompt: `${a} + ${b} \\cdot \\sqrt{${sq}} - ${d} = ?`, answer: String(result), pattern: 'text-input' };
  }
  return { prompt: `10 + 2 \\cdot \\sqrt{4} - 1 = ?`, answer: '13', pattern: 'text-input' };
}

const TWO_RADICAL_PAIRS: [number, number, number][] = [
  [2, 8, 4],
  [8, 2, 4],
  [2, 18, 6],
  [3, 12, 6],
  [12, 3, 6],
  [18, 2, 6],
];

function genTwoRadicals(rng: () => number): Exercise {
  const [a, b, r] = pick(rng, TWO_RADICAL_PAIRS);
  const sq2 = pick(rng, [4, 9, 16]);
  const d = randInt(rng, 1, 6);
  return {
    prompt: `\\sqrt{${a} \\cdot ${b}} + \\sqrt{${sq2}} \\cdot ${d} = ?`,
    answer: String(r + Math.sqrt(sq2) * d),
  };
}

function genDiffSqDistractor(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 5, 9);
    const b = randInt(rng, 1, a - 2);
    const diffSq = (a - b) * (a - b);
    const c = randInt(rng, 2, 6);
    const d = randInt(rng, 1, 6);
    const result = diffSq + c * d;
    if (result > 100) continue;
    return { prompt: `(${a} - ${b})^{2} + ${c} \\cdot ${d} = ?`, answer: String(result), pattern: 'text-input' };
  }
  return { prompt: `(5 - 1)^{2} + 2 \\cdot 1 = ?`, answer: '18', pattern: 'text-input' };
}

function genPowerDiffNegBases(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 1, 4);
    const b = randInt(rng, 1, 4);
    const n = pick(rng, [2, 3]);
    const m = pick(rng, [2, 3]);
    const valA = (n % 2 === 0 ? 1 : -1) * Math.pow(a, n);
    const valB = (m % 2 === 0 ? 1 : -1) * Math.pow(b, m);
    const result = valA - valB;
    if (result !== 0 && Math.abs(result) <= 100) {
      return { prompt: `(-${a})^{${n}} - (-${b})^{${m}} = ?`, answer: String(result), pattern: 'text-input' };
    }
  }
  return { prompt: '(-2)^{2} - (-1)^{3} = ?', answer: '5', pattern: 'text-input' };
}

const band6: SubGen[] = [
  genAPlusBPlusCSq,
  genAPlusBMinusCSq,
  gen2PowNPlusM,
  gen2PowNMinusM,
  genFreshmanTrap,
  genNestedParens,
  genDoubleWrapped,
  genRadicalPlusParens,
  genBridgePythagoras,
  genThreeOpSqrt,
  genTwoRadicals,
  genDiffSqDistractor,
  genPowerDiffNegBases,
];

function genCPlusSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 1, 10);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} + \\sqrt{${inner}} = ?`, answer: String(c + d), pattern: 'text-input' };
}

function genCMinusSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, d + 1, d + 5);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} - \\sqrt{${inner}} = ?`, answer: String(c - d), pattern: 'text-input' };
}

function genSqrtA2PmB2PlusC(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 1, 10);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `\\sqrt{${inner}} + ${c} = ?`, answer: String(d + c), pattern: 'text-input' };
}

function genSqrtA2PmB2MinusC(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 1, Math.min(d - 1, 8));
  if (c === 0) {
    return genSqrtA2PmB2PlusC(rng);
  }
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `\\sqrt{${inner}} - ${c} = ?`, answer: String(d - c), pattern: 'text-input' };
}

function genCTimesSqrtA2PmB2(rng: () => number): Exercise {
  const useAdd = rng() > 0.5;
  const [a, b, d] = pick(rng, useAdd ? ADD_TRIPLES : SUB_TRIPLES);
  const c = randInt(rng, 2, 5);
  const inner = useAdd ? `${a}^{2} + ${b}^{2}` : `${a}^{2} - ${b}^{2}`;
  return { prompt: `${c} \\cdot \\sqrt{${inner}} = ?`, answer: String(c * d), pattern: 'text-input' };
}

function genHypotenuseOuterParens(rng: () => number): Exercise {
  const [b, c, h] = pick(rng, [
    [3, 4, 5],
    [4, 3, 5],
    [6, 8, 10],
    [8, 6, 10],
  ]);
  const a = randInt(rng, 1, 9);
  const d = randInt(rng, 2, 6);
  return {
    prompt: `(${a} + \\sqrt{${b}^{2} + ${c}^{2}}) \\cdot ${d} = ?`,
    answer: String((a + h) * d),
    pattern: 'text-input',
  };
}

function genHypotenuseTimesPlus(rng: () => number): Exercise {
  const [a, b, h] = pick(rng, [
    [3, 4, 5],
    [4, 3, 5],
    [5, 12, 13],
    [12, 5, 13],
    [6, 8, 10],
    [8, 6, 10],
  ]);
  const c = randInt(rng, 2, 6);
  const d = randInt(rng, 1, 19);
  return {
    prompt: `\\sqrt{${a}^{2} + ${b}^{2}} \\cdot ${c} + ${d} = ?`,
    answer: String(h * c + d),
    pattern: 'text-input',
  };
}

function genTwoRootsParen(rng: () => number): Exercise {
  const [a, b, h] = pick(rng, [
    [3, 4, 5],
    [4, 3, 5],
    [6, 8, 10],
    [8, 6, 10],
  ]);
  const sq = pick(rng, [4, 9, 16, 25]);
  const root = Math.sqrt(sq);
  const d = randInt(rng, 2, 6);
  return {
    prompt: `(\\sqrt{${a}^{2} + ${b}^{2}} + \\sqrt{${sq}}) \\cdot ${d} = ?`,
    answer: String((h + root) * d),
    pattern: 'text-input',
  };
}

function genDiffInsideTimes(rng: () => number): Exercise {
  const [a, b, d] = pick(rng, [
    [5, 3, 4],
    [10, 6, 8],
    [10, 8, 6],
  ]);
  const c = randInt(rng, 2, 5);
  const e = randInt(rng, 1, 5);
  const f = randInt(rng, 1, 5);
  return {
    prompt: `\\sqrt{${a}^{2} - ${b}^{2}} \\cdot ${c} + ${e} \\cdot ${f} = ?`,
    answer: String(d * c + e * f),
    pattern: 'text-input',
  };
}

function genPowerMultSubNegBase(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const a = randInt(rng, 1, 3);
    const n = pick(rng, [2, 3]);
    const b = randInt(rng, 2, 6);
    const c = randInt(rng, 1, 50);
    const absPower = Math.pow(a, n);
    const powerValue = n % 2 === 0 ? absPower : -absPower;
    const result = powerValue * b - c;
    if (result > -100 && result < 100) {
      return { prompt: `(-${a})^{${n}} \\cdot ${b} - ${c} = ?`, answer: String(result), pattern: 'text-input' };
    }
  }
  return { prompt: '(-2)^{2} \\cdot 3 - 1 = ?', answer: '11', pattern: 'text-input' };
}

function genClimax(rng: () => number): Exercise {
  for (let i = 0; i < 100; i++) {
    const [b, c, h] = pick(rng, [
      [3, 4, 5],
      [4, 3, 5],
      [6, 8, 10],
      [8, 6, 10],
    ]);
    const a = randInt(rng, 2, 6);
    const d = randInt(rng, 2, 4);
    const e = randInt(rng, 1, 19);
    const result = a * h - d * d + e;
    if (result < 1 || result > 100) continue;
    return {
      prompt: `${a} \\cdot \\sqrt{${b}^{2} + ${c}^{2}} - ${d}^{2} + ${e} = ?`,
      answer: String(result),
      pattern: 'text-input',
    };
  }
  return { prompt: `2 \\cdot \\sqrt{3^{2} + 4^{2}} - 2^{2} + 1 = ?`, answer: '7', pattern: 'text-input' };
}

const band8: SubGen[] = [
  genCPlusSqrtA2PmB2,
  genCMinusSqrtA2PmB2,
  genSqrtA2PmB2PlusC,
  genSqrtA2PmB2MinusC,
  genCTimesSqrtA2PmB2,
  genHypotenuseOuterParens,
  genHypotenuseTimesPlus,
  genTwoRootsParen,
  genDiffInsideTimes,
  genClimax,
  genPowerMultSubNegBase,
];

export function generateOrderOfOperations(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamp = clampComplexity(complexity, 10);
  let pool: SubGen[];
  if (clamp <= 3) {
    pool = band0;
  } else if (clamp <= 5) {
    pool = [...band0, ...band4];
  } else if (clamp <= 7) {
    pool = [...band0, ...band4, ...band6];
  } else {
    pool = [...band0, ...band4, ...band6, ...band8];
  }
  const gen = pick(rng, pool);
  return gen(rng);
}
