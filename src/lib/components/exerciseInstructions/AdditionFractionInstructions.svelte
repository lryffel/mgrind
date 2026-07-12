<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex = '\\dfrac{1}{2} + \\dfrac{1}{3} - \\dfrac{1}{4}';
  const step1a = '\\dfrac{1}{2} = \\dfrac{6}{12}';
  const step1b = '\\dfrac{1}{3} = \\dfrac{4}{12}';
  const step1c = '\\dfrac{1}{4} = \\dfrac{3}{12}';
  const step2 = '\\dfrac{6}{12} + \\dfrac{4}{12} - \\dfrac{3}{12} = \\dfrac{6 + 4 - 3}{12} = \\dfrac{7}{12}';
  const result = '\\dfrac{7}{12}';
</script>

{#if state.lang === 'en'}
  <p>To add and subtract fractions, follow these steps:</p>
  <ol>
    <li>
      <strong>Make the denominators the same</strong> — find the least common multiple (lcm) of the denominators.
      Consider <Math expression={ex} />. The lcm of 2, 3, and 4 is 12:
      <Math expression={step1a} />, <Math expression={step1b} />, <Math expression={step1c} />
    </li>
    <li>
      <strong>Add and subtract the numerators</strong> — the denominator stays the same:
      <Math expression={step2} />
    </li>
    <li>
      <strong>Simplify</strong> — reduce the fraction if possible.
    </li>
  </ol>
  <p>The result is <Math expression={result} />.</p>
  <p>Enter your answer as a reduced fraction: <em>numerator,denominator</em> (e.g. <Math expression="\\dfrac{7}{12}" /> → <code>7,12</code>).</p>
{:else}
  <p>Um Brüche zu addieren und zu subtrahieren, gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Gleichnamig machen</strong> — finde das kleinste gemeinsame Vielfache (kgV) der Nenner. Betrachte <Math
        expression={ex}
      />. Das kgV von 2, 3 und 4 ist 12:
      <Math expression={step1a} />, <Math expression={step1b} />, <Math expression={step1c} />
    </li>
    <li>
      <strong>Zähler addieren und subtrahieren</strong> — der Nenner bleibt gleich:
      <Math expression={step2} />
    </li>
    <li>
      <strong>Kürzen</strong> — falls möglich, den Bruch kürzen.
    </li>
  </ol>
  <p>Das Ergebnis ist <Math expression={result} />.</p>
  <p>Gib deine Antwort als gekürzten Bruch ein: <em>Zähler,Nenner</em> (z.B. <Math expression="\\dfrac{7}{12}" /> → <code>7,12</code>).</p>
{/if}
