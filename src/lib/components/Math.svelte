<script lang="ts">
  import { renderMath } from '../katex';

  let { expression }: { expression: string } = $props();
</script>

{@html renderMath(expression)}
