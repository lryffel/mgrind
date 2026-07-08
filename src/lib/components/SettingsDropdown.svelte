<script lang="ts">
  import { _ } from '../i18n.svelte';
  import { resetProgress } from '../progress.svelte';
  import ConfirmModal from './ConfirmModal.svelte';

  let open = $state(false);
  let showConfirm = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function handleReset() {
    showConfirm = true;
    close();
  }

  function confirmReset() {
    resetProgress();
    showConfirm = false;
  }

  function cancelReset() {
    showConfirm = false;
  }
</script>

<div class="settings-wrapper">
  <button class="outline gear-btn" onclick={toggle} aria-label="Settings">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dropdown-overlay" tabindex="0" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()}></div>
    <ul class="dropdown-menu">
      <li>
        <button class="outline danger" onclick={handleReset}>{_('settings.resetProgress')}</button>
      </li>
    </ul>
  {/if}
</div>

<ConfirmModal
  messageKey="settings.resetProgress.confirm"
  confirmKey="settings.resetProgress.confirmButton"
  show={showConfirm}
  onConfirm={confirmReset}
  onCancel={cancelReset}
/>

<style>
  .settings-wrapper {
    position: relative;
  }

  .gear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
  }

  .dropdown-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    z-index: 200;
    min-width: 14rem;
    margin-top: 0.25rem;
    padding: 0.25rem 0;
    list-style: none;
    background: var(--pico-card-background-color, #fff);
    border: 1px solid var(--pico-card-border-color, #ddd);
    border-radius: var(--pico-border-radius, 0.5rem);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .dropdown-menu li {
    padding: 0;
  }

  .dropdown-menu li button {
    width: 100%;
    border: none;
    border-radius: 0;
    text-align: left;
    font-size: 0.875rem;
  }

  .dropdown-menu li button.danger {
    color: var(--pico-del-color, #c0392b);
  }
</style>
