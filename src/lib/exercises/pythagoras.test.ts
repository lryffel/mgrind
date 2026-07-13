import { describe, it, expect } from 'vitest';
import type { Exercise } from '../types';
import { generatePythagoras, validatePythagoras, type PythagorasData } from './pythagoras';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

function d(ex: { data?: unknown }): PythagorasData {
  return ex.data as PythagorasData;
}

describe('pythagoras', () => {
  it('generates deterministic output', () => {
    expectDeterministic(generatePythagoras, 42, 0);
  });

  it('generates different output for different seeds', () => {
    expectSeedVariation(generatePythagoras, 0);
  });

  it('has prompt and answer', () => {
    expectHasPromptAndAnswer(generatePythagoras, 42, 0);
  });

  it('right triangles have correct Pythagorean relationship', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);

        if (!data.isRight) continue;

        // Compute a², b², c²
        const a2 = (data.sideANum / data.sideADen) ** 2;
        const b2 = (data.sideBNum / data.sideBDen) ** 2;
        const c2 = (data.sideCNum / data.sideCDen) ** 2;

        if (data.missingSide === 'AB') {
          expect(Math.abs(a2 - (c2 - b2))).toBeLessThan(0.001);
        } else if (data.missingSide === 'AC') {
          expect(Math.abs(b2 - (c2 - a2))).toBeLessThan(0.001);
        } else {
          expect(Math.abs(c2 - (a2 + b2))).toBeLessThan(0.001);
        }
      }
    }
  });

  it('non-right triangles answer is cannot_compute', () => {
    let foundNonRight = false;
    for (let seed = 0; seed < 500; seed++) {
      for (let comp = 6; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        if (!data.isRight) {
          foundNonRight = true;
          expect(ex.answer).toBe('cannot_compute');
        }
      }
    }
    expect(foundNonRight).toBe(true);
  });

  it('validates non-right answer correctly', () => {
    const ex: Exercise = { prompt: '', answer: 'cannot_compute', data: {} as PythagorasData };
    expect(validatePythagoras('cannot_compute', ex)).toBe(true);
    expect(validatePythagoras('5', ex)).toBe(false);
    expect(validatePythagoras('', ex)).toBe(false);
  });

  it('validates right triangle answer correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 0; comp < 6; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        if (!data.isRight) continue;

        expect(validatePythagoras(ex.answer, ex)).toBe(true);
        expect(validatePythagoras('0', ex)).toBe(false);
      }
    }
  });

  it('side squares never exceed 25', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);

        const a = data.sideANum / data.sideADen;
        const b = data.sideBNum / data.sideBDen;
        const c = data.sideCNum / data.sideCDen;

        expect(a * a).toBeLessThanOrEqual(25.001);
        expect(b * b).toBeLessThanOrEqual(25.001);
        expect(c * c).toBeLessThanOrEqual(25.001);
      }
    }
  });

  it('answer is a reduced fraction', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        if (ex.answer === 'cannot_compute') continue;

        if (ex.answer.includes('/')) {
          const [n, d] = ex.answer.split('/').map(Number);
          expect(Number.isInteger(n)).toBe(true);
          expect(Number.isInteger(d)).toBe(true);
          expect(d).not.toBe(0);
        } else {
          const n = Number(ex.answer);
          expect(Number.isInteger(n)).toBe(true);
        }
      }
    }
  });

  it('non-right triangles appear at high complexity', () => {
    let nonRightCount = 0;
    let totalCount = 0;
    for (let seed = 0; seed < 300; seed++) {
      for (let comp = 8; comp < 10; comp++) {
        totalCount++;
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        if (!data.isRight) nonRightCount++;
      }
    }
    expect(nonRightCount).toBeGreaterThan(0);
    expect(nonRightCount).toBeLessThan(totalCount);
  });

  it('stores vertex positions within SVG bounds', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 0; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        for (const v of data.triangleVertices) {
          expect(v.x).toBeGreaterThanOrEqual(0);
          expect(v.x).toBeLessThanOrEqual(250);
          expect(v.y).toBeGreaterThanOrEqual(0);
          expect(v.y).toBeLessThanOrEqual(250);
        }
      }
    }
  });

  it('right triangles have a right angle vertex', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp < 6; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        expect(data.rightAngleVertex).not.toBeNull();
      }
    }
  });

  it('non-right triangles have no right angle vertex', () => {
    for (let seed = 0; seed < 500; seed++) {
      for (let comp = 6; comp < 10; comp++) {
        const ex = generatePythagoras(seed, comp);
        const data = d(ex);
        if (!data.isRight) {
          expect(data.rightAngleVertex).toBeNull();
        }
      }
    }
  });
});
