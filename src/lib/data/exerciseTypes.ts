import type { Exercise, ExerciseType } from '../types';
import { generateMultiplication } from '../exercises/multiplication';
import { generateMultiplicationMissingFactor } from '../exercises/multiplicationMissingFactor';
import { generatePrimeFactorisation } from '../exercises/primeFactorisation';
import { generateSquares } from '../exercises/squares';
import { generateOrderOfOperations } from '../exercises/orderOfOperations';
import { generateAdditionFraction } from '../exercises/additionFraction';
import { generateSimplifyFraction } from '../exercises/simplifyFraction';
import { generateSubtractionFraction } from '../exercises/subtractionFraction';
import { generateMultiplicationFraction } from '../exercises/multiplicationFraction';
import TextInputExercise from '../components/exercises/TextInputExercise.svelte';
import PrimeFactorisation from '../components/exercises/PrimeFactorisation.svelte';
import SimplifyFraction from '../components/exercises/SimplifyFraction.svelte';
import BinaryFractionExercise from '../components/exercises/BinaryFractionExercise.svelte';
import SubtractionFraction from '../components/exercises/SubtractionFraction.svelte';
import MultiplicationFraction from '../components/exercises/MultiplicationFraction.svelte';

function trimCompare(answer: string, exercise: Exercise): boolean {
  return answer.trim() === exercise.answer;
}

function validateSubtractionFraction(answer: string, exercise: Exercise): boolean {
  const [userNum, userDen] = answer.split(',').map(Number);
  const [correctNum, correctDen] = exercise.answer.split(',').map(Number);
  let uNum = userNum,
    uDen = userDen;
  if (uDen < 0) {
    uNum = -uNum;
    uDen = -uDen;
  }
  let cNum = correctNum,
    cDen = correctDen;
  if (cDen < 0) {
    cNum = -cNum;
    cDen = -cDen;
  }
  return uNum === cNum && uDen === cDen;
}

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: {
    id: 'multiplication',
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    maxComplexity: 10,
    generate: generateMultiplication,
    validate: trimCompare,
    component: TextInputExercise,
  },
  multiplicationMissingFactor: {
    id: 'multiplicationMissingFactor',
    nameKey: 'exercise.multiplicationMissingFactor.name',
    descriptionKey: 'exercise.multiplicationMissingFactor.desc',
    maxComplexity: 10,
    generate: generateMultiplicationMissingFactor,
    validate: trimCompare,
    component: TextInputExercise,
  },
  squares: {
    id: 'squares',
    nameKey: 'exercise.squares.name',
    descriptionKey: 'exercise.squares.desc',
    maxComplexity: 10,
    generate: generateSquares,
    validate: trimCompare,
    component: TextInputExercise,
  },
  orderOfOperations: {
    id: 'orderOfOperations',
    nameKey: 'exercise.orderOfOperations.name',
    descriptionKey: 'exercise.orderOfOperations.desc',
    maxComplexity: 10,
    generate: generateOrderOfOperations,
    validate: trimCompare,
    component: TextInputExercise,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
  },
  primeFactorisation: {
    id: 'primeFactorisation',
    nameKey: 'exercise.primeFactorisation.name',
    descriptionKey: 'exercise.primeFactorisation.desc',
    maxComplexity: 10,
    generate: generatePrimeFactorisation,
    validate: trimCompare,
    component: PrimeFactorisation,
    prerequisites: [
      { typeId: 'multiplication', complexity: 7 },
      { typeId: 'multiplicationMissingFactor', complexity: 7 },
    ],
  },
  simplifyFraction: {
    id: 'simplifyFraction',
    nameKey: 'exercise.simplifyFraction.name',
    descriptionKey: 'exercise.simplifyFraction.desc',
    maxComplexity: 10,
    generate: generateSimplifyFraction,
    validate: trimCompare,
    component: SimplifyFraction,
  },
  additionFraction: {
    id: 'additionFraction',
    nameKey: 'exercise.additionFraction.name',
    descriptionKey: 'exercise.additionFraction.desc',
    maxComplexity: 10,
    generate: generateAdditionFraction,
    validate: trimCompare,
    component: BinaryFractionExercise,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
  },
  subtractionFraction: {
    id: 'subtractionFraction',
    nameKey: 'exercise.subtractionFraction.name',
    descriptionKey: 'exercise.subtractionFraction.desc',
    maxComplexity: 10,
    generate: generateSubtractionFraction,
    validate: validateSubtractionFraction,
    component: SubtractionFraction,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
  },
  multiplicationFraction: {
    id: 'multiplicationFraction',
    nameKey: 'exercise.multiplicationFraction.name',
    descriptionKey: 'exercise.multiplicationFraction.desc',
    maxComplexity: 10,
    generate: generateMultiplicationFraction,
    validate: trimCompare,
    component: MultiplicationFraction,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
  },
};
