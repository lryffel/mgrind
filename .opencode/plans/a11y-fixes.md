# Fix accessibility by addressing root causes instead of suppressing warnings

## Description

The codebase suppresses four `a11y_*` Svelte warnings with `<!-- svelte-ignore -->` comments and contains several non-semantic interactive elements (divs with `role="button"`, anchors with `href="#!"`, articles with click handlers) that hurt screen-reader and keyboard users. This plan fixes the root causes so the suppressions can be removed, plus addresses missing ARIA labelling and keyboard patterns that escaped the linter entirely.

Scope is the UI components under `src/lib/components/`. Generator logic and tests in `src/lib/exercises/` are out of scope.

References: AGENTS.md (`Try to fix linting errors instead of ignoring them with magic comments`), STRUCTURE.md, design.css for the notebook card pattern.

## Acceptance Criteria

### Phase 1 — Remove the four `svelte-ignore` comments

1. **`DisciplineCard.svelte`** — Delete `<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->` (line 57). Replace the outer `<article role="link" tabindex="0">` with a real link: wrap the card in `<a class="discipline-card" href={'#' + discipline.id}>` (or, if hash routing is not desired, a `<button type="button" class="discipline-card">` that calls `onclick`). The rainbow `complete` styling and `.discipline-card` class must still apply. Update `App.svelte` to read the hash on popstate if `<a href>` is chosen.
2. **`ExerciseShell.svelte`** — Delete `<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->` (line 63). Replace the interactive `<article onclick={...} onkeydown={...}>` with a `<form onsubmit={...}>` (the article body becomes the form's content; the submit button becomes `type="submit"`). Keep the global Enter-key handler in `<svelte:window onkeydown>` but route submit through the form's submit event. The `<article>` styling in `design.css` (lines 293–321) should be re-scoped to a `.exercise-card` class selector so it continues to apply.
3. **`SettingsDropdown.svelte`** — Delete `<!-- svelte-ignore a11y_no_redundant_roles -->` (line 26). Remove `role="button"` from the `<summary>`; `<summary>` already has an implicit button role inside `<details>`. Keep `aria-label={_('settings')}`. Verify the dropdown still toggles with Enter/Space and Escape.
4. **`FactorsExercise.svelte`** — Delete `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->` (line 82). Replace the `<div role="group" tabindex="0">` with a `<fieldset class="factor-grid">` and add a `<legend class="sr-only">{_(data.promptKey)}</legend>` (sr-only = visually hidden, screen-reader visible). Add a global `.sr-only` utility class to `design.css` if one does not already exist.

Verification: `npm run lint` reports zero `a11y_*` ignores and zero new a11y warnings after Phase 1.

### Phase 2 — Replace non-semantic interactive elements

5. **`DisciplineCard.svelte` type rows** — Replace the `<div class="type-row" role="button" tabindex="0">` (lines 88–109) with a `<button type="button" class="type-row">`. Move the inner checkbox into a separate non-focusable element (it becomes a visual indicator: `<span class="check-indicator" aria-hidden="true">`) and reflect disabled/enabled state on the button via `aria-pressed`. The checkbox `<input tabindex="-1">` workaround (line 103) can then be removed. Each row button must still show the progress bar and complexity number.
6. **`SettingsDropdown.svelte` reset action** — Replace `<a href="#!" onclick={handleReset}>` (line 46) with `<button type="button" class="dropdown-item" onclick={handleReset}>`. Add `.dropdown-item` styles to `design.css` matching the existing menu link appearance (block, full-width, padding `0.5rem 0.75rem`). Remove `dir="rtl"` if it was only there to compensate for the dropdown anchor; otherwise keep it.
7. **`BatchChoiceCard.svelte`** — Replace the per-row `<div class="button-group" role="group">` (line 77) with `<fieldset class="button-group">` and add a `<legend class="sr-only">{row.latex}</legend>` per row using `{#each rows}`. Alternatively, if `<fieldset>` is too invasive to the grid layout, keep the `<div>` but add `role="group" aria-label={row.latex}`.
8. **`MultiChoiceCard.svelte`** — Same treatment as criterion 7: replace `<div class="option-grid" role="group">` (line 54) with `<fieldset>` + `<legend class="sr-only">` driven by `promptKey`/`exercise.prompt`, OR add `aria-label` to the existing group div.
9. **`FactoringOutAndBinomial.svelte`** — Add `aria-label`s to the nested `<div role="group">` elements (lines 103, 104): outer gets `aria-label={_('exercise.factoringOutAndBinomial.prompt')}`, inner `aria-label={_('exercise.factoringOutAndBinomial.commonFactor')}` plus a second for the formula selector. The surrounding `<label class="config-item">` elements are already correct.

### Phase 3 — Missing ARIA labelling

10. **`NumericInput.svelte`** — Add an optional `ariaLabel?: string` prop (default `''`). Pass it through to every `<input>`. Update every call site that renders an input with visual-only context (`A = `, `U = `, the coefficient fields in `FactoringOut.svelte`, `FactoringOutAndBinomial.svelte`, `Pythagoras.svelte`, `InteriorAngles.svelte`, `AreaAndPerimeterExercise.svelte`) to provide a descriptive `ariaLabel` built from i18n keys such as `exercise.pythagoras.missingSide` or a generic `'answer'` key.
11. **`SingleChoiceCard.svelte`** — Each option `<button role="radio">` (lines 48–62) must have an `aria-label` derived from `option.text ?? option.textDe ?? _(option.label ?? '')`. Render the visible content inside the button as-is; the `aria-label` provides a plain-text alternative for LaTeX options.
12. **`MultiChoiceCard.svelte` and `FactorsExercise.svelte`** — Each `<button role="checkbox">` (MultiChoiceCard lines 57–69, Factors lines 92–101) must have an `aria-label` computed the same way as criterion 11. Add an `OptionText` accessor helper to `cardData.ts` if the same logic appears in three places.
13. **`SvgContainer.svelte`** — Add a required `ariaLabel: string` prop and apply it as `role="img"` plus `aria-label` on the `<svg>` element. Update call sites in `Pythagoras.svelte` (e.g. `ariaLabel={_('exercise.pythagoras.name')}`) and `InteriorAngles.svelte` and `AreaAndPerimeterExercise.svelte` (with shape-specific labels such as `_('exercise.areaAndPerimeter.name') + ': ' + data.shape`).
14. **`ProgressBar.svelte`** — Render a textual `aria-valuetext` (e.g. `{Math.round(value * 100)}%`) in addition to `aria-valuenow`, since the value is a fraction 0–1 but the bar is shown as percent. Add an optional `label?: string` prop that, when present, also sets `aria-label` on the progressbar (used by `DisciplineCard` and `ExerciseScreen` to give context, e.g. `'discipline numbers'`).
15. **`Modal.svelte`** — Add an optional `ariaLabelledby?: string` prop and render `aria-labelledby={ariaLabelledby}` on the `<dialog>`. In `DisciplineCard.svelte` (prerequisite modal), `SettingsDropdown.svelte` (confirm) and `ExerciseShell.svelte` (help modal), add an `id` to the modal's `<h3>`/heading and pass it through.

### Phase 4 — Keyboard navigation polish

16. **`SingleChoiceCard.svelte`** — Implement roving-tabindex radio-key semantics inside the `role="radiogroup"`: a single tab stop, Arrow Up/Down and Left/Right move focus between options, wrapping at the ends. Reuse the pattern via a small `rovingRadiogroup(node)` Svelte action placed in `src/lib/actions/rovingRadiogroup.ts` if more than one radiogroup component benefits.
17. **`DisciplineCard.svelte` gear toggle** — Add `aria-expanded={open}` and `aria-controls={gearPanelId}` to the gear `<button>`, and give the `.type-list` container the matching `id`. Replace the visually-only `⌄`/`⌃` glyph with a CSS-rotated chevron (or wrap the glyph in `<span aria-hidden="true">`) so screen readers no longer announce "down right" / "circumflex".
18. **`Pythagoras.svelte` and `AreaAndPerimeterExercise.svelte` cannot-compute button** — Acceptable as-is (real `<button>` with text); verify the short translated text is descriptive enough. If not, add a visible `title` already present — keep as-is, do nothing. (No action expected unless review surfaces issues.)
19. **Global focus-visible outline** — Verify via manual tab-through that every interactive element visibly receives a focus ring in both light and dark themes. `design.css` already has `:focus-visible` outlines on buttons/inputs/links; ensure the new `<button class="type-row">` and `<button class="dropdown-item">` from criteria 5–6 inherit or add their own `:focus-visible` rule.

### Phase 5 — Tests & docs

20. **Tests** — Expand the placeholder `ExerciseShell.test.ts` (currently 8 lines, only asserts the component imports) into real render tests using `@testing-library/svelte` (already or to be added via `vitest`'s DOM environment) covering: Enter submits, focus moves to first input after feedback resets, validation message appears. Add a `DisciplineCard.test.ts` covering: clicking a type row when prerequisites are met triggers `onSelectType`; locked type row opens the modal; Enter on the discipline card triggers `onclick`. Add `Modal.test.ts` coverage for `aria-labelledby` plumbing.
21. **AGENTS.md** — Update the bullet about `<!-- svelte-ignore a11y_* -->` to record that suppressions are no longer needed for the cards/shell/dropdown, and that `<form onsubmit>` replaces the interactive `<article>`. If `.sr-only` was introduced, mention it alongside `design.css`.
22. **STRUCTURE.md** — Update the "ExerciseShell.svelte" row to note it is now a `<form>` rather than an `<article>`. Add a row for `rovingRadiogroup` action if added in criterion 16.

## Progress

## Blockers

## Notes

- The existing `<article>` selector in `design.css` (lines 293–321) is currently tag-based; criterion 2 re-scopes it to `.exercise-card`. Make sure no test snapshot relies on the `<article>` tag.
- Svelte 5's `<svelte:window onkeydown>` already forwards Enter to submit in many cards; criterion 2 replaces that with a real form `submit` event. The `<form>` approach is preferable because it also enables native browser form semantics (Enter in any input submits).
- Color contrast: not explicitly audited in this plan; the existing `--c-text-muted: #777` on `#fafafa` is borderline (4.45:1) — if Phase 5 surfaces issues, raise to `#6b6b6b`.
- All new user-visible strings (e.g. `aria-label`s) must go through `_('key')` per AGENTS.md; add the corresponding `en`/`de` entries in `i18n.svelte.ts`.
