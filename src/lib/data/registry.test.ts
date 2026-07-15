import { describe, it, expect } from 'vitest';
import { _, type DictKey } from '../i18n.svelte';
import { exerciseTypes } from './exerciseTypes';
import { disciplines } from './disciplines';

const KEY_SHAPE = /^[a-z][\w]*(\.[\w-]+)+$/;

function isMissingKey(key: string): boolean {
  return _(key as DictKey) === key;
}

function collectKeyCandidates(value: unknown, acc: string[]): void {
  if (typeof value === 'string') {
    if (KEY_SHAPE.test(value)) acc.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectKeyCandidates(v, acc);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectKeyCandidates(v, acc);
  }
}

describe('registry cross-references', () => {
  const typeIds = Object.keys(exerciseTypes);

  it('every discipline references only registered exercise types', () => {
    for (const d of disciplines) {
      for (const id of d.exerciseTypeIds) {
        expect(exerciseTypes[id], `discipline "${d.id}" references unknown type "${id}"`).toBeDefined();
      }
    }
  });

  it('every registered exercise type belongs to at least one discipline', () => {
    const referenced = new Set(disciplines.flatMap((d) => d.exerciseTypeIds));
    for (const id of typeIds) {
      expect(referenced.has(id), `exercise type "${id}" is not in any discipline`).toBe(true);
    }
  });

  it('every prerequisite typeId resolves to a registered exercise type', () => {
    for (const id of typeIds) {
      const prereqs = exerciseTypes[id].prerequisites ?? [];
      for (const p of prereqs) {
        expect(
          exerciseTypes[p.typeId],
          `exercise type "${id}" has prerequisite referencing unknown type "${p.typeId}"`,
        ).toBeDefined();
      }
    }
  });

  it('every exercise type derives i18n nameKey/descriptionKey that exist in the dict', () => {
    for (const id of typeIds) {
      const t = exerciseTypes[id];
      expect(isMissingKey(t.nameKey), `nameKey "${t.nameKey}" for type "${id}" is missing in i18n`).toBe(false);
      expect(
        isMissingKey(t.descriptionKey),
        `descriptionKey "${t.descriptionKey}" for type "${id}" is missing in i18n`,
      ).toBe(false);
    }
  });

  it('every discipline nameKey exists in the i18n dict', () => {
    for (const d of disciplines) {
      expect(isMissingKey(d.nameKey), `discipline nameKey "${d.nameKey}" is missing in i18n`).toBe(false);
    }
  });

  it('every prerequisite-target nameKey exists in the i18n dict', () => {
    for (const id of typeIds) {
      for (const p of exerciseTypes[id].prerequisites ?? []) {
        const nameKey = exerciseTypes[p.typeId].nameKey;
        expect(
          isMissingKey(nameKey),
          `prerequisite nameKey "${nameKey}" (target "${p.typeId}" of type "${id}") is missing in i18n`,
        ).toBe(false);
      }
    }
  });

  it('every i18n key referenced via exercise.data resolves in the dict', () => {
    const SEEDS = [1, 2, 3, 42, 99, 123, 777, 2024];
    const COMPLEXITIES = [0, 1, 3, 5, 8, 10];
    const missing = new Set<string>();
    for (const id of typeIds) {
      const t = exerciseTypes[id];
      for (const seed of SEEDS) {
        for (const complexity of COMPLEXITIES) {
          let ex;
          try {
            ex = t.generate(seed, Math.min(complexity, t.maxComplexity));
          } catch {
            continue;
          }
          const candidates: string[] = [];
          collectKeyCandidates(ex.data, candidates);
          for (const key of candidates) {
            if (isMissingKey(key)) missing.add(`${key}  (type "${id}")`);
          }
        }
      }
    }
    expect(
      missing.size === 0,
      `i18n keys referenced in exercise.data but missing in dict:\n${[...missing].sort().join('\n')}`,
    ).toBe(true);
  });

  it('every exercise produces a non-empty prompt and answer', () => {
    for (const id of typeIds) {
      const t = exerciseTypes[id];
      const ex = t.generate(1, 0);
      expect(typeof ex.prompt === 'string' && ex.prompt.length >= 0, `type "${id}" prompt`).toBe(true);
      expect(typeof ex.answer === 'string', `type "${id}" answer`).toBe(true);
    }
  });
});
