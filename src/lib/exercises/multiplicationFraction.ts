import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { gcd, clampComplexity, randomCoprimePair } from '../math/number';
import { promptFraction } from '../math/latex';
export interface MultiplicationFractionData {
  num1: number;
  den1: number;
  num2: number;
  den2: number;
  op: string;
  promptKey: DictKey;
  promptArgs?: (string | number)[];
  subType: string;
}

const PROMPT_KEY = 'exercise.multiplicationFraction.prompt';

function getActiveTypes(clamped: number): string[] {
  if (clamped <= 3) return ['frac-mul-frac'];
  if (clamped <= 6) return ['frac-mul-frac', 'frac-mul-int', 'int-mul-frac'];
  return ['frac-mul-frac', 'frac-mul-int', 'int-mul-frac', 'frac-div-frac', 'int-div-frac', 'frac-div-int'];
}

export function generateMultiplicationFraction(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const maxVal = Math.max(10 + clamped, 10);

  const activeTypes = getActiveTypes(clamped);
  const subType = activeTypes[Math.floor(rng() * activeTypes.length)];

  let result: { prompt: string; answer: string; data: Record<string, unknown> };

  switch (subType) {
    case 'frac-mul-frac':
      result = generateFracMulFrac(rng, maxVal);
      break;
    case 'frac-mul-int':
      result = generateFracMulInt(rng, maxVal);
      break;
    case 'int-mul-frac':
      result = generateIntMulFrac(rng, maxVal);
      break;
    case 'frac-div-frac':
      result = generateFracDivFrac(rng, maxVal);
      break;
    case 'int-div-frac':
      result = generateIntDivFrac(rng, maxVal);
      break;
    case 'frac-div-int':
      result = generateFracDivInt(rng, maxVal);
      break;
    default:
      throw new Error(`Unknown subType: ${subType}`);
  }

  return {
    ...result,
    pattern: 'fraction-input',
    data: {
      ...result.data,
      promptKey: PROMPT_KEY,
      subType,
    },
  };
}

function generateFractionPair(rng: () => number, maxVal: number): [number, number, number, number] {
  let a: number, b: number, c: number, d: number;
  const maxF = Math.min(5, Math.max(1, Math.floor(maxVal / 2) - 1));
  const limit = 1000;

  if (rng() < 0.5) {
    const f = 2 + Math.floor(rng() * maxF);
    let a2: number, d2: number;
    let iter = 0;
    do {
      a2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      d2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      iter++;
    } while ((gcd(a2, d2) > 1 || a2 === d2) && iter < limit);
    if (iter >= limit) {
      a2 = 1;
      d2 = 2;
    }

    a = a2 * f;
    d = d2 * f;

    iter = 0;
    do {
      b = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(a, b) !== 1 && iter < limit);
    if (iter >= limit) b = a + 1;

    iter = 0;
    do {
      c = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(c, d) !== 1 && iter < limit);
    if (iter >= limit) c = d + 1;
  } else {
    const f = 2 + Math.floor(rng() * maxF);
    let c2: number, b2: number;
    let iter = 0;
    do {
      c2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      b2 = 1 + Math.floor(rng() * Math.max(1, Math.floor(maxVal / f) - 1));
      iter++;
    } while ((gcd(c2, b2) > 1 || c2 === b2) && iter < limit);
    if (iter >= limit) {
      c2 = 1;
      b2 = 2;
    }

    c = c2 * f;
    b = b2 * f;

    iter = 0;
    do {
      a = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(a, b) !== 1 && iter < limit);
    if (iter >= limit) a = b + 1;

    iter = 0;
    do {
      d = 2 + Math.floor(rng() * (maxVal - 1));
      iter++;
    } while (gcd(c, d) !== 1 && iter < limit);
    if (iter >= limit) d = c + 1;
  }

  return [a, b, c, d];
}

function generateFracMulFrac(rng: () => number, maxVal: number) {
  const [a, b, c, d] = generateFractionPair(rng, maxVal);

  const prodNum = a * c;
  const prodDen = b * d;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `${promptFraction(a, b)} \\cdot ${promptFraction(c, d)}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: a, den1: b, num2: c, den2: d, op: '*' },
  };
}

function generateFracMulInt(rng: () => number, maxVal: number) {
  const [a, b] = randomCoprimePair(rng, 2, maxVal);

  const factors: number[] = [];
  for (let i = 2; i <= b; i++) {
    if (b % i === 0) factors.push(i);
  }
  const f = factors.length > 0 ? factors[Math.floor(rng() * factors.length)] : b;
  const maxK = Math.max(1, Math.floor(maxVal / f));
  const k = 1 + Math.floor(rng() * Math.max(1, maxK - 1));
  const c = k * f;

  const prodNum = a * c;
  const prodDen = b;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `${promptFraction(a, b)} \\cdot ${c}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: a, den1: b, num2: c, den2: 1, op: '*' },
  };
}

function generateIntMulFrac(rng: () => number, maxVal: number) {
  const [a, b] = randomCoprimePair(rng, 2, maxVal);

  const factors: number[] = [];
  for (let i = 2; i <= b; i++) {
    if (b % i === 0) factors.push(i);
  }
  const f = factors.length > 0 ? factors[Math.floor(rng() * factors.length)] : b;
  const maxK = Math.max(1, Math.floor(maxVal / f));
  const k = 1 + Math.floor(rng() * Math.max(1, maxK - 1));
  const c = k * f;

  const prodNum = a * c;
  const prodDen = b;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `${c} \\cdot ${promptFraction(a, b)}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: c, den1: 1, num2: a, den2: b, op: '*' },
  };
}

function generateFracDivFrac(rng: () => number, maxVal: number) {
  const [a, b, c, d] = generateFractionPair(rng, maxVal);

  const prodNum = a * d;
  const prodDen = b * c;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `\\frac{\\;\\dfrac{${a}}{${b}}\\;}{\\;\\dfrac{${c}}{${d}}\\;}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: a, den1: b, num2: c, den2: d, op: '/' },
  };
}

function generateIntDivFrac(rng: () => number, maxVal: number) {
  const x = 2 + Math.floor(rng() * Math.max(1, maxVal - 1));
  const [c, d] = randomCoprimePair(rng, 2, maxVal);

  const prodNum = x * d;
  const prodDen = c;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `\\frac{\\;${x}\\;}{\\;\\dfrac{${c}}{${d}}\\;}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: x, den1: 1, num2: c, den2: d, op: '/' },
  };
}

function generateFracDivInt(rng: () => number, maxVal: number) {
  const [a, b] = randomCoprimePair(rng, 2, maxVal);
  const y = 2 + Math.floor(rng() * Math.max(1, maxVal - 1));

  const prodNum = a;
  const prodDen = b * y;
  const g = gcd(prodNum, prodDen);

  return {
    prompt: `\\frac{\\;\\dfrac{${a}}{${b}}\\;}{\\;${y}\\;}`,
    answer: `${prodNum / g},${prodDen / g}`,
    data: { num1: a, den1: b, num2: y, den2: 1, op: '/' },
  };
}
