<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import { formatFactoredLatex } from '../../exercises/factoringBinomialFormulas';
  import { parseFrac } from '../../math/fraction';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let varA = $derived(exercise.data?.varA ?? null);
  let varB = $derived(exercise.data?.varB ?? '');
  let selectedFormula = $state<number | null>(null);
  let aVal = $state('');
  let bVal = $state('');

  function submitAnswer() {
    if (selectedFormula === null) return;
    if (selectedFormula === 0) {
      onSubmit('0');
    } else {
      onSubmit(`${selectedFormula},${aVal},${bVal}`);
    }
  }

  let userLatex = $derived.by(() => {
    if (selectedFormula === null || selectedFormula === 0) return '';
    const aParsed = parseFrac(aVal);
    const bParsed = parseFrac(bVal);
    if (!aParsed || !bParsed) return '';
    return formatFactoredLatex(selectedFormula, aParsed[0], aParsed[1], bParsed[0], bParsed[1], varA, varB);
  });

  let correctLatex = $derived.by(() => {
    const parts = exercise.answer.split(',');
    const formula = parseInt(parts[0], 10);
    if (formula === 0) return '';
    const aParsed = parseFrac(parts[1] ?? '');
    const bParsed = parseFrac(parts[2] ?? '');
    if (!aParsed || !bParsed) return '';
    return formatFactoredLatex(formula, aParsed[0], aParsed[1], bParsed[0], bParsed[1], varA, varB);
  });
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext}>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <select bind:value={selectedFormula} class="formula-select">
      <option value={null}>--</option>
      <option value={1}>{_('exercise.factoringBinomialFormulas.formula1')}</option>
      <option value={2}>{_('exercise.factoringBinomialFormulas.formula2')}</option>
      <option value={3}>{_('exercise.factoringBinomialFormulas.formula3')}</option>
      <option value={0}>{_('exercise.factoringBinomialFormulas.noFormula')}</option>
    </select>

    {#if selectedFormula !== null && selectedFormula !== 0}
      <div class="expansion" role="group">
        {#if selectedFormula === 1 || selectedFormula === 2}
          <Math expression="(" />
          <input type="text" class="coeff-input" bind:value={aVal} placeholder="?" />
          {#if varA}
            <Math expression={varA} />
          {/if}
          <Math expression={selectedFormula === 1 ? '+' : '-'} />
          <input type="text" class="coeff-input" bind:value={bVal} placeholder="?" />
          {#if varB}
            <Math expression={varB} />
          {/if}
          <Math expression=")^{2}" />
        {:else if selectedFormula === 3}
          <Math expression="(" />
          <input type="text" class="coeff-input" bind:value={aVal} placeholder="?" />
          {#if varA}
            <Math expression={varA} />
          {/if}
          <Math expression="+" />
          <input type="text" class="coeff-input" bind:value={bVal} placeholder="?" />
          {#if varB}
            <Math expression={varB} />
          {/if}
          <Math expression=")(" />
          <input type="text" class="coeff-input linked" value={aVal} readonly />
          {#if varA}
            <Math expression={varA} />
          {/if}
          <Math expression="-" />
          <input type="text" class="coeff-input linked" value={bVal} readonly />
          {#if varB}
            <Math expression={varB} />
          {/if}
          <Math expression=")" />
        {/if}
      </div>
    {:else if selectedFormula === 0}
      <p class="no-formula-hint">{_('exercise.factoringBinomialFormulas.noFormulaHint')}</p>
    {/if}
  {:else}
    <div class="expansion">
      {#if userLatex}
        <Math expression="=" />
        <Math expression={userLatex} />
      {/if}
    </div>
    {#if feedback === 'correct'}
      <p class="feedback correct">{_('feedback.correct')}</p>
    {:else}
      <p class="feedback incorrect">
        {_('feedback.incorrect.prefix')}
        {#if correctLatex}
          <Math expression={correctLatex} />
        {:else}
          {_('exercise.factoringBinomialFormulas.noFormulaFeedback')}
        {/if}
        {_('feedback.incorrect.suffix')}
      </p>
    {/if}
  {/if}
</ExerciseShell>

<style>
  .formula-select {
    width: auto;
    min-width: 12rem;
    text-align: center;
  }

  .coeff-input.linked {
    opacity: 0.7;
    cursor: default;
  }

  .no-formula-hint {
    font-style: italic;
    color: var(--pico-muted-color, #777);
    margin: 0;
  }
</style>
