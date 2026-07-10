<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let questions = $derived((exercise.data?.questions as { latex: string; needsParens: boolean }[]) ?? []);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let answers = $state<string[]>([]);

  $effect(() => {
    answers = questions.map(() => '');
  });

  let allAnswered = $derived(answers.every((a) => a === 'yes' || a === 'no'));

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers.join(','));
  }

  let correctAnswers = $derived(
    feedback
      ? questions.map((q, i) => ({
          latex: q.latex,
          correct: answers[i] === (q.needsParens ? 'yes' : 'no'),
        }))
      : [],
  );
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_('exercise.necessityOfParentheses.prompt')}</p>

  <div class="questions-grid">
    {#each questions as q, i (i)}
      <span class="question-math">
        <Math expression={q.latex} />
      </span>
      {#if feedback === null}
        <div class="button-group" role="group">
          <button class={answers[i] === 'yes' ? '' : 'outline'} onclick={() => (answers[i] = 'yes')}
            >{_('answer.yes')}</button
          >
          <button class={answers[i] === 'no' ? '' : 'outline'} onclick={() => (answers[i] = 'no')}
            >{_('answer.no')}</button
          >
        </div>
      {:else if correctAnswers[i].correct}
        <span class="feedback-indicator correct">
          &check; {q.needsParens ? _('answer.yes') : _('answer.no')}
        </span>
      {:else}
        <span class="feedback-indicator incorrect">
          &times; {q.needsParens ? _('answer.yes') : _('answer.no')}
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {/if}
</ExerciseShell>

<style>
  .questions-grid {
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

  .feedback-indicator {
    font-weight: 600;
  }

  .feedback-indicator.correct {
    color: var(--c-correct);
  }

  .feedback-indicator.incorrect {
    color: var(--c-incorrect);
  }
</style>
