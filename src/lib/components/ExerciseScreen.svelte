<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getComplexity, getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { disciplines } from '../data/disciplines';
  import { ExerciseSession } from '../exerciseSession.svelte';
  import { instructionContext } from '../instructionContext.svelte';
  import { exerciseProgress } from '../exerciseProgressContext.svelte';
  import CardRegistry from './cards/CardRegistry.svelte';

  let { disciplineId, onBack, typeId }: { disciplineId: string; onBack: () => void; typeId?: string } = $props();

  let discipline = $derived(disciplines.find((d: Discipline) => d.id === disciplineId)!);
  let session = $state<ExerciseSession>();

  let barProgress = $derived.by(() => {
    if (session?.currentTypeId) {
      const type = exerciseTypes[session.currentTypeId];
      if (!type) return 0;
      return getComplexity(session.currentTypeId) / type.maxComplexity;
    }
    return getDisciplineProgress(discipline, exerciseTypes);
  });

  $effect(() => {
    exerciseProgress.value = barProgress;
  });

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
</nav>

{#if session}
  {@const s = session}
  {#key s.currentSeed}
    {#if s.exercise.pattern && s.exercise.pattern !== 'custom'}
      <CardRegistry
        exercise={s.exercise}
        onSubmit={(a: string) => s.submit(a)}
        onNext={() => s.next()}
        feedback={s.feedback}
      />
    {:else if s.currentType.component}
      {@const Comp = s.currentType.component}
      <Comp exercise={s.exercise} onSubmit={(a: string) => s.submit(a)} onNext={() => s.next()} feedback={s.feedback} />
    {/if}
  {/key}
{/if}
