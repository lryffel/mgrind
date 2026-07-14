<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let data = $derived(
    exercise.data as { promptKey?: string; rows: { latex: string; latex2?: string }[]; buttons: string[] },
  );
  let rows = $derived(data.rows ?? []);
  let buttons = $derived(data.buttons ?? []);
  let promptKey = $derived(data.promptKey);
  let isDouble = $derived(rows[0]?.latex2 !== undefined);

  // eslint-disable-next-line svelte/prefer-writable-derived
  let answers = $state<string[]>([]);

  $effect(() => {
    answers = rows.map(() => '');
  });

  let allAnswered = $derived(answers.every((a) => buttons.includes(a)));

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers.join(','));
  }

  let correctAnswers = $derived(
    feedback
      ? exercise.answer.split(',').map((ans, i) => ({
          latex: rows[i].latex,
          latex2: rows[i].latex2,
          correct: answers[i] === ans,
          correctAnswer: ans,
        }))
      : [],
  );

  function btnLabel(btn: string): string {
    if (btn === 'yes') return _('answer.yes');
    if (btn === 'no') return _('answer.no');
    if (btn === '<') return '<';
    if (btn === '>') return '>';
    if (btn === '=') return '=';
    return _(btn);
  }

  function btnMath(btn: string): string | null {
    if (btn === '+') return '+';
    if (btn === '-') return '-';
    return null;
  }

  function feedbackLabel(ans: string): string {
    if (ans === '+') return '+';
    if (ans === '-') return '\u2212';
    if (ans === 'yes') return _('answer.yes');
    if (ans === 'no') return _('answer.no');
    return ans;
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  {#if promptKey}
    <p class="prompt-label">{_(promptKey)}</p>
  {/if}

  <div class="questions-grid" class:double={isDouble}>
    {#each rows as row, i (i)}
      <span class="question-math">
        <Math expression={row.latex} />
      </span>
      {#if feedback === null}
        <div class="button-group" role="group">
          {#each buttons as btn, j (j)}
            <button class={answers[i] === btn ? '' : 'outline'} onclick={() => (answers[i] = btn)}>
              {#if btnMath(btn) !== null}
                <Math expression={btnMath(btn)!} />
              {:else}
                {btnLabel(btn)}
              {/if}
            </button>
          {/each}
        </div>
      {:else if correctAnswers[i].correct}
        <span class="feedback-indicator correct">
          &check; {feedbackLabel(correctAnswers[i].correctAnswer)}
        </span>
      {:else}
        <span class="feedback-indicator incorrect">
          &times; {feedbackLabel(correctAnswers[i].correctAnswer)}
        </span>
      {/if}
      {#if isDouble}
        <span class="question-math">
          <Math expression={row.latex2!} />
        </span>
      {/if}
    {/each}
  </div>

  {#if feedback === 'correct'}
    <Feedback {feedback} />
  {:else if feedback === 'incorrect'}
    <Feedback {feedback} textAnswer={exercise.answer.split(',').map(feedbackLabel).join(', ')} />
  {/if}
</ExerciseShell>

<style>
  .questions-grid {
    display: grid;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 0.75rem;
  }

  .questions-grid:not(.double) {
    grid-template-columns: auto 1fr;
  }

  .questions-grid.double {
    grid-template-columns: auto auto auto;
  }

  .question-math {
    white-space: nowrap;
    justify-self: start;
  }

  .button-group {
    display: flex;
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
