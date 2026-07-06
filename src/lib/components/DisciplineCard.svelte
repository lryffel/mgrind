<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import ProgressBar from './ProgressBar.svelte';

  let { discipline, onclick }: { discipline: Discipline; onclick: () => void } = $props();
  let progress = $derived(getDisciplineProgress(discipline, exerciseTypes));
</script>

<button class="card" {onclick}>
  <h2>{_(discipline.nameKey)}</h2>
  <ProgressBar value={progress} />
  <p class="progress-label">{_('progress.percent', Math.round(progress * 100))}</p>
</button>

<style>
  .card {
    display: block;
    width: 100%;
    max-width: 360px;
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
  }
  .card:hover {
    border-color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .card h2 {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 600;
  }
  .progress-label {
    margin: 8px 0 0;
    font-size: 14px;
    color: #666;
  }
</style>
