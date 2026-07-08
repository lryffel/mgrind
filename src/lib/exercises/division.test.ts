import { describe, it, expect } from 'vitest';
import { generateDivision } from './division';

const MUL_RE = /^(\d+) \u22C5 \? = (\d+)$/;
const DIV_RE = /^(\d+) \/ (\d+) = \?$/;

function parseAandC(prompt: string, answer: string): { a: number; c: number } {
  const mulMatch = prompt.match(MUL_RE);
  if (mulMatch) {
    return { a: parseInt(mulMatch[1]), c: parseInt(answer) };
  }
  const divMatch = prompt.match(DIV_RE);
  if (divMatch) {
    return { a: parseInt(divMatch[2]), c: parseInt(answer) };
  }
  throw new Error(`Unexpected prompt format: ${prompt}`);
}

describe('generateDivision', () => {
  it('returns a valid exercise with a prompt and answer', () => {
    const ex = generateDivision(42, 0);
    expect(ex).toHaveProperty('prompt');
    expect(ex).toHaveProperty('answer');
    expect(ex.prompt).toMatch(/^\d+ \u22C5 \? = \d+$|^\d+ \/ \d+ = \?$/);
  });

  it('is deterministic for the same seed and complexity', () => {
    const a = generateDivision(12345, 3);
    const b = generateDivision(12345, 3);
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = generateDivision(1, 5);
    const b = generateDivision(2, 5);
    expect(a).not.toEqual(b);
  });

  it('produces correct missing-factor results', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateDivision(seed, 5);
      const mulMatch = ex.prompt.match(MUL_RE);
      const divMatch = ex.prompt.match(DIV_RE);
      if (mulMatch) {
        const a = parseInt(mulMatch[1]);
        const b = parseInt(mulMatch[2]);
        const c = parseInt(ex.answer);
        expect(a * c).toBe(b);
      } else if (divMatch) {
        const b = parseInt(divMatch[1]);
        const a = parseInt(divMatch[2]);
        const c = parseInt(ex.answer);
        expect(b).toBe(a * c);
      } else {
        throw new Error(`Unexpected prompt format: ${ex.prompt}`);
      }
    }
  });

  it('uses factors >= 2', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateDivision(seed, 0);
      const { a, c } = parseAandC(ex.prompt, ex.answer);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(c).toBeGreaterThanOrEqual(2);
    }
  });

  it('at complexity 0, max factor is 10', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateDivision(seed, 0);
      const { a, c } = parseAandC(ex.prompt, ex.answer);
      expect(a).toBeLessThanOrEqual(10);
      expect(c).toBeLessThanOrEqual(10);
    }
  });

  it('at complexity 9, can produce factors up to 19', () => {
    let foundHigh = false;
    for (let seed = 0; seed < 500; seed++) {
      const ex = generateDivision(seed, 9);
      const { a, c } = parseAandC(ex.prompt, ex.answer);
      if (a > 10 || c > 10) {
        foundHigh = true;
        break;
      }
    }
    expect(foundHigh).toBe(true);
  });

  it('PRNG produces deterministic but varied output', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const exA = generateDivision(seed, 5);
      const exB = generateDivision(seed, 5);
      expect(exA).toEqual(exB);
      seen.add(exA.prompt + exA.answer);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
