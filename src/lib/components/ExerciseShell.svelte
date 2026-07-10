<script lang="ts">
  import type { Snippet, Component } from 'svelte';
  import { _ } from '../i18n.svelte';
  import type { Exercise, ExerciseFeedback } from '../types';
  import Modal from './Modal.svelte';
  import { instructionContext } from '../instructionContext.svelte';

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
  let showHelp = $state(false);

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
    {#if instructionContext.currentInstructionComponent}
      <button class="help-button" onclick={() => (showHelp = true)} aria-label={_('help')}>?</button>
    {/if}
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
    {#if instructionContext.currentInstructionComponent}
      <button class="help-button" onclick={() => (showHelp = true)} aria-label={_('help')}>?</button>
    {/if}
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

<Modal show={showHelp} onclose={() => (showHelp = false)}>
  {#if instructionContext.currentInstructionComponent}
    {@const Comp = instructionContext.currentInstructionComponent}
    <Comp />
  {/if}
</Modal>

<style>
  .help-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border-radius: 50%;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--c-bg-card);
    border: 1px solid var(--c-border);
    color: var(--c-text-muted);
    cursor: pointer;
  }
</style>
