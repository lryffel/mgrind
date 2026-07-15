import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { clampComplexity, gcd } from '../math/number';
import { pick, randInt } from '../math/rng';

export interface CompareFractionsComparison {
  num1: number;
  den1: number;
  num2: number;
  den2: number;
  correctOperator: string;
}

export interface CompareFractionsData {
  rows: { latex: string; latex2: string }[];
  buttons: string[];
  promptKey: DictKey;
}

function getOperator(num1: number, den1: number, num2: number, den2: number): string {
  const left = num1 * den2;
  const right = num2 * den1;
  if (left < right) return '<';
  if (left > right) return '>';
  return '=';
}

function pickDen(rng: () => number, lo: number, hi: number): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const v = randInt(rng, lo, hi);
    if (v === 0) continue;
    return v;
  }
  return lo;
}

function pickNum(rng: () => number, lo: number, hi: number): number {
  return randInt(rng, lo, hi);
}

function generateSameDenominator(rng: () => number, maxVal: number): CompareFractionsComparison {
  const den = Math.max(2, pickDen(rng, 3, Math.max(4, maxVal)));
  let num1 = pickNum(rng, 1, den - 1);
  let num2 = pickNum(rng, 1, den - 1);
  if (num1 === num2) {
    num2 = num2 === den - 1 ? 1 : num2 + 1;
  }
  if (rng() < 0.5) [num1, num2] = [num2, num1];
  return { num1, den1: den, num2, den2: den, correctOperator: getOperator(num1, den, num2, den) };
}

function generateSameNumerator(rng: () => number, maxVal: number): CompareFractionsComparison {
  const num = Math.max(2, pickNum(rng, 2, Math.max(3, Math.floor(maxVal * 0.6))));
  let den1 = pickDen(rng, num + 1, Math.max(num + 2, maxVal));
  let den2 = pickDen(rng, num + 1, Math.max(num + 2, maxVal));
  if (den1 === den2) {
    den2 = den2 + 1;
  }
  if (rng() < 0.5) [den1, den2] = [den2, den1];
  return { num1: num, den1, num2: num, den2, correctOperator: getOperator(num, den1, num, den2) };
}

function generateObvious(rng: () => number, maxVal: number): CompareFractionsComparison {
  let num1 = pickNum(rng, 1, Math.max(2, Math.floor(maxVal * 0.4)));
  let den1 = pickDen(rng, Math.max(3, num1 + 1), Math.max(num1 + 2, Math.floor(maxVal * 0.6)));
  if (gcd(num1, den1) !== 1) {
    num1 = 1;
    den1 = Math.max(3, Math.floor(maxVal * 0.5));
  }
  let num2 = pickNum(rng, num1 + 1, Math.max(num1 + 2, maxVal));
  let den2 = pickDen(rng, 2, Math.max(3, den1 - 1));
  if (den2 >= den1) den2 = Math.max(2, den1 - 1);
  if (gcd(num2, den2) !== 1) {
    num2 = num1 + 1;
    den2 = Math.max(2, den1 - 1);
  }
  if (rng() < 0.5) {
    return { num1, den1, num2, den2, correctOperator: getOperator(num1, den1, num2, den2) };
  } else {
    return { num1: num2, den1: den2, num2: num1, den2: den1, correctOperator: getOperator(num2, den2, num1, den1) };
  }
}

const LCM_POOL = [3, 4, 5, 7];

function generateLcmFriendly(rng: () => number): CompareFractionsComparison {
  const pool = pickDistinct(rng, LCM_POOL, 2);
  const d1 = pool[0];
  let d2 = pool[1];
  if (d1 === d2) d2 = d2 === 7 ? 3 : d2 + 1;
  const num1 = pickNum(rng, 1, d1 - 1);
  let num2 = pickNum(rng, 1, d2 - 1);
  if (num1 * d2 === num2 * d1) {
    num2 = num2 === d2 - 1 ? 1 : num2 + 1;
  }
  if (rng() < 0.5) {
    return { num1, den1: d1, num2, den2: d2, correctOperator: getOperator(num1, d1, num2, d2) };
  } else {
    return { num1: num2, den1: d2, num2: num1, den2: d1, correctOperator: getOperator(num2, d2, num1, d1) };
  }
}

function generateClosePair(
  rng: () => number,
  maxVal: number,
  gMin: number,
  gMax: number,
): CompareFractionsComparison | null {
  for (let attempt = 0; attempt < 100; attempt++) {
    const b = pickDen(rng, 3, maxVal);
    let d = pickDen(rng, 3, maxVal);
    if (d === b) d = d === maxVal ? b - 1 : d + 1;
    if (d < 2 || b < 2) continue;

    const aMax = Math.min(b - 1, maxVal);
    const a = pickNum(rng, 1, aMax);
    if (gcd(a, b) !== 1) continue;

    const targetC = (a * d) / b;
    const candidates = [Math.floor(targetC), Math.ceil(targetC)];

    for (const c of candidates) {
      if (c < 1 || c >= d) continue;
      if (gcd(c, d) !== 1) continue;
      if (c * b === a * d) continue;

      const gap = Math.abs(b * c - a * d);
      if (gap < gMin || gap > gMax) continue;

      const left = a * d;
      const right = c * b;
      const smallerOnLeft = left < right;
      const hiNum = smallerOnLeft ? c : a;
      const loNum = smallerOnLeft ? a : c;
      const hiDen = smallerOnLeft ? d : b;
      const loDen = smallerOnLeft ? b : d;
      if (hiNum > loNum && hiDen < loDen) continue;

      if (rng() < 0.5) {
        return { num1: a, den1: b, num2: c, den2: d, correctOperator: left < right ? '<' : '>' };
      } else {
        return { num1: c, den1: d, num2: a, den2: b, correctOperator: left < right ? '>' : '<' };
      }
    }
  }
  return null;
}

const FALLBACK_PAIRS: [number, number, number, number][] = [
  [3, 7, 5, 12],
  [4, 9, 5, 11],
  [4, 11, 7, 19],
  [2, 5, 3, 7],
];

function generateCloseFallback(rng: () => number): CompareFractionsComparison {
  const [num1, den1, num2, den2] = pick(rng, FALLBACK_PAIRS);
  return { num1, den1, num2, den2, correctOperator: getOperator(num1, den1, num2, den2) };
}

function generateImproperPair(rng: () => number, maxVal: number): CompareFractionsComparison {
  if (rng() < 0.5) {
    const num1 = pickDen(rng, 2, Math.floor(maxVal * 0.5));
    const den1 = pickDen(rng, num1 + 1, Math.max(num1 + 2, maxVal));
    const num2 = randInt(rng, Math.floor(maxVal * 0.3) + 1, Math.floor(maxVal * 0.7));
    const den2 = randInt(rng, 2, Math.max(2, Math.floor(maxVal * 0.3)));
    return { num1, den1, num2, den2, correctOperator: getOperator(num1, den1, num2, den2) };
  } else {
    const num1 = randInt(rng, Math.floor(maxVal * 0.3) + 1, Math.floor(maxVal * 0.7));
    const den1 = randInt(rng, 2, Math.max(2, Math.floor(maxVal * 0.3)));
    const num2 = pickDen(rng, 2, Math.floor(maxVal * 0.5));
    const den2 = pickDen(rng, num2 + 1, Math.max(num2 + 2, maxVal));
    return { num1, den1, num2, den2, correctOperator: getOperator(num1, den1, num2, den2) };
  }
}

function generateZeroPair(rng: () => number, maxVal: number): CompareFractionsComparison {
  const zeroOnLeft = rng() < 0.5;
  const num = pickNum(rng, 1, Math.max(1, Math.floor(maxVal * 0.5)));
  const den = Math.max(2, pickDen(rng, 2, Math.max(2, Math.floor(maxVal * 0.6))));
  if (zeroOnLeft) {
    return { num1: 0, den1: den, num2: num, den2: den, correctOperator: '<' };
  } else {
    return { num1: num, den1: den, num2: 0, den2: den, correctOperator: '>' };
  }
}

function generateNegativePair(rng: () => number, maxVal: number): CompareFractionsComparison {
  const bothNegative = rng() < 0.5;
  if (bothNegative) {
    const num1 = pickNum(rng, 1, Math.floor(maxVal * 0.4));
    const den1 = pickDen(rng, num1 + 1, Math.max(num1 + 2, Math.floor(maxVal * 0.6)));
    const num2 = pickNum(rng, 1, Math.floor(maxVal * 0.4));
    let den2 = pickDen(rng, num2 + 1, Math.max(num2 + 2, Math.floor(maxVal * 0.6)));
    if (den1 === den2 && num1 === num2) den2 = den2 + 1;

    const c = getOperator(num1, den1, num2, den2);
    const op = c === '<' ? '>' : c === '>' ? '<' : c;
    if (rng() < 0.5) {
      return { num1: -num1, den1, num2: -num2, den2, correctOperator: op };
    } else {
      const flipped = op === '<' ? '>' : op === '>' ? '<' : '=';
      return { num1: -num2, den1: den2, num2: -num1, den2: den1, correctOperator: flipped };
    }
  } else {
    const posNum = pickNum(rng, 1, Math.floor(maxVal * 0.4));
    const posDen = pickDen(rng, posNum + 1, Math.max(posNum + 2, Math.floor(maxVal * 0.6)));
    const negNum = pickNum(rng, 1, Math.floor(maxVal * 0.4));
    const negDen = pickDen(rng, negNum + 1, Math.max(negNum + 2, Math.floor(maxVal * 0.6)));
    if (rng() < 0.5) {
      return { num1: -negNum, den1: negDen, num2: posNum, den2: posDen, correctOperator: '<' };
    } else {
      return { num1: posNum, den1: posDen, num2: -negNum, den2: negDen, correctOperator: '>' };
    }
  }
}

function generateEqualPair(rng: () => number, maxVal: number): CompareFractionsComparison {
  const baseNum = pickNum(rng, 1, Math.floor(maxVal * 0.3));
  const baseDen = pickDen(rng, Math.max(2, baseNum + 1), Math.max(3, Math.floor(maxVal * 0.5)));
  const k = randInt(rng, 2, 4);
  const eqNum = baseNum * k;
  const eqDen = baseDen * k;
  if (rng() < 0.5) {
    return { num1: eqNum, den1: eqDen, num2: baseNum, den2: baseDen, correctOperator: '=' };
  } else {
    return { num1: baseNum, den1: baseDen, num2: eqNum, den2: eqDen, correctOperator: '=' };
  }
}

function pickDistinct<T>(rng: () => number, arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

type Strategy = 'sameDen' | 'sameNum' | 'obvious' | 'lcm' | 'close' | 'improper' | 'zero' | 'negative';

function pickStrategy(rng: () => number, level: number, index: number): Strategy {
  const equalChance = index === 0 ? (rng() < 0.15 ? 1 : 0) : 0;

  if (equalChance) {
    return pick(rng, ['sameDen', 'sameNum', 'close'] as Strategy[]);
  }

  switch (level) {
    case 0:
    case 1:
      return 'sameDen';
    case 2:
      return 'sameNum';
    case 3:
      return pick(rng, ['sameDen', 'obvious'] as Strategy[]);
    case 4:
      return pick(rng, ['lcm', 'sameDen'] as Strategy[]);
    case 5:
      return 'close';
    case 6:
      return pick(rng, ['close', 'improper'] as Strategy[]);
    case 7:
      return pick(rng, ['close', 'improper'] as Strategy[]);
    case 8:
      return pick(rng, ['zero', 'close'] as Strategy[]);
    case 9:
    case 10:
      return pick(rng, ['negative', 'close'] as Strategy[]);
    default:
      return 'close';
  }
}

function generateOne(rng: () => number, level: number, maxVal: number): CompareFractionsComparison {
  if (level >= 3 && rng() < 0.12) {
    return generateEqualPair(rng, maxVal);
  }

  const strategy = pickStrategy(rng, level, 0);

  switch (strategy) {
    case 'sameDen':
      return generateSameDenominator(rng, maxVal);
    case 'sameNum':
      return generateSameNumerator(rng, maxVal);
    case 'obvious':
      return generateObvious(rng, maxVal);
    case 'lcm':
      return generateLcmFriendly(rng);
    case 'close':
      return (
        generateClosePair(rng, maxVal, Math.max(1, 5 - level), Math.max(2, 10 - level)) ?? generateCloseFallback(rng)
      );
    case 'improper':
      return generateImproperPair(rng, maxVal);
    case 'zero':
      return generateZeroPair(rng, maxVal);
    case 'negative':
      return generateNegativePair(rng, maxVal);
  }
}

export function generateCompareFractions(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const count = clamped <= 4 ? 2 : 3;
  const maxVal = Math.max(8, 8 + Math.floor(clamped * 1.8));

  const comparisons: CompareFractionsComparison[] = [];
  for (let i = 0; i < count; i++) {
    comparisons.push(generateOne(rng, clamped, maxVal));
  }

  const answer = comparisons.map((c) => c.correctOperator).join(',');

  return {
    prompt: '',
    answer,
    pattern: 'batch-choice',
    data: {
      promptKey: 'exercise.compareFractions.prompt',
      rows: comparisons.map((c) => ({
        latex: `\\dfrac{${c.num1}}{${c.den1}}`,
        latex2: `\\dfrac{${c.num2}}{${c.den2}}`,
      })),
      buttons: ['<', '=', '>'],
    },
  };
}

export function validateCompareFractions(answer: string, exercise: Exercise): boolean {
  const parts = answer.split(',').map((s) => s.trim());
  const correct = exercise.answer.split(',');
  if (parts.length !== correct.length) return false;
  return parts.every((p, i) => p === correct[i]);
}
