<script lang="ts">
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

<button class="outline" onclick={toggle} aria-label="Toggle theme">
  {theme === 'light' ? '☾' : '☀'}
</button>

<style>
  button {
    width: 2.5rem;
    text-align: center;
  }
</style>
