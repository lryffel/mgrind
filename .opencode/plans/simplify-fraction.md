# Simplify Fractions (Brüche kürzen)

## Description

Revamp the `simplifyFraction` exercise to replace unbounded number growth with meaningful conceptual scaling.

## Acceptance Criteria

### Three subtypes in one exercise

| Subtype          | Behaviour                                                                        |
| ---------------- | -------------------------------------------------------------------------------- |
| `standard`       | User enters reduced fraction via `<NumericInput fraction>`                       |
| `withFactors`    | Same as standard, but prime factorization of num/den is displayed as scaffolding |
| `alreadyReduced` | Fraction already in lowest terms (GCD=1). User clicks "Bereits gekürzt" button   |

All subtypes: single fraction per card (no batches).

### Complexity scaling

Numbers capped at 100 at complexity 10.

| Lvl | Num/Den ≤ | Subtype mix                                             |
| --: | :-------- | :------------------------------------------------------ |
|   1 | 12        | standard                                                |
|   2 | 20        | standard                                                |
|   3 | 30        | standard                                                |
|   4 | 40        | standard (70%), withFactors (30%)                       |
|   5 | 50        | standard (50%), withFactors (25%), alreadyReduced (25%) |
|   6 | 60        | standard, withFactors, alreadyReduced                   |
|   7 | 70        | all three                                               |
|   8 | 85        | all three                                               |
|   9 | 95        | all three                                               |
|  10 | 100       | all three                                               |

### Data interface

```ts
export type SimplifyFractionSubType = 'standard' | 'withFactors' | 'alreadyReduced';

export interface SimplifyFractionData {
  subtype: SimplifyFractionSubType;
  promptNumerator: number;
  promptDenominator: number;
  reducedNumerator: number;
  reducedDenominator: number;
  primeFactorPromptNum?: string; // LaTeX, e.g. "2^2 \\cdot 3"
  primeFactorPromptDen?: string;
}
```

### Generator logic (`generateSimplifyFraction`)

- Picks subtype weighted by level (table above)
- Keeps retrying until a fraction matching the subtype materialises:
  - `standard`/`withFactors`: reduced pair (p,q) coprime, multiplied by factor k≥2, p\*k ≤ maxForLevel, q\*k ≤ maxForLevel
  - `alreadyReduced`: reduced pair (p,q) coprime, using directly (no factor), GCD=1 check
- `exercise.answer`: for `alreadyReduced` → `"already_reduced"`; others → `"p,q"`
- `exercise.pattern`: `'custom'`

### Validator (`validateSimplifyFraction`)

- `alreadyReduced`: exact match `"already_reduced"`
- `standard`/`withFactors`: `"num,den"` string, must equal `reducedNumerator,reducedDenominator` AND `gcd(num,den) === 1`

### Component (`SimplifyFraction.svelte`)

Custom component using `ExerciseShell` (same pattern as `Pythagoras.svelte`).

- **`alreadyReduced`**: `<Math>` shows fraction. `submitExtra` renders "Bereits gekürzt" button. Clicking submits `"already_reduced"`. Feedback shows `correctMessage`.
- **`standard`**: `<Math>` shows fraction + `=` + `<NumericInput fraction>`. Submit collects `"num,den"`. Feedback shows correctLaTeX.
- **`withFactors`**: Same as standard, but below the fraction also shows prime factorisation via `<Math>` (e.g. `\frac{2^2 \cdot 3}{2 \cdot 5}` or separate lines).

### Files

| File                                                   | Action                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `src/lib/math/number.ts`                               | Add `primeFactors(n)` util                                                                 |
| `src/lib/exercises/simplifyFraction.ts`                | Rewrite: new data, generator, validator                                                    |
| `src/lib/components/exercises/SimplifyFraction.svelte` | New custom component                                                                       |
| `src/lib/data/exerciseTypes.ts`                        | Update: import component, validate                                                         |
| `src/lib/i18n.svelte.ts`                               | Add `exercise.simplifyFraction.alreadyReduced`, `feedback.simplifyFraction.alreadyReduced` |
| `src/lib/exercises/simplifyFraction.test.ts`           | Rewrite for new behaviour                                                                  |

### i18n

| Key                                        | en                                                  | de                                                    |
| ------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------- |
| `exercise.simplifyFraction.alreadyReduced` | "Already reduced"                                   | "Bereits gekürzt"                                     |
| `feedback.simplifyFraction.alreadyReduced` | "Correct! The fraction is already in lowest terms." | "Richtig! Der Bruch ist bereits vollständig gekürzt." |

### Validation

```ts
export function validateSimplifyFraction(answer: string, exercise: Exercise): boolean {
  const data = exercise.data as SimplifyFractionData;
  if (data.subtype === 'alreadyReduced') {
    return answer.trim() === 'already_reduced';
  }
  const parts = answer.split(',');
  if (parts.length !== 2) return false;
  const n = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  if (isNaN(n) || isNaN(d) || d <= 0) return false;
  return n === data.reducedNumerator && d === data.reducedDenominator;
}
```

### Test coverage

1. Deterministic seed/complexity
2. Seed variation
3. Has prompt and answer for all subtypes
4. Prompt is valid LaTeX fraction
5. Numbers never exceed complexity cap
6. `alreadyReduced`: prompt num/den have gcd=1
7. `standard`/`withFactors`: prompt has gcd>1
8. `alreadyReduced` answer matches `"already_reduced"`
9. `standard` answer is `"num,den"` in reduced form
10. Validation round-trip (correct passes, wrong fails)
11. `alreadyReduced` validation: only `"already_reduced"` passes
12. `withFactors` stores prime factor LaTeX in data
13. Complexity clamping (beyond 10, below 0)
