---
id: '006'
title: 'Create number trivia exercise'
status: 'todo'
assignee: null
priority: 'medium'
created: '2026-07-13'
updated: '2026-07-13'
depends_on: ['012']
needs_guidance: false
tags: ['new-exercise']
---

# Create number trivia exercise

## Description

Make a trivia exercise about numbers, addressing topics like the product of negative numbers (negative times negative times negative times negative is ...), what is a prime number, powers of negative numbers, etc. Get inspired from the fraction trivia.

## Acceptance Criteria

1. **Generator file**: Create `src/lib/exercises/numberTrivia.ts` exporting `generateNumberTrivia(seed, complexity)` following the `fractionTrivia` pattern — a dispatcher that picks from multiple trivia categories based on complexity bands.

2. **Question categories** (minimum 7, each as a `triviaType` in `data`):
   - `signOfProduct` — Given a product of negative numbers (2, 3, or 4 factors), determine whether the result is positive or negative. MC radio: "positive" / "negative".
   - `signOfPower` — Given `(-a)^n`, determine the sign of the result. MC radio: "positive (even exponent)" / "negative (odd exponent)" / "depends on the base".
   - `identifyPrime` — From 3–4 numbers, select which are prime. MC checkbox with numbered options.
   - `zeroProperties` — Properties of zero: `n · 0 = ?`, `0 ÷ n = ?`, `n + 0 = ?`, `n − 0 = ?`. Numeric text input.
   - `oneProperties` — Properties of one: `n · 1 = ?`, `n ÷ 1 = ?`, `1^n = ?`, `n^0 = ?`. Numeric text input.
   - `negOnePower` — "(-1)^n = 1 when n is ___". MC radio: "even" / "odd" / "prime" / "any number".
   - `divisibleBy` — Divisibility rules: given a rule description, pick which divisor it describes (2, 3, 5, 9, 10). MC radio.

3. **Complexity scaling**:
   - Complexity 1–2: `zeroProperties`, `oneProperties` (direct numeric answers), `signOfProduct` (2 factors only).
   - Complexity 3–4: `identifyPrime` (small numbers 2–20), `signOfProduct` (3 factors), `divisibleBy` (2, 5, 10).
   - Complexity 5–6: `negOnePower`, `signOfPower` (small bases), `identifyPrime` (numbers up to 50), `divisibleBy` (3, 9).
   - Complexity 7–8: `signOfProduct` (4 factors, abstract: "odd number of negatives"), `signOfPower` (abstract parity rule), combinations.
   - Complexity 9–10: mixed abstract reasoning questions combining multiple concepts.

4. **Answer validation**: Use a custom `validateNumberTrivia` function (like `validateFractionTrivia`) that dispatches on `data.triviaType`:
   - MC radio: trim-compare single index string.
   - MC checkbox: compare sorted comma-separated index strings via `normalizeIndexAnswer`.
   - Text input: trim-compare user string to expected answer.

5. **Custom Svelte component**: Required — create `src/lib/components/exercises/NumberTrivia.svelte` that composes the reusable `TriviaRadioGroup`, `TriviaCheckboxGroup`, and `TriviaTextInput` components (extracted in task 012) rather than duplicating input-mode logic.
   - Dependency: task 012 (extract trivia components) must be completed first.
   - Each trivia type maps to one of the reusable input modes:
     - `TriviaRadioGroup` for single-select: `signOfProduct`, `signOfPower`, `negOnePower`, `divisibleBy`.
     - `TriviaCheckboxGroup` for multi-select: `identifyPrime`.
     - `TriviaTextInput` for numeric text answers: `zeroProperties`, `oneProperties`.
   - If any needed input mode doesn't exist in the reusable components, extend them rather than duplicating.
   - Follow the same `ExerciseShell` + `Feedback` pattern as `FractionTrivia.svelte`.

6. **i18n keys** to add to `src/lib/i18n.svelte.ts`:
   - `exercise.numberTrivia.name` — "Number Trivia" / "Wissen: Zahlen"
   - `exercise.numberTrivia.desc` — "Test your knowledge about numbers" / "Teste dein Wissen über Zahlen"
   - `exercise.numberTrivia.type.signOfProduct.prompt` — prompt for sign-of-product questions
   - `exercise.numberTrivia.type.signOfPower.prompt` — prompt for sign-of-power questions
   - `exercise.numberTrivia.type.identifyPrime.prompt` — prompt for identify-prime questions
   - `exercise.numberTrivia.type.zeroProperties.prompt` — prompt for zero-properties questions
   - `exercise.numberTrivia.type.oneProperties.prompt` — prompt for one-properties questions
   - `exercise.numberTrivia.type.negOnePower.prompt` — prompt for (-1)^n questions
   - `exercise.numberTrivia.type.divisibleBy.prompt` — prompt for divisibility questions
   - Option labels as `exercise.numberTrivia.option.*` for each type's choices

7. **Discipline**: Add `'numberTrivia'` to the `numbers` discipline's `exerciseTypeIds` array in `src/lib/data/disciplines.ts`.

8. **Registration**: Register in `src/lib/data/exerciseTypes.ts` as `numberTrivia` using `defineExerciseType` with the custom component and custom validator.

9. **Tests**: Write `src/lib/exercises/numberTrivia.test.ts` with:
   - At least one test per trivia category verifying correct answer generation and validation.
   - `expectDeterministic` test for same seed → same exercise.
   - `expectSeedVariation` test showing different seeds → different exercises.
   - `expectHasPromptAndAnswer` test for generated exercises.
   - Edge cases: complexity=0, complexity=10, all types appear at appropriate levels.

10. **TypeScript check and lint**: Run `npm run check` and `npm run lint` — both must pass with no errors.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
