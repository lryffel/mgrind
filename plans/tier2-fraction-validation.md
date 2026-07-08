# Tier2 — Unify fraction validation

## Goal

Make fraction answers compared by mathematical equivalence (not exact string match),
fixing an inconsistency where `multiplicationFraction` rejects correct-but-unreduced
answers. Introduce a single validation module. This tier depends on Tier 1 (`fracEqual` /
`reduceFrac` from `src/lib/math/fraction.ts`).

## Context: the bug and the inconsistency

Exercise answers use two incompatible fraction encodings and two validation strategies:

- **Comma encoding** `num,den` (single field): `additionFraction.ts:57`, `subtractionFraction.ts:93`, `simplifyFraction.ts:39`, `multiplicationFraction.ts:89`.
- **Slash encoding** `num/den` (inside comma-separated fields): `binomialFormulas.ts:84`, `factoringBinomialFormulas.ts:194`, `collectingTerms.ts:260`.
- **Scientific notation**: plain decimal (`scientificNotation.ts:34`), `mantissa,exponent` (`:47`), `coeff,exp` (`:101,140`).
- **primeFactorisation**: `exponents.join(',')` (`primeFactorisation.ts:64`).

Validation today:

- `multiplicationFraction` is validated by `trimCompare` (exact string match, `exerciseTypes.ts:136`), so `2/4` is **rejected** even though it equals `1/2`.
- `binomialFormulas` / `collectingTerms` / `factoringBinomialFormulas` use `fracEqual` and accept any equivalent fraction.
- `subtractionFraction` has a dedicated `validateSubtractionFraction` (`exerciseTypes.ts:32-48`) that is **semantic** (sign-normalizes, cross-checks) — but `additionFraction`/`simplifyFraction` use plain `trimCompare`, so the user must type the exact generator string.

`trimCompare` is currently defined only inside `exerciseTypes.ts:28-30` and cannot be imported by components/tests.

## Steps

1. **Create `src/lib/validation.ts`**
   - Move `trimCompare` here from `exerciseTypes.ts:28-30` (export it).
   - Add `validateFractionAnswer(answer: string, exercise: Exercise): boolean` that:
     - parses `answer` and `exercise.answer` as fractions using the shared `parseFrac` / `reduceFrac` from `src/lib/math/fraction.ts`,
     - normalizes sign (denominator ≥ 1),
     - compares cross-multiplied (mathematically equivalent → correct).
   - Support both `num,den` (single field) and `num/den` field shapes, depending on `exercise` — keep it general enough for the slash-encoded multi-field answers (e.g. `multiplicationFraction` where each field is `num/den`).
   - Reuse the existing sign-normalization logic from `validateSubtractionFraction` (`exerciseTypes.ts:35-47`) rather than re-implementing it.

2. **Update `src/lib/data/exerciseTypes.ts`**
   - `multiplicationFraction` (`:130-139`): change `validate: trimCompare` → `validate: validateFractionAnswer`.
   - `additionFraction` (`:110-119`), `simplifyFraction` (`:101-109`): change `validate: trimCompare` → `validateFractionAnswer` (so equivalent fractions are accepted).
   - For `subtractionFraction` (`:120-129`): keep `validateSubtractionFraction` but have it call the shared `validateFractionAnswer`/normalization helper internally (remove its local re-implementation at `:35-47`).
   - Import `trimCompare` from `src/lib/validation.ts` for the remaining scalar types (multiplication, division, squares, orderOfOperations, scientificNotation, primeFactorisation) so the registry no longer defines it.

3. **Update validators that used `fracEqual`** (`binomialFormulas.ts:254`, `collectingTerms.ts:277`, `factoringBinomialFormulas.ts:126`) to optionally route through `validateFractionAnswer` for consistency (or keep `fracEqual` from `math/fraction.ts` — at minimum ensure they share one implementation, not three copies).

4. **Add/adjust tests**
   - New test `src/lib/validation.test.ts` (co-located, Vitest) covering: `2/4` vs `1/2` accepted; `num,den` equivalence; negative-denominator normalization; `trimCompare` still trims.
   - Verify `multiplicationFraction.test.ts` still passes; add a case proving an unreduced but equivalent answer now passes.

## Out of scope

- Changing generator output formats (keep current encodings; only the comparison becomes equivalence-based).
- UI component changes (Tier 4).
- `Exercise.data` typing (Tier 3).

## Verification

- `npm run test` — all `*.test.ts` pass, including new `validation.test.ts`.
- `npm run check` and `npm run lint`.
- Manual: in dev (`npm run dev`), for an addition/multiplication fraction exercise, enter an unreduced equivalent fraction → should now be marked correct.
