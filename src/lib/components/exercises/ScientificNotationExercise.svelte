<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import Math from '../Math.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
  let coeffInput = $state('');
  let expInput = $state('');
  let inputEl = $state<HTMLInputElement>();
  let coeffInputEl = $state<HTMLInputElement>();

  const cdot = '\\cdot';
  const subType = $derived(exercise.data?.subType);
  const isMultiInput = $derived(subType !== 'sciToDec');

  $effect(() => {
    if (feedback === null) {
      (isMultiInput ? coeffInputEl : inputEl)?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        handleSubmit();
      } else {
        onNext();
      }
    }
  }

  function handleSubmit() {
    if (isMultiInput) {
      onSubmit(`${coeffInput.trim()},${expInput.trim()}`);
    } else {
      onSubmit(userInput.trim());
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if feedback === null}
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>
  {#if isMultiInput}
    <div class="sci-row">
      <input type="text" class="coeff-input" bind:value={coeffInput} bind:this={coeffInputEl} placeholder="…" />
      <Math expression={cdot} />
      <Math expression="10" /><sup><input type="text" class="exp-input" bind:value={expInput} placeholder="…" /></sup>
    </div>
    <div class="submit-row">
      <button onclick={handleSubmit}>{_('answer.submit')}</button>
    </div>
  {:else}
    <div role="group" class="answer-row">
      <input type="text" class="answer-input" bind:value={userInput} bind:this={inputEl} />
      <button onclick={handleSubmit}>{_('answer.submit')}</button>
    </div>
  {/if}
{:else}
  <p class="prompt">
    <Math expression={exercise.prompt} />
  </p>
  {#if isMultiInput}
    <p class="user-answer">
      <Math expression={`${coeffInput || '?'} \\cdot 10^{${expInput || '?'}}`} />
    </p>
  {:else}
    <p class="user-answer">
      <Math expression={userInput || '?'} />
    </p>
  {/if}
  {#if isMultiInput}
    {@const parts = exercise.answer.split(',')}
    {#if feedback === 'correct'}
      <p class="feedback correct">{_('feedback.correct')}</p>
    {:else}
      <p class="feedback incorrect">
        {_('feedback.incorrect.prefix')}<Math expression={`${parts[0]} \\cdot 10^{${parts[1]}}`} />{_(
          'feedback.incorrect.suffix',
        )}
      </p>
    {/if}
  {:else}
    {#if feedback === 'correct'}
      <p class="feedback correct">{_('feedback.correct')}</p>
    {:else}
      <p class="feedback incorrect">{_('feedback.incorrect', exercise.answer)}</p>
    {/if}
  {/if}
  <div class="submit-row">
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .sci-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 1.25rem;
    margin: 1rem 0;
  }

  .coeff-input {
    width: 5rem;
    text-align: center;
  }

  .exp-input {
    width: 3rem;
    text-align: center;
  }

  .answer-input {
    width: 150px;
    text-align: center;
  }

  .user-answer {
    text-align: center;
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }
</style>
