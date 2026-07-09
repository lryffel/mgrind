<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '3(x + 2) = 15';
  const ex1step1 = '3x + 6 = 15';
  const ex1step2 = '3x = 9';
  const ex1res = 'x = 3';
  const ex2 = '2x - 5 = 3x + 1';
  const ex2step1 = '-5 = x + 1';
  const ex2res = 'x = -6';
  const ex3 = '\\frac{x}{2} + 1 = \\frac{x}{3}';
  const ex3step1 = '\\frac{x}{2} - \\frac{x}{3} = -1';
  const ex3step2 = '\\frac{x}{6} = -1';
  const ex3res = 'x = -6';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise you are given a linear equation and must solve for the unknown variable. The answer may be an
    integer or a fraction.
  </p>
  <p>Follow these steps:</p>
  <ol>
    <li>
      <strong>Simplify both sides</strong> — expand brackets and combine like terms where possible. For <Math
        expression={ex1}
      />, expand: <Math expression={ex1step1} />.
    </li>
    <li>
      <strong>Move variable terms to one side, constants to the other</strong> — subtract 6 from both sides: <Math
        expression={ex1step2}
      />.
    </li>
    <li>
      <strong>Divide by the coefficient</strong> — <Math expression={'x = 9 \\div 3 = 3'} />, so <Math
        expression={ex1res}
      />.
    </li>
  </ol>
  <p>Here is a more involved example: <Math expression={ex2} />.</p>
  <ul>
    <li>Subtract <Math expression={'2x'} /> from both sides: <Math expression={ex2step1} />.</li>
    <li>Subtract 1 from both sides: <Math expression={ex2res} />.</li>
  </ul>
  <p>For equations with fractions, the same steps apply. Example: <Math expression={ex3} />.</p>
  <ul>
    <li>Move variable terms to one side: <Math expression={ex3step1} />.</li>
    <li>Combine the fractions: <Math expression={ex3step2} />.</li>
    <li>Multiply both sides by 6: <Math expression={ex3res} />.</li>
  </ul>
  <p>Always reduce fractions in your final answer.</p>
{:else}
  <p>
    Bei dieser Übung erhältst du eine lineare Gleichung und musst sie nach der unbekannten Variablen auflösen. Die
    Antwort kann eine ganze Zahl oder ein Bruch sein.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Vereinfache beide Seiten</strong> — löse Klammern auf und fasse gleiche Terme zusammen. Bei <Math
        expression={ex1}
      />: <Math expression={ex1step1} />.
    </li>
    <li>
      <strong>Bringe die Variablenterme auf eine Seite, die Konstanten auf die andere</strong> — subtrahiere 6 von
      beiden Seiten: <Math expression={ex1step2} />.
    </li>
    <li>
      <strong>Dividiere durch den Koeffizienten</strong> — <Math expression={'x = 9 \\div 3 = 3'} />, also <Math
        expression={ex1res}
      />.
    </li>
  </ol>
  <p>Ein anspruchsvolleres Beispiel: <Math expression={ex2} />.</p>
  <ul>
    <li>Subtrahiere <Math expression={'2x'} /> von beiden Seiten: <Math expression={ex2step1} />.</li>
    <li>Subtrahiere 1 von beiden Seiten: <Math expression={ex2res} />.</li>
  </ul>
  <p>Bei Gleichungen mit Brüchen gelten die gleichen Schritte. Beispiel: <Math expression={ex3} />.</p>
  <ul>
    <li>Bringe die Variablenterme auf eine Seite: <Math expression={ex3step1} />.</li>
    <li>Fasse die Brüche zusammen: <Math expression={ex3step2} />.</li>
    <li>Multipliziere beide Seiten mit 6: <Math expression={ex3res} />.</li>
  </ul>
  <p>Kürze Brüche in deiner endgültigen Antwort immer vollständig.</p>
{/if}
