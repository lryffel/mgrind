<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { formatCollectingAnswer } from '../../exercises/collectingTerms';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let fields = $derived(exercise.data?.fields ?? []);
  let promptKey = $derived(exercise.data?.promptKey ?? null);
  let variableParts = $derived(fields.map((f) => f.variablePart));
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  $effect(() => {
    values = fields.map(() => '');
  });

  let normValues = $derived(values.map(normalizeCoeff));
  let userLatex = $derived(formatCollectingAnswer(normValues, variableParts));
  let correctLatex = $derived(formatCollectingAnswer(exercise.answer.split(','), variableParts));
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(normValues.join(','))} {onNext}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
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
      <span class="user-answer"><Math expression={userLatex} /></span>
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
