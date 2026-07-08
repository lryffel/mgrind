import type { Discipline } from './types';

const STORAGE_KEY = 'mgrind-disabled';

export const disabledTypes = $state<Record<string, boolean>>({});

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(disabledTypes));
  } catch {
    /* ignore */
  }
}

export function initDisabledTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const key in parsed) {
        disabledTypes[key] = parsed[key];
      }
    }
  } catch {
    /* ignore */
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
  persist();
  return true;
}

export function enableType(typeId: string) {
  disabledTypes[typeId] = false;
  persist();
}

export function getEnabledTypeIds(discipline: Discipline): string[] {
  return discipline.exerciseTypeIds.filter((id) => !(disabledTypes[id] ?? false));
}
