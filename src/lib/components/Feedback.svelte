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
</script>

{#if feedback}
  {#if feedback === 'correct'}
    <p class="feedback correct">{correctMessage ?? _('feedback.correct')}</p>
  {:else if correctLatex}
    <p class="feedback incorrect">
      {_('feedback.incorrect.prefix')}<Math expression={correctLatex} />{_('feedback.incorrect.suffix')}
    </p>
  {:else}
    <p class="feedback incorrect">{_('feedback.incorrect', textAnswer ?? '')}</p>
  {/if}
{/if}
