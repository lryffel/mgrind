<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
  let coeffInput = $state('');
  let expInput = $state('');

  const cdot = '\\cdot';
  const subType = $derived(exercise.data?.subType);
  const isMultiInput = $derived(subType !== 'sciToDec');
  const promptKey = $derived(exercise.data?.promptKey ?? null);

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

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#if feedback === null}
    {#if promptKey}
      <p class="prompt-label">{_(promptKey)}</p>
    {/if}
    <p class="prompt">
      <Math expression={exercise.prompt} />
    </p>
    {#if isMultiInput}
      <div class="sci-row">
        <NumericInput bind:value={coeffInput} align="right" placeholder="…" />
        <Math expression={cdot} />
        <Math expression="10" />^<sup
          ><input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="exp-input"
            style="text-align: left; font-family: monospace;"
            bind:value={expInput}
            placeholder="…"
          /></sup
        >
      </div>
    {:else}
      <div class="answer-row">
        <NumericInput bind:value={userInput} placeholder="" />
      </div>
    {/if}
  {:else}
    {#if promptKey}
      <p class="prompt-label">{_(promptKey)}</p>
    {/if}
    <p class="prompt">
      <Math expression={exercise.prompt} />
    </p>
    {#if isMultiInput}
      <div class="sci-row">
        <span class="user-answer">
          <Math expression={`${coeffInput} \\cdot 10`} />^<sup>{expInput || ''}</sup>
        </span>
      </div>
    {:else}
      <div class="answer-row">
        <span class="user-answer"><Math expression={userInput} /></span>
      </div>
    {/if}
    <Feedback {feedback} {correctLatex} {textAnswer} />
  {/if}
</ExerciseShell>

<style>
  .sci-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    font-size: 1.25rem;
    margin: 1rem 0;
  }

  .exp-input {
    width: 3rem;
  }

  .user-answer {
    text-align: left;
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }
</style>
