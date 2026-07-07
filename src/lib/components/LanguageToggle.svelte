<script lang="ts">
  import { state, setLang, _ } from '../i18n.svelte';
</script>

<button class="outline" onclick={() => setLang(state.lang === 'en' ? 'de' : 'en')}>
  {_('lang.switch')}
</button>
