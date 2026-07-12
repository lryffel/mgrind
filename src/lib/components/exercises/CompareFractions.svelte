<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { CompareFractionsData } from '../../exercises/compareFractions';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as CompareFractionsData);
  let comparisons = $derived(data.comparisons);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let answers = $state<string[]>([]);

  $effect(() => {
    answers = comparisons.map(() => '');
  });

  let allAnswered = $derived(answers.every((a) => a === '<' || a === '>' || a === '='));

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers.join(','));
  }

  let correctAnswers = $derived(
    feedback
      ? comparisons.map((c, i) => ({
          num1: c.num1,
          den1: c.den1,
          num2: c.num2,
          den2: c.den2,
          correct: answers[i] === c.correctOperator,
          correctOp: c.correctOperator,
        }))
      : [],
  );

  let allCorrect = $derived(feedback === 'correct');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_('exercise.compareFractions.prompt')}</p>

  <div class="comparisons-grid">
    {#each comparisons as comp, i (i)}
      <div class="comparison-row">
        <span class="fraction-cell">
          <Math expression={`\\dfrac{${comp.num1}}{${comp.den1}}`} />
        </span>
        {#if feedback === null}
          <div class="button-group" role="radiogroup" aria-label="{_('exercise.compareFractions.operatorSelect')} {i + 1}">
            <button
              class={'op-btn' + (answers[i] === '<' ? ' selected' : '')}
              onclick={() => (answers[i] = '<')}
              role="radio"
              aria-checked={answers[i] === '<'}
            >&lt;</button>
            <button
              class={'op-btn' + (answers[i] === '=' ? ' selected' : '')}
              onclick={() => (answers[i] = '=')}
              role="radio"
              aria-checked={answers[i] === '='}
            >=</button>
            <button
              class={'op-btn' + (answers[i] === '>' ? ' selected' : '')}
              onclick={() => (answers[i] = '>')}
              role="radio"
              aria-checked={answers[i] === '>'}
            >&gt;</button>
          </div>
        {:else}
          <span class="op-result" class:correct={correctAnswers[i].correct} class:incorrect={!correctAnswers[i].correct}>
            {answers[i]}
          </span>
        {/if}
        <span class="fraction-cell">
          <Math expression={`\\dfrac{${comp.num2}}{${comp.den2}}`} />
        </span>
      </div>
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback {feedback} textAnswer={comparisons.map((c) => c.correctOperator).join(', ')} />
  {/if}
</ExerciseShell>

<style>
  .comparisons-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .comparison-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .fraction-cell {
    white-space: nowrap;
    min-width: 3rem;
    text-align: center;
  }

  .button-group {
    display: flex;
    gap: 0.25rem;
  }

  .button-group :global(.op-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--c-border);
    background: transparent;
    color: var(--c-text);
    cursor: pointer;
    font-family: inherit;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1;
    transition: border-color 0.2s ease-in-out, background 0.2s ease-in-out;
  }

  .button-group :global(.op-btn:hover) {
    border-color: var(--c-primary);
  }

  .button-group :global(.op-btn.selected) {
    border-color: var(--c-primary);
    background: var(--c-primary);
    color: var(--c-primary-inverse);
  }

  .button-group :global(.op-btn:focus-visible) {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .op-result {
    font-size: 1.25rem;
    font-weight: 700;
    min-width: 2.5rem;
    text-align: center;
  }

  .op-result.correct {
    color: var(--c-correct);
  }

  .op-result.incorrect {
    color: var(--c-incorrect);
  }
</style>
