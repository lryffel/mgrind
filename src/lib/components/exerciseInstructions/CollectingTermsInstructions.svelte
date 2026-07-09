<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const exTerms = '3x^{2} + 2x + 5x^{2} - x';
  const likeX2 = '3x^{2} + 5x^{2} = 8x^{2}';
  const likeX = '2x - x = x';
  const result = '8x^{2} + x';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise asks you to combine like terms in a polynomial expression. Like terms have the same variable part —
    the same variable or variables raised to the same power. You combine them by adding or subtracting their numerical
    coefficients while keeping the variable part unchanged.
  </p>
  <p>To solve, follow these steps:</p>
  <ol>
    <li>
      <strong>Identify like terms</strong> — find terms that share the same variable part. For example, in <Math
        expression={exTerms}
      />, the terms <Math expression={'3x^{2}'} /> and <Math expression={'5x^{2}'} /> share the variable part <Math
        expression={'x^{2}'}
      />, while <Math expression={'2x'} /> and <Math expression={'-x'} /> share <Math expression={'x'} />.
    </li>
    <li>
      <strong>Combine coefficients</strong> — for each group of like terms, add or subtract their coefficients: <Math
        expression={likeX2}
      /> and <Math expression={likeX} />.
    </li>
    <li>
      <strong>Write the simplified expression</strong> — the sum of the combined terms: <Math expression={result} />.
    </li>
    <li>
      <strong>Enter the coefficients</strong> — for each variable part in the order shown, type the coefficient. In this
      example you would enter <Math expression={'8'} /> for <Math expression={'x^{2}'} /> and <Math expression={'1'} /> for
      <Math expression={'x'} />.
    </li>
  </ol>
{:else}
  <p>
    In dieser Übung musst du gleichartige Terme in einem polynomiellen Ausdruck zusammenfassen. Gleichartige Terme haben
    denselben Variablenteil — dieselbe Variable oder dieselben Variablen in derselben Potenz. Du fasst sie zusammen,
    indem du ihre numerischen Koeffizienten addierst oder subtrahierst, während der Variablenteil unverändert bleibt.
  </p>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Gleichartige Terme identifizieren</strong> — finde Terme mit demselben Variablenteil. Zum Beispiel haben
      in <Math expression={exTerms} /> die Terme <Math expression={'3x^{2}'} /> und <Math expression={'5x^{2}'} /> den gleichen
      Variablenteil <Math expression={'x^{2}'} />, während <Math expression={'2x'} /> und <Math expression={'-x'} /> den Teil
      <Math expression={'x'} /> gemeinsam haben.
    </li>
    <li>
      <strong>Koeffizienten zusammenfassen</strong> — addiere oder subtrahiere die Koeffizienten jeder Gruppe: <Math
        expression={likeX2}
      /> und <Math expression={likeX} />.
    </li>
    <li>
      <strong>Vereinfachten Ausdruck schreiben</strong> — die Summe der zusammengefassten Terme: <Math
        expression={result}
      />.
    </li>
    <li>
      <strong>Koeffizienten eingeben</strong> — für jeden Variablenteil in der angezeigten Reihenfolge den Koeffizienten
      eintragen. In diesem Beispiel würdest du <Math expression={'8'} /> für <Math expression={'x^{2}'} /> und <Math
        expression={'1'}
      /> für <Math expression={'x'} /> eingeben.
    </li>
  </ol>
{/if}
