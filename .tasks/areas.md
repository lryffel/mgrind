# Areas (Flächen von Dreiecken, Rechtecken, Parallelogrammen, Kreisen)

## Description

Compute the exact area of a polygon or circle given dimensions. Only exact answers accepted — no decimal approximations. For circle areas, the coefficient of π is entered via a `CoefficientField` (same component used in algebra exercises).

## Acceptance Criteria

### Problem variants

| Shape         | Formula               | Target unknown                                    |
| :------------ | :-------------------- | :------------------------------------------------ |
| Triangle      | `A = \frac{1}{2} b h` | Area (levels 0–3), missing dim (4–5)              |
| Rectangle     | `A = a b`             | Area (0–3), missing dim (4–5)                     |
| Parallelogram | `A = b h`             | Area (0–5), given slant + height distractor at 6+ |
| Circle        | `A = \pi r^{2}`       | Area (exact: enter coefficient of π)              |

### Exact answers only

- All polygon answers are exact integers or reduced fractions. No decimal estimates accepted.
- Circle answers: the student enters only the coefficient of π (the number that multiplies π). A `CoefficientField` with `variablePart = '\pi'` renders as `[□] π`. The answer is the exact coefficient (integer or fraction), e.g. for `r = 5`, answer is `25` (because `25π`). The validator checks exact match.
- The π symbol appears in the prompt as part of the formula (e.g. `A = \pi r^2`), and as the variable part of the `CoefficientField`.

### Complexity scaling

| Level | Shapes                | Dims               | Action                   |
| ----: | :-------------------- | :----------------- | :----------------------- |
|   0–1 | triangle, rectangle   | int ≤10            | compute area             |
|   2–3 | +parallelogram        | int ≤20, 1 dp at 3 | compute area             |
|   4–5 | all                   | int/decimal        | invert: find missing dim |
|   6–7 | +circle               | `r` int            | enter π-coefficient      |
|   8–9 | parallelogram (slant) | decimal            | pick correct dim         |
|    10 | all                   | mixed              | any variant              |

### UI / Component

- Prompt as text + LaTeX: `A_\triangle = \frac{1}{2} \cdot 5\,\text{cm} \cdot 3\,\text{cm}`.
- For non-circle: single `NumericInput` (plain number input). Answer is integer or fraction `"num,den"`.
- For circle: `CoefficientField(\pi)` — a text input followed by `π`. Answer is the coefficient string (e.g. `"25"` or `"25/4"`).
- Custom `AreaExercise.svelte` component.

### Data representation

```ts
{
  shape: 'triangle' | 'rectangle' | 'parallelogram' | 'circle',
  dim1: number,
  dim2?: number,
  target: 'area' | 'dim',
  promptKey: 'exercise.area.prompt'
}
// exercise.answer for polygon: reduced fraction "num,den" or integer string
// exercise.answer for circle: coefficient string e.g. "25" or "25/4"
```

### i18n

| Key                    | en                                  | de                                           |
| ---------------------- | ----------------------------------- | -------------------------------------------- |
| `exercise.area.name`   | "Areas"                             | "Flächen"                                    |
| `exercise.area.desc`   | "Compute areas of geometric shapes" | "Berechne Flächen von geometrischen Figuren" |
| `exercise.area.prompt` | "Calculate the area."               | "Berechne den Flächeninhalt."                |

### Discipline

- `geometry` — add exercise type id `area`.

### Test coverage

1. Deterministic generation, all shapes appear in their bands.
2. All computed areas correct.
3. Triangle inequality enforced for triangle dims.
4. Circle: `"25"` and `"25/4"` both valid as coefficients; `"78.54"` rejected.
5. Negative/zero dims rejected.
6. Inverted problems (find missing dim) compute correctly.
7. Complexity clamping.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types. English names throughout (file, functions, variables).
