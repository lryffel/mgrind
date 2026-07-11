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

  let validationError = $derived(aVal.includes(',') || bVal.includes(',') ? _('error.decimalComma') : null);

  function normVal(s: string): string {
    return normalizeCoeff(s, 'coefficient');
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

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.factoringBinomialFormulas.prompt')}</p>
  {#if feedback === null}
    <select bind:value={selectedFormula} class="formula-select">
      <option value={null}>--</option>
      <option value={1}>{_('exercise.factoringBinomialFormulas.formula1')}</option>
      <option value={2}>{_('exercise.factoringBinomialFormulas.formula2')}</option>
      <option value={3}>{_('exercise.factoringBinomialFormulas.formula3')}</option>
      <option value={0}>{_('exercise.factoringBinomialFormulas.noFormula')}</option>
    </select>

    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      {#if selectedFormula !== null && selectedFormula !== 0}
        <span class="continuation">
          <Math expression="=" />
          {#if selectedFormula === 1 || selectedFormula === 2}
            <Math expression="(" />
            <NumericInput bind:value={aVal} variablePart={varA ?? ''} context="coefficient" />
            <Math expression={selectedFormula === 1 ? '+' : '-'} />
            <NumericInput bind:value={bVal} variablePart={varB} context="coefficient" />
            <Math expression=")^{2}" />
          {:else if selectedFormula === 3}
            <Math expression="(" />
            <NumericInput bind:value={aVal} variablePart={varA ?? ''} context="coefficient" />
            <Math expression="+" />
            <NumericInput bind:value={bVal} variablePart={varB} context="coefficient" />
            <Math expression=")(" />
            <NumericInput value={aVal} variablePart={varA ?? ''} context="coefficient" readonly />
            <Math expression="-" />
            <NumericInput value={bVal} variablePart={varB} context="coefficient" readonly />
            <Math expression=")" />
          {/if}
        </span>
      {:else if selectedFormula === 0}
        <span class="continuation">
          <Math expression="=" />
          <span class="no-formula-hint">{_('exercise.factoringBinomialFormulas.noFormulaHint')}</span>
        </span>
      {/if}
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        {#if userLatex}
          <Math expression="=" />
          <span class="user-answer"><Math expression={userLatex} /></span>
        {/if}
      </span>
    </div>
    <Feedback {feedback} {correctLatex} {textAnswer} />
  {/if}
</ExerciseShell>

<style>
  .formula-select {
    width: auto;
    min-width: 8rem;
    text-align: center;
  }

  .no-formula-hint {
    font-style: italic;
    color: var(--c-text-muted);
    margin: 0;
  }
</style>
