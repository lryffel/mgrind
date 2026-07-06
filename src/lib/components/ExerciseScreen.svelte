<script lang="ts">
  import type { ExerciseType, Discipline, Exercise } from '../types';
  import { _ } from '../i18n.svelte';
  import { getComplexity, getDisciplineProgress, updateProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { disciplines } from '../data/disciplines';
  import { pickExerciseTypeId } from '../exerciseSelection';
  import ProgressBar from './ProgressBar.svelte';

  let { disciplineId, onBack }: { disciplineId: string; onBack: () => void } = $props();

  let discipline = $derived(disciplines.find((d: Discipline) => d.id === disciplineId)!);
  let disciplineProgress = $derived(getDisciplineProgress(discipline, exerciseTypes));

  function pickType(): ExerciseType {
    return exerciseTypes[pickExerciseTypeId(disciplineId)];
  }

  let currentType = $state(pickType());
  let currentSeed = Date.now();
  let userAnswer = $state('');
  let userValues = $state<number[]>([]);
  let feedback = $state<'correct' | 'incorrect' | null>(null);
  let inputEl: HTMLInputElement | undefined = $state();
  let exercise = $state(initExercise());

  function initExercise() {
    const ex = currentType.generate(currentSeed, getComplexity(currentType.id));
    if (ex.fields) userValues = ex.fields.map(() => 0);
    return ex;
  }

  $effect(() => {
    if (feedback === null && !exercise.fields) {
      inputEl?.focus();
    }
  });

  function submit() {
    const answer = exercise.fields ? userValues.join(',') : userAnswer;
    const correct = currentType.validate(answer, exercise);
    updateProgress(currentType.id, correct, currentType.maxComplexity);
    feedback = correct ? 'correct' : 'incorrect';
  }

  function formatAnswer(ex: Exercise): string {
    if (ex.fields) {
      const parts = ex.answer.split(',').map((e, i) => `${ex.fields![i].label}^${e}`);
      return parts.join(' × ');
    }
    return ex.answer;
  }

  function next() {
    currentType = pickType();
    currentSeed = Date.now();
    exercise = currentType.generate(currentSeed, getComplexity(currentType.id));
    if (exercise.fields) {
      userValues = exercise.fields.map(() => 0);
    } else {
      userValues = [];
    }
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
  <div class="top-bar">
    <button class="back-btn" onclick={onBack}>{_('back')}</button>
    <ProgressBar value={disciplineProgress} />
  </div>

  <div class="exercise-card">
    <p class="prompt">
      {#if exercise.fields}
        {_('exercise.primeFactorisation.prompt')} {exercise.prompt}
      {:else}
        {exercise.prompt}
      {/if}
    </p>

    {#if feedback === null}
      {#if exercise.fields}
        <div class="factorisation">
          <span class="eq-left">=</span>
          {#each exercise.fields as field, i (field.label)}
            {#if i > 0}
              <span class="times"> × </span>
            {/if}
            <span class="prime-term">
              {field.label}<span class="exp-sym">^</span><input
                type="number"
                class="exp-input"
                bind:value={userValues[i]}
                min={0}
                max={9}
              />
            </span>
          {/each}
        </div>
      {:else}
        <input type="text" class="answer-input" bind:value={userAnswer} bind:this={inputEl} />
      {/if}
      <button class="action-btn" onclick={submit}>{_('answer.submit')}</button>
    {:else}
      <p class="feedback {feedback}">
        {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', formatAnswer(exercise))}
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
  .top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    align-self: stretch;
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
  .factorisation {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .eq-left {
    font-size: 24px;
  }
  .times {
    font-size: 20px;
    color: #666;
  }
  .prime-term {
    display: inline-flex;
    align-items: baseline;
    gap: 1px;
  }
  .exp-sym {
    font-size: 18px;
  }
  .exp-input {
    width: 40px;
    text-align: center;
    font-size: 20px;
    padding: 4px 2px;
    border: 2px solid #4caf50;
    border-radius: 4px;
  }
  .exp-input:focus {
    outline: 2px solid #2196f3;
    border-color: transparent;
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
