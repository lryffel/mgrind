# Convert 6 custom-component types to standard card patterns

## Description

Six exercise types still use custom Svelte components (`src/lib/components/exercises/`) despite their internal variants fitting standard card patterns. Convert each to the fractionTrivia/numbersTrivia pattern: split into subtype generators that set `pattern` + properly-shaped `data`, add a combined generator that dispatches randomly, remove the custom component, and update the registration.

## Types to convert

### 1. `substitution` — `SubstitutionExercise.svelte`

**16 generators** in `src/lib/exercises/substitution.ts` — 8 single-variable, 8 two-variable.

Each returns `{ prompt, answer, data: { variable, value, term, ... } }` with optional `answerIsFraction`.

**Card pattern:** `text-input` (when integer answer) / `fraction-input` (when fraction answer).

**Plan:**

- Create wrapper per generator (or a single `generateSubstitutionExercise` that picks a variant and calls the right generator)
- Each wrapper sets `pattern: 'text-input'` or `pattern: 'fraction-input'` based on the answer type
- Shape `data` to include `promptKey: 'exercise.substitution.prompt'` (or similar) so the card can render the prompt
- Remove `SubstitutionExercise.svelte`
- Remove `component: SubstitutionExercise` from registration

### 2. `linearEquations` — `LinearEquationsExercise.svelte`

**18 variants** in `src/lib/exercises/linearEquations.ts`.

Each returns `{ prompt, answer, data: { variable } }`.

**Card pattern:** `text-input` (or `fraction-input` when answer is fractional).

**Plan:**

- Create a combined `generateLinearEquationsExercise` that picks a variant and calls the right generator
- Each sets `pattern: 'text-input'` or `pattern: 'fraction-input'`
- Data shape: `{ promptKey?: string }` — prompt is in `exercise.prompt` as LaTeX
- Remove `LinearEquationsExercise.svelte`
- Remove `component: LinearEquationsExercise` from registration

### 3. `necessityOfParentheses` — `NecessityOfParentheses.svelte`

**~20 templates**, 3 selected per exercise. Each template has `latex`, `needsParens`.

Custom component renders a batch of latex + yes/no toggle buttons.

**Card pattern:** `batch-choice` with `buttons: ['answer.yes', 'answer.no']`

**Plan:**

- Refactor `generateNecessityOfParentheses` to return `pattern: 'batch-choice'` with:
  ```ts
  data: {
    promptKey: 'exercise.necessityOfParentheses.prompt',
    rows: (origData.questions ?? []).map(q => ({ latex: q.latex })),
    buttons: ['answer.yes', 'answer.no'],
  }
  ```
- Remove `NecessityOfParentheses.svelte`
- Remove `component: NecessityOfParentheses` from registration

### 4. `percent` — `PercentExercise.svelte`

**5 variants** (A–E). Custom component renders variant-specific i18n prompts with interpolated values.

Each returns `{ prompt, answer, data: { variant, p, G, W, n1, n2, c1, t1, ... } }`.

**Card pattern:** `text-input`.

**Plan:**

- Refactor `generatePercent` to set `pattern: 'text-input'` on all returned exercises
- Data shape: `{ promptKey: 'exercise.percent.variantX.prompt', ...variantData }`  
  The TextInputCard already renders `promptKey` as a label if present
- Remove `PercentExercise.svelte`
- Remove `component: PercentExercise` from registration

### 5. `roundingSigfigs` — `RoundingSigfigsExercise.svelte`

**5 generators** (selected by complexity level). Each returns `{ prompt, answer, data: { sigfigsCount } }`.

Custom component simply shows prompt + NumericInput.

**Card pattern:** `text-input`.

**Plan:**

- Refactor each generator to set `pattern: 'text-input'`
- Data shape: `{ promptKey?: string, sigfigsCount: number }`
- Remove `RoundingSigfigsExercise.svelte`
- Remove `component: RoundingSigfigsExercise` from registration

### 6. `termTransformationsTrivia` — `TermTransformationsTrivia.svelte`

**3 variants**: `laws` (single-choice), `powerLaws` (single-choice), `trueFalse` (batch-choice).

Currently has a custom component and a component-based registration.

**Plan:**

- Create wrapper generators that set pattern based on variant:
  - `generateTermTransformationsTriviaLaws` → `pattern: 'single-choice'`
  - `generateTermTransformationsTriviaPowerLaws` → `pattern: 'single-choice'`
  - `generateTermTransformationsTriviaTrueFalse` → `pattern: 'batch-choice'` with `buttons: ['answer.yes', 'answer.no']`
- Create combined `generateTermTransformationsTriviaExercise` that picks a variant and dispatches
- Remove `TermTransformationsTrivia.svelte`
- Remove `component: TermTransformationsTrivia` from registration
- Update validation or keep shared `validateTermTransformationsTrivia` (already switches on `data.triviaType`)

## Steps

### Step 1: Refactor each generator file

For each of the 6 files in `src/lib/exercises/`:

- Add wrapper generators that set `pattern` and shape `data` for the card pattern
- Add combined generator that picks a random variant and dispatches
- Ensure validation still works (shared validator that switches on type is fine)

### Step 2: Update `exerciseTypes.ts`

- Import combined generators + validators
- Replace each type's `component` with nothing (card pattern handles rendering)
- Registration example before:
  ```ts
  substitution: defineExerciseType({
    id: 'substitution',
    generate: generateSubstitution,
    validate: validateSubstitution,
    component: SubstitutionExercise,
  }),
  ```
  After:
  ```ts
  substitution: defineExerciseType({
    id: 'substitution',
    nameKey: 'exercise.substitution.name',
    descriptionKey: 'exercise.substitution.desc',
    generate: generateSubstitutionExercise,
    validate: validateSubstitution,
  }),
  ```

### Step 3: Delete custom component files

```
src/lib/components/exercises/SubstitutionExercise.svelte
src/lib/components/exercises/LinearEquationsExercise.svelte
src/lib/components/exercises/NecessityOfParentheses.svelte
src/lib/components/exercises/PercentExercise.svelte
src/lib/components/exercises/RoundingSigfigsExercise.svelte
src/lib/components/exercises/TermTransformationsTrivia.svelte
```

### Step 4: Run checks

```
npm run test
npm run check
npm run lint
```

## Acceptance Criteria

1. Each converted type generates the same exercises (same generation, same answers)
2. Each converted type renders through standard cards (TextInputCard, SingleChoiceCard, BatchChoiceCard)
3. No visible regressions in prompt text, layout, or interaction
4. `npm run check`, `npm run lint`, `npm run test` all pass
5. The 6 deleted component files are gone from `src/lib/components/exercises/`

## Progress

## Blockers
