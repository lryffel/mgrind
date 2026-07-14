# Exercise card pattern refactor

## Description

Replace the per-type exercise component requirement with a `pattern` field on `Exercise` that selects from a closed set of generic card templates. Types that fit a pattern need zero component code; complex types keep custom components via a `'custom'` pattern.

The central change: add `pattern?: CardPattern` to `Exercise`, create ~7 generic card components in `src/lib/components/cards/`, and route in `ExerciseScreen`.

## Current state

29 exercise components for 33 types. Many are near-duplicates:

- `TextInputExercise` — 5+ types
- `FractionExercise` — 3 types
- `MultiFieldExercise` — 5 types
- `FractionTrivia` (644 lines) — 11 internal subtypes crammed into one component
- `NumbersTrivia` (258 lines) — 4 internal subtypes in one component

## CardPattern closed set

```typescript
type CardPattern =
  | 'text-input'
  | 'fraction-input'
  | 'multi-field'
  | 'batch-choice'
  | 'single-choice'
  | 'multi-choice'
  | 'prime-factors'
  | 'custom';
```

## Card component API

Every card component receives the same `ExerciseProps` interface (no change):

```typescript
interface ExerciseProps {
  exercise: Exercise; // includes pattern + data with per-pattern shape
  onSubmit: (answer: string) => void;
  onNext: () => void;
  feedback: ExerciseFeedback;
}
```

Card components live in `src/lib/components/cards/` and are **stateless wrappers** — they own their input state, call `onSubmit`, and render `<ExerciseShell>` just like the current components.

## `exercise.data` shape per pattern

Each pattern expects a specific shape for `exercise.data`. Generators that set a pattern must produce data in the matching shape.

| Pattern          | `exercise.data` shape                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| `text-input`     | `{ promptKey?: string; placeholder?: string; context?: InputContext }`                  |
| `fraction-input` | `{ promptKey?: string }`                                                                |
| `multi-field`    | `{ promptKey?: string; fields: { variablePart: string }[] }`                            |
| `batch-choice`   | `{ promptKey?: string; rows: { latex: string; latex2?: string }[]; buttons: string[] }` |
| `single-choice`  | `{ promptKey?: string; options: { label?: string; latex?: string }[] }`                 |
| `multi-choice`   | `{ promptKey?: string; options: { label?: string; latex?: string }[] }`                 |
| `prime-factors`  | `{ promptKey?: string; primes: number[] }`                                              |

## Types that map to each pattern

### `text-input`

- multiplication, division, squares, orderOfOperations, percent, roundingSigfigs, scientificNotation
- numbersTriviaPrimeDivisors, fractionTriviaDenominatorRestriction, fractionTriviaZeroNumerator, fractionTriviaReciprocalProduct

### `fraction-input`

- simplifyFraction, additionFraction, multiplicationFraction, simplifySymbolicFraction
- fractionTriviaFractionTerms, fractionTriviaFractionDivision

### `multi-field`

- collectingTerms, binomialFormulas, expand, expandAndCollect, substitution

### `batch-choice`

- signs (`buttons: ['+', '-']`, `columns: 'single'`)
- compareFractions (`buttons: ['<', '=', '>']`, `columns: 'double'`)
- numbersTriviaIsNatural, numbersTriviaIsInteger, numbersTriviaIsRational (`buttons: ['yes', 'no']`, `columns: 'single'`)

### `single-choice`

- numbersTriviaTrueFalse, numbersTriviaDivisibilityRules
- fractionTriviaMultiplySame, fractionTriviaFractionBar, fractionTriviaDoubleFraction (non-MC)

### `multi-choice`

- fractionTriviaIntegerFractions, fractionTriviaEqualFractions, fractionTriviaMediant, fractionTriviaReducibleFractions, fractionTriviaNegativeSignPlacement, fractionTriviaDoubleFraction (MC)

### `prime-factors`

- primeFactorisation

### `custom`

- factoringOut, factoringBinomialFormulas, factoringOutAndBinomial, gcdLcm, linearEquations, factorEquations, necessityOfParentheses, pythagoras, area, interiorAngles, termTransformationsTrivia

## Steps

---

### Step 1: Add `CardPattern` type, update `Exercise` interface, make `component` optional

**File: `src/lib/types.ts`**

```typescript
import type { Component } from 'svelte';

export type InputContext = 'coefficient' | 'exponent' | 'summand' | 'numerator' | 'denominator' | 'plain';

export type ExerciseFeedback = 'correct' | 'incorrect' | null;

export type CardPattern =
  | 'text-input'
  | 'fraction-input'
  | 'multi-field'
  | 'batch-choice'
  | 'single-choice'
  | 'multi-choice'
  | 'prime-factors'
  | 'custom';

export interface ExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  onNext: () => void;
  feedback: ExerciseFeedback;
}

export interface Exercise {
  prompt: string;
  answer: string;
  pattern?: CardPattern;
  data?: unknown;
}

export interface Prerequisite {
  typeId: string;
  complexity: number;
}

export interface ExerciseType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  maxComplexity: number;
  generate: (seed: number, complexity: number) => Exercise;
  validate: (answer: string, exercise: Exercise) => boolean;
  component?: Component<ExerciseProps>; // <-- was required, now optional
  prerequisites?: Prerequisite[];
  instructionComponent?: Component;
}

export interface Discipline {
  id: string;
  nameKey: string;
  exerciseTypeIds: string[];
}

export type Lang = 'en' | 'de';
```

---

### Step 2: Update `defineExerciseType` — stop defaulting component

**File: `src/lib/data/exerciseTypes.ts`**

Change:

```typescript
    component: config.component ?? TextInputExercise,
```

To:

```typescript
    ...(config.component ? { component: config.component } : {}),
```

This way patterned types that omit `component` get `undefined` in the `ExerciseType` object.

---

### Step 3: Create `CardRegistry.svelte`

**File: `src/lib/components/cards/CardRegistry.svelte`**

```svelte
<script lang="ts">
  import type { ExerciseProps } from '../../types';
  import TextInputCard from './TextInputCard.svelte';
  import FractionInputCard from './FractionInputCard.svelte';
  import MultiFieldCard from './MultiFieldCard.svelte';
  import BatchChoiceCard from './BatchChoiceCard.svelte';
  import SingleChoiceCard from './SingleChoiceCard.svelte';
  import MultiChoiceCard from './MultiChoiceCard.svelte';
  import PrimeFactorsCard from './PrimeFactorsCard.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  const pattern = $derived(exercise.pattern);
</script>

{#if pattern === 'text-input'}
  <TextInputCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'fraction-input'}
  <FractionInputCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'multi-field'}
  <MultiFieldCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'batch-choice'}
  <BatchChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'single-choice'}
  <SingleChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'multi-choice'}
  <MultiChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'prime-factors'}
  <PrimeFactorsCard {exercise} {onSubmit} {onNext} {feedback} />
{/if}
```

---

### Step 4: Create each generic card component

Each card in `src/lib/components/cards/`. Base them on the existing components they replace, stripping out type-specific logic.

#### 4a: `TextInputCard.svelte` (replaces TextInputExercise + TriviaTextInput)

Structure based on `TextInputExercise.svelte`:

```typescript
let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();
let userInput = $state('');
let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);
let promptKey = $derived((exercise.data as any)?.promptKey);

// Show promptKey as i18n label if present, otherwise render exercise.prompt as Math
// Single NumericInput, same layout as current TextInputExercise
// On feedback: show user answer + Feedback with correctLatex
```

Key behavior to preserve from current `TextInputExercise`:

- If `exercise.prompt` contains `?`, split on `?` and render `parts[0] + NumericInput + parts[1]`
- If `promptKey` is set (for trivia subtypes), render `<p class="prompt-label">{_(promptKey)}</p>` instead
- `validationError` for decimal comma
- `correctLatex = exercise.answer`

#### 4b: `FractionInputCard.svelte` (replaces FractionExercise)

Based on `FractionExercise.svelte`. Uses `useFractionInput()`.

Key behavior to preserve:

- `promptKey` label if set
- For binary operations (`data.op === '*'`), render `frac1 * frac2` from `data.num1,den1,num2,den2`
- For single fraction: render `exercise.prompt`
- Fraction NumericInput with num/den
- Negative denominator warning
- Reducible fraction warning

#### 4c: `MultiFieldCard.svelte` (replaces MultiFieldExercise + SubstitutionExercise)

Based on `MultiFieldExercise.svelte`. Uses `CoefficientField` and `normalizeCoeff`.

Key behavior to preserve:

- `promptKey` label
- Render `exercise.prompt` + `=` + N `CoefficientField`s separated by `+`
- Validation via `normalizeCoeff` per field
- Answer encoding: comma-joined normalized values

#### 4d: `BatchChoiceCard.svelte` (replaces Signs + CompareFractions + numbersTrivia sets)

Unified grid: each row has a prompt (one or two LaTeX cells) and N buttons.

Props from `exercise.data`:

```typescript
{
  promptKey?: string;
  rows: { latex: string; latex2?: string }[];   // latex2 for double-column (compareFractions)
  buttons: string[];                              // e.g. ['+', '-'], ['<', '=', '>'], ['yes', 'no']
}
```

Layout:

- If `rows[0].latex2` exists → `columns: 'double'` layout (like CompareFractions: frac + buttons + frac)
- Else → `columns: 'single'` layout (like Signs: latex + buttons)

Answer encoding: comma-joined button values.

#### 4e: `SingleChoiceCard.svelte` (replaces TriviaRadioGroup usage)

Radio group. Props from `exercise.data`:

```typescript
{
  promptKey?: string;
  options: { label?: string; latex?: string }[];
}
```

Based on `TriviaRadioGroup.svelte`. Single selection, answer encoding: index string.

#### 4f: `MultiChoiceCard.svelte` (replaces TriviaCheckboxGroup usage)

Checkbox group. Props from `exercise.data`:

```typescript
{
  promptKey?: string;
  options: { label?: string; latex?: string }[];
}
```

Based on `TriviaCheckboxGroup.svelte`. Multiple selection, answer encoding: comma-joined sorted indices.

#### 4g: `PrimeFactorsCard.svelte` (replaces PrimeFactorisation.svelte)

Single row of `PrimeFactorInput`. Props from `exercise.data`:

```typescript
{
  promptKey?: string;
  primes: number[];
}
```

Based on `PrimeFactorisation.svelte`. Answer encoding: comma-joined exponent values.

---

### Step 5: Update `ExerciseScreen.svelte`

Current:

```svelte
{#key s.currentSeed}
  {@const Comp = s.currentType.component}
  <Comp exercise={s.exercise} onSubmit={(a: string) => s.submit(a)} onNext={() => s.next()} feedback={s.feedback} />
{/key}
```

After:

```svelte
{#key s.currentSeed}
  {#if s.exercise.pattern && s.exercise.pattern !== 'custom'}
    <CardRegistry
      exercise={s.exercise}
      onSubmit={(a: string) => s.submit(a)}
      onNext={() => s.next()}
      feedback={s.feedback}
    />
  {:else if s.currentType.component}
    {@const Comp = s.currentType.component}
    <Comp exercise={s.exercise} onSubmit={(a: string) => s.submit(a)} onNext={() => s.next()} feedback={s.feedback} />
  {/if}
{/key}
```

Add the import: `import CardRegistry from './cards/CardRegistry.svelte';`

---

### Step 6: Update generators to set `pattern` + shape `data`

#### Example: `multiplication.ts` generator

Before:

```typescript
export function generateMultiplication(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * (9 + clamped)) + 2;
  const b = Math.floor(rng() * (9 + clamped)) + 2;
  return { prompt: `${a} \\cdot ${b} = ?`, answer: String(a * b) };
}
```

After:

```typescript
export function generateMultiplication(seed: number, complexity: number): Exercise {
  const clamped = clampComplexity(complexity, 10);
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * (9 + clamped)) + 2;
  const b = Math.floor(rng() * (9 + clamped)) + 2;
  return {
    prompt: `${a} \\cdot ${b} = ?`,
    answer: String(a * b),
    pattern: 'text-input',
  };
}
```

#### Example: `signs.ts` generator

Before: returns `{ prompt, answer, data: { signs: [...] } }` where `data.signs` is array of `{ latex, sign }`.

After:

```typescript
// In generateSigns, build rows and set pattern + data
return {
  prompt: '',
  answer: signs.map((s) => s.sign).join(','),
  pattern: 'batch-choice',
  data: {
    promptKey: 'exercise.signs.prompt',
    rows: signs.map((s) => ({ latex: s.latex })),
    buttons: ['+', '-'],
  },
};
```

#### Key change for all generators:

- Add `pattern` field matching the card pattern
- Reshape `data` to match the pattern's expected shape (see table in intro)
- If the old component read extra fields from `data` (e.g., `num1`, `den1`, `op` for FractionExercise), these must still be in `data` for the card to use
- Old `data` fields that were only used by the component's rendering logic stay in `data` — the card template reads the same fields

---

### Step 7: Split trivia types into separate exercise types

The two monolithic generators (`generateFractionTrivia`, `generateNumbersTrivia`) remain, but they are called with fixed `triviaType`/`subType` instead of randomly picking one.

#### Example: numbersTrivia split

Create new generator wrappers in the existing files (or as new files):

```typescript
// In numbersTrivia.ts, add:
export function generateNumbersTriviaTrueFalse(seed: number, complexity: number): Exercise {
  const ex = generateNumbersTrivia(seed, complexity);
  // The generator already handles subType internally, but if it picks randomly,
  // we need a version that forces subType='trueFalse'
  // Approach: add a parameter to generateNumbersTrivia or create wrapper
}
```

**Better approach:** refactor `generateNumbersTrivia` to accept an optional `forcedSubType` parameter, then export wrapper functions:

```typescript
export function generateNumbersTrivia(seed: number, complexity: number, subType?: string): Exercise { ... }

export function generateNumbersTriviaTrueFalse(seed: number, complexity: number): Exercise {
  return generateNumbersTrivia(seed, complexity, 'trueFalse');
}
// etc.
```

Same approach for `generateFractionTrivia` with `triviaType` parameter.

Each wrapper sets the `pattern` in the returned Exercise (or the main generator sets it based on the triviaType).

#### Discipline changes

In `src/lib/data/disciplines.ts`:

- Remove `'fractionTrivia'` and `'numbersTrivia'`
- Add the new individual type IDs:
  - `numbers` discipline: add `'numbersTriviaPrimeDivisors'`, `'numbersTriviaTrueFalse'`, `'numbersTriviaDivisibilityRules'`, `'numbersTriviaIsNatural'`, `'numbersTriviaIsInteger'`, `'numbersTriviaIsRational'`
  - `fractions` discipline: add all `fractionTrivia*` types

---

### Step 8: Update registrations in `exerciseTypes.ts`

Remove `component` from all registrations for types that now use a pattern.

**Before (simplifyFraction):**

```typescript
simplifyFraction: defineExerciseType({
  id: 'simplifyFraction',
  nameKey: 'exercise.simplifyFraction.name',
  descriptionKey: 'exercise.simplifyFraction.desc',
  generate: generateSimplifyFraction,
  validate: validateFractionReduced,
  component: FractionExercise,
  instructionComponent: SimplifyFractionInstructions,
}),
```

**After:**

```typescript
simplifyFraction: defineExerciseType({
  id: 'simplifyFraction',
  nameKey: 'exercise.simplifyFraction.name',
  descriptionKey: 'exercise.simplifyFraction.desc',
  generate: generateSimplifyFraction,
  validate: validateFractionReduced,
  instructionComponent: SimplifyFractionInstructions,
}),
```

Custom types keep their `component` unchanged.

Add new trivia-split types with their `pattern`-setting generators.

Remove unused imports for deleted component files.

---

### Step 9: Remove obsolete component files

Delete:

```
src/lib/components/exercises/TextInputExercise.svelte
src/lib/components/exercises/FractionExercise.svelte
src/lib/components/exercises/MultiFieldExercise.svelte
src/lib/components/exercises/CompareFractions.svelte
src/lib/components/exercises/Signs.svelte
src/lib/components/exercises/PrimeFactorisation.svelte
src/lib/components/exercises/SubstitutionExercise.svelte
src/lib/components/exercises/SymbolicFractionExercise.svelte
src/lib/components/exercises/FractionTrivia.svelte
src/lib/components/exercises/NumbersTrivia.svelte
src/lib/components/exercises/TriviaRadioGroup.svelte
src/lib/components/exercises/TriviaCheckboxGroup.svelte
src/lib/components/exercises/TriviaTextInput.svelte
```

Keep these custom components (unchanged):

```
src/lib/components/exercises/FactoringOut.svelte
src/lib/components/exercises/FactoringBinomialFormulas.svelte
src/lib/components/exercises/FactoringOutAndBinomial.svelte
src/lib/components/exercises/GcdLcmExercise.svelte
src/lib/components/exercises/LinearEquationsExercise.svelte
src/lib/components/exercises/FactorEquations.svelte
src/lib/components/exercises/NecessityOfParentheses.svelte
src/lib/components/exercises/Pythagoras.svelte
src/lib/components/exercises/AreaExercise.svelte
src/lib/components/exercises/InteriorAngles.svelte
src/lib/components/exercises/TermTransformationsTrivia.svelte
src/lib/components/exercises/PercentExercise.svelte
src/lib/components/exercises/RoundingSigfigsExercise.svelte
src/lib/components/exercises/ScientificNotationExercise.svelte
```

Move `NumericInput.svelte` and `PrimeFactorInput.svelte` to `src/lib/components/` (they're shared inputs, not exercise-specific). Import paths update accordingly.

---

### Step 10: Clean up tests

- Remove test files for deleted components (if any exist)
- Tests for generators remain unchanged (they test domain logic, not rendering)
- Add basic render tests for each card component (smoke test with each pattern's data shape)

---

### Step 11: Refactor `new-exercise` skill (`SKILL.md`)

Full rewrite of the skill. Key changes:

- Section 2 title: "Component" → "Component (optional)"
- Add table mapping each `CardPattern` → data contract → no component needed
- Move SVG/input-composable/feedback guidance under a "Custom component" subsection
- Registration step shows `component` can be omitted for patterned types
- Show example generator with `pattern` field

---

### Step 12: Update `AGENTS.md` and `STRUCTURE.md`

- Document `CardPattern` in `STRUCTURE.md`
- Update adding-exercise-type instructions in `AGENTS.md` to reflect the pattern-based approach
- Mention `src/lib/components/cards/` directory

## Acceptance Criteria

1. Every existing exercise type works identically (same generation, validation, visual output, keyboard/focus behavior)
2. Pattern-based types produce the same DOM structure and CSS classes as their old components
3. Custom types are completely unchanged
4. `npm run check`, `npm run lint`, `npm run test` all pass
5. Adding a new type that fits a pattern requires: generator + i18n keys + registration — no component
6. Each card component has a corresponding test

## Progress

## Blockers

## Notes

- SVG types (pythagoras, area, interiorAngles) stay custom — SVG content per type is too diverse
- GcdLcmExercise stays custom — has two distinct interaction modes (factorization with 2× PrimeFactorInput vs plain number input)
- `ExerciseShell` wrapper stays unchanged — handles keyboard shortcuts, focus, progress bar, help button, submit/next
- `NumericInput` and `PrimeFactorInput` should move to `src/lib/components/` since card templates and custom components both use them
