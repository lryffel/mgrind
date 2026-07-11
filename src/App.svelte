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
        <h1 class="rainbow-logo">
          <span class="c0">m</span><span class="c1">g</span><span class="c2">r</span><span class="c3">i</span><span
            class="c4">n</span
          ><span class="c5">d</span>
        </h1>
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

<style>
  .rainbow-logo {
    letter-spacing: 0.05em;
  }
  .rainbow-logo span {
    display: inline-block;
  }
  :global([data-theme='light']) .rainbow-logo .c0 {
    color: #dc2626;
  }
  :global([data-theme='light']) .rainbow-logo .c1 {
    color: #ea580c;
  }
  :global([data-theme='light']) .rainbow-logo .c2 {
    color: #ca8a04;
  }
  :global([data-theme='light']) .rainbow-logo .c3 {
    color: #16a34a;
  }
  :global([data-theme='light']) .rainbow-logo .c4 {
    color: #2563eb;
  }
  :global([data-theme='light']) .rainbow-logo .c5 {
    color: #9333ea;
  }

  :global([data-theme='dark']) .rainbow-logo .c0 {
    color: #ef4444;
  }
  :global([data-theme='dark']) .rainbow-logo .c1 {
    color: #f97316;
  }
  :global([data-theme='dark']) .rainbow-logo .c2 {
    color: #eab308;
  }
  :global([data-theme='dark']) .rainbow-logo .c3 {
    color: #22c55e;
  }
  :global([data-theme='dark']) .rainbow-logo .c4 {
    color: #3b82f6;
  }
  :global([data-theme='dark']) .rainbow-logo .c5 {
    color: #a855f7;
  }
</style>
