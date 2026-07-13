<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { useFractionInput, fractionLatex } from '../../fraction-input.svelte';
  import type { SubstitutionData } from '../../exercises/substitution';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let input = $state('');
  let frac = useFractionInput();

  let data = $derived(exercise.data as SubstitutionData);
  let validationError = $derived(input.includes(',') || frac.validationError !== null ? _('error.decimalComma') : null);

  const variable = $derived(data.variable ?? 'x');
  const value = $derived(data.value ?? '');
  const term = $derived(data.term ?? exercise.prompt);
  const complexity = $derived(data.complexity ?? 0);
  const answerIsFraction = $derived(exercise.answer.includes('/'));

  function submitAnswer() {
    const answer = answerIsFraction ? frac.getSubmitValue('/') : input.trim();
    onSubmit(answer);
  }

  const correctLatex = $derived.by(() => {
    if (!answerIsFraction) return undefined;
    const parts = exercise.answer.split('/');
    return fractionLatex(parts[0], parts[1]);
  });

  const textAnswer = $derived(answerIsFraction ? undefined : exercise.answer);

  const userLatex = $derived(answerIsFraction ? frac.userLatex : input || '');
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext} {validationError}>
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore')}<Math expression={`${variable} = ${value}`} />
    {#if data.varB && data.valueB}
      {_('exercise.substitution.and')}<Math expression={`${data.varB} = ${data.valueB}`} />
    {/if}
    {_('exercise.substitution.promptAfter')}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={term} display />
      <Math expression="=" />
      {#if answerIsFraction}
        <NumericInput bind:num={frac.num} bind:den={frac.den} fraction numPlaceholder="0" denPlaceholder="1" />
      {:else}
        <NumericInput bind:value={input} />
      {/if}
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={term} display />
      <Math expression="=" />
      {#if answerIsFraction}
        <span class="user-answer"><Math expression={userLatex} /></span>
      {:else}
        <span class="user-answer"><Math expression={userLatex} /></span>
      {/if}
    </div>
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
</style>
