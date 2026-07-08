import type { Discipline, ExerciseType } from './types';
import { loadStored, saveStored } from './storage';

const STORAGE_KEY = 'mgrind-progress';

export const progress = $state<Record<string, number>>({});

export function initProgress() {
  const stored = loadStored<Record<string, number>>(STORAGE_KEY);
  if (stored) {
    for (const key in stored) {
      progress[key] = stored[key];
    }
  }
}

export function getComplexity(typeId: string): number {
  return progress[typeId] ?? 0;
}

export function updateProgress(typeId: string, correct: boolean, maxComplexity: number): number {
  let current = progress[typeId] ?? 0;
  if (correct) {
    current = Math.min(current + 1, maxComplexity);
  } else {
    current = Math.max(current - 1, 0);
  }
  progress[typeId] = current;
  saveStored(STORAGE_KEY, progress);
  return current;
}

export function resetProgress() {
  for (const key in progress) {
    progress[key] = 0;
  }
  saveStored(STORAGE_KEY, progress);
}

export function getDisciplineProgress(discipline: Discipline, types: Record<string, ExerciseType>): number {
  const vals = discipline.exerciseTypeIds.map((id) => {
    const cur = progress[id] ?? 0;
    return cur / types[id].maxComplexity;
  });
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
