import { describe, it, expect } from 'vitest';
import { generateInteriorAngles } from './interiorAngles';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';
import type { InteriorAnglesData } from './interiorAngles';

describe('interiorAngles', () => {
  it('generates deterministic output', () => {
    expectDeterministic(generateInteriorAngles, 42, 0);
  });

  it('generates different output for different seeds', () => {
    expectSeedVariation(generateInteriorAngles, 0);
  });

  it('has prompt and answer', () => {
    expectHasPromptAndAnswer(generateInteriorAngles, 42, 0);
  });

  it('angles sum to (n-2)*180 for triangle', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateInteriorAngles(seed, 1);
      const data = ex.data as InteriorAnglesData;
      expect(data.sides).toBe(3);
      const sum = data.angles.reduce((s, a) => s + a.value, 0);
      expect(sum).toBe(180);
    }
  });

  it('angles sum to (n-2)*180 for quadrilateral', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateInteriorAngles(seed, 4);
      const data = ex.data as InteriorAnglesData;
      expect(data.sides).toBe(4);
      const sum = data.angles.reduce((s, a) => s + a.value, 0);
      expect(sum).toBe(360);
    }
  });

  it('angles sum to (n-2)*180 for pentagon', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateInteriorAngles(seed, 8);
      const data = ex.data as InteriorAnglesData;
      expect(data.sides).toBe(5);
      const sum = data.angles.reduce((s, a) => s + a.value, 0);
      expect(sum).toBe(540);
    }
  });

  it('given angles are multiples of 5', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        for (const a of data.angles) {
          if (!a.isMissing) {
            expect(a.value % 5).toBe(0);
          }
        }
      }
    }
  });

  it('missing angle is also a multiple of 5', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        const missing = data.angles.find((a) => a.isMissing)!;
        expect(missing.value % 5 === 0).toBe(true);
      }
    }
  });

  it('all angles are positive and within plausible bounds', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        for (const a of data.angles) {
          expect(a.value).toBeGreaterThan(0);
          expect(a.value).toBeLessThan(360);
        }
      }
    }
  });

  it('exactly one angle is missing', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateInteriorAngles(seed, 5);
      const data = ex.data as InteriorAnglesData;
      const missing = data.angles.filter((a) => a.isMissing);
      expect(missing).toHaveLength(1);
    }
  });

  it('answer matches the missing angle', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ex = generateInteriorAngles(seed, 5);
      const data = ex.data as InteriorAnglesData;
      const missing = data.angles.find((a) => a.isMissing)!;
      expect(ex.answer).toBe(String(missing.value));
    }
  });

  it('stores vertex positions within SVG bounds', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        for (const a of data.angles) {
          expect(a.vertexX).toBeGreaterThanOrEqual(0);
          expect(a.vertexX).toBeLessThanOrEqual(300);
          expect(a.vertexY).toBeGreaterThanOrEqual(0);
          expect(a.vertexY).toBeLessThanOrEqual(280);
        }
      }
    }
  });

  function isConvex(vertices: { x: number; y: number }[]): boolean {
    const n = vertices.length;
    if (n < 3) return false;
    let sign: number | null = null;
    for (let i = 0; i < n; i++) {
      const p0 = vertices[i];
      const p1 = vertices[(i + 1) % n];
      const p2 = vertices[(i + 2) % n];
      const cross = (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x);
      if (cross !== 0) {
        const s = Math.sign(cross);
        if (sign === null) sign = s;
        else if (s !== sign) return false;
      }
    }
    return true;
  }

  it('at least some polygons are non-convex', () => {
    let nonConvexCount = 0;
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        const verts = data.angles.map((a) => ({ x: a.vertexX, y: a.vertexY }));
        if (!isConvex(verts)) nonConvexCount++;
      }
    }
    expect(nonConvexCount).toBeGreaterThan(0);
  });

  it('correctly maps sides from complexity', () => {
    for (let seed = 0; seed < 10; seed++) {
      const getData = (comp: number) => generateInteriorAngles(seed, comp).data as InteriorAnglesData;
      expect(getData(0).sides).toBe(3);
      expect(getData(1).sides).toBe(3);
      expect(getData(2).sides).toBe(3);
      expect(getData(3).sides).toBe(4);
      expect(getData(4).sides).toBe(4);
      expect(getData(5).sides).toBe(4);
      expect(getData(6).sides).toBe(5);
      expect(getData(7).sides).toBe(5);
      expect(getData(8).sides).toBe(5);
      expect(getData(9).sides).toBe(5);
      expect(getData(10).sides).toBe(5);
    }
  });
});
