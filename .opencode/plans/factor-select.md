# List all factors of n

## Description

Generate a number `n` and present the user with checkboxes (one per candidate) to select all positive factors. The user must find every divisor to be correct.

## Acceptance Criteria

### Generation

1. **`n` range by complexity:**

   | Complexity | `n` range |
   | ---------: | :-------- |
   |          0 | 6–12      |
   |          1 | 8–18      |
   |          2 | 12–24     |
   |          3 | 18–36     |
   |          4 | 24–48     |
   |          5 | 30–60     |
   |          6 | 36–60     |
   |          7 | 48–60     |
   |          8 | 60        |
   |          9 | 60        |
   |         10 | 60        |

   Maximum `n` is 60 (enough divisors for a meaningful exercise; keeps pool manageable).

   - With a small probability (`~0.1 + 0.03 · complexity`, capped at ~0.4) force `n` to be prime.
   - With a small probability (`~0.05 + 0.02 · complexity`, capped at ~0.25) force `n` to be a perfect square.
   - These injections bias the RNG slightly so that pedagogically important edge cases appear more often than uniform random would provide.

2. **Factors:** compute all positive divisors of `n`. Always include `1` and `n`.

3. **Candidates pool:** all factors ∪ distractors. Total pool size targets 8–18 buttons, clamped to `n` (can't show more buttons than numbers in `[1, n]`).

4. **Distractors:** pick from `[1, n] \ factors` with weighted selection:
   - High weight: multiples of a prime factor of `n` that don't divide `n`; primes that don't divide `n`; numbers within ±2 of a true factor.
   - Medium weight: numbers within ±2 of `√n`.
   - Low weight: anything else.
   - Fall back to uniform selection if weighted supply runs out.

5. **Shuffle:** candidates shuffled deterministically with `mulberry32(seed)`.

### UI

- Prompt renders `n = {n}` in display-mode LaTeX.
- Instruction via i18n: "Select all factors of n." / "Wähle alle Teiler von n."
- Candidates rendered as checkbox-style toggle buttons via `MultiChoiceCard.svelte` (uses `role="checkbox"` with `aria-checked` and `::before` pseudo-element checkmark). Each button shows the integer value via `<Math>`.
- Layout uses the `MultiChoiceCard` column layout by default. If a CSS grid layout is desired (`grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr))`), extend `MultiChoiceCard` with a `grid` option based on `exercise.data.layout`.
- No submit gating — submit always enabled, even with 0 selections.

### Validation

- On submit, the `MultiChoiceCard` serialises selected indices as a comma-separated string of sorted indices, e.g. `"0,2,5"`.
- `validate(answer, exercise)` deserialises indices, maps to candidate values, and performs set-equality comparison against `exercise.data.factors` (stored as a comma-separated value string).
- Exact set match required — no partial credit.

### Feedback

- Correct: show success message via `<Feedback>`.
- Incorrect: `MultiChoiceCard` renders the user's selection and the correct options via built-in feedback (correct-option/wrong-option colouring).
- The correct answer shown in `<Feedback>` lists the factor values via `textAnswer`.

### Data representation

```ts
// exercise.data fields:
{
  n: number,
  factors: string,       // comma-separated sorted values, e.g. "1,2,3,4,6,12"
  promptKey: 'exercise.factors.title',
  options: { latex: string }[],  // candidates, each as { latex: "3" }
}
// exercise.answer: comma-separated string of correct option *indices*,
//                  e.g. "0,3,5" (matching MultiChoiceCard's serialisation)
```

### Pattern

Use `pattern: 'multi-choice'`. No custom component needed — `CardRegistry.svelte` routes `multi-choice` to `MultiChoiceCard.svelte`.

Registration via `defineExerciseType()` in `exerciseTypes.ts`:

```ts
factors: defineExerciseType({
  id: 'factors',
  nameKey: 'exercise.factors.name',
  descriptionKey: 'exercise.factors.desc',
  maxComplexity: 10,
  generate: generateFactorsExercise,
  validate: validateFactors,
}),
```

### i18n

| Key                               | en                         | de                         |
| --------------------------------- | -------------------------- | -------------------------- |
| `exercise.factors.instruction`    | "Select all factors of n." | "Wähle alle Teiler von n." |
| `exercise.factors.correctFactors` | "Correct factors"          | "Richtige Teiler"          |
| `exercise.factors.title`          | "Factors"                  | "Teiler"                   |

### Discipline

- `numbers` — register the exercise type in the `numbers` discipline.

### Test coverage

1. `expectDeterministic(generate, seed)` — same seed → identical `n`, `factors`, `candidates`.
2. `expectSeedVariation(generate)` — different seeds → different `n` or candidates.
3. `expectHasPromptAndAnswer(generate)`.
4. For many seeds per complexity:
   - `factors` equals sorted list of all `d` in `1..n` where `n % d === 0`.
   - `1 ∈ factors` and `n ∈ factors`.
   - Every factor appears in `candidates`.
   - No duplicates in `candidates`.
   - Every distractor `d ∈ candidates \ factors` satisfies `1 ≤ d ≤ n` and `d ∤ n`.
   - `n` is within the complexity's range.
   - `n ≤ 60`.
5. Prime `n`: `factors = "1,n"`; none of the distractors divide `n`.
6. Perfect square `n`: `√n` appears exactly once in factors.
7. Validation: exact set match → `true`; missing factor → `false`; extra selection → `false`; empty selection → `false`; different order → `true`.
8. Complexity clamping: `generate(seed, -1)` = `generate(seed, 0)`; `generate(seed, 99)` = `generate(seed, 10)`.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
