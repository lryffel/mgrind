<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import { normalizeFraction } from '../../math/fraction';
  import { useFractionInput, fractionLatex } from '../../fraction-input.svelte';
  import { reduceFrac } from '../../math/fraction';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let frac = useFractionInput();

  const num1 = $derived(exercise.data?.num1);
  const den1 = $derived(exercise.data?.den1);
  const num2 = $derived(exercise.data?.num2);
  const den2 = $derived(exercise.data?.den2);
  const op = $derived(exercise.data?.op as string | undefined);
  const isBinary = $derived(num1 !== undefined && den1 !== undefined && num2 !== undefined && den2 !== undefined);
  const promptKey = $derived(exercise.data?.promptKey as string | undefined);
  const displayOp = $derived(op === '*' ? '\\cdot' : (op ?? ''));

  const correctNumDen = $derived(exercise.answer.split(','));
  const correctLatex = $derived(fractionLatex(correctNumDen[0], correctNumDen[1]));

  const numVal = $derived(Number(frac.num));
  const denVal = $derived(Number(frac.den));
  const hasNegativeDenominator = $derived(feedback === 'correct' && denVal < 0);
  const normalizedWarningLatex = $derived.by(() => {
    if (!hasNegativeDenominator) return '';
    const [n, d] = normalizeFraction(numVal, denVal);
    return `\\frac{${n}}{${d}}`;
  });

  const rawNum = $derived(parseInt(frac.num || '0', 10));
  const rawDen = $derived(parseInt(frac.den || '1', 10));
  const reducedForm = $derived.by(() => reduceFrac(rawNum, rawDen));
  const isReducible = $derived(feedback !== null && (rawNum !== reducedForm[0] || rawDen !== reducedForm[1]));
  const reduceLatex = $derived(
    isReducible ? `\\frac{${rawNum}}{${rawDen}} = \\frac{${reducedForm[0]}}{${reducedForm[1]}}` : '',
  );
</script>

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => onSubmit(frac.getSubmitValue())}
  {onNext}
  validationError={frac.validationError}
>
  {#if feedback === null}
    {#if promptKey}
      <p class="prompt-label">{_(promptKey)}</p>
    {/if}
    <p class="prompt fraction-prompt">
      {#if isBinary}
        <Math expression={`\\frac{${num1}}{${den1}}`} />
        <Math expression={displayOp} />
        <Math expression={`\\frac{${num2}}{${den2}}`} />
      {:else}
        <Math expression={exercise.prompt} />
      {/if}
      <Math expression="=" />
      <NumericInput bind:num={frac.num} bind:den={frac.den} fraction numPlaceholder="0" denPlaceholder="1" />
    </p>
  {:else}
    {#if promptKey}
      <p class="prompt-label">{_(promptKey)}</p>
    {/if}
    <p class="prompt fraction-prompt">
      {#if isBinary}
        <Math expression={`\\frac{${num1}}{${den1}}`} />
        <Math expression={displayOp} />
        <Math expression={`\\frac{${num2}}{${den2}}`} />
      {:else}
        <Math expression={exercise.prompt} />
      {/if}
      <Math expression="=" />
      <span class="user-answer"><Math expression={frac.userLatex} /></span>
    </p>
    <Feedback {feedback} {correctLatex} />
    {#if hasNegativeDenominator}
      <p class="feedback warning">
        {_('feedback.negativeDenominator.prefix')}<Math expression={normalizedWarningLatex} />
      </p>
    {/if}
    {#if isReducible}
      <p class="feedback warning">
        {_('feedback.fractionCanReduce')}<Math expression={reduceLatex} />
      </p>
    {/if}
  {/if}
</ExerciseShell>
