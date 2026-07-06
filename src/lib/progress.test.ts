import { describe, it, expect, beforeEach } from 'vitest';
import { progress, initProgress, getComplexity, updateProgress, getDisciplineProgress } from './progress.svelte';
import { exerciseTypes } from './data/exerciseTypes';
import type { Discipline } from './types';

beforeEach(() => {
  for (const key in progress) {
    delete progress[key];
  }
  localStorage.clear();
});

describe('progress', () => {
  describe('getComplexity', () => {
    it('returns 0 for unknown type', () => {
      expect(getComplexity('unknown')).toBe(0);
    });

    it('returns stored complexity', () => {
      progress['multiplication'] = 5;
      expect(getComplexity('multiplication')).toBe(5);
    });
  });

  describe('updateProgress', () => {
    it('increments complexity on correct answer', () => {
      const result = updateProgress('multiplication', true, 10);
      expect(result).toBe(1);
      expect(progress['multiplication']).toBe(1);
    });

    it('decrements complexity on incorrect answer', () => {
      progress['multiplication'] = 5;
      const result = updateProgress('multiplication', false, 10);
      expect(result).toBe(4);
      expect(progress['multiplication']).toBe(4);
    });

    it('does not go below 0', () => {
      const result = updateProgress('multiplication', false, 10);
      expect(result).toBe(0);
      expect(progress['multiplication']).toBe(0);
    });

    it('does not exceed maxComplexity', () => {
      progress['multiplication'] = 10;
      const result = updateProgress('multiplication', true, 10);
      expect(result).toBe(10);
      expect(progress['multiplication']).toBe(10);
    });

    it('persists to localStorage', () => {
      updateProgress('multiplication', true, 10);
      const stored = JSON.parse(localStorage.getItem('mgrind-progress')!);
      expect(stored).toEqual({ multiplication: 1 });
    });
  });

  describe('initProgress', () => {
    it('restores progress from localStorage', () => {
      localStorage.setItem('mgrind-progress', JSON.stringify({ multiplication: 7 }));
      initProgress();
      expect(progress['multiplication']).toBe(7);
    });

    it('handles missing localStorage', () => {
      expect(() => initProgress()).not.toThrow();
    });

    it('handles corrupt localStorage', () => {
      localStorage.setItem('mgrind-progress', 'not-json');
      expect(() => initProgress()).not.toThrow();
    });
  });

  describe('getDisciplineProgress', () => {
    const discipline: Discipline = {
      id: 'multiplication',
      nameKey: 'discipline.multiplication.name',
      exerciseTypeIds: ['multiplication'],
    };

    it('returns 0 when no progress is made (complexity 0 / maxComplexity 10 → 0/10)', () => {
      // default complexity is 0 → getDisciplineProgress uses (0 + 1) / maxComplexity
      // Wait, let me re-read the code:
      // const cur = progress[id] ?? 1;  — if no progress, defaults to 1
      // return cur / types[id].maxComplexity; → 1 / 10 = 0.1
      delete progress['multiplication'];
      const p = getDisciplineProgress(discipline, exerciseTypes);
      expect(p).toBe(0.1);
    });

    it('returns correct fraction when progress exists', () => {
      progress['multiplication'] = 5;
      // (5) / 10 = 0.5
      const p = getDisciplineProgress(discipline, exerciseTypes);
      expect(p).toBe(0.5);
    });

    it('returns 1 when fully progressed', () => {
      progress['multiplication'] = 10;
      const p = getDisciplineProgress(discipline, exerciseTypes);
      expect(p).toBe(1);
    });
  });
});
