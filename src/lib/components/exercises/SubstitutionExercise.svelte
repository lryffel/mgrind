<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';
  import Math from '../Math.svelte';

  let {
    exercise,
    onSubmit,
    onNext,
    feedback,
  }: {
    exercise: Exercise;
    onSubmit: (answer: string) => void;
    onNext: () => void;
    feedback: 'correct' | 'incorrect' | null;
  } = $props();

  let input = $state('');
  let numInput = $state('');
  let denInput = $state('');
  let firstInput = $state<HTMLInputElement | null>(null);

  const variable = $derived(exercise.data?.variable as string | undefined ?? 'x');
  const value = $derived(exercise.data?.value as string | undefined ?? '');
  const term = $derived(exercise.data?.term as string | undefined ?? exercise.prompt);
  const complexity = $derived(exercise.data?.complexity as number | undefined ?? 0);
  const answerIsFraction = $derived(exercise.answer.includes('/'));

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        submitAnswer();
      } else {
        onNext();
      }
    }
  }

  function submitAnswer() {
    const answer = answerIsFraction
      ? `${numInput.trim()}/${denInput.trim()}`
      : input.trim();
    onSubmit(answer);
  }

  $effect(() => {
    if (feedback === null) {
      firstInput?.focus();
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if feedback === null}
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore')}<Math expression={`${variable} = ${value}`} />{_('exercise.substitution.promptAfter')}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  <p class="prompt fraction-prompt">
    <Math expression={term} />
    <span class="equals"> = </span>
    {#if answerIsFraction}
      <span class="fraction-answer-inline">
        <input type="text" bind:value={numInput} bind:this={firstInput} />
        <span class="fraction-bar"></span>
        <input type="text" bind:value={denInput} />
      </span>
    {:else}
      <input type="text" bind:value={input} bind:this={firstInput} class="user-answer-input" />
    {/if}
  </p>
  <div class="submit-row">
    <button onclick={submitAnswer}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore')}<Math expression={`${variable} = ${value}`} />{_('exercise.substitution.promptAfter')}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  <p class="prompt fraction-prompt">
    <Math expression={term} />
    <span class="equals"> = </span>
    {#if answerIsFraction}
      <Math expression={`\\frac{${numInput || '0'}}{${denInput || '1'}}`} />
    {:else}
      <span class="user-answer">{input || '\u00A0'}</span>
    {/if}
  </p>
  <div class="feedback-row">
    <p class="feedback {feedback}">
      {feedback === 'correct'
        ? _('feedback.correct')
        : _('feedback.incorrect', exercise.answer)}
    </p>
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .prompt-label {
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.85rem;
    color: var(--pico-muted-color, #777);
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .equals {
    font-size: 1.5rem;
  }

  .user-answer {
    font-size: 1.5rem;
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

  .user-answer-input {
    width: 6rem;
    text-align: center;
    font-size: 1.5rem;
  }
</style>
