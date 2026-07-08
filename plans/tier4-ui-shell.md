# Tier 4 — Shared exercise UI shell & feedback

## Goal
Remove the ~60–80 lines of repeated boilerplate present in all 11 exercise components:
the `<article class="card">` wrapper + click-to-focus + a11y comments, the `<svelte:window>`
Enter handler, the focus `$effect`, and the Submit/Next buttons. Centralize all of it in a new
`<ExerciseShell>` and a `<Feedback>` component, and move the shared `.card`/`.prompt`/`.feedback`/
`.submit-row` CSS into global utility classes.

**Depends on Tier 3** (the `ExerciseProps` / `ExerciseFeedback` types in `src/lib/types.ts`).
Read `plans/tier3-typed-contract.md` first. This tier assumes `ExerciseProps` exists and that
`exercise.data` is typed.

## Current duplication (confirmed locations)

- **Props block** (11×): `SubtractionFraction.svelte:7-17`, `BinomialFormulas.svelte:7-17`,
  `TextInputExercise.svelte:6-16`, `PrimeFactorisation.svelte:7-17`, `SimplifyFraction.svelte:7-17`,
  `BinaryFractionExercise.svelte:7-17`, `MultiplicationFraction.svelte:7-17`, `SubstitutionExercise.svelte:6-16`,
  `CollectingTerms.svelte:7-17`, `ScientificNotationExercise.svelte:6-16`, `FactoringBinomialFormulas.svelte:7-17`.
- **Enter handler** (11×): e.g. `SubtractionFraction.svelte:39-47`, `BinomialFormulas.svelte:35-43`, `TextInputExercise.svelte:27-35`.
- **Focus `$effect`** (11×): e.g. `SubtractionFraction.svelte:49-53`, `BinomialFormulas.svelte:29-33`.
- **`<svelte:window onkeydown>`** (11×).
- **Submit button** (11×): `_('answer.submit')`; **Next button** (11×): `_('answer.next')`.
- **`<article class="card">` + click-to-focus + a11y comments** (4×): `PrimeFactorisation.svelte:56-62`,
  `BinomialFormulas.svelte:51-57`, `CollectingTerms.svelte:51-57`, `FactoringBinomialFormulas.svelte:94-101`.
- **`.card`/`.prompt`/`.feedback`/`.submit-row`/`.coeff-input` CSS** (4× near-identical):
  `PrimeFactorisation.svelte:108-163`, `BinomialFormulas.svelte:96-149`, `CollectingTerms.svelte:98-158`,
  `FactoringBinomialFormulas.svelte:198-268`.
- **Feedback render** — two variants, 11×:
  - Variant A (plain answer): `_('feedback.correct')` / `_('feedback.incorrect', exercise.answer)`
    → `TextInputExercise.svelte:74-75`, `ScientificNotationExercise.svelte:99-102`, `SubstitutionExercise.svelte:106`.
  - Variant B (LaTeX): `_('feedback.correct')` then `_('feedback.incorrect.prefix')` + `<Math …/>` + `_('feedback.incorrect.suffix')`
    → `PrimeFactorisation.svelte:92-100`, `SimplifyFraction.svelte:61-65`, `BinaryFractionExercise.svelte:72-76`,
    `SubtractionFraction.svelte:89-93`, `MultiplicationFraction.svelte:73-77`, `BinomialFormulas.svelte:84-88`,
    `CollectingTerms.svelte:86-90`, `ScientificNotationExercise.svelte:90-97`, `FactoringBinomialFormulas.svelte:179-191`.

## Steps

### 4.1 Create `src/lib/components/ExerciseShell.svelte`
A wrapper that owns the card, focus, Enter key, and Submit/Next buttons. API:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Exercise, ExerciseFeedback } from '../types';

  let {
    exercise,
    feedback,
    submitAnswer,   // leaf supplies this: reads its $state inputs, calls onSubmit(...)
    onNext,
    card = true,    // set false for components that previously had no <article class="card">
    children,
  }: {
    exercise: Exercise;
    feedback: ExerciseFeedback;
    submitAnswer: () => void;
    onNext: () => void;
    card?: boolean;
    children: Snippet;
  } = $props();

  let el = $state<HTMLElement | null>(null);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) submitAnswer();
      else onNext();
    }
  }

  $effect(() => {
    if (feedback === null) {
      el?.querySelector('input, select')?.focus();
    }
  });

  function onClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLSelectElement) && !(t instanceof HTMLButtonElement)) {
      el?.querySelector('input, select')?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
{#if card}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <article class="exercise-card" bind:this={el} onclick={onClick}>
    {@render children()}
    <div class="submit-row">
      {#if feedback === null}
        <button onclick={submitAnswer}>{_('answer.submit')}</button>
      {:else}
        <button onclick={onNext}>{_('answer.next')}</button>
      {/if}
    </div>
  </article>
{:else}
  <div class="exercise-card" bind:this={el}>
    {@render children()}
    <div class="submit-row">
      {#if feedback === null}
        <button onclick={submitAnswer}>{_('answer.submit')}</button>
      {:else}
        <button onclick={onNext}>{_('answer.next')}</button>
      {/if}
    </div>
  </div>
{/if}
```
- The `querySelector('input, select')` generalizes the previous per-component first-input ref
  (e.g. `numInputEl` in `SubtractionFraction.svelte:21`, `inputEls[0]` in `BinomialFormulas.svelte:23`).
- Verify styling in `npm run dev`; if any component looked wrong without a card, pass `card={false}`
  (the click-to-focus is still harmless on a div).

### 4.2 Create `src/lib/components/Feedback.svelte`
Renders the two feedback variants. API:

```svelte
<script lang="ts">
  import { _ } from '../i18n.svelte';
  import Math from './Math.svelte';
  import type { ExerciseFeedback } from '../types';

  let {
    feedback,
    correctLatex,   // Variant B: LaTeX of the correct answer
    textAnswer,     // Variant A: plain-string correct answer (defaults to exercise.answer)
  }: {
    feedback: ExerciseFeedback;
    correctLatex?: string;
    textAnswer?: string;
  } = $props();
</script>

{#if feedback}
  {#if feedback === 'correct'}
    <p class="feedback correct">{_('feedback.correct')}</p>
  {:else if correctLatex}
    <p class="feedback incorrect">
      {_('feedback.incorrect.prefix')}<Math expression={correctLatex} />{_('feedback.incorrect.suffix')}
    </p>
  {:else}
    <p class="feedback incorrect">{_('feedback.incorrect', textAnswer ?? '')}</p>
  {/if}
{/if}
```
- Replace every inline feedback block (Variant A/B lists above) with `<Feedback {feedback} … />`.
- For Variant B, pass `correctLatex` (the LaTeX string the component already computed, e.g.
  `BinomialFormulas.svelte:46` `correctLatex`, `SubtractionFraction.svelte:91` `\\frac{...}{...}`).
- For Variant A, pass `textAnswer={exercise.answer}` (e.g. `TextInputExercise.svelte:75`).

### 4.3 Global CSS
- Move `.card`/`.prompt`/`.feedback`/`.feedback.correct`/`.feedback.incorrect`/`.expansion`/`.coeff-input`/`.submit-row`
  into `src/lib/app.css` as utility classes (rename `.card` → `.exercise-card` to avoid clashing with Pico's `.card`).
- Delete the now-duplicated `<style>` blocks from the 4 card components.

### 4.4 Migrate each of the 11 components
For every component (`TextInputExercise`, `PrimeFactorisation`, `SimplifyFraction`, `BinaryFractionExercise`,
`SubtractionFraction`, `MultiplicationFraction`, `SubstitutionExercise`, `BinomialFormulas`, `CollectingTerms`,
`ScientificNotationExercise`, `FactoringBinomialFormulas`):
1. Import `ExerciseShell` and `Feedback`. Replace the props block with `let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();`
   (plus any local state the component already had).
2. Wrap the body in `<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(<assembled answer>)} {onNext}> … </ExerciseShell>`.
   The `submitAnswer` closure must assemble the answer string exactly as the old Submit `onclick` did
   (e.g. `SubtractionFraction.svelte:42/68` → `onSubmit(\`${numInput},${denInput}\`)`;
   `BinomialFormulas.svelte:38/76` → `onSubmit(values.join(','))`).
3. Delete the component's own `<svelte:window>`, `handleKeydown`, focus `$effect`, and Submit/Next button markup.
4. Replace the inline feedback block with `<Feedback … />`.
5. Remove the now-unused `onNext` usage inside the body (it lives in the shell); keep `onSubmit` for `submitAnswer`.

### 4.5 Optional — fraction-exercise partial
- `SimplifyFraction.svelte`, `BinaryFractionExercise.svelte`, `SubtractionFraction.svelte`, `MultiplicationFraction.svelte`
  share: prompt (`\frac{..}{..} op \frac{..}{..} =`), a `<FractionInput>`, and the same feedback shape.
- After 4.4, extract a `<FractionExercise op promptKey>` partial that renders the prompt + `<FractionInput>` and wires
  `submitAnswer`. This is an incremental cleanup on top of the shell; do it only after 4.4 is verified.
- Also: `SubstitutionExercise.svelte:66-70` re-implements a fraction input inline instead of using
  `src/lib/components/exercises/FractionInput.svelte` — switch it to the shared `FractionInput`.

## Out of scope
- Math/number helper extraction (Tier 1), validation semantics (Tier 2), `Exercise.data` typing (Tier 3),
  the misc cleanups in Tier 5 (except 4.5's `FractionInput` reuse which overlaps 5.x loosely — coordinate if run together).

## Verification
- `npm run check` — ExerciseShell/Feedback type-check; ensure `submitAnswer` closures match old `onSubmit` argument shapes.
- `npm run test` — behavior unchanged (exercise logic untouched; only UI wiring moved).
- `npm run lint`.
- `npm run dev` manual pass on each discipline: Enter submits when idle, Next advances after answer, focus lands on first
  input on each new exercise, feedback (correct/incorrect + correct answer reveal) renders as before,
  click-on-card focuses first input, and styling matches the previous look.
- Regression check: the `FactoringBinomialFormulas` reset behavior — since Tier 5.5 removes its dead `$effect`,
  confirm input resets correctly on Next (relies on `ExerciseScreen.svelte:34` `{#key s.currentSeed}` remount).
