<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex = '\\frac{1}{10} + \\frac{1}{2}';
  const step1a = '\\frac{1}{10}';
  const step1b = '\\frac{1 \\cdot 5}{2 \\cdot 5} = \\frac{5}{10}';
  const step2 = '\\frac{1}{10} + \\frac{5}{10} = \\frac{1 + 5}{10} = \\frac{6}{10}';
  const step3 = '\\frac{6}{10} = \\frac{3}{5}';
  const result = '\\frac{3}{5}';
</script>

{#if state.lang === 'en'}
  <p>To add fractions, follow these steps:</p>
  <ol>
    <li>
      <strong>Make the denominators the same</strong> — find the least common multiple (LCM) of the denominators.
      Consider <Math expression={ex} />. The LCM of 10 and 2 is 10, so only the second fraction needs to be expanded:
      <Math expression={step1b} />
    </li>
    <li>
      <strong>Add the numerators</strong> — the denominator stays the same:
      <Math expression={step2} />
    </li>
    <li>
      <strong>Simplify</strong> — reduce the fraction if possible:
      <Math expression={step3} />
    </li>
  </ol>
  <p>The result is <Math expression={result} />.</p>
{:else}
  <p>Um Brüche zu addieren, gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Gleichnamig machen</strong> — finde das kleinste gemeinsame Vielfache (kgV) der Nenner.
      Betrachte <Math expression={ex} />. Das kgV von 10 und 2 ist 10, also muss nur der zweite Bruch erweitert
      werden: <Math expression={step1b} />
    </li>
    <li>
      <strong>Zähler addieren</strong> — der Nenner bleibt gleich:
      <Math expression={step2} />
    </li>
    <li>
      <strong>Kürzen</strong> — falls möglich, den Bruch kürzen:
      <Math expression={step3} />
    </li>
  </ol>
  <p>Das Ergebnis ist <Math expression={result} />.</p>
{/if}
