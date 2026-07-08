<script lang="ts">
  import { renderMath } from '../katex';

  let { expression }: { expression: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html renderMath(expression)}
