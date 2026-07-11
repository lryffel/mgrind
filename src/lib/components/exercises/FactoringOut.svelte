<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { formatFactoredLatex } from '../../exercises/factoringOut';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(
    exercise.data as unknown as {
      isTrap: boolean;
      factorOptions: { text: string; latex: string; innerVarParts: string[] }[];
      correctIdx: number;
      gcfCoeff: number;
      expectedInnerCoeffs: number[];
    },
  );

  let selectedIdx = $state<number | null>(null);
  let coeffA = $state('');
  let coeffs = $state<string[]>([]);

  let validationError = $derived(
    coeffA.includes(',') || coeffs.some((c) => c.includes(',')) ? _('error.decimalComma') : null,
  );

  let currentOption = $derived(selectedIdx !== null && selectedIdx >= 0 ? data.factorOptions[selectedIdx] : null);

  let currentInnerVarParts = $derived(currentOption?.innerVarParts ?? []);

  let normCoeffA = $derived(normalizeCoeff(coeffA ?? '', 'coefficient'));
  let normCoeffs = $derived(coeffs.map((c) => normalizeCoeff(c ?? '', 'coefficient')));

  let userLatex = $derived.by(() => {
    if (selectedIdx == null || selectedIdx < 0) return '';
    const a = parseInt(normCoeffA, 10) || 1;
    return formatFactoredLatex(
      a,
      currentOption!.latex,
      normCoeffs.map((c) => parseInt(c, 10) || 1),
      currentInnerVarParts,
    );
  });

  let correctLatex = $derived.by(() => {
    if (data.isTrap) return '';
    const correctOption = data.factorOptions[data.correctIdx];
    return formatFactoredLatex(
      data.gcfCoeff,
      correctOption.latex,
      data.expectedInnerCoeffs,
      correctOption.innerVarParts,
    );
  });

  let cdot = $derived('\\cdot');
  let cdotOpen = $derived('\\cdot(');
  let inputKey = $derived(selectedIdx ?? 'none');

  function onSelectChange() {
    coeffA = '';
    coeffs = currentInnerVarParts.map(() => '');
  }

  function handleSubmit() {
    if (selectedIdx == null || selectedIdx < 0) {
      onSubmit('-1');
      return;
    }
    const a = parseInt(normCoeffA, 10) || 1;
    const inner = normCoeffs.map((c) => parseInt(c, 10) || 1);
    if (inner.length === 0) {
      onSubmit(`${selectedIdx},${a}`);
    } else {
      onSubmit(`${selectedIdx},${a},${inner.join(',')}`);
    }
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.factoringOut.prompt')}</p>
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        {#if selectedIdx != null && selectedIdx >= 0}
          <NumericInput bind:value={coeffA} context="coefficient" />
          <Math expression={cdot} />
        {/if}
        <select bind:value={selectedIdx} class="factor-select" onchange={onSelectChange}>
          <option value={null}>--</option>
          <option value={-1}>{_('exercise.factoringOut.noFactor')}</option>
          {#each data.factorOptions as opt, i (opt.text)}
            <option value={i}>{opt.text}</option>
          {/each}
        </select>
        {#if selectedIdx != null && selectedIdx >= 0}
          {#key inputKey}
            <Math expression={cdotOpen} />
            {#each currentInnerVarParts as part, i (i)}
              {#if i > 0}
                <Math expression="+" />
              {/if}
              <NumericInput bind:value={coeffs[i]} variablePart={part} context="coefficient" />
            {/each}
            <Math expression=")" />
          {/key}
        {/if}
      </span>
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        {#if data.isTrap && feedback === 'correct'}
          <span class="no-factor-feedback">{_('exercise.factoringOut.noFactor')}</span>
        {:else if data.isTrap}
          <span class="user-answer"><Math expression={userLatex} /></span>
          <span class="no-factor-feedback">{_('exercise.factoringOut.noFactor')}</span>
        {:else}
          <span class="user-answer"><Math expression={userLatex} /></span>
        {/if}
      </span>
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .factor-select {
    width: auto;
    min-width: auto;
    text-align: center;
  }

  .no-factor-feedback {
    font-style: italic;
    color: var(--c-text-muted);
  }
</style>
