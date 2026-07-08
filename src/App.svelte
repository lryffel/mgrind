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

  function selectDiscipline(id: string) {
    activeDisciplineId = id;
    screen = 'exercise';
  }

  function backToMenu() {
    screen = 'menu';
    activeDisciplineId = null;
  }
</script>

<header class="container">
  <nav>
    <ul>
      <li><h1>{_('app.title')}</h1></li>
    </ul>
    <ul>
      <li><ThemeToggle /></li>
      <li><LanguageToggle /></li>
      <li><SettingsDropdown /></li>
    </ul>
  </nav>
</header>

<main class="container">
  {#if screen === 'menu'}
    <section>
      {#each disciplines as discipline (discipline.id)}
        <DisciplineCard {discipline} onclick={() => selectDiscipline(discipline.id)} />
      {/each}
    </section>
  {:else if activeDisciplineId}
    <ExerciseScreen disciplineId={activeDisciplineId} onBack={backToMenu} />
  {/if}
</main>
