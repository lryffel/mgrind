import type { Discipline } from '../types';

export const disciplines: Discipline[] = [
  {
    id: 'multiplication',
    nameKey: 'discipline.multiplication.name',
    exerciseTypeIds: ['multiplication', 'multiplicationMissingFactor', 'primeFactorisation'],
  },
  {
    id: 'fractions',
    nameKey: 'discipline.fractions.name',
    exerciseTypeIds: ['simplifyFraction', 'additionFraction', 'subtractionFraction'],
  },
];
