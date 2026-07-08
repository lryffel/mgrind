---
name: new-exercise
description: Create a new exercise type
---

Triggered when the user asks you to "create a new exercise type" or "add a new exercise". Follow these steps in order.

## Step 1: Create the generator

Write a file at `src/lib/exercises/<name>.ts`. Export a `generate<Name>(seed: number, complexity: number): Exercise` function. Use `mulberry32` from `src/lib/prng.ts` for deterministic randomness.

The `Exercise` interface:

```ts
interface Exercise {
  prompt: string; // displayed to the user
  answer: string; // expected answer
  data?: Record<string, unknown>; // optional type-specific payload
}
```

Simple text-input types (single number/word answer) return just `{ prompt, answer }`.

Multi-input types (e.g. prime factorisation) store extra info in `data` — the component reads it from `exercise.data`.

**Example** (`src/lib/exercises/multiplication.ts`):

```ts
import type { Exercise } from '../types';
import { mulberry32 } from '../prng';

export function generateMultiplication(seed: number, complexity: number): Exercise {
  const maxFactor = 10 + complexity;
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * (maxFactor - 1)) + 2;
  const b = Math.floor(rng() * (maxFactor - 1)) + 2;
  return { prompt: `${a} × ${b} = ?`, answer: String(a * b) };
}
```

## Step 2: Choose or create the component

### Option A — Reuse `TextInputExercise`

If the user just types an answer into a single text field, reuse `TextInputExercise`.

### Option B — Create a custom component

Write a file at `src/lib/components/exercises/<Name>.svelte`. The component **must** accept these `$props()`:

```ts
let {
  exercise, // : Exercise
  onSubmit, // : (answer: string) => void
  onNext, // : () => void
  feedback, // : 'correct' | 'incorrect' | null
} = $props();
```

**Patterns to follow:**

- Use `<svelte:window onkeydown={handleKeydown} />` to handle Enter key (submit when `feedback === null`, advance otherwise).
- Show input when `feedback === null`, show feedback otherwise.
- Call `onSubmit(userAnswerString)` on submit.
- Use `_(key)` for all user-facing strings (import from `../../i18n.svelte` or relative path).
- Use `$derived`, `$state`, `$effect` (Svelte 5 runes). Do not use `$:` or `export let`.

For examples, see existing components: `SimplifyFraction.svelte`, `PrimeFactorisation.svelte`.

## Step 3: Add i18n keys

Edit `src/lib/i18n.svelte.ts` — add entries for:

| Key                    | Purpose                 |
| ---------------------- | ----------------------- |
| `exercise.<id>.name`   | Display name            |
| `exercise.<id>.desc`   | Short description       |
| `exercise.<id>.prompt` | (Optional) prompt label |

## Step 4: Register in `exerciseTypes.ts`

Edit `src/lib/data/exerciseTypes.ts`:

1. Import the generator and component.
2. Add an entry to the `exerciseTypes` record:

```ts
<id>: {
  id: '<id>',
  nameKey: 'exercise.<id>.name',
  descriptionKey: 'exercise.<id>.desc',
  maxComplexity: 10,
  generate: generate<Name>,
  validate: trimCompare,
  component: <Component>,
},
```

- `trimCompare` compares `answer.trim() === exercise.answer` — use unless the type needs custom validation.
- `maxComplexity` determines the number of difficulty levels (levels go from 0 to maxComplexity-1).

## Step 5: (Optional) Assign to a discipline

If the type should appear in a discipline, add its `id` to the discipline's `exerciseTypeIds` array in `src/lib/data/disciplines.ts`.

## Verification

Run these commands to confirm everything works:

```sh
npm run check
npm run lint
npm run test
```
