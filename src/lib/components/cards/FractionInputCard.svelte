<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from '../NumericInput.svelte';
  import { normalizeFraction } from '../../math/fraction';
  import { useFractionInput, fractionLatex } from '../../fraction-input.svelte';
  import { reduceFrac } from '../../math/fraction';
  import { coeffLatex, promptFraction } from '../../math/latex';
  import type { MultiplicationFractionData } from '../../exercises/multiplicationFraction';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let frac = useFractionInput();

  let data = $derived(exercise.data as MultiplicationFractionData);
  const num1 = $derived(data.num1);
  const den1 = $derived(data.den1);
  const num2 = $derived(data.num2);
  const den2 = $derived(data.den2);
  const op = $derived(data.op);
  const isBinary = $derived(data.op === '*');
  const promptKey = $derived(data.promptKey);
  const promptArgs = $derived((exercise.data as any)?.promptArgs ?? []);
  const displayOp = $derived(op === '*' ? '\\cdot' : (op ?? ''));

  const correctNumDen = $derived(exercise.answer.split(','));
  const correctLatex = $derived(fractionLatex(correctNumDen[0], correctNumDen[1]));

  const numVal = $derived(Number(frac.num));
  const denVal = $derived(Number(frac.den));
  const hasNegativeDenominator = $derived(feedback === 'correct' && denVal < 0);
  const normalizedWarningLatex = $derived.by(() => {
    if (!hasNegativeDenominator) return '';
    const [n, d] = normalizeFraction(numVal, denVal);
    return coeffLatex(n, d, '').replace('\\frac', '\\dfrac');
  });

  const rawNum = $derived(parseInt(frac.num || '0', 10));
  const rawDen = $derived(parseInt(frac.den || '1', 10));
  const reducedForm = $derived.by(() => reduceFrac(rawNum, rawDen));
  const isReducible = $derived(feedback !== null && (rawNum !== reducedForm[0] || rawDen !== reducedForm[1]));
  const reduceLatex = $derived(
    isReducible ? `${promptFraction(rawNum, rawDen)} = ${promptFraction(reducedForm[0], reducedForm[1])}` : '',
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
      <p class="prompt-label">{_(promptKey, ...promptArgs)}</p>
    {/if}
    <div class="fraction-prompt-row">
      <Math
        expression={isBinary
          ? `${promptFraction(num1!, den1!)} ${displayOp} ${promptFraction(num2!, den2!)}`
          : exercise.prompt}
        display
      />
      <Math expression="=" />
      <NumericInput bind:num={frac.num} bind:den={frac.den} fraction numPlaceholder="0" denPlaceholder="1" />
    </div>
  {:else}
    {#if promptKey}
      <p class="prompt-label">{_(promptKey, ...promptArgs)}</p>
    {/if}
    <div class="fraction-prompt-row">
      <Math
        expression={isBinary
          ? `${promptFraction(num1!, den1!)} ${displayOp} ${promptFraction(num2!, den2!)}`
          : exercise.prompt}
        display
      />
      <Math expression="=" />
      <span class="user-answer"><Math expression={frac.userLatex} display /></span>
    </div>
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
