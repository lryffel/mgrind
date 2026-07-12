import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';
import { formatExpandedTerm } from '../math/varmap';
import { reduceFrac } from '../math/fraction';

const VAR_PAIRS: [string, string][] = [
  ['a', 'b'],
  ['x', 'y'],
  ['p', 'q'],
  ['m', 'n'],
  ['u', 'v'],
  ['r', 's'],
];

const SINGLE_VARS = ['x', 'y', 'a', 'b', 'm', 'n', 'p', 'q', 's', 't', 'u', 'v'];

interface TermDesc {
  coeff: number;
  vars: Record<string, number>;
}

function formatPoly(terms: TermDesc[]): string {
  return terms
    .filter((t) => t.coeff !== 0)
    .map((t, i) => formatExpandedTerm(t.coeff, t.vars, i === 0))
    .join('');
}

function formatMonomial(coeff: number, varLatex: string): string {
  if (coeff === 0) return '0';
  if (coeff === 1) return varLatex || '1';
  if (coeff === -1) return varLatex ? `-${varLatex}` : '-1';
  return `${coeff}${varLatex}`;
}

function reducedFraction(num: number, den: number): string {
  const [rNum, rDen] = reduceFrac(num, den);
  return rDen === 1 ? String(rNum) : `${rNum}/${rDen}`;
}

/**
 * Pick c1, c2 with a common factor k constructively:
 * pick coprime rNum, rDen ∈ [2, 7], then k ∈ [2, 4], set c1 = k·rNum, c2 = k·rDen.
 */
function pickFactorPair(rng: () => number): [number, number] {
  const k = randInt(rng, 2, 4);
  const rNum = randInt(rng, 2, 7);
  let rDen = randInt(rng, 2, 7);
  let attempts = 0;
  while (rNum === rDen && attempts < 20) {
    rDen = randInt(rng, 2, 7);
    attempts++;
  }
  return [k * rNum, k * rDen];
}

function genConstantSign(rng: () => number): Exercise {
  const c = randInt(rng, 1, 5);
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const reciprocal = rng() < 0.3;

  let numTerms: TermDesc[];
  let denTerms: TermDesc[];

  if (reciprocal) {
    numTerms = [
      { coeff: 1, vars: { [v1]: 1 } },
      { coeff: -1, vars: { [v2]: 1 } },
    ];
    denTerms = [
      { coeff: c, vars: { [v2]: 1 } },
      { coeff: -c, vars: { [v1]: 1 } },
    ];
  } else {
    numTerms = [
      { coeff: c, vars: { [v1]: 1 } },
      { coeff: -c, vars: { [v2]: 1 } },
    ];
    denTerms = [
      { coeff: 1, vars: { [v2]: 1 } },
      { coeff: -1, vars: { [v1]: 1 } },
    ];
  }

  const resultCoeff = reciprocal ? reduceFrac(1, c) : [-c, 1];
  const answer = resultCoeff[1] === 1 ? String(resultCoeff[0]) : `${resultCoeff[0]}/${resultCoeff[1]}`;

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
    answer,
    data: {
      fields: [{ variablePart: '' }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genFactorConstant(rng: () => number): Exercise {
  const v = pick(rng, SINGLE_VARS);
  const p = randInt(rng, 1, 2);
  const [c1, c2] = pickFactorPair(rng);

  const vLatex = p === 1 ? v : `${v}^{${p}}`;

  return {
    prompt: `\\frac{${formatMonomial(c1, vLatex)}}{${formatMonomial(c2, vLatex)}}`,
    answer: reducedFraction(c1, c2),
    data: {
      fields: [{ variablePart: '' }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genFactorMonomial(rng: () => number): Exercise {
  const v = pick(rng, SINGLE_VARS);
  const denPower = 1;
  const numPower = randInt(rng, 2, 4);
  const [c1, c2] = pickFactorPair(rng);

  const numVLatex = numPower === 1 ? v : `${v}^{${numPower}}`;
  const denVLatex = denPower === 1 ? v : `${v}^{${denPower}}`;
  const resultPower = numPower - denPower;
  const resultVLatex = resultPower === 1 ? v : `${v}^{${resultPower}}`;

  return {
    prompt: `\\frac{${formatMonomial(c1, numVLatex)}}{${formatMonomial(c2, denVLatex)}}`,
    answer: reducedFraction(c1, c2),
    data: {
      fields: [{ variablePart: resultVLatex }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genBinomialThird(rng: () => number): Exercise {
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const subType = rng() < 0.5 ? 'diffMinus' : 'diffPlus';

  const numTerms: TermDesc[] = [
    { coeff: 1, vars: { [v1]: 2 } },
    { coeff: -1, vars: { [v2]: 2 } },
  ];

  if (subType === 'diffMinus') {
    return {
      prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(-1, { [v2]: 1 }, false)}}`,
      answer: '1,1',
      data: {
        fields: [{ variablePart: v1 }, { variablePart: v2 }],
        promptKey: 'exercise.simplifySymbolicFraction.prompt',
      },
    };
  }

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(1, { [v2]: 1 }, false)}}`,
    answer: '1,-1',
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genBinomialSquare(rng: () => number): Exercise {
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const useDiff = rng() < 0.5;

  const numTerms: TermDesc[] = [
    { coeff: 1, vars: { [v1]: 2 } },
    { coeff: useDiff ? -2 : 2, vars: { [v1]: 1, [v2]: 1 } },
    { coeff: 1, vars: { [v2]: 2 } },
  ];

  const ansCoeffs: [number, number] = useDiff ? [1, -1] : [1, 1];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(useDiff ? -1 : 1, { [v2]: 1 }, false)}}`,
    answer: `${ansCoeffs[0]},${ansCoeffs[1]}`,
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genBinomialSquareAsym(rng: () => number): Exercise {
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const a = randInt(rng, 2, 4);
  const b = randInt(rng, 2, 4);
  const useThird = rng() < 0.4;
  const useDiff = !useThird && rng() < 0.5;

  if (useThird) {
    const numTerms: TermDesc[] = [
      { coeff: a * a, vars: { [v1]: 2 } },
      { coeff: -(b * b), vars: { [v2]: 2 } },
    ];
    return {
      prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(a, { [v1]: 1 }, true)}${formatExpandedTerm(-b, { [v2]: 1 }, false)}}`,
      answer: `${a},${b}`,
      data: {
        fields: [{ variablePart: v1 }, { variablePart: v2 }],
        promptKey: 'exercise.simplifySymbolicFraction.prompt',
      },
    };
  }

  const middle = useDiff ? -2 * a * b : 2 * a * b;
  const numTerms: TermDesc[] = [
    { coeff: a * a, vars: { [v1]: 2 } },
    { coeff: middle, vars: { [v1]: 1, [v2]: 1 } },
    { coeff: b * b, vars: { [v2]: 2 } },
  ];

  const ansCoeffs: [number, number] = useDiff ? [a, -b] : [a, b];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(a, { [v1]: 1 }, true)}${formatExpandedTerm(useDiff ? -b : b, { [v2]: 1 }, false)}}`,
    answer: `${ansCoeffs[0]},${ansCoeffs[1]}`,
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genBinomialThirdFactor(rng: () => number): Exercise {
  let c = randInt(rng, 2, 4);
  if (rng() < 0.3) c = -c;
  const [v1, v2] = pick(rng, VAR_PAIRS);

  const numTerms: TermDesc[] = [
    { coeff: c, vars: { [v1]: 2 } },
    { coeff: -c, vars: { [v2]: 2 } },
  ];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(-1, { [v2]: 1 }, false)}}`,
    answer: `${c},${c}`,
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genSignMonomial(rng: () => number): Exercise {
  let c = randInt(rng, 2, 4);
  if (rng() < 0.3) c = -c;
  const [v1, v2] = pick(rng, VAR_PAIRS);

  const numTerms: TermDesc[] = [
    { coeff: c, vars: { [v1]: 2 } },
    { coeff: -c, vars: { [v1]: 1, [v2]: 1 } },
  ];

  const denTerms: TermDesc[] = [
    { coeff: 1, vars: { [v2]: 1 } },
    { coeff: -1, vars: { [v1]: 1 } },
  ];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
    answer: String(-c),
    data: {
      fields: [{ variablePart: v1 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genSignBinomial(rng: () => number): Exercise {
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const swap = rng() < 0.5;

  const vPrimary = swap ? v2 : v1;
  const vSecondary = swap ? v1 : v2;

  const numTerms: TermDesc[] = [
    { coeff: 1, vars: { [vPrimary]: 2 } },
    { coeff: -2, vars: { [vPrimary]: 1, [vSecondary]: 1 } },
    { coeff: 1, vars: { [vSecondary]: 2 } },
  ];

  const denTerms: TermDesc[] = [
    { coeff: 1, vars: { [vSecondary]: 1 } },
    { coeff: -1, vars: { [vPrimary]: 1 } },
  ];

  const ansCoeffs: [number, number] = swap ? [1, -1] : [-1, 1];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
    answer: `${ansCoeffs[0]},${ansCoeffs[1]}`,
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genFactBinom(rng: () => number): Exercise {
  const c = randInt(rng, 2, 4);
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const formula = Math.floor(rng() * 3) + 1;

  if (formula === 3) {
    const numTerms: TermDesc[] = [
      { coeff: c, vars: { [v1]: 3 } },
      { coeff: -c, vars: { [v1]: 1, [v2]: 2 } },
    ];
    return {
      prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(-1, { [v2]: 1 }, false)}}`,
      answer: `${c},${c}`,
      data: {
        fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v1}${v2}` }],
        promptKey: 'exercise.simplifySymbolicFraction.prompt',
      },
    };
  }

  const useDiff = formula === 2;
  const numTerms: TermDesc[] = [
    { coeff: c, vars: { [v1]: 3 } },
    { coeff: useDiff ? -2 * c : 2 * c, vars: { [v1]: 2, [v2]: 1 } },
    { coeff: c, vars: { [v1]: 1, [v2]: 2 } },
  ];

  const ansCoeffs: [number, number] = useDiff ? [c, -c] : [c, c];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatExpandedTerm(1, { [v1]: 1 }, true)}${formatExpandedTerm(useDiff ? -1 : 1, { [v2]: 1 }, false)}}`,
    answer: `${ansCoeffs[0]},${ansCoeffs[1]}`,
    data: {
      fields: [{ variablePart: `${v1}^{2}` }, { variablePart: `${v1}${v2}` }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genFactBinomDen(rng: () => number): Exercise {
  const c = randInt(rng, 2, 4);
  const [v1, v2] = pick(rng, VAR_PAIRS);
  const formula = Math.floor(rng() * 3) + 1;

  if (formula === 3) {
    const numTerms: TermDesc[] = [
      { coeff: c, vars: { [v1]: 3 } },
      { coeff: -c, vars: { [v1]: 1, [v2]: 2 } },
    ];
    const denTerms: TermDesc[] = [
      { coeff: 1, vars: { [v1]: 2 } },
      { coeff: -1, vars: { [v1]: 1, [v2]: 1 } },
    ];
    return {
      prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
      answer: `${c},${c}`,
      data: {
        fields: [{ variablePart: v1 }, { variablePart: v2 }],
        promptKey: 'exercise.simplifySymbolicFraction.prompt',
      },
    };
  }

  const useDiff = formula === 2;
  const numTerms: TermDesc[] = [
    { coeff: c, vars: { [v1]: 3 } },
    { coeff: useDiff ? -2 * c : 2 * c, vars: { [v1]: 2, [v2]: 1 } },
    { coeff: c, vars: { [v1]: 1, [v2]: 2 } },
  ];
  const denTerms: TermDesc[] = [
    { coeff: 1, vars: { [v1]: 2 } },
    { coeff: useDiff ? -1 : 1, vars: { [v1]: 1, [v2]: 1 } },
  ];

  const ansCoeffs: [number, number] = useDiff ? [c, -c] : [c, c];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
    answer: `${ansCoeffs[0]},${ansCoeffs[1]}`,
    data: {
      fields: [{ variablePart: v1 }, { variablePart: v2 }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

function genFactoredConstantSign(rng: () => number): Exercise {
  const [c1, c2] = pickFactorPair(rng);
  const [v1, v2] = pick(rng, VAR_PAIRS);

  const numTerms: TermDesc[] = [
    { coeff: c1, vars: { [v1]: 1 } },
    { coeff: -c1, vars: { [v2]: 1 } },
  ];
  const denTerms: TermDesc[] = [
    { coeff: c2, vars: { [v2]: 1 } },
    { coeff: -c2, vars: { [v1]: 1 } },
  ];

  return {
    prompt: `\\frac{${formatPoly(numTerms)}}{${formatPoly(denTerms)}}`,
    answer: reducedFraction(-c1, c2),
    data: {
      fields: [{ variablePart: '' }],
      promptKey: 'exercise.simplifySymbolicFraction.prompt',
    },
  };
}

export function generateSimplifySymbolicFraction(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  if (clamped <= 1) {
    return genConstantSign(rng);
  }

  if (clamped <= 2) {
    return rng() < 0.5 ? genConstantSign(rng) : genFactorConstant(rng);
  }

  if (clamped <= 3) {
    const roll = rng();
    if (roll < 0.4) return genConstantSign(rng);
    if (roll < 0.7) return genFactorConstant(rng);
    return genFactorMonomial(rng);
  }

  if (clamped <= 4) {
    const roll = rng();
    if (roll < 0.2) return genFactorMonomial(rng);
    if (roll < 0.3) return genConstantSign(rng);
    return genBinomialThird(rng);
  }

  if (clamped <= 5) {
    const roll = rng();
    if (roll < 0.15) return genFactorMonomial(rng);
    if (roll < 0.35) return genBinomialThird(rng);
    if (roll < 0.55) return genBinomialSquare(rng);
    if (roll < 0.75) return genFactorConstant(rng);
    return genFactoredConstantSign(rng);
  }

  if (clamped <= 7) {
    const roll = rng();
    if (roll < 0.10) return genBinomialThird(rng);
    if (roll < 0.25) return genBinomialSquare(rng);
    if (roll < 0.45) return genFactBinom(rng);
    if (roll < 0.60) return genBinomialSquareAsym(rng);
    if (roll < 0.70) return genFactoredConstantSign(rng);
    if (roll < 0.80) return genSignMonomial(rng);
    if (roll < 0.90) return genBinomialThirdFactor(rng);
    return genFactorMonomial(rng);
  }

  if (clamped <= 9) {
    const roll = rng();
    if (roll < 0.10) return genBinomialThird(rng);
    if (roll < 0.20) return genBinomialSquare(rng);
    if (roll < 0.35) return genFactBinom(rng);
    if (roll < 0.50) return genFactBinomDen(rng);
    if (roll < 0.65) return genBinomialSquareAsym(rng);
    if (roll < 0.75) return genBinomialThirdFactor(rng);
    if (roll < 0.85) return genSignMonomial(rng);
    return genSignBinomial(rng);
  }

  const roll = rng();
  if (roll < 0.10) return genFactBinom(rng);
  if (roll < 0.25) return genFactBinomDen(rng);
  if (roll < 0.40) return genBinomialSquareAsym(rng);
  if (roll < 0.52) return genBinomialThirdFactor(rng);
  if (roll < 0.62) return genBinomialSquare(rng);
  if (roll < 0.72) return genBinomialThird(rng);
  if (roll < 0.84) return genSignMonomial(rng);
  if (roll < 0.92) return genSignBinomial(rng);
  return genFactoredConstantSign(rng);
}

export { validateMultiField as validateSimplifySymbolicFraction } from '../validation';
