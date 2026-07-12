<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '\\dfrac{3}{4} \\; ? \\; \\dfrac{5}{6}';
  const ex2 = '3 \\cdot 6 = 18';
  const ex3 = '5 \\cdot 4 = 20';
  const ex4 = '18 < 20';
  const ex5 = '\\dfrac{3}{4} < \\dfrac{5}{6}';
</script>

{#if state.lang === 'en'}
  <p>Compare the two fractions and choose the correct comparison symbol.</p>
  <p>
    If the fractions have the same denominator, compare the numerators directly.
    If they have the same numerator, the fraction with the larger denominator is smaller.
    Otherwise, find a common denominator or cross-multiply to compare.
  </p>
  <p>
    Example: <Math expression={ex1} /> is solved by
    cross-multiplying: <Math expression={ex2} /> and <Math expression={ex3} />.
    Since <Math expression={ex4} />, we have <Math expression={ex5} />.
  </p>
{:else}
  <p>Vergleiche die beiden Brüche und wähle das richtige Vergleichszeichen.</p>
  <p>
    Wenn die Brüche denselben Nenner haben, vergleiche die Zähler direkt.
    Wenn sie denselben Zähler haben, ist der Bruch mit dem grösseren Nenner kleiner.
    Sonst finde einen gemeinsamen Nenner oder multipliziere über Kreuz.
  </p>
  <p>
    Beispiel: <Math expression={ex1} /> wird durch
    Überkreuz-Multiplikation gelöst: <Math expression={ex2} /> und
    <Math expression={ex3} />.
    Da <Math expression={ex4} />, gilt <Math expression={ex5} />.
  </p>
{/if}
