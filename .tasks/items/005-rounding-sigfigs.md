---
id: '005'
title: 'Design rounding to significant digits exercise'
status: 'review'
assignee: null
priority: 'medium'
created: '2026-07-13'
updated: '2026-07-13'
depends_on: []
needs_guidance: false
tags: ['new-exercise']
---

# Design rounding to significant digits exercise

## Description

Design an exercise about rounding to a given number of significant digits.

## Acceptance Criteria

### Definition

- The exercise presents a number embedded in a LaTeX prompt and asks the student to round it to a specified number of significant digits (sigfigs).
- Example: `\text{Round } 3.14159 \text{ to } 3 \text{ significant digits.}` → correct answer: `3.14`
- The number of significant digits to round to is explicitly stated in the prompt. The prompt is rendered entirely in LaTeX via `<Math>`.

### Generator: `src/lib/exercises/roundingSigfigs.ts`

- Export `generateRoundingSigfigs(seed: number, complexity: number): Exercise`
- Use `clampComplexity(complexity, 10)` and `mulberry32(seed)`.
- Prompt format: `\text{Round } <number> \text{ to } <n> \text{ significant digits.}`

### Complexity Scaling (1–10)

- **Levels 1–2**: Simple decimals with 2–3 decimal places (e.g., 3.14, 2.718). Round to 1–2 sigfigs. No trailing-zero complexity.
- **Levels 3–4**: Larger integers (e.g., 1234, 5678). Round to 1–3 sigfigs. Answer may have trailing zeros in the integer part (e.g., 1234 to 2 sigfigs → 1200).
- **Levels 5–6**: Very small numbers with leading zeros (e.g., 0.003456). Round to 2–3 sigfigs.
- **Levels 7–8**: Numbers with internal zeros (e.g., 1002, 300.56). Round to 2–4 sigfigs. Tests whether students preserve zeros that are significant.
- **Levels 9–10**: Large numbers (e.g., 123456789) and rollover scenarios (e.g., 99.9 to 1 sigfig → 100; 999 to 2 sigfigs → 1000). Round to 2–4 sigfigs.

### Validation

- Use `trimCompare` (default) — exact string match of trimmed user input against the generator's answer.
- The answer string must preserve trailing zeros after a decimal point (e.g., `"1.00"`) and trailing zeros in integers (e.g., `"1200"`).
- The generator's answer is always the correctly rounded string representation.

### Component

- Reuse `TextInputExercise` — single text input for the rounded number. No custom component needed.

### i18n Keys

- `exercise.roundingSigfigs.name` → "Significant digits" / "Signifikante Stellen"
- `exercise.roundingSigfigs.desc` → "Round numbers to a given number of significant digits." / "Zahlen auf eine bestimmte Anzahl signifikanter Stellen runden."
- No `promptKey` needed — full instruction is embedded in the LaTeX prompt.

### Discipline

- Add `'roundingSigfigs'` to the `numbers` discipline array in `src/lib/data/disciplines.ts`.

### Registration

- Register in `src/lib/data/exerciseTypes.ts` using `defineExerciseType({ id: 'roundingSigfigs', generate: generateRoundingSigfigs })`. Uses default validate (`trimCompare`), default component (`TextInputExercise`), maxComplexity: 10.

### Edge Cases

- **Zero**: Rounding 0 to any number of sigfigs produces `"0"`.
- **Rollover**: Rounding 99.9 to 1 sigfig produces `"100"`; 999 to 2 sigfigs produces `"1000"`.
- **Internal zeros**: Rounding 1002 to 2 sigfigs produces `"1000"` (zeros kept as placeholders).
- **Trailing decimal zeros**: Rounding 1.005 to 3 sigfigs produces `"1.00"`.

## Progress

- [x] Created `src/lib/exercises/roundingSigfigs.ts` — generator with `roundToSigFigs()` and `generateRoundingSigfigs()`
- [x] Created `src/lib/exercises/roundingSigfigs.test.ts` — 14 tests covering edge cases, determinism, seed variation, and all complexity levels
- [x] Registered in `src/lib/data/exerciseTypes.ts` as `roundingSigfigs` via `defineExerciseType`
- [x] Added `'roundingSigfigs'` to `numbers` discipline in `src/lib/data/disciplines.ts`
- [x] Added i18n keys in `src/lib/i18n.svelte.ts`
- [x] Typecheck (`npm run check`): 0 errors
- [x] Lint (`npm run lint`): 0 errors
- [x] All 14 new tests pass

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
