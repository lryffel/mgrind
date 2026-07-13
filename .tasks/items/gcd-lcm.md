# Determine gcd and lcm

## Description

Two modes in one exercise type, selected randomly per generation:

- **Mode A (factorization → gcd/lcm):** Show both numbers' prime factorizations. User enters the prime factorization of the gcd and the lcm (same primes base, different exponents).
- **Mode B (small numbers → gcd/lcm):** Show two small composite numbers. User enters numeric gcd and lcm.

## Acceptance Criteria

### Mode A — extract PrimeFactorisation input component

The existing `PrimeFactorisation.svelte` renders: `n = 2^{□} · 3^{□} · 5^{□}` with a `NumericInput` per prime exponent. Extract the inner factorization-input UI into a shared component `PrimeFactorInput.svelte` (props: `primes: number[]`, `values: string[]`, `readonly: boolean`). Then:

- `PrimeFactorisation.svelte` uses it (backward compatible).
- `GcdLcmExercise.svelte` uses two instances: one for the gcd factorization, one for the lcm factorization.

**Mode A generation:**

Pick `kShared` shared primes, plus `kOnlyA` / `kOnlyB` private primes. Assign exponents `∈ [1, emax]`. The `primes` array for the gcd/lcm input includes all primes that appear in either `a` or `b`.

| Level | primes pool | shared | onlyA/onlyB | emax |
| ----: | :---------- | :----: | :---------: | :--: |
|   0–1 | {2,3}       |   1    |      0      |  2   |
|   2–3 | {2,3,5}     |   1    |      1      |  2   |
|   4–5 | {2,3,5,7}   |   2    |      1      |  3   |
|   6–7 | {2..11}     |   2    |      1      |  4   |
|   8–9 | {2..11}     |   3    |      2      |  4   |
|    10 | {2..13}     |   3    |      2      |  5   |

Prompt shows: `a = 2^3 · 3^2`, `b = 2^2 · 3 · 5`. Then: `ggT = 2^{□} · 3^{□} · 5^{□}`, `kgV = 2^{□} · 3^{□} · 5^{□}`. Correct answer stored as two comma-separated exponent strings `"2,1,0;1,2,1"` (gcd ; lcm).

### Mode B generation

Pick `g` (gcd, composite), then `x` and `y` coprime and > 1. Set `a = g * x`, `b = g * y`. Reject if `a === b` or `a` or `b` is prime.

| Level | g factors | x,y factors | a,b range |
| ----: | :-------- | :---------- | :-------- |
|   0–1 | 1 (≤5)    | 1 each      | ≤30       |
|   2–3 | 1–2       | 1 each      | ≤60       |
|   4–5 | 2         | 1–2 each    | ≤150      |
|   6–7 | 2–3       | 1–2 each    | ≤400      |
|   8–9 | 3         | 2 each      | ≤1500     |
|    10 | 3, exp≤3  | 2 each      | ≤5000     |

### UI

Custom `GcdLcmExercise.svelte`:

- Mode A: show `a = <factorization>` and `b = <factorization>` in display LaTeX. Then two `PrimeFactorInput` rows labeled "ggT =" and "kgV =", each with the same prime bases. Answer serialized as `"gcdExponents;lcmExponents"`.
- Mode B: show `a = <n>` and `b = <n>`. Two `NumericInput` fields, "ggT =" and "kgV =". Answer serialized as `"gcd,lcm"`.

### Validation

Custom `validateGcdLcm`:

- Mode A: `answer.split(';')` → two exponent strings. Compare each exponent array element-wise to `exercise.data.gcdExponents` and `exercise.data.lcmExponents`.
- Mode B: `answer.split(',')` → two integers. Compare to `exercise.data.gcd` and `exercise.data.lcm`.

### Constraints

- Never emit gcd = 1 (always use composite `g`).
- At levels 0–1 allow `a | b` (gcd = a) as a teachable case. Above level 1, reject `x = 1` or `y = 1`.
- Always reject `a === b`.
- No prime inputs in Mode B.

### Data representation

```ts
{
  subType: 'factorization' | 'numbers',
  aLatex?: string,        // factorization LaTeX for Mode A (a)
  bLatex?: string,        // factorization LaTeX for Mode A (b)
  primes?: number[],      // prime bases for Mode A input
  gcdExponents?: string,  // comma-separated exponents for gcd (Mode A)
  lcmExponents?: string,  // comma-separated exponents for lcm (Mode A)
  a: number,              // the actual number a
  b: number,              // the actual number b
  gcd: string,            // correct gcd as string (Mode B)
  lcm: string,            // correct lcm as string (Mode B)
  promptKey: 'exercise.gcdLcm.prompt'
}
// exercise.answer (Mode A) = "gcdExponents;lcmExponents"
// exercise.answer (Mode B) = "gcd,lcm"
```

### i18n

| Key                      | en                                    | de                                   |
| ------------------------ | ------------------------------------- | ------------------------------------ |
| `exercise.gcdLcm.name`   | "gcd and lcm"                         | "ggT und kgV"                        |
| `exercise.gcdLcm.desc`   | "Find the gcd and lcm of two numbers" | "Bestimme ggT und kgV zweier Zahlen" |
| `exercise.gcdLcm.prompt` | "Find the gcd and lcm."               | "Bestimme ggT und kgV."              |
| `exercise.gcdLcm.gcd`    | "gcd"                                 | "ggT"                                |
| `exercise.gcdLcm.lcm`    | "lcm"                                 | "kgV"                                |

### Discipline

- `numbers` (add exercise type id `gcdLcm` to the `numbers` discipline).

### Test coverage

1. Deterministic for same seed.
2. Both modes generated (check `subType`).
3. Mode A: all computed exponent arrays match actual gcd/lcm factorizations.
4. Mode B: `gcd(a, b) === parseInt(gcd)` and `lcm(a, b) === parseInt(lcm)`.
5. Validation: correct answer passes; wrong exponent fails; wrong gcd/lcm value fails.
6. Edge: gcd never 1; `a === b` never produced.
7. Complexity clamping.
8. Backward compatible: existing `PrimeFactorisation.svelte` unchanged after extraction.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
