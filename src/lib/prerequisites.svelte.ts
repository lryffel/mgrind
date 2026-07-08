import type { Prerequisite } from './types';
import { exerciseTypes } from './data/exerciseTypes';
import { getComplexity, progress } from './progress.svelte';
import { saveStored } from './storage';

export interface UnmetPrerequisite extends Prerequisite {
  nameKey: string;
  current: number;
}

export function getPrerequisites(typeId: string): Prerequisite[] {
  return exerciseTypes[typeId]?.prerequisites ?? [];
}

export function arePrerequisitesMet(typeId: string): boolean {
  const prereqs = getPrerequisites(typeId);
  return prereqs.every((p) => getComplexity(p.typeId) >= p.complexity);
}

export function getUnmetPrerequisites(typeId: string): UnmetPrerequisite[] {
  const prereqs = getPrerequisites(typeId);
  const result: UnmetPrerequisite[] = [];
  for (const p of prereqs) {
    const current = getComplexity(p.typeId);
    if (current < p.complexity) {
      result.push({ ...p, nameKey: exerciseTypes[p.typeId].nameKey, current });
    }
  }
  return result;
}

export function enablePrerequisites(typeId: string) {
  const prereqs = getPrerequisites(typeId);
  for (const p of prereqs) {
    const current = progress[p.typeId] ?? 0;
    if (current < p.complexity) {
      progress[p.typeId] = p.complexity;
    }
  }
  saveStored('mgrind-progress', progress);
}
