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

  function labelPosOld(vx: number, vy: number) {
    const cx = 150;
    const cy = 140;
    const dir = Math.atan2(vy - cy, vx - cx);
    return { x: vx + 22 * Math.cos(dir), y: vy + 22 * Math.sin(dir) };
  }

  function labelPosNew(curr: InteriorAnglesAngle, prev: InteriorAnglesAngle, next: InteriorAnglesAngle) {
    const cx = 150;
    const cy = 140;
    const dx1 = prev.vertexX - curr.vertexX;
    const dy1 = prev.vertexY - curr.vertexY;
    const dx2 = next.vertexX - curr.vertexX;
    const dy2 = next.vertexY - curr.vertexY;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const ux1 = dx1 / len1;
    const uy1 = dy1 / len1;
    const ux2 = dx2 / len2;
    const uy2 = dy2 / len2;

    let bx = ux1 + ux2;
    let by = uy1 + uy2;
    const blen = Math.sqrt(bx * bx + by * by);

    if (blen < 1e-10) {
      const dir = Math.atan2(curr.vertexY - cy, curr.vertexX - cx);
      return { x: curr.vertexX + 22 * Math.cos(dir), y: curr.vertexY + 22 * Math.sin(dir) };
    }

    bx /= blen;
    by /= blen;

    const cross = dx1 * dy2 - dy1 * dx2;
    const dirX = cross < 0 ? bx : -bx;
    const dirY = cross < 0 ? by : -by;

    return { x: curr.vertexX + 22 * dirX, y: curr.vertexY + 22 * dirY };
  }

  function pointInPolygon(px: number, py: number, vertices: { x: number; y: number }[]): boolean {
    let inside = false;
    const n = vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  it('non-convex polygon labels are outside the polygon', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        const verts = data.angles.map((a) => ({ x: a.vertexX, y: a.vertexY }));
        if (!isConvex(verts)) {
          for (let i = 0; i < data.sides; i++) {
            const angle = data.angles[i];
            const prev = data.angles[(i - 1 + data.sides) % data.sides];
            const next = data.angles[(i + 1) % data.sides];
            const lp = labelPosNew(angle, prev, next);
            expect(pointInPolygon(lp.x, lp.y, verts)).toBe(false);
          }
        }
      }
    }
  });

  it('convex polygon labels are within 5px of old positions', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        const verts = data.angles.map((a) => ({ x: a.vertexX, y: a.vertexY }));
        if (isConvex(verts)) {
          for (let i = 0; i < data.sides; i++) {
            const angle = data.angles[i];
            const prev = data.angles[(i - 1 + data.sides) % data.sides];
            const next = data.angles[(i + 1) % data.sides];
            const oldPos = labelPosOld(angle.vertexX, angle.vertexY);
            const newPos = labelPosNew(angle, prev, next);
            const dist = Math.hypot(oldPos.x - newPos.x, oldPos.y - newPos.y);
            expect(dist).toBeLessThan(5);
          }
        }
      }
    }
  });

  it('reflex vertex label is on the exterior side', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let comp = 0; comp <= 10; comp++) {
        const ex = generateInteriorAngles(seed, comp);
        const data = ex.data as InteriorAnglesData;
        const verts = data.angles.map((a) => ({ x: a.vertexX, y: a.vertexY }));
        if (!isConvex(verts)) {
          for (let i = 0; i < data.sides; i++) {
            const angle = data.angles[i];
            const prev = data.angles[(i - 1 + data.sides) % data.sides];
            const next = data.angles[(i + 1) % data.sides];
            const dx1 = prev.vertexX - angle.vertexX;
            const dy1 = prev.vertexY - angle.vertexY;
            const dx2 = next.vertexX - angle.vertexX;
            const dy2 = next.vertexY - angle.vertexY;
            const cross = dx1 * dy2 - dy1 * dx2;
            if (cross > 0) {
              const lp = labelPosNew(angle, prev, next);
              expect(pointInPolygon(lp.x, lp.y, verts)).toBe(false);
            }
          }
        }
      }
    }
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
