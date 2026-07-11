<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { disciplines } from '../data/disciplines';
  import { ExerciseSession } from '../exerciseSession.svelte';
  import { instructionContext } from '../instructionContext.svelte';

  let { disciplineId, onBack, typeId }: { disciplineId: string; onBack: () => void; typeId?: string } = $props();

  let discipline = $derived(disciplines.find((d: Discipline) => d.id === disciplineId)!);
  let disciplineProgress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let session = $state<ExerciseSession>();

  $effect(() => {
    if (!session || disciplineId !== session.disciplineId) {
      session = new ExerciseSession(disciplineId, typeId);
    }
    instructionContext.currentInstructionComponent = session?.currentType?.instructionComponent;
  });
</script>

<nav>
  <ul>
    <li><button class="outline" onclick={onBack}>{_('back')}</button></li>
  </ul>
  <ul>
    <li>
      <div class="progress-bar" class:full={disciplineProgress >= 1} role="progressbar" aria-valuenow={disciplineProgress} aria-valuemin="0" aria-valuemax="1">
        <div class="progress-gradient" style="clip-path: inset(0 {100 - disciplineProgress * 100}% 0 0 round 0.3125rem)"></div>
      </div>
    </li>
  </ul>
</nav>

{#if session}
  {@const s = session}
  {#key s.currentSeed}
    {@const Comp = s.currentType.component}
    <Comp exercise={s.exercise} onSubmit={(a: string) => s.submit(a)} onNext={() => s.next()} feedback={s.feedback} />
  {/key}
{/if}
