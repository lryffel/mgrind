# Tier1 — Extract shared math/number utilities

## Goal

Eliminate duplicated low-level math/number/RNG helpers by creating three shared modules.
No behavior change; pure extraction. Lowest-risk, high-value.

## Context: duplicated helpers to remove

There is no shared math module. The following are redefined locally in many files:

### `gcd` — 8 production copies + 4 test copies

- Production: `src/lib/exercises/additionFraction.ts:4`, `subtractionFraction.ts:4`, `simplifyFraction.ts:4`, `multiplicationFraction.ts:4`, `binomialFormulas.ts:4`, `collectingTerms.ts:50`, `substitution.ts:12`, `factoringBinomialFormulas.ts:4`
- Tests: `simplifyFraction.test.ts:4`, `additionFraction.test.ts:4`, `subtractionFraction.test.ts:4`, `multiplicationFraction.test.ts:4`
- **Inconsistency:** `collectingTerms.ts:54` returns `Math.abs(a)`; every other copy returns `a` (may be negative). `binomialFormulas.ts:20` calls `gcd(Math.abs(num), Math.abs(den))` to compensate. Unify to always return `|a|`.

### `reduceFrac` — 4 divergent copies

- `substitution.ts:19` → returns `string` (`'num/den'`, `'num'`, or `'0'`)
- `collectingTerms.ts:57` → returns `[num, den]`, normalizes to positive denom, zero → `[0,1]`
- `binomialFormulas.ts:19` → returns `[num, den]`, negates BOTH if `den<0`
- `factoringBinomialFormulas.ts:11` → returns `[num, den]`, normalizes to positive denom, zero → `[0,1]`

### `parseFrac` — 5 copies, two failure contracts

- `collectingTerms.ts:131`, `binomialFormulas.ts:261`, `factoringBinomialFormulas.ts:111` → `[number,number] | null`
- `FactoringBinomialFormulas.svelte:76` → exact dup of `factoringBinomialFormulas.ts:111`
- `substitution.ts:465` → returns `[0,0]` on failure instead of `null` (divergent; should become `null`)

### `fracEqual` — 3 identical copies

- `collectingTerms.ts:277`, `binomialFormulas.ts:254`, `factoringBinomialFormulas.ts:126`
- (functionally same as inline cross-multiply in `substitution.ts:462`)

### RNG helpers built on `mulberry32` (`src/lib/prng.ts`)

- `randInt(rng, min, max)`: `orderOfOperations.ts:4`, `substitution.ts:4`, `binomialFormulas.ts:11`, `collectingTerms.ts:67`, `factoringBinomialFormulas.ts:21`, `scientificNotation.ts:4`
- `pick(rng, arr)`: `orderOfOperations.ts:8`, `substitution.ts:8`, `binomialFormulas.ts:15`, `collectingTerms.ts:151`, `factoringBinomialFormulas.ts:25`
- `randCoeff(rng, allowFrac)`: `binomialFormulas.ts:53` and `factoringBinomialFormulas.ts:100` (byte-identical)
- `shuffle`: `collectingTerms.ts:71`
- `pickDistinct`: `collectingTerms.ts:146` (wraps shuffle)
- `pickExclude`: `factoringBinomialFormulas.ts:29`

### "generate two coprime integers" loop — 3 copies

- `additionFraction.ts:26-32`, `subtractionFraction.ts:26-32`, `simplifyFraction.ts:26-32` (same `areCoprime(a,b) && a !== b` break; `subtractionFraction` negates `a` afterward at `:34-36`)

### `mulberry32` re-seed patterns

- `multiplication.ts:10` and `division.ts:10` — byte-identical one-shot re-seed: `mulberry32(seed + 1)` to force a larger factor when `complexity ≥ 5` and both operands are ≤ 10.
- `primeFactorisation.ts:56` — conceptually similar (re-seeds with `mulberry32(seed + attempt)`) but structurally different: a retry loop (up to 1000 attempts) searching for a number whose prime factors all belong to an allowed set. **Not a candidate for unification with the one-shot pattern.**

## Steps

1. **Create `src/lib/math/number.ts`**
   - `gcd(a: number, b: number): number` — returns `Math.abs(a)` (unified).
   - `lcm(a: number, b: number): number`.
   - `areCoprime(a: number, b: number): boolean`.
   - `randomCoprimePair(rng: () => number, min: number, max: number): [number, number]` — encapsulate the 13-line loop (bounds derivation optional; match existing `subtractionFraction.ts:26-32`).
   - `bumpPastThreshold(rng, seed, complexity, threshold)` — encapsulate the one-shot `mulberry32(seed + 1)` + "bump past 10" logic from `multiplication.ts:9-12` / `division.ts` (parameterize the threshold and range). `primeFactorisation.ts:56` uses a different retry-loop pattern and is **not** unified here.

2. **Create `src/lib/math/fraction.ts`**
   - `export type Fraction = [number, number];`
   - `reduceFrac(num: number, den: number): Fraction` — normalize sign to numerator (denom ≥ 1), zero → `[0,1]`.
   - `fracToString(num: number, den: number): string` — used by `substitution.ts`.
   - `parseFrac(s: string): Fraction | null` — single contract returning `null` on failure (imported by `collectingTerms`, `binomialFormulas`, `factoringBinomialFormulas`, `FactoringBinomialFormulas.svelte`, `substitution`).
   - `fracEqual(a: string, b: string): boolean` — parseFrac + cross-multiply.

3. **Create `src/lib/math/rng.ts`** (or extend `src/lib/prng.ts`)
   - `randInt(rng, min, max)`, `pick(rng, arr)`, `pickExclude(rng, arr, exclude)`, `pickDistinct(rng, arr, n)`, `shuffle(arr)`, `randCoeff(rng, allowFrac)`.

4. **Refactor each generator** to import from the new modules instead of defining locals. Keep outputs byte-identical (run existing `*.test.ts` to confirm). Specifically:
   - Replace `gcd`/`areCoprime` defs with imports.
   - Replace `reduceFrac` defs with imports; verify each still normalizes as before.
   - Replace `parseFrac`/`fracEqual` defs with imports.
   - Replace RNG helpers with imports.
   - `substitution.ts:465` `parseFrac` must now return `null` — update its caller accordingly.
   - `FactoringBinomialFormulas.svelte:76` — delete the local `parseFrac` and import the shared one.

5. **Update test files** that redefine `gcd` to import from `number.ts`.

## Out of scope

- Validation semantics (see Tier 2).
- UI component changes beyond removing the duplicated `parseFrac` in `FactoringBinomialFormulas.svelte`.
- `Exercise.data` typing (see Tier 3).

## Verification

- `npm run test` (all existing `*.test.ts` must still pass — outputs unchanged).
- `npm run check` (svelte-check + tsc).
- `npm run lint`.
- Grep to confirm no remaining local `function gcd`, `function reduceFrac`, `function parseFrac`, `function randInt`, `function pick(` in `src/lib`.
