import type { Discipline, ExerciseType } from './types';

const STORAGE_KEY = 'mgrind-progress';

export const progress = $state<Record<string, number>>({});

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

export function initProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const key in parsed) {
        progress[key] = parsed[key];
      }
    }
  } catch { /* ignore */ }
}

export function getComplexity(typeId: string): number {
  return progress[typeId] ?? 1;
}

export function updateProgress(typeId: string, correct: boolean, maxComplexity: number): number {
  let current = progress[typeId] ?? 1;
  if (correct) {
    current = Math.min(current + 1, maxComplexity);
  } else {
    current = Math.max(current - 1, 1);
  }
  progress[typeId] = current;
  persist();
  return current;
}

export function getDisciplineProgress(discipline: Discipline, types: Record<string, ExerciseType>): number {
  const vals = discipline.exerciseTypeIds.map(id => {
    const cur = progress[id] ?? 1;
    return cur / types[id].maxComplexity;
  });
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
