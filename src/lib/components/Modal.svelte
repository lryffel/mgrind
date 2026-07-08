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
  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  footer :global(button),
  footer :global([role="button"]) {
    flex-shrink: 0;
    margin: 0;
    padding-top: calc(var(--pico-form-element-spacing-vertical) * 0.66);
    padding-bottom: calc(var(--pico-form-element-spacing-vertical) * 0.66);
  }
  :global(.danger) {
    --pico-background-color: var(--pico-del-color, #c0392b);
    --pico-border-color: var(--pico-del-color, #c0392b);
    --pico-color: var(--pico-color-light, #fff);
  }
  :global(.danger:hover) {
    --pico-background-color: var(--pico-del-color, #e74c3c);
    --pico-border-color: var(--pico-del-color, #e74c3c);
  }
</style>
