<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const ex1 = '(-3) \\cdot (-5) = +15';
  const ex2 = '(-2) \\cdot 4 \\cdot (-3) \\cdot (-1) = -24';
  const ex3 = '(-2)^{3} = -8';
</script>

{#if state.lang === 'en'}
  <p>
    Determine whether each expression is positive or negative. Choose <Math expression="+" /> for positive, <Math
      expression="-"
    /> for negative.
  </p>
  <p>Rules to remember:</p>
  <ul>
    <li>A product or quotient of two negatives gives a positive. Example: <Math expression={ex1} /></li>
    <li>
      An <strong>odd</strong> number of negative factors gives a negative, an <strong>even</strong> number gives a
      positive. Example: <Math expression={ex2} />
    </li>
    <li>
      An <strong>even</strong> exponent on a negative base gives a positive, an <strong>odd</strong> exponent gives a
      negative. Example: <Math expression={ex3} />
    </li>
  </ul>
{:else}
  <p>
    Entscheide, ob jeder Term positiv oder negativ ist. Wähle <Math expression="+" /> für positiv, <Math
      expression="-"
    /> für negativ.
  </p>
  <p>Regeln zum Merken:</p>
  <ul>
    <li>Ein Produkt oder Quotient aus zwei negativen Faktoren ergibt positiv. Beispiel: <Math expression={ex1} /></li>
    <li>
      Eine <strong>ungerade</strong> Anzahl negativer Faktoren ergibt negativ, eine <strong>gerade</strong> Anzahl
      positiv. Beispiel: <Math expression={ex2} />
    </li>
    <li>
      Ein <strong>gerader</strong> Exponent einer negativen Basis ergibt positiv, ein <strong>ungerader</strong>
      Exponent negativ. Beispiel: <Math expression={ex3} />
    </li>
  </ul>
{/if}
