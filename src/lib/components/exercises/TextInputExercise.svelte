<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';

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

  let userInput = $state('');

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(userInput.trim());
      } else {
        onNext();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<p class="prompt">{exercise.prompt}</p>

{#if feedback === null}
  <div role="group" class="answer-row">
    <input type="text" class="answer-input" bind:value={userInput} />
    <button onclick={() => onSubmit(userInput.trim())}>{_('answer.submit')}</button>
  </div>
{:else}
  <div class="feedback-row">
    <p class="feedback {feedback}">
      {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', exercise.answer)}
    </p>
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

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

  .answer-input {
    width: 150px;
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
