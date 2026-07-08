import type { Discipline } from './types';
import { loadStored, saveStored } from './storage';

const STORAGE_KEY = 'mgrind-disabled';

export const disabledTypes = $state<Record<string, boolean>>({});

export function initDisabledTypes() {
  const stored = loadStored<Record<string, boolean>>(STORAGE_KEY);
  if (stored) {
    for (const key in stored) {
      disabledTypes[key] = stored[key];
    }
  }
}

export function isDisabled(typeId: string): boolean {
  return disabledTypes[typeId] ?? false;
}

export function toggleDisabled(typeId: string, discipline: Discipline): boolean {
  const currentlyDisabled = disabledTypes[typeId] ?? false;
  if (!currentlyDisabled) {
    const enabledCount = discipline.exerciseTypeIds.filter((id) => !(disabledTypes[id] ?? false)).length;
    if (enabledCount <= 1) {
      return false;
    }
  }
  disabledTypes[typeId] = !currentlyDisabled;
  saveStored(STORAGE_KEY, disabledTypes);
  return true;
}

export function enableType(typeId: string) {
  disabledTypes[typeId] = false;
  saveStored(STORAGE_KEY, disabledTypes);
}

export function getEnabledTypeIds(discipline: Discipline): string[] {
  return discipline.exerciseTypeIds.filter((id) => !(disabledTypes[id] ?? false));
}
