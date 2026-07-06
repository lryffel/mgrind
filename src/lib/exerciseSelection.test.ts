import { describe, it, expect } from 'vitest';
import { pickExerciseTypeId } from './exerciseSelection';
import { disciplines } from './data/disciplines';

describe('exercise selection', () => {
  it('selects each exercise type in a discipline over different seeds', () => {
    const multiplication = disciplines.find((d) => d.id === 'multiplication')!;
    expect(multiplication.exerciseTypeIds.length).toBeGreaterThan(1);

    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const selectedId = pickExerciseTypeId('multiplication', seed);
      seen.add(selectedId);
    }

    for (const id of multiplication.exerciseTypeIds) {
      expect(seen.has(id)).toBe(true);
    }
  });

  it('always returns a valid exercise type id', () => {
    for (let seed = 0; seed < 100; seed++) {
      const id = pickExerciseTypeId('multiplication', seed);
      expect(['multiplication', 'multiplicationMissingFactor', 'primeFactorisation']).toContain(id);
    }
  });

  it('does not always pick the first exercise type', () => {
    const first = pickExerciseTypeId('multiplication', 0);
    const second = pickExerciseTypeId('multiplication', 1);
    expect(second).not.toBe(first);
  });
});
