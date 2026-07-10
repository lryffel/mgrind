<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let primes = $derived(exercise.data?.primes ?? []);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  $effect(() => {
    values = primes.map(() => '');
  });

  function formatCorrectAnswer(): string {
    const exponents = exercise.answer.split(',');
    const parts = exponents
      .map((e, i) => ({ prime: primes[i], exp: e }))
      .filter(({ exp }) => exp !== '0')
      .map(({ prime, exp }) => (exp === '1' ? `${prime}` : `${prime}^{${exp}}`));
    return parts.join(' \\cdot ');
  }

  let correctLatex = $derived(formatCorrectAnswer());

  let displayed = $derived(
    primes.map((prime, i) => ({ prime, exp: values[i] })).filter(({ exp }) => exp && exp !== '0'),
  );

  function handleKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let v = Number(values[i]) || 0;
      if (e.key === 'ArrowUp') {
        if (v < 9) values[i] = String(v + 1);
      } else {
        if (v > 0) values[i] = v === 1 ? '' : String(v - 1);
      }
    }
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(values.map((v) => Number(v) || 0).join(','))} {onNext}>
  <p class="prompt-label">{_('exercise.primeFactorisation.prompt')}</p>
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>

  {#if feedback === null}
    <div class="factorisation" role="group">
      <Math expression="=" />
      {#each primes as prime, i (prime)}
        {#if i > 0}
          <Math expression="\cdot" />
        {/if}
        <span class="prime-term">
          <Math expression={prime + '\\text{\\char`^}'} /><input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="exp-input"
            bind:value={values[i]}
            placeholder="0"
            onkeydown={(e) => handleKeydown(i, e)}
          />
        </span>
      {/each}
    </div>
  {:else}
    <div class="factorisation" role="group">
      <Math expression="=" />
      {#if displayed.length === 0}
        <span class="user-answer"><Math expression="1" /></span>
      {:else}
        {#each displayed as { prime, exp }, i (prime)}
          {#if i > 0}
            <Math expression="\cdot" />
          {/if}
          <span class="user-answer">
            {#if exp === '1'}
              <Math expression={`${prime}`} />
            {:else}
              <Math expression={`${prime}^{${exp}}`} />
            {/if}
          </span>
        {/each}
      {/if}
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
  .factorisation {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.25rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .factorisation .prime-term {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .factorisation .exp-input {
    width: 4rem;
    text-align: center;
  }
</style>
