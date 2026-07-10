<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let primes = $derived(exercise.data?.primes ?? []);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<number[]>([]);

  $effect(() => {
    values = primes.map(() => 0);
  });

  function formatCorrectAnswer(): string {
    const exponents = exercise.answer.split(',');
    const parts = exponents
      .map((e, i) => ({ prime: primes[i], exp: e }))
      .filter(({ exp }) => exp !== '0')
      .map(({ prime, exp }) => (exp === '1' ? `${prime}` : `${prime}^{${exp}}`));
    return parts.join(' \\cdot ');
  }

  let correctMessage = $derived(`${_('feedback.correct.primeFactorisation')}`);
  let correctLatex = $derived(formatCorrectAnswer());
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(values.join(','))} {onNext}>
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
            type="number"
            class="exp-input"
            bind:value={values[i]}
            min={0}
            max={9}
            placeholder="0"
          />
        </span>
      {/each}
    </div>
  {:else}
    <Feedback {feedback} {correctMessage} {correctLatex} />
  {/if}
</ExerciseShell>

<style>
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
    width: 4rem;
    text-align: center;
  }
</style>
