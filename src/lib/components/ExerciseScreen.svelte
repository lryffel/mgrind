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

<nav>
  <ul>
    <li><button class="outline" onclick={onBack}>{_('back')}</button></li>
  </ul>
  <ul>
    <li><ProgressBar value={disciplineProgress} /></li>
  </ul>
</nav>

<article>
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
      <div class="submit-row">
        <button onclick={submit}>{_('answer.submit')}</button>
      </div>
    {:else}
      <div role="group" class="answer-row">
        <input type="text" class="answer-input" bind:value={userAnswer} bind:this={inputEl} />
        <button onclick={submit}>{_('answer.submit')}</button>
      </div>
    {/if}
  {:else}
    <div class="feedback-row">
      <p class="feedback {feedback}">
        {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', formatAnswer(exercise))}
      </p>
      <button onclick={next}>{_('answer.next')}</button>
    </div>
  {/if}
</article>

<style>
  .prompt {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }

  .feedback-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .submit-row {
    display: flex;
    justify-content: center;
  }

  .answer-input {
    width: 150px;
    text-align: center;
  }
</style>
