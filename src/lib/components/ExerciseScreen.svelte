<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { disciplines } from '../data/disciplines';
  import { ExerciseSession } from '../exerciseSession.svelte';

  let { disciplineId, onBack }: { disciplineId: string; onBack: () => void } = $props();

  let discipline = $derived(disciplines.find((d: Discipline) => d.id === disciplineId)!);
  let disciplineProgress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let session = $derived(new ExerciseSession(disciplineId));
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (session.feedback === null && !session.exercise.fields) {
      inputEl?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (session.feedback === null) {
        session.submit();
      } else {
        session.next();
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
    <li><progress value={disciplineProgress} max={1}>{(disciplineProgress * 100).toFixed(0)}%</progress></li>
  </ul>
</nav>

<article>
  <p class="prompt">
    {#if session.exercise.fields}
      {_('exercise.primeFactorisation.prompt')} {session.exercise.prompt}
    {:else}
      {session.exercise.prompt}
    {/if}
  </p>

  {#if session.feedback === null}
    {#if session.exercise.fields}
      <div class="factorisation">
        <span>=</span>
        {#each session.exercise.fields as field, i (field.label)}
          {#if i > 0}
            <span class="times"> &times; </span>
          {/if}
          <span class="prime-term">
            {field.label}<span class="exp-sym">^</span><input
              type="number"
              class="exp-input"
              bind:value={session.userValues[i]}
              min={0}
              max={9}
            />
          </span>
        {/each}
      </div>
      <div class="submit-row">
        <button onclick={() => session.submit()}>{_('answer.submit')}</button>
      </div>
    {:else}
      <div role="group" class="answer-row">
        <input type="text" class="answer-input" bind:value={session.userAnswer} bind:this={inputEl} />
        <button onclick={() => session.submit()}>{_('answer.submit')}</button>
      </div>
    {/if}
  {:else}
    <div class="feedback-row">
      <p class="feedback {session.feedback}">
        {session.feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', session.formatAnswer(session.exercise))}
      </p>
      <button onclick={() => session.next()}>{_('answer.next')}</button>
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

  .factorisation {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .factorisation .times {
    font-size: 1rem;
    opacity: 0.6;
  }

  .factorisation .prime-term {
    display: inline-flex;
    align-items: center;
    gap: 1px;
  }

  .factorisation .exp-sym {
    font-size: 0.9rem;
  }

  .factorisation .exp-input {
    width: 4rem;
    text-align: center;
  }

  .feedback {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
  }

  .feedback.correct {
    color: var(--pico-ins-color);
  }

  .feedback.incorrect {
    color: var(--pico-del-color);
  }
</style>
