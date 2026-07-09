import type { Exercise } from './types';
import { reduceFrac } from './math/fraction';

export function normalizeCoeff(s: string): string {
  const t = s.trim();
  if (t === '-') return '-1';
  return t || '1';
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
