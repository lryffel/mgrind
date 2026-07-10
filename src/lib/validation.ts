import type { Exercise, InputContext } from './types';
import { reduceFrac } from './math/fraction';

const DEFAULTS: Record<InputContext, string> = {
  coefficient: '1',
  exponent: '0',
  summand: '0',
  numerator: '0',
  denominator: '1',
  plain: '',
};

export function normalizeCoeff(s: string, context: InputContext = 'coefficient'): string {
  const t = s.trim();
  if (t === '-') return '-1';
  return t || DEFAULTS[context];
}

export function trimCompare(answer: string, exercise: Exercise): boolean {
  return answer.trim() === exercise.answer;
}

function parseNumDen(s: string): [number, number] | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(',');
  if (parts.length !== 2) return null;
  const num = parseInt(parts[0], 10);
  const den = parseInt(parts[1], 10);
  if (isNaN(num) || isNaN(den) || den === 0) return null;
  return reduceFrac(num, den);
}

export function validateFractionAnswer(answer: string, exercise: Exercise): boolean {
  const user = parseNumDen(answer);
  const correct = parseNumDen(exercise.answer);
  if (user === null || correct === null) return false;
  return user[0] * correct[1] === correct[0] * user[1];
}

function isReduced(answer: string): boolean {
  const trimmed = answer.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(',');
  if (parts.length !== 2) return false;
  const num = parseInt(parts[0], 10);
  const den = parseInt(parts[1], 10);
  if (isNaN(num) || isNaN(den) || den === 0) return false;
  const [rNum, rDen] = reduceFrac(num, den);
  return num === rNum && den === rDen;
}

export function validateFractionReduced(answer: string, exercise: Exercise): boolean {
  if (!validateFractionAnswer(answer, exercise)) return false;
  return isReduced(answer);
}
