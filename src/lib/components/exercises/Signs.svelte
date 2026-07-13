<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { SignsData } from '../../exercises/signs';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as SignsData);
  let questions = $derived(data.signs);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let answers = $state<string[]>([]);

  $effect(() => {
    answers = questions.map(() => '');
  });

  let allAnswered = $derived(answers.every((a) => a === '+' || a === '-'));

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers.join(','));
  }

  let correctAnswers = $derived(
    feedback
      ? questions.map((q, i) => ({
          latex: q.latex,
          correct: answers[i] === q.sign,
          correctSign: q.sign,
        }))
      : [],
  );

  let allCorrect = $derived(feedback === 'correct');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_('exercise.signs.prompt')}</p>

  <div class="signs-grid">
    {#each questions as q, i (i)}
      <span class="question-math">
        <Math expression={q.latex} />
      </span>
      {#if feedback === null}
        <div class="button-group" role="radiogroup" aria-label="{_('signs.select')} {i + 1}">
          <button
            class={'sign-btn' + (answers[i] === '+' ? ' selected' : '')}
            onclick={() => (answers[i] = '+')}
            role="radio"
            aria-checked={answers[i] === '+'}
          >
            <Math expression="+" />
          </button>
          <button
            class={'sign-btn' + (answers[i] === '-' ? ' selected' : '')}
            onclick={() => (answers[i] = '-')}
            role="radio"
            aria-checked={answers[i] === '-'}
          >
            <Math expression="-" />
          </button>
        </div>
      {:else}
        <span
          class="sign-result"
          class:correct={correctAnswers[i].correct}
          class:incorrect={!correctAnswers[i].correct}
        >
          <Math expression={answers[i]} />
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback {feedback} textAnswer={questions.map((q) => (q.sign === '+' ? '+' : '\u2212')).join(', ')} />
  {/if}
</ExerciseShell>

<style>
  .signs-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 0.75rem;
  }

  .question-math {
    white-space: nowrap;
    justify-self: start;
  }

  .button-group {
    display: flex;
    gap: 0.25rem;
  }

  .button-group :global(.sign-btn) {
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

  .button-group :global(.sign-btn:hover) {
    border-color: var(--c-primary);
  }

  .button-group :global(.sign-btn.selected) {
    border-color: var(--c-primary);
    background: var(--c-primary);
    color: var(--c-primary-inverse);
  }

  .button-group :global(.sign-btn:focus-visible) {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .sign-result {
    font-size: 1.25rem;
    font-weight: 700;
    min-width: 2.5rem;
    text-align: center;
  }

  .sign-result.correct {
    color: var(--c-correct);
  }

  .sign-result.incorrect {
    color: var(--c-incorrect);
  }
</style>
