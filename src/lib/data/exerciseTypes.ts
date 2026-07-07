import type { Exercise, ExerciseType } from '../types';
import { generateMultiplication } from '../exercises/multiplication';
import { generateMultiplicationMissingFactor } from '../exercises/multiplicationMissingFactor';
import { generatePrimeFactorisation } from '../exercises/primeFactorisation';
import { generateSimplifyFraction } from '../exercises/simplifyFraction';

function trimCompare(answer: string, exercise: Exercise): boolean {
  return answer.trim() === exercise.answer;
}

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: {
    id: 'multiplication',
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    maxComplexity: 10,
    generate: generateMultiplication,
    validate: trimCompare,
  },
  multiplicationMissingFactor: {
    id: 'multiplicationMissingFactor',
    nameKey: 'exercise.multiplicationMissingFactor.name',
    descriptionKey: 'exercise.multiplicationMissingFactor.desc',
    maxComplexity: 10,
    generate: generateMultiplicationMissingFactor,
    validate: trimCompare,
  },
  primeFactorisation: {
    id: 'primeFactorisation',
    nameKey: 'exercise.primeFactorisation.name',
    descriptionKey: 'exercise.primeFactorisation.desc',
    maxComplexity: 10,
    generate: generatePrimeFactorisation,
    validate: trimCompare,
  },
  simplifyFraction: {
    id: 'simplifyFraction',
    nameKey: 'exercise.simplifyFraction.name',
    descriptionKey: 'exercise.simplifyFraction.desc',
    maxComplexity: 10,
    generate: generateSimplifyFraction,
    validate: trimCompare,
  },
};
