import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { pick, randInt, shuffle } from '../math/rng';

export type NumberSet = 'natural' | 'integer' | 'rational';

export interface NumberExpr {
  latex: string;
  isNatural: boolean;
  isInteger: boolean;
  isRational: boolean;
}

export interface NumbersTriviaData {
  subType?: string;
  numberA?: number;
  numberB?: number;
  correctIndices?: number[];
  promptLatex?: string;
  statementIndex?: number;
  ruleIndices?: number[];
  numberSet?: string;
  numberQuestions?: NumberExpr[];
  ruleTexts?: { en: string; de: string }[];
}

interface SubTypeConfig {
  id: string;
  min: number;
  max: number;
}

const SUB_TYPES: SubTypeConfig[] = [
  { id: 'trueFalse', min: 0, max: 10 },
  { id: 'isNatural', min: 0, max: 10 },
  { id: 'isInteger', min: 0, max: 10 },
  { id: 'isRational', min: 0, max: 10 },
  { id: 'divisibilityRules', min: 1, max: 10 },
  { id: 'primeDivisors', min: 2, max: 10 },
];

interface TrueFalseStmt {
  en: string;
  de: string;
  latex?: string;
  correct: boolean;
  min: number;
}

export const NUMBERS_TRIVIA_TRUE_FALSE: TrueFalseStmt[] = [
  {
    en: 'Zero is allowed in the denominator of a fraction.',
    de: 'Die Null ist im Nenner eines Bruchs erlaubt.',
    correct: false,
    min: 0,
  },
  { en: '1 is a prime number.', de: '1 ist eine Primzahl.', correct: false, min: 0 },

  {
    en: 'The sum of two even numbers is always even.',
    de: 'Die Summe zweier gerader Zahlen ist immer gerade.',
    correct: true,
    min: 0,
  },
  { en: 'Every prime number is odd.', de: 'Jede Primzahl ist ungerade.', correct: false, min: 0 },
  { en: 'Every integer is a rational number.', de: 'Jede ganze Zahl ist eine rationale Zahl.', correct: true, min: 2 },
  { en: '-a is always negative.', de: '-a ist immer negativ.', latex: '-a', correct: false, min: 1 },
  {
    en: 'The sum of two odd numbers is always even.',
    de: 'Die Summe zweier ungerader Zahlen ist immer gerade.',
    correct: true,
    min: 1,
  },
  {
    en: 'The product of two negative numbers is negative.',
    de: 'Das Produkt zweier negativer Zahlen ist negativ.',
    correct: false,
    min: 1,
  },
  {
    en: 'The sum of two negative numbers is negative.',
    de: 'Die Summe zweier negativer Zahlen ist negativ.',
    correct: true,
    min: 1,
  },
  { en: 'There are infinitely many prime numbers.', de: 'Es gibt unendlich viele Primzahlen.', correct: true, min: 6 },
  {
    en: 'The square root of 2 is a rational number.',
    de: 'Die Quadratwurzel von 2 ist eine rationale Zahl.',
    correct: false,
    min: 8,
  },
  { en: 'Every natural number is an integer.', de: 'Jede natürliche Zahl ist eine ganze Zahl.', correct: true, min: 2 },
  {
    en: 'Every natural number is a rational number.',
    de: 'Jede natürliche Zahl ist eine rationale Zahl.',
    correct: true,
    min: 3,
  },
  { en: 'Every integer is a natural number.', de: 'Jede ganze Zahl ist eine natürliche Zahl.', correct: false, min: 2 },
  { en: 'Every integer is a real number.', de: 'Jede ganze Zahl ist eine reelle Zahl.', correct: true, min: 5 },
  {
    en: 'Every rational number is an integer.',
    de: 'Jede rationale Zahl ist eine ganze Zahl.',
    correct: false,
    min: 3,
  },
  {
    en: 'Every rational number is a real number.',
    de: 'Jede rationale Zahl ist eine reelle Zahl.',
    correct: true,
    min: 5,
  },
  {
    en: 'Every real number is a rational number.',
    de: 'Jede reelle Zahl ist eine rationale Zahl.',
    correct: false,
    min: 7,
  },
];

interface CorrectRule {
  en: string;
  de: string;
  k: number;
  min: number;
}

const CORRECT_DIV_RULES: CorrectRule[] = [
  { en: 'The last digit is 0, 2, 4, 6 or 8.', de: 'Die letzte Ziffer ist 0, 2, 4, 6 oder 8.', k: 2, min: 1 },
  { en: 'The last digit is 0 or 5.', de: 'Die letzte Ziffer ist 0 oder 5.', k: 5, min: 1 },
  { en: 'The last digit is 0.', de: 'Die letzte Ziffer ist 0.', k: 10, min: 1 },
  { en: 'The sum of the digits is divisible by 3.', de: 'Die Quersumme ist durch 3 teilbar.', k: 3, min: 3 },
  { en: 'The sum of the digits is divisible by 9.', de: 'Die Quersumme ist durch 9 teilbar.', k: 9, min: 3 },
  {
    en: 'The last two digits form a number divisible by 4.',
    de: 'Die letzten zwei Ziffern bilden eine durch 4 teilbare Zahl.',
    k: 4,
    min: 6,
  },
  { en: 'The number is divisible by 2 and 3.', de: 'Die Zahl ist durch 2 und 3 teilbar.', k: 6, min: 6 },
  {
    en: 'The last three digits form a number divisible by 8.',
    de: 'Die letzten drei Ziffern bilden eine durch 8 teilbare Zahl.',
    k: 8,
    min: 7,
  },
];

function isPerfectSquare(n: number): boolean {
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

function generateNumberExpr(rng: () => number, clamped: number): NumberExpr {
  const maxVal = clamped <= 3 ? 10 : clamped <= 6 ? 50 : 100;
  const types = ['natural', 'fractionNonInt', 'fractionInt', 'sqrtPerfect', 'sqrtNonPerfect', 'negative'];
  const type = pick(rng, types);

  switch (type) {
    case 'natural': {
      const n = randInt(rng, 1, maxVal);
      return { latex: String(n), isNatural: true, isInteger: true, isRational: true };
    }
    case 'fractionNonInt': {
      const b = randInt(rng, 2, Math.min(maxVal, 12));
      let a = randInt(rng, 1, b * 3);
      while (a % b === 0) a = randInt(rng, 1, b * 3);
      return { latex: `\\frac{${a}}{${b}}`, isNatural: false, isInteger: false, isRational: true };
    }
    case 'fractionInt': {
      const b = randInt(rng, 1, Math.min(maxVal / 2, 10));
      const k = randInt(rng, 1, Math.min(Math.floor(maxVal / b), 10));
      const a = b * k;
      return { latex: `\\frac{${a}}{${b}}`, isNatural: true, isInteger: true, isRational: true };
    }
    case 'sqrtPerfect': {
      const k = randInt(rng, 1, clamped <= 3 ? 5 : clamped <= 6 ? 8 : 12);
      return { latex: `\\sqrt{${k * k}}`, isNatural: true, isInteger: true, isRational: true };
    }
    case 'sqrtNonPerfect': {
      const limit = clamped <= 3 ? 10 : clamped <= 6 ? 30 : 50;
      let n = randInt(rng, 2, limit);
      while (isPerfectSquare(n)) n = randInt(rng, 2, limit);
      return { latex: `\\sqrt{${n}}`, isNatural: false, isInteger: false, isRational: false };
    }
    case 'negative': {
      const n = randInt(rng, 1, maxVal);
      return { latex: String(-n), isNatural: false, isInteger: true, isRational: true };
    }
    default:
      return { latex: '1', isNatural: true, isInteger: true, isRational: true };
  }
}

function generateSetQuestions(
  rng: () => number,
  clamped: number,
  set: NumberSet,
): { questions: NumberExpr[]; answers: string } {
  const count = clamped <= 4 ? 3 : 4;
  const questions: NumberExpr[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateNumberExpr(rng, clamped));
  }
  const getAnswer = (q: NumberExpr) =>
    set === 'natural' ? q.isNatural : set === 'integer' ? q.isInteger : q.isRational;
  const hasYes = questions.some(getAnswer);
  const hasNo = questions.some((q) => !getAnswer(q));
  if (!hasYes) questions[0] = { latex: '1', isNatural: true, isInteger: true, isRational: true };
  if (!hasNo) {
    const noIdx = questions.length - 1;
    if (set === 'natural')
      questions[noIdx] = { latex: '\\frac{1}{2}', isNatural: false, isInteger: false, isRational: true };
    else if (set === 'integer')
      questions[noIdx] = { latex: '\\frac{1}{2}', isNatural: false, isInteger: false, isRational: true };
    else questions[noIdx] = { latex: '\\sqrt{2}', isNatural: false, isInteger: false, isRational: false };
  }
  return {
    questions,
    answers: questions.map((q) => (getAnswer(q) ? 'yes' : 'no')).join(','),
  };
}

export function generateNumbersTrivia(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);

  const available = SUB_TYPES.filter((s) => s.min <= clamped && clamped <= s.max);
  const chosen = pick(rng, available);

  switch (chosen.id) {
    case 'trueFalse': {
      const available = NUMBERS_TRIVIA_TRUE_FALSE.filter((s) => s.min <= clamped);
      const stmt = pick(rng, available);
      return {
        prompt: '',
        answer: stmt.correct ? '0' : '1',
        data: {
          subType: 'trueFalse',
          correctIndices: stmt.correct ? [0] : [1],
          statementIndex: NUMBERS_TRIVIA_TRUE_FALSE.indexOf(stmt),
          ...(stmt.latex ? { promptLatex: stmt.latex } : {}),
        },
      };
    }

    case 'isNatural':
    case 'isInteger':
    case 'isRational': {
      const set = chosen.id === 'isNatural' ? 'natural' : chosen.id === 'isInteger' ? 'integer' : 'rational';
      const { questions, answers } = generateSetQuestions(rng, clamped, set);
      return {
        prompt: '',
        answer: answers,
        data: { subType: chosen.id, numberSet: set, numberQuestions: questions },
      };
    }

    case 'divisibilityRules': {
      const kChoices = clamped <= 3 ? [2, 5, 10] : clamped <= 6 ? [2, 3, 5, 9, 10] : [2, 3, 4, 5, 6, 8, 9, 10];
      const k = pick(rng, kChoices);

      const correctRule = CORRECT_DIV_RULES.find((r) => r.k === k && r.min <= clamped)!;

      const isKAccidentallyCorrect = (en: string): boolean => CORRECT_DIV_RULES.some((r) => r.k === k && r.en === en);

      const wrongTemplates: ((k: number) => { en: string; de: string })[] = [
        (n) => ({
          en: `The digit sum is divisible by ${n}.`,
          de: `Die Quersumme ist durch ${n} teilbar.`,
        }),
        (n) => ({
          en: `The last digit is 0 or ${n}.`,
          de: `Die letzte Ziffer ist 0 oder ${n}.`,
        }),
        (n) => ({
          en: `The number is divisible by ${n} and ${n % 2 === 0 ? n / 2 : 2}.`,
          de: `Die Zahl ist durch ${n} und ${n % 2 === 0 ? n / 2 : 2} teilbar.`,
        }),
        () => ({
          en: 'The number is odd.',
          de: 'Die Zahl ist ungerade.',
        }),
      ];

      const wrongPool = wrongTemplates
        .map((tpl) => tpl(k))
        .filter((r) => {
          if (isKAccidentallyCorrect(r.en)) return false;
          if (r.en.startsWith('The last digit is 0 or 10')) return false;
          if (k === 3 || k === 9) {
            if (r.en.startsWith('The digit sum is divisible by')) return false;
          }
          if (k === 6 && r.en.startsWith('The number is divisible by 6 and')) return false;
          return true;
        });
      const selected = shuffle(rng, wrongPool).slice(0, 3);
      const pool = [
        { en: correctRule.en, de: correctRule.de, correct: true },
        ...selected.map((r) => ({ en: r.en, de: r.de, correct: false })),
      ];
      const shown = shuffle(rng, pool);
      const correctIndex = shown.findIndex((r) => r.correct);
      return {
        prompt: '',
        answer: String(correctIndex),
        data: {
          subType: 'divisibilityRules',
          numberA: k,
          correctIndices: [correctIndex],
          ruleTexts: shown.map((r) => ({ en: r.en, de: r.de })),
        },
      };
    }

    case 'primeDivisors':
      return {
        prompt: '',
        answer: '2',
        data: { subType: 'primeDivisors' },
      };

    default:
      return {
        prompt: '',
        answer: '2',
        data: { subType: 'primeDivisors' },
      };
  }
}

export function validateNumbersTrivia(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as NumbersTriviaData;

  switch (data.subType) {
    case 'trueFalse':
    case 'divisibilityRules': {
      const num = answer.trim();
      if (!/^\d+$/.test(num)) return false;
      return num === exercise.answer;
    }

    case 'isNatural':
    case 'isInteger':
    case 'isRational': {
      const userParts = answer.split(',').map((s) => s.trim());
      const correctParts = exercise.answer.split(',').map((s) => s.trim());
      if (userParts.length !== correctParts.length) return false;
      return userParts.every((v, i) => v === correctParts[i]);
    }

    case 'primeDivisors':
      return answer.trim() === '2';

    default:
      return false;
  }
}
