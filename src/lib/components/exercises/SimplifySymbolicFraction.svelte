<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { formatSymbolicResult } from '../../exercises/simplifySymbolicFraction';
  import { normalizeCoeff } from '../../validation';
  import type { SimplifySymbolicFractionData } from '../../exercises/simplifySymbolicFraction';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as unknown as SimplifySymbolicFractionData);
  let showFraction = $derived(data.showFraction);
  let numFields = $derived(data.numFields);
  let denFields = $derived(data.denFields);
  let promptKey = $derived(data.promptKey ?? null);

  let numValues = $state<string[]>([]);
  let denValues = $state<string[]>([]);

  $effect(() => {
    numValues = numFields.map(() => '');
    denValues = denFields.map(() => '');
  });

  let normNumValues = $derived(numValues.map(normalizeCoeff));
  let normDenValues = $derived(denValues.map(normalizeCoeff));

  let correctNumParts = $derived(
    showFraction ? exercise.answer.split(';')[0].split(',') : exercise.answer.split(','),
  );
  let correctDenParts = $derived(
    showFraction ? exercise.answer.split(';')[1].split(',') : [],
  );
  let correctNumVarParts = $derived(numFields.map((f) => f.variablePart));
  let correctDenVarParts = $derived(denFields.map((f) => f.variablePart));

  let userLatex = $derived(
    formatSymbolicResult(normNumValues, correctNumVarParts, normDenValues, correctDenVarParts, showFraction),
  );
  let correctLatex = $derived(
    formatSymbolicResult(correctNumParts, correctNumVarParts, correctDenParts, correctDenVarParts, showFraction),
  );

</script>

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => {
    if (showFraction) {
      onSubmit(`${normalizeCoeff(numValues[0])};${normalizeCoeff(denValues[0])}`);
    } else {
      onSubmit(numValues.map(normalizeCoeff).join(','));
    }
  }}
  {onNext}
>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="expansion">
      <Math expression="=" />
      {#if showFraction}
        <span class="result-fraction">
          <span class="fraction-num">
            {#each numFields as field, i (i)}
              <NumericInput bind:value={numValues[i]} variablePart={field.variablePart} />
            {/each}
          </span>
          <span class="fraction-bar"></span>
          <span class="fraction-den">
            {#each denFields as field, i (i)}
              <NumericInput bind:value={denValues[i]} variablePart={field.variablePart} />
            {/each}
          </span>
        </span>
      {:else}
        {#each numFields as field, i (i)}
          {#if i > 0}
            <Math expression="+" />
          {/if}
          <NumericInput bind:value={numValues[i]} variablePart={field.variablePart} />
        {/each}
      {/if}
    </div>
  {:else}
    <div class="expansion">
      <Math expression="=" />
      <span class="user-answer"><Math expression={userLatex} /></span>
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .result-fraction {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
  }

  .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 3rem;
  }

  .fraction-num,
  .fraction-den {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
</style>
