<script lang="ts">
  import { _ } from '../i18n.svelte';
  import type { Snippet } from 'svelte';
  import type { Exercise, ExerciseFeedback } from '../types';

  let {
    exercise,
    feedback,
    submitAnswer,
    onNext,
    card = true,
    children,
  }: {
    exercise: Exercise;
    feedback: ExerciseFeedback;
    submitAnswer: () => void;
    onNext: () => void;
    card?: boolean;
    children: Snippet;
  } = $props();

  let el = $state<HTMLElement | null>(null);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) submitAnswer();
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
{#if card}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <article class="exercise-card" bind:this={el} onclick={onClick} onkeydown={onArticleKeydown}>
    {@render children()}
    <div class="submit-row">
      {#if feedback === null}
        <button onclick={submitAnswer}>{_('answer.submit')}</button>
      {:else}
        <button onclick={onNext}>{_('answer.next')}</button>
      {/if}
    </div>
  </article>
{:else}
  <div class="exercise-card" bind:this={el}>
    {@render children()}
    <div class="submit-row">
      {#if feedback === null}
        <button onclick={submitAnswer}>{_('answer.submit')}</button>
      {:else}
        <button onclick={onNext}>{_('answer.next')}</button>
      {/if}
    </div>
  </div>
{/if}
