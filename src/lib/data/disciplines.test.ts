import { describe, it, expect } from 'vitest';
import { disciplines } from './disciplines';
import { exerciseTypes } from './exerciseTypes';

describe('disciplines', () => {
  it('exports an array', () => {
    expect(Array.isArray(disciplines)).toBe(true);
  });

  it('has at least one discipline', () => {
    expect(disciplines.length).toBeGreaterThan(0);
  });

  it('has required fields on each discipline', () => {
    for (const d of disciplines) {
      expect(d.id).toBeTruthy();
      expect(d.nameKey).toBeTruthy();
      expect(Array.isArray(d.exerciseTypeIds)).toBe(true);
      expect(d.exerciseTypeIds.length).toBeGreaterThan(0);
    }
  });

  it('references only registered exercise types', () => {
    for (const d of disciplines) {
      for (const typeId of d.exerciseTypeIds) {
        expect(exerciseTypes[typeId]).toBeDefined();
      }
    }
  });

  it('has unique discipline IDs', () => {
    const ids = disciplines.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
