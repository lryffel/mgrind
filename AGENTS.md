- Don't infer design decisions.
- Always check whether you can use abstracted code. If you see an opportunity, ask whether you should abstract.
- Write tests for everything you implement, unless the user agrees that it is unnecessary.
  - Shared test utilities in `src/lib/test-utils.ts`: `expectDeterministic`, `expectSeedVariation`, `expectHasPromptAndAnswer`
- Try to fix linting errors instead of ignoring them.
- After implementing a feature, fixing a bug or refactoring, check whether any skills, AGENTS.md or STRUCTURE.md need an update.

- `STRUCTURE.md` describes the codebase architecture — read it first.

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run check` — typecheck (svelte-check + tsc)
- `npm run test` — vitest; tests co-located as `*.test.ts` beside sources
- `npm run format` — prettier --write
- `npm run format:check` — prettier --check
- `npm run lint` — eslint
- `npm run lint:fix` — eslint --fix
- Pre-commit hooks (husky + lint-staged) auto-format with prettier. Use `git commit --no-verify` to skip if needed.
- `src/test-setup.ts` mocks `localStorage` globally for tests

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`, `mount`
- i18n: `_('key')` from `src/lib/i18n.svelte.ts`; lang persisted in localStorage
  - All user-visible strings (including `aria-label`) must use `_('key')`
  - To add a new key, add an entry to `dict` in `i18n.svelte.ts` with `en` and `de` values
- Progress: `src/lib/progress.svelte.ts`; persisted in localStorage
- Exercise types: `{ generate(seed, complexity): Exercise, validate(answer, exercise): boolean }`
  - Register in `src/lib/data/exerciseTypes.ts` using `defineExerciseType()`
  - Generators clamp complexity: `clampComplexity(complexity, max)` from `src/lib/math/number.ts`
  - Multi-field validation: `validateMultiField` from `src/lib/validation.ts`
  - Use `mulberry32(seed)` as the single RNG — no inline `Math.random()`
- Disciplines: array in `src/lib/data/disciplines.ts`
- Exercises use deterministic PRNG (`mulberry32`); seed = `Date.now()`
- `CONCEPT.md` describes the app design — use it for guidance, don't infer

- `Math.svelte` renders LaTeX via KaTeX (`katex.renderToString`); expressions use standard LaTeX (`\cdot`, `\frac{}{}`, `\sqrt{}`, `^{}`)
  - Optional `display` prop (default `false`) enables KaTeX display mode for standalone expressions
  - ⚠️ No math symbol (+, -, =, /, ^, ·, etc.) may ever appear outside KaTeX — all must be rendered through `<Math>`
- Design is custom (`src/design.css`) — no CSS framework. Theme via `--c-*` custom properties (cyan primary, magenta correct, red incorrect). Light/dark mode via `.light`/`.dark` on `<html>`.
- Notebook-style exercise cards: left-aligned, 3px border-left accent, toolbar with SVG help icon, `<hr>` before full-width submit button
- `<Feedback>` renders user answer in `<Math>` with `.user-answer` class (colored by correctness). Correct: message only. Incorrect: prefix + correct answer. Optional celebration animation on correct.
- `Exercise.data.fields` (optional `{ variablePart: string }[]`) provides multi-input answer mode (e.g. for collecting terms, binomial formulas); `null` or `undefined` → single text input, present → multiple inputs
- Interactive `<article>` cards use `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->` and `a11y_no_noninteractive_element_interactions` comments to suppress Svelte a11y warnings
- German text uses Swiss orthography: no "ß", always "ss" (e.g. "gross", "Masse", "Schweizer Strassenverordnung")

- `src/lib/katex.ts` wraps `katex.renderToString` — imported by `Math.svelte`
- `src/lib/instructionContext.svelte.ts` is a global singleton holding the current instruction component for the help modal

## Naming conventions

- Exercise generators: `camelCase.ts` in `src/lib/exercises/`
- Svelte components: `PascalCase.svelte` in `src/lib/components/`
- Test files: `sourceName.test.ts` co-located beside source
- Modules with Svelte reactivity: `moduleName.svelte.ts`
