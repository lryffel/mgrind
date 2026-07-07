<script lang="ts">
  let { value = 0 }: { value: number } = $props();
</script>

<progress {value} max={1}>{(value * 100).toFixed(0)}%</progress>
