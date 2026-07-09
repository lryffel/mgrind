<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { buildExpandedLatex } from '../../exercises/binomialFormulas';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let fields = $derived(exercise.data?.fields ?? []);
  let variableParts = $derived(fields.map((f) => f.variablePart));
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  $effect(() => {
    values = fields.map(() => '');
  });

  let normValues = $derived(values.map((v) => v.trim() || '1'));
  let userLatex = $derived(buildExpandedLatex(normValues, variableParts));
  let correctLatex = $derived(buildExpandedLatex(exercise.answer.split(','), variableParts));
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(normValues.join(','))} {onNext}>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="expansion">
      <Math expression="=" />
      {#each fields as { variablePart }, i (i)}
        {#if i > 0}
          <Math expression="+" />
        {/if}
        <NumericInput bind:value={values[i]} {variablePart} />
      {/each}
    </div>
  {:else}
    <div class="expansion">
      <Math expression="=" />
      <Math expression={userLatex} />
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
