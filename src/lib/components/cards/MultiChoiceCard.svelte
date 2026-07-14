<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { MultiChoiceCardData } from './cardData';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as MultiChoiceCardData);
  let options = $derived(data.options ?? []);
  let promptKey = $derived(data.promptKey);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let selected = $state<boolean[]>([]);
  let correctIndices = $derived(
    exercise.answer
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n)),
  );

  $effect(() => {
    selected = new Array(options.length).fill(false);
  });

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
  {#if promptKey && data.promptMath}
    <p class="prompt-label">{_(promptKey)}<Math expression={data.promptMath} />{_(data.promptKeySuffix ?? '')}</p>
  {:else if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {:else}
    <p class="prompt">
      <Math expression={exercise.prompt} />
    </p>
  {/if}

  <div class="option-grid" role="group">
    {#each options as option, i (i)}
      {#if feedback === null}
        <button
          class="choice-checkbox"
          class:selected={selected[i]}
          onclick={() => toggleIndex(i)}
          role="checkbox"
          aria-checked={selected[i]}
        >
          {#if option.latex}
            <Math expression={option.latex} />
          {:else}
            {option.label ? _(option.label) : ''}
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
            {option.label ? _(option.label) : ''}
          {/if}
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback
      {feedback}
      textAnswer={correctIndices.map((i) => options[i]?.label ?? options[i]?.latex ?? '').join(', ')}
    />
  {/if}
</ExerciseShell>

<style>
  .option-grid {
    display: grid;
    gap: 0.5rem;
    margin-top: 0.75rem;
    width: fit-content;
  }

  .option-grid > :global(*) {
    border-radius: 0.5rem !important;
    margin-left: 0 !important;
  }

  .choice-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
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
    justify-content: flex-start;
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
