import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { reduceFrac, fracEqual } from '../math/fraction';
import { pick, randInt } from '../math/rng';

export type AreaAndPerimeterShape =
  'rect' | 'square' | 'triangle' | 'triangleRight' | 'circle' | 'parallelogram' | 'annulus' | 'lShape' | 'rectWithHole';

export interface AreaAndPerimeterData {
  shape: AreaAndPerimeterShape;
  given: { label: string; value: string; unit: string }[];
  asks: ('area' | 'perim')[];
  solvable: boolean;
  unitArea: string;
  unitPerim: string;
  dims: { num: number; den: number; label: string }[];
  expected: { area?: string; perim?: string };
  fields?: { variablePart: string }[];
  tipLevel: 1 | 2 | 3;
  vertices: { x: number; y: number }[];
  promptKey: DictKey;
}

interface Dim {
  num: number;
  den: number;
}

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

function randIntDim(rng: () => number, minVal: number, maxVal: number): Dim {
  return { num: randInt(rng, minVal, maxVal), den: 1 };
}

function mulDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.num, a.den * b.den);
  return { num: rn, den: rd };
}

function divDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.den, a.den * b.num);
  return { num: rn, den: rd };
}

function addDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.den + b.num * a.den, a.den * b.den);
  return { num: rn, den: rd };
}

function subDim(a: Dim, b: Dim): Dim {
  const [rn, rd] = reduceFrac(a.num * b.den - b.num * a.den, a.den * b.den);
  return { num: rn, den: rd };
}

function triangleArea(b: Dim, h: Dim): Dim {
  const [rn, rd] = reduceFrac(b.num * h.num, b.den * h.den * 2);
  return { num: rn, den: rd };
}

function dimDouble(d: Dim): Dim {
  const [rn, rd] = reduceFrac(d.num * 2, d.den);
  return { num: rn, den: rd };
}

const rightTriples: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
];

function genSlant(rng: () => number, h: Dim): Dim {
  const hFloat = dimToFloat(h);
  const slantMin = Math.max(2, Math.floor(hFloat * 1.3) + 1);
  const slantMax = Math.max(slantMin, Math.floor(hFloat * 2.5));
  const slantNum = randInt(rng, slantMin, slantMax);
  return { num: slantNum, den: 1 };
}

function computeRectVertices(aPx: number, bPx: number, cx: number, cy: number): { x: number; y: number }[] {
  return [
    { x: cx - aPx / 2, y: cy - bPx / 2 },
    { x: cx + aPx / 2, y: cy - bPx / 2 },
    { x: cx + aPx / 2, y: cy + bPx / 2 },
    { x: cx - aPx / 2, y: cy + bPx / 2 },
  ];
}

function computeVertices(shape: AreaAndPerimeterShape, d1: Dim, d2: Dim, d3?: Dim): { x: number; y: number }[] {
  const v1 = dimToFloat(d1);
  const v2 = dimToFloat(d2);
  const v3 = d3 ? dimToFloat(d3) : 0;
  const scaleCap = 40;

  switch (shape) {
    case 'rect':
    case 'square': {
      const scale = Math.min(220 / v1, 170 / v2, scaleCap);
      return computeRectVertices(v1 * scale, v2 * scale, 180, 110);
    }
    case 'triangle': {
      const scale = Math.min(220 / v1, 170 / v2, scaleCap);
      return [
        { x: 180 - (v1 * scale) / 2, y: 195 },
        { x: 180 + (v1 * scale) / 2, y: 195 },
        { x: 180, y: 195 - v2 * scale },
      ];
    }
    case 'triangleRight': {
      const scale = Math.min(220 / v1, 170 / v2, scaleCap);
      return [
        { x: 180 - (v1 * scale) / 2, y: 195 - v2 * scale },
        { x: 180 + (v1 * scale) / 2, y: 195 },
        { x: 180 - (v1 * scale) / 2, y: 195 },
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
    case 'annulus': {
      const outerR = Math.min(v1 * 12, 90);
      const innerR = Math.min(v2 * 12, outerR - 15);
      return [
        { x: 180 - outerR, y: 110 - outerR },
        { x: 180 + outerR, y: 110 + outerR },
        { x: 180 - innerR, y: 110 - innerR },
        { x: 180 + innerR, y: 110 + innerR },
        { x: 180, y: 110 },
        { x: 180 + outerR, y: 110 },
        { x: 180, y: 110 - outerR },
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
    case 'lShape': {
      const scale = Math.min(200 / v1, 170 / v2, scaleCap);
      const w = v1 * scale;
      const h = v2 * scale;
      const cutW = v3 > 0 ? v3 * scale : w * 0.4;
      const cutH = h * 0.4;
      return [
        { x: 180 - w / 2, y: 110 - h / 2 },
        { x: 180 + w / 2 - cutW, y: 110 - h / 2 },
        { x: 180 + w / 2 - cutW, y: 110 + h / 2 - cutH },
        { x: 180 + w / 2, y: 110 + h / 2 - cutH },
        { x: 180 + w / 2, y: 110 + h / 2 },
        { x: 180 - w / 2, y: 110 + h / 2 },
      ];
    }
    case 'rectWithHole': {
      const scale = Math.min(200 / v1, 170 / v2, scaleCap);
      const ow = v1 * scale;
      const oh = v2 * scale;
      const iw = (d3 ? v3 : v1 * 0.4) * scale;
      const ih = oh * 0.4;
      return [
        { x: 180 - ow / 2, y: 110 - oh / 2 },
        { x: 180 + ow / 2, y: 110 - oh / 2 },
        { x: 180 + ow / 2, y: 110 + oh / 2 },
        { x: 180 - ow / 2, y: 110 + oh / 2 },
        { x: 180 - iw / 2, y: 110 - ih / 2 },
        { x: 180 + iw / 2, y: 110 - ih / 2 },
        { x: 180 + iw / 2, y: 110 + ih / 2 },
        { x: 180 - iw / 2, y: 110 + ih / 2 },
      ];
    }
  }
}

export function generateAreaAndPerimeter(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  let shape: AreaAndPerimeterShape;
  let d1: Dim;
  let d2: Dim;
  let d3: Dim | undefined;
  let asks: ('area' | 'perim')[];
  let solvable = true;
  const expected: { area?: string; perim?: string } = {};
  let fields: { variablePart: string }[] | undefined;
  let given: { label: string; value: string; unit: string }[];
  let dims: { num: number; den: number; label: string }[];
  let tipLevel: 1 | 2 | 3;
  let promptKey: DictKey;

  const maxVal = clamped <= 1 ? 10 : 20;

  if (clamped <= 3) {
    // Tier L
    tipLevel = 1;
    const availableShapes: AreaAndPerimeterShape[] = ['rect', 'square', 'triangle'];
    if (clamped >= 2) {
      availableShapes.push('parallelogram', 'triangleRight');
    }
    shape = pick(rng, availableShapes);
    const askArea = rng() < 0.5;

    if (shape === 'triangle') {
      // Triangle only asks area (perimeter not computable from g,h alone)
      d1 = randIntDim(rng, 2, maxVal);
      d2 = randIntDim(rng, 2, maxVal);
      const area = triangleArea(d1, d2);
      expected.area = fmtFrac(area.num, area.den);
      asks = ['area'];
      promptKey = 'exercise.areaAndPerimeter.promptArea';
      given = [
        { label: 'g', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
        { label: 'h', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
      ];
      dims = [
        { num: d1.num, den: d1.den, label: 'g' },
        { num: d2.num, den: d2.den, label: 'h' },
      ];
    } else if (shape === 'parallelogram') {
      // Parallelogram only asks area
      d1 = randIntDim(rng, 2, maxVal);
      d2 = randIntDim(rng, 2, maxVal);
      d3 = genSlant(rng, d2);
      const area = mulDim(d1, d2);
      expected.area = fmtFrac(area.num, area.den);
      asks = ['area'];
      promptKey = 'exercise.areaAndPerimeter.promptArea';
      given = [
        { label: 'g', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
        { label: 'h', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
      ];
      dims = [
        { num: d1.num, den: d1.den, label: 'g' },
        { num: d2.num, den: d2.den, label: 'h' },
      ];
    } else if (shape === 'triangleRight') {
      // Right triangle: both area and perim possible
      const triple = pick(rng, rightTriples);
      const scale = randInt(rng, 1, Math.floor(maxVal / Math.max(...triple)));
      const [a, b, c] = triple.map((v) => v * scale);
      d1 = { num: a, den: 1 };
      d2 = { num: b, den: 1 };
      d3 = { num: c, den: 1 };
      if (askArea) {
        const area = triangleArea(d1, d2);
        expected.area = fmtFrac(area.num, area.den);
        asks = ['area'];
        promptKey = 'exercise.areaAndPerimeter.promptArea';
      } else {
        const perim = addDim(addDim(d1, d2), d3);
        expected.perim = fmtFrac(perim.num, perim.den);
        asks = ['perim'];
        promptKey = 'exercise.areaAndPerimeter.promptPerim';
      }
      given = [
        { label: 'a', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
        { label: 'b', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
        { label: 'c', value: fmtFrac(d3.num, d3.den), unit: 'cm' },
      ];
      dims = [
        { num: d1.num, den: d1.den, label: 'a' },
        { num: d2.num, den: d2.den, label: 'b' },
        { num: d3.num, den: d3.den, label: 'c' },
      ];
    } else {
      // rect or square
      if (shape === 'square') {
        const s = randInt(rng, 2, maxVal);
        d1 = { num: s, den: 1 };
        d2 = { num: s, den: 1 };
      } else {
        d1 = randIntDim(rng, 2, maxVal);
        d2 = randIntDim(rng, 2, maxVal);
      }
      if (askArea) {
        const area = mulDim(d1, d2);
        expected.area = fmtFrac(area.num, area.den);
        asks = ['area'];
        promptKey = 'exercise.areaAndPerimeter.promptArea';
      } else {
        const perim = dimDouble(addDim(d1, d2));
        expected.perim = fmtFrac(perim.num, perim.den);
        asks = ['perim'];
        promptKey = 'exercise.areaAndPerimeter.promptPerim';
      }
      const aLabel = shape === 'square' ? 's' : 'a';
      const bLabel = shape === 'square' ? 's' : 'b';
      given = [
        { label: aLabel, value: fmtFrac(d1.num, d1.den), unit: 'cm' },
        { label: bLabel, value: fmtFrac(d2.num, d2.den), unit: 'cm' },
      ];
      dims = [
        { num: d1.num, den: d1.den, label: aLabel },
        { num: d2.num, den: d2.den, label: bLabel },
      ];
    }
  } else if (clamped <= 7) {
    // Tier M
    tipLevel = 2;
    const hasCircle = clamped >= 6;
    const availableShapes: AreaAndPerimeterShape[] = ['rect', 'triangle'];
    if (hasCircle) availableShapes.push('circle');
    shape = pick(rng, availableShapes);

    const mode = rng() < 0.4 ? 'inverted' : 'both';

    if (shape === 'circle') {
      if (mode === 'inverted') {
        // Derive r from A or u
        if (rng() < 0.5) {
          // Given A, find perim
          const r = randInt(rng, 2, 8);
          d1 = { num: r, den: 1 };
          d2 = { num: r, den: 1 };
          const areaCoeff = r * r;
          expected.area = String(areaCoeff);
          asks = ['perim'];
          promptKey = 'exercise.areaAndPerimeter.promptPerim';
          const perimCoeff = 2 * r;
          expected.perim = String(perimCoeff);
          given = [{ label: 'A', value: `${areaCoeff}\\pi`, unit: 'cm^2' }];
          dims = [{ num: d1.num, den: d1.den, label: 'r' }];
        } else {
          // Given u, find area
          const r = randInt(rng, 2, 8);
          d1 = { num: r, den: 1 };
          d2 = { num: r, den: 1 };
          const perimCoeff = 2 * r;
          expected.perim = String(perimCoeff);
          asks = ['area'];
          promptKey = 'exercise.areaAndPerimeter.promptArea';
          const areaCoeff = r * r;
          expected.area = String(areaCoeff);
          given = [{ label: 'U', value: `${perimCoeff}\\pi`, unit: 'cm' }];
          dims = [{ num: d1.num, den: d1.den, label: 'r' }];
        }
      } else {
        // both
        const r = randInt(rng, 2, 8);
        d1 = { num: r, den: 1 };
        d2 = { num: r, den: 1 };
        const areaCoeff = r * r;
        const perimCoeff = 2 * r;
        expected.area = String(areaCoeff);
        expected.perim = String(perimCoeff);
        asks = ['area', 'perim'];
        promptKey = 'exercise.areaAndPerimeter.promptBoth';
        given = [{ label: 'r', value: fmtFrac(d1.num, d1.den), unit: 'cm' }];
        dims = [{ num: d1.num, den: d1.den, label: 'r' }];
        fields = [{ variablePart: '\\pi' }, { variablePart: '\\pi' }];
      }
    } else {
      const allowFrac = clamped >= 4;
      d1 = randDim(rng, 12, allowFrac);
      d2 = randDim(rng, 12, allowFrac);

      if (mode === 'inverted') {
        // Given area/perimeter, find dimension
        if (rng() < 0.5) {
          const area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
          expected.area = fmtFrac(area.num, area.den);
          // Ask perim but need to compute from known dim + area
          if (rng() < 0.5) {
            // Given area, find d1, then compute perim
            const knownDim = d2;
            const derived =
              shape === 'triangle' ? divDim({ num: area.num * 2, den: area.den }, knownDim) : divDim(area, knownDim);
            const perim =
              shape === 'triangle'
                ? addDim(addDim(derived, knownDim), genSlant(rng, knownDim))
                : dimDouble(addDim(derived, knownDim));
            expected.perim = fmtFrac(perim.num, perim.den);
            asks = ['perim'];
            promptKey = 'exercise.areaAndPerimeter.promptPerim';
            given = [
              { label: 'A', value: fmtFrac(area.num, area.den), unit: 'cm^2' },
              { label: shape === 'triangle' ? 'h' : 'b', value: fmtFrac(knownDim.num, knownDim.den), unit: 'cm' },
            ];
            const label = shape === 'triangle' ? 'g' : 'a';
            dims = [
              { num: knownDim.num, den: knownDim.den, label: shape === 'triangle' ? 'h' : 'b' },
              { num: derived.num, den: derived.den, label },
            ];
            d1 = derived;
          } else {
            // Given area, find d2, then compute perim
            const knownDim = d1;
            const derived =
              shape === 'triangle' ? divDim({ num: area.num * 2, den: area.den }, knownDim) : divDim(area, knownDim);
            const perim =
              shape === 'triangle'
                ? addDim(addDim(knownDim, derived), genSlant(rng, derived))
                : dimDouble(addDim(knownDim, derived));
            expected.perim = fmtFrac(perim.num, perim.den);
            asks = ['perim'];
            promptKey = 'exercise.areaAndPerimeter.promptPerim';
            given = [
              { label: 'A', value: fmtFrac(area.num, area.den), unit: 'cm^2' },
              { label: shape === 'triangle' ? 'g' : 'a', value: fmtFrac(knownDim.num, knownDim.den), unit: 'cm' },
            ];
            dims = [
              { num: knownDim.num, den: knownDim.den, label: shape === 'triangle' ? 'g' : 'a' },
              { num: derived.num, den: derived.den, label: shape === 'triangle' ? 'h' : 'b' },
            ];
            d2 = derived;
          }
        } else {
          // Given perim, find area
          const perim = dimDouble(addDim(d1, d2));
          expected.perim = fmtFrac(perim.num, perim.den);
          const area = mulDim(d1, d2);
          expected.area = fmtFrac(area.num, area.den);
          asks = ['area'];
          promptKey = 'exercise.areaAndPerimeter.promptArea';
          given = [
            { label: 'U', value: fmtFrac(perim.num, perim.den), unit: 'cm' },
            { label: 'a', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
          ];
          dims = [
            { num: d1.num, den: d1.den, label: 'a' },
            { num: d2.num, den: d2.den, label: 'b' },
          ];
        }
      } else {
        // both
        const area = shape === 'triangle' ? triangleArea(d1, d2) : mulDim(d1, d2);
        expected.area = fmtFrac(area.num, area.den);
        if (shape === 'triangle') {
          // For triangle "both" we only have g,h - ask area only (no perim possible)
          // Actually for triangle "both" we need all 3 sides for perim. Use right triangle for both.
          // Fallback: just ask area
          asks = ['area'];
          promptKey = 'exercise.areaAndPerimeter.promptArea';
          given = [
            { label: 'g', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
            { label: 'h', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
          ];
          dims = [
            { num: d1.num, den: d1.den, label: 'g' },
            { num: d2.num, den: d2.den, label: 'h' },
          ];
        } else {
          const perim = dimDouble(addDim(d1, d2));
          expected.perim = fmtFrac(perim.num, perim.den);
          asks = ['area', 'perim'];
          promptKey = 'exercise.areaAndPerimeter.promptBoth';
          given = [
            { label: 'a', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
            { label: 'b', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
          ];
          dims = [
            { num: d1.num, den: d1.den, label: 'a' },
            { num: d2.num, den: d2.den, label: 'b' },
          ];
        }
      }
    }
  } else {
    // Tier H (8-10)
    tipLevel = 3;

    if (clamped === 10 && rng() < 0.4) {
      // Distractor
      const distractorShape = pick(rng, ['rect', 'triangle', 'parallelogram', 'circle'] as AreaAndPerimeterShape[]);
      shape = distractorShape;

      if (shape === 'circle') {
        if (rng() < 0.5) {
          // D4: given A, find u (solvable)
          const r = randInt(rng, 2, 8);
          d1 = { num: r, den: 1 };
          d2 = { num: r, den: 1 };
          const areaCoeff = r * r;
          given = [{ label: 'A', value: `${areaCoeff}\\pi`, unit: 'cm^2' }];
          dims = [{ num: r, den: 1, label: 'r' }];
          expected.area = String(areaCoeff);
          expected.perim = String(2 * r);
          asks = ['perim'];
          solvable = true;
          promptKey = 'exercise.areaAndPerimeter.promptPerim';
        } else {
          // D5: given u, find A (solvable)
          const r = randInt(rng, 2, 8);
          d1 = { num: r, den: 1 };
          d2 = { num: r, den: 1 };
          const perimCoeff = 2 * r;
          given = [{ label: 'U', value: `${perimCoeff}\\pi`, unit: 'cm' }];
          dims = [{ num: r, den: 1, label: 'r' }];
          expected.perim = String(perimCoeff);
          expected.area = String(r * r);
          asks = ['area'];
          solvable = true;
          promptKey = 'exercise.areaAndPerimeter.promptArea';
        }
      } else if (shape === 'rect') {
        // D1: given u only, find area (unsolvable)
        const a = randInt(rng, 3, 10);
        const b = randInt(rng, 3, 10);
        d1 = { num: a, den: 1 };
        d2 = { num: b, den: 1 };
        const perim = 2 * (a + b);
        given = [{ label: 'U', value: String(perim), unit: 'cm' }];
        dims = [
          { num: a, den: 1, label: 'a' },
          { num: b, den: 1, label: 'b' },
        ];
        asks = ['area'];
        solvable = false;
        promptKey = 'exercise.areaAndPerimeter.promptArea';
      } else if (shape === 'triangle') {
        // D2: given g,h only, find perim (unsolvable)
        d1 = randIntDim(rng, 3, 10);
        d2 = randIntDim(rng, 3, 10);
        given = [
          { label: 'g', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
          { label: 'h', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
        ];
        dims = [
          { num: d1.num, den: d1.den, label: 'g' },
          { num: d2.num, den: d2.den, label: 'h' },
        ];
        asks = ['perim'];
        solvable = false;
        promptKey = 'exercise.areaAndPerimeter.promptPerim';
      } else {
        // parallelogram, D3: given g,h only, find perim (unsolvable)
        d1 = randIntDim(rng, 3, 10);
        d2 = { num: randInt(rng, 2, 8), den: 1 };
        d3 = genSlant(rng, d2);
        given = [
          { label: 'g', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
          { label: 'h', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
        ];
        dims = [
          { num: d1.num, den: d1.den, label: 'g' },
          { num: d2.num, den: d2.den, label: 'h' },
        ];
        asks = ['perim'];
        solvable = false;
        promptKey = 'exercise.areaAndPerimeter.promptPerim';
      }
    } else if (clamped >= 8) {
      // Composite shapes
      const compositeShapes: AreaAndPerimeterShape[] = ['lShape', 'rectWithHole'];
      shape = pick(rng, compositeShapes);

      if (shape === 'lShape') {
        const outerA = randInt(rng, 5, 12);
        const outerB = randInt(rng, 5, 12);
        const cutA = randInt(rng, 2, outerA - 2);
        const cutB = randInt(rng, 2, outerB - 2);
        d1 = { num: outerA, den: 1 };
        d2 = { num: outerB, den: 1 };
        d3 = { num: cutA, den: 1 };
        const innerArea = mulDim(d1, d2);
        const cutArea = { num: cutA * cutB, den: 1 };
        const area = subDim(innerArea, cutArea);
        const perimNum = 2 * (outerA + outerB) + 2 * (cutA + cutB);
        expected.area = fmtFrac(area.num, area.den);
        expected.perim = fmtFrac(perimNum, 1);
        asks = ['area', 'perim'];
        promptKey = 'exercise.areaAndPerimeter.promptBoth';
        given = [
          { label: 'a', value: String(outerA), unit: 'cm' },
          { label: 'b', value: String(outerB), unit: 'cm' },
        ];
        dims = [
          { num: outerA, den: 1, label: 'a' },
          { num: outerB, den: 1, label: 'b' },
          { num: cutA, den: 1, label: 'a_1' },
          { num: cutB, den: 1, label: 'b_1' },
        ];
      } else {
        // rectWithHole
        const outerA = randInt(rng, 6, 12);
        const outerB = randInt(rng, 6, 12);
        const innerA = randInt(rng, 2, outerA - 3);
        const innerB = randInt(rng, 2, outerB - 3);
        d1 = { num: outerA, den: 1 };
        d2 = { num: outerB, den: 1 };
        d3 = { num: innerA, den: 1 };
        const outerArea = mulDim(d1, d2);
        const innerArea = { num: innerA * innerB, den: 1 };
        const area = subDim(outerArea, innerArea);
        const perimNum = 2 * (outerA + outerB) + 2 * (innerA + innerB);
        expected.area = fmtFrac(area.num, area.den);
        expected.perim = fmtFrac(perimNum, 1);
        asks = ['area', 'perim'];
        promptKey = 'exercise.areaAndPerimeter.promptBoth';
        given = [
          { label: 'A', value: String(outerA), unit: 'cm' },
          { label: 'B', value: String(outerB), unit: 'cm' },
        ];
        dims = [
          { num: outerA, den: 1, label: 'A' },
          { num: outerB, den: 1, label: 'B' },
          { num: innerA, den: 1, label: 'a' },
          { num: innerB, den: 1, label: 'b' },
        ];
      }
    } else {
      // comp 8-9 fallback
      shape = 'rect';
      d1 = randIntDim(rng, 3, 12);
      d2 = randIntDim(rng, 3, 12);
      const area = mulDim(d1, d2);
      const perim = dimDouble(addDim(d1, d2));
      expected.area = fmtFrac(area.num, area.den);
      expected.perim = fmtFrac(perim.num, perim.den);
      asks = ['area', 'perim'];
      promptKey = 'exercise.areaAndPerimeter.promptBoth';
      given = [
        { label: 'a', value: fmtFrac(d1.num, d1.den), unit: 'cm' },
        { label: 'b', value: fmtFrac(d2.num, d2.den), unit: 'cm' },
      ];
      dims = [
        { num: d1.num, den: d1.den, label: 'a' },
        { num: d2.num, den: d2.den, label: 'b' },
      ];
    }
  }

  const vertices = computeVertices(shape, d1, d2, d3);

  let answer: string;
  if (!solvable) {
    answer = 'cannot_compute';
  } else if (asks.length === 1) {
    if (asks[0] === 'area') {
      answer = expected.area!;
    } else {
      answer = expected.perim!;
    }
  } else {
    answer = `${expected.area!}|${expected.perim!}`;
  }

  const data: AreaAndPerimeterData = {
    shape,
    given,
    asks,
    solvable,
    unitArea: 'cm^2',
    unitPerim: 'cm',
    dims,
    expected,
    fields,
    tipLevel,
    vertices,
    promptKey,
  };

  return { prompt: '', answer, data };
}

export function validateAreaAndPerimeter(answer: string, exercise: Exercise): boolean {
  if (exercise.answer === 'cannot_compute') {
    return answer.trim() === 'cannot_compute';
  }
  if (exercise.answer.includes('|')) {
    const userParts = answer.split('|').map((s) => s.trim());
    const correctParts = exercise.answer.split('|').map((s) => s.trim());
    if (userParts.length !== correctParts.length) return false;
    for (let i = 0; i < userParts.length; i++) {
      if (!fracEqual(userParts[i], correctParts[i])) return false;
    }
    return true;
  }
  const trimmed = answer.trim();
  if (trimmed.includes('.')) return false;
  if ((trimmed.match(/,/g) || []).length > 1) return false;
  const normAnswer = trimmed.replace(',', '/');
  const normCorrect = exercise.answer.replace(',', '/');
  return fracEqual(normAnswer, normCorrect);
}
