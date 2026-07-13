# Percentages (Prozentrechnen)

## Description

Generate percentage and ratio problems: find the part, whole, or percentage of a value; direct and inverse proportion via rule of three. All problems solvable without notes or calculator (clean numbers, simple arithmetic).

## Acceptance Criteria

### Problem variants

Five variants selected by seed:

| ID  | Type                      | Example en                                            | Example de                                              |
| --- | ------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| A   | Find part (percentage of) | `15\% \text{ of } 80`                                 | `15\% \text{ von } 80`                                  |
| B   | Find whole                | `24 \text{ is } 30\% \text{ of what?}`                | `24 \text{ sind } 30\% \text{ von welcher Zahl?}`       |
| C   | Find percentage           | `\text{What % of } 60 \text{ is } 15?`                | `\text{Wie viel % von } 60 \text{ sind } 15?`           |
| D   | Direct proportion         | `5 \text{ apples cost } 3 \text{ CHF. } 8?`           | `5 \text{ Äpfel kosten } 3 \text{ CHF. } 8?`            |
| E   | Inverse proportion        | `4 \text{ workers } 6 \text{ h. } 3 \text{ workers?}` | `4 \text{ Arbeiter } 6 \text{ h. } 3 \text{ Arbeiter?}` |

### No-calculator guarantee

All numbers are chosen so that every computation step uses only small integer arithmetic (multiplication and division of numbers ≤ 1000, results always terminate). Concretely:

- Percentages `p` are multiples of 5 or 12.5, 37.5, 62.5, 87.5 (eighths).
- Variants A/B/C: `p * G` is always divisible by 100.
- Variants D/E: the ratio `n₁/n₂` always produces a terminating decimal ≤ 3 places; unit quantities (apples, workers) are small (≤ 20).

### Complexity scaling

| Level | Variants | Numbers                                | Notes                       |
| ----: | :------- | :------------------------------------- | :-------------------------- |
|   0–2 | A, D     | `G ∈ [20,100]`, `p ∈ {10,20,25,50,75}` | all integer results         |
|   3–4 | +B, C    | `G ∈ [40,400]`, `p ≤ 120`              | p > 100% allowed at 4       |
|   5–7 | +E       | `G ∈ [60,1000]`, `p ∈ [1,200]` 1 dp    | max 2 dp results            |
|  8–10 | all      | `G ∈ [100,1000]`, `p` round %          | values stay calculator-free |

### Generation

- RNG: `mulberry32(seed)` — pick variant with `pick()` from the active pool, generate parameters.
- All results are exact (integer or terminating decimal, max 2 dp).
- Percentage result values (variants A, B, C) produced as reduced fraction where possible, or integer.
- Proportion results (D, E) always produce integer or 1–2 dp decimal.

### UI / Component

- Single `NumericInput` field (fraction mode) — accepts integers, decimals (period), and fractions (`a/b`).
- Prompt uses `<Math>` with text via `\text{}` inside LaTeX.
- Existing `TextInputExercise.svelte` or custom component (evaluate on implementation).

### Validation

Custom `validatePercentage(answer, exercise)`:

- Parse answer — accept `"25"`, `"25%"`.
- For fraction answers (`exercise.data.answerIsFraction: true`): use `validateFractionAnswer` logic.
- For numeric answers: exact string comparison after normalisation.
- Strip trailing `%` before numeric comparison. `"25%"` → `25`.

### Data representation

```ts
{
  variant: 'A' | 'B' | 'C' | 'D' | 'E',
  promptKey: 'exercise.percent.prompt',
  answerIsFraction: boolean,
}
// exercise.answer = numeric string or fraction "num,den"
```

### i18n keys

| Key                         | en                                    | de                                             |
| --------------------------- | ------------------------------------- | ---------------------------------------------- |
| `exercise.percent.name`     | "Percentages"                         | "Prozentrechnen"                               |
| `exercise.percent.desc`     | "Solve percentage and ratio problems" | "Löse Prozent- und Verhältnisaufgaben"         |
| `exercise.percent.prompt`   | "Calculate."                          | "Berechne."                                    |
| `exercise.percent.variantA` | "{p}\% of {G}"                        | "{p}\% von {G}"                                |
| `exercise.percent.variantB` | "{W} is {p}\% of what number?"        | "{W} sind {p}\% von welcher Zahl?"             |
| `exercise.percent.variantC` | "What percent of {G} is {W}?"         | "Wie viel % von {G} sind {W}?"                 |
| `exercise.percent.variantD` | "{n1} cost {c1}. How much for {n2}?"  | "{n1} kosten {c1}. Was kosten {n2}?"           |
| `exercise.percent.variantE` | "{n1} need {t1}. How long for {n2}?"  | "{n1} brauchen {t1}. Wie lange brauchen {n2}?" |

### Discipline

- `numbers` — add exercise type id `percent`.

### Test coverage

1. Deterministic for same seed and complexity.
2. Each variant produces correct results (verified by independent computation).
3. All five variants appear across seeds at appropriate complexity bands.
4. No result requires more than simple mental arithmetic to compute.
5. All results are terminating (no repeating decimals).
6. Edge: `p = 0` excluded; `p = 100` allowed rarely (< 2% of generations).
7. Edge: `G = 0` excluded; `W = 0` excluded.
8. Complexity clamping.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types. English names throughout (file, functions, variables).
