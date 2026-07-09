<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '3x^{2}';
  const ex1sub = '3 \\cdot 4^{2} = 3 \\cdot 16 = 48';
  const ex2 = 'a - 2b';
  const ex2sub = '5 - 2 \\cdot 3 = 5 - 6 = -1';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise, you will substitute a given value for a variable in an algebraic expression and simplify the
    result.
  </p>
  <p>Follow these steps:</p>
  <ol>
    <li>
      <strong>Substitute</strong> — replace every occurrence of the variable with the given value. Use parentheses around
      the value to preserve the order of operations.
    </li>
    <li><strong>Evaluate exponents</strong> — calculate any powers before multiplying or adding.</li>
    <li><strong>Multiply and divide</strong> — perform all multiplication and division from left to right.</li>
    <li><strong>Add and subtract</strong> — perform addition and subtraction from left to right.</li>
  </ol>
  <p>For example, evaluate <Math expression={ex1} /> with <Math expression={'x = 4'} />:</p>
  <p><Math expression={ex1sub} />.</p>
  <p>
    Another example: evaluate <Math expression={ex2} /> with <Math expression={'a = 5'} /> and <Math
      expression={'b = 3'}
    />:
  </p>
  <p><Math expression={ex2sub} />.</p>
  <p>
    Remember: the order of operations is crucial. Always handle exponents first, then multiplication and division, and
    finally addition and subtraction.
  </p>
  <p>Enter your simplified result in the answer field.</p>
{:else}
  <p>
    In dieser Übung setzt du einen gegebenen Wert für eine Variable in einen algebraischen Term ein und vereinfachst das
    Ergebnis.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Einsetzen</strong> — ersetze jedes Vorkommen der Variable durch den gegebenen Wert. Setze den Wert in Klammern,
      um die Rechenreihenfolge einzuhalten.
    </li>
    <li><strong>Potenzen ausrechnen</strong> — berechne alle Potenzen vor dem Multiplizieren oder Addieren.</li>
    <li>
      <strong>Multiplizieren und dividieren</strong> — führe alle Multiplikationen und Divisionen von links nach rechts aus.
    </li>
    <li><strong>Addieren und subtrahieren</strong> — führe Additionen und Subtraktionen von links nach rechts aus.</li>
  </ol>
  <p>Zum Beispiel: Berechne <Math expression={ex1} /> mit <Math expression={'x = 4'} />:</p>
  <p><Math expression={ex1sub} />.</p>
  <p>
    Ein weiteres Beispiel: Berechne <Math expression={ex2} /> mit <Math expression={'a = 5'} /> und <Math
      expression={'b = 3'}
    />:
  </p>
  <p><Math expression={ex2sub} />.</p>
  <p>
    Denk daran: Die Rechenreihenfolge ist entscheidend. Berechne zuerst Potenzen, dann Multiplikation und Division, und
    zum Schluss Addition und Subtraktion.
  </p>
  <p>Gib dein vereinfachtes Ergebnis in das Antwortfeld ein.</p>
{/if}
