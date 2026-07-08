import { describe, it, expect } from 'vitest';
import { generateOrderOfOperations } from './orderOfOperations';

function computeExpected(prompt: string): number | null {
  const m1 = prompt.match(/^(\d+) - \((\d+) \+ (\d+)\) = \?$/);
  if (m1) return parseInt(m1[1]) - (parseInt(m1[2]) + parseInt(m1[3]));

  const m2 = prompt.match(/^(\d+) - \((\d+) - (\d+)\) = \?$/);
  if (m2) return parseInt(m2[1]) - (parseInt(m2[2]) - parseInt(m2[3]));

  const m3 = prompt.match(/^(\d+) \\cdot \((\d+) \+ (\d+)\) = \?$/);
  if (m3) return parseInt(m3[1]) * (parseInt(m3[2]) + parseInt(m3[3]));

  const m4 = prompt.match(/^(\d+) \\cdot \((\d+) - (\d+)\) = \?$/);
  if (m4) return parseInt(m4[1]) * (parseInt(m4[2]) - parseInt(m4[3]));

  const m5 = prompt.match(/^(\d+) \+ (\d+) \\cdot (\d+) = \?$/);
  if (m5) return parseInt(m5[1]) + parseInt(m5[2]) * parseInt(m5[3]);

  const m6 = prompt.match(/^(\d+) - (\d+) \\cdot (\d+) = \?$/);
  if (m6) return parseInt(m6[1]) - parseInt(m6[2]) * parseInt(m6[3]);

  const m7 = prompt.match(/^(\d+) \+ (\d+) \\cdot (\d+)\^\{2\} = \?$/);
  if (m7) return parseInt(m7[1]) + parseInt(m7[2]) * (parseInt(m7[3]) * parseInt(m7[3]));

  const m8 = prompt.match(/^(\d+) - (\d+) \\cdot (\d+)\^\{2\} = \?$/);
  if (m8) return parseInt(m8[1]) - parseInt(m8[2]) * (parseInt(m8[3]) * parseInt(m8[3]));

  const m9 = prompt.match(/^(\d+) \+ \((\d+) \\cdot (\d+)\)\^\{2\} = \?$/);
  if (m9) return parseInt(m9[1]) + Math.pow(parseInt(m9[2]) * parseInt(m9[3]), 2);

  const m10 = prompt.match(/^(\d+) - \((\d+) \\cdot (\d+)\)\^\{2\} = \?$/);
  if (m10) return parseInt(m10[1]) - Math.pow(parseInt(m10[2]) * parseInt(m10[3]), 2);

  const m11 = prompt.match(/^(\d+) \+ \((\d+) \+ (\d+)\)\^\{2\} = \?$/);
  if (m11) return parseInt(m11[1]) + Math.pow(parseInt(m11[2]) + parseInt(m11[3]), 2);

  const m12 = prompt.match(/^(\d+) \+ \((\d+) - (\d+)\)\^\{2\} = \?$/);
  if (m12) return parseInt(m12[1]) + Math.pow(parseInt(m12[2]) - parseInt(m12[3]), 2);

  const m13 = prompt.match(/^2\^{(\d+) \+ (\d+)} = \?$/);
  if (m13) return Math.pow(2, parseInt(m13[1]) + parseInt(m13[2]));

  const m14 = prompt.match(/^2\^{(\d+) - (\d+)} = \?$/);
  if (m14) return Math.pow(2, parseInt(m14[1]) - parseInt(m14[2]));

  const m15 = prompt.match(/^(\d+) \+ \\sqrt{(\d+)\^\{2\} \+ (\d+)\^\{2\}} = \?$/);
  if (m15) {
    const d = Math.sqrt(parseInt(m15[2]) * parseInt(m15[2]) + parseInt(m15[3]) * parseInt(m15[3]));
    return parseInt(m15[1]) + d;
  }

  const m16 = prompt.match(/^(\d+) - \\sqrt{(\d+)\^\{2\} \+ (\d+)\^\{2\}} = \?$/);
  if (m16) {
    const d = Math.sqrt(parseInt(m16[2]) * parseInt(m16[2]) + parseInt(m16[3]) * parseInt(m16[3]));
    return parseInt(m16[1]) - d;
  }

  const m17 = prompt.match(/^(\d+) \+ \\sqrt{(\d+)\^\{2\} - (\d+)\^\{2\}} = \?$/);
  if (m17) {
    const d = Math.sqrt(parseInt(m17[2]) * parseInt(m17[2]) - parseInt(m17[3]) * parseInt(m17[3]));
    return parseInt(m17[1]) + d;
  }

  const m18 = prompt.match(/^(\d+) - \\sqrt{(\d+)\^\{2\} - (\d+)\^\{2\}} = \?$/);
  if (m18) {
    const d = Math.sqrt(parseInt(m18[2]) * parseInt(m18[2]) - parseInt(m18[3]) * parseInt(m18[3]));
    return parseInt(m18[1]) - d;
  }

  const m19 = prompt.match(/^\\sqrt{(\d+)\^\{2\} \+ (\d+)\^\{2\}} \+ (\d+) = \?$/);
  if (m19) {
    const d = Math.sqrt(parseInt(m19[1]) * parseInt(m19[1]) + parseInt(m19[2]) * parseInt(m19[2]));
    return d + parseInt(m19[3]);
  }

  const m20 = prompt.match(/^\\sqrt{(\d+)\^\{2\} \+ (\d+)\^\{2\}} - (\d+) = \?$/);
  if (m20) {
    const d = Math.sqrt(parseInt(m20[1]) * parseInt(m20[1]) + parseInt(m20[2]) * parseInt(m20[2]));
    return d - parseInt(m20[3]);
  }

  const m21 = prompt.match(/^\\sqrt{(\d+)\^\{2\} - (\d+)\^\{2\}} \+ (\d+) = \?$/);
  if (m21) {
    const d = Math.sqrt(parseInt(m21[1]) * parseInt(m21[1]) - parseInt(m21[2]) * parseInt(m21[2]));
    return d + parseInt(m21[3]);
  }

  const m22 = prompt.match(/^\\sqrt{(\d+)\^\{2\} - (\d+)\^\{2\}} - (\d+) = \?$/);
  if (m22) {
    const d = Math.sqrt(parseInt(m22[1]) * parseInt(m22[1]) - parseInt(m22[2]) * parseInt(m22[2]));
    return d - parseInt(m22[3]);
  }

  const m23 = prompt.match(/^(\d+) \\cdot \\sqrt{(\d+)\^\{2\} \+ (\d+)\^\{2\}} = \?$/);
  if (m23) {
    const d = Math.sqrt(parseInt(m23[2]) * parseInt(m23[2]) + parseInt(m23[3]) * parseInt(m23[3]));
    return parseInt(m23[1]) * d;
  }

  const m24 = prompt.match(/^(\d+) \\cdot \\sqrt{(\d+)\^\{2\} - (\d+)\^\{2\}} = \?$/);
  if (m24) {
    const d = Math.sqrt(parseInt(m24[2]) * parseInt(m24[2]) - parseInt(m24[3]) * parseInt(m24[3]));
    return parseInt(m24[1]) * d;
  }

  return null;
}

describe('generateOrderOfOperations', () => {
  it('returns a valid exercise with prompt and answer', () => {
    const ex = generateOrderOfOperations(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateOrderOfOperations(12345, 3);
    const b = generateOrderOfOperations(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateOrderOfOperations(1, 5);
    const b = generateOrderOfOperations(2, 5);
    expect(a).not.toEqual(b);
  });

  it('produces correct answers across all complexities', () => {
    for (let complexity = 0; complexity <= 9; complexity++) {
      for (let seed = 0; seed < 100; seed++) {
        const ex = generateOrderOfOperations(seed + complexity * 1000, complexity);
        const expected = computeExpected(ex.prompt);
        expect(expected).not.toBeNull();
        expect(ex.answer).toBe(String(expected));
      }
    }
  });

  it('handles edge complexity values without crashing', () => {
    const ex1 = generateOrderOfOperations(42, -1);
    expect(ex1).toHaveProperty('prompt');
    expect(ex1).toHaveProperty('answer');

    const ex2 = generateOrderOfOperations(42, 20);
    expect(ex2).toHaveProperty('prompt');
    expect(ex2).toHaveProperty('answer');
  });

  it('produces integer answers', () => {
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateOrderOfOperations(seed, Math.floor(seed / 50) % 10);
      const expected = computeExpected(ex.prompt);
      expect(expected).not.toBeNull();
      expect(Number.isInteger(expected)).toBe(true);
    }
  });
});
