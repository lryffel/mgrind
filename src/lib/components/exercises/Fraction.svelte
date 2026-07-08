<script lang="ts">
  let { num, den }: { num: number | string; den: number | string } = $props();
</script>

<span class="fraction">
  <span class="num">{num}</span>
  <span class="fraction-bar"></span>
  <span class="den">{den}</span>
</span>

<style>
  .fraction {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
  }

  .fraction .num,
  .fraction .den {
    padding: 0 0.5rem;
  }

  .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
  }
</style>
