<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import { buildExpandedLatex } from '../../exercises/binomialFormulas';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let fields = $derived(exercise.data?.fields ?? []);
  let variableParts = $derived(fields.map((f) => f.variablePart));
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  $effect(() => {
    values = fields.map(() => '');
  });

  let userLatex = $derived(buildExpandedLatex(values, variableParts));
  let correctLatex = $derived(buildExpandedLatex(exercise.answer.split(','), variableParts));
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(values.join(','))} {onNext}>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="expansion" role="group">
      <Math expression="=" />
      {#each fields as { variablePart }, i (i)}
        {#if i > 0}
          <Math expression="+" />
        {/if}
        <input type="text" class="coeff-input" bind:value={values[i]} placeholder="?" />
        {#if variablePart}
          <Math expression={variablePart} />
        {/if}
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
