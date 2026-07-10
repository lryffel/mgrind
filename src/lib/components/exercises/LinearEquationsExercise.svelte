<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');

  const variable = $derived(exercise.data?.variable ?? 'x');
  const correctLatex = $derived(`${variable} = ${exercise.answer}`);
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext}  >
  {#if feedback === null}
    <p class="prompt-label">
      {_('exercise.linearEquations.promptBefore')}<Math expression={variable} />{_(
        'exercise.linearEquations.promptAfter',
      )}
    </p>
    <p class="prompt">
      <Math expression={exercise.prompt} />
    </p>
    <p class="answer-row">
      <Math expression={`${variable} = `} />
      <NumericInput bind:value={userInput} placeholder="" />
    </p>
  {:else}
    <p class="prompt-label">
      {_('exercise.linearEquations.promptBefore')}<Math expression={variable} />{_(
        'exercise.linearEquations.promptAfter',
      )}
    </p>
    <p class="prompt">
      <Math expression={exercise.prompt} />
    </p>
    <p class="answer-row">
      <Math expression={`${variable} = `} />
      <span class="user-answer"><Math expression={userInput} /></span>
    </p>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }
</style>
