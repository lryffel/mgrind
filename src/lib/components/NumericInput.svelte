<script lang="ts">
  import Math from './Math.svelte';
  import type { InputContext } from '../types';

  let {
    value = $bindable(),
    num = $bindable(),
    den = $bindable(),
    variablePart = '',
    readonly = false,
    placeholder,
    numPlaceholder,
    denPlaceholder,
    fraction = false,
    superscript = false,
    align = 'center',
    context = 'plain',
    blockSign = false,
    onkeydown,
  }: {
    value?: string;
    num?: string;
    den?: string;
    variablePart?: string;
    readonly?: boolean;
    placeholder?: string;
    numPlaceholder?: string;
    denPlaceholder?: string;
    fraction?: boolean;
    superscript?: boolean;
    align?: 'center' | 'right' | 'left';
    context?: InputContext;
    blockSign?: boolean;
    onkeydown?: (e: KeyboardEvent) => void;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (blockSign && (e.key === '-' || e.key === '+')) {
      e.preventDefault();
    }
    onkeydown?.(e);
  }

  let resolvedPlaceholder = $derived(placeholder ?? '');
  let resolvedNumPlaceholder = $derived(numPlaceholder ?? placeholder ?? '');
  let resolvedDenPlaceholder = $derived(denPlaceholder ?? placeholder ?? '');
</script>

{#if fraction}
  <span class="fraction-input">
    <input
      type="text"
      class="coeff-input"
      style="text-align: {align}"
      bind:value={num}
      placeholder={resolvedNumPlaceholder}
      {readonly}
      onkeydown={handleKeydown}
    />
    <span class="fraction-bar"></span>
    <input
      type="text"
      class="coeff-input"
      style="text-align: {align}"
      bind:value={den}
      placeholder={resolvedDenPlaceholder}
      {readonly}
      onkeydown={handleKeydown}
    />
  </span>
{:else}
  {#if superscript}
    <sup>
      <input
        type="text"
        class="coeff-input"
        style="text-align: {align}"
        bind:value
        placeholder={resolvedPlaceholder}
        {readonly}
        onkeydown={handleKeydown}
      />
    </sup>
  {:else}
    <span class="term">
      <input
        type="text"
        class="coeff-input"
        style="text-align: {align}"
        bind:value
        placeholder={resolvedPlaceholder}
        {readonly}
        onkeydown={handleKeydown}
      />
      {#if variablePart}
        <Math expression={variablePart} />
      {/if}
    </span>
  {/if}
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
    min-width: 2rem;
  }

  sup {
    font-size: 0.75em;
    position: relative;
    top: -0.65em;
    line-height: 0;
  }
</style>
