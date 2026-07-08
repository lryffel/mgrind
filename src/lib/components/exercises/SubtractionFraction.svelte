<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import FractionInput from './FractionInput.svelte';
  import { normalizeFraction } from '../../math/fraction';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let numInput = $state('');
  let denInput = $state('');

  const num1 = $derived(exercise.data?.num1 ?? 0);
  const den1 = $derived(exercise.data?.den1 ?? 1);
  const num2 = $derived(exercise.data?.num2 ?? 0);
  const den2 = $derived(exercise.data?.den2 ?? 1);
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived(exercise.data?.promptKey ?? 'exercise.subtractionFraction.prompt');

  const numVal = $derived(Number(numInput));
  const denVal = $derived(Number(denInput));

  const hasNegativeDenominator = $derived(feedback === 'correct' && denVal < 0);
  const normalizedWarningLatex = $derived.by(() => {
    if (!hasNegativeDenominator) return '';
    const [n, d] = normalizeFraction(numVal, denVal);
    return `\\frac{${n}}{${d}}`;
  });
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(`${numInput},${denInput}`)} {onNext} card={false}>
  {#if feedback === null}
    <p class="prompt-label">{_(promptKey)}</p>
    <p class="prompt fraction-prompt">
      <Math expression={`\\frac{${num1}}{${den1}}`} />
      <Math expression="-" />
      <Math expression={`\\frac{${num2}}{${den2}}`} />
      <Math expression="=" />
      <FractionInput bind:num={numInput} bind:den={denInput} />
    </p>
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
  {/if}
</ExerciseShell>
