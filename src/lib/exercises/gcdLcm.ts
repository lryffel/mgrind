import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { clampComplexity, gcd } from '../math/number';
import { randInt, pickDistinct } from '../math/rng';

export interface GcdLcmData {
  subType: string;
  promptKey?: DictKey;
  primes?: number[];
  a?: number;
  b?: number;
  gcd?: string;
  lcm?: string;
  aLatex?: string;
  bLatex?: string;
  gcdExponents?: string;
  lcmExponents?: string;
}

const MODE_A_CONFIG: Record<number, { pool: number[]; shared: number; onlyEach: number; emax: number }> = {
  0: { pool: [2, 3], shared: 1, onlyEach: 0, emax: 2 },
  1: { pool: [2, 3], shared: 1, onlyEach: 0, emax: 2 },
  2: { pool: [2, 3, 5], shared: 1, onlyEach: 1, emax: 2 },
  3: { pool: [2, 3, 5], shared: 1, onlyEach: 1, emax: 2 },
  4: { pool: [2, 3, 5, 7], shared: 2, onlyEach: 1, emax: 3 },
  5: { pool: [2, 3, 5, 7], shared: 2, onlyEach: 1, emax: 3 },
  6: { pool: [2, 3, 5, 7, 11], shared: 2, onlyEach: 1, emax: 4 },
  7: { pool: [2, 3, 5, 7, 11], shared: 2, onlyEach: 1, emax: 4 },
  8: { pool: [2, 3, 5, 7, 11], shared: 3, onlyEach: 2, emax: 4 },
  9: { pool: [2, 3, 5, 7, 11], shared: 3, onlyEach: 2, emax: 4 },
  10: { pool: [2, 3, 5, 7, 11, 13], shared: 3, onlyEach: 2, emax: 5 },
};

const MODE_B_CONFIG: Record<
  number,
  { gDistinct: [number, number]; gMaxExp: number; xyDistinct: [number, number]; maxAB: number; allowOne: boolean }
> = {
  0: { gDistinct: [1, 1], gMaxExp: 2, xyDistinct: [1, 1], maxAB: 30, allowOne: true },
  1: { gDistinct: [1, 1], gMaxExp: 2, xyDistinct: [1, 1], maxAB: 30, allowOne: true },
  2: { gDistinct: [1, 2], gMaxExp: 2, xyDistinct: [1, 1], maxAB: 60, allowOne: false },
  3: { gDistinct: [1, 2], gMaxExp: 2, xyDistinct: [1, 1], maxAB: 60, allowOne: false },
  4: { gDistinct: [2, 2], gMaxExp: 2, xyDistinct: [1, 2], maxAB: 150, allowOne: false },
  5: { gDistinct: [2, 2], gMaxExp: 2, xyDistinct: [1, 2], maxAB: 150, allowOne: false },
  6: { gDistinct: [2, 3], gMaxExp: 2, xyDistinct: [1, 2], maxAB: 400, allowOne: false },
  7: { gDistinct: [2, 3], gMaxExp: 2, xyDistinct: [1, 2], maxAB: 400, allowOne: false },
  8: { gDistinct: [3, 3], gMaxExp: 2, xyDistinct: [2, 2], maxAB: 1500, allowOne: false },
  9: { gDistinct: [3, 3], gMaxExp: 2, xyDistinct: [2, 2], maxAB: 1500, allowOne: false },
  10: { gDistinct: [3, 3], gMaxExp: 3, xyDistinct: [2, 2], maxAB: 5000, allowOne: false },
};

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function formatFactorization(primes: number[], exponents: number[]): string {
  const parts = primes
    .map((p, i) => ({ p, e: exponents[i] }))
    .filter(({ e }) => e > 0)
    .map(({ p, e }) => (e === 1 ? `${p}` : `${p}^{${e}}`));
  return parts.join(' \\cdot ');
}

function generateCompositeWithPrimeCount(
  rng: () => number,
  distinctMin: number,
  distinctMax: number,
  maxExp: number,
  primePool: number[],
  maxValue: number,
): { value: number; primes: number[]; exponents: number[] } | null {
  for (let attempt = 0; attempt < 100; attempt++) {
    const count = randInt(rng, distinctMin, distinctMax);
    const selected = pickDistinct(rng, primePool, count);
    if (selected.length < count) continue;
    selected.sort((a, b) => a - b);
    const exponents: number[] = [];
    let value = 1;
    let valid = true;
    for (const p of selected) {
      const e = randInt(rng, 1, maxExp);
      for (let i = 0; i < e; i++) {
        value *= p;
        if (value > maxValue) {
          valid = false;
          break;
        }
      }
      exponents.push(e);
      if (!valid) break;
    }
    if (!valid || value > maxValue) continue;
    return { value, primes: selected, exponents };
  }
  return null;
}

function generateModeA(rng: () => number, clamped: number): Exercise {
  const cfg = MODE_A_CONFIG[clamped];
  const pool = cfg.pool;

  for (let attempt = 0; attempt < 500; attempt++) {
    const sharedPrimes = pickDistinct(rng, pool, cfg.shared).sort((a, b) => a - b);
    const remainingA = pool.filter((p) => !sharedPrimes.includes(p));
    const onlyA = pickDistinct(rng, remainingA, cfg.onlyEach);
    const remainingB = pool.filter((p) => !sharedPrimes.includes(p) && !onlyA.includes(p));
    const onlyB = pickDistinct(rng, remainingB, cfg.onlyEach);

    const allPrimes = [...new Set([...sharedPrimes, ...onlyA, ...onlyB])].sort((a, b) => a - b);

    const sharedA = sharedPrimes.map(() => randInt(rng, 1, cfg.emax));
    const sharedB = sharedPrimes.map(() => randInt(rng, 1, cfg.emax));

    const aExponents = allPrimes.map((p) => {
      const idx = sharedPrimes.indexOf(p);
      if (idx !== -1) return sharedA[idx];
      if (onlyA.includes(p)) return randInt(rng, 1, cfg.emax);
      return 0;
    });

    const bExponents = allPrimes.map((p) => {
      const idx = sharedPrimes.indexOf(p);
      if (idx !== -1) return sharedB[idx];
      if (onlyB.includes(p)) return randInt(rng, 1, cfg.emax);
      return 0;
    });

    const gcdExponents = allPrimes.map((_, i) => Math.min(aExponents[i], bExponents[i]));
    const lcmExponents = allPrimes.map((_, i) => Math.max(aExponents[i], bExponents[i]));

    const a = allPrimes.reduce((prod, p, i) => prod * Math.pow(p, aExponents[i]), 1);
    const b = allPrimes.reduce((prod, p, i) => prod * Math.pow(p, bExponents[i]), 1);

    if (a === b) continue;

    const aLatex = formatFactorization(allPrimes, aExponents);
    const bLatex = formatFactorization(allPrimes, bExponents);

    const answer = `${gcdExponents.join(',')};${lcmExponents.join(',')}`;

    return {
      prompt: '',
      answer,
      data: {
        subType: 'factorization',
        aLatex,
        bLatex,
        primes: allPrimes,
        gcdExponents: gcdExponents.join(','),
        lcmExponents: lcmExponents.join(','),
        a,
        b,
        promptKey: 'exercise.gcdLcm.prompt',
      },
    };
  }

  const fallback: number[] = [2];
  return {
    prompt: '',
    answer: '0;0',
    data: {
      subType: 'factorization',
      aLatex: '2^{1}',
      bLatex: '2^{1}',
      primes: fallback,
      gcdExponents: '1',
      lcmExponents: '1',
      a: 2,
      b: 2,
      promptKey: 'exercise.gcdLcm.prompt',
    },
  };
}

const B_POOL = [2, 3, 5, 7, 11, 13, 17];

function generateModeB(rng: () => number, clamped: number): Exercise {
  const cfg = MODE_B_CONFIG[clamped];

  for (let attempt = 0; attempt < 2000; attempt++) {
    const gResult = generateCompositeWithPrimeCount(
      rng,
      cfg.gDistinct[0],
      cfg.gDistinct[1],
      cfg.gMaxExp,
      B_POOL,
      cfg.maxAB,
    );
    if (!gResult) continue;
    const g = gResult.value;
    if (g < 2 || isPrime(g)) continue;

    const maxXY = Math.floor(cfg.maxAB / g);

    const xResult = generateCompositeWithPrimeCount(rng, cfg.xyDistinct[0], cfg.xyDistinct[1], 2, B_POOL, maxXY);
    if (!xResult) continue;
    let x = xResult.value;
    if (x < 2) continue;
    if (cfg.allowOne && rng() < 0.3) {
      x = 1;
    }

    const yResult = generateCompositeWithPrimeCount(rng, cfg.xyDistinct[0], cfg.xyDistinct[1], 2, B_POOL, maxXY);
    if (!yResult) continue;
    let y = yResult.value;
    if (y < 2) continue;
    if (cfg.allowOne && rng() < 0.3) {
      y = 1;
    }

    if (!cfg.allowOne && (x === 1 || y === 1)) continue;

    const a = g * x;
    const b = g * y;

    if (a === b) continue;
    if (isPrime(a) || isPrime(b)) continue;
    if (a > cfg.maxAB || b > cfg.maxAB) continue;
    if (gcd(x, y) !== 1) continue;

    const actualGcd = gcd(a, b);
    const actualLcm = (a * b) / actualGcd;

    if (actualGcd === 1) continue;

    const answer = `${actualGcd},${actualLcm}`;

    return {
      prompt: '',
      answer,
      data: {
        subType: 'numbers',
        a,
        b,
        gcd: String(actualGcd),
        lcm: String(actualLcm),
        promptKey: 'exercise.gcdLcm.prompt',
      },
    };
  }

  return {
    prompt: '',
    answer: '2,4',
    data: {
      subType: 'numbers',
      a: 4,
      b: 8,
      gcd: '4',
      lcm: '8',
      promptKey: 'exercise.gcdLcm.prompt',
    },
  };
}

export function generateGcdLcm(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  if (rng() < 0.5) {
    return generateModeA(rng, clamped);
  }
  return generateModeB(rng, clamped);
}

export function validateGcdLcm(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as GcdLcmData | undefined;
  if (!data) return false;

  if (data.subType === 'factorization') {
    const parts = answer.split(';');
    if (parts.length !== 2) return false;
    const [userGcd, userLcm] = parts;
    const userGcdExp = userGcd.split(',').map(Number);
    const userLcmExp = userLcm.split(',').map(Number);
    const correctGcdExp = (data.gcdExponents ?? '').split(',').map(Number);
    const correctLcmExp = (data.lcmExponents ?? '').split(',').map(Number);

    if (userGcdExp.length !== correctGcdExp.length) return false;
    if (userLcmExp.length !== correctLcmExp.length) return false;

    for (let i = 0; i < userGcdExp.length; i++) {
      if (userGcdExp[i] !== correctGcdExp[i]) return false;
    }
    for (let i = 0; i < userLcmExp.length; i++) {
      if (userLcmExp[i] !== correctLcmExp[i]) return false;
    }
    return true;
  }

  if (data.subType === 'numbers') {
    const parts = answer.split(',');
    if (parts.length !== 2) return false;
    const [userGcd, userLcm] = parts.map(Number);
    if (isNaN(userGcd) || isNaN(userLcm)) return false;
    return userGcd === Number(data.gcd) && userLcm === Number(data.lcm);
  }

  return false;
}
