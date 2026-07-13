<script lang="ts">
  import type { ExerciseFeedback } from '../../types';
  import NumericInput from './NumericInput.svelte';
  import Math from '../Math.svelte';

  let {
    value = $bindable(),
    feedback,
    placeholder = '…',
    context = 'plain',
    label,
    fallback = '',
  }: {
    value?: string;
    feedback: ExerciseFeedback | null;
    placeholder?: string;
    context?: import('../../types').InputContext;
    label: string;
    fallback?: string;
  } = $props();
</script>

{#if feedback === null}
  <NumericInput {context} bind:value {placeholder} />
{:else}
  <span class="user-answer" class:correct={feedback === 'correct'} class:incorrect={feedback === 'incorrect'}>
    <Math expression={value || fallback} />
  </span>
{/if}

<style>
  .user-answer.correct :global(.katex) {
    color: var(--c-correct);
  }

  .user-answer.incorrect :global(.katex) {
    color: var(--c-incorrect);
  }
</style>
