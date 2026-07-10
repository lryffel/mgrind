<script lang="ts">
  import { renderMath, renderMathDisplay } from '../katex';

  let { expression, display = false }: { expression: string; display?: boolean } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html display ? renderMathDisplay(expression) : renderMath(expression)}
