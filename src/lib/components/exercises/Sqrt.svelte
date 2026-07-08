<script lang="ts">
  let { radicand }: { radicand: string } = $props();
</script>

<span class="sqrt">
  <span class="sqrt-symbol">&radic;</span>
  <span class="sqrt-radicand">{radicand}</span>
</span>

<style>
  .sqrt {
    display: inline-flex;
    align-items: flex-start;
  }

  .sqrt-symbol {
    font-size: 1.3em;
    line-height: 1;
  }

  .sqrt-radicand {
    border-top: 2px solid currentColor;
    padding: 0 0.15em;
    line-height: 1.3;
  }
</style>
