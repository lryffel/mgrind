<script lang="ts">
  import { _ } from '../i18n.svelte';
  import type { DictKey } from '../i18n.svelte';
  import Modal from './Modal.svelte';

  let {
    messageKey,
    confirmKey,
    show,
    onConfirm,
    onCancel,
  }: {
    messageKey: DictKey;
    confirmKey: DictKey;
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();
</script>

<Modal {show} onclose={() => show && onCancel()}>
  {#snippet footer()}
    <button class="outline" onclick={onCancel}>{_('settings.cancel')}</button>
    <button class="danger" onclick={onConfirm}>{_(confirmKey)}</button>
  {/snippet}
  <p>{_(messageKey)}</p>
</Modal>
