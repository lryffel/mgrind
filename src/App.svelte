<script lang="ts">
  import { _ } from './lib/i18n.svelte';
  import { disciplines } from './lib/data/disciplines';
  import { exerciseTypes } from './lib/data/exerciseTypes';
  import DisciplineCard from './lib/components/DisciplineCard.svelte';
  import ExerciseScreen from './lib/components/ExerciseScreen.svelte';
  import LanguageToggle from './lib/components/LanguageToggle.svelte';

  let screen = $state<'menu' | 'exercise'>('menu');
  let activeDisciplineId = $state<string | null>(null);

  let activeExerciseType = $derived(
    activeDisciplineId
      ? exerciseTypes[disciplines.find(d => d.id === activeDisciplineId)!.exerciseTypeIds[0]]
      : null
  );

  function selectDiscipline(id: string) {
    activeDisciplineId = id;
    screen = 'exercise';
  }

  function backToMenu() {
    screen = 'menu';
    activeDisciplineId = null;
  }
</script>

<header>
  <h1>{_('app.title')}</h1>
  <LanguageToggle />
</header>

<main>
  {#if screen === 'menu'}
    <section class="menu">
      <h2>{_('select.discipline')}</h2>
      <div class="discipline-list">
        {#each disciplines as discipline (discipline.id)}
          <DisciplineCard {discipline} onclick={() => selectDiscipline(discipline.id)} />
        {/each}
      </div>
    </section>
  {:else if activeExerciseType}
    <ExerciseScreen exerciseType={activeExerciseType} onBack={backToMenu} />
  {/if}
</main>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e4e7;
  }
  header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  main {
    display: flex;
    justify-content: center;
    padding: 40px 24px;
  }
  .menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .menu h2 {
    margin: 0;
    font-size: 18px;
    color: #666;
  }
  .discipline-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
</style>
