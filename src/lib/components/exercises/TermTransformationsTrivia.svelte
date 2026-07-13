<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseFeedback } from '../../types';
  import type { TermTransformationsTriviaData } from '../../exercises/termTransformationsTrivia';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import Math from '../Math.svelte';
  import TriviaRadioGroup from './TriviaRadioGroup.svelte';

  let {
    exercise,
    onSubmit,
    onNext,
    feedback,
  }: {
    exercise: { prompt: string; answer: string; data?: TermTransformationsTriviaData };
    onSubmit: (answer: string) => void;
    onNext: () => void;
    feedback: ExerciseFeedback;
  } = $props();

  let data = $derived(exercise.data as TermTransformationsTriviaData);

  let selectedIndex: number = $state(-1);
  let setAnswers: string[] = $state([]);

  $effect(() => {
    selectedIndex = -1;
    if (data.triviaType === 'trueFalse' && data.statementsLatex) {
      setAnswers = data.statementsLatex.map(() => '');
    }
  });

  let trueFalse = $derived(data.triviaType === 'trueFalse');

  let canSubmit = $derived.by(() => {
    switch (data.triviaType) {
      case 'laws':
      case 'powerLaws':
        return selectedIndex >= 0;
      case 'trueFalse':
        return setAnswers.every((a) => a === 'yes' || a === 'no');
      default:
        return false;
    }
  });

  function handleSubmit() {
    if (!canSubmit) return;
    let answer = '';
    switch (data.triviaType) {
      case 'laws':
      case 'powerLaws':
        answer = String(selectedIndex);
        break;
      case 'trueFalse':
        answer = setAnswers.join(',');
        break;
    }
    onSubmit(answer);
  }

  let correctIndices = $derived(exercise.answer.split(',').map(Number));

  let correctSetFeedback = $derived.by(() => {
    if (feedback && trueFalse && data.statementsLatex && data.correctAnswers) {
      return data.statementsLatex.map((latex, i) => ({
        latex,
        correct: setAnswers[i] === (data.correctAnswers![i] ? 'yes' : 'no'),
        expectedYes: data.correctAnswers![i],
      }));
    }
    return [];
  });

  let validationError: string | null = $derived(null);

  let correctLatex = $derived.by(() => {
    if (data.triviaType === 'laws' || data.triviaType === 'powerLaws') {
      if (data.correctIndices && data.triviaOptionsLatex) {
        return data.correctIndices
          .filter((i) => i < data.triviaOptionsLatex!.length)
          .map((i) => data.triviaOptionsLatex![i])
          .join(',\\;');
      }
    }
    return undefined;
  });

  function userLatex(): string {
    if (data.triviaOptionsLatex && selectedIndex >= 0 && selectedIndex < data.triviaOptionsLatex.length) {
      return data.triviaOptionsLatex[selectedIndex];
    }
    return '';
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#if data.triviaType === 'laws'}
    <p class="prompt-label">
      {#if data.lawOperationKey}
        {_('exercise.termTransformationsTrivia.whichLaw', _(data.lawNameKey ?? ''), _(data.lawOperationKey))}
      {:else}
        {_('exercise.termTransformationsTrivia.whichLawNoOp', _(data.lawNameKey ?? ''))}
      {/if}
    </p>

    <TriviaRadioGroup
      options={(data.triviaOptionsLatex ?? []).map((l) => ({ latex: l }))}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i: number) => (selectedIndex = i)}
      name={_('exercise.termTransformationsTrivia.whichLawNoOp', '')}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} {correctLatex} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'powerLaws'}
    <p class="prompt-label">
      {_('exercise.termTransformationsTrivia.whatIsPowerLaw', _(data.ordinalKey ?? ''))}
    </p>
    <p class="hint">
      ({_('exercise.termTransformationsTrivia.hintLabel')}: {_(data.hintKey ?? '')})
    </p>

    <TriviaRadioGroup
      options={(data.triviaOptionsLatex ?? []).map((l) => ({ latex: l }))}
      {selectedIndex}
      {correctIndices}
      {feedback}
      onselect={(i: number) => (selectedIndex = i)}
      name={_('exercise.termTransformationsTrivia.whatIsPowerLaw', '')}
    />

    {#if feedback !== null}
      <div class="feedback-spacer">
        {#if feedback === 'correct'}
          <Feedback {feedback} />
        {:else}
          <Feedback {feedback} {correctLatex} />
        {/if}
      </div>
    {/if}
  {:else if data.triviaType === 'trueFalse'}
    <p class="prompt-label">{_('exercise.termTransformationsTrivia.whichAreValid')}</p>

    <div class="questions-grid">
      {#each data.statementsLatex ?? [] as latex, i (i)}
        <span class="question-math">
          <Math expression={latex} />
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
            &check; {correctSetFeedback[i].expectedYes ? _('answer.yes') : _('answer.no')}
          </span>
        {:else}
          <span class="feedback-indicator incorrect">
            &times; {correctSetFeedback[i].expectedYes ? _('answer.yes') : _('answer.no')}
          </span>
        {/if}
      {/each}
    </div>

    {#if feedback === 'correct'}
      <Feedback {feedback} />
    {:else if feedback !== null}
      <Feedback {feedback} textAnswer={_('exercise.termTransformationsTrivia.trueFalseCorrect')} />
    {/if}
  {/if}
</ExerciseShell>

<style>
  .feedback-spacer {
    margin-top: 1.5rem;
  }
  .hint {
    font-size: 0.85em;
    opacity: 0.75;
    margin-top: -0.5rem;
    margin-bottom: 0.75rem;
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
