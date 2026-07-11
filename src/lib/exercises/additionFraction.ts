import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { gcd } from '../math/number';
import { promptFraction } from '../math/latex';
import { niceNum, niceMax } from '../math/fraction';

export function generateAdditionFraction(seed: number, complexity: number): Exercise {
  const clamped = Math.min(Math.max(complexity, 0), 10);
  const rng = mulberry32(seed);
  const maxVal = niceMax(clamped);

  if (rng() < 0.5) {
    return generateSameDenominator(rng, maxVal);
  } else {
    return generateCommonFactor(rng, maxVal);
  }
}

function generateSameDenominator(rng: () => number, maxVal: number): Exercise {
  // Pick a nice reduced denominator b for the sum, and a coprime numerator a
  let b = niceNum(rng, maxVal);
  if (b < 2) b = 2;
  let a = 1;
  for (let attempt = 0; attempt < 100; attempt++) {
    a = 1 + Math.floor(rng() * (b - 1));
    if (gcd(a, b) === 1) break;
  }
  if (gcd(a, b) !== 1) {
    a = 1;
    b = Math.max(b, 2);
  }

  // Pick a nice factor to make the unreduced denominator
  const factor = Math.max(2, niceNum(rng, maxVal));

  const totalNum = a * factor;
  const commonDen = b * factor;

  let n1 = 0,
    n2 = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    n1 = 1 + Math.floor(rng() * (totalNum - 2));
    n2 = totalNum - n1;
    const g1 = gcd(n1, commonDen);
    const g2 = gcd(n2, commonDen);
    if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
  }

  const g1 = gcd(n1, commonDen);
  const f1Num = n1 / g1;
  const f1Den = commonDen / g1;

  const g2 = gcd(n2, commonDen);
  const f2Num = n2 / g2;
  const f2Den = commonDen / g2;

  return {
    prompt: `${promptFraction(f1Num, f1Den)} + ${promptFraction(f2Num, f2Den)}`,
    answer: `${a},${b}`,
    data: {
      num1: f1Num,
      den1: f1Den,
      num2: f2Num,
      den2: f2Den,
      op: '+',
      subType: 'sameDenominator',
      promptKey: 'exercise.additionFraction.prompt',
    },
  };
}

function generateCommonFactor(rng: () => number, maxVal: number): Exercise {
  let p = 2,
    q = 3;
  for (let attempt = 0; attempt < 50; attempt++) {
    p = niceNum(rng, maxVal);
    q = niceNum(rng, maxVal);
    if (p !== q && gcd(p, q) === 1) break;
  }
  p = Math.max(2, p);
  q = Math.max(2, q);
  if (p === q || gcd(p, q) !== 1) {
    q = p + 1;
  }

  const factor = Math.max(2, niceNum(rng, maxVal));

  const den1 = p * factor;
  const den2 = q * factor;

  const maxNum = Math.max(den1, den2);
  let n1 = 0,
    n2 = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    const cand1 = 1 + Math.floor(rng() * (maxNum - 1));
    if (gcd(cand1, den1) !== 1) continue;
    const cand2 = 1 + Math.floor(rng() * (maxNum - 1));
    if (gcd(cand2, den2) !== 1) continue;
    n1 = cand1;
    n2 = cand2;
    break;
  }

  const sumNum = n1 * q + n2 * p;
  const commonDen = p * q * factor;
  const g = gcd(sumNum, commonDen);

  return {
    prompt: `${promptFraction(n1, den1)} + ${promptFraction(n2, den2)}`,
    answer: `${sumNum / g},${commonDen / g}`,
    data: {
      num1: n1,
      den1,
      num2: n2,
      den2,
      op: '+',
      subType: 'commonFactor',
      promptKey: 'exercise.additionFraction.prompt',
    },
  };
}
