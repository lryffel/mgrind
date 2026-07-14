<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import { state as langState } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(
    exercise.data as {
      promptKey?: string;
      options: { label?: string; latex?: string; text?: string; textDe?: string }[];
    },
  );
  let options = $derived(data.options ?? []);
  let promptKey = $derived(data.promptKey);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let selectedIndex = $state(-1);
  let correctIndices = $derived(exercise.answer.split(',').map(Number));

  $effect(() => {
    selectedIndex = -1;
  });

  let canSubmit = $derived(selectedIndex >= 0);

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(String(selectedIndex));
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  {#if exercise.prompt}
    <p class="prompt"><Math expression={exercise.prompt} /></p>
  {/if}

  <div class="option-grid" role="radiogroup" aria-label={exercise.prompt || (promptKey ?? '')}>
    {#each options as option, i (i)}
      {#if feedback === null}
        <button
          class="choice-radio"
          class:selected={selectedIndex === i}
          onclick={() => (selectedIndex = i)}
          role="radio"
          aria-checked={selectedIndex === i}
        >
          {#if option.text}
            {langState.lang === 'de' && option.textDe ? option.textDe : option.text}
          {:else if option.latex}
            <Math expression={option.latex} />
          {:else}
            {option.label ? _(option.label) : ''}
          {/if}
        </button>
      {:else}
        <span
          class="option-feedback-row"
          class:correct-option={correctIndices.includes(i) && selectedIndex === i}
          class:wrong-option={!correctIndices.includes(i) && selectedIndex === i}
        >
          {#if option.text}
            {langState.lang === 'de' && option.textDe ? option.textDe : option.text}
          {:else if option.latex}
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
      textAnswer={correctIndices
        .map((i) => {
          const opt = options[i];
          if (opt?.text) return langState.lang === 'de' && opt.textDe ? opt.textDe : opt.text;
          if (opt?.label) return _(opt.label);
          return opt?.latex ?? '';
        })
        .join(', ')}
    />
  {/if}
</ExerciseShell>

<style>
  .option-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    align-items: flex-start;
  }

  .choice-radio {
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

  .choice-radio:hover {
    border-color: var(--c-primary);
  }

  .choice-radio.selected {
    border-color: var(--c-primary);
    color: var(--c-text);
  }

  .choice-radio:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .choice-radio::before {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid var(--c-border);
    flex-shrink: 0;
    font-size: 0.65rem;
    line-height: 1;
    transition: border-color 0.2s ease-in-out;
    color: var(--c-primary-inverse);
  }

  .choice-radio:hover::before {
    border-color: var(--c-primary);
  }

  .choice-radio.selected::before {
    content: '\25CF';
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
