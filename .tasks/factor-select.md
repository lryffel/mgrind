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
- Candidates rendered as checkbox-style toggle buttons (like `TriviaCheckboxGroup.svelte` uses `role="checkbox"` with `aria-checked` and `::before` pseudo-element checkmark). Each button shows the integer value via `<Math>`.
- **Buttons arranged in a CSS grid** (`grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr))`) so they wrap without scrolling and stay compact.
- No submit gating — submit always enabled, even with 0 selections.
- Selected buttons use `--c-cyan` tint (primary). Unselected use outline/border style matching `button.outline` from `design.css`.

### Validation

- On submit, serialize selected candidates as a comma-separated string of sorted values, e.g. `"1,2,3,6,12"`.
- `validate(answer, exercise)` performs set-equality comparison against `exercise.data.factors` (also stored as a comma-separated string).
- Exact set match required — no partial credit.

### Feedback

- Correct: show success message via `<Feedback>`. All selected factors coloured with `--c-correct`.
- Incorrect: show the user's selection and the correct factors as comma-separated strings through `<Feedback>`.
  - User-answer: incorrect colour (red).
  - Correct answer: "Correct factors: {list}".
- No per-button colouring post-submit; the simple text comparison is sufficient.

### Data representation

```ts
// exercise.data fields:
{
  n: number,
  factors: string,    // comma-separated sorted string, e.g. "1,2,3,4,6,12"
  candidates: number[], // the shuffled pool (factors ∪ distractors)
  promptKey: 'exercise.factors.title'
}
// exercise.answer: same comma-separated string as factors
```

### Component

Use the existing `TriviaCheckboxGroup.svelte` pattern:

- `TriviaCheckboxGroup` accepts `options: { latex?: string }[]` (each showing a candidate number), `selected: boolean[]`, `correctIndices: number[]`, `feedback`, `ontoggle`.
- Create `FactorSelectExercise.svelte` that wraps `TriviaCheckboxGroup`, reads `exercise.data`, holds `$state` for selection, serializes answer on submit.
- Registration via `defineExerciseType()` in `exerciseTypes.ts`.

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
