import type { ExerciseType } from '../types';
import { generateMultiplication } from '../exercises/multiplication';
import { generateMultiplicationMissingFactor } from '../exercises/multiplicationMissingFactor';

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: {
    id: 'multiplication',
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    maxComplexity: 10,
    generate: generateMultiplication,
    validate: (answer, exercise) => answer.trim() === exercise.answer,
  },
  multiplicationMissingFactor: {
    id: 'multiplicationMissingFactor',
    nameKey: 'exercise.multiplicationMissingFactor.name',
    descriptionKey: 'exercise.multiplicationMissingFactor.desc',
    maxComplexity: 10,
    generate: generateMultiplicationMissingFactor,
    validate: (answer, exercise) => answer.trim() === exercise.answer,
  },
};
