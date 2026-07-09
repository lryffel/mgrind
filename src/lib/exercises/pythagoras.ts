import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { gcd } from '../math/number';
import { reduceFrac, fracEqual } from '../math/fraction';
import { pick } from '../math/rng';

interface Vertex {
  x: number;
  y: number;
}

export function validatePythagoras(answer: string, exercise: Exercise): boolean {
  if (exercise.answer === 'cannot_compute') {
    return answer.trim() === 'cannot_compute';
  }
  return fracEqual(answer, exercise.answer);
}

function fracLatex(num: number, den: number): string {
  const [n, d] = reduceFrac(num, den);
  if (d === 1) return String(n);
  return `\\frac{${n}}{${d}}`;
}

function fracStr(num: number, den: number): string {
  const [n, d] = reduceFrac(num, den);
  return d === 1 ? String(n) : `${n}/${d}`;
}

function toNum(num: number, den: number): number {
  const [n, d] = reduceFrac(num, den);
  return n / d;
}

function computeVertices(abLen: number, acLen: number, bcLen: number): Vertex[] {
  const viewSize = 250;
  const margin = 40;

  const v2: Vertex = { x: 0, y: 0 };
  const v1: Vertex = { x: bcLen, y: 0 };

  const cosC = (acLen * acLen + bcLen * bcLen - abLen * abLen) / (2 * acLen * bcLen);
  const angleC = Math.acos(Math.max(-1, Math.min(1, cosC)));
  const v0: Vertex = { x: acLen * Math.cos(angleC), y: acLen * Math.sin(angleC) };

  const verts = [v0, v1, v2];
  const xs = verts.map((v) => v.x);
  const ys = verts.map((v) => v.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const dim = Math.max(maxX - minX, maxY - minY);
  const scale = dim > 0.001 ? (viewSize - 2 * margin) / dim : 1;

  return verts.map((v) => ({
    x: (v.x - minX) * scale + margin,
    y: (maxY - v.y) * scale + margin,
  }));
}

const rightTriples: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
];

const nonRightTriples: [number, number, number][] = [
  [2, 3, 4],
  [2, 4, 5],
  [3, 3, 4],
  [3, 3, 5],
  [2, 3, 3],
];

export function generatePythagoras(seed: number, complexity: number): Exercise {
  const clamped = Math.min(Math.max(complexity, 0), 9);
  const rng = mulberry32(seed);

  const scales: [number, number][] = [[1, 1]];
  if (clamped >= 1) scales.push([1, 2]);
  if (clamped >= 2) scales.push([1, 3]);
  if (clamped >= 3) scales.push([2, 3]);
  if (clamped >= 4) scales.push([1, 4], [3, 4]);
  if (clamped >= 5) scales.push([2, 5], [3, 5], [4, 5]);

  const [kNum, kDen] = pick(rng, scales);
  const g = gcd(kNum, kDen);
  const kn = kNum / g;
  const kd = kDen / g;

  const nonRightProb = clamped >= 6 ? Math.min(0.12 + 0.07 * (clamped - 6), 0.4) : 0;
  const isNonRight = rng() < nonRightProb;

  const swapLegs = rng() < 0.5;
  const swapAxes = rng() < 0.5;

  const compatibleTriples = rightTriples.filter(
    ([, , c]) => (c * kn) / kd <= 5,
  );
  const baseTriple = pick(rng, compatibleTriples.length > 0 ? compatibleTriples : [[3, 4, 5]]);

  const missingIdx = Math.floor(rng() * 3);
  const missing = ['AB', 'AC', 'BC'][missingIdx];

  let abNum: number, abDen: number, acNum: number, acDen: number;
  let bcNum: number, bcDen: number;
  let actualAB: number, actualAC: number, actualBC: number;
  let answerStr: string;
  let answerLatex: string;

  if (isNonRight) {
    const [nra, nrb, nrc] = pick(rng, nonRightTriples);
    const sc = kn / kd;

    actualAB = nra * sc;
    actualAC = nrb * sc;
    actualBC = nrc * sc;

    [abNum, abDen] = reduceFrac(nra * kn, kd);
    [acNum, acDen] = reduceFrac(nrb * kn, kd);
    [bcNum, bcDen] = reduceFrac(nrc * kn, kd);

    answerStr = 'cannot_compute';
    answerLatex = '\\text{---}';
  } else {
    const [a, b, c] = baseTriple;
    const leg1Num = (swapLegs ? b : a) * kn;
    const leg1Den = kd;
    const leg2Num = (swapLegs ? a : b) * kn;
    const leg2Den = kd;
    const hypNum = c * kn;
    const hypDen = kd;

    const [l1n, l1d] = reduceFrac(leg1Num, leg1Den);
    const [l2n, l2d] = reduceFrac(leg2Num, leg2Den);
    const [hn, hd] = reduceFrac(hypNum, hypDen);

    abNum = swapAxes ? l2n : l1n;
    abDen = swapAxes ? l2d : l1d;
    acNum = swapAxes ? l1n : l2n;
    acDen = swapAxes ? l1d : l2d;
    bcNum = hn;
    bcDen = hd;

    actualAB = toNum(abNum, abDen);
    actualAC = toNum(acNum, acDen);
    actualBC = toNum(bcNum, bcDen);

    let ansNum: number, ansDen: number;
    if (missing === 'AB') {
      [ansNum, ansDen] = reduceFrac(abNum, abDen);
    } else if (missing === 'AC') {
      [ansNum, ansDen] = reduceFrac(acNum, acDen);
    } else {
      [ansNum, ansDen] = reduceFrac(bcNum, bcDen);
    }
    answerStr = fracStr(ansNum, ansDen);
    answerLatex = fracLatex(ansNum, ansDen);
  }

  const vertices = computeVertices(actualAB, actualAC, actualBC);

  return {
    prompt: '',
    answer: answerStr,
    data: {
      isRight: !isNonRight,
      triangleVertices: vertices,
      rightAngleVertex: !isNonRight ? 0 : null,
      sideANum: abNum,
      sideADen: abDen,
      sideBNum: acNum,
      sideBDen: acDen,
      sideCNum: bcNum,
      sideCDen: bcDen,
      missingSide: missing,
      answerLatex,
      promptKey: 'exercise.pythagoras.prompt',
    },
  };
}
