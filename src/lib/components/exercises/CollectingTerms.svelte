<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';
  import Math from '../Math.svelte';
  import { formatCollectingAnswer } from '../../exercises/collectingTerms';

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

  let fields = $derived((exercise.data?.fields as { variablePart: string }[]) ?? []);
  let variableParts = $derived(fields.map((f) => f.variablePart));
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);
  let inputEls = $state<(HTMLInputElement | null)[]>([]);

  $effect(() => {
    values = fields.map(() => '');
  });

  $effect(() => {
    if (feedback === null) {
      inputEls[0]?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(values.join(','));
      } else {
        onNext();
      }
    }
  }

  let userLatex = $derived(formatCollectingAnswer(values, variableParts));
  let correctLatex = $derived(formatCollectingAnswer(exercise.answer.split(','), variableParts));
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<article
  class="card"
  onclick={(e) => {
    if (feedback === null && !(e.target instanceof HTMLInputElement)) inputEls[0]?.focus();
  }}
>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="expansion" role="group">
      <span class="equals">=</span>
      {#each fields as { variablePart }, i (i)}
        <span class="term">
          {#if i > 0}
            <span class="plus">+</span>
          {/if}
          <input type="text" class="coeff-input" bind:value={values[i]} bind:this={inputEls[i]} placeholder="?" />
          {#if variablePart}
            <Math expression={variablePart} />
          {/if}
        </span>
      {/each}
    </div>
    <div class="submit-row">
      <button onclick={() => onSubmit(values.join(','))}>{_('answer.submit')}</button>
    </div>
  {:else}
    <div class="expansion">
      <span class="equals">=</span>
      <Math expression={userLatex} />
    </div>
    {#if feedback === 'correct'}
      <p class="feedback correct">{_('feedback.correct')}</p>
    {:else}
      <p class="feedback incorrect">
        {_('feedback.incorrect.prefix')}<Math expression={correctLatex} />{_('feedback.incorrect.suffix')}
      </p>
    {/if}
    <div class="submit-row">
      <button onclick={onNext}>{_('answer.next')}</button>
    </div>
  {/if}
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }

  .prompt {
    font-size: 1.25rem;
    margin: 0;
  }

  .expansion {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .equals {
    margin-right: 0.2rem;
  }

  .plus {
    color: var(--pico-muted-color, #888);
  }

  .coeff-input {
    width: 5rem;
    text-align: center;
  }

  .term {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .expansion :global(.Math) {
    white-space: nowrap;
  }

  .submit-row {
    margin-top: 0.5rem;
  }

  .feedback {
    margin: 0;
    font-weight: 600;
  }

  .feedback.correct {
    color: var(--pico-ins-color, green);
  }

  .feedback.incorrect {
    color: var(--pico-del-color, red);
  }

  .feedback.incorrect :global(.Math) {
    display: inline;
  }
</style>
