<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import { tick } from 'svelte';
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

  let primes = $derived(((exercise as any).data?.primes as number[] | undefined) ?? []);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<number[]>([]);
  let factorisationEl = $state<HTMLDivElement>();

  $effect(() => {
    values = primes.map(() => 0);
  });

  $effect(() => {
    if (feedback === null) {
      const el = factorisationEl?.querySelector<HTMLInputElement>('.exp-input');
      el?.focus();
      tick().then(() => el?.select());
    }
  });

  function formatCorrectAnswer(): string {
    const parts = exercise.answer.split(',').map((e, i) => `${primes[i]}^{${e}}`);
    return parts.join(' \\cdot ');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(values.join(','));
      } else {
        onNext();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<p class="prompt">
  {_('exercise.primeFactorisation.prompt')}
  {exercise.prompt}
</p>

{#if feedback === null}
  <div class="factorisation" bind:this={factorisationEl}>
    <Math expression="=" />
    {#each primes as prime, i (prime)}
      {#if i > 0}
        <Math expression={'\\cdot'} />
      {/if}
      <span class="prime-term">
        {prime}<span class="exp-sym">^</span><input
          type="number"
          class="exp-input"
          bind:value={values[i]}
          min={0}
          max={9}
        />
      </span>
    {/each}
  </div>
  <div class="submit-row">
    <button onclick={() => onSubmit(values.join(','))}>{_('answer.submit')}</button>
  </div>
{:else}
  <div class="feedback-row">
    <p class="feedback {feedback}">
      {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', formatCorrectAnswer())}
    </p>
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .factorisation {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .factorisation .prime-term {
    display: inline-flex;
    align-items: center;
    gap: 1px;
  }

  .factorisation .exp-sym {
    font-size: 0.9rem;
  }

  .factorisation .exp-input {
    width: 4rem;
    text-align: center;
  }
</style>
