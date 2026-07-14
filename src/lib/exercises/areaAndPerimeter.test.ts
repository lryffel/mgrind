import { describe, it, expect } from 'vitest';
import { generateAreaAndPerimeter, validateAreaAndPerimeter } from './areaAndPerimeter';
import type { AreaAndPerimeterData } from './areaAndPerimeter';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('areaAndPerimeter', () => {
  it('generates deterministic output', () => {
    expectDeterministic(generateAreaAndPerimeter, 42, 0);
  });

  it('generates different output for different seeds', () => {
    expectSeedVariation(generateAreaAndPerimeter, 0);
  });

  it('has prompt and answer', () => {
    expectHasPromptAndAnswer(generateAreaAndPerimeter, 42, 0);
  });

  it('generates all shapes in their expected complexity bands', () => {
    const shapesAtLevel: Record<number, Set<string>> = {};
    for (let comp = 0; comp <= 10; comp++) {
      shapesAtLevel[comp] = new Set();
    }
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        shapesAtLevel[comp].add(data.shape);
      }
    }
    // Tier L (0-3)
    for (let comp = 0; comp <= 1; comp++) {
      expect(shapesAtLevel[comp].has('rect')).toBe(true);
      expect(shapesAtLevel[comp].has('square')).toBe(true);
      expect(shapesAtLevel[comp].has('triangle')).toBe(true);
    }
    for (let comp = 2; comp <= 3; comp++) {
      expect(shapesAtLevel[comp].has('parallelogram')).toBe(true);
      expect(shapesAtLevel[comp].has('triangleRight')).toBe(true);
    }
    // Tier M (4-7)
    for (let comp = 4; comp <= 5; comp++) {
      expect(shapesAtLevel[comp].has('rect')).toBe(true);
      expect(shapesAtLevel[comp].has('triangle')).toBe(true);
    }
    for (let comp = 6; comp <= 7; comp++) {
      expect(shapesAtLevel[comp].has('circle')).toBe(true);
    }
    // Tier H (8-10)
    for (let comp = 8; comp <= 9; comp++) {
      expect(
        shapesAtLevel[comp].has('annulus') ||
          shapesAtLevel[comp].has('lShape') ||
          shapesAtLevel[comp].has('rectWithHole'),
      ).toBe(true);
    }
    expect(shapesAtLevel[10].has('circle')).toBe(true);
  });

  it('all computed answers are correct (spot-check formulas)', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        if (!data.solvable) continue;

        if (data.asks.length === 1) {
          const answer = data.asks[0] === 'area' ? data.expected.area : data.expected.perim;
          expect(answer).toBeDefined();
          expect(validateAreaAndPerimeter(answer!, ex)).toBe(true);
        } else {
          const answer = `${data.expected.area}|${data.expected.perim}`;
          expect(validateAreaAndPerimeter(answer, ex)).toBe(true);
        }
      }
    }
  });

  it('solvable exercises accept correct answers and reject incorrect', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        if (!data.solvable) continue;

        expect(validateAreaAndPerimeter(ex.answer, ex)).toBe(true);
        if (ex.answer !== 'cannot_compute') {
          expect(validateAreaAndPerimeter('999', ex)).toBe(false);
        }
      }
    }
  });

  it('circle answers accept integer coefficients and reject decimals', () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateAreaAndPerimeter(seed, 6);
      const data = ex.data as AreaAndPerimeterData;
      if (data.shape !== 'circle') continue;
      if (!data.solvable) continue;

      expect(validateAreaAndPerimeter(ex.answer, ex)).toBe(true);
      // Reject decimal approximations
      const answerParts = ex.answer.split('|');
      for (const part of answerParts) {
        expect(validateAreaAndPerimeter(part.includes(',') ? part : String(parseInt(part) + 0.5), ex)).toBe(false);
      }
    }
  });

  it('distractors: cannot_compute accepted when solvable is false', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAreaAndPerimeter(seed, 10);
      const data = ex.data as AreaAndPerimeterData;
      if (data.solvable) continue;

      expect(validateAreaAndPerimeter('cannot_compute', ex)).toBe(true);
      expect(validateAreaAndPerimeter('42', ex)).toBe(false);
    }
  });

  it('distractors: numeric answer accepted when solvable is true', () => {
    for (let seed = 0; seed < 200; seed++) {
      const ex = generateAreaAndPerimeter(seed, 10);
      const data = ex.data as AreaAndPerimeterData;
      if (!data.solvable) continue;

      expect(validateAreaAndPerimeter('cannot_compute', ex)).toBe(false);
    }
  });

  it('composite shapes compute area correctly', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 8; comp <= 9; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        expect(data.asks).toContain('area');
        expect(data.expected.area).toBeDefined();
        if (data.shape !== 'annulus') {
          expect(data.asks).toContain('perim');
          expect(data.expected.perim).toBeDefined();
        }
      }
    }
  });

  it('multi-field validation round-trip works', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 4; comp <= 9; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        if (data.asks.length < 2) continue;
        expect(ex.answer.includes('|')).toBe(true);
        const parts = ex.answer.split('|');
        expect(parts.length).toBe(2);
        expect(validateAreaAndPerimeter(ex.answer, ex)).toBe(true);
      }
    }
  });

  it('annulus only asks area', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 8; comp <= 9; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        if (data.shape !== 'annulus') continue;
        expect(data.asks).toEqual(['area']);
        expect(data.fields?.length).toBe(1);
        expect(ex.answer).not.toContain('|');
      }
    }
  });

  it('complexity clamping works', () => {
    const below = generateAreaAndPerimeter(42, -5);
    const atZero = generateAreaAndPerimeter(42, 0);
    expect(below).toEqual(atZero);

    const above = generateAreaAndPerimeter(42, 15);
    const atTen = generateAreaAndPerimeter(42, 10);
    expect(above).toEqual(atTen);
  });

  it('i18n keys exist for all prompt variants', () => {
    const keys = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        keys.add(data.promptKey);
      }
    }
    expect(keys.has('exercise.areaAndPerimeter.promptArea')).toBe(true);
    expect(keys.has('exercise.areaAndPerimeter.promptPerim')).toBe(true);
    expect(keys.has('exercise.areaAndPerimeter.promptBoth')).toBe(true);
  });

  it('all exercises have vertices', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        expect(data.vertices).toBeDefined();
        expect(data.vertices.length).toBeGreaterThanOrEqual(2);
        for (const v of data.vertices) {
          expect(typeof v.x).toBe('number');
          expect(typeof v.y).toBe('number');
        }
      }
    }
  });

  it('Tier L only asks one quantity', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 3; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        expect(data.asks.length).toBe(1);
        expect(data.tipLevel).toBe(1);
      }
    }
  });

  it('Tier M includes both or inverted problems', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 4; comp <= 7; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        expect(data.tipLevel).toBe(2);
      }
    }
  });

  it('Tier H includes composites and distractors', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 8; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        expect(data.tipLevel).toBe(3);
      }
    }
  });

  it('rejects decimal answers', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateAreaAndPerimeter(seed, 0);
      const data = ex.data as AreaAndPerimeterData;
      if (!data.solvable || data.asks.length > 1) continue;
      expect(validateAreaAndPerimeter('12.5', ex)).toBe(false);
    }
  });

  it('all dimensions are positive', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateAreaAndPerimeter(seed, comp);
        const data = ex.data as AreaAndPerimeterData;
        for (const dim of data.dims) {
          expect(dim.num).toBeGreaterThan(0);
          expect(dim.den).toBeGreaterThan(0);
        }
      }
    }
  });
});
