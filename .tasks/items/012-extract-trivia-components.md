---
id: '012'
title: 'Extract reusable trivia UI components from FractionTrivia'
status: 'done'
assignee: null
priority: 'medium'
created: '2026-07-13'
updated: '2026-07-13'
depends_on: []
needs_guidance: false
tags: ['refactoring', 'ui']
---

# Extract reusable trivia UI components from FractionTrivia

## Description

`FractionTrivia.svelte` (855 lines) is a monolithic component with heavily duplicated patterns for radio selection, checkbox selection, and text input with inline feedback display. Before implementing Number Trivia (task 006), extract these patterns into reusable components so that NumberTrivia.svelte can use them and FractionTrivia itself gets cleaned up.

## Acceptance Criteria

1. **`TriviaRadioGroup.svelte`** — Extracted component at `src/lib/components/exercises/TriviaRadioGroup.svelte` that:
   - Accepts props: `options` (array of `{ label: string, latex?: string }`), `selectedIndex` (number), `correctIndices` (number[]), `feedback` (ExerciseFeedback | null), `onselect` (callback), `name` (string for aria)
   - Renders `.option-grid` with `role="radiogroup"`
   - When `feedback === null`: renders buttons with `.choice-radio` + `.selected` class for the active index
   - When `feedback` is present: renders spans with `.option-feedback-row` + `.correct-option`/`.wrong-option` classes
   - Options can display either a `<Math>` expression (when `latex` is provided) or plain text (when `label` is provided)

2. **`TriviaCheckboxGroup.svelte`** — Extracted component at `src/lib/components/exercises/TriviaCheckboxGroup.svelte` that:
   - Accepts props: `options` (array of `{ label: string, latex?: string }`), `selected` (boolean[]), `correctIndices` (number[]), `feedback` (ExerciseFeedback | null), `ontoggle` (callback)
   - Renders `.option-grid` with `role="group"`
   - When `feedback === null`: renders buttons with `.choice-checkbox` + `.selected` class
   - When `feedback` is present: renders spans with `.option-feedback-row` + correct/wrong classes
   - Same text/`<Math>` display support as radio group

3. **`TriviaTextInput.svelte`** — Extracted component at `src/lib/components/exercises/TriviaTextInput.svelte` that:
   - Accepts props: `value` (string), `feedback` (ExerciseFeedback | null), `placeholder` (string), `context` ("plain" | "fraction"), `label` (string for aria-label), `oninput` (callback)
   - When `feedback === null`: renders `<NumericInput>` with appropriate context
   - When `feedback` is present: renders `.user-answer` span with `<Math expression={value}>`, colored by correctness
   - Optionally renders a `<Feedback>` slot or prop for the feedback message below the input

4. **Refactor `FractionTrivia.svelte`** to use the three extracted components. No functional changes — all trivia types, prompt rendering, and answer handling must remain identical.

5. **CSS**: The `.option-grid`, `.choice-radio`, `.choice-checkbox`, `.option-feedback-row` CSS (including `::before` pseudo-elements for radio/checkbox indicators) and `.user-answer` styles live in each extracted component via `<style>` block (not scoped to FractionTrivia). The FractionTrivia component's `<style>` keeps only its non-shared styles (`.fraction-terms-input`, `.fraction-input-wrapper`, `.feedback-spacer`).

6. **i18n**: The extracted components receive display labels and aria labels as props — they do not import or call `_()` themselves.

7. **Tests**: Run `npm run test` — all existing tests pass (especially any FractionTrivia tests). No regressions.

8. **TypeScript**: Run `npm run check` — no type errors. Run `npm run lint` — no lint errors.

## Progress

- Created `TriviaRadioGroup.svelte` with `option-grid`/`.choice-radio`/`.option-feedback-row` CSS, accepts `options`, `selectedIndex`, `correctIndices`, `feedback`, `onselect`, `name` props
- Created `TriviaCheckboxGroup.svelte` with `.choice-checkbox` variants, accepts `options`, `selected`, `correctIndices`, `feedback`, `ontoggle` props
- Created `TriviaTextInput.svelte` with `.user-answer` CSS, accepts `value` (`$bindable()`), `feedback`, `placeholder`, `context` (`InputContext`), `label`, `fallback`
- Refactored `FractionTrivia.svelte` (855→611 lines):
  - `integerFractions`, `mediant`, `equalFractions`, `reducibleFractions`, `negativeSignPlacement`, `doubleFraction` MC → `TriviaCheckboxGroup`
  - `multiplySame`, `fractionBar` → `TriviaRadioGroup`
  - `denominatorRestriction`, `zeroNumerator`, `reciprocalProduct` → `TriviaTextInput`
  - Kept `fractionTerms` and `fractionDivision` inline (specialized patterns)
  - Moved CSS to components; kept only `.fraction-terms-input`, `.fraction-input-wrapper`, `.feedback-spacer`, `.frac-answer` in FractionTrivia
- `npm run check` — 0 errors
- `npm run lint` — clean
- `npm run test` — 567/568 passed (1 pre-existing failure in `factoringOutAndBinomial.test.ts`)

## Blockers

## Notes

- After extraction, NumberTrivia.svelte (task 006) should use these same components instead of duplicating the patterns.
- The `TriviaTextInput` component should handle both plain text input (like `denominatorRestriction`) and could be extended for fraction input later.
