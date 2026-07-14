<script lang="ts">
  import type { InputContext } from '../types';
  import NumericInput from './NumericInput.svelte';

  let {
    value = $bindable(),
    variablePart = '',
    context: explicitContext,
  }: {
    value?: string;
    variablePart?: string;
    context?: InputContext;
  } = $props();

  let context = $derived(
    explicitContext ?? (variablePart === '' ? ('summand' as InputContext) : ('coefficient' as InputContext)),
  );
</script>

<span class="coeff-field">
  <NumericInput bind:value {variablePart} {context} />
</span>
