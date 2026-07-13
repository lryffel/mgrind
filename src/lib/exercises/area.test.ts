import { describe, it, expect } from 'vitest';
import { generateArea, validateArea } from './area';
import type { AreaData } from './area';
import type { Exercise } from '../types';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('area', () => {
  it('generates deterministic output', () => {
    expectDeterministic(generateArea, 42, 0);
  });

  it('generates different output for different seeds', () => {
    expectSeedVariation(generateArea, 0);
  });

  it('has prompt and answer', () => {
    expectHasPromptAndAnswer(generateArea, 42, 0);
  });

  it('generates all shapes in their bands', () => {
    const shapesAtLevel: Record<number, Set<string>> = {};
    for (let comp = 0; comp <= 10; comp++) {
      shapesAtLevel[comp] = new Set();
    }
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        shapesAtLevel[comp].add(data.shape);
      }
    }
    for (let comp = 0; comp <= 1; comp++) {
      expect(shapesAtLevel[comp].has('triangle')).toBe(true);
      expect(shapesAtLevel[comp].has('rectangle')).toBe(true);
      expect(shapesAtLevel[comp].has('parallelogram')).toBe(false);
      expect(shapesAtLevel[comp].has('circle')).toBe(false);
    }
    for (let comp = 2; comp <= 5; comp++) {
      expect(shapesAtLevel[comp].has('triangle')).toBe(true);
      expect(shapesAtLevel[comp].has('rectangle')).toBe(true);
      expect(shapesAtLevel[comp].has('parallelogram')).toBe(true);
      expect(shapesAtLevel[comp].has('circle')).toBe(false);
    }
    for (let comp = 6; comp <= 7; comp++) {
      expect(shapesAtLevel[comp].has('circle')).toBe(true);
    }
    for (let comp = 8; comp <= 9; comp++) {
      expect(shapesAtLevel[comp].has('parallelogram')).toBe(true);
      expect(shapesAtLevel[comp].has('triangle')).toBe(false);
      expect(shapesAtLevel[comp].has('rectangle')).toBe(false);
      expect(shapesAtLevel[comp].has('circle')).toBe(false);
    }
    expect(shapesAtLevel[10].has('triangle')).toBe(true);
    expect(shapesAtLevel[10].has('rectangle')).toBe(true);
    expect(shapesAtLevel[10].has('parallelogram')).toBe(true);
    expect(shapesAtLevel[10].has('circle')).toBe(true);
  });

  it('inverted problems appear in appropriate bands', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const comp of [4, 5, 6, 7, 10]) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape !== 'circle' && data.target === 'dim') {
          expect(data.missingDimIndex).toBeDefined();
          expect([1, 2]).toContain(data.missingDimIndex);
        }
      }
    }
  });

  it('inverted problems do not appear at levels 0-3 or 8-9', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const comp of [0, 1, 2, 3, 8, 9]) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.target).toBe('area');
      }
    }
  });

  it('stores areaNum and areaDen in data', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.areaNum).toBeGreaterThan(0);
        expect(data.areaDen).toBeGreaterThan(0);
        const ratio = data.areaNum / data.areaDen;
        if (data.shape === 'circle') {
          const r = data.dim1;
          expect(Math.abs(ratio - r * r)).toBeLessThan(0.001);
        } else if (data.shape === 'triangle') {
          expect(Math.abs(ratio - 0.5 * data.dim1 * data.dim2!)).toBeLessThan(0.001);
        } else {
          expect(Math.abs(ratio - data.dim1 * data.dim2!)).toBeLessThan(0.001);
        }
      }
    }
  });

  it('computes correct areas for all non-circle shapes', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape === 'circle') continue;
        if (data.target === 'dim') continue;

        const dim1 = data.dim1;
        const dim2 = data.dim2!;
        const expectedArea = data.shape === 'triangle' ? 0.5 * dim1 * dim2 : dim1 * dim2;
        const answerStr = ex.answer.replace(',', '/');
        const parts = answerStr.split('/');
        const answerNum = parseInt(parts[0], 10);
        const answerDen = parts.length > 1 ? parseInt(parts[1], 10) : 1;
        expect(Math.abs(answerNum / answerDen - expectedArea)).toBeLessThan(0.001);
      }
    }
  });

  it('computes correct missing dimensions for inverted problems', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const comp of [4, 5, 6, 7, 10]) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape === 'circle' || data.target !== 'dim') continue;
        const answerStr = ex.answer.replace(',', '/');
        const parts = answerStr.split('/');
        const answerVal = parseInt(parts[0], 10) / (parts.length > 1 ? parseInt(parts[1], 10) : 1);
        const matchesDim = [data.dim1, data.dim2!].some((d) => Math.abs(d - answerVal) < 0.001);
        expect(matchesDim).toBe(true);
      }
    }
  });

  it('circle answers are valid coefficients', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const comp of [6, 7, 10]) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape !== 'circle') continue;
        const isInt = !ex.answer.includes(',');
        expect(ex.answer).toMatch(/^\d+(,\d+)?$/);
        expect(validateArea(ex.answer, ex)).toBe(true);
        if (isInt) {
          const num = parseInt(ex.answer, 10);
          expect(num).toBeGreaterThan(0);
          expect(validateArea(num + '.0', ex)).toBe(false);
        }
        expect(validateArea('78.54', ex)).toBe(false);
      }
    }
  });

  it('rejects negative and zero dimensions', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.dim1).toBeGreaterThan(0);
        expect(data.dim1Num).toBeGreaterThan(0);
        expect(data.dim1Den).toBeGreaterThan(0);
        if (data.dim2 !== undefined) {
          expect(data.dim2).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all polygon areas are positive integers or reduced fractions', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape === 'circle') continue;
        const parts = ex.answer.split(',');
        const num = parseInt(parts[0], 10);
        const den = parts.length > 1 ? parseInt(parts[1], 10) : 1;
        expect(num).toBeGreaterThan(0);
        expect(den).toBeGreaterThan(0);
        const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
        expect(gcd(num, den)).toBe(1);
      }
    }
  });

  it('clamps complexity correctly', () => {
    const below = generateArea(42, -5);
    const atZero = generateArea(42, 0);
    expect(below).toEqual(atZero);

    const above = generateArea(42, 15);
    const atTen = generateArea(42, 10);
    expect(above).toEqual(atTen);
  });

  it('validateArea handles circle coefficients and polygon fractions', () => {
    const circleEx: Exercise = {
      prompt: '',
      answer: '25',
      data: {
        shape: 'circle',
        dim1: 5,
        dim1Num: 5,
        dim1Den: 1,
        areaNum: 25,
        areaDen: 1,
        target: 'area',
        promptKey: 'exercise.area.prompt',
        vertices: [
          { x: 100, y: 80 },
          { x: 145, y: 80 },
        ],
      } as unknown as AreaData,
    };
    expect(validateArea('25', circleEx)).toBe(true);
    expect(validateArea('78.54', circleEx)).toBe(false);
    expect(validateArea('5', circleEx)).toBe(false);

    const fracEx: Exercise = {
      prompt: '',
      answer: '45,2',
      data: {
        shape: 'triangle',
        dim1: 5,
        dim1Num: 5,
        dim1Den: 1,
        dim2: 9,
        dim2Num: 9,
        dim2Den: 1,
        areaNum: 45,
        areaDen: 2,
        target: 'area',
        promptKey: 'exercise.area.prompt',
        vertices: [
          { x: 30, y: 140 },
          { x: 170, y: 140 },
          { x: 100, y: 40 },
        ],
      } as unknown as AreaData,
    };
    expect(validateArea('45,2', fracEx)).toBe(true);
    expect(validateArea('45,4', fracEx)).toBe(false);
    expect(validateArea('22.5', fracEx)).toBe(false);
  });

  it('parallelogram at levels 8-9 includes slant side in data', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 8; comp <= 9; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.shape).toBe('parallelogram');
        expect(data.target).toBe('area');
        expect(data.dim3).toBeDefined();
        expect(data.dim3).toBeGreaterThan(0);
        expect(data.dim3Num).toBeDefined();
        expect(data.dim3Den).toBeDefined();
      }
    }
  });

  it('parallelogram slant is longer than height', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 8; comp <= 9; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.shape).toBe('parallelogram');
        expect(data.dim3!).toBeGreaterThan(data.dim2!);
      }
    }
  });

  it('all exercises have vertices', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        expect(data.vertices).toBeDefined();
        expect(data.vertices.length).toBeGreaterThanOrEqual(2);
        for (const v of data.vertices) {
          expect(typeof v.x).toBe('number');
          expect(typeof v.y).toBe('number');
        }
      }
    }
  });

  it('inverted problems have missingDimIndex and promptKey', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const comp of [4, 5, 6, 7, 10]) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.target === 'dim') {
          expect(data.missingDimIndex).toBeDefined();
          expect([1, 2]).toContain(data.missingDimIndex);
          expect(data.promptKey).toBe('exercise.area.promptDim');
        } else {
          expect(data.promptKey).toBe('exercise.area.prompt');
        }
      }
    }
  });

  it('dimension labels use exact fractions, not decimals', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 3; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape === 'circle') continue;
        expect(data.dim1Num / data.dim1Den).toBeCloseTo(data.dim1, 10);
        if (data.dim2Num !== undefined && data.dim2Den !== undefined) {
          expect(data.dim2Num / data.dim2Den).toBeCloseTo(data.dim2!, 10);
        }
      }
    }
  });

  it('data areaNum/areaDen stores the actual area regardless of target', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateArea(seed, comp);
        const data = ex.data as AreaData;
        if (data.shape === 'circle') continue;
        const answerStr = ex.answer.replace(',', '/');
        const answerParts = answerStr.split('/');
        const answerVal = parseInt(answerParts[0], 10) / (answerParts.length > 1 ? parseInt(answerParts[1], 10) : 1);
        const areaVal = data.areaNum / data.areaDen;
        const expectedArea = data.shape === 'triangle' ? 0.5 * data.dim1 * data.dim2! : data.dim1 * data.dim2!;
        if (data.target === 'dim') {
          const matchesDim = [data.dim1, data.dim2!].some((d) => Math.abs(d - answerVal) < 0.001);
          expect(matchesDim).toBe(true);
          expect(Math.abs(areaVal - expectedArea)).toBeLessThan(0.001);
        } else {
          expect(areaVal).toEqual(answerVal);
        }
      }
    }
  });
});
