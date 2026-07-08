import { describe, it, expect, beforeEach } from 'vitest';
import { progress } from './progress.svelte';
import {
  getPrerequisites,
  arePrerequisitesMet,
  getUnmetPrerequisites,
  enablePrerequisites,
} from './prerequisites.svelte';

beforeEach(() => {
  for (const key in progress) {
    delete progress[key];
  }
  localStorage.clear();
});

describe('prerequisites', () => {
  describe('getPrerequisites', () => {
    it('returns empty array for type with no prerequisites', () => {
      expect(getPrerequisites('multiplication')).toEqual([]);
    });

    it('returns prerequisites for primeFactorisation', () => {
      const prereqs = getPrerequisites('primeFactorisation');
      expect(prereqs).toEqual([
        { typeId: 'multiplication', complexity: 7 },
        { typeId: 'division', complexity: 7 },
      ]);
    });

    it('returns prerequisites for additionFraction', () => {
      const prereqs = getPrerequisites('additionFraction');
      expect(prereqs).toEqual([{ typeId: 'simplifyFraction', complexity: 5 }]);
    });

    it('returns empty array for unknown type', () => {
      expect(getPrerequisites('unknown')).toEqual([]);
    });
  });

  describe('arePrerequisitesMet', () => {
    it('returns true for type with no prerequisites', () => {
      expect(arePrerequisitesMet('multiplication')).toBe(true);
    });

    it('returns false when prerequisite is below required level', () => {
      progress['multiplication'] = 5;
      expect(arePrerequisitesMet('primeFactorisation')).toBe(false);
    });

    it('returns true when all prerequisites are met', () => {
      progress['multiplication'] = 7;
      progress['division'] = 8;
      expect(arePrerequisitesMet('primeFactorisation')).toBe(true);
    });

    it('returns true when prerequisite is exactly at required level', () => {
      progress['multiplication'] = 7;
      progress['division'] = 7;
      expect(arePrerequisitesMet('primeFactorisation')).toBe(true);
    });

    it('returns false when one prerequisite is met but another is not', () => {
      progress['multiplication'] = 7;
      progress['division'] = 3;
      expect(arePrerequisitesMet('primeFactorisation')).toBe(false);
    });
  });

  describe('getUnmetPrerequisites', () => {
    it('returns empty array when all prerequisites are met', () => {
      progress['multiplication'] = 7;
      progress['division'] = 7;
      expect(getUnmetPrerequisites('primeFactorisation')).toEqual([]);
    });

    it('returns unmet prerequisites with nameKey and current level', () => {
      const unmet = getUnmetPrerequisites('primeFactorisation');
      expect(unmet).toEqual([
        { typeId: 'multiplication', complexity: 7, nameKey: 'exercise.multiplication.name', current: 0 },
        {
          typeId: 'division',
          complexity: 7,
          nameKey: 'exercise.division.name',
          current: 0,
        },
      ]);
    });

    it('only includes prerequisites that are not yet met', () => {
      progress['multiplication'] = 7;
      const unmet = getUnmetPrerequisites('primeFactorisation');
      expect(unmet).toEqual([
        {
          typeId: 'division',
          complexity: 7,
          nameKey: 'exercise.division.name',
          current: 0,
        },
      ]);
    });

    it('returns empty for type with no prerequisites', () => {
      expect(getUnmetPrerequisites('multiplication')).toEqual([]);
    });
  });

  describe('enablePrerequisites', () => {
    it('bumps each prerequisite to required level', () => {
      enablePrerequisites('primeFactorisation');
      expect(progress['multiplication']).toBe(7);
      expect(progress['division']).toBe(7);
    });

    it('does not decrease a prerequisite that is already above required level', () => {
      progress['multiplication'] = 10;
      progress['division'] = 3;
      enablePrerequisites('primeFactorisation');
      expect(progress['multiplication']).toBe(10);
      expect(progress['division']).toBe(7);
    });

    it('persists to localStorage', () => {
      enablePrerequisites('primeFactorisation');
      const stored = JSON.parse(localStorage.getItem('mgrind-progress')!);
      expect(stored).toEqual({ multiplication: 7, division: 7 });
    });

    it('does nothing for type with no prerequisites', () => {
      enablePrerequisites('multiplication');
      expect(Object.keys(progress)).toHaveLength(0);
    });
  });
});
