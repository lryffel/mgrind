<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress, getComplexity } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { isDisabled, toggleDisabled, enableType } from '../disabledTypes.svelte';
  import { arePrerequisitesMet, getUnmetPrerequisites, enablePrerequisites } from '../prerequisites.svelte';
  import Modal from './Modal.svelte';

  let { discipline, onclick }: { discipline: Discipline; onclick: () => void } = $props();
  let progress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let types = $derived(discipline.exerciseTypeIds.map((id) => exerciseTypes[id]).filter(Boolean));
  let anyDisabled = $derived(types.some((t) => isDisabled(t.id)));
  let open = $state(false);
  let lockedTypeId = $state<string | null>(null);

  let lockedType = $derived(lockedTypeId ? exerciseTypes[lockedTypeId] : null);
  let unmet = $derived(lockedTypeId ? getUnmetPrerequisites(lockedTypeId) : []);

  function handleRow(typeId: string, e: Event) {
    e.stopPropagation();
    if (!arePrerequisitesMet(typeId)) {
      lockedTypeId = typeId;
    } else {
      toggleDisabled(typeId, discipline);
    }
  }

  function handleEnableNow() {
    if (lockedTypeId) {
      enablePrerequisites(lockedTypeId);
      enableType(lockedTypeId);
    }
    lockedTypeId = null;
  }

  function closeDialog() {
    lockedTypeId = null;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="discipline-card" {onclick} onkeydown={(e) => e.key === 'Enter' && onclick()} tabindex="0">
  <h2>{_(discipline.nameKey)}</h2>
  <button
    class="gear-button"
    class:warning={anyDisabled}
    onclick={(e) => {
      e.stopPropagation();
      open = !open;
    }}
    onkeydown={(e) => {
      e.stopPropagation();
      if (e.key === 'Enter') open = !open;
    }}
    aria-label={_('exerciseTypes')}
  >
    {open ? '⌄' : '⌃'}
  </button>
  {#if open}
    <div class="type-list">
      {#each types as type (type.id)}
        {@const complexity = getComplexity(type.id)}
        {@const disabled = isDisabled(type.id)}
        {@const locked = !arePrerequisitesMet(type.id)}
        <div
          class="type-row outline"
          class:disabled={disabled && !locked}
          class:locked
          onclick={(e) => handleRow(type.id, e)}
          onkeydown={(e) => e.key === 'Enter' && handleRow(type.id, e)}
          tabindex="0"
          role="button"
        >
          <span class="type-name">{locked ? '🔒 ' : ''}{_(type.nameKey)}</span>
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

<Modal show={lockedTypeId !== null} onclose={closeDialog}>
  {#snippet footer()}
    <button class="outline" onclick={closeDialog}>{_('back')}</button>
    <button class="danger" onclick={handleEnableNow}>{_('exercise.enableNow')}</button>
  {/snippet}
  <header>
    <h3>{_('exercise.prerequisitesNotMet')}</h3>
  </header>
  {#if lockedType}
    <p><strong>{_(lockedType.nameKey)}</strong></p>
    <ul>
      {#each unmet as u (u.typeId)}
        <li>{_('exercise.prerequisiteLine', _(u.nameKey), u.complexity, u.current)}</li>
      {/each}
    </ul>
    <p class="warning-text">{_('exercise.enableNow.warning')}</p>
  {/if}
</Modal>

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
    color: var(--pico-muted-color);
  }
  .gear-button.warning {
    color: var(--pico-del-color);
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
    border-radius: var(--pico-border-radius);
    cursor: pointer;
    color: inherit;
  }
  .type-row.outline {
    border: none;
  }
  .type-row:hover {
    background: var(--pico-table-row-stripped-background);
  }
  .type-row.disabled {
    opacity: 0.5;
    text-decoration: line-through;
  }
  .type-row.locked {
    opacity: 0.5;
  }
  .type-name {
    flex: 0 0 11rem;
    color: var(--pico-color);
    text-align: left;
  }
  .type-row progress {
    flex: 1;
  }
  .type-complexity {
    flex: 0 0 3rem;
    text-align: right;
    font-size: 0.8rem;
    color: var(--pico-muted-color);
  }
  .warning-text {
    color: var(--pico-del-color);
    font-size: 0.85rem;
  }
</style>
