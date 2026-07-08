Don't infer design decisions.

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
- `src/test-setup.ts` mocks `localStorage` globally for tests

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`, `mount`
- i18n: `_('key')` from `src/lib/i18n.svelte.ts`; lang persisted in localStorage
- Progress: `src/lib/progress.svelte.ts`; persisted in localStorage
- Exercise types: `{ generate(seed, complexity): Exercise, validate(answer, exercise): boolean }`
  — register in `src/lib/data/exerciseTypes.ts`
- Disciplines: array in `src/lib/data/disciplines.ts`
- Exercises use deterministic PRNG (`mulberry32`); seed = `Date.now()`
- `CONCEPT.md` describes the app design — use it for guidance, don't infer

- `Math.svelte` renders LaTeX via KaTeX (`katex.renderToString`); expressions use standard LaTeX (`\cdot`, `\frac{}{}`, `\sqrt{}`, `^{}`)
  - ⚠️ Svelte static attributes (`expression="\\cdot"`) treat backslashes literally → produces `\\cdot` (double backslash) at runtime, which KaTeX misparses. Always use JS expressions: `expression={'\\cdot'}`
- `@picocss/pico` v2 is the only dependency — drive visual design through Pico classes (`role="group"`, `outline`, `<progress>`) before writing custom CSS
- `Exercise.fields` (optional `ExerciseField[]`) provides multi-input answer mode for prime factorisation; `null` → single text input, present → multiple number inputs
- Interactive `<article>` cards use `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->` and `a11y_no_noninteractive_element_interactions` comments to suppress Svelte a11y warnings
