import { expect } from 'vitest';

type Generator<T> = (seed: number, complexity: number) => T;

export function expectDeterministic<T>(gen: Generator<T>, seed: number, complexity: number) {
  const a = gen(seed, complexity);
  const b = gen(seed, complexity);
  expect(a).toEqual(b);
}

export function expectSeedVariation<T>(gen: Generator<T>, complexity: number, minSeeds = 50) {
  const seen = new Set<string>();
  for (let seed = 0; seed < minSeeds; seed++) {
    const ex = gen(seed, complexity);
    seen.add(JSON.stringify(ex));
  }
  expect(seen.size).toBeGreaterThan(1);
}

export function expectHasPromptAndAnswer<T extends { prompt: string; answer: string }>(
  gen: Generator<T>,
  seed: number,
  complexity: number,
) {
  const ex = gen(seed, complexity);
  expect(ex).toHaveProperty('prompt');
  expect(ex).toHaveProperty('answer');
  expect(typeof ex.prompt).toBe('string');
  expect(typeof ex.answer).toBe('string');
}
