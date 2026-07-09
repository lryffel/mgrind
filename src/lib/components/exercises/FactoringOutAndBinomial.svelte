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

  let normGcfCoeff = $derived(normalizeCoeff(gcfCoeff ?? ''));
  let normA = $derived(normalizeCoeff(aVal ?? ''));
  let normB = $derived(normalizeCoeff(bVal ?? ''));

  let currentOption = $derived(hasGcf ? data.factorOptions[selectedGcfIdx!] : null);

  let cdot = $derived('\\cdot');

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

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_('exercise.factoringOutAndBinomial.prompt')}</p>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

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

      <div class="expansion">
        <Math expression="=" />
        {#if selectedGcfIdx != null}
          <NumericInput bind:value={gcfCoeff} variablePart={currentOption?.latex ?? ''} />
        {/if}
        {#if selectedGcfIdx != null && hasFormula}
          <Math expression={cdot} />
        {/if}
        {#if hasFormula}
          {#if selectedFormula === 3}
            <span class="binomial-body">
              <Math expression="(" />
              <NumericInput bind:value={aVal} variablePart={data.varA ?? ''} />
              <Math expression="+" />
              <NumericInput bind:value={bVal} variablePart={data.varB} />
              <Math expression=")(" />
              <NumericInput value={aVal} variablePart={data.varA ?? ''} readonly />
              <Math expression="-" />
              <NumericInput value={bVal} variablePart={data.varB} readonly />
              <Math expression=")" />
            </span>
          {:else}
            <span class="binomial-body">
              <Math expression="(" />
              <NumericInput bind:value={aVal} variablePart={data.varA ?? ''} />
              <Math expression={selectedFormula === 1 ? '+' : '-'} />
              <NumericInput bind:value={bVal} variablePart={data.varB} />
              <Math expression=")^{2}" />
            </span>
          {/if}
        {/if}
        {#if noFormula && selectedGcfIdx != null}
          <p class="no-formula-hint">{_('exercise.factoringBinomialFormulas.noFormulaHint')}</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="expansion">
      <Math expression="=" />
      {#if data.isTrap}
        <span class="no-formula-feedback">{_('exercise.factoringBinomialFormulas.noFormulaFeedback')}</span>
      {:else}
        <Math expression={correctFactoredLatex} />
      {/if}
    </div>
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
    color: var(--pico-muted-color, #777);
    white-space: nowrap;
  }

  .factor-select {
    width: auto;
    min-width: 4rem;
    text-align: center;
  }

  .formula-select {
    width: auto;
    min-width: 10rem;
    text-align: center;
  }

  .binomial-body {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }

  .no-formula-hint {
    font-style: italic;
    color: var(--pico-muted-color, #777);
    margin: 0;
  }

  .no-formula-feedback {
    font-style: italic;
    color: var(--pico-muted-color, #777);
  }
</style>
