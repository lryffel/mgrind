<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress, getComplexity } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { isDisabled, toggleDisabled } from '../disabledTypes.svelte';

  let { discipline, onclick }: { discipline: Discipline; onclick: () => void } = $props();
  let progress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let types = $derived(discipline.exerciseTypeIds.map((id) => exerciseTypes[id]).filter(Boolean));
  let anyDisabled = $derived(types.some((t) => isDisabled(t.id)));
  let open = $state(false);

  function handleToggle(typeId: string) {
    toggleDisabled(typeId, discipline);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="discipline-card" {onclick} onkeydown={(e) => e.key === 'Enter' && onclick()} tabindex="0">
  <h2>{_(discipline.nameKey)}</h2>
  <button
    class="gear-button"
    class:warning={anyDisabled}
    onclick={(e) => { e.stopPropagation(); open = !open; }}
    onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') open = !open; }}
    aria-label={_('exerciseTypes')}
  >
    ⚙
  </button>
  {#if open}
    <div class="type-list">
      {#each types as type (type.id)}
        {@const complexity = getComplexity(type.id)}
        {@const disabled = isDisabled(type.id)}
        <div
          class="type-row"
          class:disabled
          onclick={(e) => { e.stopPropagation(); handleToggle(type.id); }}
          onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleToggle(type.id); }}
          tabindex="0"
          role="button"
          aria-pressed={!disabled}
        >
          <span class="type-name">{_(type.nameKey)}</span>
          <progress value={complexity / type.maxComplexity} max={1}></progress>
          <span class="type-complexity">{complexity}/{type.maxComplexity}</span>
        </div>
      {/each}
    </div>
  {/if}
  <div class="card-footer">
    <progress value={progress} max={1}>{(progress * 100).toFixed(0)}%</progress>
  </div>
</article>

<style>
  article.discipline-card {
    cursor: pointer;
    position: relative;
  }
  .gear-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    color: var(--pico-muted-color, #888);
  }
  .gear-button.warning {
    color: var(--pico-del-color, #c0392b);
  }
  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .card-footer progress {
    flex: 1;
  }
  .type-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 0;
  }
  .type-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--pico-border-radius, 0.25rem);
    cursor: pointer;
    text-align: left;
    background: none;
    border: none;
  }
  .type-row:hover {
    background: var(--pico-table-row-stripped-background, rgba(0,0,0,0.03));
  }
  .type-row.disabled {
    opacity: 0.5;
    text-decoration: line-through;
  }
  .type-name {
    flex: 0 0 10rem;
  }
  .type-row progress {
    flex: 1;
  }
  .type-complexity {
    flex: 0 0 3rem;
    text-align: right;
    font-size: 0.8rem;
    color: var(--pico-muted-color, #888);
  }
</style>
