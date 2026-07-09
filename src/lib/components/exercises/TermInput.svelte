<script lang="ts">
  import Math from '../Math.svelte';

  let {
    value = $bindable(),
    variablePart = '',
    readonly = false,
    placeholder = '?',
  }: {
    value: string;
    variablePart?: string;
    readonly?: boolean;
    placeholder?: string;
  } = $props();

  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (inputEl && !readonly) {
      const w = value.length + 1;
      inputEl.style.width = (w > 3 ? w : 3) + 'ch';
    }
  });
</script>

<span class="term">
  <input type="text" class="coeff-input" bind:value bind:this={inputEl} {placeholder} {readonly} />
  {#if variablePart}
    <Math expression={variablePart} />
  {/if}
</span>
