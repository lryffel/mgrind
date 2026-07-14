import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';

export interface SignQuestion {
  latex: string;
  sign: string;
}

export interface SignsData {
  rows: { latex: string }[];
  buttons: string[];
  promptKey: string;
}

function numLatex(n: number): string {
  return n < 0 ? `(${n})` : `${n}`;
}

function negLatex(n: number): string {
  return `(-${n})`;
}

function productLatex(factors: { value: number; neg: boolean }[]): string {
  return factors.map((f) => (f.neg ? negLatex(f.value) : String(f.value))).join(' \\cdot ');
}

function countNegatives(negFlags: boolean[]): number {
  return negFlags.filter(Boolean).length;
}

function signFromNegCount(negCount: number): string {
  return negCount % 2 === 0 ? '+' : '-';
}

/** Bands 1–2: product of two signed factors */
function buildProduct2(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  const b = randInt(rng, 2, maxVal);
  const negA = rng() < 0.5;
  const negB = rng() < 0.5;
  const sign = signFromNegCount(countNegatives([negA, negB]));
  return {
    latex: productLatex([
      { value: a, neg: negA },
      { value: b, neg: negB },
    ]),
    sign,
  };
}

/** Band 3: product of three signed factors */
function buildProduct3(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  const b = randInt(rng, 2, maxVal);
  const c = randInt(rng, 2, maxVal);
  const negFlags = [rng() < 0.5, rng() < 0.5, rng() < 0.5];
  const sign = signFromNegCount(countNegatives(negFlags));
  const factors = [a, b, c].map((v, i) => ({ value: v, neg: negFlags[i] }));
  return { latex: productLatex(factors), sign };
}

/** Band 4: quotient of two signed numbers (integer result) */
function buildQuotient(rng: () => number, maxVal: number): SignQuestion {
  const q = randInt(rng, 1, maxVal);
  const d = randInt(rng, 2, maxVal);
  const n = q * d;
  const negN = rng() < 0.5;
  const negD = rng() < 0.5;
  const sign = signFromNegCount(countNegatives([negN, negD]));
  const nLatex = negN ? `-${n}` : `${n}`;
  const dLatex = negD ? `-${d}` : `${d}`;
  return { latex: `\\frac{${nLatex}}{${dLatex}}`, sign };
}

/** Band 5: product of four signed factors */
function buildProduct4(rng: () => number, maxVal: number): SignQuestion {
  const vals = Array.from({ length: 4 }, () => randInt(rng, 2, maxVal));
  const negFlags = vals.map(() => rng() < 0.5);
  const sign = signFromNegCount(countNegatives(negFlags));
  const factors = vals.map((v, i) => ({ value: v, neg: negFlags[i] }));
  return { latex: productLatex(factors), sign };
}

/** Band 6a: (a - b) - c */
function buildDiff6a(rng: () => number, maxVal: number): SignQuestion {
  let a: number, b: number, c: number, value: number;
  let attempts = 0;
  do {
    a = randInt(rng, 1, maxVal);
    b = randInt(rng, 1, maxVal);
    c = randInt(rng, 1, maxVal);
    value = a - b - c;
    attempts++;
  } while ((value === 0 || (a > b && a - b > c)) && attempts < 100);
  return {
    latex: `(${a} - ${b}) - ${c}`,
    sign: value > 0 ? '+' : '-',
  };
}

/** Band 6b: a - (b - c) */
function buildDiff6b(rng: () => number, maxVal: number): SignQuestion {
  let a: number, b: number, c: number, value: number;
  let attempts = 0;
  do {
    a = randInt(rng, 1, maxVal);
    b = randInt(rng, 1, maxVal);
    c = randInt(rng, 1, maxVal);
    value = a - b + c;
    attempts++;
  } while (value === 0 && attempts < 100);
  return {
    latex: `${a} - (${b} - ${c})`,
    sign: value > 0 ? '+' : '-',
  };
}

/** Band 6c: (a - b) - (c - d) */
function buildDiff6c(rng: () => number, maxVal: number): SignQuestion {
  let a: number, b: number, c: number, d: number, value: number;
  let attempts = 0;
  do {
    a = randInt(rng, 1, maxVal);
    b = randInt(rng, 1, maxVal);
    c = randInt(rng, 1, maxVal);
    d = randInt(rng, 1, maxVal);
    value = a - b - c + d;
    attempts++;
  } while (value === 0 && attempts < 100);
  return {
    latex: `(${a} - ${b}) - (${c} - ${d})`,
    sign: value > 0 ? '+' : '-',
  };
}

/** Band 7a: (-a)^n, standard power */
function buildPower(rng: () => number, maxVal: number): SignQuestion {
  const base = randInt(rng, 2, maxVal);
  const exp = pick(rng, [2, 3, 4, 5, 6]);
  const sign = exp % 2 === 0 ? '+' : '-';
  return { latex: `(-${base})^{${exp}}`, sign };
}

/** Band 7b: -a^n trap — always negative */
function buildPowerTrap(rng: () => number, maxVal: number): SignQuestion {
  const base = randInt(rng, 2, maxVal);
  const exp = pick(rng, [2, 3, 4, 5, 6]);
  return { latex: `-${base}^{${exp}}`, sign: '-' };
}

/** Band 8a: (-a)^n + k with k signed */
function buildPowerPlusOffset(rng: () => number, maxVal: number): SignQuestion {
  const base = randInt(rng, 2, maxVal);
  const exp = pick(rng, [2, 3, 4]);
  const absPower = Math.pow(base, exp);
  const pnSign = exp % 2 === 0 ? 1 : -1;
  const kMin = pnSign > 0 ? -absPower + 1 : -absPower - 1;
  const kMax = pnSign > 0 ? absPower - 1 : absPower;
  let k: number;
  let value: number;
  let attempts = 0;
  do {
    k = randInt(rng, kMin, kMax);
    value = pnSign * absPower + k;
    attempts++;
  } while (value === 0 && attempts < 50);
  if (value === 0) return buildPowerPlusOffset(rng, maxVal);
  const kLatex = k < 0 ? `- ${-k}` : `+ ${k}`;
  return { latex: `(-${base})^{${exp}} ${kLatex}`, sign: value > 0 ? '+' : '-' };
}

/** Band 8b: (-a)^n · (-b); sign = n even → neg, n odd → pos */
function buildPowerTimesNeg(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  const b = randInt(rng, 2, maxVal);
  const n = pick(rng, [2, 3, 4]);
  const sign = n % 2 === 0 ? '-' : '+';
  return { latex: `(-${a})^{${n}} \\cdot (-${b})`, sign };
}

/** Band 8c / 9c: (-a)^n - (-b)^m, power difference */
function buildPowerDiff(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  let b = randInt(rng, 2, maxVal);
  while (b === a) b = randInt(rng, 2, maxVal);
  const n = pick(rng, [2, 3, 4]);
  const m = pick(rng, [2, 3, 4]);
  const valA = (n % 2 === 0 ? 1 : -1) * Math.pow(a, n);
  const valB = (m % 2 === 0 ? 1 : -1) * Math.pow(b, m);
  const value = valA - valB;
  if (value === 0) return buildPowerDiff(rng, maxVal);
  return { latex: `(-${a})^{${n}} - (-${b})^{${m}}`, sign: value > 0 ? '+' : '-' };
}

/** Band 9a: (-a)^n + c^n, n odd — sign depends on which base is larger */
function buildMixedSignPowerSum(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  let c = randInt(rng, 2, maxVal);
  while (c === a) c = randInt(rng, 2, maxVal);
  const n = pick(rng, [3, 5]);
  const value = Math.pow(c, n) - Math.pow(a, n);
  return { latex: `(-${a})^{${n}} + ${c}^{${n}}`, sign: value > 0 ? '+' : '-' };
}

/** Band 9b: (a - b) - (c - d) - e with signed values */
function buildNestedSignedDiff(rng: () => number, maxVal: number): SignQuestion {
  let a: number, b: number, c: number, d: number, e: number, value: number;
  let attempts = 0;
  do {
    a = randInt(rng, -maxVal, maxVal);
    b = randInt(rng, -maxVal, maxVal);
    c = randInt(rng, -maxVal, maxVal);
    d = randInt(rng, -maxVal, maxVal);
    e = randInt(rng, -maxVal, maxVal);
    value = a - b - c + d - e;
    attempts++;
  } while (value === 0 && attempts < 100);
  return {
    latex: `(${numLatex(a)} - ${numLatex(b)}) - (${numLatex(c)} - ${numLatex(d)}) - ${numLatex(e)}`,
    sign: value > 0 ? '+' : '-',
  };
}

/** Band 10a: \frac{(a-b)-c}{(d-e)-f}, ratio of signed differences */
function buildRatioOfDiffs(rng: () => number, maxVal: number): SignQuestion {
  let a: number, b: number, c: number, d: number, e: number, f: number;
  let num: number, den: number;
  let attempts = 0;
  do {
    a = randInt(rng, -maxVal, maxVal);
    b = randInt(rng, -maxVal, maxVal);
    c = randInt(rng, -maxVal, maxVal);
    d = randInt(rng, -maxVal, maxVal);
    e = randInt(rng, -maxVal, maxVal);
    f = randInt(rng, -maxVal, maxVal);
    num = a - b - c;
    den = d - e - f;
    attempts++;
  } while ((num === 0 || den === 0) && attempts < 100);
  const sign = num > 0 === den > 0 ? '+' : '-';
  return {
    latex: `\\frac{(${numLatex(a)} - ${numLatex(b)}) - ${numLatex(c)}}{(${numLatex(d)} - ${numLatex(e)}) - ${numLatex(f)}}`,
    sign,
  };
}

/** Band 10b: (-a)^n · (-b)^m + (-c)^p, three-term mixed powers */
function buildThreeTermMixedPowers(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, Math.min(6, maxVal));
  const b = randInt(rng, 2, Math.min(6, maxVal));
  const c = randInt(rng, 2, Math.min(6, maxVal));
  const n = pick(rng, [2, 3]);
  const m = pick(rng, [2, 3]);
  const p = pick(rng, [2, 3]);
  const productTerm = (n % 2 === 0 ? 1 : -1) * (m % 2 === 0 ? 1 : -1) * Math.pow(a, n) * Math.pow(b, m);
  const powerTerm = (p % 2 === 0 ? 1 : -1) * Math.pow(c, p);
  const value = productTerm + powerTerm;
  if (value === 0) return buildThreeTermMixedPowers(rng, maxVal);
  return {
    latex: `(-${a})^{${n}} \\cdot (-${b})^{${m}} + (-${c})^{${p}}`,
    sign: value > 0 ? '+' : '-',
  };
}

/** Band 10c: ((-a)^n + c^n) - ((-d)^m + e^m), n,m odd */
function buildDiffOfPowerSums(rng: () => number, maxVal: number): SignQuestion {
  const a = randInt(rng, 2, maxVal);
  let c = randInt(rng, 2, maxVal);
  while (c === a) c = randInt(rng, 2, maxVal);
  const d = randInt(rng, 2, maxVal);
  let e = randInt(rng, 2, maxVal);
  while (e === d) e = randInt(rng, 2, maxVal);
  const n = 3;
  const m = 3;
  const first = Math.pow(c, n) - Math.pow(a, n);
  const second = Math.pow(e, m) - Math.pow(d, m);
  const value = first - second;
  if (value === 0) return buildDiffOfPowerSums(rng, maxVal);
  return {
    latex: `((-${a})^{${n}} + ${c}^{${n}}) - ((-${d})^{${m}} + ${e}^{${m}})`,
    sign: value > 0 ? '+' : '-',
  };
}

function buildOne(rng: () => number, level: number, maxVal: number): SignQuestion {
  switch (level) {
    case 1:
    case 2:
      return buildProduct2(rng, maxVal);
    case 3:
      return buildProduct3(rng, maxVal);
    case 4:
      return buildQuotient(rng, maxVal);
    case 5:
      return buildProduct4(rng, maxVal);
    case 6:
      return pick(rng, [buildDiff6a, buildDiff6b, buildDiff6c])(rng, maxVal);
    case 7:
      return pick(rng, [buildPower, buildPowerTrap])(rng, maxVal);
    case 8:
      return pick(rng, [buildPowerPlusOffset, buildPowerTimesNeg, buildPowerDiff])(rng, maxVal);
    case 9:
      return pick(rng, [buildMixedSignPowerSum, buildNestedSignedDiff, buildPowerDiff])(rng, maxVal);
    case 10:
      return pick(rng, [
        buildRatioOfDiffs,
        buildThreeTermMixedPowers,
        buildDiffOfPowerSums,
        buildMixedSignPowerSum,
        buildNestedSignedDiff,
        buildPowerDiff,
        buildDiff6a,
        buildPower,
        buildPowerPlusOffset,
        buildPowerTimesNeg,
      ])(rng, maxVal);
    default:
      return buildProduct2(rng, maxVal);
  }
}

export function generateSigns(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const count = clamped <= 5 ? 3 : 4;
  const maxVal = Math.max(6, 6 + Math.floor(clamped * 0.6));

  const signs: SignQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const level = Math.min(clamped + i, 10);
    signs.push(buildOne(rng, level, maxVal));
  }

  const answer = signs.map((q) => q.sign).join(',');

  return {
    prompt: '',
    answer,
    pattern: 'batch-choice',
    data: {
      promptKey: 'exercise.signs.prompt',
      rows: signs.map((s) => ({ latex: s.latex })),
      buttons: ['+', '-'],
    },
  };
}

export function validateSigns(answer: string, exercise: Exercise): boolean {
  const parts = answer.split(',').map((s) => s.trim());
  const correct = exercise.answer.split(',');
  if (parts.length !== correct.length) return false;
  return parts.every((p, i) => p === correct[i]);
}
