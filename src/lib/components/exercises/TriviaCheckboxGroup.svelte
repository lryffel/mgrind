<script lang="ts">
  import Math from '../Math.svelte';
  import type { ExerciseFeedback } from '../../types';

  let {
    options,
    selected,
    correctIndices,
    feedback,
    ontoggle,
  }: {
    options: { label?: string; latex?: string }[];
    selected: boolean[];
    correctIndices: number[];
    feedback: ExerciseFeedback | null;
    ontoggle: (index: number) => void;
  } = $props();
</script>

<div class="option-grid" role="group">
  {#each options as option, i (i)}
    {#if feedback === null}
      <button
        class="choice-checkbox"
        class:selected={selected[i]}
        onclick={() => ontoggle(i)}
        role="checkbox"
        aria-checked={selected[i]}
      >
        {#if option.latex}
          <Math expression={option.latex} />
        {:else}
          {option.label}
        {/if}
      </button>
    {:else}
      <span
        class="option-feedback-row"
        class:correct-option={correctIndices.includes(i) && selected[i]}
        class:wrong-option={!correctIndices.includes(i) && selected[i]}
      >
        {#if option.latex}
          <Math expression={option.latex} />
        {:else}
          {option.label}
        {/if}
      </span>
    {/if}
  {/each}
</div>

<style>
  .option-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    align-items: flex-start;
  }

  .choice-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.125rem;
    border-radius: 0.5rem;
    border: 1px solid var(--c-border);
    background: transparent;
    color: var(--c-text);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1;
    transition: border-color 0.2s ease-in-out;
  }

  .choice-checkbox:hover {
    border-color: var(--c-primary);
  }

  .choice-checkbox.selected {
    border-color: var(--c-primary);
    color: var(--c-text);
  }

  .choice-checkbox:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .choice-checkbox::before {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--c-border);
    border-radius: 0.25rem;
    flex-shrink: 0;
    font-size: 0.85rem;
    line-height: 1;
    font-weight: 700;
    transition: border-color 0.2s ease-in-out;
    color: var(--c-primary-inverse);
  }

  .choice-checkbox:hover::before {
    border-color: var(--c-primary);
  }

  .choice-checkbox.selected::before {
    content: '\2713';
    border-color: var(--c-primary);
    background: var(--c-primary);
  }

  .option-feedback-row {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 600;
  }

  .option-feedback-row.correct-option {
    color: var(--c-correct);
  }

  .option-feedback-row.wrong-option {
    color: var(--c-incorrect);
  }
</style>
