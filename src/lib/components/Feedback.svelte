<script lang="ts">
  import { _ } from '../i18n.svelte';
  import Math from './Math.svelte';
  import type { ExerciseFeedback } from '../types';

  let {
    feedback,
    correctLatex,
    textAnswer,
    correctMessage,
  }: {
    feedback: ExerciseFeedback;
    correctLatex?: string;
    textAnswer?: string;
    correctMessage?: string;
  } = $props();

  let celebrating = $state(false);

  $effect(() => {
    if (feedback === 'correct') {
      celebrating = true;
    } else {
      celebrating = false;
    }
  });

  function onAnimEnd() {
    celebrating = false;
  }
</script>

{#if feedback}
  {#if feedback === 'correct'}
    <p class="feedback correct" class:celebrating onanimationend={onAnimEnd} role="status">
      {correctMessage ?? _('feedback.correct')}
    </p>
  {:else if correctLatex}
    <p class="feedback incorrect" role="status">
      {_('feedback.incorrect.prefix')}<Math expression={correctLatex} display />
    </p>
  {:else}
    <p class="feedback incorrect" role="status">
      {_('feedback.incorrect', textAnswer ?? '')}
    </p>
  {/if}
{/if}
