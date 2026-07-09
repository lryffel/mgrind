<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const sciForm = 'm \\times 10^{e}';
  const sciToDecEx = '3.2 \\cdot 10^{4} = 32000';
  const decToSciEx = '0.0045 = 4.5 \\cdot 10^{-3}';
  const multEx = '(2 \\cdot 10^{3})(3 \\cdot 10^{4}) = 6 \\cdot 10^{7}';
  const addEx = '(2 \\cdot 10^{3}) + (3 \\cdot 10^{3}) = 5 \\cdot 10^{3}';
</script>

{#if state.lang === 'en'}
  <p>
    Scientific notation is a compact way to write very large or very small numbers. A number in scientific notation is
    written as <Math expression={sciForm} />, where <Math expression="1 \le m < 10" /> (the coefficient) and <Math
      expression="e"
    /> is an integer (the exponent). The exponent tells you how many places to move the decimal point.
  </p>
  <p>This exercise has several variants depending on the difficulty level:</p>
  <ul>
    <li>
      <strong>Convert scientific notation to decimal</strong> — move the decimal point as many places as the exponent
      indicates. A positive exponent makes the number larger, a negative exponent makes it smaller.<br />Example: <Math
        expression={sciToDecEx}
      />
    </li>
    <li>
      <strong>Convert decimal to scientific notation</strong> — move the decimal point so that exactly one non-zero
      digit remains to its left. Count the places moved — that number becomes the exponent. Moving left gives a positive
      exponent, moving right gives a negative exponent.<br />Example: <Math expression={decToSciEx} />
    </li>
    <li>
      <strong>Multiply</strong> — multiply the coefficients and add the exponents. Then adjust the result so the
      coefficient is between 1 and 10.<br />Example: <Math expression={multEx} />
    </li>
    <li>
      <strong>Add</strong> — first make the exponents the same by adjusting one number, then add the coefficients.
      Finally, normalise the result.<br />Example: <Math expression={addEx} />
    </li>
  </ul>
  <p>Enter the coefficient and the exponent separately in the designated fields.</p>
{:else}
  <p>
    Die wissenschaftliche Schreibweise ist eine kompakte Darstellung für sehr grosse oder sehr kleine Zahlen. Eine Zahl
    in wissenschaftlicher Schreibweise wird als <Math expression={sciForm} /> geschrieben, wobei <Math
      expression="1 \le m < 10"
    /> (der Koeffizient) und <Math expression="e" /> eine ganze Zahl (der Exponent) ist. Der Exponent gibt an, um wie viele
    Stellen das Komma verschoben wird.
  </p>
  <p>Diese Übung hat mehrere Varianten, je nach Schwierigkeitsgrad:</p>
  <ul>
    <li>
      <strong>Wissenschaftliche Schreibweise in Dezimalzahl umwandeln</strong> — verschiebe das Komma um so viele
      Stellen, wie der Exponent angibt. Ein positiver Exponent macht die Zahl grösser, ein negativer macht sie kleiner.<br
      />Beispiel: <Math expression={sciToDecEx} />
    </li>
    <li>
      <strong>Dezimalzahl in wissenschaftliche Schreibweise umwandeln</strong> — verschiebe das Komma so, dass genau
      eine Ziffer ungleich null links davon steht. Zähle die verschobenen Stellen — diese Zahl wird der Exponent.
      Verschiebung nach links ergibt einen positiven Exponenten, nach rechts einen negativen.<br />Beispiel: <Math
        expression={decToSciEx}
      />
    </li>
    <li>
      <strong>Multiplizieren</strong> — multipliziere die Koeffizienten und addiere die Exponenten. Passe das Ergebnis
      an, sodass der Koeffizient zwischen 1 und 10 liegt.<br />Beispiel: <Math expression={multEx} />
    </li>
    <li>
      <strong>Addieren</strong> — mache zuerst die Exponenten gleich, indem du eine Zahl anpasst, dann addiere die
      Koeffizienten. Normalisiere schliesslich das Ergebnis.<br />Beispiel: <Math expression={addEx} />
    </li>
  </ul>
  <p>Gib bei allen Varianten den Koeffizienten und den Exponenten in die vorgesehenen Felder ein.</p>
{/if}
