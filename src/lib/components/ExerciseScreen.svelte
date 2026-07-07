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
  let session = $state(new ExerciseSession(disciplineId));
  let inputEl: HTMLInputElement | undefined = $state();
  let fractionNumEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (disciplineId !== session.disciplineId) {
      session = new ExerciseSession(disciplineId);
    }
  });

  $effect(() => {
    if (session.feedback === null) {
      if (session.exercise.display === 'fraction') {
        fractionNumEl?.focus();
      } else if (!session.exercise.fields) {
        inputEl?.focus();
      }
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
  {#if session.exercise.display === 'fraction'}
    {@const numDen = session.exercise.prompt.split('/')}
    {#if session.feedback === null}
      <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
      <p class="prompt fraction-prompt">
        <span class="fraction">
          <span class="num">{numDen[0]}</span>
          <span class="fraction-bar"></span>
          <span class="den">{numDen[1]}</span>
        </span>
        <span class="equals">=</span>
        <span class="fraction-answer-inline">
          <input
            type="number"
            class="fraction-num"
            bind:value={session.userValues[0]}
            min={1}
            bind:this={fractionNumEl}
          />
          <span class="fraction-bar"></span>
          <input type="number" class="fraction-den" bind:value={session.userValues[1]} min={1} />
        </span>
      </p>
      <div class="submit-row">
        <button onclick={() => session.submit()}>{_('answer.submit')}</button>
      </div>
    {:else}
      <div class="feedback-row">
        <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
        <p class="prompt fraction-prompt">
          <span class="fraction">
            <span class="num">{numDen[0]}</span>
            <span class="fraction-bar"></span>
            <span class="den">{numDen[1]}</span>
          </span>
          <span class="equals">=</span>
          <span class="fraction">
            <span class="num">{session.userValues[0]}</span>
            <span class="fraction-bar"></span>
            <span class="den">{session.userValues[1]}</span>
          </span>
        </p>
        <p class="feedback {session.feedback}">
          {session.feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', session.formatAnswer(session.exercise))}
        </p>
        <button onclick={() => session.next()}>{_('answer.next')}</button>
      </div>
    {/if}
  {:else}
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

  .fraction-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .fraction-prompt .equals {
    font-size: 1.5rem;
  }

  .prompt-label {
    font-size: 1.125rem;
    font-weight: 400;
    opacity: 0.8;
    text-align: center;
    margin: 0 0 0.25rem 0;
  }

  .fraction-answer-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .fraction-answer-inline input {
    width: 5rem;
    text-align: center;
  }

  .fraction-answer-inline .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
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

  .fraction {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
  }

  .fraction .num,
  .fraction .den {
    padding: 0 0.5rem;
  }

  .fraction .fraction-bar,
  .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
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
