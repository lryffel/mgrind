<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '3.14159';
  const ex1Result = '3.14';
  const ex2 = '10.0';
  const ex2Result = '1.0 \\cdot 10^{1}';
  const ex3 = '0.003456';
  const ex3Result = '0.00346';
  const ex4 = '1234';
  const ex4Result = '1200';
</script>

{#if state.lang === 'en'}
  <p>
    Significant digits (also called significant figures) are all the digits that carry meaning in a number. The first
    significant digit is the first non-zero digit from the left. All subsequent digits (including zeros) are significant
    if they are between non-zero digits or after the decimal point.
  </p>
  <p>When rounding to <em>n</em> significant digits:</p>
  <ol>
    <li>
      Start at the first non-zero digit and count <em>n</em> digits to the right — that is the last digit you keep.
    </li>
    <li>If the next digit is 5 or greater, round the last kept digit up. If it is 4 or less, keep it as is.</li>
    <li>Replace all digits after the last kept digit with zeros (or drop them if they are after the decimal point).</li>
  </ol>
  <p>Examples:</p>
  <ul>
    <li>
      <Math expression={ex1} /> rounded to 3 significant digits is <Math expression={ex1Result} />
    </li>
    <li>
      <Math expression={ex3} /> rounded to 3 significant digits is <Math expression={ex3Result} />
    </li>
    <li>
      <Math expression={ex4} /> rounded to 2 significant digits is <Math expression={ex4Result} />
    </li>
  </ul>
  <p>Enter your result as a number.</p>
{:else}
  <p>
    Signifikante Stellen (auch gültige Ziffern genannt) sind alle Ziffern einer Zahl, die zu ihrer Genauigkeit
    beitragen. Die erste signifikante Stelle ist die erste von links, die nicht null ist. Alle nachfolgenden Ziffern
    (einschliesslich Nullen) sind signifikant, wenn sie zwischen anderen Ziffern oder nach dem Dezimalpunkt stehen.
  </p>
  <p>Beim Runden auf <em>n</em> signifikante Stellen:</p>
  <ol>
    <li>
      Beginne bei der ersten nicht null Ziffer und zähle <em>n</em> Stellen nach rechts — das ist die letzte Stelle, die du
      behältst.
    </li>
    <li>
      Wenn die nächste Ziffer 5 oder grösser ist, runde die letzte behaltene Stelle auf. Wenn sie 4 oder kleiner ist,
      lass sie unverändert.
    </li>
    <li>
      Ersetze alle Ziffern nach der letzten behaltenen Stelle durch Nullen (oder lass sie weg, wenn sie nach dem
      Dezimalpunkt stehen).
    </li>
  </ol>
  <p>Beispiele:</p>
  <ul>
    <li>
      <Math expression={ex1} /> auf 3 signifikante Stellen gerundet ist <Math expression={ex1Result} />
    </li>
    <li>
      <Math expression={ex3} /> auf 3 signifikante Stellen gerundet ist <Math expression={ex3Result} />
    </li>
    <li>
      <Math expression={ex4} /> auf 2 signifikante Stellen gerundet ist <Math expression={ex4Result} />
    </li>
  </ul>
  <p>Gib dein Ergebnis als Zahl ein.</p>
{/if}
