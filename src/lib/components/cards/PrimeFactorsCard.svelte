<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { PrimeFactorsCardData } from './cardData';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import PrimeFactorInput from '../PrimeFactorInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as PrimeFactorsCardData);
  let primes = $derived(data.primes ?? []);
  let promptKey = $derived(data.promptKey);
  // eslint-disable-next-line svelte/prefer-writable-derived
  let values = $state<string[]>([]);

  let validationError = $derived(values.some((v) => v.includes(',')) ? _('error.decimalComma') : null);

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

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => onSubmit(values.map((v) => Number(v) || 0).join(','))}
  {onNext}
  {validationError}
>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        <PrimeFactorInput {primes} bind:values onkeydown={handleKeydown} />
      </span>
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
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
      </span>
    </div>
    <Feedback {feedback} {correctLatex} />
  {/if}
</ExerciseShell>
