---
name: new-exercise
description: Create a new exercise type
---

Steps to add a new exercise type. If asked to design it, first form an idea and check with the designer subagent whether it is pedagogically appropriate.

## 1. Generator — `src/lib/exercises/<name>.ts`

Export `function generate<Name>(seed: number, complexity: number): Exercise`.

```ts
import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * (9 + clamped)) + 2;
  const b = Math.floor(rng() * (9 + clamped)) + 2;
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b), pattern: 'text-input' };
}
```

- Use `clampComplexity(complexity, max)` — never `Math.min(Math.max(...))`.
- Use `mulberry32(seed)` as the single RNG — no `Math.random()`.
- `Exercise`: `{ prompt: string, answer: string, pattern?: CardPattern, data?: unknown }`.
- **Set `pattern`** to the card pattern that renders this type. This determines which generic card template is used.

### Pattern → data contract → no component needed

If the type fits a pattern, `data` must match the expected shape:

| Pattern          | `data` shape                                                                                          | No component needed     |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| `text-input`     | `{ promptKey?: string; promptArgs?: string[]; placeholder?: string }`                                 | Yes                     |
| `fraction-input` | `{ promptKey?: string; promptArgs?: string[] }` (plus `num1,den1,num2,den2,op` for binary operations) | Yes                     |
| `multi-field`    | `{ promptKey?: string; fields: { variablePart: string }[] }`                                          | Yes                     |
| `batch-choice`   | `{ promptKey?: string; rows: { latex: string; latex2?: string }[]; buttons: string[] }`               | Yes                     |
| `single-choice`  | `{ promptKey?: string; options: { label?: string; latex?: string }[] }`                               | Yes                     |
| `multi-choice`   | `{ promptKey?: string; options: { label?: string; latex?: string }[] }`                               | Yes                     |
| `prime-factors`  | `{ promptKey?: string; primes: number[] }`                                                            | Yes                     |
| `custom`         | Any shape (your component handles it)                                                                 | No (component required) |

### Default complexity max

Use `10` unless you have a specific reason for fewer levels. The registry's `maxComplexity` must match this value.

### Validation

- **Simple trim compare**: use `trimCompare` from `../validation` (the default in `defineExerciseType`).
- **Fraction answer**: use `validateFractionAnswer` or `validateFractionReduced`.
- **Multi-field** (comma-separated with `fracEqual`): use `validateMultiField` from `../validation`.
- **Custom**: export `function validate<Name>(answer: string, exercise: Exercise): boolean`.

## 2. Component (optional)

### Pattern-based types — zero component code

If your type fits one of the `CardPattern` patterns above, **no component is needed.** The generic card template in `src/lib/components/cards/` handles rendering automatically. Just set the `pattern` field in the generator.

### Custom component

Only for types that use `'custom'` pattern. Write `src/lib/components/exercises/<Name>.svelte`. Accept `ExerciseProps`:

```ts
let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();
```

**Pattern**:

- Input mode (`feedback === null`): show prompt + input. Call `onSubmit(answer)`.
- Feedback mode (`feedback !== null`): show prompt + `<Feedback>`.
- Use `<ExerciseShell>` wrapper (handles Enter key, focus, submit/next buttons).
- Use `<NumericInput>` for all user input — no raw `<input>`.
- Import `NumericInput` from `../NumericInput.svelte` (shared component at `src/lib/components/`).

### Feedback guidelines

- Pass `correctLatex` (LaTeX string) to `<Feedback>` for math-formatted correct answer.
- Pass `textAnswer` (plain string) to `<Feedback>` if no LaTeX version exists.
- Pass `correctMessage` (i18n key result) to override the default "Correct!" message.
- Show extra warnings below `<Feedback>` (reducible fractions, sign conventions, etc.).
- Use `validationError` on `<ExerciseShell>` for input errors (e.g. decimal comma).

```svelte
<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(answer)} {onNext} {validationError}>
  {#if feedback === null}
    <Math expression={exercise.prompt} display />
    <NumericInput bind:value={userInput} />
  {:else}
    <Math expression={exercise.prompt} display />
    <Feedback {feedback} correctLatex={correctAnswerLatex} />
    {#if warningCondition}
      <p class="feedback warning"><Math expression={warningLatex} /></p>
    {/if}
  {/if}
</ExerciseShell>
```

### SVG overlays and label positioning

When rendering `<SvgContainer>` with labeled overlays:

- **Label offsets must be proportional to shape size.** Compute offsets from the shape's bounding box.
- **Use `vector-effect="non-scaling-stroke"`** on SVG elements so stroke widths stay consistent.

### Input composables

- **Fraction**: `useFractionInput()` from `../../fraction-input.svelte` → `num`, `den`, `getSubmitValue()`, `userLatex`.
- **Superscript** (exponents): `<NumericInput bind:value={val} superscript context="exponent" />`.
- **Coefficient** (polynomial terms): `<NumericInput bind:value={val} variablePart={latex} context="coefficient" />`.
- Normalise with `normalizeCoeff(s, context)` from `../../validation`.

## 3. Instructions (optional)

Create `src/lib/components/exerciseInstructions/<Name>Instructions.svelte` for the help modal.

```svelte
<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';
  const someLatex = 'A = \\frac{1}{2} \\cdot b \\cdot h';
</script>

{#if state.lang === 'en'}
  <p>English instructions <Math expression={someLatex} /></p>
{:else}
  <p>Deutsche Anleitung</p>
{/if}
```

⚠️ **Always use JS variables for LaTeX containing backslashes** (`\frac`, `\cdot`, `\pi`, etc.). Never put backslash sequences directly in HTML attribute strings — use a `const` in `<script>` and pass it via `{expression}` binding.

Register via `instructionComponent` in step 4. The `?` button appears automatically.

## 4. i18n — `src/lib/i18n.svelte.ts`

Add to `dict`:

| Key                    | Purpose                             |
| ---------------------- | ----------------------------------- |
| `exercise.<id>.name`   | Display name                        |
| `exercise.<id>.desc`   | Short description                   |
| `exercise.<id>.prompt` | Imperative label (e.g. "Simplify.") |

Use Swiss orthography (no "ß", always "ss": "gross", "Masse").

To show a prompt label in the card, set `data.promptKey: 'exercise.<id>.prompt'` in the generator and render with `{_(promptKey)}` with class `prompt-label`.

## 5. Register — `src/lib/data/exerciseTypes.ts`

```ts
import { generate<Name>, validate<Name> } from '../exercises/<name>';
// import <Name>Component from '../components/exercises/<Name>.svelte'; // only for custom types

// ... in exerciseTypes:
<id>: defineExerciseType({
  id: '<id>',
  nameKey: 'exercise.<id>.name',
  descriptionKey: 'exercise.<id>.desc',
  generate: generate<Name>,
  // validate — defaults to trimCompare
  // component — omit for patterned types; include for 'custom' types
  // maxComplexity — defaults to 10
  // prerequisites?: Prerequisite[]
  // instructionComponent?: Component
}),
```

`defineExerciseType` provides sensible defaults — only specify what differs from defaults. If the type uses a pattern (defined in the generator), omit `component`. If the type is `'custom'`, include the component.

## 6. Discipline — `src/lib/data/disciplines.ts`

Add the type's `id` to one or more discipline's `exerciseTypeIds` arrays.

## 7. Verify

```sh
npm run check
npm run lint
npm run test
```
