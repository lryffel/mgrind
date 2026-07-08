<script lang="ts">
  import type { Discipline } from '../types';
  import { _ } from '../i18n.svelte';
  import { getDisciplineProgress } from '../progress.svelte';
  import { exerciseTypes } from '../data/exerciseTypes';
  import { disciplines } from '../data/disciplines';
  import { ExerciseSession } from '../exerciseSession.svelte';

  let { disciplineId, onBack }: { disciplineId: string; onBack: () => void } = $props();

  let discipline = $derived(disciplines.find((d: Discipline) => d.id === disciplineId)!);
  let disciplineProgress = $derived(getDisciplineProgress(discipline, exerciseTypes));
  let session = $state<ExerciseSession>();

  $effect(() => {
    if (!session || disciplineId !== session.disciplineId) {
      session = new ExerciseSession(disciplineId);
    }
  });
</script>

<nav>
  <ul>
    <li><button class="outline" onclick={onBack}>{_('back')}</button></li>
  </ul>
  <ul>
    <li><progress value={disciplineProgress} max={1}>{(disciplineProgress * 100).toFixed(0)}%</progress></li>
  </ul>
</nav>

<article>
  {#if session}
    {@const s = session}
    {#key s.currentSeed}
      {@const Comp = s.currentType.component}
      <Comp exercise={s.exercise} onSubmit={(a: string) => s.submit(a)} onNext={() => s.next()} feedback={s.feedback} />
    {/key}
  {/if}
</article>
