<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { formatFullFactoredLatex } from '../../exercises/factoringOutAndBinomial';
  import type { FactoringOutAndBinomialData } from '../../exercises/factoringOutAndBinomial';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as unknown as FactoringOutAndBinomialData);

  let selectedFormula = $state<number | null>(null);
  let selectedGcfIdx = $state<number | null>(null);
  let gcfCoeff = $state('');
  let aVal = $state('');
  let bVal = $state('');

  let validationError = $derived(
    gcfCoeff.includes(',') || aVal.includes(',') || bVal.includes(',') ? _('error.decimalComma') : null,
  );

  $effect(() => {
    if (feedback === null) {
      selectedFormula = null;
      selectedGcfIdx = null;
      gcfCoeff = '';
      aVal = '';
      bVal = '';
    }
  });

  let hasGcf = $derived(selectedGcfIdx != null && selectedGcfIdx >= 0);
  let noGcf = $derived(selectedGcfIdx === -1);
  let hasFormula = $derived(selectedFormula != null && selectedFormula > 0);
  let noFormula = $derived(selectedFormula === 0);

  let normGcfCoeff = $derived(normalizeCoeff(gcfCoeff ?? '', 'coefficient'));
  let normA = $derived(normalizeCoeff(aVal ?? '', 'coefficient'));
  let normB = $derived(normalizeCoeff(bVal ?? '', 'coefficient'));

  let currentOption = $derived(hasGcf ? data.factorOptions[selectedGcfIdx!] : null);

  let cdot = $derived('\\cdot');

  let userLatex = $derived.by(() => {
    if (selectedFormula == null || selectedFormula === 0) return '';
    const coeff = parseInt(normGcfCoeff, 10) || 1;
    const gcfLatex =
      selectedGcfIdx != null && selectedGcfIdx >= 0 && selectedGcfIdx < data.factorOptions.length
        ? data.factorOptions[selectedGcfIdx].latex
        : '';
    const a = parseInt(normA, 10) || 1;
    const b = parseInt(normB, 10) || 1;
    return formatFullFactoredLatex(selectedFormula, coeff, gcfLatex, a, 1, b, 1, data.varA, data.varB);
  });

  let correctFactoredLatex = $derived.by(() => {
    if (data.isTrap) return '';
    const correctOption = data.correctGcfIdx >= 0 ? data.factorOptions[data.correctGcfIdx] : null;
    return formatFullFactoredLatex(
      data.formulaType,
      data.gcfCoeff,
      correctOption?.latex ?? '',
      data.aNum,
      data.aDen,
      data.bNum,
      data.bDen,
      data.varA,
      data.varB,
    );
  });

  function handleSubmit() {
    if (data.isTrap) {
      onSubmit('-1');
      return;
    }

    const formula = selectedFormula ?? 0;
    const gcfIdx = selectedGcfIdx ?? -1;
    const coeff = parseInt(normGcfCoeff, 10) || 1;
    const a = parseInt(normA, 10) || 1;
    const b = parseInt(normB, 10) || 1;
    onSubmit(`${formula},${coeff},${gcfIdx},${a}/1,${b}/1`);
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.factoringOutAndBinomial.prompt')}</p>
  {#if feedback === null}
    <div class="answer-group" role="group">
      <div class="config-row" role="group">
        <label class="config-item">
          <span class="config-label">{_('exercise.factoringOutAndBinomial.commonFactor')}</span>
          <select bind:value={selectedGcfIdx} class="factor-select">
            <option value={null}>--</option>
            <option value={-1}>1</option>
            {#each data.factorOptions as opt, i (opt.text)}
              <option value={i}>{opt.text}</option>
            {/each}
          </select>
        </label>
        <label class="config-item">
          <span class="config-label">{_('exercise.factoringOutAndBinomial.formula')}</span>
          <select bind:value={selectedFormula} class="formula-select">
            <option value={null}>--</option>
            <option value={0}>{_('exercise.factoringBinomialFormulas.noFormula')}</option>
            <option value={1}>{_('exercise.factoringBinomialFormulas.formula1')}</option>
            <option value={2}>{_('exercise.factoringBinomialFormulas.formula2')}</option>
            <option value={3}>{_('exercise.factoringBinomialFormulas.formula3')}</option>
          </select>
        </label>
      </div>

      <p class="prompt fraction-prompt">
        <Math expression={exercise.prompt} />
        <span class="continuation">
          <Math expression="=" />
          {#if selectedGcfIdx != null}
            <NumericInput bind:value={gcfCoeff} variablePart={currentOption?.latex ?? ''} context="coefficient" />
          {/if}
          {#if selectedGcfIdx != null && hasFormula}
            <Math expression={cdot} />
          {/if}
          {#if hasFormula}
            {#if selectedFormula === 3}
              <span class="binomial-body">
                <Math expression="(" />
                <NumericInput bind:value={aVal} variablePart={data.varA ?? ''} context="coefficient" />
                <Math expression="+" />
                <NumericInput bind:value={bVal} variablePart={data.varB} context="coefficient" />
                <Math expression=")(" />
                <NumericInput value={aVal} variablePart={data.varA ?? ''} context="coefficient" readonly />
                <Math expression="-" />
                <NumericInput value={bVal} variablePart={data.varB} context="coefficient" readonly />
                <Math expression=")" />
              </span>
            {:else}
              <span class="binomial-body">
                <Math expression="(" />
                <NumericInput bind:value={aVal} variablePart={data.varA ?? ''} context="coefficient" />
                <Math expression={selectedFormula === 1 ? '+' : '-'} />
                <NumericInput bind:value={bVal} variablePart={data.varB} context="coefficient" />
                <Math expression=")^{2}" />
              </span>
            {/if}
          {/if}
          {#if noFormula && selectedGcfIdx != null}
            <span class="no-formula-hint">{_('exercise.factoringBinomialFormulas.noFormulaHint')}</span>
          {/if}
        </span>
      </p>
    </div>
  {:else}
    <p class="prompt fraction-prompt">
      <Math expression={exercise.prompt} />
      {#if data.isTrap && feedback === 'correct'}
        <span class="no-formula-feedback">{_('exercise.factoringBinomialFormulas.noFormulaFeedback')}</span>
      {:else if data.isTrap}
        {#if userLatex}
          <span class="continuation">
            <Math expression="=" />
            <span class="user-answer"><Math expression={userLatex} /></span>
          </span>
        {/if}
        <span class="no-formula-feedback">{_('exercise.factoringBinomialFormulas.noFormulaFeedback')}</span>
      {:else}
        <span class="continuation">
          <Math expression="=" />
          <span class="user-answer"><Math expression={userLatex} /></span>
        </span>
      {/if}
    </p>
    <Feedback {feedback} correctLatex={correctFactoredLatex} />
  {/if}
</ExerciseShell>

<style>
  .answer-group {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: auto;
  }

  .config-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0.5rem 0;
  }

  .config-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .config-label {
    font-size: 0.85em;
    color: var(--c-text-muted);
    white-space: nowrap;
  }

  .factor-select {
    width: auto;
    min-width: auto;
    text-align: center;
  }

  .formula-select {
    width: auto;
    min-width: 8rem;
    text-align: center;
  }

  .binomial-body {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .no-formula-hint {
    font-style: italic;
    color: var(--c-text-muted);
    margin: 0;
  }

  .no-formula-feedback {
    font-style: italic;
    color: var(--c-text-muted);
  }
</style>
