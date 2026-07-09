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
    exerciseTypeIds: ['simplifyFraction', 'additionFraction', 'subtractionFraction', 'multiplicationFraction'],
  },
  {
    id: 'algebra',
    nameKey: 'discipline.algebra.name',
    exerciseTypeIds: [
      'substitution',
      'binomialFormulas',
      'collectingTerms',
      'factoringOut',
      'factoringBinomialFormulas',
      'factoringOutAndBinomial',
    ],
  },
];
