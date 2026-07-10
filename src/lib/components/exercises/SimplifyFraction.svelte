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

  let correctNumDen = $derived(exercise.answer.split(','));
  let correctLatex = $derived(`\\frac{${correctNumDen[0]}}{${correctNumDen[1]}}`);
</script>

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => onSubmit(`${numInput},${denInput}`)}
  {onNext}
  {validationError}
>
  {#if feedback === null}
    <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
    <p class="prompt fraction-prompt">
      <Math expression={exercise.prompt} />
      <Math expression="=" />
      <NumericInput bind:num={numInput} bind:den={denInput} fraction />
    </p>
  {:else}
    <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
    <p class="prompt fraction-prompt">
      <Math expression={exercise.prompt} />
      <Math expression="=" />
      <span class="user-answer"
        ><Math expression={numInput && denInput ? `\\frac{${numInput}}{${denInput}}` : '\\;'} /></span
      >
    </p>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
