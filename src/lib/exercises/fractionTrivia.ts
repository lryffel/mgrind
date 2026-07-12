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

const MEDIANT_VARIANTS = [
  {
    latex: '\\frac{a+c}{b+d}',
    correctIndices: [3],
  },
  {
    latex: '\\frac{ad+bc}{bd}',
    correctIndices: [0],
  },
  {
    latex: '\\frac{ac}{bd}',
    correctIndices: [1],
  },
  {
    latex: '\\frac{ad+bc}{2bd}',
    correctIndices: [2, 3],
  },
  {
    latex: '\\frac{a+b}{c+d}',
    correctIndices: [4],
  },
];

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

export function generateFractionTrivia(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  const basic = ['fractionTerms', 'integerFractions', 'denominatorRestriction', 'doubleFraction', 'fractionBar'];
  const mid = ['fractionDivision', 'multiplySame'];
  const hard = ['mediant', 'reducibleFractions'];
  const hardest = ['equalFractions'];

  const pool: string[] = [];
  pool.push(...basic);
  if (clamped >= 3) pool.push(...mid);
  if (clamped >= 6) pool.push(...hard);
  if (clamped >= 8) pool.push(...hardest);

  const type = pick(rng, pool);

  switch (type) {
    case 'fractionTerms':
      return {
        prompt: '',
        answer: 'numerator,denominator',
        data: { triviaType: 'fractionTerms' },
      };

    case 'integerFractions':
      return {
        prompt: '',
        answer: '0,3',
        data: { triviaType: 'integerFractions' },
      };

    case 'mediant': {
      const variant = pick(rng, MEDIANT_VARIANTS);
      return {
        prompt: '',
        answer: variant.correctIndices.sort().join(','),
        data: { triviaType: 'mediant', triviaExpressionLatex: variant.latex },
      };
    }

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
      const numB = pick(rng, [2, 3, 4, 5, 7].filter((n) => n !== numA));

      const all = equalFractionsSignOptions(useNumbers, numA, numB);
      const shuffled = shuffle(rng, all);

      const showCount = clamped <= 5 ? 3 : 4;
      const shown = shuffled.slice(0, showCount);

      const correctIndices: number[] = [];
      shown.forEach((opt, idx) => {
        if (opt.correct) correctIndices.push(idx);
      });

      const optionsLatex = shown.map((o) => o.latex);
      optionsLatex.push('none');

      if (correctIndices.length === 0) {
        correctIndices.push(showCount);
      }

      return {
        prompt: '',
        answer: correctIndices.map(String).join(','),
        data: { triviaType: 'equalFractions', triviaOptionsLatex: optionsLatex, triviaA: useNumbers ? numA : undefined, triviaB: useNumbers ? numB : undefined },
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
        { key: 'exercise.fractionTrivia.option.halveFraction.6', correctForHalve: false, correctForDouble: false },
      ];
      const withCorrect = allOptions.map((o) => ({ key: o.key, correct: isHalve ? o.correctForHalve : o.correctForDouble }));
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
        data: { triviaType: 'doubleFraction', triviaSubType: isHalve ? 'halveMC' : 'doubleMC', triviaOptionsText: shown.map((o) => o.key) },
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

    case 'multiplySame':
      return {
        prompt: '',
        answer: '0',
        data: { triviaType: 'multiplySame' },
      };

    case 'fractionBar':
      return {
        prompt: '',
        answer: '3',
        data: { triviaType: 'fractionBar' },
      };

    default:
      return {
        prompt: '',
        answer: 'numerator,denominator',
        data: { triviaType: 'fractionTerms' },
      };
  }
}

export function validateFractionTrivia(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as FractionTriviaData;

  switch (data.triviaType) {
    case 'fractionTerms': {
      const parts = answer.split(',').map((s) => s.trim().toLowerCase());
      if (parts.length !== 2) return false;
      return (
        (parts[0] === 'numerator' && parts[1] === 'denominator') ||
        (parts[0] === 'zähler' && parts[1] === 'nenner') ||
        (parts[0] === 'zahler' && parts[1] === 'nenner')
      );
    }

    case 'integerFractions':
    case 'equalFractions':
    case 'reducibleFractions':
      return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);

    case 'mediant':
      return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);

    case 'doubleFraction':
      if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') {
        return normalizeIndexAnswer(answer) === normalizeIndexAnswer(exercise.answer);
      }
      return answer.trim() === exercise.answer;

    case 'multiplySame':
    case 'fractionBar':
      return answer.trim() === exercise.answer;

    case 'fractionDivision':
      return validateFractionTriviaFraction(answer, exercise);

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
