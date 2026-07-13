<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const a = '2^{3} \\cdot 3^{2}';
  const b = '2^{2} \\cdot 3 \\cdot 5';
  const gcdRes = '2^{2} \\cdot 3';
  const lcmRes = '2^{3} \\cdot 3^{2} \\cdot 5';
  const exA = '12';
  const exB = '18';
  const gcdLabelEn = '\\text{gcd}';
  const lcmLabelEn = '\\text{lcm}';
  const gcdLabelDe = '\\text{ggT}';
  const lcmLabelDe = '\\text{kgV}';
</script>

{#if state.lang === 'en'}
  <p>
    The greatest common divisor (gcd) of two numbers is the largest number that divides both numbers evenly. The least
    common multiple (lcm) is the smallest number that both numbers divide evenly.
  </p>
  <p>This exercise has two modes, chosen randomly:</p>
  <p><strong>Mode A — Factorisation</strong></p>
  <p>
    You are shown the prime factorisation of two numbers, <Math expression="a" /> and <Math expression="b" />. Your task
    is to enter the exponent of each prime in the gcd and the lcm. For each prime, the exponent in the gcd is the
    smaller of the two exponents, and the exponent in the lcm is the larger.
  </p>
  <p>
    For example, if <Math expression={`a = ${a}`} /> and <Math expression={`b = ${b}`} />, then:
  </p>
  <ul>
    <li>
      <Math expression={gcdLabelEn} />: take the smaller exponent for each prime — <Math expression={gcdRes} />.
    </li>
    <li>
      <Math expression={lcmLabelEn} />: take the larger exponent for each prime — <Math expression={lcmRes} />.
    </li>
  </ul>
  <p>
    Enter the exponents in the order the primes are shown. If a prime does not appear in a factorisation, enter <Math
      expression="0"
    />.
  </p>
  <p><strong>Mode B — Numbers</strong></p>
  <p>You are given two numbers and must compute their gcd and lcm directly.</p>
  <p>
    For example, the gcd of <Math expression={exA} /> and <Math expression={exB} /> is <Math expression="6" />, and the
    lcm is <Math expression="36" />.
  </p>
{:else}
  <p>
    Der grösste gemeinsame Teiler (ggT) zweier Zahlen ist die grösste Zahl, die beide Zahlen ohne Rest teilt. Das
    kleinste gemeinsame Vielfache (kgV) ist die kleinste Zahl, die von beiden Zahlen ohne Rest geteilt wird.
  </p>
  <p>Diese Übung hat zwei zufällig ausgewählte Modi:</p>
  <p><strong>Modus A — Primfaktorzerlegung</strong></p>
  <p>
    Du siehst die Primfaktorzerlegung von zwei Zahlen, <Math expression="a" /> und <Math expression="b" />. Deine
    Aufgabe ist es, den Exponenten jeder Primzahl im ggT und im kgV einzugeben. Für jede Primzahl ist der Exponent im
    ggT der kleinere der beiden Exponenten, und der Exponent im kgV ist der grössere.
  </p>
  <p>
    Zum Beispiel: Wenn <Math expression={`a = ${a}`} /> und <Math expression={`b = ${b}`} />, dann:
  </p>
  <ul>
    <li>
      <Math expression={gcdLabelDe} />: nimm den kleineren Exponenten für jede Primzahl — <Math expression={gcdRes} />.
    </li>
    <li>
      <Math expression={lcmLabelDe} />: nimm den grösseren Exponenten für jede Primzahl — <Math expression={lcmRes} />.
    </li>
  </ul>
  <p>
    Gib die Exponenten in der Reihenfolge der angezeigten Primzahlen ein. Wenn eine Primzahl in einer Zerlegung nicht
    vorkommt, gib <Math expression="0" /> ein.
  </p>
  <p><strong>Modus B — Zahlen</strong></p>
  <p>Du bekommst zwei Zahlen und musst direkt ihren ggT und ihr kgV berechnen.</p>
  <p>
    Zum Beispiel ist der ggT von <Math expression={exA} /> und <Math expression={exB} /> gleich <Math expression="6" />,
    und das kgV ist <Math expression="36" />.
  </p>
{/if}
