<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const addEx1 = '\\dfrac{a}{2} + \\dfrac{a}{3} = \\dfrac{5a}{6}';
  const addEx2 = '\\dfrac{a}{3} + \\dfrac{b}{4} = \\dfrac{4a + 3b}{12}';
  const subEx = '\\dfrac{a}{3} - \\dfrac{a}{2} = -\\dfrac{a}{6}';
  const mulEx1 = '\\dfrac{a}{2} \\cdot \\dfrac{b}{3} = \\dfrac{ab}{6}';
  const mulEx2 = '\\dfrac{a}{b} \\cdot \\dfrac{c}{d} = \\dfrac{ac}{bd}';
  const divEx = '\\dfrac{a}{3} \\div \\dfrac{a}{4} = \\dfrac{4}{3}';
  const combEx = '\\dfrac{x+1}{3} + \\dfrac{x-1}{4} = \\dfrac{7x+1}{12}';
  const fracHalf = '\\dfrac{1}{2}';
  const fracThird = '\\dfrac{1}{3}';
  const fracQuart = '\\dfrac{1}{4}';
</script>

{#if state.lang === 'en'}
  <p>Perform the given operation on the symbolic fractions. Enter the result as a reduced fraction.</p>
  <p>
    Enter the numerator coefficient above the fraction bar and the denominator coefficient below. For multiple terms in
    the numerator, enter each coefficient in its corresponding field.
  </p>

  <p><strong>Examples:</strong></p>
  <ul>
    <li>
      <Math expression={addEx1} /> &rarr; numerator: <Math expression="5" />, denominator: <Math expression="6" />
    </li>
    <li>
      <Math expression={subEx} /> &rarr; numerator: <Math expression="-1" />, denominator: <Math expression="6" />
    </li>
    <li>
      <Math expression={mulEx1} /> &rarr; numerator: <Math expression="1" /> with part <Math expression="ab" />,
      denominator: <Math expression="6" />
    </li>
    <li>
      <Math expression={mulEx2} /> &rarr; numerator: <Math expression="1" /> with part <Math expression="ac" />,
      denominator: <Math expression="1" /> with part <Math expression="bd" />
    </li>
    <li><Math expression={divEx} /> &rarr; numerator: <Math expression="4" />, denominator: <Math expression="3" /></li>
    <li>
      <Math expression={addEx2} /> &rarr; numerator: <Math expression="4" /> for <Math expression="a" /> and <Math
        expression="3"
      /> for <Math expression="b" />, denominator: <Math expression="12" />
    </li>
    <li>
      <Math expression={combEx} /> &rarr; numerator: <Math expression="7" /> for <Math expression="x" /> and <Math
        expression="1"
      />, denominator: <Math expression="12" />
    </li>
  </ul>

  <p>
    All results must be reduced fractions. If the result is a constant like <Math expression={fracHalf} /> or
    <Math expression="-3" />, enter it in the numerator and denominator fields as usual.
  </p>
{:else}
  <p>Führe die angegebene Operation mit den symbolischen Brüchen durch. Gib das Ergebnis als gekürzten Bruch ein.</p>
  <p>
    Gib den Zählerkoeffizienten über dem Bruchstrich und den Nennerkoeffizienten darunter ein. Bei mehreren Termen im
    Zähler gib jeden Koeffizienten in sein entsprechendes Feld ein.
  </p>

  <p><strong>Beispiele:</strong></p>
  <ul>
    <li><Math expression={addEx1} /> &rarr; Zähler: <Math expression="5" />, Nenner: <Math expression="6" /></li>
    <li><Math expression={subEx} /> &rarr; Zähler: <Math expression="-1" />, Nenner: <Math expression="6" /></li>
    <li>
      <Math expression={mulEx1} /> &rarr; Zähler: <Math expression="1" /> mit Teil <Math expression="ab" />, Nenner: <Math
        expression="6"
      />
    </li>
    <li>
      <Math expression={mulEx2} /> &rarr; Zähler: <Math expression="1" /> mit Teil <Math expression="ac" />, Nenner: <Math
        expression="1"
      /> mit Teil <Math expression="bd" />
    </li>
    <li><Math expression={divEx} /> &rarr; Zähler: <Math expression="4" />, Nenner: <Math expression="3" /></li>
    <li>
      <Math expression={addEx2} /> &rarr; Zähler: <Math expression="4" /> für <Math expression="a" /> und <Math
        expression="3"
      /> für <Math expression="b" />, Nenner: <Math expression="12" />
    </li>
    <li>
      <Math expression={combEx} /> &rarr; Zähler: <Math expression="7" /> für <Math expression="x" /> und <Math
        expression="1"
      />, Nenner: <Math expression="12" />
    </li>
  </ul>

  <p>
    Alle Ergebnisse müssen gekürzte Brüche sein. Wenn das Ergebnis eine Konstante wie <Math expression={fracHalf} /> oder
    <Math expression="-3" /> ist, gib sie wie gewohnt in die Zähler- und Nennerfelder ein.
  </p>
{/if}
