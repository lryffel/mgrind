<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(
    exercise.data as { promptKey?: string; rows: { latex: string; latex2?: string }[]; buttons: string[] },
  );
  let rows = $derived(data.rows ?? []);
  let buttons = $derived(data.buttons ?? []);
  let promptKey = $derived(data.promptKey);
  let isDouble = $derived(rows[0]?.latex2 !== undefined);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let answers = $state<string[]>([]);

  $effect(() => {
    answers = rows.map(() => '');
  });

  let allAnswered = $derived(answers.every((a) => buttons.includes(a)));

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers.join(','));
  }

  let correctAnswers = $derived(
    feedback
      ? exercise.answer.split(',').map((ans, i) => ({
          latex: rows[i].latex,
          latex2: rows[i].latex2,
          correct: answers[i] === ans,
          correctAnswer: ans,
        }))
      : [],
  );
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}

  <div class="choice-grid" class:double={isDouble}>
    {#each rows as row, i (i)}
      {#if isDouble}
        <span class="choice-math">
          <Math expression={row.latex} />
        </span>
      {/if}
      {#if feedback === null}
        <div class="button-group" role="radiogroup" aria-label="{promptKey ?? ''} {i + 1}">
          {#each buttons as btn, j (j)}
            <button
              class="choice-btn"
              class:selected={answers[i] === btn}
              onclick={() => (answers[i] = btn)}
              role="radio"
              aria-checked={answers[i] === btn}
            >
              {#if btn === '+' || btn === '-'}
                <Math expression={btn === '+' ? '+' : '-'} />
              {:else}
                {btn}
              {/if}
            </button>
          {/each}
        </div>
      {:else}
        <span
          class="choice-result"
          class:correct={correctAnswers[i].correct}
          class:incorrect={!correctAnswers[i].correct}
        >
          {#if answers[i] === '+' || answers[i] === '-'}
            <Math expression={answers[i] === '+' ? '+' : '-'} />
          {:else}
            {answers[i]}
          {/if}
        </span>
      {/if}
      {#if isDouble}
        <span class="choice-math">
          <Math expression={row.latex2!} />
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback {feedback} textAnswer={exercise.answer.split(',').join(', ')} />
  {/if}
</ExerciseShell>

<style>
  .choice-grid {
    display: grid;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 0.75rem;
  }

  .choice-grid:not(.double) {
    grid-template-columns: auto 1fr;
  }

  .choice-grid.double {
    grid-template-columns: auto auto auto;
  }

  .choice-math {
    white-space: nowrap;
    justify-self: center;
  }

  .button-group {
    display: flex;
    gap: 0.25rem;
  }

  .button-group :global(.choice-btn) {
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
    transition:
      border-color 0.2s ease-in-out,
      background 0.2s ease-in-out;
  }

  .button-group :global(.choice-btn:hover) {
    border-color: var(--c-primary);
  }

  .button-group :global(.choice-btn.selected) {
    border-color: var(--c-primary);
    background: var(--c-primary);
    color: var(--c-primary-inverse);
  }

  .button-group :global(.choice-btn:focus-visible) {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .choice-result {
    font-size: 1.25rem;
    font-weight: 700;
    min-width: 2.5rem;
    text-align: center;
  }

  .choice-result.correct {
    color: var(--c-correct);
  }

  .choice-result.incorrect {
    color: var(--c-incorrect);
  }
</style>
