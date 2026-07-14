<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from '../NumericInput.svelte';
  import type { ScientificNotationData } from '../../exercises/scientificNotation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as ScientificNotationData);
  let userInput = $state('');
  let coeffInput = $state('');
  let expInput = $state('');

  const subType = $derived(data.subType);
  const isMultiInput = $derived(subType !== 'sciToDec');
  const promptKey = $derived(data.promptKey ?? null);
  const promptParts = $derived(exercise.prompt.split('= ?'));

  let disableSubmit = $derived(isMultiInput ? coeffInput === '' || expInput === '' : userInput === '');
  let validationError = $derived(
    isMultiInput
      ? coeffInput.includes(',') || expInput.includes(',')
        ? _('error.decimalComma')
        : null
      : userInput.includes(',')
        ? _('error.decimalComma')
        : null,
  );

  function handleSubmit() {
    if (isMultiInput) {
      onSubmit(`${coeffInput.trim()},${expInput.trim()}`);
    } else {
      onSubmit(userInput.trim());
    }
  }

  const correctLatex = $derived.by(() => {
    if (!isMultiInput) return undefined;
    const parts = exercise.answer.split(',');
    return `${parts[0]} \\cdot 10^{${parts[1]}}`;
  });

  const textAnswer = $derived(isMultiInput ? undefined : exercise.answer);
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError} {disableSubmit}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={promptParts[0]} display />
      <Math expression="=" />
      {#if isMultiInput}
        <NumericInput bind:value={coeffInput} context="coefficient" />
        <Math expression="\cdot" />
        <Math expression="10" />
        <NumericInput bind:value={expInput} superscript context="exponent" />
      {:else}
        <NumericInput bind:value={userInput} />
      {/if}
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={promptParts[0]} display />
      <Math expression="=" />
      {#if isMultiInput}
        <span class="user-answer">
          <Math expression={`${coeffInput} \\cdot 10^{${expInput || '0'}}`} />
        </span>
      {:else}
        <span class="user-answer"><Math expression={userInput} /></span>
      {/if}
    </div>
    <Feedback {feedback} {correctLatex} {textAnswer} />
  {/if}
</ExerciseShell>

<style>
</style>
