<script lang="ts">
  import type { Snippet } from 'svelte';
  import { _ } from '../i18n.svelte';
  import type { Exercise, ExerciseFeedback } from '../types';
  import Modal from './Modal.svelte';
  import { instructionContext } from '../instructionContext.svelte';

  let {
    exercise,
    feedback,
    submitAnswer,
    onNext,
    validationError = null,
    children,
    submitExtra,
  }: {
    exercise: Exercise;
    feedback: ExerciseFeedback;
    submitAnswer: () => void;
    onNext: () => void;
    validationError?: string | null;
    children: Snippet;
    submitExtra?: Snippet;
  } = $props();

  let el = $state<HTMLElement | null>(null);
  let showHelp = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null && !validationError) submitAnswer();
      else onNext();
    }
  }

  $effect(() => {
    if (feedback === null) {
      (el?.querySelector('input, select') as HTMLElement | null)?.focus();
    }
  });

  function onClick(e: MouseEvent | KeyboardEvent) {
    const t = e.target as HTMLElement;
    if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLSelectElement) && !(t instanceof HTMLButtonElement)) {
      (el?.querySelector('input, select') as HTMLElement | null)?.focus();
    }
  }

  function onArticleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(e);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
  class="exercise-card"
  class:correct={feedback === 'correct'}
  class:incorrect={feedback === 'incorrect'}
  bind:this={el}
  onclick={onClick}
  onkeydown={onArticleKeydown}
>
  <div class="exercise-content">
    <div class="exercise-prompt">
      {@render children()}
    </div>
    {#if instructionContext.currentInstructionComponent}
      <button class="help-button" onclick={() => (showHelp = true)} aria-label={_('help')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </button>
    {/if}
  </div>
  <hr />
  {#if validationError}
    <p class="validation-error" role="alert">{validationError}</p>
  {/if}
  <div class="submit-row">
    {#if submitExtra}
      {@render submitExtra()}
    {/if}
    {#if feedback === null}
      <button onclick={submitAnswer} disabled={!!validationError}>{_('answer.submit')}</button>
    {:else}
      <button onclick={onNext}>{_('answer.next')}</button>
    {/if}
  </div>
</article>

<Modal show={showHelp} onclose={() => (showHelp = false)}>
  {#if instructionContext.currentInstructionComponent}
    {@const Comp = instructionContext.currentInstructionComponent}
    <Comp />
  {/if}
</Modal>
