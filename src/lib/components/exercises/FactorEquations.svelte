<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from '../NumericInput.svelte';
  import { validateFactorEquationsPerRoot } from '../../exercises/factorEquations';
  import type { FactorEquationsData } from '../../exercises/factorEquations';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as FactorEquationsData);
  let variable = $derived(data.variable ?? 'x');
  let numSolutions = $derived(data.numSolutions ?? 1);

  let values = $state<string[]>([]);
  let perRootCorrect = $state<boolean[]>([]);

  let validationError = $derived(values.some((v) => v.includes(',')) ? _('error.decimalComma') : null);

  $effect(() => {
    if (feedback === null) {
      values = Array(numSolutions).fill('');
      perRootCorrect = [];
    }
  });

  let labels = $derived(Array.from({ length: numSolutions }, (_, i) => `${variable}_{${i + 1}} = `));

  let correctLatex = $derived.by(() => {
    const roots = exercise.answer.split(',').map(Number);
    if (roots.length === 1) return `${variable} = ${roots[0]}`;
    return roots.map((r, i) => `${variable}_{${i + 1}} = ${r}`).join(',\\,');
  });

  function handleSubmit() {
    const joined = values.map((v) => v.trim()).join(',');
    perRootCorrect = validateFactorEquationsPerRoot(joined, exercise);
    onSubmit(joined);
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.factorEquations.prompt')}</p>
  <div class="prompt-row">
    <Math expression={exercise.prompt} display />
  </div>

  {#if feedback === null}
    <div class="solution-inputs">
      {#each labels as label, i (i)}
        <span class="solution-row">
          <Math expression={label} />
          <NumericInput bind:value={values[i]} align="center" />
        </span>
      {/each}
    </div>
  {:else}
    <div class="solution-inputs per-root">
      {#each labels as label, i (i)}
        <span class="solution-row">
          <Math expression={label} />
          <span class="user-answer" class:correct={perRootCorrect[i]} class:incorrect={!perRootCorrect[i]}
            ><Math expression={values[i] || '?'} /></span
          >
        </span>
      {/each}
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .solution-inputs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }

  .solution-row {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
