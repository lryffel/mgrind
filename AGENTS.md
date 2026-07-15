- Write tests for everything you implement, unless the user agrees that it is unnecessary.
  - Shared test utilities in `src/lib/test-utils.ts`: `expectDeterministic`, `expectSeedVariation`, `expectHasPromptAndAnswer`
- Try to fix linting errors instead of ignoring them with magic comments.
- After implementing a feature, fixing a bug or refactoring, check whether any skills, AGENTS.md or STRUCTURE.md need an update.

- `STRUCTURE.md` describes the codebase architecture — read it first.

- `src/test-setup.ts` mocks `localStorage` globally for tests

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`, `mount`
- i18n: `_('key')` from `src/lib/i18n.svelte.ts`; lang persisted in localStorage
  - `_('key')` is strictly typed: `key` must be a `DictKey` (i.e. `keyof typeof dict`, exported from the same module). Literal misspellings at call sites are compile errors.
  - All user-visible strings (including `aria-label`) must use `_('key')`
  - To add a new key, add an entry to `dict` in `i18n.svelte.ts` with `en` and `de` values
  - When storing i18n keys in a generator data interface field that is later passed to `_()` (e.g. `promptKey`, option `label`, `promptArgKeys`), type the field as `DictKey` so the literal assignment is compile-checked. `_()` keeps a defensive runtime fallback to the key string for the few unavoidable casts.
- Progress: `src/lib/progress.svelte.ts`; persisted in localStorage
- Exercise types: `{ generate(seed, complexity): Exercise, validate(answer, exercise): boolean }`
  - Register in `src/lib/data/exerciseTypes.ts` using `defineExerciseType()` — pass `id`, `generate`, and optional fields; `nameKey`/`descriptionKey` are **derived** from `id` (`exercise.<id>.name` / `.desc`), do NOT pass them by hand.
  - Generators clamp complexity: `clampComplexity(complexity, max)` from `src/lib/math/number.ts`
  - Multi-field validation: `validateMultiField` from `src/lib/validation.ts`
  - Use `mulberry32(seed)` as the single RNG — no inline `Math.random()`
  - Each type defines and exports its own data interface (e.g. `MultiplicationFractionData`) in its generator module. `Exercise.data` is `unknown` — consumers must cast. Type any field holding an i18n key as `DictKey` (imported from `src/lib/i18n.svelte.ts`); the registry convention tests in `src/lib/data/registry.test.ts` catch any missed cross-references (orphan types, dangling discipline/prereq refs, missing i18n keys) at test time.
- Exercise card patterns: `CardPattern` type in `src/lib/types.ts`. Generators set `exercise.pattern` to select a generic card template from `src/lib/components/cards/`. Patterns: `text-input`, `fraction-input`, `multi-field`, `batch-choice`, `single-choice`, `multi-choice`, `prime-factors`, `custom`. Patterned types need zero component code. `'custom'` types need a component in `src/lib/components/exercises/`.
- `src/lib/components/cards/` contains 7 generic card templates: `CardRegistry.svelte` routes by `exercise.pattern`. `NumericInput.svelte` and `PrimeFactorInput.svelte` live in `src/lib/components/` (shared between cards and custom components).
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

- End-to-end tests use Playwright: `e2e/*.spec.ts`; run via `npm run test:e2e` (first build with `npm run build`)
- `test:e2e:ui` opens the Playwright UI mode
- `e2e/exercise-render.spec.ts` generates one test per exercise type at runtime via the disciplines data file

## Naming conventions

- Exercise generators: `camelCase.ts` in `src/lib/exercises/`
- Svelte components: `PascalCase.svelte` in `src/lib/components/`
- Test files: `sourceName.test.ts` co-located beside source
- Modules with Svelte reactivity: `moduleName.svelte.ts`
