<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { PercentData } from '../../exercises/percent';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import CoefficientField from '../CoefficientField.svelte';
  import NumericInput from '../NumericInput.svelte';
  import Math from '../Math.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  let data = $derived(exercise.data as PercentData);

  let currentVariablePart = $derived(data.variablePart ?? '');

  let correctLatex = $derived.by(() => {
    if (currentVariablePart) {
      return `${exercise.answer}${currentVariablePart}`;
    }
    return exercise.answer;
  });

  let userLatex = $derived.by(() => {
    const t = userInput.trim();
    if (t === '') return '';
    if (currentVariablePart) {
      return `${t}${currentVariablePart}`;
    }
    return t;
  });
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} {validationError}>
  {#if feedback === null}
    <p class="prompt-label">
      {#if data.variant === 'A'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.p}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.G}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'B'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.W}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.p}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'C'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.G}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.W}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'D'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.n1}</span><span
          >{_(`exercise.percent.variant${data.variant}.between1`)}</span
        ><span class="pn">{data.c1}</span><span>{_(`exercise.percent.variant${data.variant}.between2`)}</span><span
          class="pn">{data.n2}</span
        ><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'E'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.n1}</span><span
          >{_(`exercise.percent.variant${data.variant}.between1`)}</span
        ><span class="pn">{data.t1}</span><span>{_(`exercise.percent.variant${data.variant}.between2`)}</span><span
          class="pn">{data.n2}</span
        ><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {/if}
    </p>
    <div class="answer-row">
      {#if currentVariablePart}
        <CoefficientField bind:value={userInput} variablePart={currentVariablePart} />
      {:else}
        <NumericInput bind:value={userInput} />
      {/if}
    </div>
  {:else}
    <p class="prompt-label">
      {#if data.variant === 'A'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.p}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.G}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'B'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.W}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.p}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'C'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.G}</span><span
          >{_(`exercise.percent.variant${data.variant}.between`)}</span
        ><span class="pn">{data.W}</span><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'D'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.n1}</span><span
          >{_(`exercise.percent.variant${data.variant}.between1`)}</span
        ><span class="pn">{data.c1}</span><span>{_(`exercise.percent.variant${data.variant}.between2`)}</span><span
          class="pn">{data.n2}</span
        ><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {:else if data.variant === 'E'}
        <span>{_(`exercise.percent.variant${data.variant}.before`)}</span><span class="pn">{data.n1}</span><span
          >{_(`exercise.percent.variant${data.variant}.between1`)}</span
        ><span class="pn">{data.t1}</span><span>{_(`exercise.percent.variant${data.variant}.between2`)}</span><span
          class="pn">{data.n2}</span
        ><span>{_(`exercise.percent.variant${data.variant}.after`)}</span>
      {/if}
    </p>
    {#if userInput.trim()}
      <p class="result-row">
        <span class="user-answer"><Math expression={userLatex} /></span>
      </p>
    {/if}
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }
  .result-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: center;
    margin-top: 0.5rem;
    font-size: 1.15rem;
  }
  .user-answer {
    color: var(--c-magenta);
  }
</style>
