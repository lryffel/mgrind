<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const step1 = '60 \\div 2 = 30';
  const step2 = '30 \\div 2 = 15';
  const step3 = '15 \\div 3 = 5';
  const step4 = '5 \\div 5 = 1';
  const result = '60 = 2^{2} \\cdot 3 \\cdot 5';
</script>

{#if state.lang === 'en'}
  <p>
    Every whole number greater than 1 can be written as a product of prime numbers — this is called its prime
    factorisation. In this exercise, you are given a number and must enter the exponent of each prime factor.
  </p>
  <p>
    To find the prime factorisation, divide the number repeatedly by the smallest prime that divides it evenly. Continue
    dividing the result until you reach 1. The number of times you divide by each prime is its exponent.
  </p>
  <p>Let's factorise 60 step by step:</p>
  <ul>
    <li>
      60 is even, so divide by <Math expression="2" />: <Math expression={step1} /> (one factor of <Math
        expression="2"
      />).
    </li>
    <li>
      30 is even, so divide by <Math expression="2" /> again: <Math expression={step2} /> (a second factor of <Math
        expression="2"
      />).
    </li>
    <li>
      15 is divisible by <Math expression="3" />: <Math expression={step3} /> (one factor of <Math
        expression="3"
      />).
    </li>
    <li>
      5 is divisible by <Math expression="5" />: <Math expression={step4} /> (one factor of <Math
        expression="5"
      />).
    </li>
  </ul>
  <p>
    The prime factorisation of 60 is <Math expression={result} />. So the exponents are: <Math expression="2" /> for prime
    <Math expression="2" />, <Math expression="1" /> for <Math expression="3" />, and <Math expression="1" /> for
    <Math expression="5" />.
  </p>
  <p>
    Enter the exponent for each prime in the order shown. If a prime does not appear in the factorisation, enter <Math
      expression="0"
    />.
  </p>
{:else}
  <p>
    Jede natürliche Zahl grösser als 1 lässt sich als Produkt von Primzahlen schreiben — das nennt man ihre
    Primfaktorzerlegung. In dieser Übung bekommst du eine Zahl und musst den Exponenten jedes Primfaktors eingeben.
  </p>
  <p>
    Um die Primfaktorzerlegung zu finden, teile die Zahl wiederholt durch die kleinste Primzahl, durch die sie ohne Rest
    teilbar ist. Teile das Ergebnis weiter, bis du bei 1 angelangt bist. Die Anzahl, wie oft du durch jede Primzahl
    geteilt hast, ist ihr Exponent.
  </p>
  <p>Zerlegen wir 60 Schritt für Schritt:</p>
  <ul>
    <li>
      60 ist gerade, also teile durch <Math expression="2" />: <Math expression={step1} /> (ein Faktor <Math
        expression="2"
      />).
    </li>
    <li>
      30 ist gerade, also teile erneut durch <Math expression="2" />: <Math expression={step2} /> (ein zweiter Faktor <Math
        expression="2"
      />).
    </li>
    <li>
      15 ist durch <Math expression="3" /> teilbar: <Math expression={step3} /> (ein Faktor <Math
        expression="3"
      />).
    </li>
    <li>
      5 ist durch <Math expression="5" /> teilbar: <Math expression={step4} /> (ein Faktor <Math expression="5" />).
    </li>
  </ul>
  <p>
    Die Primfaktorzerlegung von 60 ist <Math expression={result} />. Die Exponenten sind also: <Math expression="2" /> für
    die Primzahl <Math expression="2" />, <Math expression="1" /> für <Math expression="3" /> und <Math
      expression="1"
    /> für <Math expression="5" />.
  </p>
  <p>
    Gib den Exponenten für jede Primzahl in der angezeigten Reihenfolge ein. Wenn eine Primzahl in der Zerlegung nicht
    vorkommt, gib <Math expression="0" /> ein.
  </p>
{/if}
