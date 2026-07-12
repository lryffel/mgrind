import { describe, it, expect } from 'vitest';
import { generateAdditionFraction } from './additionFraction';
import { gcd } from '../math/number';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function countTerms(prompt: string): number {
  return (prompt.match(/\\dfrac/g) || []).length;
}

function parseTerms(prompt: string): { num: number; den: number }[] {
  const re = /\\dfrac\{(\d+)\}\{(\d+)\}/g;
  const terms: { num: number; den: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(prompt)) !== null) {
    terms.push({ num: parseInt(match[1], 10), den: parseInt(match[2], 10) });
  }
  return terms;
}

function parseOperators(prompt: string): string[] {
  const terms = parseTerms(prompt);
  if (terms.length <= 1) return [];
  const ops: string[] = [];
  let remaining = prompt;
  for (let i = 0; i < terms.length; i++) {
    const idx = remaining.indexOf(`\\dfrac{${terms[i].num}}{${terms[i].den}}`);
    if (idx === -1) break;
    remaining = remaining.slice(idx + `\\dfrac{${terms[i].num}}{${terms[i].den}}`.length);
    if (i < terms.length - 1) {
      const opMatch = remaining.trim().match(/^([+-])/);
      if (opMatch) {
        ops.push(opMatch[1]);
        remaining = remaining.trim().slice(1);
      }
    }
  }
  return ops;
}

function lcm(a: number, b: number): number {
  return a / gcd(a, b) * b;
}

describe('generateAdditionFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    expectHasPromptAndAnswer(generateAdditionFraction, 42, 0);
  });

  it('is deterministic for the same seed and complexity', () => {
    expectDeterministic(generateAdditionFraction, 12345, 3);
  });

  it('produces different results for different seeds', () => {
    expectSeedVariation(generateAdditionFraction, 5);
  });

  it('band 0 (complexity 0-2) produces 2 terms, + only, occasionally same denominator', () => {
    let hasSame = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 1);
      expect(countTerms(ex.prompt)).toBe(2);
      expect(ex.prompt).not.toContain('-');
      const terms = parseTerms(ex.prompt);
      if (terms[0].den === terms[1].den) hasSame = true;
    }
    expect(hasSame).toBe(true);
  });

  it('band 1 (complexity 3-4) produces 2 terms, different denominators, + only', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      expect(countTerms(ex.prompt)).toBe(2);
      const terms = parseTerms(ex.prompt);
      expect(terms[0].den).not.toBe(terms[1].den);
      expect(ex.prompt).not.toContain('-');
    }
  });

  it('band 2 (complexity 5-6) produces 3 terms, may contain -', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateAdditionFraction(seed, 5);
      expect(countTerms(ex.prompt)).toBe(3);
    }
    const hasMinus = Array.from({ length: 50 }, (_, i) =>
      generateAdditionFraction(i, 6).prompt.includes('-'),
    ).some(Boolean);
    expect(hasMinus).toBe(true);
  });

  it('band 3 (complexity 7-8) produces 3 terms, different denominators, may contain -', () => {
    let hasDifferent = false;
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateAdditionFraction(seed, 8);
      expect(countTerms(ex.prompt)).toBe(3);
      const terms = parseTerms(ex.prompt);
      const uniqueDens = new Set(terms.map(t => t.den));
      if (uniqueDens.size > 1) hasDifferent = true;
    }
    expect(hasDifferent).toBe(true);
    const hasMinus = Array.from({ length: 50 }, (_, i) =>
      generateAdditionFraction(i, 8).prompt.includes('-'),
    ).some(Boolean);
    expect(hasMinus).toBe(true);
  });

  it('band 4 (complexity 9-10) produces 3-4 terms, different denominators', () => {
    let has4 = false;
    let has3 = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 10);
      const count = countTerms(ex.prompt);
      expect([3, 4]).toContain(count);
      if (count === 4) has4 = true;
      if (count === 3) has3 = true;
    }
    expect(has4).toBe(true);
    expect(has3).toBe(true);
  });

  it('all displayed terms have gcd(num, den) = 1', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAdditionFraction(seed, 7);
      const terms = parseTerms(ex.prompt);
      for (const t of terms) {
        expect(gcd(t.num, t.den)).toBe(1);
      }
    }
  });

  it('answer is two comma-separated integers with coprime parts', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAdditionFraction(seed, 6);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(2);
      const [n, d] = parts.map(Number);
      expect(Number.isInteger(n)).toBe(true);
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThan(0);
      expect(gcd(Math.abs(n), d)).toBe(1);
    }
  });

  it('computing the expression equals the answer', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateAdditionFraction(seed, 9);
      const terms = parseTerms(ex.prompt);
      const ops = parseOperators(ex.prompt);
      expect(ops.length).toBe(terms.length - 1);

      let lcd = terms[0].den;
      for (let i = 1; i < terms.length; i++) {
        lcd = lcm(lcd, terms[i].den);
      }
      let total = terms[0].num * (lcd / terms[0].den);
      for (let i = 0; i < ops.length; i++) {
        total += (ops[i] === '+' ? 1 : -1) * terms[i + 1].num * (lcd / terms[i + 1].den);
      }
      const g = gcd(Math.abs(total), lcd);
      const expectedNum = total / g;
      const expectedDen = lcd / g;
      const [ansNum, ansDen] = ex.answer.split(',').map(Number);
      expect(expectedNum * ansDen).toBe(ansNum * expectedDen);
    }
  });

  it('no negative results in bands 0-3', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 4);
      const [n] = ex.answer.split(',').map(Number);
      expect(n).toBeGreaterThanOrEqual(0);
    }
  });

  it('band 4 can produce negative results', () => {
    let hasNegative = false;
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAdditionFraction(seed, 10);
      const [n] = ex.answer.split(',').map(Number);
      if (n < 0) {
        hasNegative = true;
        break;
      }
    }
    expect(hasNegative).toBe(true);
  });

  it('denominators stay within the small pool', () => {
    const validDens = new Set([2, 3, 4, 5, 6, 8, 10, 12]);
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAdditionFraction(seed, 10);
      const terms = parseTerms(ex.prompt);
      for (const t of terms) {
        expect(validDens.has(t.den)).toBe(true);
      }
    }
  });

  it('handles complexity beyond 10 by clamping', () => {
    const ex = generateAdditionFraction(42, 20);
    expect(ex.answer.split(',')).toHaveLength(2);
  });

  it('handles complexity below 0 by clamping', () => {
    const ex = generateAdditionFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});
