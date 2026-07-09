import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { gcd, randomCoprimePair } from '../math/number';

export function generateSubtractionFraction(seed: number, complexity: number): Exercise {
  const clamped = Math.min(Math.max(complexity, 0), 10);
  const rng = mulberry32(seed);

  if (rng() < 0.5) {
    return generateSameDenominator(rng, clamped);
  } else {
    return generateCommonFactor(rng, clamped);
  }
}

function generateSameDenominator(rng: () => number, clamped: number): Exercise {
  const minFactor = 2 + Math.floor((clamped * 3) / 10);
  const maxFactor = 5 + Math.floor((clamped * 45) / 10);
  const factor = minFactor + Math.floor(rng() * (maxFactor - minFactor + 1));

  const maxProduct = 50 + Math.floor((clamped * 450) / 10);
  const maxBase = Math.max(3, Math.floor(maxProduct / factor));

  const [pairA, b] = randomCoprimePair(rng, 2, maxBase);
  let a = pairA;

  if (rng() < 0.5) {
    a = -a;
  }

  const totalNum = a * factor;
  const commonDen = b * factor;

  let n1 = 0,
    n2 = 0;
  if (totalNum > 0 && totalNum < commonDen) {
    const maxN2 = commonDen - totalNum - 1;
    for (let attempt = 0; attempt < 100; attempt++) {
      n2 = 1 + Math.floor(rng() * Math.max(1, maxN2));
      n1 = n2 + totalNum;
      const g1 = gcd(n1, commonDen),
        g2 = gcd(n2, commonDen);
      if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
    }
  } else if (totalNum < 0 && -totalNum < commonDen) {
    const absTotal = -totalNum;
    const maxN1 = commonDen - absTotal - 1;
    for (let attempt = 0; attempt < 100; attempt++) {
      n1 = 1 + Math.floor(rng() * Math.max(1, maxN1));
      n2 = n1 + absTotal;
      const g1 = gcd(n1, commonDen),
        g2 = gcd(n2, commonDen);
      if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
    }
  } else if (totalNum > 0) {
    const range = totalNum;
    for (let attempt = 0; attempt < 100; attempt++) {
      n2 = 1 + Math.floor(rng() * range);
      n1 = n2 + totalNum;
      const g1 = gcd(n1, commonDen),
        g2 = gcd(n2, commonDen);
      if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
    }
  } else {
    const absTotal = -totalNum;
    const range = Math.max(commonDen, absTotal);
    for (let attempt = 0; attempt < 100; attempt++) {
      n1 = 1 + Math.floor(rng() * range);
      n2 = n1 + absTotal;
      const g1 = gcd(n1, commonDen),
        g2 = gcd(n2, commonDen);
      if ((g1 > 1 || g2 > 1) && commonDen / g1 !== commonDen / g2) break;
    }
  }

  const g1 = gcd(n1, commonDen);
  const f1Num = n1 / g1;
  const f1Den = commonDen / g1;

  const g2 = gcd(n2, commonDen);
  const f2Num = n2 / g2;
  const f2Den = commonDen / g2;

  return {
    prompt: `\\frac{${f1Num}}{${f1Den}} - \\frac{${f2Num}}{${f2Den}}`,
    answer: `${a},${b}`,
    data: {
      num1: f1Num,
      den1: f1Den,
      num2: f2Num,
      den2: f2Den,
      op: '-',
      subType: 'sameDenominator',
      promptKey: 'exercise.subtractionFraction.prompt',
    },
  };
}

function generateCommonFactor(rng: () => number, clamped: number): Exercise {
  const minF = 2 + Math.floor((clamped * 3) / 10);
  const maxF = 5 + Math.floor((clamped * 45) / 10);
  const factor = minF + Math.floor(rng() * (maxF - minF + 1));

  const maxMult = 3 + Math.floor((clamped * 7) / 10);
  const [p, q] = randomCoprimePair(rng, 2, maxMult);

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
    const diff = cand1 * q - cand2 * p;
    if (diff === 0) continue;
    n1 = cand1;
    n2 = cand2;
    break;
  }

  const diffNum = n1 * q - n2 * p;
  const commonDen = p * q * factor;
  const g = gcd(Math.abs(diffNum), commonDen);

  return {
    prompt: `\\frac{${n1}}{${den1}} - \\frac{${n2}}{${den2}}`,
    answer: `${diffNum / g},${commonDen / g}`,
    data: {
      num1: n1,
      den1,
      num2: n2,
      den2,
      op: '-',
      subType: 'commonFactor',
      promptKey: 'exercise.subtractionFraction.prompt',
    },
  };
}
