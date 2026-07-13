<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps, InputContext } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import CoefficientField from '../CoefficientField.svelte';
  import { formatCollectingAnswer } from '../../exercises/collectingTerms';
  import { normalizeCoeff } from '../../validation';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let mode = $derived(exercise.data?.mode === 'fraction' ? 'fraction' : 'polynomial');
  let fields = $derived(exercise.data?.fields ?? []);
  let denominatorFields = $derived(mode === 'fraction' ? (exercise.data?.denominatorFields ?? []) : []);
  let promptKey = $derived(exercise.data?.promptKey ?? null);

  let numValues = $state<string[]>([]);
  let denValues = $state<string[]>([]);
  let pressedCannotSimplify = $state(false);

  let validationError = $derived(
    [...numValues, ...denValues].some((v) => v.includes(',')) ? _('error.decimalComma') : null,
  );

  $effect(() => {
    numValues = fields.map(() => '');
    denValues = denominatorFields.map(() => '');
    pressedCannotSimplify = false;
  });

  let variableParts = $derived(fields.map((f) => f.variablePart));
  let denVariableParts = $derived(denominatorFields.map((f) => f.variablePart));

  let numContexts = $derived(
    fields.map((f) => (f.variablePart === '' ? ('numerator' as InputContext) : ('coefficient' as InputContext))),
  );
  let denContexts = $derived(
    denominatorFields.map((f) =>
      f.variablePart === '' ? ('denominator' as InputContext) : ('coefficient' as InputContext),
    ),
  );

  let normNumValues = $derived(numValues.map((v, i) => normalizeCoeff(v, numContexts[i])));
  let normDenValues = $derived(denValues.map((v, i) => normalizeCoeff(v, denContexts[i])));

  let userNumLatex = $derived(formatCollectingAnswer(normNumValues, variableParts));
  let userDenLatex = $derived(formatCollectingAnswer(normDenValues, denVariableParts));

  let userLatex = $derived(mode === 'fraction' ? `\\dfrac{${userNumLatex}}{${userDenLatex}}` : userNumLatex);

  let correctNumParts = $derived(
    mode === 'fraction'
      ? (exercise.answer
          .split(';')[0]
          ?.split(',')
          .map((s) => s.trim()) ?? [])
      : exercise.answer.split(',').map((s) => s.trim()),
  );
  let correctDenParts = $derived(
    mode === 'fraction'
      ? (exercise.answer
          .split(';')[1]
          ?.split(',')
          .map((s) => s.trim()) ?? [])
      : [],
  );

  let correctNumLatex = $derived(
    mode === 'fraction'
      ? formatCollectingAnswer(correctNumParts, variableParts)
      : formatCollectingAnswer(correctNumParts, variableParts),
  );
  let correctDenLatex = $derived(mode === 'fraction' ? formatCollectingAnswer(correctDenParts, denVariableParts) : '');

  let correctLatex = $derived(
    mode === 'fraction' ? `\\dfrac{${correctNumLatex}}{${correctDenLatex}}` : correctNumLatex,
  );

  let cannotSimplifyText = $derived(_('exercise.simplifySymbolicFraction.cannotSimplify'));

  function submitAnswer() {
    if (mode === 'fraction') {
      onSubmit(normNumValues.join(',') + ';' + normDenValues.join(','));
    } else {
      onSubmit(normNumValues.join(','));
    }
  }

  function handleCannotSimplify() {
    pressedCannotSimplify = true;
    onSubmit('cannot_simplify');
  }

  let isCannotSimplify = $derived(exercise.answer === 'cannot_simplify');
  let cannotSimplifyCorrectMessage = $derived(_('feedback.simplifySymbolicFraction.cannotSimplify'));
  let cannotSimplifyIncorrectMessage = $derived(_('feedback.simplifySymbolicFraction.cannotSimplify.incorrect'));
  let cannotSimplifyLatex = $derived('\\text{?}');
</script>

<ExerciseShell {exercise} {feedback} {submitAnswer} {onNext} {validationError}>
  {#snippet submitExtra()}
    {#if feedback === null}
      <button class="cannot-simplify-link" onclick={handleCannotSimplify}>{cannotSimplifyText}</button>
    {/if}
  {/snippet}
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}
  {#if feedback === null}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        {#if mode === 'fraction'}
          <span class="frac">
            <span class="frac-row">
              {#each fields as { variablePart }, i (i)}
                {#if i > 0}
                  <Math expression="+" />
                {/if}
                <CoefficientField bind:value={numValues[i]} {variablePart} />
              {/each}
            </span>
            <span class="frac-bar"></span>
            <span class="frac-row">
              {#each denominatorFields as { variablePart }, i (i)}
                {#if i > 0}
                  <Math expression="+" />
                {/if}
                <CoefficientField bind:value={denValues[i]} {variablePart} context={denContexts[i]} />
              {/each}
            </span>
          </span>
        {:else}
          {#each fields as { variablePart }, i (i)}
            {#if i > 0}
              <Math expression="+" />
            {/if}
            <CoefficientField bind:value={numValues[i]} {variablePart} />
          {/each}
        {/if}
      </span>
    </div>
  {:else}
    <div class="prompt-row">
      <Math expression={exercise.prompt} display />
      <span class="continuation">
        <Math expression="=" />
        {#if pressedCannotSimplify}
          <span class="user-answer"><Math expression={cannotSimplifyLatex} /></span>
        {:else}
          <span class="user-answer"><Math expression={userLatex} /></span>
        {/if}
      </span>
    </div>
    {#if isCannotSimplify}
      <Feedback {feedback} correctMessage={cannotSimplifyCorrectMessage} />
      {#if feedback === 'incorrect' && !pressedCannotSimplify}
        <p class="feedback warning">{cannotSimplifyIncorrectMessage}</p>
      {/if}
    {:else}
      <Feedback {feedback} {correctLatex} />
    {/if}
  {/if}
</ExerciseShell>

<style>
  .frac {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
  }

  .frac-row {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    padding: 2px 0;
  }

  .frac-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
  }

  .cannot-simplify-link {
    background: none;
    border: none;
    font: inherit;
    font-size: 0.8rem;
    color: var(--c-primary);
    cursor: pointer;
    text-decoration: underline dotted;
  }

  .cannot-simplify-link:hover {
    text-decoration-style: solid;
  }
</style>
