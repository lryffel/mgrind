<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} card={false}>
  {#if feedback === null}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <p class="prompt">
        <Math expression={parts[0]} />
        <input type="text" class="inline-input" bind:value={userInput} />
        <Math expression={parts[1] ?? ''} />
      </p>
    {:else}
      <p class="prompt">
        <Math expression={exercise.prompt} />
      </p>
      <div role="group" class="answer-row">
        <input type="text" class="answer-input" bind:value={userInput} />
      </div>
    {/if}
  {:else}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <p class="prompt">
        <Math expression={parts[0]} />
        {userInput}
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
  .inline-input {
    width: 5rem;
    text-align: center;
  }
</style>
