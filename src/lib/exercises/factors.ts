import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick, shuffle } from '../math/rng';

export interface FactorsData {
  n: number;
  factors: string;
  promptKey: string;
  options: { latex: string }[];
}

const N_RANGE: [number, number][] = [
  [6, 12],
  [8, 18],
  [12, 24],
  [18, 36],
  [24, 48],
  [30, 60],
  [36, 60],
  [48, 60],
  [60, 60],
  [60, 60],
  [60, 60],
];

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

function getPrimesInRange(min: number, max: number): number[] {
  const primes: number[] = [];
  for (let n = min; n <= max; n++) {
    if (isPrime(n)) primes.push(n);
  }
  return primes;
}

function getSquaresInRange(min: number, max: number): number[] {
  const squares: number[] = [];
  const start = Math.ceil(Math.sqrt(min));
  const end = Math.floor(Math.sqrt(max));
  for (let i = start; i <= end; i++) {
    squares.push(i * i);
  }
  return squares;
}

function getDivisors(n: number): number[] {
  const divisors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) divisors.push(i);
  }
  return divisors;
}

function getPrimeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let m = n;
  while (d * d <= m) {
    if (m % d === 0) {
      factors.push(d);
      while (m % d === 0) m /= d;
    }
    d++;
  }
  if (m > 1) factors.push(m);
  return factors;
}

export function generateFactorsExercise(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  const [rangeMin, rangeMax] = N_RANGE[clamped];

  let n = randInt(rng, rangeMin, rangeMax);

  const primeProb = Math.min(0.1 + 0.03 * clamped, 0.4);
  if (rng() < primeProb) {
    const primes = getPrimesInRange(rangeMin, rangeMax);
    if (primes.length > 0) n = pick(rng, primes);
  }

  const squareProb = Math.min(0.05 + 0.02 * clamped, 0.25);
  if (rng() < squareProb) {
    const squares = getSquaresInRange(rangeMin, rangeMax);
    if (squares.length > 0) n = pick(rng, squares);
  }

  const factors = getDivisors(n);

  const targetSize = randInt(rng, 8, 18);
  const poolSize = Math.min(targetSize, n);
  const numDistractors = Math.max(0, poolSize - factors.length);

  const candidatePool: number[] = [];
  for (let d = 1; d <= n; d++) {
    if (!factors.includes(d)) candidatePool.push(d);
  }

  const pfs = getPrimeFactors(n);
  const sqrtN = Math.sqrt(n);

  function distractorWeight(d: number): number {
    if (pfs.some((p) => d % p === 0)) return 3;
    if (isPrime(d)) return 3;
    if (factors.some((f) => Math.abs(f - d) <= 2)) return 3;
    if (Math.abs(d - sqrtN) <= 2) return 2;
    return 1;
  }

  const weights = candidatePool.map(distractorWeight);
  const selectedDistractors: number[] = [];

  for (let i = 0; i < numDistractors && candidatePool.length > 0; i++) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let idx = 0;
    while (r > weights[idx]) {
      r -= weights[idx];
      idx++;
    }
    selectedDistractors.push(candidatePool[idx]);
    candidatePool.splice(idx, 1);
    weights.splice(idx, 1);
  }

  const allCandidates = [...factors, ...selectedDistractors].sort((a, b) => a - b);

  const correctIndices = allCandidates
    .map((v, i) => (factors.includes(v) ? i : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);

  return {
    prompt: `n = ${n}`,
    answer: correctIndices.join(','),
    pattern: 'custom',
    data: {
      n,
      factors: factors.join(','),
      promptKey: 'exercise.factors.instruction',
      options: allCandidates.map((v) => ({ latex: String(v) })),
    } as FactorsData,
  };
}

export function validateFactors(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as FactorsData;
  if (!data.options || !data.factors) return false;
  const indices = answer
    .split(',')
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));
  if (indices.some((i) => i < 0 || i >= data.options.length)) return false;
  const selectedValues = indices
    .map((i) => parseInt(data.options[i].latex))
    .sort((a, b) => a - b)
    .join(',');
  return selectedValues === data.factors;
}
