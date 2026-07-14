# Fix solution highlighting in factor equations

## Description

Check the per-field highlighting colors in the factor equations exercise. When some solutions are correct and others are wrong, the colors might not clearly distinguish them.

## Acceptance Criteria

1. **Per-field correctness via `validateFactorEquationsPerRoot`** — Each root field in the FactorEquations component must be independently color-coded using `validateFactorEquationsPerRoot()` so the user sees per-field pass/fail, not just overall correctness.

2. **Per-field coloring** — Each field's displayed value must use its own color:
   - `--c-correct` (green) for correct roots
   - `--c-incorrect` (red) for incorrect roots
     Uses `.per-root .user-answer.correct` / `.per-root .user-answer.incorrect` classes from `design.css`.

3. **Card-level styles must not override per-root colors** — The global `.exercise-card.correct .user-answer` and `.exercise-card.incorrect .user-answer` rules must not override the more specific `.per-root .user-answer.correct` / `.per-root .user-answer.incorrect` selectors. If specificity is an issue, increase specificity of the per-root selectors or restructure the component to avoid the cascade.

4. **Mixed correctness** — When some fields are correct and others incorrect, each field must clearly show its own color so the user can immediately see which roots they got right and which wrong.

5. **Test three answer scenarios** — Write tests (using `validateFactorEquationsPerRoot`) covering at least:
   - All roots correct
   - All roots incorrect
   - Mixed: some correct, some incorrect
     Verify each scenario produces the expected per-field `boolean[]`.

## Progress

## Blockers

## Notes

Original: `TODO.md` — Existing Exercise Improvements
