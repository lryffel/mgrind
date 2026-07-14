import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt } from '../math/rng';
import { clampComplexity } from '../math/number';

export interface RoundingSigfigsData {
  sigfigsCount: number;
}

export function roundToSigFigs(value: number, n: number): string {
  if (value === 0) return '0';
  const absVal = Math.abs(value);
  const log10 = Math.floor(Math.log10(absVal));
  const precision = n - 1 - log10;
  if (precision >= 0) {
    const scale = 10 ** precision;
    const rounded = Math.round(absVal * scale) / scale;
    return rounded.toFixed(precision);
  } else {
    const scale = 10 ** -precision;
    const rounded = Math.round(absVal / scale) * scale;
    return String(rounded);
  }
}

function generateSimpleDecimal(rng: () => number): { value: number; n: number } {
  const intPart = randInt(rng, 1, 9);
  const decPart = randInt(rng, 10, 999);
  const value = parseFloat(`${intPart}.${decPart}`);
  const n = randInt(rng, 1, 2);
  return { value, n };
}

function generateInteger(rng: () => number): { value: number; n: number } {
  const value = randInt(rng, 100, 9999);
  const digitCount = String(value).length;
  const maxN = Math.min(3, digitCount - 1);
  const n = randInt(rng, 1, Math.max(1, maxN));
  return { value, n };
}

function generateSmallDecimal(rng: () => number): { value: number; n: number } {
  const leadingZeros = randInt(rng, 1, 4);
  const sigDigits = randInt(rng, 100, 999);
  const value = parseFloat(`0.${'0'.repeat(leadingZeros)}${sigDigits}`);
  const n = randInt(rng, 2, 3);
  const maxN = String(sigDigits).length - 1;
  return { value, n: Math.min(n, Math.max(1, maxN)) };
}

function generateInternalZeros(rng: () => number): { value: number; n: number } {
  const subtype = randInt(rng, 0, 2);
  let value: number;
  if (subtype === 0) {
    value = parseInt(`${randInt(rng, 1, 9)}0${randInt(rng, 1, 9)}`);
  } else if (subtype === 1) {
    value = parseInt(`${randInt(rng, 1, 9)}00${randInt(rng, 1, 9)}`);
  } else {
    value = parseFloat(`${randInt(rng, 1, 9)}00.${randInt(rng, 10, 99)}`);
  }
  const n = randInt(rng, 2, 4);
  const s = String(Math.abs(value));
  const dotIdx = s.indexOf('.');
  const digitCount = dotIdx >= 0 ? s.length - 1 : s.length;
  const maxN = Math.min(4, digitCount - 1);
  return { value, n: Math.min(n, Math.max(1, maxN)) };
}

function generateLargeOrRollover(rng: () => number): { value: number; n: number } {
  const isRollover = rng() > 0.5;
  if (isRollover) {
    const rollType = randInt(rng, 0, 2);
    let value: number;
    let n: number;
    if (rollType === 0) {
      value = parseFloat(`9${randInt(rng, 0, 9)}.${randInt(rng, 1, 9)}`);
      n = 1;
    } else if (rollType === 1) {
      value = parseInt('9'.repeat(randInt(rng, 2, 3)));
      n = 2;
    } else {
      value = parseFloat(`${randInt(rng, 1, 9)}9.${randInt(rng, 1, 9)}`);
      n = 1;
    }
    return { value, n };
  }
  const value = randInt(rng, 10000, 999999);
  const digitCount = String(value).length;
  const n = randInt(rng, 2, 4);
  const maxN = Math.min(4, digitCount - 1);
  return { value, n: Math.min(n, Math.max(1, maxN)) };
}

type GeneratorFn = (rng: () => number) => { value: number; n: number };

const generators: { level: number; fn: GeneratorFn }[] = [
  { level: 1, fn: generateSimpleDecimal },
  { level: 3, fn: generateInteger },
  { level: 5, fn: generateSmallDecimal },
  { level: 7, fn: generateInternalZeros },
  { level: 9, fn: generateLargeOrRollover },
];

function pickGenerator(clamped: number): GeneratorFn {
  for (let i = generators.length - 1; i >= 0; i--) {
    if (clamped >= generators[i].level) {
      return generators[i].fn;
    }
  }
  return generators[0].fn;
}

function formatNumberForPrompt(value: number): string {
  const s = String(value);
  const dotIdx = s.indexOf('.');
  if (dotIdx === -1) {
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  }
  const intPart = s.slice(0, dotIdx);
  const decPart = s.slice(dotIdx);
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + decPart;
}

export function generateRoundingSigfigs(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);
  const gen = pickGenerator(clamped);
  const { value, n } = gen(rng);
  const answer = roundToSigFigs(value, n);
  return {
    prompt: formatNumberForPrompt(value),
    answer,
    pattern: 'text-input',
    data: { sigfigsCount: n },
  };
}
