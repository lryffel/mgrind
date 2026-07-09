<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const posEx = '5^{2} = 25';
  const negBaseEx = '(-5)^{2} = 25';
  const negOfSquareEx = '-5^{2} = -25';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise, you are asked to compute the square of a number. Squaring a number means multiplying it by itself.
  </p>
  <p>Pay close attention to the position of the sign:</p>
  <ul>
    <li><Math expression={posEx} /> — a positive base stays positive when squared.</li>
    <li>
      <Math expression={negBaseEx} /> — a negative base inside parentheses is squared as a whole: <Math
        expression={'(-5) \\cdot (-5) = 25'}
      />. A negative times a negative gives a positive result.
    </li>
    <li>
      <Math expression={negOfSquareEx} /> — the square is computed first, then the negative sign is applied. This is equivalent
      to <Math expression={'-(5 \\cdot 5) = -25'} />.
    </li>
  </ul>
  <p>Enter your result as a number.</p>
{:else}
  <p>
    In dieser Übung sollst du das Quadrat einer Zahl berechnen. Eine Zahl zu quadrieren bedeutet, sie mit sich selbst zu
    multiplizieren.
  </p>
  <p>Achte genau auf die Position des Vorzeichens:</p>
  <ul>
    <li><Math expression={posEx} /> — eine positive Basis bleibt beim Quadrieren positiv.</li>
    <li>
      <Math expression={negBaseEx} /> — eine negative Basis in Klammern wird als Ganzes quadriert: <Math
        expression={'(-5) \\cdot (-5) = 25'}
      />. Minus mal Minus ergibt Plus.
    </li>
    <li>
      <Math expression={negOfSquareEx} /> — das Quadrat wird zuerst berechnet, dann wird das negative Vorzeichen angewandt.
      Dies entspricht <Math expression={'-(5 \\cdot 5) = -25'} />.
    </li>
  </ul>
  <p>Gib dein Ergebnis als Zahl ein.</p>
{/if}
