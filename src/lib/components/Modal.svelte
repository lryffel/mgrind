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
      document.documentElement.classList.add('modal-is-open');
      dialogEl?.showModal();
    } else {
      document.documentElement.classList.remove('modal-is-open');
      dialogEl?.close();
    }
  })

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogEl && show) {
      onclose?.();
    }
  }

  function handleClose() {
    if (show) onclose?.();
  }
</script>

<dialog bind:this={dialogEl} onclick={handleBackdropClick} onclose={handleClose}>
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
