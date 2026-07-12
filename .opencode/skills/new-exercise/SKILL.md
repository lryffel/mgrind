---
name: new-exercise
description: Create a new exercise type
---

Steps to add a new exercise type.

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
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b) };
}
```

- Use `clampComplexity(complexity, max)` — never `Math.min(Math.max(...))`.
- Use `mulberry32(seed)` as the single RNG — no `Math.random()`.
- `Exercise`: `{ prompt: string, answer: string, data?: ExerciseData }`.
  - Multi-input types: store `data.fields: { variablePart: string }[]` (see `collectingTerms`, `expand`).
  - Fraction types: store `data.num1, den1, num2, den2` for binary ops (see `additionFraction`).
- The prompt is LaTeX displayed via `<Math>`. Render all math through LaTeX — never raw symbols outside KaTeX.

### Default complexity max

Use `10` unless you have a specific reason for fewer levels. The registry's `maxComplexity` must match this value.

### Validation

- **Simple trim compare**: use `trimCompare` from `../validation` (the default in `defineExerciseType`).
- **Fraction answer**: use `validateFractionAnswer` or `validateFractionReduced`.
- **Multi-field** (comma-separated with `fracEqual`): use `validateMultiField` from `../validation`.
- **Custom**: export `function validate<Name>(answer: string, exercise: Exercise): boolean`.

## 2. Component — `src/lib/components/exercises/`

### Option A — Reuse existing

| Use case            | Component              |
| ------------------- | ---------------------- |
| Single text input   | `TextInputExercise`    |
| Fraction input      | `FractionExercise`     |
| Multi-field (terms) | `MultiFieldExercise`   |

### Option B — Custom component

Write `src/lib/components/exercises/<Name>.svelte`. Accept `ExerciseProps`:

```ts
let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();
```

**Pattern**:

- Input mode (`feedback === null`): show prompt + input. Call `onSubmit(answer)`.
- Feedback mode (`feedback !== null`): show prompt + `<Feedback>`.
- Use `<ExerciseShell>` wrapper (handles Enter key, focus, submit/next buttons).
- Use `<NumericInput>` for all user input — no raw `<input>`.

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
</script>

{#if state.lang === 'en'}
  <p>English instructions</p>
{:else}
  <p>Deutsche Anleitung</p>
{/if}
```

Register via `instructionComponent` in step 4. The `?` button appears automatically.

## 4. i18n — `src/lib/i18n.svelte.ts`

Add to `dict`:

| Key | Purpose |
| --- | ------- |
| `exercise.<id>.name` | Display name |
| `exercise.<id>.desc` | Short description |
| `exercise.<id>.prompt` | Imperative label (e.g. "Simplify.") |

Use Swiss orthography (no "ß", always "ss": "gross", "Masse").

To show a prompt label in the component, set `data.promptKey: 'exercise.<id>.prompt'` in the generator and render with `{_(promptKey)}` with class `prompt-label`.

## 5. Register — `src/lib/data/exerciseTypes.ts`

```ts
import { generate<Name>, validate<Name> } from '../exercises/<name>';
import <Name>Component from '../components/exercises/<Name>.svelte';

// ... in exerciseTypes:
<id>: defineExerciseType({
  id: '<id>',
  nameKey: 'exercise.<id>.name',
  descriptionKey: 'exercise.<id>.desc',
  generate: generate<Name>,
  // validate — defaults to trimCompare
  // component — defaults to TextInputExercise
  // maxComplexity — defaults to 10
  // prerequisites?: Prerequisite[]
  // instructionComponent?: Component
}),
```

`defineExerciseType` provides sensible defaults — only specify what differs from defaults.

## 6. Discipline — `src/lib/data/disciplines.ts`

Add the type's `id` to one or more discipline's `exerciseTypeIds` arrays.

## 7. Verify

```sh
npm run check
npm run lint
npm run test
```
