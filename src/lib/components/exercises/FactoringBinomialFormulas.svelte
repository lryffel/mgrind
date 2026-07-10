<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { formatFactoredLatex } from '../../exercises/factoringBinomialFormulas';
  import { parseFrac } from '../../math/fraction';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let varA = $derived(exercise.data?.varA ?? null);
  let varB = $derived(exercise.data?.varB ?? '');
  let selectedFormula = $state<number | null>(null);
  let aVal = $state('');
  let bVal = $state('');

  function normVal(s: string): string {
    return normalizeCoeff(s);
  }

  let normA = $derived(normVal(aVal));
  let normB = $derived(normVal(bVal));

  function submitAnswer() {
    if (selectedFormula === null) return;
    if (selectedFormula === 0) {
      onSubmit('0');
    } else {
      onSubmit(`${selectedFormula},${normA},${normB}`);
    }
  }

  let userLatex = $derived.by(() => {
    if (selectedFormula === null || selectedFormula === 0) return '';
    const aParsed = parseFrac(normA);
    const bParsed = parseFrac(normB);
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

  let textAnswer = $derived(correctLatex ? undefined : _('exercise.factoringBinomialFormulas.noFormulaFeedback'));
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext}>
  <p class="prompt-label">{_('exercise.factoringBinomialFormulas.prompt')}</p>
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
      <div class="expansion">
        {#if selectedFormula === 1 || selectedFormula === 2}
          <Math expression="(" />
          <NumericInput bind:value={aVal} variablePart={varA ?? ''} />
          <Math expression={selectedFormula === 1 ? '+' : '-'} />
          <NumericInput bind:value={bVal} variablePart={varB} />
          <Math expression=")^{2}" />
        {:else if selectedFormula === 3}
          <Math expression="(" />
          <NumericInput bind:value={aVal} variablePart={varA ?? ''} />
          <Math expression="+" />
          <NumericInput bind:value={bVal} variablePart={varB} />
          <Math expression=")(" />
          <NumericInput value={aVal} variablePart={varA ?? ''} readonly />
          <Math expression="-" />
          <NumericInput value={bVal} variablePart={varB} readonly />
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
    <Feedback {feedback} {correctLatex} {textAnswer} />
  {/if}
</ExerciseShell>

<style>
  .formula-select {
    width: auto;
    min-width: 12rem;
    text-align: center;
  }

  .no-formula-hint {
    font-style: italic;
    color: var(--c-text-muted);
    margin: 0;
  }
</style>
