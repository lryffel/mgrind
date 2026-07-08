<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import FractionInput from './FractionInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let numInput = $state('');
  let denInput = $state('');

  const num1 = $derived(exercise.data?.num1 ?? 0);
  const den1 = $derived(exercise.data?.den1 ?? 1);
  const num2 = $derived(exercise.data?.num2 ?? 0);
  const den2 = $derived(exercise.data?.den2 ?? 1);
  const op = $derived(exercise.data?.op ?? '+');
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived(exercise.data?.promptKey ?? 'exercise.additionFraction.prompt');
  const correctLatex = $derived(`\\frac{${correctNumDen[0]}}{${correctNumDen[1]}}`);
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(`${numInput},${denInput}`)} {onNext} card={false}>
  {#if feedback === null}
    <p class="prompt-label">{_(promptKey)}</p>
    <p class="prompt fraction-prompt">
      <Math expression={`\\frac{${num1}}{${den1}}`} />
      <Math expression={op} />
      <Math expression={`\\frac{${num2}}{${den2}}`} />
      <Math expression="=" />
      <FractionInput bind:num={numInput} bind:den={denInput} />
    </p>
  {:else}
    <p class="prompt-label">{_(promptKey)}</p>
    <p class="prompt fraction-prompt">
      <Math expression={`\\frac{${num1}}{${den1}}`} />
      <Math expression={op} />
      <Math expression={`\\frac{${num2}}{${den2}}`} />
      <Math expression="=" />
      <Math expression={numInput && denInput ? `\\frac{${numInput}}{${denInput}}` : '\\;'} />
    </p>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
