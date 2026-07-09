<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const exBefore = '12x^{2} + 8x';
  const exAfter = '4x(3x + 2)';
  const div1 = '12x^{2} \\div 4x = 3x';
  const div2 = '8x \\div 4x = 2';
  const exTrap = '5x + 7';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise you are given a polynomial expression and need to factor out the greatest common divisor (gcd).
    Sometimes there is no common factor — these are "trap" exercises where the expression cannot be factored further.
  </p>
  <p>Follow these steps:</p>
  <ol>
    <li>
      <strong>Find the gcd of the coefficients</strong> — for example, in <Math expression={exBefore} />, the
      coefficients are 12 and 8. Their greatest common divisor is 4.
    </li>
    <li>
      <strong>Find the common variables with the smallest exponent</strong> — both terms contain <Math
        expression={'x'}
      />, and the smallest exponent is 1. So the variable part of the gcd is <Math expression={'x'} />.
    </li>
    <li><strong>Combine the numeric and variable parts</strong> — the full gcd is <Math expression={'4x'} />.</li>
    <li><strong>Divide each term by the gcd</strong> — <Math expression={div1} /> and <Math expression={div2} />.</li>
    <li>
      <strong>Write the result</strong> — as gcd times the inner expression in parentheses: <Math
        expression={exAfter}
      />.
    </li>
  </ol>
  <p>If there is no common factor — for example <Math expression={exTrap} /> — select "no factor" from the dropdown.</p>
  <p>Verify your answer by expanding the result — you should get back the original expression.</p>
{:else}
  <p>
    Bei dieser Übung erhältst du einen Polynomterm und musst den grössten gemeinsamen Teiler (ggT) ausklammern. Manchmal
    gibt es keinen gemeinsamen Faktor — das sind «Fallen», bei denen der Term nicht weiter faktorisiert werden kann.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Finde den ggT der Koeffizienten</strong> — zum Beispiel bei <Math expression={exBefore} /> sind die Koeffizienten
      12 und 8. Ihr grösster gemeinsamer Teiler ist 4.
    </li>
    <li>
      <strong>Finde die gemeinsamen Variablen mit dem kleinsten Exponenten</strong> — beide Terme enthalten <Math
        expression={'x'}
      />, und der kleinste Exponent ist 1. Der variable Teil des ggT ist also <Math expression={'x'} />.
    </li>
    <li>
      <strong>Kombiniere den numerischen und den variablen Teil</strong> — der vollständige ggT ist <Math
        expression={'4x'}
      />.
    </li>
    <li>
      <strong>Dividiere jeden Term durch den ggT</strong> — <Math expression={div1} /> und <Math expression={div2} />.
    </li>
    <li><strong>Schreibe das Ergebnis</strong> — als ggT mal Klammerausdruck: <Math expression={exAfter} />.</li>
  </ol>
  <p>
    Wenn es keinen gemeinsamen Faktor gibt — zum Beispiel <Math expression={exTrap} /> — wähle «kein Faktor» aus dem Auswahlmenü.
  </p>
  <p>
    Überprüfe deine Antwort, indem du das Ergebnis ausmultiplizierst — du solltest den ursprünglichen Term erhalten.
  </p>
{/if}
