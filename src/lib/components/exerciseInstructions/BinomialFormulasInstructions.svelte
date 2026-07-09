<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const formula1 = '(a + b)^{2} = a^{2} + 2ab + b^{2}';
  const formula2 = '(a - b)^{2} = a^{2} - 2ab + b^{2}';
  const formula3 = '(a + b)(a - b) = a^{2} - b^{2}';
  const ex1 = '(2x + 3)^{2}';
  const ex1res = '4x^{2} + 12x + 9';
  const ex2 = '(x + 5)(x - 5)';
  const ex2res = 'x^{2} - 25';
  const ex3 = '(2x + 3y)^{2}';
  const ex3res = '4x^{2} + 12xy + 9y^{2}';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise asks you to expand a binomial expression using one of the three binomial formulas. The three formulas
    are:
  </p>
  <ol>
    <li><strong>Square of a sum:</strong> <Math expression={formula1} /></li>
    <li><strong>Square of a difference:</strong> <Math expression={formula2} /></li>
    <li><strong>Sum times difference:</strong> <Math expression={formula3} /></li>
  </ol>
  <p>To solve, follow these steps:</p>
  <ol>
    <li>
      <strong>Identify which formula applies</strong> — if the expression has the form <Math
        expression={'(\\dots + \\dots)^{2}'}
      /> use formula 1; if it has the form <Math expression={'(\\dots - \\dots)^{2}'} /> use formula 2; if it has the form
      <Math expression="(\dots + \dots)(\dots - \dots)" /> use formula 3.
    </li>
    <li>
      <strong>Determine <Math expression="a" /> and <Math expression="b" /></strong> — for example, in <Math
        expression={ex1}
      />, we have <Math expression="a = 2x" /> and <Math expression="b = 3" />.
    </li>
    <li>
      <strong>Apply the formula</strong> — for <Math expression={ex1} />: <Math expression={'(2x)^{2} = 4x^{2}'} />, <Math
        expression="2 \cdot (2x) \cdot 3 = 12x"
      />, <Math expression={'3^{2} = 9'} />. The result is <Math expression={ex1res} />.
    </li>
    <li>
      <strong>For two-variable expressions</strong> — for example <Math expression={ex3} />: <Math
        expression={'(2x)^{2} = 4x^{2}'}
      />, <Math expression="2 \cdot (2x) \cdot (3y) = 12xy" />, <Math expression={'(3y)^{2} = 9y^{2}'} />. The result is <Math
        expression={ex3res}
      />.
    </li>
  </ol>
  <p>Enter the coefficient for each term in the order of the input fields.</p>
{:else}
  <p>
    In dieser Übung musst du einen Binom-Ausdruck mit einer der drei binomischen Formeln ausmultiplizieren. Die drei
    Formeln lauten:
  </p>
  <ol>
    <li><strong>Quadrat einer Summe:</strong> <Math expression={formula1} /></li>
    <li><strong>Quadrat einer Differenz:</strong> <Math expression={formula2} /></li>
    <li><strong>Summe mal Differenz:</strong> <Math expression={formula3} /></li>
  </ol>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Bestimme, welche Formel zutrifft</strong> — bei der Form <Math expression={'(\\dots + \\dots)^{2}'} /> nimmst
      du Formel 1; bei <Math expression={'(\\dots - \\dots)^{2}'} /> nimmst du Formel 2; bei <Math
        expression="(\dots + \dots)(\dots - \dots)"
      /> nimmst du Formel 3.
    </li>
    <li>
      <strong>Identifiziere <Math expression="a" /> und <Math expression="b" /></strong> — zum Beispiel ist in <Math
        expression={ex1}
      />
      <Math expression="a = 2x" /> und <Math expression="b = 3" />.
    </li>
    <li>
      <strong>Wende die Formel an</strong> — für <Math expression={ex1} />: <Math expression={'(2x)^{2} = 4x^{2}'} />, <Math
        expression="2 \cdot (2x) \cdot 3 = 12x"
      />, <Math expression={'3^{2} = 9'} />. Das Ergebnis ist <Math expression={ex1res} />.
    </li>
    <li>
      <strong>Bei Ausdrücken mit zwei Variablen</strong> — zum Beispiel <Math expression={ex3} />: <Math
        expression={'(2x)^{2} = 4x^{2}'}
      />, <Math expression="2 \cdot (2x) \cdot (3y) = 12xy" />, <Math expression={'(3y)^{2} = 9y^{2}'} />. Das Ergebnis
      ist <Math expression={ex3res} />.
    </li>
  </ol>
  <p>Gib den Koeffizienten für jeden Term in der Reihenfolge der Eingabefelder ein.</p>
{/if}
