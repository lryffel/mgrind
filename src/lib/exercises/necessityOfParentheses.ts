import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { pick, pickDistinct, randInt } from '../math/rng';

export interface NecessityOfParenthesesData {
  questions: { latex: string; needsParens: boolean }[];
}

interface QuestionTemplate {
  latex: (vars: string[], expVars: string[]) => string;
  needsParens: boolean;
  varCount: number;
  expCount: number;
}

const INT_VARS = ['k', '\\ell', 'm', 'n', 'p', 'q'];

function joinFactors(left: string, right: string): string {
  return /^\d/.test(right) ? `${left} \\cdot ${right}` : `${left}${right}`;
}

const TEMPLATES: QuestionTemplate[] = [
  {
    latex: ([a, b], [n]) => `(${a} + ${b})^{${n}}`,
    needsParens: true,
    varCount: 2,
    expCount: 1,
  },
  {
    latex: ([a, b], [n]) => `(${joinFactors(a, b)})^{${n}}`,
    needsParens: true,
    varCount: 2,
    expCount: 1,
  },
  {
    latex: ([a, b], [n]) => `${a}({${b}}^{${n}})`,
    needsParens: false,
    varCount: 2,
    expCount: 1,
  },
  {
    latex: ([a, b, c]) => `${a} - (${b} + ${c})`,
    needsParens: true,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `(${a} - ${b}) + ${c}`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `(${a} + ${b}) + ${c}`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `${a} + (${b} + ${c})`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `${a}(${joinFactors(b, c)})`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `(${joinFactors(a, b)})${/^\d/.test(c) ? ` \\cdot ${c}` : c}`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b]) => `\\sqrt{(${a} + ${b})}`,
    needsParens: false,
    varCount: 2,
    expCount: 0,
  },
  {
    latex: ([a, b]) => `\\sqrt{(${joinFactors(a, b)})}`,
    needsParens: false,
    varCount: 2,
    expCount: 0,
  },
  {
    latex: ([a, b], [n]) => `\\sqrt{(${joinFactors(a, b)})^{${n}}}`,
    needsParens: true,
    varCount: 2,
    expCount: 1,
  },
  {
    latex: ([a, b]) => `(\\sqrt{${a} + ${b}})^{2}`,
    needsParens: false,
    varCount: 2,
    expCount: 0,
  },
  {
    latex: ([a], [n, m]) => `{${a}}^{(${n}^{${m}})}`,
    needsParens: false,
    varCount: 1,
    expCount: 2,
  },
  {
    latex: ([a], [n, m]) => `({${a}}^{${n}})^{${m}}`,
    needsParens: true,
    varCount: 1,
    expCount: 2,
  },
  {
    latex: ([a, b]) => `-(${a} + ${b})`,
    needsParens: true,
    varCount: 2,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `(${a} + ${b})${/^\d/.test(c) ? ` \\cdot ${c}` : c}`,
    needsParens: true,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `${a} - (${b} - ${c})`,
    needsParens: true,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a, b, c]) => `(${a} - ${b}) - ${c}`,
    needsParens: false,
    varCount: 3,
    expCount: 0,
  },
  {
    latex: ([a], [n]) => `(-${a})^{${n}}`,
    needsParens: true,
    varCount: 1,
    expCount: 1,
  },
];

const SIMPLE_VARS = ['a', 'b', 'c', 'd', 'x', 'y', 'u', 'v'];
const MONO_VAR_NAMES = ['x', 'y', 'z', 'u', 'v', 'w'];

function generateBaseVar(rng: () => number, complexity: number): string {
  if (complexity <= 3) {
    return pick(rng, SIMPLE_VARS);
  }

  const name = pick(rng, MONO_VAR_NAMES);
  if (complexity <= 6) {
    const coeff = randInt(rng, 1, 5);
    if (coeff === 1) return name;
    return `${coeff}${name}`;
  }

  const coeff = randInt(rng, 1, 5);
  const exp = randInt(rng, 1, 3);
  const base = exp === 1 ? name : `${name}^{${exp}}`;
  if (coeff === 1) return base;
  return `${coeff}${base}`;
}

function generateExpVar(rng: () => number): string {
  return pick(rng, INT_VARS);
}

export function generateNecessityOfParentheses(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  const chosen = pickDistinct(rng, TEMPLATES, 3);

  const questions = chosen.map((tpl) => {
    const vars: string[] = [];
    for (let i = 0; i < tpl.varCount; i++) {
      vars.push(generateBaseVar(rng, clamped));
    }
    const expVars: string[] = [];
    for (let i = 0; i < tpl.expCount; i++) {
      expVars.push(generateExpVar(rng));
    }
    return {
      latex: tpl.latex(vars, expVars),
      needsParens: tpl.needsParens,
    };
  });

  return {
    prompt: '',
    answer: questions.map((q) => (q.needsParens ? 'yes' : 'no')).join(','),
    data: { questions },
  };
}

export function validateNecessityOfParentheses(answer: string, exercise: Exercise): boolean {
  const userParts = answer.split(',').map((s) => s.trim());
  const correctParts = exercise.answer.split(',').map((s) => s.trim());
  if (userParts.length !== correctParts.length) return false;
  for (let i = 0; i < userParts.length; i++) {
    if (userParts[i] !== correctParts[i]) return false;
  }
  return true;
}
