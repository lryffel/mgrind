# Tier5 — Smaller cleanups

## Goal

Misc low-risk maintainability fixes that don't depend on the larger structural tiers.
Each item is independent; do them in any order.

## Items

### 5.1 Shared localStorage persistence helper

- `src/lib/progress.svelte.ts:7-27` (`persist`/`initProgress`), `src/lib/disabledTypes.svelte.ts:7-27` (`persist`/`initDisabledTypes`),
  and the inline `localStorage.setItem('mgrind-lang', l)` + read in `src/lib/i18n.svelte.ts:139-157` all repeat the same
  try/catch localStorage pattern.
- Create `src/lib/storage.ts` exporting `createStoredState<T>(key: string, parse: (raw: string) => T)` (or a `loadStored(key)/saveStored(key, value)` pair).
- Refactor the three modules to use it. Keep behavior identical (keys `mgrind-progress`, `mgrind-disabled`, `mgrind-lang` unchanged).

### 5.2 Stop regex-parsing the LaTeX prompt

- `SubtractionFraction.svelte:23`, `MultiplicationFraction.svelte:23`, `BinaryFractionExercise.svelte:23` recover operands via
  `exercise.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} …/)`. Fragile (depends on exact LaTeX spacing).
- Generators already compute `num1/den1` & `num2/den2` but store only `{ op, promptKey }` in `data`
  (`subtractionFraction.ts:94`, `multiplicationFraction.ts:90`, `additionFraction.ts:58`).
- Change those generators to also store `data: { num1, den1, num2, den2, op, promptKey }`.
- Update the three components to read `exercise.data.num1` etc. directly instead of regex.

### 5.3 Share fraction sign-normalization

- `SubtractionFraction.svelte:34-37` (`hasNegativeDenominator` / `normalizedWarningLatex`) re-implements the same sign-flip
  as `validateSubtractionFraction` (`src/lib/data/exerciseTypes.ts:35-47`).
- After Tier 2 creates the shared `validateFractionAnswer`/normalizer, have both the validator and this component consume one
  `normalizeFraction(num, den)` helper (put it in `src/lib/math/fraction.ts`).

### 5.4 Fix `Exercise.fields` vs `data?.fields` doc mismatch

- `AGENTS.md:29` documents `Exercise.fields` (multi-input answer mode), but no component uses `Exercise.fields`.
  All read `exercise.data?.fields` (`BinomialFormulas.svelte:19`, `CollectingTerms.svelte:19`, `FactoringBinomialFormulas.svelte:19-20`).
- Decide one representation (recommend: keep `data.fields` and update `AGENTS.md` to match the implementation), and align
  `src/lib/types.ts` + `AGENTS.md`. See also Tier 3 for typing `data`.

### 5.5 Remove dead/redundant reset effect

- `FactoringBinomialFormulas.svelte:51-56` has an `$effect` clearing `aVal/bVal/selectedFormula` on exercise change.
  `ExerciseScreen.svelte:34` already remounts via `{#key s.currentSeed}`, so this effect is redundant.
- Remove it. Note the latent risk it reveals: the other 10 components have NO reset logic and rely entirely on the remount.
  After Tier 4 (ExerciseShell owns reset), this becomes moot; until then, simply delete the dead effect.

### 5.6 Rename `BinaryFractionExercise.svelte`

- Wired to `additionFraction` (`exerciseTypes.ts:110-118`) but the name implies binary/subtraction.
- Rename file + import to `AdditionFraction.svelte` (or similar) for clarity. Update `exerciseTypes.ts:15,117`.

### 5.7 De-duplicate `PrimeFactorisation` Next button

- `PrimeFactorisation.svelte:96` and `:103` render the Next button in BOTH feedback branches.
- Standardize on a single submit-row after the `feedback` conditional (as the other 10 components do).

### 5.8 Collapse `DisciplineCard` click/keydown handlers

- `DisciplineCard.svelte:20-38`: `handleRowClick` and `handleRowKeydown` contain identical logic.
- Merge into one `function handleRow(typeId: string, e: Event)` invoked from both `onclick` and `onkeydown`.

## Out of scope

- Tier 1 (math utils), Tier 2 (validation), Tier 3 (typed contract), Tier 4 (UI shell). Items 5.3/5.4 reference those but should
  only be completed where they don't conflict; coordinate with Tier 2/3 if running together.

## Verification

- `npm run check`, `npm run test`, `npm run lint` after each item.
- For 5.2: confirm the three fraction components still render correct operands in `npm run dev`.
- For 5.5/5.7: no behavior change in feedback flow.
