<script lang="ts">
  import { _ } from '../i18n.svelte';
  let theme = $state(localStorage.getItem('mgrind-theme') ?? 'light');

  $effect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('mgrind-theme', theme);
    } catch {
      /* ignore */
    }
  });

  function toggle() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<button class="outline" onclick={toggle} aria-label={_('theme.toggle')}>
  {theme === 'light' ? '☾' : '☀'}
</button>
