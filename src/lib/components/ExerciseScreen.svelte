<script lang="ts">
  import type { ExerciseType } from '../types';
  import { _ } from '../i18n.svelte';
  import { getComplexity, updateProgress } from '../progress.svelte';

  let { exerciseType, onBack }: { exerciseType: ExerciseType; onBack: () => void } = $props();

  let currentSeed = Date.now();
  let userAnswer = $state('');
  let feedback = $state<'correct' | 'incorrect' | null>(null);
  let inputEl: HTMLInputElement | undefined = $state();
  let exercise = $state(initExercise());

  function initExercise() {
    return exerciseType.generate(currentSeed, getComplexity(exerciseType.id));
  }

  $effect(() => {
    if (feedback === null) {
      inputEl?.focus();
    }
  });

  function submit() {
    const correct = exerciseType.validate(userAnswer, exercise);
    updateProgress(exerciseType.id, correct, exerciseType.maxComplexity);
    feedback = correct ? 'correct' : 'incorrect';
  }

  function next() {
    currentSeed = Date.now();
    exercise = exerciseType.generate(currentSeed, getComplexity(exerciseType.id));
    userAnswer = '';
    feedback = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        submit();
      } else {
        next();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="exercise-screen">
  <button class="back-btn" onclick={onBack}>{_('back')}</button>

  <div class="exercise-card">
    <p class="prompt">{exercise.prompt}</p>

    {#if feedback === null}
      <input
        type="text"
        class="answer-input"
        bind:value={userAnswer}
        bind:this={inputEl}
      />
      <button class="action-btn" onclick={submit}>{_('answer.submit')}</button>
    {:else}
      <p class="feedback {feedback}">
        {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', exercise.answer)}
      </p>
      <button class="action-btn" onclick={next}>{_('answer.next')}</button>
    {/if}
  </div>
</div>

<style>
  .exercise-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .back-btn {
    align-self: flex-start;
    padding: 6px 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }
  .back-btn:hover {
    background: #f0f0f0;
  }
  .exercise-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    min-width: 300px;
  }
  .prompt {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
  }
  .answer-input {
    font-size: 24px;
    padding: 8px 16px;
    width: 150px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .answer-input:focus {
    outline: 2px solid #4caf50;
    border-color: transparent;
  }
  .action-btn {
    padding: 10px 28px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    background: #4caf50;
    color: #fff;
    cursor: pointer;
  }
  .action-btn:hover {
    background: #43a047;
  }
  .feedback {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
  }
  .feedback.correct {
    color: #4caf50;
  }
  .feedback.incorrect {
    color: #e53935;
  }
</style>
