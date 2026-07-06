<script lang="ts">
  import { state, setLang, _ } from '../i18n.svelte';
</script>

<button class="lang-toggle" onclick={() => setLang(state.lang === 'en' ? 'de' : 'en')}>
  {_('lang.switch')}
</button>

<style>
  .lang-toggle {
    padding: 6px 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }
  .lang-toggle:hover {
    background: #f0f0f0;
  }
</style>
