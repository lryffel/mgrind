<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';
  import Math from '../Math.svelte';
  import FractionInput from './FractionInput.svelte';

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

  let numInput = $state('');
  let denInput = $state('');
  let numInputEl = $state<HTMLInputElement | null>(null);

  const opMatch = $derived(exercise.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} ([+\-]) \\frac\{(\d+)\}\{(\d+)\}$/));
  const num1 = $derived(Number(opMatch![1]));
  const den1 = $derived(Number(opMatch![2]));
  const op = $derived(opMatch![3]);
  const num2 = $derived(Number(opMatch![4]));
  const den2 = $derived(Number(opMatch![5]));
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived((exercise.data?.promptKey as string | undefined) ?? 'exercise.additionFraction.prompt');

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
    <span class="op">{op}</span>
    <Math expression={`\\frac{${num2}}{${den2}}`} />
    <span class="equals">=</span>
    <FractionInput bind:num={numInput} bind:den={denInput} inputRef={(el) => (numInputEl = el)} />
  </p>
  <div class="submit-row">
    <button onclick={() => onSubmit(`${numInput},${denInput}`)}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">{_(promptKey)}</p>
  <p class="prompt fraction-prompt">
    <Math expression={`\\frac{${num1}}{${den1}}`} />
    <span class="op">{op}</span>
    <Math expression={`\\frac{${num2}}{${den2}}`} />
    <span class="equals">=</span>
    <Math expression={numInput && denInput ? `\\frac{${numInput}}{${denInput}}` : '\\;'} />
  </p>
  <p class="feedback {feedback}">
    {feedback === 'correct'
      ? _('feedback.correct')
      : _('feedback.incorrect', `${correctNumDen[0]}/${correctNumDen[1]}`)}
  </p>
  <div class="submit-row">
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}
