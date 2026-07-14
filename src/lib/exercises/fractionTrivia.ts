import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { pick, randInt, shuffle } from '../math/rng';
import { randomCoprimePair, clampComplexity } from '../math/number';

export interface FractionTriviaData {
  triviaType?: string;
  triviaA?: number;
  triviaB?: number;
  triviaExpressionLatex?: string;
  triviaOptionsLatex?: string[];
  triviaSubType?: string;
  triviaOptionsText?: string[];
}

function negativeSignOptions(useNumbers: boolean, a: number, b: number) {
  const va = useNumbers ? String(a) : 'a';
  const vb = useNumbers ? String(b) : 'b';
  return [
    { latex: `\\frac{-${va}}{${vb}}`, correct: true },
    { latex: `\\frac{${va}}{-${vb}}`, correct: true },
    { latex: `\\frac{-${va}}{-${vb}}`, correct: false },
    { latex: `-\\frac{-${va}}{${vb}}`, correct: false },
    { latex: `-\\frac{${va}}{-${vb}}`, correct: false },
  ];
}

function equalFractionsSignOptions(useNumbers: boolean, a: number, b: number) {
  const va = useNumbers ? String(a) : 'a';
  const vb = useNumbers ? String(b) : 'b';
  return [
    { latex: `\\frac{-${va}}{${vb}}`, correct: false },
    { latex: `\\frac{${va}}{-${vb}}`, correct: false },
    { latex: `\\frac{-${va}}{-${vb}}`, correct: true },
    { latex: `-\\frac{-${va}}{${vb}}`, correct: true },
    { latex: `-\\frac{${va}}{-${vb}}`, correct: true },
    { latex: `-\\frac{-${va}}{-${vb}}`, correct: false },
  ];
}

export function generateFractionTrivia(seed: number, complexity: number, forcedType?: string): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  let type: string;
  if (forcedType) {
    type = forcedType;
  } else {
    const basic = ['integerFractions', 'denominatorRestriction', 'doubleFraction', 'fractionBar', 'zeroNumerator'];
    const mid = ['fractionDivision', 'multiplySame', 'reciprocalProduct'];
    const hard = ['reducibleFractions', 'negativeSignPlacement'];
    const hardest = ['equalFractions'];

    const pool: string[] = [];
    pool.push(...basic);
    if (clamped >= 3) pool.push(...mid);
    if (clamped >= 6) pool.push(...hard);
    if (clamped >= 8) pool.push(...hardest);

    type = pick(rng, pool);
  }

  switch (type) {
    case 'integerFractions':
      return {
        prompt: '',
        answer: '0,3',
        data: { triviaType: 'integerFractions' },
      };

    case 'fractionDivision': {
      const [a, b] = randomCoprimePair(rng, 2, 9);
      return {
        prompt: '',
        answer: `${b},${a}`,
        data: { triviaType: 'fractionDivision', triviaA: a, triviaB: b },
      };
    }

    case 'equalFractions': {
      const useNumbers = rng() < 0.75;
      const numA = randInt(rng, 2, 5);
      const numB = pick(
        rng,
        [2, 3, 4, 5, 7].filter((n) => n !== numA),
      );

      const all = equalFractionsSignOptions(useNumbers, numA, numB);
      const shuffled = shuffle(rng, all);

      const showCount = clamped <= 5 ? 3 : 4;
      const shown = shuffled.slice(0, showCount);

      const correctIndices: number[] = [];
      shown.forEach((opt, idx) => {
        if (opt.correct) correctIndices.push(idx);
      });

      const optionsLatex = shown.map((o) => o.latex);

      return {
        prompt: '',
        answer: correctIndices.map(String).join(','),
        data: {
          triviaType: 'equalFractions',
          triviaOptionsLatex: optionsLatex,
          triviaA: useNumbers ? numA : undefined,
          triviaB: useNumbers ? numB : undefined,
        },
      };
    }

    case 'denominatorRestriction':
      return {
        prompt: '',
        answer: '0',
        data: { triviaType: 'denominatorRestriction' },
      };

    case 'doubleFraction': {
      const isHalve = rng() < 0.5;
      const allOptions = [
        { key: 'exercise.fractionTrivia.option.halveFraction.0', correctForHalve: true, correctForDouble: false },
        { key: 'exercise.fractionTrivia.option.halveFraction.1', correctForHalve: true, correctForDouble: false },
        { key: 'exercise.fractionTrivia.option.halveFraction.2', correctForHalve: false, correctForDouble: true },
        { key: 'exercise.fractionTrivia.option.halveFraction.3', correctForHalve: false, correctForDouble: true },
        { key: 'exercise.fractionTrivia.option.halveFraction.4', correctForHalve: false, correctForDouble: false },
        { key: 'exercise.fractionTrivia.option.halveFraction.5', correctForHalve: false, correctForDouble: false },
      ];
      const withCorrect = allOptions.map((o) => ({
        key: o.key,
        correct: isHalve ? o.correctForHalve : o.correctForDouble,
      }));
      const shuffled = shuffle(rng, withCorrect);
      const showCount = clamped <= 5 ? 3 : 4;
      const shown = shuffled.slice(0, showCount);
      const correctIndices: number[] = [];
      shown.forEach((opt, idx) => {
        if (opt.correct) correctIndices.push(idx);
      });
      return {
        prompt: '',
        answer: correctIndices.map(String).join(','),
        data: {
          triviaType: 'doubleFraction',
          triviaSubType: isHalve ? 'halveMC' : 'doubleMC',
          triviaOptionsText: shown.map((o) => o.key),
        },
      };
    }

    case 'reducibleFractions': {
      const all = [
        { latex: '\\frac{ab}{a}', correct: true },
        { latex: '\\frac{a+b}{a}', correct: false },
        { latex: '\\frac{a}{ab}', correct: true },
        { latex: '\\frac{a-b}{a}', correct: false },
        { latex: '\\frac{a}{a+b}', correct: false },
        { latex: '\\frac{a}{a-b}', correct: false },
      ];
      const shuffled = shuffle(rng, all);
      const showCount = clamped <= 5 ? 3 : 4;
      const shown = shuffled.slice(0, showCount);
      const correctIndices: number[] = [];
      shown.forEach((opt, idx) => {
        if (opt.correct) correctIndices.push(idx);
      });
      const optionsLatex = shown.map((o) => o.latex);
      return {
        prompt: '',
        answer: correctIndices.map(String).join(','),
        data: { triviaType: 'reducibleFractions', triviaOptionsLatex: optionsLatex },
      };
    }

    case 'multiplySame': {
      const isReciprocal = clamped >= 5 && rng() < 0.5;
      return {
        prompt: '',
        answer: isReciprocal ? '3' : '0',
        data: { triviaType: 'multiplySame', triviaSubType: isReciprocal ? 'reciprocal' : undefined },
      };
    }

    case 'fractionBar':
      return {
        prompt: '',
        answer: '3',
        data: { triviaType: 'fractionBar' },
      };

    case 'zeroNumerator':
      return {
        prompt: '',
        answer: '0',
        data: { triviaType: 'zeroNumerator' },
      };

    case 'reciprocalProduct': {
      const useNumeric = clamped <= 4 || rng() < 0.5;
      if (useNumeric) {
        const [a, b] = randomCoprimePair(rng, 2, 9);
        return {
          prompt: '',
          answer: '1',
          data: { triviaType: 'reciprocalProduct', triviaSubType: 'num', triviaA: a, triviaB: b },
        };
      }
      return {
        prompt: '',
        answer: '1',
        data: { triviaType: 'reciprocalProduct', triviaSubType: 'var' },
      };
    }

    case 'negativeSignPlacement': {
      const useNumbers = rng() < 0.75;
      const numA = randInt(rng, 2, 5);
      const numB = pick(
        rng,
        [2, 3, 4, 5, 7].filter((n) => n !== numA),
      );

      const all = negativeSignOptions(useNumbers, numA, numB);
      const shuffled = shuffle(rng, all);

      const showCount = clamped <= 5 ? 3 : 4;
      const shown = shuffled.slice(0, showCount);

      const correctIndices: number[] = [];
      shown.forEach((opt, idx) => {
        if (opt.correct) correctIndices.push(idx);
      });

      const optionsLatex = shown.map((o) => o.latex);

      return {
        prompt: '',
        answer: correctIndices.map(String).join(','),
        data: {
          triviaType: 'negativeSignPlacement',
          triviaOptionsLatex: optionsLatex,
          triviaA: useNumbers ? numA : undefined,
          triviaB: useNumbers ? numB : undefined,
        },
      };
    }

    default:
      return {
        prompt: '',
        answer: '0',
        data: { triviaType: 'integerFractions' },
      };
  }
}

export function generateFractionTriviaIntegerFractions(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'integerFractions');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    pattern: 'multi-choice',
    data: {
      ...origData,
      promptKey: 'exercise.fractionTrivia.type.integerFractions.promptBefore',
      promptMath: 'n',
      promptKeySuffix: 'exercise.fractionTrivia.type.integerFractions.promptSuffix',
      options: ['\\frac{0}{n}', '\\frac{1}{n}', '\\frac{n}{0}', '\\frac{n}{1}'].map((l) => ({ latex: l })),
    },
  };
}

export function generateFractionTriviaDenominatorRestriction(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'denominatorRestriction');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    pattern: 'text-input',
    data: { ...origData, promptKey: 'exercise.fractionTrivia.type.denominatorRestriction.prompt' },
  };
}

export function generateFractionTriviaDoubleFraction(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'doubleFraction');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    pattern: 'multi-choice',
    data: {
      ...origData,
      promptKey:
        origData.triviaSubType === 'halveMC'
          ? 'exercise.fractionTrivia.type.doubleFraction.halveMC.prompt'
          : 'exercise.fractionTrivia.type.doubleFraction.doubleMC.prompt',
      options: (origData.triviaOptionsText ?? []).map((l) => ({ label: l })),
    },
  };
}

export function generateFractionTriviaFractionBar(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'fractionBar');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    pattern: 'single-choice',
    data: {
      ...origData,
      promptKey: 'exercise.fractionTrivia.type.fractionBar.prompt',
      options: [0, 1, 2, 3].map((i) => ({ label: `exercise.fractionTrivia.option.fractionBar.${i}` })),
    },
  };
}

export function generateFractionTriviaZeroNumerator(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'zeroNumerator');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    prompt: '\\dfrac{0}{n} = ?',
    pattern: 'text-input',
    data: { ...origData, promptKey: undefined },
  };
}

export function generateFractionTriviaReciprocalProduct(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'reciprocalProduct');
  const origData = ex.data as FractionTriviaData;
  const prompt =
    origData.triviaSubType === 'num'
      ? `\\dfrac{${origData.triviaA ?? 'a'}}{${origData.triviaB ?? 'b'}} \\cdot \\dfrac{${origData.triviaB ?? 'b'}}{${origData.triviaA ?? 'a'}}`
      : '\\dfrac{a}{b} \\cdot \\dfrac{b}{a}';
  return { ...ex, prompt, pattern: 'text-input', data: { ...origData, promptKey: undefined } };
}

export function generateFractionTriviaMultiplySame(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'multiplySame');
  const origData = ex.data as FractionTriviaData;
  const promptKey =
    origData.triviaSubType === 'reciprocal'
      ? 'exercise.fractionTrivia.type.multiplySame.reciprocal.prompt'
      : 'exercise.fractionTrivia.type.multiplySame.prompt';
  return {
    ...ex,
    pattern: 'single-choice',
    data: {
      ...origData,
      promptKey,
      options: [0, 1, 2, 3].map((i) => ({ label: `exercise.fractionTrivia.option.multiplySame.${i}` })),
    },
  };
}

export function generateFractionTriviaFractionDivision(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'fractionDivision');
  const origData = ex.data as FractionTriviaData;
  const a = origData.triviaA ?? 1;
  const b = origData.triviaB ?? 1;
  return {
    prompt: `\\dfrac{1}{\\dfrac{${a}}{${b}}}`,
    answer: ex.answer,
    pattern: 'fraction-input',
    data: { ...origData, promptKey: 'exercise.fractionTrivia.type.fractionDivision.promptBefore' },
  };
}

export function generateFractionTriviaReducibleFractions(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'reducibleFractions');
  const origData = ex.data as FractionTriviaData;
  return {
    ...ex,
    pattern: 'multi-choice',
    data: {
      ...origData,
      promptKey: 'exercise.fractionTrivia.type.reducibleFractions.prompt',
      options: (origData.triviaOptionsLatex ?? []).map((l) => ({ latex: l })),
    },
  };
}

export function generateFractionTriviaNegativeSignPlacement(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'negativeSignPlacement');
  const origData = ex.data as FractionTriviaData;
  return {
    prompt: '',
    answer: ex.answer,
    pattern: 'multi-choice',
    data: {
      ...origData,
      promptKey: 'exercise.fractionTrivia.type.negativeSignPlacement.promptBefore',
      promptMath: `-\\dfrac{${origData.triviaA ?? 'a'}}{${origData.triviaB ?? 'b'}}`,
      promptKeySuffix: 'exercise.fractionTrivia.type.negativeSignPlacement.promptSuffix',
      options: (origData.triviaOptionsLatex ?? []).map((l) => ({ latex: l })),
    },
  };
}

export function generateFractionTriviaEqualFractions(seed: number, complexity: number): Exercise {
  const ex = generateFractionTrivia(seed, complexity, 'equalFractions');
  const origData = ex.data as FractionTriviaData;
  return {
    prompt: '',
    answer: ex.answer,
    pattern: 'multi-choice',
    data: {
      ...origData,
      promptKey: 'exercise.fractionTrivia.type.equalFractions.promptBefore',
      promptMath: `\\dfrac{${origData.triviaA ?? 'a'}}{${origData.triviaB ?? 'b'}}`,
      promptKeySuffix: 'exercise.fractionTrivia.type.equalFractions.promptSuffix',
      options: (origData.triviaOptionsLatex ?? []).map((l) => ({ latex: l })),
    },
  };
}

export function generateFractionTriviaExercise(seed: number, complexity: number): Exercise {
  const base = generateFractionTrivia(seed, complexity);
  const data = base.data as FractionTriviaData;
  const generators: Record<string, (seed: number, complexity: number) => Exercise> = {
    integerFractions: generateFractionTriviaIntegerFractions,
    denominatorRestriction: generateFractionTriviaDenominatorRestriction,
    doubleFraction: generateFractionTriviaDoubleFraction,
    fractionBar: generateFractionTriviaFractionBar,
    zeroNumerator: generateFractionTriviaZeroNumerator,
    reciprocalProduct: generateFractionTriviaReciprocalProduct,
    multiplySame: generateFractionTriviaMultiplySame,
    fractionDivision: generateFractionTriviaFractionDivision,
    reducibleFractions: generateFractionTriviaReducibleFractions,
    negativeSignPlacement: generateFractionTriviaNegativeSignPlacement,
    equalFractions: generateFractionTriviaEqualFractions,
  };
  const gen = generators[data.triviaType ?? ''];
  if (gen) return gen(seed, complexity);
  return base;
}

export function validateFractionTrivia(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as FractionTriviaData;

  switch (data.triviaType) {
    case 'integerFractions':
    case 'equalFractions':
    case 'reducibleFractions':
      return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);

    case 'doubleFraction':
      if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') {
        return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);
      }
      return answer.trim() === exercise.answer;

    case 'multiplySame':
    case 'fractionBar':
    case 'zeroNumerator':
      return answer.trim() === exercise.answer;

    case 'reciprocalProduct':
      return answer.trim() === '1';

    case 'fractionDivision':
      return validateFractionTriviaFraction(answer, exercise);

    case 'negativeSignPlacement':
      return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);

    case 'denominatorRestriction':
      return answer.trim() === '0';

    default:
      return false;
  }
}

function normalizeIndexAnswer(s: string): string {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '' && /^\d+$/.test(x))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .join(',');
}

function validateFractionTriviaFraction(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as FractionTriviaData;
  const parts = answer.split(',').map((s) => s.trim());
  if (parts.length !== 2) return false;
  if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return false;
  const userNum = parseInt(parts[0], 10);
  const userDen = parseInt(parts[1], 10);
  if (isNaN(userNum) || isNaN(userDen) || userDen === 0) return false;
  return userNum === data.triviaB && userDen === data.triviaA;
}
