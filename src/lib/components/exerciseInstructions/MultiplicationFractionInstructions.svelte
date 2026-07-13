<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const exMulFrac = '\\frac{2}{3} \\cdot \\frac{4}{5} = \\frac{2 \\cdot 4}{3 \\cdot 5} = \\frac{8}{15}';
  const exMulFrac2 = '\\frac{3}{4} \\cdot \\frac{8}{9}';
  const exMulFrac2Cancel = '\\frac{1 \\cdot 2}{1 \\cdot 3} = \\frac{2}{3}';
  const exMulFrac2NoCancel = '\\frac{3 \\cdot 8}{4 \\cdot 9} = \\frac{24}{36} = \\frac{2}{3}';
  const exMulInt = '\\frac{2}{3} \\cdot 5 = \\frac{2 \\cdot 5}{3} = \\frac{10}{3}';
  const exIntMul = '7 \\cdot \\frac{2}{3} = \\frac{7 \\cdot 2}{3} = \\frac{14}{3}';
  const exDivFrac =
    '\\frac{\\frac{2}{3}}{\\frac{4}{5}} = \\frac{2}{3} \\div \\frac{4}{5} = \\frac{2}{3} \\cdot \\frac{5}{4} = \\frac{2 \\cdot 5}{3 \\cdot 4} = \\frac{10}{12} = \\frac{5}{6}';
  const exIntDivFrac = '\\frac{3}{\\frac{2}{5}} = 3 \\div \\frac{2}{5} = 3 \\cdot \\frac{5}{2} = \\frac{15}{2}';
  const exFracDivInt =
    '\\frac{\\frac{3}{4}}{2} = \\frac{3}{4} \\div 2 = \\frac{3}{4} \\cdot \\frac{1}{2} = \\frac{3}{8}';
</script>

{#if state.lang === 'en'}
  <p>In this exercise, you will multiply or divide fractions and simplify the result.</p>

  <p><strong>Multiplying two fractions</strong></p>
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
  <p>For example, <Math expression={exMulFrac} />.</p>
  <p>
    <strong>Cross-cancellation (shortcut):</strong> Before multiplying, look for common factors between any numerator and
    any denominator. Cancel them by dividing both by their gcd.
  </p>
  <p>For example, <Math expression={exMulFrac2} />:</p>
  <ul>
    <li>Without cross-cancellation: <Math expression={exMulFrac2NoCancel} /></li>
    <li>
      With cross-cancellation: The numerator 3 and denominator 9 share a factor of 3, so
      <Math expression="3 \div 3 = 1" /> and <Math expression="9 \div 3 = 3" />. The numerator 8 and denominator 4 share
      a factor of 4, so <Math expression="8 \div 4 = 2" /> and <Math expression="4 \div 4 = 1" />. Now multiply:
      <Math expression={exMulFrac2Cancel} />
    </li>
  </ul>

  <p><strong>Multiplying a fraction by an integer</strong></p>
  <p>
    Rewrite the integer as a fraction with denominator 1, then multiply as usual. For example,
    <Math expression={exMulInt} />.
  </p>

  <p><strong>Multiplying an integer by a fraction</strong></p>
  <p>
    Same as above — rewrite the integer as a fraction with denominator 1. For example,
    <Math expression={exIntMul} />.
  </p>

  <p><strong>Dividing fractions (double fractions)</strong></p>
  <p>
    A fraction divided by another fraction can be written as a double fraction. Use the invert-and-multiply rule:
    multiply the first fraction by the reciprocal of the second.
  </p>
  <p>For example, <Math expression={exDivFrac} />.</p>

  <p><strong>Dividing an integer by a fraction</strong></p>
  <p>
    Rewrite the integer as a fraction with denominator 1, then use invert-and-multiply. For example,
    <Math expression={exIntDivFrac} />.
  </p>

  <p><strong>Dividing a fraction by an integer</strong></p>
  <p>
    Rewrite the integer as a fraction with denominator 1, then multiply by the reciprocal. For example,
    <Math expression={exFracDivInt} />.
  </p>

  <p>Enter the numerator and denominator of the simplified result.</p>
{:else}
  <p>In dieser Übung multiplizierst oder dividierst du Brüche und kürzt das Ergebnis.</p>

  <p><strong>Zwei Brüche multiplizieren</strong></p>
  <ol>
    <li>
      <strong>Zähler multiplizieren</strong> — multipliziere die beiden Zähler miteinander, um den neuen Zähler zu erhalten.
    </li>
    <li>
      <strong>Nenner multiplizieren</strong> — multipliziere die beiden Nenner miteinander, um den neuen Nenner zu erhalten.
    </li>
    <li>
      <strong>Kürzen</strong> — kürze das Ergebnis vollständig, indem du Zähler und Nenner durch ihren ggT teilst.
    </li>
  </ol>
  <p>Zum Beispiel: <Math expression={exMulFrac} />.</p>
  <p>
    <strong>Kürzen vor dem Multiplizieren (Abkürzung):</strong> Bevor du multiplizierst, suche nach gemeinsamen Faktoren zwischen
    einem beliebigen Zähler und einem beliebigen Nenner. Kürze sie, indem du beide durch ihren ggT teilst.
  </p>
  <p>Zum Beispiel <Math expression={exMulFrac2} />:</p>
  <ul>
    <li>Ohne Kürzen vor dem Multiplizieren: <Math expression={exMulFrac2NoCancel} /></li>
    <li>
      Mit Kürzen vor dem Multiplizieren: Der Zähler 3 und der Nenner 9 haben den gemeinsamen Teiler 3, also
      <Math expression="3 \div 3 = 1" /> und <Math expression="9 \div 3 = 3" />. Der Zähler 8 und der Nenner 4 haben den
      gemeinsamen Teiler 4, also <Math expression="8 \div 4 = 2" /> und <Math expression="4 \div 4 = 1" />. Jetzt
      multiplizieren: <Math expression={exMulFrac2Cancel} />
    </li>
  </ul>

  <p><strong>Einen Bruch mit einer ganzen Zahl multiplizieren</strong></p>
  <p>
    Schreibe die ganze Zahl als Bruch mit Nenner 1 und multipliziere wie gewohnt. Zum Beispiel:
    <Math expression={exMulInt} />.
  </p>

  <p><strong>Eine ganze Zahl mit einem Bruch multiplizieren</strong></p>
  <p>
    Gleiches Vorgehen — die ganze Zahl als Bruch mit Nenner 1 schreiben. Zum Beispiel:
    <Math expression={exIntMul} />.
  </p>

  <p><strong>Brüche dividieren (Doppelbrüche)</strong></p>
  <p>
    Ein Bruch geteilt durch einen Bruch kann als Doppelbruch dargestellt werden. Wende die Kehrwertregel an:
    Multipliziere den ersten Bruch mit dem Kehrwert des zweiten.
  </p>
  <p>Zum Beispiel: <Math expression={exDivFrac} />.</p>

  <p><strong>Eine ganze Zahl durch einen Bruch dividieren</strong></p>
  <p>
    Schreibe die ganze Zahl als Bruch mit Nenner 1 und wende die Kehrwertregel an. Zum Beispiel:
    <Math expression={exIntDivFrac} />.
  </p>

  <p><strong>Einen Bruch durch eine ganze Zahl dividieren</strong></p>
  <p>
    Schreibe die ganze Zahl als Bruch mit Nenner 1 und multipliziere mit dem Kehrwert. Zum Beispiel:
    <Math expression={exFracDivInt} />.
  </p>

  <p>Gib den Zähler und den Nenner des gekürzten Ergebnisses ein.</p>
{/if}
