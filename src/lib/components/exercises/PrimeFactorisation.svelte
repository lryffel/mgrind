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
  let inputEls = $state<(HTMLInputElement | null)[]>([]);

  $effect(() => {
    values = primes.map(() => 0);
  });

  $effect(() => {
    if (feedback === null) {
      inputEls[0]?.focus();
    }
  });

  function formatCorrectAnswer(): string {
    const exponents = exercise.answer.split(',');
    const parts = exponents
      .map((e, i) => ({ prime: primes[i], exp: e }))
      .filter(({ exp }) => exp !== '0')
      .map(({ prime, exp }) => (exp === '1' ? `${prime}` : `${prime}^{${exp}}`));
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

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<article
  class="card"
  onclick={(e) => {
    if (feedback === null && !(e.target instanceof HTMLInputElement)) inputEls[0]?.focus();
  }}
>
  <p class="prompt-label">{_('exercise.primeFactorisation.prompt')}</p>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="factorisation" role="group">
      <Math expression="=" />
      {#each primes as prime, i (prime)}
        {#if i > 0}
          <Math expression={'\\cdot'} />
        {/if}
        <span class="prime-term">
          <Math expression={prime + '\\text{\\char`^}'} /><input
            type="number"
            class="exp-input"
            bind:value={values[i]}
            bind:this={inputEls[i]}
            min={0}
            max={9}
            placeholder="0"
          />
        </span>
      {/each}
    </div>
    <div class="submit-row">
      <button onclick={() => onSubmit(values.join(','))}>{_('answer.submit')}</button>
    </div>
  {:else if feedback === 'correct'}
    <p class="feedback correct">
      {_('feedback.correct.primeFactorisation')}<Math expression={formatCorrectAnswer()} />
    </p>
    <div class="submit-row">
      <button onclick={onNext}>{_('answer.next')}</button>
    </div>
  {:else}
    <p class="feedback incorrect">
      {_('feedback.incorrect.prefix')}<Math expression={formatCorrectAnswer()} />{_('feedback.incorrect.suffix')}
    </p>
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

  .prompt-label {
    margin-bottom: 0;
  }

  .factorisation {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .factorisation .prime-term {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .factorisation .exp-input {
    width: 3.5rem;
    text-align: center;
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
</style>
