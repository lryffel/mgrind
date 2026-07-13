import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { pick, shuffle } from '../math/rng';

export interface TermTransformationsTriviaData {
  triviaType?: string;
  triviaOptionsLatex?: string[];
  correctIndices?: number[];
  lawNameKey?: string;
  lawOperationKey?: string;
  ordinalKey?: string;
  hintKey?: string;
  statementsLatex?: string[];
  correctAnswers?: boolean[];
}

interface LawDef {
  nameKey: string;
  operationKey?: string;
  correctLatex: string;
  distractors: string[];
}

const PREFIX = 'exercise.termTransformationsTrivia.';

const LAWS: LawDef[] = [
  {
    nameKey: `${PREFIX}associativeLaw`,
    operationKey: `${PREFIX}forAddition`,
    correctLatex: '(a + b) + c = a + (b + c)',
    distractors: [
      '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
      'a + b = b + a',
      'a \\cdot (b + c) = a \\cdot b + a \\cdot c',
      '(a + b) + c = a + b \\cdot c',
    ],
  },
  {
    nameKey: `${PREFIX}associativeLaw`,
    operationKey: `${PREFIX}forMultiplication`,
    correctLatex: '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
    distractors: [
      '(a + b) + c = a + (b + c)',
      'a \\cdot b = b \\cdot a',
      'a^m \\cdot a^n = a^{m+n}',
      '(a \\cdot b) \\cdot c = a \\cdot (b + c)',
    ],
  },
  {
    nameKey: `${PREFIX}commutativeLaw`,
    operationKey: `${PREFIX}forAddition`,
    correctLatex: 'a + b = b + a',
    distractors: ['a \\cdot b = b \\cdot a', '(a + b) + c = a + (b + c)', 'a - b = b - a', 'a + b = b - a'],
  },
  {
    nameKey: `${PREFIX}commutativeLaw`,
    operationKey: `${PREFIX}forMultiplication`,
    correctLatex: 'a \\cdot b = b \\cdot a',
    distractors: [
      'a + b = b + a',
      '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
      '\\frac{a}{b} = \\frac{b}{a}',
      'a \\cdot b = -(a \\cdot b)',
    ],
  },
  {
    nameKey: `${PREFIX}distributiveLaw`,
    correctLatex: 'a \\cdot (b + c) = a \\cdot b + a \\cdot c',
    distractors: [
      '(a + b)^2 = a^2 + 2ab + b^2',
      'a + (b \\cdot c) = (a + b) \\cdot (a + c)',
      'a^n \\cdot b^n = (a \\cdot b)^n',
      'a \\cdot (b + c) = a \\cdot b + c',
    ],
  },
];

interface PowerLawDef {
  ordinalKey: string;
  hintKey: string;
  correctLatex: string;
  distractors: string[];
}

const POWER_LAWS: PowerLawDef[] = [
  {
    ordinalKey: `${PREFIX}first`,
    hintKey: `${PREFIX}hintProductSameBase`,
    correctLatex: 'a^m \\cdot a^n = a^{m+n}',
    distractors: [
      'a^m \\cdot a^n = a^{m \\cdot n}',
      'a^m + a^n = a^{m+n}',
      'a^m \\cdot a^n = a^{m-n}',
      'a^m \\cdot b^n = a^{m+n}',
    ],
  },
  {
    ordinalKey: `${PREFIX}second`,
    hintKey: `${PREFIX}hintProductSameExp`,
    correctLatex: 'a^n \\cdot b^n = (a \\cdot b)^n',
    distractors: [
      'a^n \\cdot b^n = (a + b)^n',
      'a^n + b^n = (a \\cdot b)^n',
      'a^n \\cdot b^m = (a \\cdot b)^n',
      'a^n \\cdot b^n = (a \\cdot b)^{2n}',
    ],
  },
  {
    ordinalKey: `${PREFIX}third`,
    hintKey: `${PREFIX}hintPowerOfPower`,
    correctLatex: '(a^m)^n = a^{m \\cdot n}',
    distractors: ['(a^m)^n = a^{m+n}', '(a^m)^n = a^{m^n}', '(a \\cdot m)^n = a^{m \\cdot n}', '(a^m)^n = a^{mn + n}'],
  },
];

const CORRECT_STATEMENTS: { latex: string; minComplexity: number }[] = [
  { latex: '(a + b) + c = a + (b + c)', minComplexity: 7 },
  { latex: '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)', minComplexity: 7 },
  { latex: 'a + b = b + a', minComplexity: 7 },
  { latex: 'a \\cdot b = b \\cdot a', minComplexity: 7 },
  { latex: 'a \\cdot (b + c) = a \\cdot b + a \\cdot c', minComplexity: 7 },
  { latex: 'a^m \\cdot a^n = a^{m+n}', minComplexity: 8 },
  { latex: 'a^n \\cdot b^n = (a \\cdot b)^n', minComplexity: 8 },
  { latex: '(a^m)^n = a^{m \\cdot n}', minComplexity: 8 },
  { latex: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}', minComplexity: 9 },
  { latex: '\\frac{a + b}{c} = \\frac{a}{c} + \\frac{b}{c}', minComplexity: 9 },
];

const INCORRECT_STATEMENTS: { latex: string; minComplexity: number }[] = [
  { latex: '(a + b)^2 = a^2 + b^2', minComplexity: 7 },
  { latex: 'a^{m+n} = a^m + a^n', minComplexity: 7 },
  { latex: '\\frac{a}{b} + \\frac{c}{d} = \\frac{a + c}{b + d}', minComplexity: 7 },
  { latex: 'a - b = b - a', minComplexity: 7 },
  { latex: 'a^m + a^n = a^{m+n}', minComplexity: 8 },
  { latex: 'a^{m \\cdot n} = a^m \\cdot a^n', minComplexity: 8 },
  { latex: '(a \\cdot b)^n = a^n + b^n', minComplexity: 8 },
  { latex: '(a + b)^n = a^n + b^n', minComplexity: 8 },
  { latex: '\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}', minComplexity: 9 },
  { latex: '\\frac{a + b}{c + d} = \\frac{a}{c} + \\frac{b}{d}', minComplexity: 10 },
];

export function generateTermTransformationsTrivia(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  const pool: string[] = ['laws'];
  if (clamped >= 4) pool.push('powerLaws');
  if (clamped >= 7) pool.push('trueFalse');

  const type = pick(rng, pool);

  switch (type) {
    case 'laws':
      return generateLaws(rng);
    case 'powerLaws':
      return generatePowerLaws(rng, clamped);
    case 'trueFalse':
      return generateTrueFalse(rng, clamped);
    default:
      return generateLaws(rng);
  }
}

function generateLaws(rng: () => number): Exercise {
  const law = pick(rng, LAWS);
  const distractors = shuffle(rng, law.distractors).slice(0, 3);
  const options = shuffle(rng, [law.correctLatex, ...distractors]);
  const correctIndex = options.indexOf(law.correctLatex);

  return {
    prompt: '',
    answer: String(correctIndex),
    data: {
      triviaType: 'laws',
      triviaOptionsLatex: options,
      correctIndices: [correctIndex],
      lawNameKey: law.nameKey,
      ...(law.operationKey ? { lawOperationKey: law.operationKey } : {}),
    },
  };
}

function generatePowerLaws(rng: () => number, clamped: number): Exercise {
  const maxIndex = clamped <= 4 ? 0 : clamped <= 5 ? 1 : 2;
  const law = POWER_LAWS[Math.floor(rng() * (maxIndex + 1))];
  const distractors = shuffle(rng, law.distractors).slice(0, 3);
  const options = shuffle(rng, [law.correctLatex, ...distractors]);
  const correctIndex = options.indexOf(law.correctLatex);

  return {
    prompt: '',
    answer: String(correctIndex),
    data: {
      triviaType: 'powerLaws',
      triviaOptionsLatex: options,
      correctIndices: [correctIndex],
      ordinalKey: law.ordinalKey,
      hintKey: law.hintKey,
    },
  };
}

function generateTrueFalse(rng: () => number, clamped: number): Exercise {
  const numStatements = clamped <= 8 ? 3 : 4;

  const availableCorrect = CORRECT_STATEMENTS.filter((s) => s.minComplexity <= clamped);
  const availableIncorrect = INCORRECT_STATEMENTS.filter((s) => s.minComplexity <= clamped);

  const minCorrect = Math.max(1, Math.floor(numStatements / 2));
  const minIncorrect = Math.max(1, numStatements - minCorrect);

  const correctPool = shuffle(rng, availableCorrect).slice(0, minCorrect);
  const incorrectPool = shuffle(rng, availableIncorrect).slice(0, minIncorrect);

  const allStatements = shuffle(rng, [
    ...correctPool.map((s) => ({ latex: s.latex, correct: true })),
    ...incorrectPool.map((s) => ({ latex: s.latex, correct: false })),
  ]);

  const statementsLatex = allStatements.map((s) => s.latex);
  const correctAnswers = allStatements.map((s) => s.correct);
  const answer = correctAnswers.map((c) => (c ? 'yes' : 'no')).join(',');

  return {
    prompt: '',
    answer,
    data: {
      triviaType: 'trueFalse',
      statementsLatex,
      correctAnswers,
    },
  };
}

export function validateTermTransformationsTrivia(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as TermTransformationsTriviaData;

  switch (data.triviaType) {
    case 'laws':
    case 'powerLaws': {
      const num = answer.trim();
      if (!/^\d+$/.test(num)) return false;
      return num === exercise.answer;
    }

    case 'trueFalse': {
      const userParts = answer.split(',').map((s) => s.trim());
      const correctParts = exercise.answer.split(',').map((s) => s.trim());
      if (userParts.length !== correctParts.length) return false;
      return userParts.every((v, i) => v === correctParts[i]);
    }

    default:
      return false;
  }
}
