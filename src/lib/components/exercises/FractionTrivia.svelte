<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseFeedback } from '../../types';
  import type { FractionTriviaData } from '../../exercises/fractionTrivia';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import Math from '../Math.svelte';
  import { useFractionInput, fractionLatex } from '../../fraction-input.svelte';

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
    if (data.triviaType === 'doubleFraction' && (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') && data.triviaOptionsText) return data.triviaOptionsText.length;
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
        return selectedCheckboxes.some(Boolean);
      case 'doubleFraction':
        if (data.triviaSubType === 'halveMC' || data.triviaSubType === 'doubleMC') return selectedCheckboxes.some(Boolean);
        return selectedIndex >= 0;
      case 'multiplySame':
      case 'fractionBar':
        return selectedIndex >= 0;
      case 'fractionDivision':
        return frac.num !== '' && frac.den !== '';
      case 'denominatorRestriction':
        return textValue.trim() !== '';
      default:
        return false;
    }
  });

  let validationError = $derived(
    data.triviaType === 'fractionDivision' ? frac.validationError : null,
  );

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
        answer = selectedCheckboxes.map((checked, i) => checked ? i : -1).filter(i => i >= 0).sort((a, b) => a - b).join(',');
        break;
      case 'doubleFraction':
        if (data.triviaSubType === 'halveMC') {
          answer = selectedCheckboxes.map((checked, i) => checked ? i : -1).filter(i => i >= 0).sort((a, b) => a - b).join(',');
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
    return [
      '\\frac{-a}{b}',
      '\\frac{a}{-b}',
      '\\frac{-a}{-b}',
      '-\\frac{-a}{b}',
      '-\\frac{a}{-b}',
      '-\\frac{-a}{-b}',
    ];
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
      return data.triviaOptionsLatex ?? ['\\frac{ab}{a}', '\\frac{a+b}{a}', '\\frac{a}{ab}', '\\frac{a-b}{a}', '\\frac{a}{a+b}', '\\frac{a}{a-b}'];
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
        .filter((i) => i < opts.length && opts[i] !== 'none')
        .map((i) => opts[i])
        .join(',\\;');
    }
    return undefined;
  });

  let correctTextAnswer = $derived.by(() => {
    if (feedback !== 'correct') {
      switch (data.triviaType) {
        case 'denominatorRestriction':
          return '0';
        case 'mediant': {
          const labels = [
            _('exercise.fractionTrivia.option.mediant.0'),
            _('exercise.fractionTrivia.option.mediant.1'),
            _('exercise.fractionTrivia.option.mediant.2'),
            _('exercise.fractionTrivia.option.mediant.3'),
            _('exercise.fractionTrivia.option.mediant.4'),
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
            _( `exercise.fractionTrivia.option.doubleFraction.${sub}.0`),
            _( `exercise.fractionTrivia.option.doubleFraction.${sub}.1`),
            _( `exercise.fractionTrivia.option.doubleFraction.${sub}.2`),
            _( `exercise.fractionTrivia.option.doubleFraction.${sub}.3`),
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

  let userAnswerCorrect = $derived(feedback === 'correct');
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#if data.triviaType === 'fractionTerms'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.fractionTerms.prompt')}</p>

    <div class="fraction-terms-input">
      <NumericInput fraction bind:num={topValue} bind:den={bottomValue} numPlaceholder="&hellip;" denPlaceholder="&hellip;" readonly={feedback !== null} />
    </div>

    {#if feedback !== null}
      <div class="feedback-spacer">
        <p class="feedback" class:correct={feedback === 'correct'} class:incorrect={feedback === 'incorrect'} role="status">
          {#if feedback === 'correct'}
            {_('feedback.correct')}
          {:else}
            <span>{_('feedback.incorrect.prefix')}
              <span class="user-word" class:word-correct={q1TopCorrect} class:word-incorrect={!q1TopCorrect}>{topValue}</span>,
              <span class="user-word" class:word-correct={q1BottomCorrect} class:word-incorrect={!q1BottomCorrect}>{bottomValue}</span>
            </span>
          {/if}
        </p>
        <p class="correct-answer">
          {_('exercise.fractionTrivia.option.fractionTerms.top')}: {_('exercise.fractionTrivia.option.fractionTerms.topAnswer')},
          {_('exercise.fractionTrivia.option.fractionTerms.bottom')}: {_('exercise.fractionTrivia.option.fractionTerms.bottomAnswer')}
        </p>
      </div>
    {/if}

  {:else if data.triviaType === 'integerFractions'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.integerFractions.prompt')}</p>

    <div class="option-grid" role="group">
      {#each ['\\frac{0}{n}', '\\frac{1}{n}', '\\frac{n}{0}', '\\frac{n}{1}'] as latex, i (i)}
        {#if feedback === null}
          <button
            class={'choice-checkbox' + (selectedCheckboxes[i] ? ' selected' : '')}
            onclick={() => toggleIndex(i)}
            role="checkbox"
            aria-checked={selectedCheckboxes[i]}
          >
            <Math expression={latex} />
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedCheckboxes[i]} class:wrong-option={!correctIndices.includes(i) && selectedCheckboxes[i]}>
            <Math expression={latex} />
          </span>
        {/if}
      {/each}
    </div>

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

    <div class="option-grid" role="group">
      {#each [0, 1, 2, 3, 4] as i (i)}
        {#if feedback === null}
          <button
            class={'choice-checkbox' + (selectedCheckboxes[i] ? ' selected' : '')}
            onclick={() => toggleIndex(i)}
            role="checkbox"
            aria-checked={selectedCheckboxes[i]}
          >
            {_(`exercise.fractionTrivia.option.mediant.${i}`)}
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedCheckboxes[i]} class:wrong-option={!correctIndices.includes(i) && selectedCheckboxes[i]}>
            {_(`exercise.fractionTrivia.option.mediant.${i}`)}
          </span>
        {/if}
      {/each}
    </div>

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
        <span class="user-answer" class:correct={userAnswerCorrect} class:incorrect={!userAnswerCorrect}>
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

    <div class="option-grid" role="group">
      {#each equalFractionsOptionsLatex() as latex, i (i)}
        {#if feedback === null}
          <button
            class={'choice-checkbox' + (selectedCheckboxes[i] ? ' selected' : '')}
            onclick={() => toggleIndex(i)}
            role="checkbox"
            aria-checked={selectedCheckboxes[i]}
          >
            {#if latex === 'none'}
              {_('exercise.fractionTrivia.option.mediant.4')}
            {:else}
              <Math expression={latex} />
            {/if}
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedCheckboxes[i]} class:wrong-option={!correctIndices.includes(i) && selectedCheckboxes[i]}>
            {#if latex === 'none'}
              {_('exercise.fractionTrivia.option.mediant.4')}
            {:else}
              <Math expression={latex} />
            {/if}
          </span>
        {/if}
      {/each}
    </div>

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}

  {:else if data.triviaType === 'reducibleFractions'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.reducibleFractions.prompt')}</p>

    <div class="option-grid" role="group">
      {#each data.triviaOptionsLatex ?? ['\\frac{ab}{a}', '\\frac{a+b}{a}', '\\frac{a}{ab}', '\\frac{a-b}{a}', '\\frac{a}{a+b}', '\\frac{a}{a-b}'] as latex, i (i)}
        {#if feedback === null}
          <button
            class={'choice-checkbox' + (selectedCheckboxes[i] ? ' selected' : '')}
            onclick={() => toggleIndex(i)}
            role="checkbox"
            aria-checked={selectedCheckboxes[i]}
          >
            <Math expression={latex} />
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedCheckboxes[i]} class:wrong-option={!correctIndices.includes(i) && selectedCheckboxes[i]}>
            <Math expression={latex} />
          </span>
        {/if}
      {/each}
    </div>

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} {correctLatex} />
      </div>
    {/if}

  {:else if data.triviaType === 'denominatorRestriction'}
    <p class="prompt-label">{_('exercise.fractionTrivia.type.denominatorRestriction.prompt')}</p>

    {#if feedback === null}
      <NumericInput bind:value={textValue} context="plain" placeholder="&hellip;" />
    {:else}
      <span class="user-answer" class:correct={userAnswerCorrect} class:incorrect={!userAnswerCorrect}>
        <Math expression={textValue || '0'} />
      </span>
    {/if}

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} textAnswer={correctTextAnswer} />
      </div>
    {/if}

  {:else if data.triviaType === 'doubleFraction'}
    {@const mcSub = data.triviaSubType === 'halveMC' ? 'halveMC' : 'doubleMC'}
    <p class="prompt-label">{_(`exercise.fractionTrivia.type.doubleFraction.${mcSub}.prompt`)}</p>

    <div class="option-grid" role="group">
      {#each data.triviaOptionsText ?? [] as key, i (i)}
        {#if feedback === null}
          <button
            class={'choice-checkbox' + (selectedCheckboxes[i] ? ' selected' : '')}
            onclick={() => toggleIndex(i)}
            role="checkbox"
            aria-checked={selectedCheckboxes[i]}
          >
            {_(key)}
          </button>
        {:else}
        <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedCheckboxes[i]} class:wrong-option={!correctIndices.includes(i) && selectedCheckboxes[i]}>
          {_(key)}
        </span>
        {/if}
      {/each}
    </div>

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
    <p class="prompt-label">{_('exercise.fractionTrivia.type.multiplySame.prompt')}</p>

    <div class="option-grid" role="radiogroup">
      {#each [0, 1, 2, 3] as i (i)}
        {#if feedback === null}
          <button
            class={'choice-radio' + (selectedIndex === i ? ' selected' : '')}
            onclick={() => (selectedIndex = i)}
            role="radio"
            aria-checked={selectedIndex === i}
          >
            {_(`exercise.fractionTrivia.option.multiplySame.${i}`)}
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedIndex === i} class:wrong-option={!correctIndices.includes(i) && selectedIndex === i}>
            {_(`exercise.fractionTrivia.option.multiplySame.${i}`)}
          </span>
        {/if}
      {/each}
    </div>

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

    <div class="option-grid" role="radiogroup">
      {#each [0, 1, 2, 3] as i (i)}
        {#if feedback === null}
          <button
            class={'choice-radio' + (selectedIndex === i ? ' selected' : '')}
            onclick={() => (selectedIndex = i)}
            role="radio"
            aria-checked={selectedIndex === i}
          >
            {_(`exercise.fractionTrivia.option.fractionBar.${i}`)}
          </button>
        {:else}
          <span class="option-feedback-row" class:correct-option={correctIndices.includes(i) && selectedIndex === i} class:wrong-option={!correctIndices.includes(i) && selectedIndex === i}>
            {_(`exercise.fractionTrivia.option.fractionBar.${i}`)}
          </span>
        {/if}
      {/each}
    </div>

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={correctTextAnswer} />
        {/if}
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

  .option-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    align-items: flex-start;
  }

  .option-grid :global(.choice-radio),
  .option-grid :global(.choice-checkbox) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.125rem;
    border-radius: 0.5rem;
    border: 1px solid var(--c-border);
    background: transparent;
    color: var(--c-text);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1;
    transition: border-color 0.2s ease-in-out;
  }

  .option-grid :global(.choice-radio:hover),
  .option-grid :global(.choice-checkbox:hover) {
    border-color: var(--c-primary);
  }

  .option-grid :global(.choice-radio.selected),
  .option-grid :global(.choice-checkbox.selected) {
    border-color: var(--c-primary);
    color: var(--c-text);
  }

  .option-grid :global(.choice-radio:focus-visible),
  .option-grid :global(.choice-checkbox:focus-visible) {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  .option-grid :global(.choice-radio::before) {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid var(--c-border);
    flex-shrink: 0;
    font-size: 0.65rem;
    line-height: 1;
    transition: border-color 0.2s ease-in-out;
    color: var(--c-primary-inverse);
  }

  .option-grid :global(.choice-radio:hover::before) {
    border-color: var(--c-primary);
  }

  .option-grid :global(.choice-radio.selected::before) {
    content: '\25CF';
    border-color: var(--c-primary);
    background: var(--c-primary);
  }

  .option-grid :global(.choice-checkbox::before) {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--c-border);
    border-radius: 0.25rem;
    flex-shrink: 0;
    font-size: 0.85rem;
    line-height: 1;
    font-weight: 700;
    transition: border-color 0.2s ease-in-out;
    color: var(--c-primary-inverse);
  }

  .option-grid :global(.choice-checkbox:hover::before) {
    border-color: var(--c-primary);
  }

  .option-grid :global(.choice-checkbox.selected::before) {
    content: '\2713';
    border-color: var(--c-primary);
    background: var(--c-primary);
  }

  .option-feedback-row {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 600;
  }

  .option-feedback-row.correct-option {
    color: var(--c-correct);
  }

  .option-feedback-row.wrong-option {
    color: var(--c-incorrect);
  }

  .feedback-spacer {
    margin-top: 1.5rem;
  }

  .feedback :global(.user-word) {
    font-weight: 600;
  }

  .feedback :global(.user-word.word-correct) {
    color: var(--c-correct);
  }

  .feedback :global(.user-word.word-incorrect) {
    color: var(--c-incorrect);
  }

  .feedback :global(.correct-answer) {
    font-size: 0.9em;
    margin-top: 0.25rem;
    opacity: 0.8;
  }

  .user-answer.correct :global(.katex) {
    color: var(--c-correct);
  }

  .user-answer.incorrect :global(.katex) {
    color: var(--c-incorrect);
  }
</style>
