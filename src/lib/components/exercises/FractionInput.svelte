<script lang="ts">
  let {
    num = $bindable(''),
    den = $bindable(''),
  }: {
    num?: string;
    den?: string;
  } = $props();
</script>

<span class="fraction-answer-inline">
  <input type="text" inputmode="numeric" pattern="[0-9]*" class="fraction-num" bind:value={num} />
  <span class="fraction-bar"></span>
  <input type="text" inputmode="numeric" pattern="[0-9]*" class="fraction-den" bind:value={den} />
</span>

<style>
  .fraction-answer-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .fraction-answer-inline input {
    width: 5rem;
    text-align: center;
  }

  .fraction-answer-inline .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
  }

  .fraction-num {
    width: 5rem;
    text-align: center;
  }

  .fraction-den {
    width: 5rem;
    text-align: center;
  }
</style>
