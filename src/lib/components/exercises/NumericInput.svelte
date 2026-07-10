<script lang="ts">
  import Math from '../Math.svelte';
  import type { InputContext } from '../../types';

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
    onkeydown?: (e: KeyboardEvent) => void;
  } = $props();

  const DEFAULTS: Record<InputContext, string> = {
    coefficient: '1',
    exponent: '0',
    summand: '0',
    numerator: '0',
    denominator: '1',
    plain: '?',
  };

  let resolvedPlaceholder = $derived(placeholder ?? DEFAULTS[context]);
  let resolvedNumPlaceholder = $derived(numPlaceholder ?? placeholder ?? DEFAULTS['numerator']);
  let resolvedDenPlaceholder = $derived(denPlaceholder ?? placeholder ?? DEFAULTS['denominator']);
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
      placeholder={resolvedNumPlaceholder}
      {readonly}
      {onkeydown}
    />
    <span class="fraction-bar"></span>
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      class="coeff-input"
      style="text-align: {align}"
      bind:value={den}
      placeholder={resolvedDenPlaceholder}
      {readonly}
      {onkeydown}
    />
  </span>
{:else}
  {#if superscript}
    <sup>
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="coeff-input"
        style="text-align: {align}"
        bind:value
        placeholder={resolvedPlaceholder}
        {readonly}
        {onkeydown}
      />
    </sup>
  {:else}
    <span class="term">
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="coeff-input"
        style="text-align: {align}"
        bind:value
        placeholder={resolvedPlaceholder}
        {readonly}
        {onkeydown}
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
