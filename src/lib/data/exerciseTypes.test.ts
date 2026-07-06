import { describe, it, expect } from 'vitest';
import { exerciseTypes } from './exerciseTypes';

describe('exerciseTypes', () => {
  it('registers multiplication exercise', () => {
    expect(exerciseTypes['multiplication']).toBeDefined();
  });

  it('has required fields', () => {
    for (const [id, type] of Object.entries(exerciseTypes)) {
      expect(type.id).toBe(id);
      expect(type.nameKey).toBeTruthy();
      expect(type.descriptionKey).toBeTruthy();
      expect(type.maxComplexity).toBeGreaterThan(0);
      expect(typeof type.generate).toBe('function');
      expect(typeof type.validate).toBe('function');
    }
  });

  describe('validate', () => {
    it('accepts the correct answer', () => {
      const type = exerciseTypes['multiplication'];
      const ex = type.generate(42, 0);
      expect(type.validate(ex.answer, ex)).toBe(true);
    });

    it('rejects wrong answer', () => {
      const type = exerciseTypes['multiplication'];
      const ex = type.generate(42, 0);
      expect(type.validate('999', ex)).toBe(false);
    });

    it('trims whitespace from submitted answer', () => {
      const type = exerciseTypes['multiplication'];
      const ex = type.generate(42, 0);
      expect(type.validate('  ' + ex.answer + '  ', ex)).toBe(true);
    });
  });
});
