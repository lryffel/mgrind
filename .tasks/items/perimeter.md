# Perimeter (Umfang von Dreiecken, Vierecken, Kreisen)

## Description

Compute the exact perimeter of a polygon or circumference of a circle. Only exact answers accepted — no decimal approximations. For circle circumference, the coefficient of π is entered via a `CoefficientField`.

## Acceptance Criteria

### Problem variants

| Shape         | Formula             | Target unknown                                |
| :------------ | :------------------ | :-------------------------------------------- |
| Triangle      | `P = a + b + c`     | Perimeter (0–3), missing side (4–5)           |
| Quadrilateral | `P = a + b + c + d` | Perimeter (0–3), missing side (4–5)           |
| Circle        | `U = 2 \pi r`       | Circumference (exact: enter coefficient of π) |

### Exact answers only

- All polygon answers are exact integers or reduced fractions. No decimal estimates.
- Circle answers: student enters only the coefficient of `2π` (or `π`). A `CoefficientField` with `variablePart = '\pi'` renders as `[□] π`. For the formula `U = 2πr`, the coefficient is `2r`. The answer is the exact coefficient (integer or fraction), e.g. for `r = 5`, answer is `10` (because `10π`). Validator checks exact match.
- The prompt shows `U = 2 \pi r`; the input field shows `[__] \pi`.

### Complexity scaling

| Level | Shapes         | Dims          | Action               |
| ----: | :------------- | :------------ | :------------------- |
|   0–1 | triangle, quad | int ≤10       | compute perimeter    |
|   2–3 | all            | ≤20, 1 dp     | compute perimeter    |
|   4–5 | all            | int/decimal   | missing side given P |
|   6–7 | +circle        | `r` int       | enter π-coefficient  |
|   8–9 | quad           | up to 6 sides | mixed units          |
|    10 | all            | up to 2 dp    | any variant          |

### UI / Component

- Prompt as text + LaTeX: `P_\triangle = 3\,\text{cm} + 4\,\text{cm} + 5\,\text{cm}`.
- For non-circle: single `NumericInput`. Answer is integer or fraction `"num,den"`.
- For circle: `CoefficientField(\pi)`. Answer is the coefficient string (e.g. `"10"` or `"10/3"`).
- Custom `PerimeterExercise.svelte` component.

### Data representation

```ts
{
  shape: 'triangle' | 'quadrilateral' | 'circle',
  sides: number[],
  target: 'perimeter' | 'side',
  promptKey: 'exercise.perimeter.prompt'
}
// exercise.answer for polygon: integer string or reduced fraction "num,den"
// exercise.answer for circle: coefficient string e.g. "10" or "10/3"
```

### i18n

| Key                         | en                                       | de                                           |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| `exercise.perimeter.name`   | "Perimeter"                              | "Umfang"                                     |
| `exercise.perimeter.desc`   | "Compute perimeters of geometric shapes" | "Berechne Umfänge von geometrischen Figuren" |
| `exercise.perimeter.prompt` | "Calculate the perimeter."               | "Berechne den Umfang."                       |

### Discipline

- `geometry` — add exercise type id `perimeter`.

### Test coverage

1. Deterministic generation, all shapes appear in their bands.
2. All perimeters correct (sum of sides or `2r` as π-coefficient for circle).
3. Triangle inequality enforced.
4. Circle: `"10"` accepted; `"31.42"` rejected (no decimal approximations).
5. Missing-side problems compute correctly.
6. Complexity clamping.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types. English names throughout (file, functions, variables).
