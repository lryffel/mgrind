import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';

export interface InteriorAnglesAngle {
  value: number;
  isMissing: boolean;
  vertexX: number;
  vertexY: number;
}

export interface InteriorAnglesData {
  sides: number;
  angles: InteriorAnglesAngle[];
}

function generateVertices(rng: () => number, sides: number): { x: number; y: number }[] {
  const cx = 150;
  const cy = 140;
  const rx = 95;
  const ry = 75;
  const verts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const baseAngle = (2 * Math.PI * i) / sides - Math.PI / 2;
    const jitter = (rng() - 0.5) * 0.3;
    const r = 0.8 + rng() * 0.4;
    verts.push({
      x: cx + rx * r * Math.cos(baseAngle + jitter),
      y: cy + ry * r * Math.sin(baseAngle + jitter),
    });
  }
  return verts;
}

function interiorAngleDeg(
  prev: { x: number; y: number },
  curr: { x: number; y: number },
  next: { x: number; y: number },
): number {
  const dx1 = prev.x - curr.x;
  const dy1 = prev.y - curr.y;
  const dx2 = next.x - curr.x;
  const dy2 = next.y - curr.y;
  const dot = dx1 * dx2 + dy1 * dy2;
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const cosAngle = Math.max(-1, Math.min(1, dot / (len1 * len2)));
  const acosDeg = Math.acos(cosAngle) * (180 / Math.PI);

  const cross = dx1 * dy2 - dy1 * dx2;
  if (cross > 0) return 360 - acosDeg;
  return acosDeg;
}

export function generateInteriorAngles(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  const sides = clamped <= 2 ? 3 : clamped <= 5 ? 4 : 5;
  const total = (sides - 2) * 180;

  const vertices = generateVertices(rng, sides);

  const rawAngles = (() => {
    if (rng() < 0.5) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const verts = vertices.map((v) => ({ ...v }));
        const concaveIdx = Math.floor(rng() * sides);
        const prev = verts[(concaveIdx - 1 + sides) % sides];
        const next = verts[(concaveIdx + 1) % sides];
        const midX = (prev.x + next.x) / 2;
        const midY = (prev.y + next.y) / 2;
        const dx = midX - verts[concaveIdx].x;
        const dy = midY - verts[concaveIdx].y;
        const overshoot = 0.15 + rng() * 0.25;
        verts[concaveIdx].x = midX + dx * overshoot;
        verts[concaveIdx].y = midY + dy * overshoot;

        const angles = verts.map((_, i) => {
          const p = verts[(i - 1 + sides) % sides];
          const c = verts[i];
          const n = verts[(i + 1) % sides];
          return interiorAngleDeg(p, c, n);
        });

        const sum = angles.reduce((s, a) => s + a, 0);
        if (Math.abs(sum - total) < 0.5) {
          vertices.length = 0;
          vertices.push(...verts);
          return angles;
        }
      }
    }
    return vertices.map((_, i) => {
      const p = vertices[(i - 1 + sides) % sides];
      const c = vertices[i];
      const n = vertices[(i + 1) % sides];
      return interiorAngleDeg(p, c, n);
    });
  })();

  const missingIndex = Math.floor(rng() * sides);

  const givenRounded: number[] = [];
  let sumRounded = 0;
  for (let i = 0; i < sides; i++) {
    if (i === missingIndex) continue;
    const r = Math.round(rawAngles[i] / 5) * 5;
    givenRounded.push(r);
    sumRounded += r;
  }

  let missingAngle = total - sumRounded;

  for (let i = 0; i < 80 && (missingAngle < 30 || missingAngle > 350); i++) {
    if (missingAngle < 30) {
      const maxVal = Math.max(...givenRounded);
      if (maxVal <= 35) break;
      const maxIdx = givenRounded.indexOf(maxVal);
      givenRounded[maxIdx] -= 5;
      sumRounded -= 5;
      missingAngle = total - sumRounded;
    } else {
      const minVal = Math.min(...givenRounded);
      if (minVal >= 345) break;
      const minIdx = givenRounded.indexOf(minVal);
      givenRounded[minIdx] += 5;
      sumRounded += 5;
      missingAngle = total - sumRounded;
    }
  }

  const angleObjects: InteriorAnglesAngle[] = [];
  let givenIdx = 0;
  for (let i = 0; i < sides; i++) {
    if (i === missingIndex) {
      angleObjects.push({
        value: missingAngle,
        isMissing: true,
        vertexX: vertices[i].x,
        vertexY: vertices[i].y,
      });
    } else {
      angleObjects.push({
        value: givenRounded[givenIdx],
        isMissing: false,
        vertexX: vertices[i].x,
        vertexY: vertices[i].y,
      });
      givenIdx++;
    }
  }

  return {
    prompt: '',
    answer: String(missingAngle),
    data: { sides, angles: angleObjects },
  };
}
