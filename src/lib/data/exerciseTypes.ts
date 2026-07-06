import type { ExerciseType } from '../types';
import { generateMultiplication } from '../exercises/multiplication';

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: {
    id: 'multiplication',
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    maxComplexity: 10,
    generate: generateMultiplication,
    validate: (answer, exercise) => answer.trim() === exercise.answer,
  },
};
