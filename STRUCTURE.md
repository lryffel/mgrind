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

`Exercise`, `CardPattern`, `ExerciseType`, `Discipline`, `Lang`, `Prerequisite`.
Also typed `ExerciseProps`, `ExerciseFeedback`.

`CardPattern` is a closed union type:

```
'text-input' | 'fraction-input' | 'multi-field' | 'batch-choice' | 'single-choice' | 'multi-choice' | 'prime-factors' | 'custom'
```

Generators set `exercise.pattern` to select which generic card template renders the exercise. `'custom'` types need a component in `src/lib/components/exercises/`.

`Exercise.data` is typed `unknown` — consumers cast to the per-type interface.

## Shared utilities

| File                       | Role                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `src/lib/math/number.ts`   | `gcd`, `areCoprime`, `randomCoprimePair`, `bumpPastThreshold`                                 |
| `src/lib/math/fraction.ts` | `Fraction`, `reduceFrac`, `parseFrac`, `fracEqual`, `normalizeFraction`, `niceNum`, `niceMax` |
| `src/lib/math/rng.ts`      | `randInt`, `pick`, `shuffle`, `randCoeff`, `pickExclude`, `pickDistinct`                      |
| `src/lib/katex.ts`         | `renderMath(expr)` — wraps `katex.renderToString`                                             |
| `src/lib/validation.ts`    | `trimCompare`, `validateFractionAnswer` — shared validators                                   |
| `src/lib/storage.ts`       | `loadStored` / `saveStored` — type-safe localStorage helpers                                  |

## Domain data

| File                            | Role                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| `src/lib/data/disciplines.ts`   | `Discipline[]` — each has `id`, `nameKey`, `exerciseTypeIds[]` |
| `src/lib/data/exerciseTypes.ts` | `Record<string, ExerciseType>` — registry; add new types here  |

## Exercise generators (`src/lib/exercises/`)

One file per type. Uses `mulberry32` from `src/lib/prng.ts` and helper functions from `src/lib/math/`. Each generator sets `exercise.pattern` to a `CardPattern` value.

| File                               | Role                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/exercises/termAlgebra.ts` | `Term`, `multiplyTerms`, `expandProduct`, `collectTerms` — shared by `expand.ts` / `expandAndCollect.ts` |

## Exercise session (`src/lib/exerciseSession.svelte.ts`)

`ExerciseSession` class — owns the current exercise, seed, type, and feedback state.

- `next()` — randomly picks an enabled/prerequisite-met type from the current discipline and generates a new exercise
- `submit(answer)` — validates and updates progress

## Persisted state modules (`.svelte.ts`)

| File                                   | Key               | Role                                                                          |
| -------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `src/lib/progress.svelte.ts`           | `mgrind-progress` | Complexity level per exercise type                                            |
| `src/lib/disabledTypes.svelte.ts`      | `mgrind-disabled` | Which exercise types the user has disabled                                    |
| `src/lib/prerequisites.svelte.ts`      | —                 | Checks/enables prerequisite requirements                                      |
| `src/lib/i18n.svelte.ts`               | `mgrind-lang`     | `_(key)` translation; `setLang()` / `initLang()`                              |
| `src/lib/instructionContext.svelte.ts` | —                 | Global singleton holding the current instruction component for the help modal |

## Components (`src/lib/components/`)

### Global shell

| Component               | Role                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `DisciplineCard.svelte` | Menu card: name, progress bar, percentage, type enable/disable panel                   |
| `ExerciseScreen.svelte` | Exercise flow: top-bar with back + progress, routes via `CardRegistry` or `component`  |
| `ExerciseShell.svelte`  | Shared exercise wrapper: card layout, focus management, Enter key, submit/next buttons |
| `Feedback.svelte`       | Renders correct/incorrect feedback (text or LaTeX)                                     |

### Utility

| Component                 | Role                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `Math.svelte`             | Renders LaTeX via KaTeX (`{@html renderMath(expr)}`)        |
| `NumericInput.svelte`     | Single text or stacked fraction input (via `fraction` prop) |
| `PrimeFactorInput.svelte` | Prime factorisation input row                               |
| `Modal.svelte`            | Generic modal with close + footer slot                      |
| `ConfirmModal.svelte`     | Confirmation dialog (reset progress)                        |
| `LanguageToggle.svelte`   | Switches en/de                                              |
| `ThemeToggle.svelte`      | Switches light/dark theme, persisted in localStorage        |
| `SettingsDropdown.svelte` | Settings menu (reset progress)                              |

### Card templates (`cards/`)

7 generic card templates routed by `exercise.pattern` via `CardRegistry.svelte`:

| Card                | Pattern(s)                                       |
| ------------------- | ------------------------------------------------ |
| `TextInputCard`     | `text-input` — single numeric text input         |
| `FractionInputCard` | `fraction-input` — fraction num/den input        |
| `MultiFieldCard`    | `multi-field` — multiple coefficient fields      |
| `BatchChoiceCard`   | `batch-choice` — grid of rows with button groups |
| `SingleChoiceCard`  | `single-choice` — radio group                    |
| `MultiChoiceCard`   | `multi-choice` — checkbox group                  |
| `PrimeFactorsCard`  | `prime-factors` — prime factor exponent inputs   |

### Custom exercise screens (`exercises/`)

Types with `pattern: 'custom'` have a component in `exercises/`:

| Component | Exercise type(s) |
| `FactoringBinomialFormulas.svelte` | factoringBinomialFormulas |
| `FactoringOut.svelte` | factoringOut |
| `FactoringOutAndBinomial.svelte` | factoringOutAndBinomial |
| `FactorEquations.svelte` | factorEquations |
| `LinearEquationsExercise.svelte` | linearEquations |
| `NecessityOfParentheses.svelte` | necessityOfParentheses |
| `Pythagoras.svelte` | pythagoras |
| `AreaExercise.svelte` | area |
| `InteriorAngles.svelte` | interiorAngles |
| `TermTransformationsTrivia.svelte` | termTransformationsTrivia |
| `PercentExercise.svelte` | percent |
| `RoundingSigfigsExercise.svelte` | roundingSigfigs |
| `ScientificNotationExercise.svelte` | scientificNotation |

## Routing

`App.svelte` uses `let screen = $state<'menu' | 'exercise'>('menu')` with `#if` blocks. No router library.
