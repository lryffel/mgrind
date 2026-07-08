<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import FractionInput from './FractionInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let numInput = $state('');
  let denInput = $state('');
  let numInputEl = $state<HTMLInputElement | null>(null);

  const opMatch = $derived(exercise.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} \\cdot \\frac\{(\d+)\}\{(\d+)\}$/));
  const num1 = $derived(Number(opMatch![1]));
  const den1 = $derived(Number(opMatch![2]));
  const num2 = $derived(Number(opMatch![3]));
  const den2 = $derived(Number(opMatch![4]));
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived(
    exercise.data?.promptKey ?? 'exercise.multiplicationFraction.prompt',
  );

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(`${numInput},${denInput}`);
      } else {
        onNext();
      }
    }
  }

  $effect(() => {
    if (feedback === null) {
      numInputEl?.focus();
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if feedback === null}
  <p class="prompt-label">{_(promptKey)}</p>
  <p class="prompt fraction-prompt">
    <Math expression={`\\frac{${num1}}{${den1}}`} />
    <Math expression={'\\cdot'} />
    <Math expression={`\\frac{${num2}}{${den2}}`} />
    <Math expression="=" />
    <FractionInput bind:num={numInput} bind:den={denInput} inputRef={(el) => (numInputEl = el)} />
  </p>
  <div class="submit-row">
    <button onclick={() => onSubmit(`${numInput},${denInput}`)}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">{_(promptKey)}</p>
  <p class="prompt fraction-prompt">
    <Math expression={`\\frac{${num1}}{${den1}}`} />
    <Math expression={'\\cdot'} />
    <Math expression={`\\frac{${num2}}{${den2}}`} />
    <Math expression="=" />
    <Math expression={numInput && denInput ? `\\frac{${numInput}}{${denInput}}` : '\\;'} />
  </p>
  <p class="feedback {feedback}">
    {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect.prefix')}<Math
      expression={`\\frac{${correctNumDen[0]}}{${correctNumDen[1]}}`}
    />{_('feedback.incorrect.suffix')}
  </p>
  <div class="submit-row">
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}
