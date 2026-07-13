<script lang="ts">
  import { _ } from './lib/i18n.svelte';
  import { disciplines } from './lib/data/disciplines';
  import DisciplineCard from './lib/components/DisciplineCard.svelte';
  import ExerciseScreen from './lib/components/ExerciseScreen.svelte';
  import LanguageToggle from './lib/components/LanguageToggle.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import SettingsDropdown from './lib/components/SettingsDropdown.svelte';

  let screen = $state<'menu' | 'exercise'>('menu');
  let activeDisciplineId = $state<string | null>(null);
  let selectedTypeId = $state<string | null>(null);

  function selectDiscipline(id: string, typeId?: string) {
    activeDisciplineId = id;
    selectedTypeId = typeId ?? null;
    screen = 'exercise';
    history.pushState({ screen: 'exercise' }, '');
  }

  function backToMenu() {
    screen = 'menu';
    activeDisciplineId = null;
    selectedTypeId = null;
  }

  function handlePopstate() {
    if (screen === 'exercise') {
      backToMenu();
    }
  }
</script>

<header class="container">
  <nav>
    <ul>
      <li>
        <h1>{_('app.title')}</h1>
      </li>
    </ul>
    <ul>
      <li><ThemeToggle /></li>
      <li><LanguageToggle /></li>
      <li><SettingsDropdown /></li>
    </ul>
  </nav>
</header>

<svelte:window onpopstate={handlePopstate} />

<main class="container">
  {#if screen === 'menu'}
    <section>
      {#each disciplines as discipline (discipline.id)}
        <DisciplineCard
          {discipline}
          onclick={() => selectDiscipline(discipline.id)}
          onSelectType={(id) => selectDiscipline(discipline.id, id)}
        />
      {/each}
    </section>
  {:else if activeDisciplineId}
    <ExerciseScreen disciplineId={activeDisciplineId} onBack={backToMenu} typeId={selectedTypeId ?? undefined} />
  {/if}
</main>
