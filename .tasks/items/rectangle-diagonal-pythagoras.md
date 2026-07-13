# Add diagonals of rectangles to the Pythagoras exercise type

## Description

Extend the existing Pythagoras exercise (`src/lib/exercises/pythagoras.ts`, `Pythagoras.svelte`) with a `subType: 'rectangle-diagonal'`. Generate a rectangle with sides `a`, `b` and diagonal `d` (from a Pythagorean triple), ask for the missing side.

## Acceptance Criteria

### Integration

- New `data.subType: 'triangle' | 'rectangle-diagonal'` in the existing Pythagoras generator.
- Same exercise type id (`pythagoras`), same discipline (`geometry`), same answer format (integer or reduced fraction).
- Existing `validatePythagoras` unchanged — it already handles fraction comparisons and works for both.

### Generation

- Use same Pythagorean triples as the triangle variant (`rightTriples` + scaled multiples).
- Assign sides: `a = triple[0]`, `b = triple[1]`, `d = triple[2]`.
- Randomly swap `a` ↔ `b` to avoid fixed orientation.
- Three variants (selected by seed):
  - A (levels 0+): given `a`, `b` → find `d`
  - B (levels 5+): given `a`, `d` → find `b`
  - C (levels 5+): given `b`, `d` → find `a`
- At levels 0–4, always variant A. At 5+ uniform among active variants.

### Complexity scaling

| Level | Rectangle specifics                                         |
| ----: | :---------------------------------------------------------- |
|   0–2 | Variant A only, small triples (3-4-5, 5-12-13)              |
|   3–4 | Variant A, larger triples including non-primitive multiples |
|   5–6 | + variants B and C, legs up to ~60                          |
|   7–8 | all three variants, triples up to ~100                      |
|  9–10 | triples up to ~200                                          |

### SVG display

- Extend `Pythagoras.svelte` to detect `subType === 'rectangle-diagonal'`.
- Draw rectangle with sides proportional to `a:b` (scaled to fit SVG container).
- Solid strokes for the four sides, labels `a` (bottom edge) and `b` (left edge).
- Solid diagonal corner-to-opposite-corner, label `d` near centre with offset.
- The unknown side shows the input widget; known sides show their value via `<Math>`.
- Uses the same `<SvgContainer>` and overlay approach as the triangle variant.

### Data representation

```ts
// New fields on existing Pythagoras exercise data:
{
  subType: 'rectangle-diagonal' | 'triangle',
  rectA: number,       // reduced numerator for side a
  rectADen: number,    // denominator (always 1 for integer triples)
  rectB: number,       // side b
  rectBDen: number,
  rectD: number,       // diagonal
  rectDDen: number,
  missingSide: 'a' | 'b' | 'd',
}
// exercise.answer: same as existing — integer string or "num/den"
// For 'triangle' subType: existing fields unchanged
```

### i18n

No new keys needed — the existing `exercise.pythagoras.prompt` applies. The SVG labels `a`, `b`, `d` are rendered directly via `<Math>`.

### Constraints

- Never emit irrational diagonals — only Pythagorean triples used.
- No "cannot compute" variant for rectangles (rectangle diagonals are always computable).
- Existing triangle variant behavior completely unchanged.

### Test coverage

1. Rectangle-diagonal exercises are generated at appropriate complexity bands.
2. Correct answer computed for all three variants (A, B, C).
3. SVG renders correct rectangle proportions.
4. Existing triangle tests still pass (backward compatibility).
5. Deterministic for same seed/complexity.

## Progress

## Blockers

## Notes

Original: `TODO.md` — Exercise Extensions
