<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '2x(3x+1) - x(x+4)';
  const ex1Result = '5x^{2} - 2x';
  const ex2 = '(a+b)^{2} + (a-b)^{2}';
  const ex2Result = '2a^{2} + 2b^{2}';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise asks you to expand products and collect like terms. You will see an
    expression that combines two or more products with <Math expression="+" /> or
    <Math expression="-" />.
  </p>
  <p>To solve, follow these steps:</p>
  <ol>
    <li>
      <strong>Expand each product</strong> individually by multiplying out term by term.
      For example, in <Math expression={ex1} />, expand <Math expression="2x(3x+1)" /> to
      <Math expression={'6x^{2} + 2x'} /> and <Math expression="x(x+4)" /> to
      <Math expression={'x^{2} + 4x'} />.
    </li>
    <li>
      <strong>Combine like terms</strong> across the whole expression. In the example,
      <Math expression={'6x^{2} - x^{2} = 5x^{2}'} /> and
      <Math expression="2x - 4x = -2x" />, giving <Math expression={ex1Result} />.
    </li>
    <li>
      <strong>Enter the coefficients</strong> for each variable part in the order shown.
    </li>
  </ol>
  <p>
    Another example: <Math expression={ex2} /> expands to
    <Math expression={ex2Result} />.
  </p>
{:else}
  <p>
    In dieser Übung musst du Produkte ausmultiplizieren und gleiche Terme zusammenfassen.
    Du siehst einen Ausdruck, der zwei oder mehr Produkte mit <Math expression="+" /> oder
    <Math expression="-" /> kombiniert.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Multipliziere jedes Produkt</strong> einzeln aus. In
      <Math expression={ex1} /> wird <Math expression="2x(3x+1)" /> zu
      <Math expression={'6x^{2} + 2x'} /> und <Math expression="x(x+4)" /> zu
      <Math expression={'x^{2} + 4x'} />.
    </li>
    <li>
      <strong>Fasse gleiche Terme</strong> im gesamten Ausdruck zusammen. Im Beispiel
      ergibt <Math expression={'6x^{2} - x^{2} = 5x^{2}'} /> und
      <Math expression="2x - 4x = -2x" />, also <Math expression={ex1Result} />.
    </li>
    <li>
      <strong>Gib die Koeffizienten</strong> für jeden Variablenteil in der angezeigten
      Reihenfolge ein.
    </li>
  </ol>
  <p>
    Ein weiteres Beispiel: <Math expression={ex2} /> wird zu
    <Math expression={ex2Result} /> ausmultipliziert.
  </p>
{/if}
