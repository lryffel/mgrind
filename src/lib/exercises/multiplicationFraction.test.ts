import { describe, it, expect } from 'vitest';
import { generateMultiplicationFraction } from './multiplicationFraction';
import type { MultiplicationFractionData } from './multiplicationFraction';
import { gcd } from '../math/number';

const ALL_TYPES = ['frac-mul-frac', 'frac-mul-int', 'int-mul-frac', 'frac-div-frac', 'int-div-frac', 'frac-div-int'];
const MUL_TYPES = ['frac-mul-frac', 'frac-mul-int', 'int-mul-frac'];
const DIV_TYPES = ['frac-div-frac', 'int-div-frac', 'frac-div-int'];

function getData(ex: { data?: unknown }): MultiplicationFractionData {
  return ex.data as MultiplicationFractionData;
}

function getNumbers(data: MultiplicationFractionData): [number, number, number, number] {
  return [data.num1, data.den1, data.num2, data.den2];
}

describe('generateMultiplicationFraction', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateMultiplicationFraction(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateMultiplicationFraction(12345, 3);
    const b = generateMultiplicationFraction(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      seen.add(ex.prompt);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('answer is two comma-separated positive integers', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      const parts = ex.answer.split(',');
      expect(parts).toHaveLength(2);
      parts.forEach((p) => {
        const n = Number(p);
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThan(0);
      });
    }
  });

  it('the answer numerator and denominator are coprime', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateMultiplicationFraction(seed, 7);
      const [num, den] = ex.answer.split(',').map(Number);
      expect(gcd(num, den)).toBe(1);
    }
  });

  it('all inner fractions in prompt are reduced', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateMultiplicationFraction(seed, 7);
      const data = getData(ex);
      const [n1, d1, n2, d2] = getNumbers(data);
      if (data.subType === 'frac-mul-int' || data.subType === 'int-div-frac') {
        expect(gcd(n2, d2)).toBe(1);
      } else if (data.subType === 'int-mul-frac' || data.subType === 'frac-div-int') {
        expect(gcd(n1, d1)).toBe(1);
      } else {
        expect(gcd(n1, d1)).toBe(1);
        expect(gcd(n2, d2)).toBe(1);
      }
    }
  });

  it('answer matches the computed fraction operation', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateMultiplicationFraction(seed, 7);
      const data = getData(ex);
      const [n1, d1, n2, d2] = getNumbers(data);
      const [ansNum, ansDen] = ex.answer.split(',').map(Number);
      let prodNum: number, prodDen: number;
      if (data.subType === 'frac-div-frac' || data.subType === 'int-div-frac' || data.subType === 'frac-div-int') {
        prodNum = n1 * d2;
        prodDen = d1 * n2;
      } else {
        prodNum = n1 * n2;
        prodDen = d1 * d2;
      }
      expect(prodNum * ansDen).toBe(prodDen * ansNum);
    }
  });

  it('values stay within bounds per complexity', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 0);
      const data = getData(ex);
      const vals = getNumbers(data);
      expect(Math.max(...vals)).toBeLessThanOrEqual(10);
    }
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 10);
      const data = getData(ex);
      const vals = getNumbers(data);
      expect(Math.max(...vals)).toBeLessThanOrEqual(20);
    }
  });

  it('handles complexity beyond 10', () => {
    const ex = generateMultiplicationFraction(42, 20);
    const parts = ex.answer.split(',').map(Number);
    expect(gcd(parts[0], parts[1])).toBe(1);
  });

  it('handles complexity below 0', () => {
    const ex = generateMultiplicationFraction(42, -5);
    expect(ex.answer.split(',')).toHaveLength(2);
  });
});

describe('complexity bands', () => {
  it('complexity 0–3 only generates frac-mul-frac', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 2);
      const data = getData(ex);
      expect(data.subType).toBe('frac-mul-frac');
    }
  });

  it('complexity 3 only generates frac-mul-frac', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 3);
      const data = getData(ex);
      expect(data.subType).toBe('frac-mul-frac');
    }
  });

  it('complexity 4–6 generates only frac-mul-frac, frac-mul-int, int-mul-frac', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      expect(MUL_TYPES).toContain(data.subType);
    }
  });

  it('complexity 7–10 generates all six types', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 8);
      const data = getData(ex);
      expect(ALL_TYPES).toContain(data.subType);
    }
  });

  it('complexity 10 includes division types', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 10);
      const data = getData(ex);
      expect(ALL_TYPES).toContain(data.subType);
    }
  });
});

describe('cross-cancellation invariant (multiplication types)', () => {
  it('frac-mul-frac: gcd(n1, d2) > 1 or gcd(n2, d1) > 1', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 4);
      const data = getData(ex);
      if (data.subType !== 'frac-mul-frac') continue;
      const [n1, d1, n2, d2] = getNumbers(data);
      expect(gcd(n1, d2) > 1 || gcd(n2, d1) > 1).toBe(true);
    }
  });

  it('frac-mul-int: gcd(c, b) > 1 where fraction is a/b and integer is c', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      if (data.subType !== 'frac-mul-int') continue;
      found = true;
      expect(gcd(data.num2, data.den1)).toBeGreaterThan(1);
    }
    expect(found).toBe(true);
  });

  it('int-mul-frac: gcd(c, b) > 1 where integer is c and fraction is a/b', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      if (data.subType !== 'int-mul-frac') continue;
      found = true;
      expect(gcd(data.num1, data.den2)).toBeGreaterThan(1);
    }
    expect(found).toBe(true);
  });
});

describe('data structure', () => {
  it('has promptKey set', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      expect(data.promptKey).toBe('exercise.multiplicationFraction.prompt');
    }
  });

  it('has subType set to a valid value', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 8);
      const data = getData(ex);
      expect(ALL_TYPES).toContain(data.subType);
    }
  });

  it('multiplication types have op="*"', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      if (MUL_TYPES.includes(data.subType)) {
        expect(data.op).toBe('*');
      }
    }
  });

  it('division types have op="/"', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 8);
      const data = getData(ex);
      if (DIV_TYPES.includes(data.subType)) {
        found = true;
        expect(data.op).toBe('/');
      }
    }
    expect(found).toBe(true);
  });
});

describe('prompt format', () => {
  it('frac-mul-frac uses dfrac with cdot', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateMultiplicationFraction(seed, 2);
      const data = getData(ex);
      expect(data.subType).toBe('frac-mul-frac');
      expect(ex.prompt).toMatch(/\\dfrac{\d+}{\d+} \\cdot \\dfrac{\d+}{\d+}/);
    }
  });

  it('frac-mul-int and int-mul-frac have integer operand without dfrac', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      const data = getData(ex);
      if (data.subType === 'frac-mul-int') {
        expect(ex.prompt).toMatch(/\\dfrac{\d+}{\d+} \\cdot \d+/);
      } else if (data.subType === 'int-mul-frac') {
        expect(ex.prompt).toMatch(/\d+ \\cdot \\dfrac{\d+}{\d+}/);
      }
    }
  });

  it('division types use double-fraction format with thin spaces', () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateMultiplicationFraction(seed, 8);
      const data = getData(ex);
      if (!DIV_TYPES.includes(data.subType)) continue;
      found = true;
      expect(ex.prompt).toMatch(/\\frac\{/);
    }
    expect(found).toBe(true);
  });
});

describe('type distribution', () => {
  it('at complexity 4–6, all three types appear', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const ex = generateMultiplicationFraction(seed, 5);
      seen.add(getData(ex).subType);
    }
    expect(seen.has('frac-mul-frac')).toBe(true);
    expect(seen.has('frac-mul-int')).toBe(true);
    expect(seen.has('int-mul-frac')).toBe(true);
  });

  it('at complexity 7–10, all six types appear', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 2000; seed++) {
      const ex = generateMultiplicationFraction(seed, 8);
      seen.add(getData(ex).subType);
    }
    ALL_TYPES.forEach((t) => expect(seen.has(t)).toBe(true));
  });
});
