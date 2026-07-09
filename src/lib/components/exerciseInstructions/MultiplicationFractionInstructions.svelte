<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '\\frac{2}{3} \\cdot \\frac{4}{5} = \\frac{2 \\cdot 4}{3 \\cdot 5} = \\frac{8}{15}';
  const ex2noCancel = '\\frac{3 \\cdot 8}{4 \\cdot 9} = \\frac{24}{36} = \\frac{2}{3}';
  const ex2Cancel = '\\frac{1 \\cdot 2}{1 \\cdot 3} = \\frac{2}{3}';
  const ex2 = '\\frac{3}{4} \\cdot \\frac{8}{9}';
</script>

{#if state.lang === 'en'}
  <p>In this exercise, you will multiply two fractions and simplify the result to lowest terms.</p>
  <p>Follow these steps:</p>
  <ol>
    <li><strong>Multiply the numerators</strong> — multiply the two numerators together to get the new numerator.</li>
    <li>
      <strong>Multiply the denominators</strong> — multiply the two denominators together to get the new denominator.
    </li>
    <li>
      <strong>Simplify</strong> — reduce the resulting fraction to lowest terms by dividing numerator and denominator by their
      gcd.
    </li>
  </ol>
  <p>
    For example, <Math expression={ex1} />. Since 8 and 15 have no common factors, the fraction is already simplified.
  </p>
  <p>
    <strong>Cross-cancellation (shortcut):</strong> Before multiplying, look for common factors between any numerator and
    any denominator. Cancel them by dividing both by their gcd. This makes the numbers smaller and may eliminate the need
    to simplify afterwards.
  </p>
  <p>For example, <Math expression={ex2} />:</p>
  <ul>
    <li>Without cross-cancellation: <Math expression={ex2noCancel} /></li>
    <li>
      With cross-cancellation: The numerator 3 and denominator 9 share a factor of 3, so <Math
        expression={'3 \\div 3 = 1'}
      /> and <Math expression={'9 \\div 3 = 3'} />. The numerator 8 and denominator 4 share a factor of 4, so <Math
        expression={'8 \\div 4 = 2'}
      /> and <Math expression={'4 \\div 4 = 1'} />. Now multiply: <Math expression={ex2Cancel} />
    </li>
  </ul>
  <p>Enter the numerator and denominator of the simplified result.</p>
{:else}
  <p>In dieser Übung multiplizierst du zwei Brüche und kürzt das Ergebnis vollständig.</p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Zähler multiplizieren</strong> — multipliziere die beiden Zähler miteinander, um den neuen Zähler zu erhalten.
    </li>
    <li>
      <strong>Nenner multiplizieren</strong> — multipliziere die beiden Nenner miteinander, um den neuen Nenner zu erhalten.
    </li>
    <li>
      <strong>Kürzen</strong> — kürze den resultierenden Bruch vollständig, indem du Zähler und Nenner durch ihren ggT teilst.
    </li>
  </ol>
  <p>
    Zum Beispiel: <Math expression={ex1} />. Da 8 und 15 keine gemeinsamen Teiler haben, ist der Bruch bereits gekürzt.
  </p>
  <p>
    <strong>Kürzen vor dem Multiplizieren (Abkürzung):</strong> Bevor du multiplizierst, suche nach gemeinsamen Faktoren zwischen
    einem beliebigen Zähler und einem beliebigen Nenner. Kürze sie, indem du beide durch ihren ggT teilst. Das macht die Zahlen
    kleiner und kann das Kürzen nach der Multiplikation überflüssig machen.
  </p>
  <p>Zum Beispiel <Math expression={ex2} />:</p>
  <ul>
    <li>Ohne Kürzen vor dem Multiplizieren: <Math expression={ex2noCancel} /></li>
    <li>
      Mit Kürzen vor dem Multiplizieren: Der Zähler 3 und der Nenner 9 haben den gemeinsamen Teiler 3, also <Math
        expression={'3 \\div 3 = 1'}
      /> und <Math expression={'9 \\div 3 = 3'} />. Der Zähler 8 und der Nenner 4 haben den gemeinsamen Teiler 4, also <Math
        expression={'8 \\div 4 = 2'}
      /> und <Math expression={'4 \\div 4 = 1'} />. Jetzt multiplizieren: <Math expression={ex2Cancel} />
    </li>
  </ul>
  <p>Gib den Zähler und den Nenner des gekürzten Ergebnisses ein.</p>
{/if}
