# Code structure

## Overview

Plain Vite + Svelte 5 (not SvelteKit). Two-screen SPA routed by a `$state` variable in `App.svelte`: `'menu'` and `'exercise'`.

## Entry

| File         | Role                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `main.ts`    | Calls `initLang()`, `initProgress()`, mounts `App`                   |
| `App.svelte` | Screen routing; passes `disciplineId` / `onBack` to `ExerciseScreen` |
| `app.css`    | Global styles + utility classes (`.exercise-card`, `.feedback`, etc) |

## Types (`src/lib/types.ts`)

`Exercise`, `ExerciseData`, `ExerciseType`, `Discipline`, `Lang`, `Prerequisite`.
Also typed `ExerciseProps`, `ExerciseFeedback`, and `ExerciseComponent = Component<ExerciseProps>` used by all exercise screens.

## Shared utilities

| File                          | Role                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `src/lib/math/number.ts`      | `gcd`, `lcm`, `areCoprime`, `randomCoprimePair`                    |
| `src/lib/math/fraction.ts`    | `Fraction`, `reduceFrac`, `parseFrac`, `fracEqual`, `normalizeFraction` |
| `src/lib/math/rng.ts`         | `randInt`, `pick`, `shuffle`, `randCoeff`, `pickExclude`, `pickDistinct` |
| `src/lib/validation.ts`       | `trimCompare`, `validateFractionAnswer` — shared validators        |
| `src/lib/storage.ts`          | `loadStored` / `saveStored` — type-safe localStorage helpers       |

## Domain data

| File                            | Role                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| `src/lib/data/disciplines.ts`   | `Discipline[]` — each has `id`, `nameKey`, `exerciseTypeIds[]` |
| `src/lib/data/exerciseTypes.ts` | `Record<string, ExerciseType>` — registry; add new types here  |

## Exercise generators (`src/lib/exercises/`)

One file per type. Uses `mulberry32` from `src/lib/prng.ts` and helper functions from `src/lib/math/`.

## Exercise session (`src/lib/exerciseSession.svelte.ts`)

`ExerciseSession` class — owns the current exercise, seed, type, and feedback state.
- `next()` — randomly picks an enabled/prerequisite-met type from the current discipline and generates a new exercise
- `submit(answer)` — validates and updates progress

## Persisted state modules (`.svelte.ts`)

| File                              | Key                | Role                                          |
| --------------------------------- | ------------------ | --------------------------------------------- |
| `src/lib/progress.svelte.ts`      | `mgrind-progress`  | Complexity level per exercise type            |
| `src/lib/disabledTypes.svelte.ts` | `mgrind-disabled`  | Which exercise types the user has disabled    |
| `src/lib/prerequisites.svelte.ts` | —                  | Checks/enables prerequisite requirements      |
| `src/lib/i18n.svelte.ts`          | `mgrind-lang`      | `_(key)` translation; `setLang()` / `initLang()` |

## Components (`src/lib/components/`)

### Global shell

| Component               | Role                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `DisciplineCard.svelte` | Menu card: name, progress bar, percentage, type enable/disable panel |
| `ExerciseScreen.svelte` | Exercise flow: top-bar with back + progress, renders current exercise component |
| `ExerciseShell.svelte`  | Shared exercise wrapper: card layout, focus management, Enter key, submit/next buttons |
| `Feedback.svelte`       | Renders correct/incorrect feedback (text or LaTeX)                   |

### Utility

| Component               | Role                                                |
| ----------------------- | --------------------------------------------------- |
| `Math.svelte`           | Renders LaTeX via KaTeX (`{@html renderMath(expr)}`) |
| `FractionInput.svelte`  | Two stacked `<input>`s for numerator/denominator    |
| `Modal.svelte`          | Generic modal with close + footer slot              |
| `ConfirmModal.svelte`   | Confirmation dialog (reset progress)                |
| `LanguageToggle.svelte` | Switches en/de                                      |
| `ThemeToggle.svelte`    | Switches light/dark theme, persisted in localStorage|
| `SettingsDropdown.svelte` | Settings menu (reset progress)                    |

### Exercise screens (`exercises/`)

Each exercise type has a corresponding Svelte component under `exercises/`. All receive `ExerciseProps` and render through `<ExerciseShell>`:

| Component                     | Exercise type(s)                     |
| ----------------------------- | ------------------------------------ |
| `TextInputExercise.svelte`    | multiplication, division, squares, orderOfOperations, scientificNotation |
| `PrimeFactorisation.svelte`   | primeFactorisation                   |
| `SimplifyFraction.svelte`     | simplifyFraction                     |
| `AdditionFraction.svelte`     | additionFraction                     |
| `SubtractionFraction.svelte`  | subtractionFraction                  |
| `MultiplicationFraction.svelte` | multiplicationFraction            |
| `SubstitutionExercise.svelte` | substitution                         |
| `BinomialFormulas.svelte`     | binomialFormulas                     |
| `CollectingTerms.svelte`      | collectingTerms                      |
| `FactoringBinomialFormulas.svelte` | factoringBinomialFormulas       |

## Routing

`App.svelte` uses `let screen = $state<'menu' | 'exercise'>('menu')` with `#if` blocks. No router library.
