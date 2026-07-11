<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress, getComplexity } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { isDisabled, toggleDisabled, enableType } from '../disabledTypes.svelte';
  import { arePrerequisitesMet, getUnmetPrerequisites, enablePrerequisites } from '../prerequisites.svelte';
  import Modal from './Modal.svelte';

  let {
    discipline,
    onclick,
    onSelectType,
  }: { discipline: Discipline; onclick: () => void; onSelectType?: (typeId: string) => void } = $props();
  let progress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let isComplete = $derived(progress >= 1);
  let types = $derived(discipline.exerciseTypeIds.map((id) => exerciseTypes[id]).filter(Boolean));
  let anyDisabled = $derived(types.some((t) => isDisabled(t.id)));
  let open = $state(false);
  let lockedTypeId = $state<string | null>(null);

  let lockedType = $derived(lockedTypeId ? exerciseTypes[lockedTypeId] : null);
  let unmet = $derived(lockedTypeId ? getUnmetPrerequisites(lockedTypeId) : []);

  function handleCheckbox(typeId: string, e: Event) {
    e.stopPropagation();
    if (!arePrerequisitesMet(typeId)) {
      lockedTypeId = typeId;
    } else {
      toggleDisabled(typeId, discipline);
    }
  }

  function handleRowClick(typeId: string, e: Event) {
    e.stopPropagation();
    if (!arePrerequisitesMet(typeId)) {
      lockedTypeId = typeId;
    } else {
      onSelectType?.(typeId);
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

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article class="discipline-card" class:complete={isComplete} role="link" {onclick} onkeydown={(e) => e.key === 'Enter' && onclick()} tabindex="0">
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
          class="type-row"
          class:disabled={disabled && !locked}
          class:locked
          onclick={(e) => handleRowClick(type.id, e)}
          onkeydown={(e) => e.key === 'Enter' && handleRowClick(type.id, e)}
          tabindex="0"
          role="button"
        >
          <input
            type="checkbox"
            checked={!disabled}
            disabled={locked}
            onclick={(e) => handleCheckbox(type.id, e)}
            onkeydown={(e) => e.key === 'Enter' && handleCheckbox(type.id, e)}
            tabindex="-1"
            aria-label={_(type.nameKey)}
          />
          <span class="type-name" title={_(type.nameKey)}>{locked ? '🔒 ' : ''}{_(type.nameKey)}</span>
          <div class="progress-bar" class:full={complexity >= type.maxComplexity} role="progressbar" aria-valuenow={complexity / type.maxComplexity} aria-valuemin="0" aria-valuemax="1">
            <div class="progress-gradient" style="clip-path: inset(0 {100 - complexity / type.maxComplexity * 100}% 0 0 round 0.3125rem)"></div>
          </div>
          <span class="type-complexity">{complexity}/{type.maxComplexity}</span>
        </div>
      {/each}
    </div>
  {/if}
  <div class="card-footer">
    <div class="progress-bar" class:full={isComplete} role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="1">
      <div class="progress-gradient" style="clip-path: inset(0 {100 - progress * 100}% 0 0 round 0.3125rem)"></div>
    </div>
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
    color: var(--c-text-muted);
  }
  .gear-button.warning {
    color: var(--c-incorrect);
  }
</style>
