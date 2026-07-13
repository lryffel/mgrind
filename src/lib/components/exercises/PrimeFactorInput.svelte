<script lang="ts">
  import Math from '../Math.svelte';
  import NumericInput from './NumericInput.svelte';

  let {
    primes,
    values = $bindable([]),
    readonly = false,
    onkeydown,
  }: {
    primes: number[];
    values?: string[];
    readonly?: boolean;
    onkeydown?: (i: number, e: KeyboardEvent) => void;
  } = $props();
</script>

{#each primes as prime, i (prime)}
  {#if i > 0}
    <Math expression="\cdot" />
  {/if}
  <span class="prime-term">
    <Math expression={String(prime)} />
    <NumericInput
      bind:value={values[i]}
      superscript
      context="exponent"
      {readonly}
      onkeydown={(e: KeyboardEvent) => onkeydown?.(i, e)}
    />
  </span>
{/each}

<style>
  .prime-term {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
</style>
