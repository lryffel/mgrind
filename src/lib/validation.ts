import type { Exercise, InputContext } from './types';
import type { SymbolicFractionData } from './exercises/simplifySymbolicFraction';
import { reduceFrac, fracEqual } from './math/fraction';

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

export function validateMultiField(answer: string, exercise: Exercise): boolean {
  const userParts = answer.split(',').map((s) => s.trim());
  const correctParts = exercise.answer.split(',').map((s) => s.trim());
  if (userParts.length !== correctParts.length) return false;
  for (let i = 0; i < userParts.length; i++) {
    if (!fracEqual(userParts[i], correctParts[i])) return false;
  }
  return true;
}

export function validateSymbolicFraction(answer: string, exercise: Exercise): boolean {
  if (exercise.answer === 'cannot_simplify') {
    return answer === 'cannot_simplify';
  }
  if (answer === 'cannot_simplify') {
    return false;
  }

  const data = exercise.data as SymbolicFractionData | undefined;
  if (!data || data.mode !== 'fraction') {
    return validateMultiField(answer, exercise);
  }

  const [userNumStr, userDenStr, ...extra] = answer.split(';');
  if (extra.length > 0 || userNumStr === undefined || userDenStr === undefined) return false;

  const [expNumStr, expDenStr, ...expExtra] = exercise.answer.split(';');
  if (expExtra.length > 0 || expNumStr === undefined || expDenStr === undefined) return false;

  const userNumParts = userNumStr.split(',').map((s) => s.trim());
  const userDenParts = userDenStr.split(',').map((s) => s.trim());
  const expNumParts = expNumStr.split(',').map((s) => s.trim());
  const expDenParts = expDenStr.split(',').map((s) => s.trim());

  const numLen = data.fields?.length ?? 0;
  const denLen = data.denominatorFields?.length ?? 0;

  if (userNumParts.length !== numLen) return false;
  if (userDenParts.length !== denLen) return false;
  if (expNumParts.length !== numLen) return false;
  if (expDenParts.length !== denLen) return false;

  for (let i = 0; i < userNumParts.length; i++) {
    const ud = userDenParts[userDenParts.length === 1 ? 0 : i];
    const ed = expDenParts[expDenParts.length === 1 ? 0 : i];
    if (!fracEqual(`${userNumParts[i]}/${ud}`, `${expNumParts[i]}/${ed}`)) return false;
  }

  return true;
}
