<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import PrimeFactorInput from './PrimeFactorInput.svelte';
  import NumericInput from './NumericInput.svelte';
  import type { GcdLcmData } from '../../exercises/gcdLcm';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(exercise.data as GcdLcmData);
  let subType = $derived(data.subType ?? 'numbers');
  let primes = $derived((data.subType === 'factorization' ? data.primes : []) ?? []);

  let gcdValues = $state<string[]>([]);
  let lcmValues = $state<string[]>([]);
  let gcdInput = $state('');
  let lcmInput = $state('');

  $effect(() => {
    if (subType === 'factorization') {
      gcdValues = primes.map(() => '');
      lcmValues = primes.map(() => '');
    }
  });

  let validationError = $derived(
    subType === 'factorization'
      ? gcdValues.some((v) => v.includes(',')) || lcmValues.some((v) => v.includes(','))
        ? _('error.decimalComma')
        : null
      : gcdInput.includes(',') || lcmInput.includes(',')
        ? _('error.decimalComma')
        : null,
  );

  function submitAnswer() {
    if (subType === 'factorization') {
      const gcdStr = gcdValues.map((v) => Number(v) || 0).join(',');
      const lcmStr = lcmValues.map((v) => Number(v) || 0).join(',');
      onSubmit(`${gcdStr};${lcmStr}`);
    } else {
      onSubmit(`${gcdInput || '0'},${lcmInput || '0'}`);
    }
  }

  function handleGcdKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const arr = subType === 'factorization' ? gcdValues : [gcdInput];
      const v = Number(arr[i] ?? arr[0]) || 0;
      if (e.key === 'ArrowUp') {
        if (v < 9) {
          if (subType === 'factorization') gcdValues[i] = String(v + 1);
          else gcdInput = String(v + 1);
        }
      } else {
        if (v > 0) {
          if (subType === 'factorization') gcdValues[i] = v === 1 ? '' : String(v - 1);
          else gcdInput = v === 1 ? '' : String(v - 1);
        }
      }
    }
  }

  function handleLcmKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const arr = subType === 'factorization' ? lcmValues : [lcmInput];
      const v = Number(arr[i] ?? arr[0]) || 0;
      if (e.key === 'ArrowUp') {
        if (v < 9) {
          if (subType === 'factorization') lcmValues[i] = String(v + 1);
          else lcmInput = String(v + 1);
        }
      } else {
        if (v > 0) {
          if (subType === 'factorization') lcmValues[i] = v === 1 ? '' : String(v - 1);
          else lcmInput = v === 1 ? '' : String(v - 1);
        }
      }
    }
  }

  function formatExponentAnswer(expStr: string | undefined): string {
    if (!expStr || !primes.length) return '';
    const exponents = expStr.split(',').map(Number);
    const parts = primes
      .map((p, i) => ({ p, e: exponents[i] }))
      .filter(({ e }) => e > 0)
      .map(({ p, e }) => (e === 1 ? `${p}` : `${p}^{${e}}`));
    return parts.join(' \\cdot ');
  }

  let correctLatex = $derived(
    subType === 'factorization'
      ? `\\text{${_('exercise.gcdLcm.gcd')}} = ${formatExponentAnswer(data.gcdExponents)} \\quad \\text{${_('exercise.gcdLcm.lcm')}} = ${formatExponentAnswer(data.lcmExponents)}`
      : `\\text{${_('exercise.gcdLcm.gcd')}} = ${data.gcd}, \\text{${_('exercise.gcdLcm.lcm')}} = ${data.lcm}`,
  );

  function formatUserExponents(values: string[]): string {
    const parts = primes
      .map((p, i) => ({ p, e: values[i] }))
      .filter(({ e }) => e && e !== '0')
      .map(({ p, e }) => (e === '1' ? `${p}` : `${p}^{${e}}`));
    if (parts.length === 0) return '1';
    return parts.join(' \\cdot ');
  }

  let userGcdLatex = $derived(subType === 'factorization' ? formatUserExponents(gcdValues) : gcdInput || '0');

  let userLcmLatex = $derived(subType === 'factorization' ? formatUserExponents(lcmValues) : lcmInput || '0');
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.gcdLcm.prompt')}</p>
  {#if subType === 'factorization'}
    <div class="factorization-display">
      <Math expression={`a = ${data.aLatex ?? ''}`} display />
      <Math expression={`b = ${data.bLatex ?? ''}`} display />
    </div>
    {#if feedback === null}
      <div class="input-row">
        <span class="input-label"><Math expression={`\\text{${_('exercise.gcdLcm.gcd')}} =`} /></span>
        <PrimeFactorInput {primes} bind:values={gcdValues} onkeydown={handleGcdKeydown} />
      </div>
      <div class="input-row">
        <span class="input-label"><Math expression={`\\text{${_('exercise.gcdLcm.lcm')}} =`} /></span>
        <PrimeFactorInput {primes} bind:values={lcmValues} onkeydown={handleLcmKeydown} />
      </div>
    {:else}
      <div class="input-row">
        <span class="input-label"><Math expression={`\\text{${_('exercise.gcdLcm.gcd')}} =`} /></span>
        <span class="user-answer"><Math expression={userGcdLatex} /></span>
      </div>
      <div class="input-row">
        <span class="input-label"><Math expression={`\\text{${_('exercise.gcdLcm.lcm')}} =`} /></span>
        <span class="user-answer"><Math expression={userLcmLatex} /></span>
      </div>
      <Feedback {feedback} {correctLatex} />
    {/if}
  {:else}
    <div class="numbers-display">
      <Math expression={`a = ${data.a ?? ''}`} display />
      <Math expression={`b = ${data.b ?? ''}`} display />
    </div>
    {#if feedback === null}
      <div class="input-row">
        <span class="input-label">{_('exercise.gcdLcm.gcd')} =</span>
        <NumericInput bind:value={gcdInput} context="plain" onkeydown={(e: KeyboardEvent) => handleGcdKeydown(0, e)} />
      </div>
      <div class="input-row">
        <span class="input-label">{_('exercise.gcdLcm.lcm')} =</span>
        <NumericInput bind:value={lcmInput} context="plain" onkeydown={(e: KeyboardEvent) => handleLcmKeydown(0, e)} />
      </div>
    {:else}
      <div class="input-row">
        <span class="input-label">{_('exercise.gcdLcm.gcd')} =</span>
        <span class="user-answer"><Math expression={userGcdLatex} /></span>
      </div>
      <div class="input-row">
        <span class="input-label">{_('exercise.gcdLcm.lcm')} =</span>
        <span class="user-answer"><Math expression={userLcmLatex} /></span>
      </div>
      <Feedback {feedback} {correctLatex} />
    {/if}
  {/if}
</ExerciseShell>

<style>
  .factorization-display {
    margin-bottom: 0.5rem;
  }

  .numbers-display {
    margin-bottom: 0.5rem;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .input-label {
    white-space: nowrap;
  }
</style>
