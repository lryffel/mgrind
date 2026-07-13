import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';
import { formatExpandedTerm, varMapLatex, varMapText } from '../math/varmap';
import type { VarMap } from '../math/varmap';
import { expandProduct, collectTerms, type Term } from './termAlgebra';

interface ExprPart {
  factors: Term[][];
  op: '+' | '-';
}

const SINGLE_VARS: string[][] = [['x'], ['a'], ['n'], ['t'], ['m'], ['p']];
const VAR_PAIRS: [string, string][] = [
  ['a', 'b'],
  ['x', 'y'],
  ['m', 'n'],
  ['p', 'q'],
  ['u', 'v'],
];

function termsEqual(a: Term[], b: Term[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].coeff !== b[i].coeff) return false;
    if (varMapText(a[i].vars) !== varMapText(b[i].vars)) return false;
  }
  return true;
}

function formatSum(terms: Term[]): string {
  const parts: string[] = [];
  for (let i = 0; i < terms.length; i++) {
    parts.push(formatExpandedTerm(terms[i].coeff, terms[i].vars, i === 0));
  }
  return parts.join('');
}

function formatProduct(factors: Term[][]): string {
  if (factors.length === 2 && termsEqual(factors[0], factors[1])) {
    if (factors[0].length === 1) {
      return formatExpandedTerm(factors[0][0].coeff, factors[0][0].vars, true) + '^{2}';
    }
    return `(${formatSum(factors[0])})^{2}`;
  }
  return factors.map((f) => (f.length === 1 ? formatSum(f) : `(${formatSum(f)})`)).join('');
}

function normalizeSign(part: ExprPart): ExprPart {
  const firstTerm = part.factors[0][0];
  if (firstTerm.coeff < 0) {
    const newFactors = part.factors.map((factor) => factor.map((t) => ({ coeff: -t.coeff, vars: t.vars })));
    const newOp = part.op === '+' ? '-' : '+';
    return { factors: newFactors, op: newOp };
  }
  return part;
}

function distinctVarPart(used: Set<string>, v: string, maxDegree: number, rng: () => number): VarMap {
  let d = randInt(rng, 0, maxDegree);
  let key = d === 0 ? '' : `${v}${d}`;
  let attempts = 0;
  while (used.has(key) && attempts < 30) {
    d = randInt(rng, 0, maxDegree);
    key = d === 0 ? '' : `${v}${d}`;
    attempts++;
  }
  used.add(key);
  return d === 0 ? {} : { [v]: d };
}

function genMonoBinoSingle(rng: () => number): ExprPart[] {
  const v = pick(rng, SINGLE_VARS)[0];

  const a = randInt(rng, 1, 5);
  const b = randInt(rng, 1, 5);
  const c = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const part1: ExprPart = {
    factors: [
      [{ coeff: a, vars: { [v]: 1 } }],
      [
        { coeff: b, vars: { [v]: 1 } },
        { coeff: c, vars: {} },
      ],
    ],
    op: '+',
  };

  const d = randInt(rng, 1, 5);
  const e = randInt(rng, 1, 5);
  const f = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const part2: ExprPart = {
    factors: [
      [{ coeff: d, vars: { [v]: 1 } }],
      [
        { coeff: e, vars: { [v]: 1 } },
        { coeff: f, vars: {} },
      ],
    ],
    op: rng() > 0.5 ? '+' : '-',
  };

  return [part1, part2];
}

function genMonoBinoPair(rng: () => number): ExprPart[] {
  const [v1, v2] = pick(rng, VAR_PAIRS);

  const a = randInt(rng, 1, 3);
  const b = randInt(rng, 1, 5);
  const c = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const part1: ExprPart = {
    factors: [
      [{ coeff: a, vars: { [v1]: 1 } }],
      [
        { coeff: b, vars: { [v1]: 1 } },
        { coeff: c, vars: { [v2]: 1 } },
      ],
    ],
    op: '+',
  };

  const d = randInt(rng, 1, 3);
  const e = randInt(rng, 1, 5);
  const f = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const part2: ExprPart = {
    factors: [
      [{ coeff: d, vars: { [v2]: 1 } }],
      [
        { coeff: e, vars: { [v2]: 1 } },
        { coeff: f, vars: { [v1]: 1 } },
      ],
    ],
    op: rng() > 0.5 ? '+' : '-',
  };

  return [part1, part2];
}

function binomWithConst(v: string, rng: () => number): Term[] {
  const a = randInt(rng, 1, 5);
  const b = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  return [
    { coeff: a, vars: { [v]: 1 } },
    { coeff: b, vars: {} },
  ];
}

function genSquareSquareSingle(rng: () => number): ExprPart[] {
  const v = pick(rng, SINGLE_VARS)[0];
  const binom1 = binomWithConst(v, rng);
  const binom2 = binomWithConst(v, rng);
  if (termsEqual(binom1, binom2)) {
    binom2[0].coeff = binom1[0].coeff + 1;
  }

  return [
    { factors: [binom1, binom1], op: '+' },
    { factors: [binom2, binom2], op: rng() > 0.5 ? '+' : '-' },
  ];
}

function genSquareSquarePair(rng: () => number): ExprPart[] {
  const [v1, v2] = pick(rng, VAR_PAIRS);

  const a = randInt(rng, 1, 5);
  const b = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const binom1: Term[] = [
    { coeff: a, vars: { [v1]: 1 } },
    { coeff: b, vars: { [v2]: 1 } },
  ];

  const c = randInt(rng, 1, 5);
  const d = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const binom2: Term[] = [
    {
      coeff: termsEqual(binom1, [
        { coeff: c, vars: { [v1]: 1 } },
        { coeff: d, vars: { [v2]: 1 } },
      ])
        ? c + 1
        : c,
      vars: { [v1]: 1 },
    },
    { coeff: d, vars: { [v2]: 1 } },
  ];

  return [
    { factors: [binom1, binom1], op: '+' },
    { factors: [binom2, binom2], op: rng() > 0.5 ? '+' : '-' },
  ];
}

function genHigherDegree(rng: () => number, maxDegree: number): ExprPart[] {
  const v = pick(rng, SINGLE_VARS)[0];

  const d1 = randInt(rng, 1, maxDegree);
  const mono1C = randInt(rng, 1, 3);
  const mono1: Term = { coeff: mono1C, vars: { [v]: d1 } };

  const used1 = new Set<string>();
  const bino1: Term[] = [];
  for (let i = 0; i < 2; i++) {
    const vars = distinctVarPart(used1, v, maxDegree, rng);
    const c = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
    bino1.push({ coeff: c, vars });
  }

  const d2 = randInt(rng, 1, maxDegree);
  const mono2C = randInt(rng, 1, 3);
  const mono2: Term = { coeff: mono2C, vars: { [v]: d2 } };

  const used2 = new Set<string>();
  const bino2: Term[] = [];
  for (let i = 0; i < 2; i++) {
    const vars = distinctVarPart(used2, v, maxDegree, rng);
    const c = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
    bino2.push({ coeff: c, vars });
  }

  return [
    { factors: [[mono1], bino1], op: '+' },
    { factors: [[mono2], bino2], op: rng() > 0.5 ? '+' : '-' },
  ];
}

function genMixedHigh(rng: () => number, maxDegree: number): ExprPart[] {
  const v = pick(rng, SINGLE_VARS)[0];

  const parts: ExprPart[] = [];
  const nParts = rng() > 0.5 ? 2 : 3;

  for (let p = 0; p < nParts; p++) {
    const monoD = randInt(rng, 1, maxDegree);
    const monoC = randInt(rng, 1, 3);
    const mono: Term = { coeff: monoC, vars: { [v]: monoD } };

    const bino: Term[] = [];
    const used = new Set<string>();
    for (let i = 0; i < 2; i++) {
      const vars = distinctVarPart(used, v, maxDegree, rng);
      const c = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
      bino.push({ coeff: c, vars });
    }

    parts.push({
      factors: [[mono], bino],
      op: p === 0 ? '+' : rng() > 0.5 ? '+' : '-',
    });
  }

  return parts;
}

function buildResult(parts: ExprPart[]): Exercise {
  const normalized = parts.map(normalizeSign);

  const allTerms: Term[] = [];
  for (const part of normalized) {
    const expanded = expandProduct(part.factors);
    const sign = part.op === '+' ? 1 : -1;
    for (const t of expanded) {
      allTerms.push({ coeff: t.coeff * sign, vars: t.vars });
    }
  }

  const collected = collectTerms(allTerms);

  const fields: { variablePart: string }[] = collected.map((t) => ({
    variablePart: varMapLatex(t.vars),
  }));
  const answer = collected.map((t) => String(t.coeff)).join(',');

  const displayParts: string[] = [];
  for (let i = 0; i < normalized.length; i++) {
    const display = formatProduct(normalized[i].factors);
    if (i === 0) {
      displayParts.push(display);
    } else {
      displayParts.push(` ${normalized[i].op} ${display}`);
    }
  }
  const prompt = displayParts.join('');

  return { prompt, answer, data: { fields, promptKey: 'exercise.expandAndCollect.prompt' } };
}

export function generateExpandAndCollect(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  for (let attempt = 0; attempt < 50; attempt++) {
    const localRng = mulberry32(seed + attempt * 31 + clamped * 17);

    const params =
      clamped <= 2
        ? ({ type: 'monoBinoSingle' } as const)
        : clamped <= 4
          ? { type: pick(localRng, ['monoBinoSingle', 'monoBinoPair'] as const) }
          : clamped <= 7
            ? { type: pick(localRng, ['monoBinoPair', 'squareSingle', 'squarePair'] as const) }
            : clamped <= 9
              ? { type: pick(localRng, ['monoBinoPair', 'squareSingle', 'higher2'] as const) }
              : { type: pick(localRng, ['higher2', 'higher3', 'mixed2', 'mixed3'] as const) };

    let parts: ExprPart[];
    switch (params.type) {
      case 'monoBinoSingle':
        parts = genMonoBinoSingle(localRng);
        break;
      case 'monoBinoPair':
        parts = genMonoBinoPair(localRng);
        break;
      case 'squareSingle':
        parts = genSquareSquareSingle(localRng);
        break;
      case 'squarePair':
        parts = genSquareSquarePair(localRng);
        break;
      case 'higher2':
        parts = genHigherDegree(localRng, 2);
        break;
      case 'higher3':
        parts = genHigherDegree(localRng, 3);
        break;
      case 'mixed2':
        parts = genMixedHigh(localRng, 2);
        break;
      case 'mixed3':
        parts = genMixedHigh(localRng, 3);
        break;
    }

    const ex = buildResult(parts);
    const fields = ex.data?.fields ?? [];
    if (fields.length >= 2) return ex;
  }

  const v = pick(rng, SINGLE_VARS)[0];
  return {
    prompt: `${v}(${v}+1) + 2${v}(${v}-1)`,
    answer: '3,-1',
    data: {
      fields: [{ variablePart: `${v}^{2}` }, { variablePart: v }],
      promptKey: 'exercise.expandAndCollect.prompt',
    },
  };
}

export { validateMultiField as validateExpandAndCollect } from '../validation';
