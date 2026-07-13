<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const frac1 = '\\dfrac{a-b}{b-a}';
  const frac2 = '\\dfrac{2a}{4a}';
  const half = '\\dfrac{1}{2}';
  const frac3 = '\\dfrac{a^{2}-b^{2}}{a-b}';
  const frac4 = '\\dfrac{a^{2}-b^{2}}{a+b}';
  const binom1 = '(a + b)^{2} = a^{2} + 2ab + b^{2}';
  const binom2 = '(a - b)^{2} = a^{2} - 2ab + b^{2}';
  const binom3 = '(a + b)(a - b) = a^{2} - b^{2}';
  const ident = '(a - b)^{2} = (b - a)^{2}';
</script>

{#if state.lang === 'en'}
  <p>
    Simplify the symbolic fraction as much as possible. Factor out common factors (numbers and variables) in the
    numerator and denominator and cancel them. Use the binomial formulas and sign rules where applicable.
  </p>

  <p><strong>Binomial formulas:</strong></p>
  <ol>
    <li><Math expression={binom1} /></li>
    <li><Math expression={binom2} /></li>
    <li><Math expression={binom3} /></li>
  </ol>

  <p><strong>Sign rules:</strong></p>
  <ul>
    <li><Math expression="-(b - a) = a - b" /></li>
    <li><Math expression={ident} /></li>
  </ul>

  <p>
    Enter the simplified expression as coefficients for each variable part. For a fraction result, enter the numerator
    above the fraction bar and the denominator below. For a monomial or sum result, enter a coefficient for each
    variable part.
  </p>

  <p><strong>Examples:</strong></p>
  <ul>
    <li>
      <Math expression={frac1} /> simplifies to <Math expression="-1" /> → enter <Math expression="-1" /> in the
      numerator and <Math expression="1" /> in the denominator
    </li>
    <li>
      <Math expression={frac2} /> simplifies to <Math expression={half} /> → enter <Math expression="1" /> in the
      numerator and <Math expression="2" /> in the denominator
    </li>
    <li>
      <Math expression={frac3} /> simplifies to <Math expression="a+b" /> → enter <Math expression="1" /> for <Math
        expression="a"
      /> and <Math expression="1" /> for <Math expression="b" />
    </li>
    <li>
      <Math expression={frac4} /> simplifies to <Math expression="a-b" /> → enter <Math expression="1" /> for <Math
        expression="a"
      /> and <Math expression="-1" /> for <Math expression="b" />
    </li>
  </ul>
{:else}
  <p>
    Kürze den symbolischen Bruch so weit wie möglich. Klammere gemeinsame Faktoren (Zahlen und Variablen) in Zähler und
    Nenner aus und kürze sie. Wende wo nötig die binomischen Formeln und Vorzeichenregeln an.
  </p>

  <p><strong>Binomische Formeln:</strong></p>
  <ol>
    <li><Math expression={binom1} /></li>
    <li><Math expression={binom2} /></li>
    <li><Math expression={binom3} /></li>
  </ol>

  <p><strong>Vorzeichenregeln:</strong></p>
  <ul>
    <li><Math expression="-(b - a) = a - b" /></li>
    <li><Math expression={ident} /></li>
  </ul>

  <p>
    Gib den vereinfachten Ausdruck als Koeffizienten für jeden Variablenteil ein. Bei einem Bruch als Ergebnis gib den
    Zähler über dem Bruchstrich und den Nenner darunter ein. Bei einem Monom oder einer Summe gib einen Koeffizienten
    für jeden Variablenteil ein.
  </p>

  <p><strong>Beispiele:</strong></p>
  <ul>
    <li>
      <Math expression={frac1} /> vereinfacht zu <Math expression="-1" /> → gib <Math expression="-1" /> im Zähler
      und <Math expression="1" /> im Nenner ein
    </li>
    <li>
      <Math expression={frac2} /> vereinfacht zu <Math expression={half} /> → gib <Math expression="1" /> im Zähler
      und <Math expression="2" /> im Nenner ein
    </li>
    <li>
      <Math expression={frac3} /> vereinfacht zu <Math expression="a+b" /> → gib <Math expression="1" /> für <Math
        expression="a"
      /> und <Math expression="1" /> für <Math expression="b" /> ein
    </li>
    <li>
      <Math expression={frac4} /> vereinfacht zu <Math expression="a-b" /> → gib <Math expression="1" /> für <Math
        expression="a"
      /> und <Math expression="-1" /> für <Math expression="b" /> ein
    </li>
  </ul>
{/if}
