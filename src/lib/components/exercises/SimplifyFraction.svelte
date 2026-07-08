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

  let correctNumDen = $derived(exercise.answer.split(','));

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
  <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
  <p class="prompt fraction-prompt">
    <Math expression={exercise.prompt} />
    <span class="equals">=</span>
    <FractionInput bind:num={numInput} bind:den={denInput} inputRef={(el) => (numInputEl = el)} />
  </p>
  <div class="submit-row">
    <button onclick={() => onSubmit(`${numInput},${denInput}`)}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">{_('exercise.simplifyFraction.prompt')}</p>
  <p class="prompt fraction-prompt">
    <Math expression={exercise.prompt} />
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
