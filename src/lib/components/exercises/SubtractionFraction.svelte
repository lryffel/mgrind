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

  const opMatch = $derived(exercise.prompt.match(/^\\frac\{(\d+)\}\{(\d+)\} - \\frac\{(\d+)\}\{(\d+)\}$/));
  const num1 = $derived(Number(opMatch![1]));
  const den1 = $derived(Number(opMatch![2]));
  const num2 = $derived(Number(opMatch![3]));
  const den2 = $derived(Number(opMatch![4]));
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived((exercise.data?.promptKey as string | undefined) ?? 'exercise.subtractionFraction.prompt');

  const numVal = $derived(Number(numInput));
  const denVal = $derived(Number(denInput));

  const hasNegativeDenominator = $derived(feedback === 'correct' && (denVal < 0 || (numVal < 0 && denVal < 0)));
  const normalizedWarningLatex = $derived(
    hasNegativeDenominator ? `\\frac{${denVal < 0 ? -numVal : numVal}}{${denVal < 0 ? -denVal : denVal}}` : '',
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
    <Math expression="-" />
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
    <Math expression="-" />
    <Math expression={`\\frac{${num2}}{${den2}}`} />
    <Math expression="=" />
    <Math expression={numInput && denInput ? `\\frac{${numInput}}{${denInput}}` : '\\;'} />
  </p>
  {#if hasNegativeDenominator}
    <p class="feedback correct">
      {_('feedback.correct')}
    </p>
    <p class="feedback warning">
      {_('feedback.negativeDenominator.prefix')}<Math expression={normalizedWarningLatex} />{_(
        'feedback.incorrect.suffix',
      )}
    </p>
  {:else}
    <p class="feedback {feedback}">
      {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect.prefix')}<Math
        expression={`\\frac{${correctNumDen[0]}}{${correctNumDen[1]}}`}
      />{_('feedback.incorrect.suffix')}
    </p>
  {/if}
  <div class="submit-row">
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}
