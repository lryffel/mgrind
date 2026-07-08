<script lang="ts">
  import type { Snippet } from 'svelte';

  let { show, onclose, children, footer }: {
    show: boolean;
    onclose?: () => void;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  let dialogEl = $state<HTMLDialogElement>();

  $effect(() => {
    if (show) {
      dialogEl?.showModal();
    } else {
      dialogEl?.close();
    }
  });

  function handleClose() {
    if (show) onclose?.();
  }
</script>

<dialog bind:this={dialogEl} onclose={handleClose}>
  <article>
    {@render children?.()}
    {#if footer}
      <footer>
        {@render footer()}
      </footer>
    {/if}
  </article>
</dialog>

<style>
  :global(.danger) {
    --pico-background-color: var(--pico-del-color);
    --pico-border-color: var(--pico-del-color);
    --pico-color: var(--pico-color-light);
  }
  :global(.danger:hover) {
    --pico-background-color: var(--pico-del-color);
    --pico-border-color: var(--pico-del-color);
  }
</style>
