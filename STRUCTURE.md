# Code structure

## Overview

Plain Vite + Svelte 5 (not SvelteKit). Two-screen SPA routed by a `$state` variable in `App.svelte`: `'menu'` and `'exercise'`.

## Entry

| File | Role |
|---|---|
| `main.ts` | Calls `initLang()`, `initProgress()`, mounts `App` |
| `App.svelte` | Screen routing; passes `disciplineId` / `onBack` to `ExerciseScreen` |
| `app.css` | Global styles |

## Types (`src/lib/types.ts`)

`Exercise`, `ExerciseType`, `Discipline`, `Lang`. Exercise types expose `generate(seed, complexity)` and `validate(answer, exercise)`.

## Data

| File | Role |
|---|---|
| `src/lib/data/disciplines.ts` | `Discipline[]` — each has `id`, `nameKey`, `exerciseTypeIds[]` |
| `src/lib/data/exerciseTypes.ts` | `Record<string, ExerciseType>` — registry; add new types here |

## Exercise generators (`src/lib/exercises/`)

One file per type. Uses `mulberry32` from `src/lib/prng.ts`.

## Exercise selection (`src/lib/exerciseSelection.ts`)

`pickExerciseTypeId(disciplineId)` — picks a random type from the discipline's list.

## Progress (`src/lib/progress.svelte.ts`)

Reactive `$state` record keyed by exercise type ID → complexity level.

- `getComplexity(typeId)` — current level
- `updateProgress(typeId, correct, maxComplexity)` — up on correct, down on wrong
- `getDisciplineProgress(discipline, exerciseTypes)` — avg of (level / max) across all types in the discipline
- Persisted to `localStorage` under `mgrind-progress`

## i18n (`src/lib/i18n.svelte.ts`)

`_(key)` returns translated string. Language persisted in `localStorage` under `mgrind-lang`.

## Components (`src/lib/components/`)

| Component | Role |
|---|---|
| `DisciplineCard.svelte` | Menu card: name, progress bar, percentage |
| `ExerciseScreen.svelte` | Exercise flow: prompt, input, submit, feedback, top-bar with back + progress |
| `ProgressBar.svelte` | Pure visual bar — `value` (0–1) → width |
| `LanguageToggle.svelte` | Switches en/de |

## Routing

`App.svelte` uses `let screen = $state<'menu' | 'exercise'>('menu')` with `#if` blocks. No router library.
