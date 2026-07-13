import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { reduceFrac, fracEqual } from '../math/fraction';
import { pick, randInt } from '../math/rng';

export interface AreaData {
  shape: 'triangle' | 'rectangle' | 'parallelogram' | 'circle';
  dim1: number;
  dim1Num: number;
  dim1Den: number;
  dim2?: number;
  dim2Num?: number;
  dim2Den?: number;
  dim3?: number;
  dim3Num?: number;
  dim3Den?: number;
  areaNum: number;
  areaDen: number;
  target: 'area' | 'dim';
  missingDimIndex?: 1 | 2;
  promptKey: string;
  vertices: { x: number; y: number }[];
}

interface Dim {
  num: number;
  den: number;
}

type Shape = AreaData['shape'];

function dimToFloat(d: Dim): number {
  return d.num / d.den;
}

function fmtFrac(num: number, den: number): string {
  const [rn, rd] = reduceFrac(num, den);
  if (rd === 1) return String(rn);
  return `${rn},${rd}`;
}

function randDim(rng: () => number, maxVal: number, allowFrac: boolean): Dim {
  const base = randInt(rng, 2, maxVal);
  if (!allowFrac || rng() > 0.35) {
    return { num: base, den: 1 };
  }
  const denOption = [2, 3, 4][Math.floor(rng() * 3)];
  const [rn, rd] = reduceFrac(base, denOption);
  return { num: rn, den: rd };
}

function mulDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.num, a.den * b.den);
  return { num: rn, den: rd };
}

function divDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.den, a.den * b.num);
  return { num: rn, den: rd };
}

function triangleArea(b: Dim, h: Dim): Dim {
  const [rn, rd] = reduceFrac(b.num * h.num, b.den * h.den * 2);
  return { num: rn, den: rd };
}

function genSlant(rng: () => number, h: Dim): Dim {
  const hFloat = dimToFloat(h);
  const slantMin = Math.max(2, Math.floor(hFloat * 1.3) + 1);
  const slantMax = Math.max(slantMin, Math.floor(hFloat * 2.5));
  const slantNum = randInt(rng, slantMin, slantMax);
  return { num: slantNum, den: 1 };
}

function computeVertices(shape: Shape, d1: Dim, d2: Dim, d3?: Dim): { x: number; y: number }[] {
  const v1 = dimToFloat(d1);
  const v2 = dimToFloat(d2);
  const v3 = d3 ? dimToFloat(d3) : 0;

  const scaleCap = 40;

  switch (shape) {
    case 'triangle': {
      const scale = Math.min(220 / v1, 170 / v2, scaleCap);
      const basePx = v1 * scale;
      const heightPx = v2 * scale;
      return [
        { x: 180 - basePx / 2, y: 195 },
        { x: 180 + basePx / 2, y: 195 },
        { x: 180, y: 195 - heightPx },
      ];
    }
    case 'rectangle': {
      const scale = Math.min(220 / v1, 170 / v2, scaleCap);
      const w = v1 * scale;
      const h = v2 * scale;
      return [
        { x: 180 - w / 2, y: 195 - h / 2 },
        { x: 180 + w / 2, y: 195 - h / 2 },
        { x: 180 + w / 2, y: 195 + h / 2 },
        { x: 180 - w / 2, y: 195 + h / 2 },
      ];
    }
    case 'parallelogram': {
      const scale = Math.min(200 / v1, 170 / v2, scaleCap);
      const w = v1 * scale;
      const h = v2 * scale;
      const offsetSq = Math.max(v3 * v3 - v2 * v2, 0);
      const slantPx = v3 > 0 ? Math.sqrt(Math.min(offsetSq, 2500)) * scale : 30;
      const s = Math.min(slantPx, 60);
      return [
        { x: 180 - w / 2, y: 210 },
        { x: 180 + w / 2, y: 210 },
        { x: 180 + w / 2 - s, y: 210 - h },
        { x: 180 - w / 2 - s, y: 210 - h },
      ];
    }
    case 'circle': {
      const rPx = Math.min(v1 * 12, 85);
      return [
        { x: 180 - rPx, y: 110 - rPx },
        { x: 180 + rPx, y: 110 + rPx },
        { x: 180, y: 110 },
        { x: 180 + rPx, y: 110 },
      ];
    }
  }
}

export function generateArea(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  let shape: Shape;
  let d1: Dim;
  let d2: Dim;
  let d3: Dim | undefined;
  let area: Dim;
  let target: 'area' | 'dim' = 'area';
  let missingDimIndex: 1 | 2 | undefined;

  if (clamped <= 1) {
    shape = pick(rng, ['triangle', 'rectangle']);
    d1 = randDim(rng, 10, false);
    d2 = randDim(rng, 10, false);
    area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
  } else if (clamped <= 3) {
    shape = pick(rng, ['triangle', 'rectangle', 'parallelogram']);
    const allowFrac = clamped >= 3;
    const maxVal = clamped <= 2 ? 10 : 20;
    d1 = randDim(rng, maxVal, allowFrac);
    d2 = randDim(rng, maxVal, allowFrac);
    area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
  } else if (clamped <= 7) {
    const hasCircle = clamped >= 6;
    shape = pick(
      rng,
      hasCircle ? ['triangle', 'rectangle', 'parallelogram', 'circle'] : ['triangle', 'rectangle', 'parallelogram'],
    );
    if (shape === 'circle') {
      const r = randInt(rng, 2, 10);
      d1 = { num: r, den: 1 };
      d2 = { num: r, den: 1 };
      area = { num: r * r, den: 1 };
    } else {
      d1 = randDim(rng, 12, true);
      d2 = randDim(rng, 12, true);
      area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
      if (rng() < 0.4) {
        target = 'dim';
        const hideFirst = rng() < 0.5;
        missingDimIndex = hideFirst ? 1 : 2;
      }
    }
  } else if (clamped <= 9) {
    shape = 'parallelogram';
    d1 = randDim(rng, 10, true);
    d2 = { num: randInt(rng, 2, 8), den: 1 };
    const hInt = d2.num;
    const offset = randInt(rng, 2, Math.min(6, Math.max(2, hInt - 1)));
    const slantSq = offset * offset + hInt * hInt;
    const slant = Math.round(Math.sqrt(slantSq));
    d3 = { num: Math.max(hInt + 1, slant), den: 1 };
    area = mulDim(d1, d2);
  } else {
    shape = pick(rng, ['triangle', 'rectangle', 'parallelogram', 'circle']);
    if (shape === 'circle') {
      if (rng() < 0.5) {
        const r = randInt(rng, 2, 10);
        d1 = { num: r, den: 1 };
        d2 = { num: r, den: 1 };
        area = { num: r * r, den: 1 };
      } else {
        const rd = randDim(rng, 8, true);
        d1 = rd;
        d2 = rd;
        const [rNum, rDen] = reduceFrac(rd.num * rd.num, rd.den * rd.den);
        area = { num: rNum, den: rDen };
      }
    } else {
      d1 = randDim(rng, 12, true);
      d2 = randDim(rng, 12, true);
      area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
      if (rng() < 0.5) {
        target = 'dim';
        const hideFirst = rng() < 0.5;
        missingDimIndex = hideFirst ? 1 : 2;
      }
    }
  }

  if (shape === 'parallelogram' && d3 === undefined) {
    d3 = genSlant(rng, d2);
  }

  const vertices = computeVertices(shape, d1, d2, d3);
  const answer =
    target === 'dim' && shape !== 'circle' && missingDimIndex !== undefined
      ? (() => {
          const known = missingDimIndex === 1 ? d2! : d1;
          const derived =
            shape === 'triangle' ? divDim({ num: area.num * 2, den: area.den }, known) : divDim(area, known);
          return fmtFrac(derived.num, derived.den);
        })()
      : fmtFrac(area.num, area.den);

  return {
    prompt: '',
    answer,
    data: {
      shape,
      dim1: dimToFloat(d1),
      dim1Num: d1.num,
      dim1Den: d1.den,
      dim2: shape !== 'circle' ? dimToFloat(d2) : undefined,
      dim2Num: shape !== 'circle' ? d2.num : undefined,
      dim2Den: shape !== 'circle' ? d2.den : undefined,
      dim3: d3 ? dimToFloat(d3) : undefined,
      dim3Num: d3 ? d3.num : undefined,
      dim3Den: d3 ? d3.den : undefined,
      areaNum: area.num,
      areaDen: area.den,
      target,
      missingDimIndex,
      promptKey: target === 'dim' ? 'exercise.area.promptDim' : 'exercise.area.prompt',
      vertices,
    } satisfies AreaData,
  };
}

export function validateArea(answer: string, exercise: Exercise): boolean {
  const trimmed = answer.trim();
  if (trimmed.includes('.')) return false;
  if ((trimmed.match(/,/g) || []).length > 1) return false;
  const normAnswer = trimmed.replace(',', '/');
  const normCorrect = exercise.answer.replace(',', '/');
  return fracEqual(normAnswer, normCorrect);
}
