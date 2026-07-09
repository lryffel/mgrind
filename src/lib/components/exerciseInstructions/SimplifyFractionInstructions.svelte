<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '\\frac{12}{18}';
  const ex1gcd = '12 \\div 6 = 2,\\; 18 \\div 6 = 3';
  const ex1res = '\\frac{12}{18} = \\frac{2}{3}';
  const ex2 = '\\frac{6}{10}';
  const ex2res = '\\frac{6}{10} = \\frac{3}{5}';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise, you will simplify a fraction to its lowest terms. A fraction is fully simplified when the
    numerator and denominator have no common factors other than 1.
  </p>
  <p>Follow these steps:</p>
  <ol>
    <li>
      <strong>Find the greatest common divisor (gcd)</strong> of the numerator and denominator. The gcd is the largest number
      that divides both evenly.
    </li>
    <li><strong>Divide both by the gcd</strong> — divide the numerator by the gcd and the denominator by the gcd.</li>
    <li><strong>Write the simplified fraction</strong> — the result is the fraction in lowest terms.</li>
  </ol>
  <p>
    For example, consider <Math expression={ex1} />. The gcd of 12 and 18 is 6. Divide both numbers by 6: <Math
      expression={ex1gcd}
    />. So <Math expression={ex1res} />.
  </p>
  <p>Another example: <Math expression={ex2} />. The gcd of 6 and 10 is 2, giving <Math expression={ex2res} />.</p>
  <p>
    Enter your answer by typing the numerator and the denominator of the simplified fraction into the two input fields.
  </p>
{:else}
  <p>
    In dieser Übung kürzt du einen Bruch vollständig. Ein Bruch ist vollständig gekürzt, wenn Zähler und Nenner keinen
    gemeinsamen Teiler mehr haben.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Finde den grössten gemeinsamen Teiler (ggT)</strong> von Zähler und Nenner. Der ggT ist die grösste Zahl, die
      beide ohne Rest teilt.
    </li>
    <li>
      <strong>Dividiere beide durch den ggT</strong> — teile den Zähler durch den ggT und den Nenner durch den ggT.
    </li>
    <li><strong>Schreibe den gekürzten Bruch</strong> — das Ergebnis ist der vollständig gekürzte Bruch.</li>
  </ol>
  <p>
    Betrachte zum Beispiel <Math expression={ex1} />. Der ggT von 12 und 18 ist 6. Teile beide Zahlen durch 6: <Math
      expression={ex1gcd}
    />. Also <Math expression={ex1res} />.
  </p>
  <p>
    Ein weiteres Beispiel: <Math expression={ex2} />. Der ggT von 6 und 10 ist 2, das ergibt <Math
      expression={ex2res}
    />.
  </p>
  <p>
    Gib deine Antwort ein, indem du den Zähler und den Nenner des gekürzten Bruchs in die beiden Eingabefelder trägst.
  </p>
{/if}
