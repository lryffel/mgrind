<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let input = $state('');
  let numInput = $state('');
  let denInput = $state('');

  let validationError = $derived(
    input.includes(',') || numInput.includes(',') || denInput.includes(',') ? _('error.decimalComma') : null,
  );

  const variable = $derived(exercise.data?.variable ?? 'x');
  const value = $derived(exercise.data?.value ?? '');
  const term = $derived(exercise.data?.term ?? exercise.prompt);
  const complexity = $derived(exercise.data?.complexity ?? 0);
  const answerIsFraction = $derived(exercise.answer.includes('/'));

  function submitAnswer() {
    const answer = answerIsFraction ? `${numInput.trim()}/${denInput.trim()}` : input.trim();
    onSubmit(answer);
  }

  const correctLatex = $derived.by(() => {
    if (!answerIsFraction) return undefined;
    const parts = exercise.answer.split('/');
    return `\\frac{${parts[0]}}{${parts[1]}}`;
  });

  const textAnswer = $derived(answerIsFraction ? undefined : exercise.answer);
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext} {validationError}>
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore')}<Math expression={`${variable} = ${value}`} />{_(
      'exercise.substitution.promptAfter',
    )}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  {#if feedback === null}
    <p class="prompt fraction-prompt">
      <Math expression={term} />
      <Math expression="=" />
      {#if answerIsFraction}
        <NumericInput bind:num={numInput} bind:den={denInput} fraction />
      {:else}
        <NumericInput bind:value={input} />
      {/if}
    </p>
  {:else}
    <p class="prompt fraction-prompt">
      <Math expression={term} />
      <Math expression="=" />
      {#if answerIsFraction}
        <span class="user-answer"><Math expression={`\\frac{${numInput || '0'}}{${denInput || '1'}}`} /></span>
      {:else}
        <span class="user-answer"><Math expression={input || ''} /></span>
      {/if}
    </p>
    <Feedback {feedback} {correctLatex} {textAnswer} />
  {/if}
</ExerciseShell>

<style>
  .hint {
    font-size: 0.85rem;
    color: var(--c-text-muted);
    margin-bottom: 0.5rem;
    text-align: left;
  }

  .user-answer {
    font-size: 1.5rem;
  }
</style>
