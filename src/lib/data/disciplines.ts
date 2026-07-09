import type { Discipline } from '../types';

export const disciplines: Discipline[] = [
  {
    id: 'numbers',
    nameKey: 'discipline.numbers.name',
    exerciseTypeIds: [
      'multiplication',
      'division',
      'squares',
      'orderOfOperations',
      'primeFactorisation',
      'simplifyFraction',
      'additionFraction',
      'subtractionFraction',
      'multiplicationFraction',
      'scientificNotation',
    ],
  },
  {
    id: 'fractions',
    nameKey: 'discipline.fractions.name',
    exerciseTypeIds: ['simplifyFraction', 'additionFraction', 'subtractionFraction', 'multiplicationFraction', 'simplifySymbolicFraction'],
  },
  {
    id: 'termTransformations',
    nameKey: 'discipline.termTransformations.name',
    exerciseTypeIds: [
      'substitution',
      'binomialFormulas',
      'collectingTerms',
      'expand',
      'expandAndCollect',
      'factoringOut',
      'factoringBinomialFormulas',
      'factoringOutAndBinomial',
      'simplifySymbolicFraction',
      'necessityOfParentheses',
      'linearEquations',
    ],
  },
  {
    id: 'equations',
    nameKey: 'discipline.equations.name',
    exerciseTypeIds: ['linearEquations', 'factorEquations'],
  },
  {
    id: 'geometry',
    nameKey: 'discipline.geometry.name',
    exerciseTypeIds: ['interiorAngles', 'pythagoras'],
  },
];
