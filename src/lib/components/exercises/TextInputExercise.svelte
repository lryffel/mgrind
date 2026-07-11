<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');

  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  let correctLatex = $derived(exercise.answer);
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} {validationError}>
  {#if feedback === null}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <div class="prompt-row">
        <Math expression={parts[0]} display />
        <NumericInput bind:value={userInput} align="center" />
        <Math expression={parts[1] ?? ''} display />
      </div>
    {:else}
      <p class="prompt">
        <Math expression={exercise.prompt} />
      </p>
      <div class="answer-row">
        <NumericInput bind:value={userInput} />
      </div>
    {/if}
  {:else}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <div class="prompt-row">
        <Math expression={parts[0]} display />
        <span class="user-answer"><Math expression={userInput} /></span>
        <Math expression={parts[1] ?? ''} display />
      </div>
    {:else}
      <p class="prompt">
        <Math expression={exercise.prompt} />
      </p>
    {/if}
    <Feedback {feedback} {correctLatex} textAnswer={exercise.answer} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }

  .prompt-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
