<script lang="ts">
  import Math from '../Math.svelte';

  let {
    value = $bindable(),
    num = $bindable(),
    den = $bindable(),
    variablePart = '',
    readonly = false,
    placeholder = '?',
    fraction = false,
    align = 'center',
  }: {
    value?: string;
    num?: string;
    den?: string;
    variablePart?: string;
    readonly?: boolean;
    placeholder?: string;
    fraction?: boolean;
    align?: 'center' | 'right' | 'left';
  } = $props();

  let inputEl: HTMLInputElement | undefined = $state();
  let numEl: HTMLInputElement | undefined = $state();
  let denEl: HTMLInputElement | undefined = $state();

  function setWidth(el: HTMLInputElement, v: string) {
    const w = v.length + 5;
    el.style.width = (w > 5 ? w : 5) + 'ch';
  }

  $effect(() => {
    if (fraction) {
      if (numEl) setWidth(numEl, num ?? '');
      if (denEl) setWidth(denEl, den ?? '');
    } else if (inputEl) {
      setWidth(inputEl, value ?? '');
    }
  });
</script>

{#if fraction}
  <span class="fraction-input">
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      class="coeff-input"
      style="text-align: {align}"
      bind:value={num}
      bind:this={numEl}
      {placeholder}
      {readonly}
    />
    <span class="fraction-bar"></span>
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      class="coeff-input"
      style="text-align: {align}"
      bind:value={den}
      bind:this={denEl}
      {placeholder}
      {readonly}
    />
  </span>
{:else}
  <span class="term">
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      class="coeff-input"
      style="text-align: {align}"
      bind:value
      bind:this={inputEl}
      {placeholder}
      {readonly}
    />
    {#if variablePart}
      <Math expression={variablePart} />
    {/if}
  </span>
{/if}

<style>
  .fraction-input {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .fraction-input .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 3rem;
  }
</style>
