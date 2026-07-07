<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';

  let { discipline, onclick }: { discipline: Discipline; onclick: () => void } = $props();
  let progress = $derived(getDisciplineProgress(discipline, exerciseTypes));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="discipline-card" {onclick} onkeydown={(e) => e.key === 'Enter' && onclick()} tabindex="0">
  <h2>{_(discipline.nameKey)}</h2>
  <div class="card-footer">
    <progress value={progress} max={1}>{(progress * 100).toFixed(0)}%</progress>
  </div>
</article>

<style>
  article.discipline-card {
    cursor: pointer;
  }
  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .card-footer progress {
    flex: 1;
  }
</style>
