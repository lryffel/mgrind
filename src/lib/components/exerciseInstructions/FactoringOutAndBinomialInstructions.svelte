<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '4x^{3} + 8x^{2} + 4x';
  const ex1gcf = '4x(x^{2} + 2x + 1)';
  const ex1res = '4x(x + 1)^{2}';
  const ex2 = '3x^{2} - 12';
  const ex2gcf = '3(x^{2} - 4)';
  const ex2res = '3(x + 2)(x - 2)';
  const f1 = 'a^{2} + 2ab + b^{2} = (a + b)^{2}';
  const f2 = 'a^{2} - 2ab + b^{2} = (a - b)^{2}';
  const f3 = 'a^{2} - b^{2} = (a + b)(a - b)';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise you need to factor out a common monomial first and then apply a binomial formula. This combines two
    techniques into a single problem.
  </p>
  <p>Follow these steps:</p>
  <ol>
    <li>
      <strong>Factor out the gcd</strong> — from all terms, just as in the Factoring Out exercise. For <Math
        expression={ex1}
      />, the GCD of 4, 8, and 4 is 4, and each term also contains <Math expression={'x'} />, giving <Math
        expression={ex1gcf}
      />.
    </li>
    <li>
      <strong>Examine the remainder</strong> — check whether it matches one of the three binomial formula patterns:
      <ul>
        <li><Math expression={f1} /></li>
        <li><Math expression={f2} /></li>
        <li><Math expression={f3} /></li>
      </ul>
    </li>
    <li>
      <strong>Apply the binomial formula</strong> — <Math expression={'x^{2} + 2x + 1'} /> matches the first formula with
      <Math expression={'a = x'} /> and <Math expression={'b = 1'} />, giving <Math
        expression={'x^{2} + 2x + 1 = (x + 1)^{2}'}
      />.
    </li>
    <li><strong>Combine</strong> — the full factorisation is <Math expression={ex1res} />.</li>
  </ol>
  <p>
    Another example: <Math expression={ex2} />. The gcd is 3, giving <Math expression={ex2gcf} />. The remainder <Math
      expression={'x^{2} - 4'}
    /> matches the third formula with <Math expression={'a = x'} /> and <Math expression={'b = 2'} />, so the result is <Math
      expression={ex2res}
    />.
  </p>
  <p>Verify your answer by expanding the result — you should get back the original expression.</p>
{:else}
  <p>
    Bei dieser Übung musst du zuerst einen gemeinsamen Faktor ausklammern und dann eine binomische Formel anwenden. Dies
    kombiniert zwei Techniken in einer Aufgabe.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Klammere den ggT aus</strong> — wie bei der Übung «Ausklammern». Bei <Math expression={ex1} /> ist der ggT von
      4, 8 und 4 gleich 4, und jeder Term enthält auch <Math expression={'x'} />, also <Math expression={ex1gcf} />.
    </li>
    <li>
      <strong>Untersuche den Rest</strong> — prüfe, ob er eines der drei binomischen Formelmuster erfüllt:
      <ul>
        <li><Math expression={f1} /></li>
        <li><Math expression={f2} /></li>
        <li><Math expression={f3} /></li>
      </ul>
    </li>
    <li>
      <strong>Wende die binomische Formel an</strong> — <Math expression={'x^{2} + 2x + 1'} /> passt zur ersten Formel mit
      <Math expression={'a = x'} /> und <Math expression={'b = 1'} />, also <Math
        expression={'x^{2} + 2x + 1 = (x + 1)^{2}'}
      />.
    </li>
    <li><strong>Setze zusammen</strong> — die vollständige Faktorisierung ist <Math expression={ex1res} />.</li>
  </ol>
  <p>
    Ein weiteres Beispiel: <Math expression={ex2} />. Der ggT ist 3, also <Math expression={ex2gcf} />. Der Rest <Math
      expression={'x^{2} - 4'}
    /> passt zur dritten Formel mit <Math expression={'a = x'} /> und <Math expression={'b = 2'} />, somit ist das
    Ergebnis <Math expression={ex2res} />.
  </p>
  <p>
    Überprüfe deine Antwort, indem du das Ergebnis ausmultiplizierst — du solltest den ursprünglichen Term erhalten.
  </p>
{/if}
