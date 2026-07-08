# Tier3 — Typed exercise component contract

## Goal
Give the exercise component props a single, type-checked contract so `ExerciseScreen`
can no longer pass props unchecked, and remove the 11× duplicated prop-type block.
Also make `Exercise.data` typed to kill the `as any` / `as {…}` casts.

Depends conceptually on Tier 1/2 but is independent to implement.

## Context

- `src/lib/types.ts:2`: `export type ExerciseComponent = (...args: any[]) => any;`
  → `src/lib/components/ExerciseScreen.svelte:36` calls `<Comp exercise=… onSubmit=… onNext=… feedback=… />`
  with **no compile-time checking** of props. A missing/renamed prop is invisible to `tsc`.
- Every one of the 11 exercise components duplicates the identical props+type block, e.g.:
  - `src/lib/components/exercises/SubtractionFraction.svelte:7-17`
  - `src/lib/components/exercises/BinomialFormulas.svelte:7-17`
  - `TextInputExercise.svelte:6-16`, `PrimeFactorisation.svelte:7-17`, `SimplifyFraction.svelte:7-17`,
    `BinaryFractionExercise.svelte:7-17`, `MultiplicationFraction.svelte:7-17`, `SubstitutionExercise.svelte:6-16`,
    `CollectingTerms.svelte:7-17`, `ScientificNotationExercise.svelte:6-16`, `FactoringBinomialFormulas.svelte:7-17`
- `feedback: 'correct' | 'incorrect' | null` is hand-duplicated in all 11; a third state would require editing every file.
- `src/lib/types.ts:7`: `data?: Record<string, unknown>` forces casts:
  - `(exercise.data?.fields as { variablePart: string }[])` — `BinomialFormulas.svelte:19`, `CollectingTerms.svelte:19`
  - `(exercise.data?.fields as ...)` — `FactoringBinomialFormulas.svelte:19-20`
  - `(exercise as any).data?.primes` — `PrimeFactorisation.svelte:19`
  - `SubstitutionExercise.svelte:23-26`

## Steps

1. **`src/lib/types.ts`**
   - Add `export type ExerciseFeedback = 'correct' | 'incorrect' | null;`
   - Add `export interface ExerciseProps { exercise: Exercise; onSubmit: (answer: string) => void; onNext: () => void; feedback: ExerciseFeedback; }`
   - Change `ExerciseComponent` from `(...args: any[]) => any` to `import type { Component } from 'svelte';` then
     `export type ExerciseComponent = Component<ExerciseProps>;`
     (Svelte 5 exports `Component` — confirm import path; if needed use `svelte`'s `Component` type).
   - Make `Exercise.data` typed. Options (pick the less invasive):
     - (a) Discriminated union keyed by `ExerciseType.id`, or
     - (b) Per-type `data` interfaces plus a typed accessor `getExerciseData(exercise, typeId)` returning the right shape.
     At minimum, replace `Record<string, unknown>` with a concrete `ExerciseData` type covering the fields actually used
     (`fields: { variablePart: string }[]`, `primes`, `op`, `promptKey`, etc.). Keep `data?` optional.

2. **`src/lib/components/ExerciseScreen.svelte:36`**
   - Pass props; with the typed `ExerciseComponent`, `svelte-check` now validates `<Comp … />` against `ExerciseProps`.
   - (No logic change.) If `Component<ExerciseProps>` typing of the `Comp` variable is awkward in the `{@const Comp = …}` context,
     type `currentType.component` as `ExerciseComponent` and let the template check.

3. **All 11 exercise components**
   - Replace the duplicated props block with: `let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();`
     (import `ExerciseProps` from `../../types` — adjust relative path per file).
   - Remove duplicate `feedback` union literals.
   - Replace `as any` / `as {…}` casts on `exercise.data` with typed access per the new `ExerciseData` type.

## Out of scope
- Extracting the shared shell/feedback UI (Tier 4). This tier only types the existing contract; it does NOT remove the
  repeated submit/keydown/focus boilerplate (that is Tier 4's job).
- Validation semantics (Tier 2).

## Verification
- `npm run check` — must pass with the new `ExerciseProps` contract; confirm `ExerciseScreen.svelte:36` is now type-checked.
- `npm run test` and `npm run lint`.
- Grep: no remaining `(exercise as any)`, no local `feedback: 'correct' | 'incorrect' | null` redeclarations in components.
