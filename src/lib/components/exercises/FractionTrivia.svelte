<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseFeedback } from '../../types';
  import type { FractionTriviaData } from '../../exercises/fractionTrivia';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import Math from '../Math.svelte';
  import { useFractionInput, fractionLatex } from '../../fraction-input.svelte';
  import TriviaRadioGroup from './TriviaRadioGroup.svelte';
  import TriviaCheckboxGroup from './TriviaCheckboxGroup.svelte';
  import TriviaTextInput from './TriviaTextInput.svelte';

  let {
    exercise,
    onSubmit,
    onNext,
    feedback,
  }: {
    exercise: { prompt: string; answer: string; data?: FractionTriviaData };
    onSubmit: (answer: string) => void;
    onNext: () => void;
    feedback: ExerciseFeedback;
  } = $props();

  let data = $derived(exercise.data as FractionTriviaData);

  let topValue = $state('');
  let bottomValue = $state('');
  let selectedCheckboxes = $state<boolean[]>([]);
  let selectedIndex = $state(-1);
  let frac = useFractionInput();
  let textValue = $state('');

  let q1TopCorrect = $derived.by(() => {
    const v = topValue.trim().toLowerCase();
    return v === 'numerator' || v === 'zähler' || v === 'zahler';
  });
  let q1BottomCorrect = $derived.by(() => {
    const v = bottomValue.trim().toLowerCase();
    return v === 'denominator' || v === 'nenner';
  });

  function checkboxCount() {
    if (data.triviaType === 'integerFractions') return 4;
    if (data.triviaType === 'mediant') return 5;
    if (data.triviaType === 'equalFractions' && data.triviaOptionsLatex) return data.triviaOptionsLatex.length;
    if (data.triviaType === 'equalFractions') return 6;
    if (data.triviaType === 'reducibleFractions' && data.triviaOptionsLatex) return data.triviaOptionsLatex.length;
    if (data.triviaType === 'reducibleFractions') return 6;
    if (data.triviaType === 'negativeSignPlacement' && data.triviaOptionsLatex) return data.triviaOptionsLatex.length;
    if (data.triviaType === 'negativeSignPlacement') return 6;
    if (
      data.triviaType === 'doubleFraction' &&
      (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') &&
      data.triviaOptionsText
    )
      return data.triviaOptionsText.length;
    return 0;
  }

  $effect(() => {
    topValue = '';
    bottomValue = '';
    selectedCheckboxes = new Array(checkboxCount()).fill(false);
    selectedIndex = -1;
    frac.num = '';
    frac.den = '';
    textValue = '';
  });

  function toggleIndex(idx: number) {
    const next = [...selectedCheckboxes];
    next[idx] = !next[idx];
    selectedCheckboxes = next;
  }

  let canSubmit = $derived.by(() => {
    switch (data.triviaType) {
      case 'fractionTerms':
        return topValue.trim() !== '' && bottomValue.trim() !== '';
      case 'integerFractions':
      case 'equalFractions':
      case 'mediant':
      case 'reducibleFractions':
      case 'negativeSignPlacement':
        return true;
      case 'doubleFraction':
        if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') return true;
        return selectedIndex >= 0;
      case 'multiplySame':
      case 'fractionBar':
        return selectedIndex >= 0;
      case 'fractionDivision':
        return frac.num !== '' && frac.den !== '';
      case 'denominatorRestriction':
      case 'zeroNumerator':
      case 'reciprocalProduct':
        return textValue.trim() !== '';
      default:
        return false;
    }
  });

  let validationError = $derived(data.triviaType === 'fractionDivision' ? frac.validationError : null);

  function handleSubmit() {
    if (!canSubmit) return;
    let answer = '';
    switch (data.triviaType) {
      case 'fractionTerms':
        answer = `${topValue.trim().toLowerCase()},${bottomValue.trim().toLowerCase()}`;
        break;
      case 'integerFractions':
      case 'equalFractions':
      case 'mediant':
      case 'reducibleFractions':
      case 'negativeSignPlacement':
        answer = selectedCheckboxes
          .map((checked, i) => (checked ? i : -1))
          .filter((i) => i >= 0)
          .sort((a, b) => a - b)
          .join(',');
        break;
      case 'doubleFraction':
        if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') {
          answer = selectedCheckboxes
            .map((checked, i) => (checked ? i : -1))
            .filter((i) => i >= 0)
            .sort((a, b) => a - b)
            .join(',');
        } else {
          answer = String(selectedIndex);
        }
        break;
      case 'multiplySame':
      case 'fractionBar':
        answer = String(selectedIndex);
        break;
      case 'fractionDivision':
        answer = frac.getSubmitValue();
        break;
      case 'denominatorRestriction':
      case 'zeroNumerator':
      case 'reciprocalProduct':
        answer = textValue.trim();
        break;
    }
    onSubmit(answer);
  }

  let correctIndices = $derived(exercise.answer.split(',').map(Number));

  function equalFractionsOptionsLatex(): string[] {
    if (data.triviaOptionsLatex && data.triviaOptionsLatex.length > 0) {
      return data.triviaOptionsLatex;
    }
    return ['\\frac{-a}{b}', '\\frac{a}{-b}', '\\frac{-a}{-b}', '-\\frac{-a}{b}', '-\\frac{a}{-b}', '-\\frac{-a}{-b}'];
  }

  function correctOptionsLatex(): string[] | undefined {
    if (data.triviaType === 'integerFractions') {
      return ['\\frac{0}{n}', '\\frac{1}{n}', '\\frac{n}{0}', '\\frac{n}{1}'];
    }
    if (data.triviaType === 'equalFractions') {
      const all = equalFractionsOptionsLatex();
      return all;
    }
    if (data.triviaType === 'reducibleFractions') {
      return (
        data.triviaOptionsLatex ?? [
          '\\frac{ab}{a}',
          '\\frac{a+b}{a}',
          '\\frac{a}{ab}',
          '\\frac{a-b}{a}',
          '\\frac{a}{a+b}',
          '\\frac{a}{a-b}',
        ]
      );
    }
    if (data.triviaType === 'negativeSignPlacement') {
      return (
        data.triviaOptionsLatex ?? [
          '\\frac{-a}{b}',
          '\\frac{a}{-b}',
          '\\frac{-a}{-b}',
          '-\\frac{-a}{b}',
          '-\\frac{a}{-b}',
        ]
      );
    }
    return undefined;
  }

  let correctLatex = $derived.by(() => {
    if (data.triviaType === 'fractionDivision') {
      return fractionLatex(String(data.triviaB ?? 0), String(data.triviaA ?? 1));
    }
    const opts = correctOptionsLatex();
    if (opts) {
      return correctIndices
        .filter((i) => i < opts.length)
        .map((i) => opts[i])
        .join(',\\;');
    }
    return undefined;
  });

  let correctTextAnswer = $derived.by(() => {
    if (feedback !== 'correct') {
      switch (data.triviaType) {
        case 'denominatorRestriction':
        case 'zeroNumerator':
          return '0';
        case 'reciprocalProduct':
          return '1';
        case 'mediant': {
          const labels = [
            _('exercise.fractionTrivia.option.mediant.0'),
            _('exercise.fractionTrivia.option.mediant.1'),
            _('exercise.fractionTrivia.option.mediant.2'),
            _('exercise.fractionTrivia.option.mediant.3'),
          ];
          return correctIndices.map((i) => labels[i]).join(', ');
        }
        case 'doubleFraction': {
          if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') {
            const labels = (data.triviaOptionsText ?? []).map((key) => _(key));
            return correctIndices.map((i) => labels[i]).join(', ');
          }
          const sub = data.triviaSubType ?? 'doubleNum';
          const labels = [
            _(`exercise.fractionTrivia.option.doubleFraction.${sub}.0`),
            _(`exercise.fractionTrivia.option.doubleFraction.${sub}.1`),
            _(`exercise.fractionTrivia.option.doubleFraction.${sub}.2`),
            _(`exercise.fractionTrivia.option.doubleFraction.${sub}.3`),
          ];
          return labels[correctIndices[0]] ?? '';
        }
        case 'multiplySame': {
          const labels = [
            _('exercise.fractionTrivia.option.multiplySame.0'),
            _('exercise.fractionTrivia.option.multiplySame.1'),
            _('exercise.fractionTrivia.option.multiplySame.2'),
            _('exercise.fractionTrivia.option.multiplySame.3'),
          ];
          return labels[correctIndices[0]] ?? '';
        }
        case 'fractionBar': {
          const labels = [
            _('exercise.fractionTrivia.option.fractionBar.0'),
            _('exercise.fractionTrivia.option.fractionBar.1'),
            _('exercise.fractionTrivia.option.fractionBar.2'),
            _('exercise.fractionTrivia.option.fractionBar.3'),
          ];
          return labels[correctIndices[0]] ?? '';
        }
      }
    }
    return '';
  });

  function termColor(correct: boolean): string {
    const key = correct ? '--c-correct' : '--c-incorrect';
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  }

  let userAnswerCorrect = $derived(feedback === 'correct');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#if data.triviaType === 'fractionTerms'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.fractionTerms.prompt')}</p>

    {#if feedback === null}
      <div class="fraction-terms-input">
        <NumericInput
          fraction
          bind:num={topValue}
          bind:den={bottomValue}
          numPlaceholder="&hellip;"
          denPlaceholder="&hellip;"
        />
      </div>
    {:else}
      <div class="fraction-terms-input">
        <Math
          expression={'\\dfrac{\\color{' +
            termColor(q1TopCorrect) +
            '}{\\text{' +
            topValue +
            '}}}{\\color{' +
            termColor(q1BottomCorrect) +
            '}{\\text{' +
            bottomValue +
            '}}}'}
          display
        />
      </div>
    {/if}

    {#if feedback !== null}
      <div class="feedback-spacer">
        <p
          class="feedback"
          class:correct={feedback === 'correct'}
          class:incorrect={feedback === 'incorrect'}
          role="status"
        >
          {#if feedback === 'correct'}
            {_('feedback.correct')}
          {:else}
            {_('feedback.incorrect.prefix')}
          {/if}
        </p>
        <p class="correct-answer">
          {_('exercise.fractionTrivia.option.fractionTerms.top')}: {_(
            'exercise.fractionTrivia.option.fractionTerms.topAnswer',
          )},
          {_('exercise.fractionTrivia.option.fractionTerms.bottom')}: {_(
            'exercise.fractionTrivia.option.fractionTerms.bottomAnswer',
          )}
        </p>
      </div>
    {/if}
  {:else if data.triviaType === 'integerFractions'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.integerFractions.prompt')}</p>

    <TriviaCheckboxGroup
      options={['\\frac{0}{n}', '\\frac{1}{n}', '\\frac{n}{0}', '\\frac{n}{1}'].map((l) => ({ latex: l }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}
  {:else if data.triviaType === 'mediant'}
    <p class="prompt-label">
      {_('exercise.fractionTrivia.type.mediant.promptBefore')}
      <Math expression={'\\frac{a}{b}'} />
      {_('exercise.fractionTrivia.type.mediant.promptMiddle')}
      <Math expression={'\\frac{c}{d}'} />
      {_('exercise.fractionTrivia.type.mediant.promptAfter')}
      <Math expression={data.triviaExpressionLatex ?? ''} />
      {_('exercise.fractionTrivia.type.mediant.promptSuffix')}
    </p>

    <TriviaCheckboxGroup
      options={[0, 1, 2, 3].map((i) => ({ label: _(`exercise.fractionTrivia.option.mediant.${i}`) }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={correctTextAnswer} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'fractionDivision'}
    <p class="prompt-label">
      {_('exercise.fractionTrivia.type.fractionDivision.promptBefore')}
      <Math expression={'\\dfrac{\\quad1\\quad}{\\dfrac{' + (data.triviaA ?? 0) + '}{' + (data.triviaB ?? 1) + '}}'} />
      {_('exercise.fractionTrivia.type.fractionDivision.promptAfter')}
    </p>

    <div class="fraction-input-wrapper">
      {#if feedback === null}
        <NumericInput fraction bind:num={frac.num} bind:den={frac.den} numPlaceholder="0" denPlaceholder="1" />
      {:else}
        <span class="frac-answer" class:correct={userAnswerCorrect} class:incorrect={!userAnswerCorrect}>
          <Math expression={frac.userLatex} />
        </span>
      {/if}
    </div>

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}
  {:else if data.triviaType === 'equalFractions'}
    <p class="prompt-label">
      {_('exercise.fractionTrivia.type.equalFractions.promptBefore')}
      {#if data.triviaA !== undefined && data.triviaB !== undefined}
        <Math expression={'\\frac{' + data.triviaA + '}{' + data.triviaB + '}'} />
      {:else}
        <Math expression={'\\frac{a}{b}'} />
      {/if}
      {_('exercise.fractionTrivia.type.equalFractions.promptSuffix')}
    </p>

    <TriviaCheckboxGroup
      options={equalFractionsOptionsLatex().map((l) => ({ latex: l }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}
  {:else if data.triviaType === 'reducibleFractions'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.reducibleFractions.prompt')}</p>

    <TriviaCheckboxGroup
      options={(
        data.triviaOptionsLatex ?? [
          '\\frac{ab}{a}',
          '\\frac{a+b}{a}',
          '\\frac{a}{ab}',
          '\\frac{a-b}{a}',
          '\\frac{a}{a+b}',
          '\\frac{a}{a-b}',
        ]
      ).map((l) => ({ latex: l }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}
  {:else if data.triviaType === 'denominatorRestriction'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.denominatorRestriction.prompt')}</p>

    <TriviaTextInput
      bind:value={textValue}
      {feedback}
      placeholder="&hellip;"
      context="plain"
      label={_('exercise.fractionTrivia.type.denominatorRestriction.prompt')}
      fallback="0"
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} textAnswer={correctTextAnswer} />
      </div>
    {/if}
  {:else if data.triviaType === 'zeroNumerator'}
    <p class="prompt-label">
      {_('exercise.fractionTrivia.type.zeroNumerator.promptBefore')}
      <Math expression={'\\frac{0}{n}'} />
      {_('exercise.fractionTrivia.type.zeroNumerator.promptAfter')}
    </p>

    <TriviaTextInput
      bind:value={textValue}
      {feedback}
      placeholder="&hellip;"
      context="plain"
      label="Zero numerator answer"
      fallback="0"
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} textAnswer={correctTextAnswer} />
      </div>
    {/if}
  {:else if data.triviaType === 'reciprocalProduct'}
    {#if data.triviaSubType === 'num'}
      <p class="prompt-label">
        {_('exercise.fractionTrivia.type.reciprocalProduct.promptBefore')}
        <Math
          expression={'\\frac{' +
            (data.triviaA ?? 0) +
            '}{' +
            (data.triviaB ?? 1) +
            '}\\cdot\\frac{' +
            (data.triviaB ?? 1) +
            '}{' +
            (data.triviaA ?? 0) +
            '}'}
        />
        {_('exercise.fractionTrivia.type.reciprocalProduct.promptAfter')}
      </p>
    {:else}
      <p class="prompt-label">
        {_('exercise.fractionTrivia.type.reciprocalProduct.promptBefore')}
        <Math expression={'\\frac{a}{b}\\cdot\\frac{b}{a}'} />
        {_('exercise.fractionTrivia.type.reciprocalProduct.promptAfter')}
      </p>
    {/if}

    <TriviaTextInput
      bind:value={textValue}
      {feedback}
      placeholder="&hellip;"
      context="plain"
      label="Reciprocal product answer"
      fallback="1"
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} textAnswer={correctTextAnswer} />
      </div>
    {/if}
  {:else if data.triviaType === 'doubleFraction'}
    {@const mcSub = data.triviaSubType === 'halveMC' ? 'halveMC' : 'doubleMC'}
    <p class="prompt-label">{_(`exercise.fractionTrivia.type.doubleFraction.${mcSub}.prompt`)}</p>

    <TriviaCheckboxGroup
      options={(data.triviaOptionsText ?? []).map((key) => ({ label: _(key) }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={correctTextAnswer} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'multiplySame'}
    <p class="prompt-label">
      {#if data.triviaSubType === 'reciprocal'}
        {_('exercise.fractionTrivia.type.multiplySame.reciprocal.prompt')}
      {:else}
        {_('exercise.fractionTrivia.type.multiplySame.prompt')}
      {/if}
    </p>

    <TriviaRadioGroup
      options={[0, 1, 2, 3].map((i) => ({ label: _(`exercise.fractionTrivia.option.multiplySame.${i}`) }))}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i) => (selectedIndex = i)}
      name={_('exercise.fractionTrivia.type.multiplySame.prompt')}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={correctTextAnswer} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'fractionBar'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.fractionBar.prompt')}</p>

    <TriviaRadioGroup
      options={[0, 1, 2, 3].map((i) => ({ label: _(`exercise.fractionTrivia.option.fractionBar.${i}`) }))}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i) => (selectedIndex = i)}
      name={_('exercise.fractionTrivia.type.fractionBar.prompt')}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={correctTextAnswer} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'negativeSignPlacement'}
    <p class="prompt-label">
      {_('exercise.fractionTrivia.type.negativeSignPlacement.promptBefore')}
      {#if data.triviaA !== undefined && data.triviaB !== undefined}
        <Math expression={'-\\frac{' + data.triviaA + '}{' + data.triviaB + '}'} />
      {:else}
        <Math expression={'-\\frac{a}{b}'} />
      {/if}
      {_('exercise.fractionTrivia.type.negativeSignPlacement.promptSuffix')}
    </p>

    <TriviaCheckboxGroup
      options={(correctOptionsLatex() ?? []).map((l) => ({ latex: l }))}
      selected={selectedCheckboxes}
      {correctIndices}
      {feedback}
      ontoggle={toggleIndex}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}
  {/if}
</ExerciseShell>

<style>
  .fraction-terms-input {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .fraction-input-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
  }

  .feedback-spacer {
    margin-top: 1.5rem;
  }

  .feedback :global(.correct-answer) {
    font-size: 0.9em;
    margin-top: 0.25rem;
    opacity: 0.8;
  }

  .frac-answer.correct :global(.katex) {
    color: var(--c-correct);
  }

  .frac-answer.incorrect :global(.katex) {
    color: var(--c-incorrect);
  }
</style>
