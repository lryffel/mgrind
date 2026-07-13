<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import CoefficientField from '../CoefficientField.svelte';
  import { formatCollectingAnswer } from '../../exercises/collectingTerms';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let fields = $derived(exercise.data?.fields ?? []);
  let promptKey = $derived(exercise.data?.promptKey ?? null);
  let variableParts = $derived(fields.map((f) => f.variablePart));
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  let validationError = $derived(values.some((v) => v.includes(',')) ? _('error.decimalComma') : null);

  $effect(() => {
    values = fields.map(() => '');
  });

  let contexts = $derived(fields.map((f) => (f.variablePart === '' ? 'summand' : 'coefficient')));
  let normValues = $derived(values.map((v, i) => normalizeCoeff(v, contexts[i])));
  let userLatex = $derived(formatCollectingAnswer(normValues, variableParts));
  let correctLatex = $derived(formatCollectingAnswer(exercise.answer.split(','), variableParts));
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(normValues.join(','))} {onNext} {validationError}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        {#each fields as { variablePart }, i (i)}
          {#if i > 0}
            <Math expression="+" />
          {/if}
          <CoefficientField bind:value={values[i]} {variablePart} />
        {/each}
      </span>
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        <span class="user-answer"><Math expression={userLatex} /></span>
      </span>
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
