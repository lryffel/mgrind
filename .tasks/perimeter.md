# Area & Perimeter (Fläche und Umfang)

## Description

Compute the area and/or perimeter of geometric shapes (rectangles, squares, triangles, circles, parallelograms, composites). Answers are exact — no decimal approximations. Circle answers stay in symbolic π form via a `CoefficientField`.

Merges and supersedes the previous separate `area` and `perimeter` exercise types into a single unified type.

## Acceptance Criteria

### Problem variants

| Shape            | Area formula          | Perimeter formula    | Notes                                 |
| :--------------- | :-------------------- | :------------------- | :------------------------------------ |
| Rectangle        | `A = a b`             | `u = 2(a + b)`       |                                       |
| Square           | `A = s^2`             | `u = 4s`             |                                       |
| Triangle         | `A = ½ g h`           | `u = a + b + c`      | perimeter only when all 3 sides given |
| Right triangle   | `A = ½ a b`           | `u = a + b + c`      | Pythagorean triple; both computable   |
| Circle           | `A = π r^2`           | `u = 2 π r`          | symbolic π (coeff input)              |
| Parallelogram    | `A = g h`             | —                    | perimeter not asked (need slant)      |
| Annulus          | `A = π(R^2 - r^2)`    | `u = 2 π R` (outer)  | Tier H only                           |
| L-shape          | sum of sub-rectangles | sum of exposed edges | Tier H only                           |
| Rectangle + hole | `A_outer - A_inner`   | `u_outer + u_inner`  | Tier H only                           |

### Tier L (complexity 0–3, 1 pt) — one quantity, direct formula

| Complexity | Shapes                          | Asks                    | Dims     |
| ---------: | :------------------------------ | :---------------------- | :------- |
|        0–1 | rectangle, square, triangle     | area **or** perim (rng) | int ≤ 10 |
|        2–3 | +parallelogram, +right triangle | area **or** perim (rng) | int ≤ 20 |

### Tier M (complexity 4–7, 2 pts) — derived, multi-step, unit conversion

| Complexity | Shapes                | Asks                                      | Notes                         |
| ---------: | :-------------------- | :---------------------------------------- | :---------------------------- |
|        4–5 | rectangle, triangle   | both **or** inverted (given A → find dim) | area + perim, or missing side |
|        6–7 | +circle, +mixed units | both **or** derive r from A / u           | circle: derive r from A or u  |

### Tier H (complexity 8–10, 3 pts) — composites + distractors

| Complexity | Shapes                      | Asks                        | Notes                      |
| ---------: | :-------------------------- | :-------------------------- | :------------------------- |
|        8–9 | L-shape, rect+hole, annulus | both                        | composite figures          |
|         10 | all + distractors           | both **or** not enough info | ~40 % chance of distractor |

### Exact answers only

- All polygon answers: exact integers or reduced fractions (`"num,den"`). No decimal estimates.
- Circle answers: student enters only the coefficient. `CoefficientField` with `variablePart = '\pi'` renders as `[□] π`. For `u = 2πr` the coefficient is `2r`; for `A = πr^2` the coefficient is `r^2`. Validator checks exact match.
- The prompt shows the relevant formula; input field shows `[__] \pi`.

### Distractors (Tier H, complexity 10)

Inspired by Pythagoras's `cannot_compute` pattern. Problems where the student must recognise whether enough information exists.

**Underdetermined (not solvable):**

| #   | Given                       | Asked     | Why                                     |
| --- | :-------------------------- | :-------- | :-------------------------------------- |
| D1  | rectangle `u` only          | area      | infinite rects with same perimeter      |
| D2  | triangle `g`, `h` only      | perimeter | sides can't be derived from base+height |
| D3  | parallelogram `g`, `h` only | perimeter | slant unknown                           |

**Looks unsolvable, is solvable (trap):**

| #   | Given                      | Asked     | Why                             |
| --- | :------------------------- | :-------- | :------------------------------ |
| D4  | circle `A` only → find `u` | perimeter | `r = √(A/π)`, then `u = 2πr`    |
| D5  | circle `u` only → find `A` | area      | `r = u/(2π)`, then `A = πr^2`   |
| D6  | triangle sides `3, 4, 5`   | both      | right triangle, both computable |

**Distractor UI:** Use the same `submitExtra` snippet pattern as Pythagoras (`Pythagoras.svelte:130`). A "Not enough information" button renders next to the normal Submit button via `ExerciseShell`'s `submitExtra` slot. Clicking it submits `"cannot_compute"`. The normal numeric input is available alongside for students who think it's solvable. The validator matches `exercise.answer === "cannot_compute"` exactly.

### Complexity scaling summary

```
Tier L  (0–3):  ask ONE quantity (randomised), direct formula, no fractions
Tier M  (4–7):  ask BOTH quantities or inverted (given A → find dim), fractions allowed
Tier H  (8–10): ask BOTH, composites, distractors ~40 % chance
```

### Data representation

```ts
export interface AreaAndPerimeterData {
  shape:
    | 'rect'
    | 'square'
    | 'triangle'
    | 'triangleRight'
    | 'circle'
    | 'parallelogram'
    | 'annulus'
    | 'lShape'
    | 'rectWithHole';
  given: { label: string; value: string; unit: string }[];
  asks: ('area' | 'perim')[];
  solvable: boolean;
  unitArea: string;
  unitPerim: string;
  dims: { num: number; den: number; label: string }[];
  expected: {
    area?: string;
    perim?: string;
  };
  fields?: { variablePart: string }[];
  tipLevel: 1 | 2 | 3;
  vertices: { x: number; y: number }[];
  promptKey: string;
}
// exercise.answer: for single-field, the numeric string or "cannot_compute"
// exercise.answer: for multi-field, pipe-separated e.g. "24|20"
```

### UI / Component

- SVG diagram with labelled dimensions (reuse pattern from existing `AreaExercise.svelte`)
- For non-circle single-field: `NumericInput`
- For circle: `CoefficientField(\pi)`
- For multi-field (both quantities): two inputs (or one `CoefficientField` + one `NumericInput`)
- For distractors: radio group "Solvable" / "Not enough information" (reuse pattern from `Pythagoras.svelte`)
- Custom `AreaAndPerimeterExercise.svelte` component

### i18n

| Key                                            | en                                     | de                                              |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `exercise.areaAndPerimeter.name`               | "Area and Perimeter"                   | "Fläche und Umfang"                             |
| `exercise.areaAndPerimeter.desc`               | "Compute area and perimeter of shapes" | "Berechne Flächeninhalt und Umfang von Figuren" |
| `exercise.areaAndPerimeter.prompt`             | "Calculate the area and perimeter."    | "Berechne den Flächeninhalt und den Umfang."    |
| `exercise.areaAndPerimeter.promptArea`         | "Calculate the area."                  | "Berechne den Flächeninhalt."                   |
| `exercise.areaAndPerimeter.promptPerim`        | "Calculate the perimeter."             | "Berechne den Umfang."                          |
| `exercise.areaAndPerimeter.promptBoth`         | "Calculate the area and perimeter."    | "Berechne den Flächeninhalt und den Umfang."    |
| `exercise.areaAndPerimeter.cannotCompute`      | "Not enough information"               | "Nicht genügend Angaben"                        |
| `exercise.areaAndPerimeter.cannotComputeShort` | "Can't compute"                        | "Nicht berechenbar"                             |

The existing `exercise.area.*` keys and `exercise.perimeter.*` keys (if any) are replaced.

### Discipline

- `geometry` — replace `area` with `areaAndPerimeter` in `disciplines.ts`.

### Registration

In `exerciseTypes.ts`:

```ts
areaAndPerimeter: defineExerciseType({
  id: 'areaAndPerimeter',
  nameKey: 'exercise.areaAndPerimeter.name',
  descriptionKey: 'exercise.areaAndPerimeter.desc',
  maxComplexity: 10,
  generate: generateAreaAndPerimeter,
  validate: validateAreaAndPerimeter,
  component: AreaAndPerimeterExercise,
  instructionComponent: AreaAndPerimeterInstructions,
}),
```

Remove the old `area` entry.

### Validation

- `validateAreaAndPerimeter(answer, exercise)` — handles three cases:
  1. `exercise.answer === "cannot_compute"` → exact string match
  2. Single numeric → `fracEqual` or numeric comparison
  3. Pipe-delimited multi-field → split on `|`, validate each part
- Circle answers: accept the coefficient string (integer or fraction `"num,den"`)
- Multi-field: use `validateMultiField` from `src/lib/validation.ts`

### Test coverage

1. `expectDeterministic` across three seeds per tier band.
2. `expectSeedVariation` for the generator.
3. `expectHasPromptAndAnswer` on every tier.
4. All shapes appear in their expected complexity bands.
5. All computed answers correct (spot-check formulas).
6. Circle answers: `"25"` accepted, `"78.54"` rejected (no decimals).
7. Distractors: `"cannot_compute"` accepted when `solvable === false`; numeric rejected.
8. Distractors: numeric accepted when `solvable === true`.
9. Composite shapes: both area and perimeter computed correctly.
10. Multi-field validation round-trip.
11. Complexity clamping.
12. i18n keys exist for all prompt variants.

## Concrete worked examples

### Tier L — rectangle, area

```
Ein Rechteck hat die Seiten a = 6 cm und b = 4 cm.
Berechne den Flächeninhalt.
```

Answer: `24`. Validation: `fracEqual`.

### Tier L — circle, circumference

```
Ein Kreis hat den Radius r = 5 cm.
Berechne den Umfang.
```

Input: `CoefficientField(\pi)`. Answer: `10` (coefficient of `2πr`).

### Tier M — rectangle, inverted

```
Ein Rechteck hat den Flächeninhalt A = 24 cm² und die Seite b = 4 cm.
Berechne den Umfang.
```

Student derives `a = A/b = 6`, then `u = 2(6+4) = 20`. Answer: `20`.

### Tier M — circle, derive area from circumference

```
Ein Kreis hat den Umfang u = 10π cm.
Berechne den Flächeninhalt.
```

`r = u/(2π) = 5`, `A = π·25`. Answer coefficient: `25`.

### Tier H — annulus

```
Ein Kreisring hat den äusseren Radius R = 6 cm und den inneren Radius r = 4 cm.
Berechne die Ringfläche und den äusseren Umfang.
```

`A = π(36−16) = 20π`. `u = 2π·6 = 12π`. Multi-field: `20|12`.

### Tier H — distractor D1 (underdetermined)

```
Ein Rechteck hat den Umfang u = 20 cm.
Berechne den Flächeninhalt.
```

A "Nicht berechenbar" button appears next to Submit via `submitExtra` snippet.
Correct: click "Nicht berechenbar". Answer key: `"cannot_compute"`.

### Tier H — distractor D4 (solvable trap)

```
Ein Kreis hat den Flächeninhalt A = 9π cm².
Berechne den Umfang.
```

`r = √(A/π) = 3`, `u = 6π`. Solvable. Coefficient answer: `6`.

## Progress

## Blockers

## Notes

### Migration from existing `area` exercise

1. Create `src/lib/exercises/areaAndPerimeter.ts` with generator and validator.
2. Create `src/lib/components/exercises/AreaAndPerimeterExercise.svelte` (can extend or wrap the existing `AreaExercise.svelte` SVG rendering).
3. Create `src/lib/components/exerciseInstructions/AreaAndPerimeterInstructions.svelte`.
4. Register in `exerciseTypes.ts`, replace `area` in `disciplines.ts`.
5. Remove `src/lib/exercises/area.ts` and `src/lib/exercises/area.test.ts` (or re-export from new module for backwards compat — decide).
6. Remove `src/lib/components/exercises/AreaExercise.svelte` and `src/lib/components/exerciseInstructions/AreaInstructions.svelte`.
7. Add i18n keys, remove old `exercise.area.*` keys.

### Design reference

- Pythagoras `cannot_compute` pattern: `src/lib/exercises/pythagoras.ts:27–32` `Pythagoras.svelte:118–135` (submits `"cannot_compute"` via `submitExtra` button).
- Multi-field validation: `validateMultiField` in `src/lib/validation.ts`.
- Area SVG rendering: `AreaExercise.svelte` — reuse vertex computation and SVG overlay logic.
- Swiss orthography: no "ß", always "ss" (e.g. "äusseren", "Masse", "gross").
