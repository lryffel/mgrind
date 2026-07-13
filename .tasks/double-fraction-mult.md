# Extend fraction multiplication with double fractions

## Description

Extend fraction multiplication by double fractions (fraction divided by fraction or integer divided by fraction or fraction divided by integer) as well as multiplication with an integer. When formatting, format double fractions as \frac{\;\frac{}{}\;}{\;\frac{}{}\;} so that the center fraction is wide enough, or find another solution that makes the order of operations clear.

## Acceptance Criteria

### Problem types generated

1. **Fraction × Fraction** — existing behavior preserved unchanged (`\dfrac{a}{b} \cdot \dfrac{c}{d}`).
2. **Fraction × Integer** — e.g. `\dfrac{2}{3} \cdot 5`, using `promptFraction` with `den=1` for the integer operand.
3. **Integer × Fraction** — e.g. `5 \cdot \dfrac{2}{3}`, same approach with the integer first.
4. **Fraction ÷ Fraction** — rendered as a double fraction: `\frac{\;\dfrac{a}{b}\;}{\;\dfrac{c}{d}\;}`.
5. **Integer ÷ Fraction** — rendered as a double fraction: `\frac{\;x\;}{\;\dfrac{c}{d}\;}`.
6. **Fraction ÷ Integer** — rendered as a double fraction: `\frac{\;\dfrac{a}{b}\;}{\;y\;}`.

### Complexity scaling

| Complexity | Types active                                     |
| ---------- | ------------------------------------------------ |
| 0–3        | fraction × fraction only (existing)              |
| 4–6        | above + fraction × int, int × fraction           |
| 7–10       | above + all three double-fraction division types |

Within each band, the RNG selects uniformly among the active types. The `data.subType` field records which variant was generated so the component can render appropriately.

### LaTeX formatting

- **Multiplication** (binary operation): Use `promptFraction()` from `latex.ts` for each operand, joined by `\cdot`. Integer operands use `den=1` so `promptFraction` renders them as plain numbers.
- **Double fractions** (division): Use `\frac{\;...\;}{\;...\;}` with LaTeX thin spaces (`\;`) on both sides of the inner content. Inner fractions use `\dfrac` (display-style) so they render at normal size:
  - fraction ÷ fraction: `\frac{\;\dfrac{a}{b}\;}{\;\dfrac{c}{d}\;}`
  - integer ÷ fraction: `\frac{\;x\;}{\;\dfrac{c}{d}\;}`
  - fraction ÷ integer: `\frac{\;\dfrac{a}{b}\;}{\;y\;}`
- The inner `\dfrac` ensures numerator/denominator readability; the `\;` padding makes the overall fraction bar visually distinct from the inner ones.

### Validation

All types produce an answer in the same `numerator,denominator` reduced-fraction format. The existing `validateFractionAnswer` from `validation.ts` works without changes — it parses comma-separated num/den and checks equivalence via cross-multiplication.

- Complexity ≤ 5: answer must be given in reduced form (use `validateFractionReduced`).
- Complexity > 5: answer may be non-reduced (use `validateFractionAnswer`; the component still shows a "can reduce" warning).

### Component changes (`FractionExercise.svelte`)

- The component's existing fallback (`: exercise.prompt`) already renders `exercise.prompt` directly when not in binary mode, which handles double fractions.
- However, for double fractions the component currently shows no `=` or input widget after the prompt. The component must be extended to detect the double-fraction case (via `data.subType`) and still render `= <NumericInput fraction>` after the prompt.
- For integer-multiplication types, the existing binary path works (just `promptFraction` with `den=1`).

### `data` object fields

For all new types, `exercise.data` must include:

- `subType`: one of `'frac-mul-frac'`, `'frac-mul-int'`, `'int-mul-frac'`, `'frac-div-frac'`, `'int-div-frac'`, `'frac-div-int'`.
- `promptKey`: `'exercise.multiplicationFraction.prompt'`.
- For multiplication types: `num1`, `den1`, `num2`, `den2`, `op: '*'`.
- For double-fraction types: only `subType`, `promptKey`, and the fractions stored (e.g. `num1`, `den1`, `num2`, `den2`) for correct-answer computation and potential rendering hints.

### Answer computation

All types reduce to the same math:

- Multiplication: `(a * c) / (b * d)`, reduced by gcd.
- Double fractions: `(a * d) / (b * c)`, reduced by gcd — same as fraction division.

The `answer` field is always `"numerator,denominator"` where numerator and denominator are coprime.

### Instructions update (`MultiplicationFractionInstructions.svelte`)

Add a section explaining integer multiplication (rewrite integer as fraction with denominator 1) and double-fraction division (invert-and-multiply). Keep existing cross-cancellation explanation. Include examples for each new type.

### Generator invariants (all types)

- All fractions in prompts are reduced (gcd of num/den = 1).
- For multiplication types with cross-cancellation, at least one cross-cancel factor > 1 exists (same as existing invariant: gcd(n1, d2) > 1 or gcd(n2, d1) > 1).
- For double-fraction types, ensure the inner fractions are also reduced.
- Values stay within bounds based on complexity: `maxVal = max(10 + clamped, 10)` applies to all operands.

## Progress

## Blockers

## Notes

Original: `TODO.md` — Exercise Extensions
