<script lang="ts">
  import { _, state as langState } from '../../i18n.svelte';
  import type { ExerciseFeedback } from '../../types';
  import type { NumbersTriviaData, NumberExpr, NumberSet } from '../../exercises/numbersTrivia';
  import { NUMBERS_TRIVIA_TRUE_FALSE } from '../../exercises/numbersTrivia';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import Math from '../Math.svelte';
  import TriviaRadioGroup from './TriviaRadioGroup.svelte';
  import TriviaTextInput from './TriviaTextInput.svelte';

  let {
    exercise,
    onSubmit,
    onNext,
    feedback,
  }: {
    exercise: { prompt: string; answer: string; data?: NumbersTriviaData };
    onSubmit: (answer: string) => void;
    onNext: () => void;
    feedback: ExerciseFeedback;
  } = $props();

  let data = $derived(exercise.data as NumbersTriviaData);

  let textValue: string = $state('');
  let selectedIndex: number = $state(-1);
  let setAnswers: string[] = $state([]);

  $effect(() => {
    textValue = '';
    selectedIndex = -1;
    if (
      (data.subType === 'isNatural' || data.subType === 'isInteger' || data.subType === 'isRational') &&
      data.numberQuestions
    ) {
      setAnswers = data.numberQuestions.map(() => '');
    }
  });

  let isSetSubType = $derived(
    data.subType === 'isNatural' || data.subType === 'isInteger' || data.subType === 'isRational',
  );

  let canSubmit = $derived.by(() => {
    switch (data.subType) {
      case 'primeDivisors':
        return textValue.trim() !== '';
      case 'trueFalse':
      case 'divisibilityRules':
        return selectedIndex >= 0;
      default:
        return isSetSubType && setAnswers.every((a) => a === 'yes' || a === 'no');
    }
  });

  function handleSubmit() {
    if (!canSubmit) return;
    let answer = '';
    switch (data.subType) {
      case 'primeDivisors':
        answer = textValue.trim();
        break;
      case 'trueFalse':
      case 'divisibilityRules':
        answer = String(selectedIndex);
        break;
      default:
        if (isSetSubType) answer = setAnswers.join(',');
        break;
    }
    onSubmit(answer);
  }

  let correctIndices = $derived(exercise.answer.split(',').map(Number));

  let statementText: string = $derived.by(() => {
    if (data.subType === 'trueFalse' && data.statementIndex !== undefined) {
      const s = NUMBERS_TRIVIA_TRUE_FALSE[data.statementIndex];
      return langState.lang === 'de' ? s.de : s.en;
    }
    return '';
  });

  let validationError: string | null = $derived(null);

  let zeroIsCorrect = $derived(exercise.answer === '0');

  function isInSet(q: NumberExpr, set: NumberSet): boolean {
    if (set === 'natural') return q.isNatural;
    if (set === 'integer') return q.isInteger;
    return q.isRational;
  }

  let correctSetFeedback = $derived.by(() => {
    if (feedback && isSetSubType && data.numberQuestions && data.numberSet) {
      return data.numberQuestions.map((q, i) => ({
        latex: q.latex,
        correct: setAnswers[i] === (isInSet(q, data.numberSet as NumberSet) ? 'yes' : 'no'),
      }));
    }
    return [];
  });

  let setPromptKey = $derived.by(() => {
    switch (data.subType) {
      case 'isNatural':
        return 'exercise.numbersTrivia.type.isNatural.prompt';
      case 'isInteger':
        return 'exercise.numbersTrivia.type.isInteger.prompt';
      case 'isRational':
        return 'exercise.numbersTrivia.type.isRational.prompt';
      default:
        return '';
    }
  });
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#if data.subType === 'trueFalse'}
    {#if data.promptLatex}
      <p class="prompt-label">
        {langState.lang === 'de' ? 'Ist ' : 'Is '}
        <Math expression={data.promptLatex} />
        {langState.lang === 'de' ? ' immer negativ?' : ' always negative?'}
      </p>
    {:else}
      <p class="prompt-label">{statementText}</p>
    {/if}

    <TriviaRadioGroup
      options={[{ label: _('common.true') }, { label: _('common.false') }]}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i: number) => (selectedIndex = i)}
      name={statementText}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} textAnswer={zeroIsCorrect ? _('common.true') : _('common.false')} />
        {/if}
      </div>
    {/if}
  {:else if isSetSubType}
    <p class="prompt-label">{_(setPromptKey)}</p>

    <div class="questions-grid">
      {#each data.numberQuestions ?? [] as q, i (i)}
        <span class="question-math">
          <Math expression={q.latex} />
        </span>
        {#if feedback === null}
          <div class="button-group" role="group">
            <button class={setAnswers[i] === 'yes' ? '' : 'outline'} onclick={() => (setAnswers[i] = 'yes')}>
              {_('answer.yes')}
            </button>
            <button class={setAnswers[i] === 'no' ? '' : 'outline'} onclick={() => (setAnswers[i] = 'no')}>
              {_('answer.no')}
            </button>
          </div>
        {:else if correctSetFeedback[i].correct}
          <span class="feedback-indicator correct">
            &check; {isInSet(q, data.numberSet as NumberSet) ? _('answer.yes') : _('answer.no')}
          </span>
        {:else}
          <span class="feedback-indicator incorrect">
            &times; {isInSet(q, data.numberSet as NumberSet) ? _('answer.yes') : _('answer.no')}
          </span>
        {/if}
      {/each}
    </div>

    {#if feedback === 'correct'}
      <Feedback {feedback} />
    {/if}
  {:else if data.subType === 'primeDivisors'}
    <p class="prompt-label">{_('exercise.numbersTrivia.type.primeDivisors.prompt')}</p>

    <TriviaTextInput
      bind:value={textValue}
      {feedback}
      placeholder="&hellip;"
      context="plain"
      label={_('exercise.numbersTrivia.type.primeDivisors.prompt')}
      fallback="&hellip;"
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        <Feedback {feedback} textAnswer="2" />
      </div>
    {/if}
  {:else if data.subType === 'divisibilityRules'}
    <p class="prompt-label">
      {_('exercise.numbersTrivia.type.divisibilityRules.promptBefore')}
      <Math expression={String(data.numberA ?? 0)} />
      {_('exercise.numbersTrivia.type.divisibilityRules.promptAfter')}
    </p>

    <TriviaRadioGroup
      options={(data.ruleTexts ?? []).map((r: { en: string; de: string }) => ({
        label: langState.lang === 'de' ? r.de : r.en,
      }))}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i: number) => (selectedIndex = i)}
      name={_('exercise.numbersTrivia.type.divisibilityRules.promptBefore') + String(data.numberA ?? 0)}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback
            {feedback}
            textAnswer={(data.ruleTexts ?? [])
              .filter((_: unknown, i: number) => correctIndices.includes(i))
              .map((r: { en: string; de: string }) => (langState.lang === 'de' ? r.de : r.en))
              .join(', ')}
          />
        {/if}
      </div>
    {/if}
  {/if}
</ExerciseShell>

<style>
  .feedback-spacer {
    margin-top: 1.5rem;
  }
  .questions-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 0.75rem;
  }
  .question-math {
    white-space: nowrap;
    justify-self: start;
  }
  .feedback-indicator {
    font-weight: 600;
  }
  .feedback-indicator.correct {
    color: var(--c-correct);
  }
  .feedback-indicator.incorrect {
    color: var(--c-incorrect);
  }
</style>
