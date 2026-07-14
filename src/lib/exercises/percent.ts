import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { pick, randInt } from '../math/rng';
import { clampComplexity } from '../math/number';

export interface PercentData {
  variant: 'A' | 'B' | 'C' | 'D' | 'E';
  answerIsFraction: boolean;
  p: number;
  G: number;
  W: number;
  n1: number;
  n2: number;
  c1: number;
  t1: number;
  variablePart?: string;
}

function getMaxN(clamped: number): number {
  if (clamped <= 1) return 10;
  if (clamped <= 3) return 12;
  if (clamped === 4) return 20;
  if (clamped <= 8) return 30;
  return 50;
}

function getMaxC1(clamped: number): number {
  if (clamped === 0) return 6;
  if (clamped === 1) return 10;
  if (clamped <= 3) return 12;
  if (clamped <= 5) return 20;
  if (clamped <= 7) return 30;
  return 50;
}

function getMaxT1(clamped: number): number {
  if (clamped <= 1) return 8;
  if (clamped <= 3) return 12;
  if (clamped <= 5) return 20;
  if (clamped <= 7) return 30;
  return 50;
}

const MULTIPLE_ONLY: Record<number, boolean> = {
  0: true,
  1: true,
};

function isMultipleOnly(clamped: number): boolean {
  return MULTIPLE_ONLY[clamped] ?? false;
}

function getPercentConfig(clamped: number): {
  GStep: number;
  GMin: number;
  GMax: number;
  percents: number[];
} {
  const bands = [
    { GStep: 20, GMin: 20, GMax: 100, percents: [10, 50, 25] },
    { GStep: 20, GMin: 20, GMax: 100, percents: [10, 50, 25, 20] },
    { GStep: 20, GMin: 20, GMax: 100, percents: [10, 50, 25, 20, 75, 5] },
    { GStep: 20, GMin: 20, GMax: 200, percents: [5, 10, 15, 20, 25, 40, 50, 60, 75, 90, 100] },
    { GStep: 20, GMin: 20, GMax: 300, percents: buildMultiplesOf5(5, 120) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 150, true) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 175, true) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 200, true) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 200, true) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 200, true) },
    { GStep: 20, GMin: 20, GMax: 400, percents: buildMultiplesOf5(5, 200, true) },
  ];
  return bands[Math.min(clamped, bands.length - 1)];
}

function buildMultiplesOf5(min: number, max: number, withEighths = false): number[] {
  const vals: number[] = [];
  for (let i = min; i <= max; i += 5) vals.push(i);
  if (withEighths) vals.push(12.5, 37.5, 62.5, 87.5);
  return vals;
}

function pickPercentTriple(rng: () => number, clamped: number): { p: number; G: number; W: number } {
  const { GStep, GMin, GMax, percents } = getPercentConfig(clamped);
  const p = maybeForce100(rng, pick(rng, percents));
  const count = Math.floor((GMax - GMin) / GStep) + 1;
  const G = GMin + Math.floor(rng() * count) * GStep;
  const W = (p * G) / 100;
  return { p, G, W };
}

function maybeForce100(rng: () => number, p: number): number {
  if (rng() < 0.015) return 100;
  return p;
}

function formatAnswer(val: number): string {
  if (Number.isInteger(val)) return String(val);
  const rounded = Math.round(val * 100) / 100;
  return String(rounded);
}

function getVariants(clamped: number): string[] {
  if (clamped <= 2) return ['A', 'D'];
  if (clamped <= 4) return ['A', 'B', 'C', 'D'];
  return ['A', 'B', 'C', 'D', 'E'];
}

function generateD(rng: () => number, clamped: number): Exercise {
  const maxN = getMaxN(clamped);
  const maxC1 = getMaxC1(clamped);
  const multipleOnly = isMultipleOnly(clamped);
  let attempts = 0;
  do {
    const n1 = randInt(rng, 2, maxN);
    let n2: number;
    if (multipleOnly) {
      const k = randInt(rng, 2, Math.max(2, Math.floor(maxN / n1)));
      n2 = n1 * k;
    } else {
      do {
        n2 = randInt(rng, 2, maxN);
      } while (n2 === n1 || n2 % n1 === 0);
    }
    const c1 = randInt(rng, 1, maxC1);
    const result = (c1 * n2) / n1;
    const rounded = Math.round(result * 100) / 100;
    if (result > 0 && Math.abs(result - rounded) < 1e-9) {
      return {
        prompt: 'percent-D',
        answer: formatAnswer(rounded),
        pattern: 'text-input',
        data: {
          variant: 'D',
          answerIsFraction: false,
          p: 0,
          G: 0,
          W: 0,
          n1,
          n2,
          c1,
          t1: 0,
          variablePart: '\\,\\text{CHF}',
        } as PercentData,
      };
    }
    attempts++;
  } while (attempts < 200);
  return {
    prompt: 'percent-D',
    answer: '1',
    pattern: 'text-input',
    data: {
      variant: 'D',
      answerIsFraction: false,
      p: 0,
      G: 0,
      W: 0,
      n1: 2,
      n2: 2,
      c1: 1,
      t1: 0,
      variablePart: '\\,\\text{CHF}',
    } as PercentData,
  };
}

function generateE(rng: () => number, clamped: number): Exercise {
  const maxN = getMaxN(clamped);
  const maxT1 = getMaxT1(clamped);
  const multipleOnly = isMultipleOnly(clamped);
  let attempts = 0;
  do {
    const n1 = randInt(rng, 2, maxN);
    let n2: number;
    if (multipleOnly) {
      const k = randInt(rng, 2, Math.max(2, Math.floor(maxN / n1)));
      n2 = n1 / k;
      if (n2 < 2 || n2 !== Math.floor(n2)) continue;
    } else {
      do {
        n2 = randInt(rng, 2, maxN);
      } while (n2 === n1 || n1 % n2 === 0 || n2 % n1 === 0);
    }
    const t1 = randInt(rng, 2, maxT1);
    const result = (t1 * n1) / n2;
    const rounded = Math.round(result * 100) / 100;
    if (result > 0 && Math.abs(result - rounded) < 1e-9) {
      return {
        prompt: 'percent-E',
        answer: formatAnswer(rounded),
        pattern: 'text-input',
        data: {
          variant: 'E',
          answerIsFraction: false,
          p: 0,
          G: 0,
          W: 0,
          n1,
          n2,
          c1: 0,
          t1,
          variablePart: '\\,\\text{h}',
        } as PercentData,
      };
    }
    attempts++;
  } while (attempts < 200);
  return {
    prompt: 'percent-E',
    answer: '1',
    pattern: 'text-input',
    data: {
      variant: 'E',
      answerIsFraction: false,
      p: 0,
      G: 0,
      W: 0,
      n1: 2,
      n2: 2,
      c1: 0,
      t1: 2,
      variablePart: '\\,\\text{h}',
    } as PercentData,
  };
}

export function generatePercent(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const variants = getVariants(clamped);
  const variant = pick(rng, variants) as 'A' | 'B' | 'C' | 'D' | 'E';

  switch (variant) {
    case 'A':
      return generateA(rng, clamped);
    case 'B':
      return generateB(rng, clamped);
    case 'C':
      return generateC(rng, clamped);
    case 'D':
      return generateD(rng, clamped);
    case 'E':
      return generateE(rng, clamped);
  }
}

function generateA(rng: () => number, clamped: number): Exercise {
  const { p, G, W } = pickPercentTriple(rng, clamped);
  return {
    prompt: 'percent-A',
    answer: formatAnswer(W),
    pattern: 'text-input',
    data: {
      variant: 'A',
      answerIsFraction: false,
      p,
      G,
      W,
      n1: 0,
      n2: 0,
      c1: 0,
      t1: 0,
    } as PercentData,
  };
}

function generateB(rng: () => number, clamped: number): Exercise {
  const { p, G, W } = pickPercentTriple(rng, clamped);
  return {
    prompt: 'percent-B',
    answer: formatAnswer(G),
    pattern: 'text-input',
    data: {
      variant: 'B',
      answerIsFraction: false,
      p,
      G,
      W,
      n1: 0,
      n2: 0,
      c1: 0,
      t1: 0,
    } as PercentData,
  };
}

function generateC(rng: () => number, clamped: number): Exercise {
  const { p, G, W } = pickPercentTriple(rng, clamped);
  return {
    prompt: 'percent-C',
    answer: formatAnswer(p),
    pattern: 'text-input',
    data: {
      variant: 'C',
      answerIsFraction: false,
      p,
      G,
      W,
      n1: 0,
      n2: 0,
      c1: 0,
      t1: 0,
      variablePart: '\\,\\%',
    } as PercentData,
  };
}

export function validatePercent(answer: string, exercise: Exercise): boolean {
  let input = answer.trim();
  if (input.endsWith('%')) input = input.slice(0, -1).trim();

  let userVal: number | null = null;
  if (input.includes('/')) {
    const parts = input.split('/');
    if (parts.length === 2) {
      const n = parseFloat(parts[0].trim());
      const d = parseFloat(parts[1].trim());
      if (!isNaN(n) && !isNaN(d) && d !== 0) userVal = n / d;
    }
  } else {
    userVal = parseFloat(input);
  }

  if (userVal === null || isNaN(userVal)) return false;

  const correctVal = parseFloat(exercise.answer);
  if (isNaN(correctVal)) return false;

  if (Number.isInteger(userVal) && Number.isInteger(correctVal)) {
    return userVal === correctVal;
  }

  return Math.abs(userVal - correctVal) < 1e-9;
}
