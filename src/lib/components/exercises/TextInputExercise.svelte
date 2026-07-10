<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext}  >
  {#if feedback === null}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <p class="prompt">
        <Math expression={parts[0]} />
        <NumericInput bind:value={userInput} placeholder="" />
        <Math expression={parts[1] ?? ''} />
      </p>
    {:else}
      <p class="prompt">
        <Math expression={exercise.prompt} />
      </p>
      <div class="answer-row">
        <NumericInput bind:value={userInput} placeholder="" />
      </div>
    {/if}
  {:else}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <p class="prompt">
        <Math expression={parts[0]} />
        <span class="user-answer"><Math expression={userInput} /></span>
        <Math expression={parts[1] ?? ''} />
      </p>
    {:else}
      <p class="prompt">
        <Math expression={exercise.prompt} />
      </p>
    {/if}
    <Feedback {feedback} textAnswer={exercise.answer} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }
</style>
