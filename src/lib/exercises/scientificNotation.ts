import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { randInt } from '../math/rng';
import { clampComplexity } from '../math/number';

function formatDecimal(tenths: number, exponent: number): string {
  const shift = exponent - 1;
  if (shift >= 0) {
    return String(tenths * 10 ** shift);
  }
  const s = String(tenths);
  const pad = -shift - s.length;
  if (pad >= 0) {
    let r = '0.' + '0'.repeat(pad) + s;
    r = r.replace(/0+$/, '');
    return r.endsWith('.') ? r.slice(0, -1) : r;
  }
  const dotPos = s.length + shift;
  let r = s.slice(0, dotPos) + '.' + s.slice(dotPos);
  r = r.replace(/0+$/, '');
  return r.endsWith('.') ? r.slice(0, -1) : r;
}

function generateSciToDec(rng: () => number): Exercise {
  const tenths = randInt(rng, 10, 99);
  const exponent = randInt(rng, -5, 5);
  const mantissa = tenths / 10;
  const mantissaStr = mantissa % 1 === 0 ? String(Math.round(mantissa)) : mantissa.toFixed(1);
  const valueStr = formatDecimal(tenths, exponent);
  return {
    prompt: `${mantissaStr} \\cdot 10^{${exponent}} = ?`,
    answer: valueStr,
    data: { subType: 'sciToDec', promptKey: 'exercise.scientificNotation.prompt.sciToDec' },
  };
}

function generateDecToSci(rng: () => number): Exercise {
  const tenths = randInt(rng, 10, 99);
  const exponent = randInt(rng, -4, 4);
  const mantissa = tenths / 10;
  const valueStr = formatDecimal(tenths, exponent);
  const mantissaStr = mantissa % 1 === 0 ? String(Math.round(mantissa)) : mantissa.toFixed(1);
  return {
    prompt: `${valueStr} = ?`,
    answer: `${mantissaStr},${exponent}`,
    data: { subType: 'decToSci', promptKey: 'exercise.scientificNotation.prompt.decToSci' },
  };
}

function generateMultiply(rng: () => number): Exercise {
  const exp1 = randInt(rng, -3, 3);
  const exp2 = randInt(rng, -3, 3);

  const useDecimals = rng() > 0.5;

  let a: number, c: number;
  let aStr: string, cStr: string;

  if (useDecimals) {
    const a10 = randInt(rng, 11, 19);
    const c10 = randInt(rng, 11, 19);
    a = a10 / 10;
    c = c10 / 10;
    aStr = a.toFixed(1);
    cStr = c.toFixed(1);
  } else {
    const which = rng() > 0.5 ? 0 : 1;
    if (which === 0) {
      a = randInt(rng, 2, 9);
      const c10 = randInt(rng, 11, 19);
      c = c10 / 10;
      aStr = String(a);
      cStr = c.toFixed(1);
    } else {
      c = randInt(rng, 2, 9);
      const a10 = randInt(rng, 11, 19);
      a = a10 / 10;
      aStr = a.toFixed(1);
      cStr = String(c);
    }
  }

  let coeff = a * c;
  let exp = exp1 + exp2;

  while (coeff >= 10) {
    coeff /= 10;
    exp += 1;
  }
  while (coeff < 1) {
    coeff *= 10;
    exp -= 1;
  }

  coeff = Math.round(coeff * 1e12) / 1e12;

  return {
    prompt: `(${aStr} \\cdot 10^{${exp1}}) \\cdot (${cStr} \\cdot 10^{${exp2}}) = ?`,
    answer: `${coeff},${exp}`,
    data: { subType: 'multiply', promptKey: 'exercise.scientificNotation.prompt.multiply' },
  };
}

function generateAdd(rng: () => number): Exercise {
  const a10 = randInt(rng, 10, 99);
  const c10 = randInt(rng, 10, 99);

  const exp1 = randInt(rng, -3, 3);
  const expDiff = randInt(rng, 0, 2);
  const exp2 = exp1 + (rng() > 0.5 ? expDiff : -expDiff);

  const b = Math.max(exp1, exp2);
  const d = Math.min(exp1, exp2);
  const [bigger10, smaller10] = exp1 >= exp2 ? [a10, c10] : [c10, a10];

  const shift = b - d;
  const sumUnit = bigger10 * 10 ** shift + smaller10;

  let coeff = sumUnit;
  let exp = d - 1;

  while (coeff >= 10) {
    coeff /= 10;
    exp += 1;
  }
  while (coeff < 1) {
    coeff *= 10;
    exp -= 1;
  }

  coeff = Math.round(coeff * 1e12) / 1e12;

  const aStr = (a10 / 10).toFixed(1);
  const cStr = (c10 / 10).toFixed(1);

  return {
    prompt: `(${aStr} \\cdot 10^{${exp1}}) + (${cStr} \\cdot 10^{${exp2}}) = ?`,
    answer: `${coeff},${exp}`,
    data: { subType: 'add', promptKey: 'exercise.scientificNotation.prompt.add' },
  };
}

export function generateScientificNotation(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  if (clamped <= 3) {
    return generateSciToDec(rng);
  } else if (clamped <= 5) {
    return generateDecToSci(rng);
  } else if (clamped <= 7) {
    return generateMultiply(rng);
  } else {
    return generateAdd(rng);
  }
}
