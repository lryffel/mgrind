<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import type { FactorsData } from '../../exercises/factors';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as FactorsData);
  let options = $derived(data.options ?? []);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let selected = $state<boolean[]>([]);
  let correctIndices = $derived(
    exercise.answer
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n)),
  );
  let containerEl: HTMLDivElement;
  let cols = $state(5);

  function updateBreakpoints(width: number) {
    const minBtnWidth = 72;
    cols = Math.max(1, Math.floor(width / minBtnWidth));
  }

  $effect(() => {
    selected = new Array(options.length).fill(false);
  });

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([entry]) => updateBreakpoints(entry.contentRect.width));
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  let effectiveCols = $derived(Math.min(cols, options.length));

  function isStartOfRow(i: number) {
    return effectiveCols <= 1 || i % effectiveCols === 0;
  }

  function isEndOfRow(i: number) {
    if (effectiveCols <= 1) return true;
    return i === options.length - 1 || i % effectiveCols === effectiveCols - 1;
  }

  function btnStyle(i: number) {
    const start = isStartOfRow(i);
    const end = isEndOfRow(i);
    const both = start && end;
    return {
      borderRadius: both ? '0.5rem' : start ? '0.5rem 0 0 0.5rem' : end ? '0 0.5rem 0.5rem 0' : '0',
      borderRight: end ? '1px solid var(--c-border)' : 'none',
    };
  }

  function toggleIndex(idx: number) {
    const next = [...selected];
    next[idx] = !next[idx];
    selected = next;
  }

  function handleSubmit() {
    const answer = selected
      .map((checked, i) => (checked ? i : -1))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b)
      .join(',');
    onSubmit(answer);
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_(data.promptKey)}</p>
  {#if exercise.prompt}
    <p class="prompt"><Math expression={exercise.prompt} display /></p>
  {/if}

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div bind:this={containerEl} class="factor-grid" role="group" tabindex="0">
    {#each options as option, i (i)}
      {#if feedback === null}
        <button
          class="factor-btn"
          class:selected={selected[i]}
          style={btnStyle(i)}
          onclick={() => toggleIndex(i)}
          role="checkbox"
          aria-checked={selected[i]}
        >
          <Math expression={option.latex} />
        </button>
      {:else}
        <span
          class="factor-btn feedback"
          class:correct-option={correctIndices.includes(i) && selected[i]}
          class:wrong-option={!correctIndices.includes(i) && selected[i]}
          style={btnStyle(i)}
        >
          <Math expression={option.latex} />
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback {feedback} textAnswer={correctIndices.map((i) => options[i].latex).join(', ')} />
  {/if}
</ExerciseShell>

<style>
  .factor-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0;
    width: 100%;
    margin-top: 0.75rem;
  }

  .factor-btn {
    flex: 1 0 auto;
    min-width: 4rem;
    padding: 0.6rem 0.5rem;
    border: 1px solid var(--c-border);
    border-right: none;
    background: transparent;
    color: var(--c-text);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1;
    text-align: center;
    transition: border-color 0.2s ease-in-out;
  }

  .factor-btn:hover {
    border-color: var(--c-primary);
    z-index: 1;
  }

  .factor-btn:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: -2px;
    z-index: 1;
  }

  .factor-btn.selected {
    border-color: var(--c-primary);
    color: var(--c-text);
    background: color-mix(in srgb, var(--c-primary) 15%, transparent);
    z-index: 1;
  }

  .factor-btn.feedback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .factor-btn.correct-option {
    color: var(--c-correct);
  }

  .factor-btn.wrong-option {
    color: var(--c-incorrect);
  }
</style>
