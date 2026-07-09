<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '3x(2x + 5)';
  const ex1Result = '6x^{2} + 15x';
  const ex2 = '(x + y)(x + y + z)';
  const ex2Result = 'x^{2} + 2xy + y^{2} + xz + yz';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise asks you to expand a product of algebraic expressions by multiplying out
    term by term.
  </p>
  <p>To solve, follow these steps:</p>
  <ol>
    <li>
      <strong>Multiply each term</strong> of the first factor by each term of the second factor.
      For example, in <Math expression={ex1} />, multiply <Math expression="3x" /> by both
      <Math expression="2x" /> and <Math expression="5" /> to get <Math expression={ex1Result} />.
    </li>
    <li>
      <strong>Combine like terms</strong> — if two different products produce the same variable
      part, add their coefficients together. For example, in <Math expression={ex2} />, the product
      <Math expression="x \cdot y" /> and <Math expression="y \cdot x" /> both produce
      <Math expression="xy" />, giving <Math expression="2xy" />. The result is
      <Math expression={ex2Result} />.
    </li>
    <li>
      <strong>Enter the coefficients</strong> — for each variable part in the order shown, type the
      coefficient. For <Math expression={ex1Result} /> you would enter <Math expression="6" /> for
      <Math expression={'x^{2}'} /> and <Math expression="15" /> for <Math expression="x" />.
    </li>
  </ol>
{:else}
  <p>
    In dieser Übung musst du ein Produkt von algebraischen Ausdrücken ausmultiplizieren,
    indem du Term für Term multiplizierst.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Multipliziere jeden Term</strong> des ersten Faktors mit jedem Term des zweiten
      Faktors. Zum Beispiel in <Math expression={ex1} /> multiplizierst du <Math expression="3x" />
      sowohl mit <Math expression="2x" /> als auch mit <Math expression="5" /> und erhältst
      <Math expression={ex1Result} />.
    </li>
    <li>
      <strong>Fasse gleiche Terme zusammen</strong> — wenn zwei verschiedene Produkte denselben
      Variablenteil ergeben, addiere ihre Koeffizienten. In <Math expression={ex2} /> ergeben
      <Math expression="x \cdot y" /> und <Math expression="y \cdot x" /> beide
      <Math expression="xy" />, also <Math expression="2xy" />. Das Ergebnis ist
      <Math expression={ex2Result} />.
    </li>
    <li>
      <strong>Gib die Koeffizienten ein</strong> — für jeden Variablenteil in der angezeigten
      Reihenfolge den Koeffizienten eintragen. Für <Math expression={ex1Result} /> würdest du
      <Math expression="6" /> für <Math expression={'x^{2}'} /> und <Math expression="15" /> für
      <Math expression="x" /> eingeben.
    </li>
  </ol>
{/if}
