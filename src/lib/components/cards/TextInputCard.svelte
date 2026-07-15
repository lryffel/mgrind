<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { TextInputCardData } from './cardData';
  import Math from '../Math.svelte';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from '../NumericInput.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');

  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);
  let disableSubmit = $derived(userInput.trim() === '');
  let data = $derived(exercise.data as TextInputCardData);
  let promptKey = $derived(data?.promptKey);
  let promptArgs = $derived(data?.promptArgs ?? []);
  let promptMath = $derived(data?.promptMath);
  let promptKeySuffix = $derived(data?.promptKeySuffix);
  let prefixLatex = $derived(data?.prefixLatex);
  let suffixLatex = $derived(data?.suffixLatex);
  let correctLatex = $derived(data?.correctLatex ?? exercise.answer);
  let formatNumbers = $derived(data?.formatNumbers ?? false);

  function thinSpace(s: string): string {
    const dotIdx = s.indexOf('.');
    if (dotIdx === -1) return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    return s.slice(0, dotIdx).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + s.slice(dotIdx);
  }

  let displayUserInput = $derived(formatNumbers ? thinSpace(userInput) : userInput);
  let displayCorrectLatex = $derived(formatNumbers ? thinSpace(correctLatex) : correctLatex);
</script>

<ExerciseShell
  {exercise}
  {feedback}
  submitAnswer={() => onSubmit(userInput.trim())}
  {onNext}
  {validationError}
  {disableSubmit}
>
  {#if promptKey && promptMath}
    <p class="prompt-label">
      {_(promptKey)}<Math expression={promptMath} />{promptKeySuffix ? _(promptKeySuffix) : ''}
    </p>
  {:else if promptKey}
    <p class="prompt-label">{_(promptKey, ...promptArgs)}</p>
  {/if}
  {#if feedback === null}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <div class="prompt-row">
        <Math expression={parts[0]} display />
        <NumericInput bind:value={userInput} align="center" />
        <Math expression={parts[1] ?? ''} display />
      </div>
    {:else if exercise.prompt}
      <p class="prompt">
        <Math expression={exercise.prompt} display />
      </p>
      <div class="answer-row">
        {#if prefixLatex}<Math expression={prefixLatex} />{/if}
        <NumericInput bind:value={userInput} />
        {#if suffixLatex}<Math expression={suffixLatex} />{/if}
      </div>
    {:else}
      <div class="answer-row">
        {#if prefixLatex}<Math expression={prefixLatex} />{/if}
        <NumericInput bind:value={userInput} />
        {#if suffixLatex}<Math expression={suffixLatex} />{/if}
      </div>
    {/if}
  {:else}
    {#if exercise.prompt.includes('?')}
      {@const parts = exercise.prompt.split('?')}
      <div class="prompt-row">
        <Math expression={parts[0]} display />
        <span class="user-answer"><Math expression={userInput} /></span>
        <Math expression={parts[1] ?? ''} display />
      </div>
    {:else}
      {#if exercise.prompt}
        <p class="prompt">
          <Math expression={exercise.prompt} display />
        </p>
      {/if}
      {#if prefixLatex || suffixLatex || userInput}
        <div class="answer-row">
          {#if prefixLatex}<Math expression={prefixLatex} />{/if}
          {#if userInput}<span class="user-answer"><Math expression={displayUserInput} /></span>{/if}
          {#if suffixLatex}<Math expression={suffixLatex} />{/if}
        </div>
      {/if}
    {/if}
    <Feedback {feedback} correctLatex={displayCorrectLatex} textAnswer={exercise.answer} />
  {/if}
</ExerciseShell>

<style>
  .answer-row {
    margin-top: 0.5rem;
  }
</style>
