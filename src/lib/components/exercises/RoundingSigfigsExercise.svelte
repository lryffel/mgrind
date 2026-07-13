<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import type { RoundingSigfigsData } from '../../exercises/roundingSigfigs';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as RoundingSigfigsData);
  let userInput = $state('');

  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  let correctLatex = $derived(exercise.answer);
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} {validationError}>
  {#if feedback === null}
    <p class="prompt">
      {_('exercise.roundingSigfigs.promptBefore')}
      <Math expression={exercise.prompt} />
      {_('exercise.roundingSigfigs.promptBetween')}
      {data.sigfigsCount}
      {_('exercise.roundingSigfigs.promptAfter')}
    </p>
    <div class="answer-row">
      <NumericInput bind:value={userInput} />
    </div>
  {:else}
    <p class="prompt">
      {_('exercise.roundingSigfigs.promptBefore')}
      <Math expression={exercise.prompt} />
      {_('exercise.roundingSigfigs.promptBetween')}
      {data.sigfigsCount}
      {_('exercise.roundingSigfigs.promptAfter')}
    </p>
    <Feedback {feedback} {correctLatex} textAnswer={exercise.answer} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }
</style>
