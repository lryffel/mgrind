import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { gcd, clampComplexity } from '../math/number';
import { promptFraction } from '../math/latex';

const DENOMS = [2, 3, 4, 5, 6, 8, 10, 12];

const LCD_DIVISORS: Record<number, number[]> = {
  4: [2, 4],
  6: [2, 3, 6],
  8: [2, 4, 8],
  10: [2, 5, 10],
  12: [2, 3, 4, 6, 12],
};
const LCDS = Object.keys(LCD_DIVISORS).map(Number);

interface BandConfig {
  minCount: number;
  maxCount: number;
  sameDenChance: number;
  maxMinus: number;
  allowNegatives: boolean;
}

const BANDS: BandConfig[] = [
  { minCount: 2, maxCount: 2, sameDenChance: 0.25, maxMinus: 0, allowNegatives: false },
  { minCount: 2, maxCount: 2, sameDenChance: 0, maxMinus: 0, allowNegatives: false },
  { minCount: 3, maxCount: 3, sameDenChance: 0.25, maxMinus: 1, allowNegatives: false },
  { minCount: 3, maxCount: 3, sameDenChance: 0, maxMinus: 1, allowNegatives: false },
  { minCount: 3, maxCount: 4, sameDenChance: 0, maxMinus: 2, allowNegatives: true },
];

function bandIndex(clamped: number): number {
  if (clamped <= 2) return 0;
  if (clamped <= 4) return 1;
  if (clamped <= 6) return 2;
  if (clamped <= 8) return 3;
  return 4;
}

function numerator(den: number, rng: () => number): number {
  for (let i = 0; i < 20; i++) {
    const n = 1 + Math.floor(rng() * (den - 1));
    if (gcd(n, den) === 1) return n;
  }
  return 1;
}

type Term = { num: number; den: number };
type Op = '+' | '-';

function lcm(a: number, b: number): number {
  return a / gcd(a, b) * b;
}

function computeResult(terms: Term[], ops: Op[]): Term {
  let lcd = terms[0].den;
  for (let i = 1; i < terms.length; i++) {
    lcd = lcm(lcd, terms[i].den);
  }
  let total = terms[0].num * (lcd / terms[0].den);
  for (let i = 0; i < ops.length; i++) {
    total += (ops[i] === '+' ? 1 : -1) * terms[i + 1].num * (lcd / terms[i + 1].den);
  }
  const g = gcd(Math.abs(total), lcd);
  return { num: total / g, den: lcd / g };
}

function buildPrompt(terms: Term[], ops: Op[]): string {
  let s = promptFraction(terms[0].num, terms[0].den);
  for (let i = 0; i < ops.length; i++) {
    s += ` ${ops[i]} ${promptFraction(terms[i + 1].num, terms[i + 1].den)}`;
  }
  return s;
}

function generateOperators(rng: () => number, count: number, maxMinus: number): Op[] {
  const ops: Op[] = [];
  if (count <= 1) return ops;

  const numMinus =
    maxMinus === 0 ? 0 :
    maxMinus === 1 ? (rng() < 0.4 ? 1 : 0) :
    rng() < 0.3 ? 2 : rng() < 0.5 ? 1 : 0;

  const indices = Array.from({ length: count - 1 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const minusSet = new Set(indices.slice(0, numMinus));

  for (let i = 0; i < count - 1; i++) {
    ops.push(minusSet.has(i) ? '-' : '+');
  }
  return ops;
}

export function generateAdditionFraction(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const band = BANDS[bandIndex(clamped)];

  for (let attempt = 0; attempt < 50; attempt++) {
    const count = band.minCount + Math.floor(rng() * (band.maxCount - band.minCount + 1));

    let dens: number[];
    if (rng() < band.sameDenChance) {
      const d = DENOMS[Math.floor(rng() * DENOMS.length)];
      dens = Array(count).fill(d);
    } else {
      const lcd = LCDS[Math.floor(rng() * LCDS.length)];
      const divs = LCD_DIVISORS[lcd];
      dens = Array.from({ length: count }, () => divs[Math.floor(rng() * divs.length)]);
      if (new Set(dens).size < 2 && divs.length >= 2) {
        dens[1] = divs.find(d => d !== dens[0])!;
      }
    }

    const terms: Term[] = dens.map(d => ({ num: numerator(d, rng), den: d }));
    const ops = generateOperators(rng, count, band.maxMinus);
    const result = computeResult(terms, ops);

    if (!band.allowNegatives && result.num < 0) continue;

    const prompt = buildPrompt(terms, ops);
    return {
      prompt,
      answer: `${result.num},${result.den}`,
      data: { promptKey: 'exercise.additionFraction.prompt' },
    };
  }

  return {
    prompt: `${promptFraction(1, 4)} + ${promptFraction(1, 4)}`,
    answer: '1,2',
    data: { promptKey: 'exercise.additionFraction.prompt' },
  };
}
