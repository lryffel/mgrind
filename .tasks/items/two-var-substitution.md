# Extend substitution with 2 variables

## Description

Extend the substitution exercise by substitution of 2 variables. Get inspired by the numbers exercises — there are some hard and fun ones there.

## Acceptance Criteria

### Two-variable patterns to generate

Each 2-var exercise uses two distinct variables (e.g. `x` & `y`, `a` & `b`, etc.). Numeric coefficients use the same `randomCoeff` / `randomFrac` utilities as 1-var.

| Pattern         | LaTeX                       | Example                     | Notes                                                                          |
| --------------- | --------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| Linear sum      | `ax + by`                   | `3x + 2y`                   | Both variables linear, fractional coeffs allowed                               |
| Linear + square | `ax + by^2`                 | `2x + 3y^2`                 | One variable linear, one squared                                               |
| Both squared    | `ax^2 + by^2`               | `4x^2 + y^2`                | Both variables squared                                                         |
| Product         | `x \cdot y`                 | `x \cdot y`                 | Simple product, scaled variant `a \cdot x \cdot y`                             |
| Quotient        | `\frac{ax}{by}`             | `\frac{3x}{2y}`             | Fraction with variables in numerator and denominator                           |
| Binomial square | `(x + y)^2`                 | `(x + y)^2`                 | Integer-only substitution values, result computed numerically                  |
| Reciprocal sum  | `\frac{a}{x} + \frac{b}{y}` | `\frac{2}{x} + \frac{3}{y}` | Substitution values are integer factors of the numerator                       |
| Pythagorean     | `\sqrt{x^2 + y^2}`          | `\sqrt{x^2 + y^2}`          | Substitution values from Pythagorean triples (like existing `genSqrtA2PlusX2`) |

### Complexity scaling

- **Complexity 0–3**: unchanged — only 1-var problems
- **Complexity 4–5**: 2-var pool includes `ax + by`, `ax + by^2`, `x \cdot y`, `ax \cdot y`. The generator picks from the combined 1-var + 2-var pool, so both types appear at random.
- **Complexity 6–7**: 2-var pool expands with `ax^2 + by^2`, `(x + y)^2`, `\frac{ax}{by}`.
- **Complexity 8–10**: 2-var pool expands with `\frac{a}{x} + \frac{b}{y}`, `\sqrt{x^2 + y^2}`.
- The `poolFor()` function selects which 2-var generators to include per band, analogous to how `orderOfOperations.ts` uses bands.
- `INTEGER_ONLY` variables (`k, m, n, p, q`) produce only integer-valued results; 2-var problems selected for these variables must never contain fractions (neither in coefficients nor answers).
- The existing 1-var generators are retained in all bands where they currently appear.

### Data representation

Extend `ExerciseData` with:

- `varB: string` — second variable name
- `valueB: string` — second variable's substitution value (same format as `value`: integer or fraction string)

The existing `variable` and `value` fields are used for the first variable (backward compatible). Generators set `varB` and `valueB` when producing a 2-var exercise; they remain `undefined` for 1-var.

### User input

- Single numeric/text input field — the same `NumericInput` component used today. The answer is a single number (the computed result of the substituted expression), not a symbolic expression.
- If the answer is a fraction, the existing fraction-input mode (`NumericInput` with `fraction` prop) is used.

### Validation

- No changes to `validateSubstitution()` — it already handles numeric answers and fraction equivalence.
- The same fraction reduction logic applies.

### Component changes (`SubstitutionExercise.svelte`)

- The prompt label must show both variable assignments: `Substitute x = 4 and y = 2` instead of `Substitute x = 4`.
- Check `exercise.data?.varB` and `exercise.data?.valueB` to decide whether to render one or two variable assignments.
- New i18n keys:
  - `exercise.substitution.promptBefore` (updated — may need rewording for multi-var case)
  - `exercise.substitution.and` — the conjunction between variable assignments (en: `and`, de: `und`)
- Backward compatible: when `varB`/`valueB` are absent, render exactly as today.

### i18n

- Add `'exercise.substitution.and'` key with `en: ' and '` / `de: ' und '`
- Update existing prompt text if needed to grammatically support both cases.

### Test coverage

New tests in `substitution.test.ts`:

1. `generates two-variable exercises at complexity 4+` — seeds across 4–10 produce exercises with both `variable` and `varB` set
2. `two-variable answers are valid` — all 2-var answers are parseable as numbers or fractions
3. `two-variable problems use distinct variables` — `variable !== varB`
4. `varB/valueB are undefined for complexity 0–3` — backward compatibility
5. `deterministic for same seed/complexity` — 2-var exercises are deterministic (already covered by existing test, but verify for mixed pools)
6. `INTEGER_ONLY variables never produce fraction answers` — even in 2-var mode
7. `validateSubstitution works for two-variable exercises` — correct answers pass, incorrect ones fail

## Progress

## Blockers

## Notes

Original: `TODO.md` — Exercise Extensions
