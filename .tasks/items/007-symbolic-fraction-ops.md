---
id: '007'
title: 'Symbolic fraction operations exercise'
status: 'review'
assignee: 'agent-007'
priority: 'medium'
created: '2026-07-13'
updated: '2026-07-13'
depends_on: []
needs_guidance: false
tags: ['new-exercise']
---

# Symbolic fraction operations exercise

## Description

Make an exercise on symbolic fraction operations where users need to add, subtract and multiply fractions and handle double fractions.

## Acceptance Criteria

### Operations covered

- Addition: `\dfrac{ax}{b} + \dfrac{cx}{d}` and `\dfrac{a}{b} + \dfrac{c}{d}` (symbolic numerators/denominators)
- Subtraction: same forms as addition with `-` operator
- Multiplication: `\dfrac{ax}{b} \cdot \dfrac{cx}{d}` and `\dfrac{a}{b} \cdot \dfrac{c}{d}`
- Double fractions (complex fractions): `\dfrac{ \dfrac{a}{b} }{ \dfrac{c}{d} }` and symbolic variants where numerator/denominator are themselves fractions

### Symbolic content

- Low complexity (1–3): single variable (`x`, `y`, `a`, `b`, etc.) in monomial numerators (e.g. `(3x)/5`)
- Mid complexity (4–7): two variables, either in separate terms or as a product `ab` in numerator/denominator
- High complexity (8–10): variables with powers, monomial products (`x^2`, `ab`), combined operations

### Complexity scaling (1–10)

| Level | Content                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1–2   | Same denominator, same variable, add/subtract: `\dfrac{ax}{c} \pm \dfrac{bx}{c}`                                                  |
| 3–4   | Different denominators, same variable, add/subtract: `\dfrac{ax}{b} \pm \dfrac{cx}{d}`                                            |
| 5–6   | Multiplication with variables: `\dfrac{ax}{b} \cdot \dfrac{cx}{d}` or `\dfrac{ax}{b} \cdot \dfrac{c}{d}`; introduce two variables |
| 7–8   | Double fractions with variables, mixed add+multiply chains                                                                        |
| 9–10  | Multi-term expressions combining add/sub/multiply/double-frac with variables and powers                                           |

### Generator

- File: `src/lib/exercises/symbolicFractionOps.ts`
- Export: `function generateSymbolicFractionOps(seed: number, complexity: number): Exercise`
- Use `mulberry32(seed)` as the single RNG
- Use `clampComplexity(complexity, 10)` — max 10 levels
- Prompt is a LaTeX expression rendered via `<Math>` — no raw math symbols outside KaTeX
- Answer format: `numExpr,denExpr` where both are strings representing the simplified numerator and denominator (e.g. `23x,12` or `ad+bc,bd`)
- Use helper functions from `../math/latex.ts` (`promptFraction`) and `../math/varmap` for formatting

### Validation

- File: `src/lib/exercises/symbolicFractionOps.ts` (co-export)
- Export: `function validateSymbolicFractionOps(answer: string, exercise: Exercise): boolean`
- Split user answer and correct answer by `,` to get `[userNum, userDen]` and `[correctNum, correctDen]`
- Normalize both strings: trim whitespace, collapse internal whitespace
- For purely numeric numerator/denominator pairs: delegate to `validateFractionAnswer` (allow unreduced equivalents)
- For symbolic pairs: compare after normalisation (identical string match of the canonical form)
- Reject mismatched part counts, empty parts

### Component

- File: `src/lib/components/exercises/SymbolicFractionOps.svelte`
- Custom component (cannot reuse `FractionExercise` because `NumericInput` restricts to digits)
- Uses plain `<input>` elements for numerator and denominator (wrapped in a fraction-bar UI similar to `NumericInput`'s fraction mode)
- Accept `ExerciseProps`: `let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props()`
- Input mode (feedback === null): show prompt + `=` + fraction input (num field, fraction bar, den field)
- Feedback mode (feedback !== null): show prompt + `=` + user answer as rendered `<Math>` + `<Feedback>` with `correctLatex`
- Use `<ExerciseShell>` wrapper for submit/next/validationError
- Use `<Math>` for all rendering
- Show reduction warnings when num/den are numeric and reducible (same pattern as `FractionExercise`)

### i18n keys (in `src/lib/i18n.svelte.ts`)

| Key                                   | Purpose                                         |
| ------------------------------------- | ----------------------------------------------- |
| `exercise.symbolicFractionOps.name`   | Display name                                    |
| `exercise.symbolicFractionOps.desc`   | Short description                               |
| `exercise.symbolicFractionOps.prompt` | Imperative label (e.g. "Compute and simplify.") |

Use Swiss orthography (no "ß").

### Registration (in `src/lib/data/exerciseTypes.ts`)

```ts
symbolicFractionOps: defineExerciseType({
  id: 'symbolicFractionOps',
  nameKey: 'exercise.symbolicFractionOps.name',
  descriptionKey: 'exercise.symbolicFractionOps.desc',
  generate: generateSymbolicFractionOps,
  validate: validateSymbolicFractionOps,
  component: SymbolicFractionOps,
  instructionComponent: SymbolicFractionOpsInstructions,
  maxComplexity: 10,
  prerequisites: [
    { typeId: 'simplifyFraction', complexity: 3 },
    { typeId: 'additionFraction', complexity: 3 },
    { typeId: 'multiplicationFraction', complexity: 3 },
  ],
}),
```

### Discipline placement (in `src/lib/data/disciplines.ts`)

- Add `'symbolicFractionOps'` to discipline `'fractions'`
- Add `'symbolicFractionOps'` to discipline `'termTransformations'`

### Instructions component (optional)

- File: `src/lib/components/exerciseInstructions/SymbolicFractionOpsInstructions.svelte`
- Follow pattern from existing instruction components
- Register via `instructionComponent` in the exercise type definition

### Testing

- File: `src/lib/exercises/symbolicFractionOps.test.ts`
- Determinism: same seed + complexity produces identical output
- Variation: different seeds produce different output
- Prompt contains `\frac` or `\dfrac`
- Answer format: always `numExpr,denExpr` with at least two comma-separated parts
- At complexity 1–2: only same-denominator, same-variable, single op
- At complexity 3–4: different denominators appear
- At complexity 5–6: multiplication operations appear
- At complexity 7–8: double fractions appear
- At complexity 9–10: mixed operations appear
- Each sub-generator fires across an appropriate seed range (coverage test, similar to `simplifySymbolicFraction.test.ts`)
- Validation: accepts correct answer, rejects wrong answer, rejects wrong part count, rejects empty

## Progress

- Created generator `src/lib/exercises/symbolicFractionOps.ts` with operations across all complexity bands:
  - 0–2: same-denominator add/sub
  - 3–4: different-denominator add/sub (50% chance of same-den)
  - 5–6: multiplication (single/double variable, squares)
  - 7–8: double fractions, multiply-then-add chains
  - 9–10: mixed chains (multiply+subtract, double+add, double fractions with vars, powers)
- Created validator `validateSymbolicFractionOps` — numeric parts use `fracEqual`, symbolic parts use exact string match
- Created custom component `src/lib/components/exercises/SymbolicFractionOps.svelte` with plain `<input>` elements
- Created instructions `src/lib/components/exerciseInstructions/SymbolicFractionOpsInstructions.svelte`
- Added i18n keys: `exercise.symbolicFractionOps.{name,desc,prompt}`
- Registered in `exerciseTypes.ts` with prerequisites (simplify/addition/multiplication fractions at lvl 3)
- Added to disciplines `fractions` and `termTransformations`
- 20 tests passing: determinism, variation, prompt format, answer format, per-complexity-band coverage, validation edge cases
- `npm run check` — 0 errors
- `npm run lint` — 0 errors

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
