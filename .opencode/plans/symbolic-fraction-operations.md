# Symbolic fraction operations (Addition, Subtraction, Multiplication, Division)

## Description

Add a new `symbolicFractionOperations` exercise type where students perform operations (add, subtract, multiply, divide) on fractions containing variables (linear monomial denominators). Students enter the result as a reduced symbolic fraction with numerator and denominator as polynomials.

## Motivation

The existing `simplifySymbolicFraction` covers reducing a single symbolic fraction. The existing `additionFraction` and `multiplicationFraction` cover operating on numeric fractions only. There is no exercise that combines both: operating on symbolic fractions. This closes the gap between numeric fraction operations and symbolic fraction reduction.

## Acceptance criteria

### Subtypes and complexity scaling

| Subtype                  | Level | Example                                                               |
| ------------------------ | ----- | --------------------------------------------------------------------- |
| `mul-sym`                | 0     | `a/2 · b/3 → ab/6`                                                    |
| `add-sym`                | 1     | `a/2 + a/3 → 5a/6`                                                    |
| `div-sym`                | 1     | `a/3 ÷ a/4 → 4/3`                                                     |
| `sub-sym`                | 2     | `a/3 - a/2 → -a/6` (guaranteed negative coefficient some of the time) |
| `mixed-numeric-symbolic` | 2     | `1/2 + a/3 → (2a+3)/6`                                                |
| `cross-mul`              | 3     | `a/b · c/d → ac/bd`                                                   |
| `mixed-add-sub`          | 5     | `x/2 + x/3 - x/4 → 7x/12`                                             |
| `cross-add`              | 6     | `a/3 + b/4 → (4a+3b)/12`                                              |
| `cross-sub`              | 7     | `a/2 - b/3 → (3a-2b)/6`                                               |
| `multi-term-num`         | 8     | `(x+1)/3 + (x-1)/4 → (7x+1)/12`                                       |
| `multi-term-num-mixed`   | 9     | `(2x+1)/3 - (x-1)/2 → (x+5)/6`                                        |

#### Per-axis complexity parameters within each subtype

| Axis                      | Levels 0–2 | Levels 3–5 | Levels 6–8 | Levels 9–10 |
| ------------------------- | ---------- | ---------- | ---------- | ----------- |
| Max denominator           | 6          | 12         | 18         | 24          |
| Max coefficient magnitude | 5          | 8          | 10         | 12          |
| Max distinct variables    | 1          | 2          | 2          | 2           |
| Max operand terms         | 2          | 2          | 3          | 3           |

### Variable pool

Use the centralized `VAR_POOL` from `src/lib/math/varpool.ts` (`['a','b','c','i','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z']`). Pick 1–2 distinct letters per problem via `pickDistinct`. Never reuse the same variable for two distinct symbolic roles.

### Prompt design

Per-subtype prompts (not all "Simplify."):

| Subtype                  | EN          | DE (Swiss)        |
| ------------------------ | ----------- | ----------------- |
| `add-sym`                | "Add."      | "Addiere."        |
| `sub-sym`                | "Subtract." | "Subtrahiere."    |
| `mul-sym`                | "Multiply." | "Multipliziere."  |
| `div-sym`                | "Divide."   | "Dividiere."      |
| `mixed-add-sub`          | "Combine."  | "Fasse zusammen." |
| `mixed-numeric-symbolic` | "Combine."  | "Fasse zusammen." |
| `cross-mul`              | "Multiply." | "Multipliziere."  |
| `cross-add`              | "Add."      | "Addiere."        |
| `cross-sub`              | "Subtract." | "Subtrahiere."    |
| `multi-term-num`         | "Simplify." | "Vereinfache."    |
| `multi-term-num-mixed`   | "Simplify." | "Vereinfache."    |

The key design principle: when the operation is uniform (add, sub, mul, div), use the operation verb. When multiple operations are combined or the result involves distribution, use "Simplify." / "Vereinfache."

### Cannot simplify button

**Do not add.** Every problem in this exercise has a concrete computed answer — the task is operating, not deciding reducibility. That belongs in `simplifySymbolicFraction`.

### Data interface

```ts
export interface SymbolicFractionOperationsData {
  subtype: string;
  mode: 'fraction'; // always fraction mode; consumed by SymbolicFractionExercise
  variableNames: string[]; // variables in the expression, e.g. ['a'], ['x','y']
  fields: { variablePart: string }[]; // numerator variable parts, e.g. [{variablePart:'a'}, {variablePart:'b'}]
  denominatorFields: { variablePart: string }[]; // denominator variable parts
  promptKey: string; // 'exercise.symbolicFractionOperations.prompt'
  promptKeyOverride?: string; // per-subtype prompt key when not the generic one

  // Canonical result for testability and clear validation:
  expectedAnswer: string; // canonical serialised answer (see answer format below)
  isZero?: boolean; // true when result is zero
  isConstant?: boolean; // true when result is a pure constant (no variables)
}
```

### Answer format

| Scenario                        | Answer     | `fields`                                  | `denominatorFields`     |
| ------------------------------- | ---------- | ----------------------------------------- | ----------------------- |
| Single term numerator           | `"5;6"`    | `[{variablePart:'a'}]`                    | `[{variablePart:''}]`   |
| Binomial numerator              | `"4,3;12"` | `[{variablePart:'a'},{variablePart:'b'}]` | `[{variablePart:''}]`   |
| Cross-mul (both vars in result) | `"1;1"`    | `[{variablePart:'ac'}]`                   | `[{variablePart:'bd'}]` |
| Zero result                     | `"0"`      | —                                         | —                       |
| Constant 1                      | `"1"`      | —                                         | —                       |

**Canonicalization rules:**

1. No trailing comma for single-term numerator: `"5;6"`, never `"5,;6"`.
2. Zero numerator → answer `"0"`. Drop denominator and fields.
3. Pure constant (no variables after simplification) → answer `"<value>"`. Drop fields. If constant is 1, answer `"1"`.
4. Zero-coefficient variable terms are dropped and the field array renormalized (only surviving terms appear).
5. Terms appear in the order given by `data.fields` — student must match that order.

### Generator logic

1. Pick subtype based on level.
2. Pick 1–2 distinct variables from `VAR_POOL` using `pickDistinct(rng, [...VAR_POOL], count)`.
3. Generate coefficients and denominators scaled to the level's per-axis parameters.
4. Construct operands and compute result symbolically.
5. **Drop zero-coefficient terms** from the result and renormalize fields.
6. If denominator divides evenly through all numerator coefficients → **discard this problem and retry** (up to 20 attempts). The result must remain a fraction.
7. If result has no variables → answer as pure constant (`"0"` or `"<value>"`).
8. Reduce numeric part via gcd.
9. Set `exercise.answer` to the canonical form, set `data.expectedAnswer` to the same.
10. Return exercise with `pattern: 'custom'`.

### Validation

Reuse `validateSimplifySymbolicFraction` from `validation.ts` — it already handles fraction mode (`;` separator), multi-field numerators, and equivalent fractions via `fracEqual`. The validator must also accept the pure-constant canonical forms (`"0"`, `"1"`, `"-3"`, etc.) when the result has no variables.

### Component

Reuse `SymbolicFractionExercise.svelte` — it already supports fraction mode with `fields` and `denominatorFields`, coefficient input, and the fraction layout. Set `data.mode: 'fraction'`. The component will render the prompt, coefficient fields, and feedback correctly.

Make sure the generator always provides at least one denominator field (even if `[variablePart: '']`).

### Discipline placement

Add `symbolicFractionOperations` to both `fractions` and `termTransformations` disciplines. The app disciplines system attaches to the exercise type globally (not per-subtype), so list both. The early `mul-sym`/`div-sym` subtypes appearing in `termTransformations` is an acceptable minor impurity.

### Files

| File                                                                                    | Action                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/lib/exercises/symbolicFractionOperations.ts`                                       | New generator module                            |
| `src/lib/exercises/symbolicFractionOperations.test.ts`                                  | New tests                                       |
| `src/lib/data/exerciseTypes.ts`                                                         | Register new type, import component             |
| `src/lib/data/disciplines.ts`                                                           | Add id to `fractions` and `termTransformations` |
| `src/lib/i18n.svelte.ts`                                                                | Add name, desc, per-subtype prompt keys         |
| `src/lib/components/exerciseInstructions/SymbolicFractionOperationsInstructions.svelte` | New instructions component                      |

### i18n

| Key                                                 | en                                  | de                                |
| --------------------------------------------------- | ----------------------------------- | --------------------------------- |
| `exercise.symbolicFractionOperations.name`          | Symbolic fraction operations        | Symbolische Bruchoperationen      |
| `exercise.symbolicFractionOperations.desc`          | Operate on fractions with variables | Mit Brüchen mit Variablen rechnen |
| `exercise.symbolicFractionOperations.prompt`        | Simplify.                           | Vereinfache.                      |
| `exercise.symbolicFractionOperations.promptAdd`     | Add.                                | Addiere.                          |
| `exercise.symbolicFractionOperations.promptSub`     | Subtract.                           | Subtrahiere.                      |
| `exercise.symbolicFractionOperations.promptMul`     | Multiply.                           | Multipliziere.                    |
| `exercise.symbolicFractionOperations.promptDiv`     | Divide.                             | Dividiere.                        |
| `exercise.symbolicFractionOperations.promptCombine` | Combine.                            | Fasse zusammen.                   |

### Edge cases the generator MUST handle

1. **Variable cancels → pure constant**: `a/3 ÷ a/3 = 1`. Answer `"1"`.
2. **Zero numerator**: `a/2 - a/2 = 0`. Answer `"0"`.
3. **Denominator divides cleanly**: filter out these seeds (retry). The result must remain a fraction.
4. **Zero-coefficient terms dropped**: e.g. `(a+b)/4 + (b-a)/4 = (2b)/4 → b/2`. After reducing, the `a` term vanishes. Renormalize fields to only `[{variablePart:'b'}]`.
5. **Negative coefficients**: `a/3 - a/2 = -a/6`. Subtypes at level 2+ must sometimes produce negative results.
6. **Mul/div where variables cancel**: `a/2 · b/a = b/2`. At least one variable must survive in the final answer; if the variable cancels completely, treat as pure constant case.
7. **Duplicate variable terms combine**: e.g. `a/3 + a/6 = a/2`. Single term after combination is fine.

### Test coverage

1. `expectDeterministic` per subtype (same seed → same exercise)
2. `expectSeedVariation` per subtype (different seeds → different exercises)
3. `expectHasPromptAndAnswer` per subtype
4. Answer format matches field count for all non-constant results
5. All subtypes generated at appropriate levels
6. Zero-coefficient terms are dropped (assert field array shrinks when terms cancel)
7. No denominator-1 result generated across 1000 random seeds
8. Pure constant (`"0"`, `"1"`, `"-3"`) answers for cancellation cases
9. Validation round-trip (correct passes, wrong fails)
10. Equivalent fractions accepted (via `validateSimplifySymbolicFraction`'s `fracEqual`)
11. Complexity clamping (beyond 10, below 0)

## Progress

## Blockers

## Notes

Original design reviewed by designer subagent. Key changes from v1: revised subtype progression, per-subtype prompts, centralized `VAR_POOL`, edge-case handling for cancellation/zero/constant results, explicit per-axis complexity parameters, no "cannot simplify" button.
