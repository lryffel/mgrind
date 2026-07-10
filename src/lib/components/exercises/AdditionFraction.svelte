<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let numInput = $state('');
  let denInput = $state('');

  let validationError = $derived(numInput.includes(',') || denInput.includes(',') ? _('error.decimalComma') : null);

  const num1 = $derived(exercise.data?.num1 ?? 0);
  const den1 = $derived(exercise.data?.den1 ?? 1);
  const num2 = $derived(exercise.data?.num2 ?? 0);
  const den2 = $derived(exercise.data?.den2 ?? 1);
  const op = $derived(exercise.data?.op ?? '+');
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived(exercise.data?.promptKey ?? 'exercise.additionFraction.prompt');
  const correctLatex = $derived(
    correctNumDen[1] === '1' ? correctNumDen[0] : `\\frac{${correctNumDen[0]}}{${correctNumDen[1]}}`,
  );
  const userLatex = $derived(
    (denInput || '1') === '1' ? `${numInput || '0'}` : `\\frac{${numInput || '0'}}{${denInput || '1'}}`,
  );
</script>

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => onSubmit(`${numInput || '0'},${denInput || '1'}`)}
  {onNext}
  {validationError}
>
  {#if feedback === null}
    <p class="prompt-label">{_(promptKey)}</p>
    <p class="prompt fraction-prompt">
      <Math expression={`\\frac{${num1}}{${den1}}`} />
      <Math expression={op} />
      <Math expression={`\\frac{${num2}}{${den2}}`} />
      <Math expression="=" />
      <NumericInput bind:num={numInput} bind:den={denInput} fraction numPlaceholder="0" denPlaceholder="1" />
    </p>
  {:else}
    <p class="prompt-label">{_(promptKey)}</p>
    <p class="prompt fraction-prompt">
      <Math expression={`\\frac{${num1}}{${den1}}`} />
      <Math expression={op} />
      <Math expression={`\\frac{${num2}}{${den2}}`} />
      <Math expression="=" />
      <span class="user-answer"><Math expression={userLatex} /></span>
    </p>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
